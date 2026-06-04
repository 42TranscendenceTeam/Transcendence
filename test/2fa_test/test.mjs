const API = process.env.API_URL || 'https://localhost/api';

let total = 0;
let passed = 0;

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
  return { status: res.status, ok: res.ok, data };
}

function assert(cond, msg) {
  total++;
  if (cond) { passed++; return; }
  console.error(`  FAIL: ${msg}`);
}

function assertEq(actual, expected, msg) {
  total++;
  if (actual === expected) { passed++; return; }
  console.error(`  FAIL: ${msg} — expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
}

function assertNot(actual, msg) {
  total++;
  if (actual) { passed++; return; }
  console.error(`  FAIL: ${msg} — expected truthy, got ${actual}`);
}

function decodeJwt(token) {
  return JSON.parse(Buffer.from(token.split('.')[1], 'base64url').toString());
}

const uid = Date.now();
const email = `2fa-test-${uid}@example.com`;
const username = `test2fa_${uid}`;
const password = 'pass12345';

console.log('=== 2FA Test Suite ===\n');

// ==============================
// Phase 1: Register a fresh user
// ==============================
console.log('--- Phase 1: Register ---');

const reg = await api('POST', '/auth/register', null, { email, username, password });
assertEq(reg.status, 201, 'register returns 201');
assertNot(reg.data.token, 'register returns token');
assertEq(reg.data.user.email, email, 'register returns correct email');
console.log(`  PASS register (${total - (total - passed)}/${total - (total - passed)})\n`);

// ==============================
// Phase 2: Login (2FA disabled)
// ==============================
console.log('--- Phase 2: Login (2FA disabled) ---');

const login1 = await api('POST', '/auth/login', null, { email, password });
assertEq(login1.status, 200, 'login returns 200');
assertNot(login1.data.token, 'login returns token');
assertEq(login1.data.requires_2fa, undefined, 'no 2fa required');
assertEq(login1.data.user.email, email, 'login returns correct user');
const authToken = login1.data.token;
console.log(`  PASS login (no 2FA)`);

// ==============================
// Phase 3: Toggle 2FA on
// ==============================
console.log('\n--- Phase 3: Toggle 2FA ON ---');

const toggleOn = await api('PATCH', '/users/2fa', authToken);
assertEq(toggleOn.status, 200, 'toggle returns 200');
assertEq(toggleOn.data.two_factor_enabled, true, '2FA is now enabled');
assertEq(toggleOn.data.id, login1.data.user.id, 'returns correct user id');
console.log(`  PASS toggle 2FA ON`);

// ==============================
// Phase 4: Login (2FA enabled)
// ==============================
console.log('\n--- Phase 4: Login (2FA enabled) ---');

const login2 = await api('POST', '/auth/login', null, { email, password });
assertEq(login2.status, 200, 'login returns 200');
assertEq(login2.data.requires_2fa, true, 'requires_2fa is true');
assertNot(login2.data.temp_token, 'returns temp_token');
assertEq(login2.data.token, undefined, 'no final token yet');

const tempToken = login2.data.temp_token;
const payload = decodeJwt(tempToken);
assertNot(payload.userId, 'temp token contains userId');
assertNot(payload.twoFactorCode, 'temp token contains twoFactorCode');
assertNot(payload.exp, 'temp token has expiry');
const code = payload.twoFactorCode;
console.log(`  PASS login (2FA enabled, code=${code})`);

// ==============================
// Phase 5: Verify 2FA (valid code)
// ==============================
console.log('\n--- Phase 5: Verify 2FA (valid code) ---');

const verify = await api('POST', '/auth/verify-2fa', null, { temp_token: tempToken, code });
assertEq(verify.status, 200, 'verify returns 200');
assertNot(verify.data.token, 'verify returns final token');
assertEq(verify.data.user.email, email, 'verify returns correct user');

const finalToken = verify.data.token;
const finalPayload = decodeJwt(finalToken);
assertEq(finalPayload.type, '2fa', 'final token type is 2fa');
assertEq(finalPayload.id, login1.data.user.id, 'final token contains user id');
console.log(`  PASS verify 2FA (valid code)`);

// ==============================
// Phase 6: Verify 2FA (wrong code)
// ==============================
console.log('\n--- Phase 6: Verify 2FA (wrong code) ---');

const verifyWrong = await api('POST', '/auth/verify-2fa', null, { temp_token: tempToken, code: '000000' });
assertEq(verifyWrong.status, 400, 'wrong code returns 400');
console.log(`  PASS verify 2FA (wrong code → 400)`);

// ==============================
// Phase 7: Verify 2FA (missing fields)
// ==============================
console.log('\n--- Phase 7: Verify 2FA (missing fields) ---');

const verifyNoCode = await api('POST', '/auth/verify-2fa', null, { temp_token: tempToken });
assertEq(verifyNoCode.status, 400, 'missing code returns 400');

const verifyNoToken = await api('POST', '/auth/verify-2fa', null, { code: '123456' });
assertEq(verifyNoToken.status, 400, 'missing temp_token returns 400');
console.log(`  PASS verify 2FA (missing fields → 400)`);

// ==============================
// Phase 8: Toggle 2FA off
// ==============================
console.log('\n--- Phase 8: Toggle 2FA OFF ---');

const toggleOff = await api('PATCH', '/users/2fa', authToken);
assertEq(toggleOff.status, 200, 'toggle returns 200');
assertEq(toggleOff.data.two_factor_enabled, false, '2FA is now disabled');
console.log(`  PASS toggle 2FA OFF`);

// ==============================
// Phase 9: Login (2FA disabled again)
// ==============================
console.log('\n--- Phase 9: Login (2FA disabled again) ---');

const login3 = await api('POST', '/auth/login', null, { email, password });
assertEq(login3.status, 200, 'login returns 200');
assertEq(login3.data.requires_2fa, undefined, 'no 2fa required');
assertNot(login3.data.token, 'returns normal token');
console.log(`  PASS login (2FA off)`);

// ==============================
// Phase 10: Auth middleware rejects 2FA-typed tokens
// ==============================
console.log('\n--- Phase 10: Auth middleware rejects 2FA tokens ---');

const meWith2faToken = await api('GET', '/users/me', finalToken);
assertEq(meWith2faToken.status, 401, '2fa token rejected by auth middleware');
console.log(`  PASS auth rejects 2fa token`);

// ==============================
// Summary
// ==============================
console.log(`\n=== Results: ${passed}/${total} passed ===`);
if (passed !== total) {
  console.error(`FAIL: ${total - passed} test(s) failed`);
  process.exit(1);
}
