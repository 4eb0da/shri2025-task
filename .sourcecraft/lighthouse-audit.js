import { launch } from 'chrome-launcher';
import lighthouse from 'lighthouse';
import http from 'http';

const SITE_URL = process.env.SITE_URL || 'http://localhost:3000';

async function waitForServer(url, retries = 20, delay = 500) {
  for (let i = 0; i < retries; i++) {
    try {
      await new Promise((resolve, reject) => {
        const req = http.get(url, (res) => {
          res.resume();
          resolve();
        });
        req.on('error', reject);
        req.setTimeout(1000, () => { req.destroy(); reject(new Error('timeout')); });
      });
      return;
    } catch {
      await new Promise((r) => setTimeout(r, delay));
    }
  }
  throw new Error(`Server at ${url} not ready after ${retries * delay}ms`);
}

async function runLighthouse() {
  console.log(`Waiting for server at ${SITE_URL}...`);
  await waitForServer(SITE_URL);
  console.log('Server is ready. Starting Lighthouse audit...');

  const chrome = await launch({ chromeFlags: ['--headless', '--no-sandbox'] });

  const options = {
    logLevel: 'info',
    output: 'json',
    onlyCategories: ['performance'],
    port: chrome.port,
  };

  const runnerResult = await lighthouse(SITE_URL, options);
  await chrome.kill();

  const { audits } = runnerResult.lhr;

  const lcp = audits['largest-contentful-paint'];
  const fcp = audits['first-contentful-paint'];

  console.log('=== Lighthouse Performance Metrics ===');
  console.log(`LCP (Largest Contentful Paint): ${lcp.displayValue || lcp.numericValue + ' ms'}`);
  console.log(`FCP (First Contentful Paint):    ${fcp.displayValue || fcp.numericValue + ' ms'}`);
  console.log('=====================================');
}

runLighthouse().catch((err) => {
  console.error('Lighthouse audit failed:', err);
  process.exit(1);
});
