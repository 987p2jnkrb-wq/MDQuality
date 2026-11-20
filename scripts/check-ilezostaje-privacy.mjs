import { pathToFileURL } from 'node:url';

export const POLICIES = [
  {
    language: 'PL',
    url: 'https://mdquality.pl/pl/ilezostaje/privacy/',
    heading: /<h1\b[^>]*>\s*Polityka prywatności IleZostaje\s*<\/h1>/i,
  },
  {
    language: 'EN',
    url: 'https://mdquality.pl/ilezostaje/privacy/',
    heading: /<h1\b[^>]*>\s*IleZostaje Privacy Policy\s*<\/h1>/i,
  },
];

export async function checkPrivacyPolicy(policy, fetcher = fetch) {
  const response = await fetcher(policy.url, {
    redirect: 'follow',
    headers: { 'Cache-Control': 'no-cache' },
    signal: AbortSignal.timeout(12000),
  });
  if (response.status !== 200) throw new Error('HTTP ' + response.status);

  const expected = new URL(policy.url);
  const destination = new URL(response.url);
  const normalizePath = path => path.replace(/\/+$/, '');
  if (destination.protocol !== 'https:' || destination.host !== expected.host ||
      normalizePath(destination.pathname) !== normalizePath(expected.pathname)) {
    throw new Error('Unexpected redirect: ' + destination.href);
  }
  if (!(response.headers.get('content-type') || '').toLowerCase().includes('text/html')) {
    throw new Error('Response is not HTML');
  }
  const html = await response.text();
  if (!policy.heading.test(html)) throw new Error('Privacy policy heading missing');
  return destination.href;
}

export async function monitorPrivacyPolicies(
  policies = POLICIES,
  fetcher = fetch,
  sleep = ms => new Promise(resolve => setTimeout(resolve, ms)),
) {
  const failed = [];
  for (const policy of policies) {
    let success = false;
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const url = await checkPrivacyPolicy(policy, fetcher);
        console.log(policy.language + ': OK ' + url);
        success = true;
        break;
      } catch (error) {
        console.error(policy.language + ' attempt ' + attempt + '/2: ' + error.message);
        if (attempt === 1) await sleep(2000);
      }
    }
    if (!success) failed.push(policy.language);
  }
  if (failed.length) throw new Error('Privacy policy unavailable: ' + failed.join(', '));
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  monitorPrivacyPolicies().catch(error => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
