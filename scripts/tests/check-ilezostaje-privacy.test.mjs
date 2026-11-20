import assert from 'node:assert/strict';
import test from 'node:test';
import { POLICIES, checkPrivacyPolicy, monitorPrivacyPolicies } from '../check-ilezostaje-privacy.mjs';

function mockResponse(url, body, status = 200, contentType = 'text/html') {
  const response = new Response(body, { status, headers: { 'Content-Type': contentType } });
  Object.defineProperty(response, 'url', { value: url });
  return response;
}

test('both language pages must be HTTP 200 with their own heading', async () => {
  for (const policy of POLICIES) {
    const html = policy.language === 'PL'
      ? '<h1>Polityka prywatności IleZostaje</h1>'
      : '<h1>IleZostaje Privacy Policy</h1>';
    assert.equal(await checkPrivacyPolicy(policy, async () => mockResponse(policy.url, html)), policy.url);
  }
});

test('rejects missing content, wrong status and unexpected redirect', async () => {
  const policy = POLICIES[0];
  await assert.rejects(checkPrivacyPolicy(policy, async () => mockResponse(policy.url, 'missing')), /heading missing/);
  await assert.rejects(checkPrivacyPolicy(policy, async () => mockResponse(policy.url, '', 404)), /HTTP 404/);
  await assert.rejects(checkPrivacyPolicy(policy, async () => mockResponse(policy.url, '<h1>Polityka prywatności IleZostaje</h1>', 200, 'application/json')), /not HTML/);
  await assert.rejects(checkPrivacyPolicy(policy, async () => mockResponse('https://example.com/', '<h1>Polityka prywatności IleZostaje</h1>')), /Unexpected redirect/);
});

test('retries a transient failure and fails when a page remains unavailable', async () => {
  const policy = POLICIES[1];
  let attempts = 0;
  const html = '<h1>IleZostaje Privacy Policy</h1>';
  await monitorPrivacyPolicies([policy], async () => {
    attempts++;
    return mockResponse(policy.url, html, attempts === 1 ? 503 : 200);
  }, async () => {});
  assert.equal(attempts, 2);
  await assert.rejects(monitorPrivacyPolicies([policy], async () => mockResponse(policy.url, '', 503), async () => {}), /unavailable: EN/);
});
