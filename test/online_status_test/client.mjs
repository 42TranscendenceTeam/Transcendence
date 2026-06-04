import { io } from 'socket.io-client';

const API = 'https://localhost/api';

async function api(method, path, token, body) {
  const res = await fetch(`${API}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const data = await res.json();
  if (!res.ok) {
    console.error(`FAIL: ${method} ${path} — ${res.status} ${JSON.stringify(data)}`);
    process.exit(1);
  }
  return data;
}

async function login(email) {
  const data = await api('POST', '/auth/login', null, { email, password: 'pass12345' });
  console.log(`  Logged in ${data.user.username} (id: ${data.user.id})`);
  return data;
}

function assert(cond, msg) {
  if (!cond) {
    console.error(`FAIL: ${msg}`);
    process.exit(1);
  }
}

function waitForEvent(socket, event, filterFn, timeoutMs) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`Timeout waiting for '${event}'`)), timeoutMs);
    socket.on(event, (...args) => {
      if (filterFn(...args)) {
        clearTimeout(timer);
        resolve(args);
      }
    });
  });
}

async function main() {
  console.log('=== Online Status Test ===\n');

  const { token: tokenA, user: userA } = await login('testuser@student.42i');
  const { token: tokenB, user: userB } = await login('felix@example.com');
  const { token: tokenC, user: userC } = await login('max@example.com');

  // ============================================================
  // PHASE 1: Basic online / offline
  // ============================================================
  console.log('\n-- Phase 1: Basic online/offline --');

  const socketB = io('https://localhost', {
    transports: ['websocket'], rejectUnauthorized: false,
    auth: { token: tokenB },
  });

  socketB.on('connect_error', err => {
    console.error('FAIL: Socket B connect error —', err.message);
    process.exit(1);
  });

  // Wait for socketB to connect
  await new Promise(r => socketB.on('connect', r));
  console.log('  Socket B (Felix) connected');

  // Listen for userA online/offline on socketB
  const bOnline = waitForEvent(socketB, 'user online', (id) => id === userA.id, 8000);
  const bOffline = waitForEvent(socketB, 'user offline', (id) => id === userA.id, 8000);

  // Connect socketA — should trigger 'user online' on socketB
  const socketA = io('https://localhost', {
    transports: ['websocket'], rejectUnauthorized: false,
    auth: { token: tokenA },
  });

  socketA.on('connect_error', err => {
    console.error('FAIL: Socket A connect error —', err.message);
    process.exit(1);
  });

  await new Promise(r => socketA.on('connect', r));
  console.log('  Socket A (TestUser) connected');

  // Verify socketB received 'user online' for userA
  const [onlineUserId] = await bOnline;
  assert(onlineUserId === userA.id, `Expected user online ${userA.id}, got ${onlineUserId}`);
  console.log(`  Socket B received 'user online' for user ${onlineUserId}`);

  // REST check: should be online
  const state1 = await api('GET', `/users/${userA.id}/online`, tokenA);
  assert(state1.Online === true, `Expected Online=true, got ${state1.Online}`);
  console.log(`  GET /users/${userA.id}/online → { Online: ${state1.Online} }`);

  // Disconnect socketA — should trigger 'user offline' on socketB
  socketA.disconnect();
  console.log('  Socket A disconnected');

  const [offlineUserId] = await bOffline;
  assert(offlineUserId === userA.id, `Expected user offline ${userA.id}, got ${offlineUserId}`);
  console.log(`  Socket B received 'user offline' for user ${offlineUserId}`);

  // REST check: should be offline
  const state2 = await api('GET', `/users/${userA.id}/online`, tokenA);
  assert(state2.Online === false, `Expected Online=false, got ${state2.Online}`);
  console.log(`  GET /users/${userA.id}/online → { Online: ${state2.Online} }`);

  console.log('PASS: Phase 1');

  // ============================================================
  // PHASE 2: Multi-tab (same user, two socket connections)
  // ============================================================
  console.log('\n-- Phase 2: Multi-tab --');

  // Reconnect socketA (first "tab")
  const socketA1 = io('https://localhost', {
    transports: ['websocket'], rejectUnauthorized: false,
    auth: { token: tokenA },
  });
  socketA1.on('connect_error', err => {
    console.error('FAIL: Socket A1 connect error —', err.message);
    process.exit(1);
  });
  await new Promise(r => socketA1.on('connect', r));
  console.log('  Socket A1 (TestUser, tab 1) connected');

  // Wait briefly for online event to propagate
  await new Promise(r => setTimeout(r, 500));

  // REST check: should be online again
  const state3 = await api('GET', `/users/${userA.id}/online`, tokenA);
  assert(state3.Online === true, `Expected Online=true, got ${state3.Online}`);
  console.log(`  GET /users/${userA.id}/online → { Online: ${state3.Online} }`);

  // Connect a second socket for same user (tab 2)
  const socketA2 = io('https://localhost', {
    transports: ['websocket'], rejectUnauthorized: false,
    auth: { token: tokenA },
  });
  socketA2.on('connect_error', err => {
    console.error('FAIL: Socket A2 connect error —', err.message);
    process.exit(1);
  });
  await new Promise(r => socketA2.on('connect', r));
  console.log('  Socket A2 (TestUser, tab 2) connected');

  // Wait — the server should NOT emit 'user online' again (already online)
  await new Promise(r => setTimeout(r, 1000));

  // REST still online
  const state4 = await api('GET', `/users/${userA.id}/online`, tokenA);
  assert(state4.Online === true, `Expected Online=true, got ${state4.Online}`);
  console.log(`  GET /users/${userA.id}/online → { Online: ${state4.Online} } (still online after second tab)`);

  // Listen for offline on socketB — should NOT fire when only one tab disconnects
  let offlineFired = false;
  const offlineListener = (id) => {
    if (id === userA.id) offlineFired = true;
  };
  socketB.on('user offline', offlineListener);

  // Disconnect tab 1 only
  socketA1.disconnect();
  console.log('  Socket A1 (tab 1) disconnected');

  // Wait — should NOT get 'user offline' (tab 2 still connected)
  await new Promise(r => setTimeout(r, 1500));

  assert(offlineFired === false, 'Should NOT emit user offline when one of two tabs remains');
  console.log('  No spurious offline event (tab 2 still connected)');

  // REST still online
  const state5 = await api('GET', `/users/${userA.id}/online`, tokenA);
  assert(state5.Online === true, `Expected Online=true, got ${state5.Online}`);
  console.log(`  GET /users/${userA.id}/online → { Online: ${state5.Online} }`);

  socketB.removeListener('user offline', offlineListener);

  // Disconnect tab 2 — now should get offline
  const bOffline2 = waitForEvent(socketB, 'user offline', (id) => id === userA.id, 8000);
  socketA2.disconnect();
  console.log('  Socket A2 (tab 2) disconnected');

  const [offline2] = await bOffline2;
  assert(offline2 === userA.id, `Expected user offline ${userA.id}, got ${offline2}`);
  console.log(`  Socket B received 'user offline' for user ${offline2}`);

  // REST check: offline again
  const state6 = await api('GET', `/users/${userA.id}/online`, tokenA);
  assert(state6.Online === false, `Expected Online=false, got ${state6.Online}`);
  console.log(`  GET /users/${userA.id}/online → { Online: ${state6.Online} }`);

  console.log('PASS: Phase 2');

  // ============================================================
  // PHASE 3: Non-friend should NOT receive online/offline events
  // ============================================================
  console.log('\n-- Phase 3: Friend-only scope --');

  // Connect non-friend C (Max, not friends with TestUser)
  const socketC = io('https://localhost', {
    transports: ['websocket'], rejectUnauthorized: false,
    auth: { token: tokenC },
  });
  socketC.on('connect_error', err => {
    console.error('FAIL: Socket C connect error —', err.message);
    process.exit(1);
  });
  await new Promise(r => socketC.on('connect', r));
  console.log('  Socket C (Max, non-friend) connected');

  // Reconnect B (Felix, friend)
  const socketB3 = io('https://localhost', {
    transports: ['websocket'], rejectUnauthorized: false,
    auth: { token: tokenB },
  });
  socketB3.on('connect_error', err => {
    console.error('FAIL: Socket B3 connect error —', err.message);
    process.exit(1);
  });
  await new Promise(r => socketB3.on('connect', r));
  console.log('  Socket B (Felix, friend) reconnected');

  // B waits for A's online event; C flags it
  const bOnline3 = waitForEvent(socketB3, 'user online', (id) => id === userA.id, 8000);
  let cOnlineFired = false;
  socketC.on('user online', (id) => { if (id === userA.id) cOnlineFired = true; });

  // Connect A (TestUser) — triggers 'user online'
  const socketA3 = io('https://localhost', {
    transports: ['websocket'], rejectUnauthorized: false,
    auth: { token: tokenA },
  });
  socketA3.on('connect_error', err => {
    console.error('FAIL: Socket A3 connect error —', err.message);
    process.exit(1);
  });
  await new Promise(r => socketA3.on('connect', r));
  console.log('  Socket A (TestUser) connected');

  const [online3] = await bOnline3;
  assert(online3 === userA.id, `B expected online ${userA.id}, got ${online3}`);
  console.log(`  B received 'user online' for user ${online3}`);

  // Give C's event a moment to fire (should not)
  await new Promise(r => setTimeout(r, 1000));
  assert(cOnlineFired === false, 'C (non-friend) should NOT receive user online');
  console.log('  C (non-friend) correctly did NOT receive user online');

  // Setup offline listeners
  const bOffline3 = waitForEvent(socketB3, 'user offline', (id) => id === userA.id, 8000);
  let cOfflineFired = false;
  socketC.on('user offline', (id) => { if (id === userA.id) cOfflineFired = true; });

  // Disconnect A — triggers 'user offline'
  socketA3.disconnect();
  console.log('  Socket A disconnected');

  const [offline3] = await bOffline3;
  assert(offline3 === userA.id, `B expected offline ${userA.id}, got ${offline3}`);
  console.log(`  B received 'user offline' for user ${offline3}`);

  await new Promise(r => setTimeout(r, 1000));
  assert(cOfflineFired === false, 'C (non-friend) should NOT receive user offline');
  console.log('  C (non-friend) correctly did NOT receive user offline');

  socketB3.disconnect();
  socketC.disconnect();

  console.log('PASS: Phase 3');

  // Close Phase 1 socket so Felix has no stale connection in Phase 4
  socketB.disconnect();

  // ============================================================
  // PHASE 4: Online friends snapshot on connect
  // ============================================================
  console.log('\n-- Phase 4: Online friends snapshot --');

  // Connect C (Max, non-friend of A) — online but should not appear
  const socketC4 = io('https://localhost', {
    transports: ['websocket'], rejectUnauthorized: false,
    auth: { token: tokenC },
  });
  socketC4.on('connect_error', err => {
    console.error('FAIL: Socket C4 connect error —', err.message);
    process.exit(1);
  });
  await new Promise(r => socketC4.on('connect', r));
  console.log('  Socket C (Max, non-friend) connected');

  // Connect B (Felix, friend of A) — online, expect in snapshot
  const socketB4 = io('https://localhost', {
    transports: ['websocket'], rejectUnauthorized: false,
    auth: { token: tokenB },
  });
  socketB4.on('connect_error', err => {
    console.error('FAIL: Socket B4 connect error —', err.message);
    process.exit(1);
  });
  await new Promise(r => socketB4.on('connect', r));
  console.log('  Socket B (Felix, friend) connected');

  // Connect A → snapshot includes friend B, excludes non-friend C
  const socketA4 = io('https://localhost', {
    transports: ['websocket'], rejectUnauthorized: false,
    auth: { token: tokenA },
  });
  socketA4.on('connect_error', err => {
    console.error('FAIL: Socket A4 connect error —', err.message);
    process.exit(1);
  });
  const aSnapshot4 = waitForEvent(socketA4, 'online friends', () => true, 8000);
  await new Promise(r => socketA4.on('connect', r));
  console.log('  Socket A (TestUser) connected');

  const [friendIds4] = await aSnapshot4;
  assert(Array.isArray(friendIds4), 'Expected online friends to be an array');
  assert(friendIds4.includes(userB.id), `Snapshot should include friend B (${userB.id})`);
  assert(!friendIds4.includes(userC.id), `Snapshot should NOT include non-friend C (${userC.id})`);
  console.log(`  Snapshot includes friend B=${friendIds4.includes(userB.id)}, excludes non-friend C=${!friendIds4.includes(userC.id)}`);

  // Disconnect B → goes offline
  socketB4.disconnect();
  console.log('  Socket B disconnected');

  // Let offline propagate
  await new Promise(r => setTimeout(r, 500));

  // Reconnect A → snapshot should no longer include B
  const socketA5 = io('https://localhost', {
    transports: ['websocket'], rejectUnauthorized: false,
    auth: { token: tokenA },
  });
  socketA5.on('connect_error', err => {
    console.error('FAIL: Socket A5 connect error —', err.message);
    process.exit(1);
  });
  const aSnapshot5 = waitForEvent(socketA5, 'online friends', () => true, 8000);
  await new Promise(r => socketA5.on('connect', r));
  console.log('  Socket A (TestUser) reconnected');

  const [friendIds5] = await aSnapshot5;
  assert(Array.isArray(friendIds5), 'Expected online friends to be an array');
  assert(!friendIds5.includes(userB.id), `Snapshot should NOT include offline friend B (${userB.id})`);
  console.log(`  Snapshot correctly excludes offline friend B`);

  socketA4.disconnect();
  socketA5.disconnect();
  socketC4.disconnect();

  console.log('PASS: Phase 4');

  console.log('\nPASS: All phases');
  process.exit(0);
}

main().catch(err => {
  console.error(`FAIL: ${err.message}`);
  process.exit(1);
});
