import { io } from 'socket.io-client';

const API = 'https://localhost/api';

async function main() {
  // Login as TestUser
  const loginRes = await fetch(`${API}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'testuser@student.42i', password: 'pass12345' }),
  });

  if (!loginRes.ok) {
    const err = await loginRes.json().catch(() => ({ error: 'Login failed' }));
    console.error('FAIL: Login —', err.error || loginRes.status);
    process.exit(1);
  }

  const { user, token } = await loginRes.json();
  console.log(`Logged in as ${user.username} (id: ${user.id})`);

  const FELIX_ID = 2;
  const TEAM_ID = 1;

  // Socket.io connection
  const socket = io('https://localhost', {
    transports: ['websocket'],
    rejectUnauthorized: false,
  });

  const received = { dm: false, team: false };

  function checkDone() {
    if (received.dm && received.team) {
      console.log('\nPASS: Both direct message and team message received via WebSocket');
      socket.disconnect();
      process.exit(0);
    }
  }

  socket.on('chat message', (msg, ack) => {
    console.log('📨 Direct message received via WebSocket:', msg);
    received.dm = true;
    if (typeof ack === 'function') ack(true);
    checkDone();
  });

  socket.on('team message', (msg, ack) => {
    console.log('👥 Team message received via WebSocket:', msg);
    received.team = true;
    if (typeof ack === 'function') ack(true);
    checkDone();
  });

  socket.on('connect_error', (err) => {
    console.error('FAIL: Socket connection error —', err.message);
    process.exit(1);
  });

  socket.on('connect', () => {
    console.log('Socket connected:', socket.id);

    // Join DM room with Felix
    socket.emit('join chat', user.id, FELIX_ID, (res) => {
      console.log('Join DM room response:', res);

      // Send a direct message via REST API
      fetch(`${API}/message/${FELIX_ID}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content: `Socket test DM at ${Date.now()}` }),
      })
        .then((r) => {
          if (!r.ok) throw new Error(`HTTP ${r.status}`);
          return r.json();
        })
        .then((d) => console.log('DM sent via API:', d.message || d))
        .catch((err) => console.error('FAIL: Send DM —', err.message));
    });

    // Join team chat room
    socket.emit('join team chat', TEAM_ID, (res) => {
      console.log('Join team chat response:', res);

      // Send a team message via REST API
      fetch(`${API}/team/message/${TEAM_ID}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content: `Socket test team msg at ${Date.now()}` }),
      })
        .then((r) => {
          if (!r.ok) throw new Error(`HTTP ${r.status}`);
          return r.json();
        })
        .then((d) => console.log('Team msg sent via API:', d.message || d))
        .catch((err) => console.error('FAIL: Send team msg —', err.message));
    });
  });

  // Timeout: exit with failure if events not received
  setTimeout(() => {
    console.log(`\nFAIL: Timeout — DM=${received.dm} Team=${received.team}`);
    socket.disconnect();
    process.exit(1);
  }, 10000);
}

main().catch((err) => {
  console.error('FAIL:', err.message);
  process.exit(1);
});
