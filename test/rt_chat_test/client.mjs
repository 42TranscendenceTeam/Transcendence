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

async function main() {
  const FELIX_ID = 2;
  const TEAM_ID = 1;

  // ============================================================
  // PHASE 1: REST API CRUD
  // ============================================================
  console.log('\n=== Phase 1: REST API CRUD ===');

  const { token, user } = await login('testuser@student.42i');
  const felixLogin = await login('felix@example.com');

  // -- Direct Message endpoints --
  console.log('  -- DM endpoints --');

  // POST send DM
  const dm = await api('POST', `/message/${FELIX_ID}`, token, { content: 'Phase 1 DM' });
  assert(dm && dm.id, 'DM response missing id');
  assert(dm.content === 'Phase 1 DM', 'DM content mismatch');
  assert(dm.sender_id === user.id, 'DM sender_id mismatch');
  assert(dm.receiver_id === FELIX_ID, 'DM receiver_id mismatch');
  console.log(`  POST   /message/${FELIX_ID}  → 201, id=${dm.id}`);

	// GET all messages (without specific limit)
	const all = await api('GET', `/message/${FELIX_ID}/0`, token);
	assert(Array.isArray(all.message_list), 'all.message_list not array');
	assert(all.message_list.some(m => m.id === dm.id), 'all missing sent message');
	console.log(`  GET    /message/${FELIX_ID}/0  → OK, ${all.message_list.length} msgs`);

  // GET all messages (limit to 2)
  const all_limited = await api('GET', `/message/${FELIX_ID}/2`, token);
  assert(Array.isArray(all_limited.message_list), 'all.message_list not array');
  assert(all_limited.message_list.some(m => m.id === all.message_list[0].id), 'all missing sent message');
  console.log(`  GET    /message/${FELIX_ID}/2  → OK, ${all_limited.message_list.length} msgs`);

  // GET sent messages (without specific limit)
  const sent = await api('GET', `/message/${FELIX_ID}/sent/0`, token);
  assert(Array.isArray(sent.message_list), 'sent.message_list not array');
  assert(sent.message_list.some(m => m.id === dm.id), 'sent missing sent message');
  console.log(`  GET    /message/${FELIX_ID}/sent/0  → OK, ${sent.message_list.length} msgs`);

  // GET sent messages (limit to 1)
  const sent_limited = await api('GET', `/message/${FELIX_ID}/sent/1`, token);
  assert(Array.isArray(sent_limited.message_list), 'sent.message_list not array');
  assert(sent_limited.message_list.some(m => m.id === sent.message_list[0].id), 'sent missing sent message');
  console.log(`  GET    /message/${FELIX_ID}/sent/1  → OK, ${sent_limited.message_list.length} msgs`);

  // GET received messages (without specific limit)
  const recv = await api('GET', `/message/${FELIX_ID}/received/0`, token);
  assert(Array.isArray(recv.message_list), 'recv.message_list not array');
  console.log(`  GET    /message/${FELIX_ID}/received/0  → OK, ${recv.message_list.length} msgs`);
	
  // GET received messages (limit to 1)
  const recv_limited = await api('GET', `/message/${FELIX_ID}/received/1`, token);
  assert(Array.isArray(recv_limited.message_list), 'recv_limited.message_list not array');
  console.log(`  GET    /message/${FELIX_ID}/received/1  → OK, ${recv_limited.message_list.length} msgs`);

  // PUT read status
  const put = await api('PUT', `/message/${FELIX_ID}`, token);
  console.log(`  PUT    /message/${FELIX_ID}  → 201`);

  // DELETE the DM
  const delDm = await api('DELETE', `/message/${dm.id}`, token);
  assert(delDm && delDm.id === dm.id, 'delete DM id mismatch');
  console.log(`  DELETE /message/${dm.id}  → 200`);

  // -- Team Message endpoints --
  console.log('  -- Team endpoints --');

  // POST send team message
  const tm = await api('POST', `/team/message/${TEAM_ID}`, token, { content: 'Phase 1 Team' });
  assert(tm && tm.id, 'team msg response missing id');
  assert(tm.content === 'Phase 1 Team', 'team msg content mismatch');
  assert(tm.team_id === TEAM_ID, 'team msg team_id mismatch');
  console.log(`  POST   /team/message/${TEAM_ID}  → 201, id=${tm.id}`);

  // GET all team messages
  const tmAll = await api('GET', `/team/message/${TEAM_ID}/0`, token);
  assert(Array.isArray(tmAll.message_list), 'tmAll.message_list not array');
  assert(tmAll.message_list.some(m => m.id === tm.id), 'tmAll missing sent message');
  console.log(`  GET    /team/message/${TEAM_ID}/0  → OK, ${tmAll.message_list.length} msgs`);
	
  // GET all team messages (limited to 1)
  const tmAll_limited = await api('GET', `/team/message/${TEAM_ID}/1`, token);
  assert(Array.isArray(tmAll_limited.message_list), 'tmAll_limited.message_list not array');
  assert(tmAll_limited.message_list.some(m => m.id === tmAll_limited.message_list[0].id), 'tmAll missing sent message');
  console.log(`  GET    /team/message/${TEAM_ID}/1  → OK, ${tmAll_limited.message_list.length} msgs`);

  // GET sent team messages
  const tmSent = await api('GET', `/team/message/${TEAM_ID}/sent/0`, token);
  assert(Array.isArray(tmSent.message_list), 'tmSent.message_list not array');
  assert(tmSent.message_list.some(m => m.id === tm.id), 'tmSent missing sent message');
  console.log(`  GET    /team/message/${TEAM_ID}/sent/0  → OK, ${tmSent.message_list.length} msgs`);
	
  // GET sent team messages (limited to 1)
  const tmSent_limited = await api('GET', `/team/message/${TEAM_ID}/sent/1`, token);
  assert(Array.isArray(tmSent_limited.message_list), 'tmSent_limited.message_list not array');
  assert(tmSent_limited.message_list.some(m => m.id === tmSent.message_list[0].id), 'tmSent_limited missing sent message');
  console.log(`  GET    /team/message/${TEAM_ID}/sent/1  → OK, ${tmSent_limited.message_list.length} msgs`);

  // GET received team messages (as Felix)
  const tmRecv = await api('GET', `/team/message/${TEAM_ID}/received/0`, token);
  assert(Array.isArray(tmRecv.message_list), 'tmRecv.message_list not array');
  console.log(`  GET    /team/message/${TEAM_ID}/received/0  → OK, ${tmRecv.message_list.length} msgs`);

  // GET received team messages (limited to 1)
  const tmRecv_limited = await api('GET', `/team/message/${TEAM_ID}/received/1`, token);
  assert(Array.isArray(tmRecv_limited.message_list), 'tmRecv_limited.message_list not array');
  assert(tmRecv_limited.message_list.some(m => m.id === tmRecv.message_list[0].id), 'tmSent_limited missing sent message');
  console.log(`  GET    /team/message/${TEAM_ID}/received/1  → OK, ${tmRecv_limited.message_list.length} msgs`);

  // DELETE the team message
  const delTm = await api('DELETE', `/team/message/${tm.id}`, token);
  assert(delTm && delTm.id === tm.id, 'delete team msg id mismatch');
  console.log(`  DELETE /team/message/${tm.id}  → 200`);

  console.log('PASS: Phase 1 — All REST endpoints\n');

  // ============================================================
  // PHASE 2: Multi-client WebSocket
  // ============================================================
  console.log('=== Phase 2: Multi-client WebSocket ===');

  const markers = {
    a2bdm:    `m:a2bdm_${Date.now()}`,
    b2adm:    `m:b2adm_${Date.now()}`,
    a2bteam:  `m:a2bteam_${Date.now()}`,
    b2ateam:  `m:b2ateam_${Date.now()}`,
  };

  const wsRecv = { a_dm: false, b_dm: false, a_team: false, b_team: false };

  function checkPhase2() {
    if (wsRecv.a_dm && wsRecv.b_dm && wsRecv.a_team && wsRecv.b_team) {
      console.log('PASS: Phase 2 — All cross-deliveries confirmed');
      socketA.disconnect();
      socketB.disconnect();
      process.exit(0);
    }
  }

  const socketA = io('https://localhost', {
    transports: ['websocket'], rejectUnauthorized: false,
	  auth: { token },
  });
  const socketB = io('https://localhost', {
    transports: ['websocket'], rejectUnauthorized: false,
	  auth: { token: felixLogin.token },
  });

  socketA.on('connect_error', err => {
    console.error('FAIL: Socket A connect error —', err.message);
    process.exit(1);
  });
  socketB.on('connect_error', err => {
    console.error('FAIL: Socket B connect error —', err.message);
    process.exit(1);
  });

  // Listeners — each resolves only on the expected cross-delivery marker
  socketA.on('chat message', (msg, ack) => {
    if (typeof msg === 'string' && msg.includes(markers.b2adm) && !wsRecv.a_dm) {
      wsRecv.a_dm = true;
      console.log('  A received DM from B');
      if (typeof ack === 'function') ack(true);
      checkPhase2();
    }
  });
  socketB.on('chat message', (msg, ack) => {
    if (typeof msg === 'string' && msg.includes(markers.a2bdm) && !wsRecv.b_dm) {
      wsRecv.b_dm = true;
      console.log('  B received DM from A');
      if (typeof ack === 'function') ack(true);
      checkPhase2();
    }
  });
  socketA.on('team message', (msg, ack) => {
    if (typeof msg === 'string' && msg.includes(markers.b2ateam) && !wsRecv.a_team) {
      wsRecv.a_team = true;
      console.log('  A received team msg from B');
      if (typeof ack === 'function') ack(true);
      checkPhase2();
    }
  });
  socketB.on('team message', (msg, ack) => {
    if (typeof msg === 'string' && msg.includes(markers.a2bteam) && !wsRecv.b_team) {
      wsRecv.b_team = true;
      console.log('  B received team msg from A');
      if (typeof ack === 'function') ack(true);
      checkPhase2();
    }
  });

  // Wait for both sockets to connect
  await Promise.all([
    new Promise(r => socketA.on('connect', r)),
    new Promise(r => socketB.on('connect', r)),
  ]);
  console.log('  Both sockets connected');

  // Join rooms on both sockets
  await Promise.all([
    new Promise(r => socketA.emit('join chat', user.id, FELIX_ID, r)),
    new Promise(r => socketB.emit('join chat', felixLogin.user.id, user.id, r)),
    new Promise(r => socketA.emit('join team chat', TEAM_ID, r)),
    new Promise(r => socketB.emit('join team chat', TEAM_ID, r)),
  ]);
  console.log('  Both sockets joined DM + team rooms');

  // Fire all 4 POSTs in parallel
  await Promise.all([
    api('POST', `/message/${FELIX_ID}`, token, { content: markers.a2bdm }),
    api('POST', `/message/${user.id}`, felixLogin.token, { content: markers.b2adm }),
    api('POST', `/team/message/${TEAM_ID}`, token, { content: markers.a2bteam }),
    api('POST', `/team/message/${TEAM_ID}`, felixLogin.token, { content: markers.b2ateam }),
  ]);
  console.log('  4 messages sent via REST');

  // Wait for all cross-delivery events or timeout
  await Promise.race([
    new Promise((_, reject) => setTimeout(() => {
      const missing = [];
      if (!wsRecv.a_dm) missing.push('a_dm');
      if (!wsRecv.b_dm) missing.push('b_dm');
      if (!wsRecv.a_team) missing.push('a_team');
      if (!wsRecv.b_team) missing.push('b_team');
      reject(new Error(`Timeout — missing: ${missing.join(', ')}`));
    }, 15000)),
    new Promise(resolve => {
      const orig = checkPhase2;
      checkPhase2 = () => { orig(); resolve(); };
    }),
  ]);

  // Shouldn't reach here — checkPhase2 calls process.exit(0) on success
  console.error(`FAIL: Phase 2 — events missing`, wsRecv);
  socketA.disconnect();
  socketB.disconnect();
  process.exit(1);
}

main().catch(err => {
  console.error(`FAIL: ${err.message}`);
  process.exit(1);
});
