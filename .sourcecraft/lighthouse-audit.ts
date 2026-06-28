import { launch } from 'chrome-launcher';
import lighthouse from 'lighthouse';
import http from 'http';

const SITE_URL = process.env.SITE_URL || 'http://localhost:3000';

async function waitForServer(url: string, retries = 20, delay = 500) {
    for (let i = 0; i < retries; i++) {
        try {
            await new Promise<void>((resolve, reject) => {
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

function func1(val: number): number {
    return (200000 / (val + 500));
}

function func2(val: number): number {
    return (2000 / (val + 10));
}

function func3(val: number): number {
    return (100000000 / (val + 500000));
}

const RUNS = 8;

function score(lhr) {
    // console.log(Object.keys(lhr.audits));
    // console.log(lhr.audits['first-contentful-paint'])
    // console.log(lhr.audits['largest-contentful-paint'])
    // console.log(lhr.audits['interactive'])
    // console.log(lhr.audits['total-byte-weight'])
    // console.log(lhr.audits['server-response-time'])
    // console.log(lhr.audits['network-server-latency'])
    const vals = {
        'first-contentful-paint': lhr.audits['first-contentful-paint'].numericValue,
        'largest-contentful-paint': lhr.audits['largest-contentful-paint'].numericValue,
        'interactive': lhr.audits['interactive'].numericValue,
        // 'last-visual-change': lhr.audits['last-visual-change'].observerLastVisualChange,
        'total-byte-weight': lhr.audits['total-byte-weight'].numericValue,
        'first-byte': lhr.audits['server-response-time'].numericValue,
    };

    console.log(vals);

    for (const key in vals) {
        if (!vals[key]) {
            throw new Error('Incorrect result: ' + key);
        }
    }

    return func1(vals['first-contentful-paint'] - vals['first-byte']) +
        func1(vals['largest-contentful-paint'] - vals['first-byte']) +
        func1(vals['interactive'] - vals['first-byte']) +
        // func1(vals['last-visual-change'] - vals['first-byte']) +
        func3(vals['total-byte-weight']);
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
    } as const;

    const results: number[] = [];

    for (let i = 0; i < RUNS; ++i) {
        const runnerResult = await lighthouse(SITE_URL, options);
        const res = score(runnerResult?.lhr);
        results.push(res);
    }
    await chrome.kill();

    console.log(results);

    results.sort((a, b) => a - b);

    const total = (results[results.length / 2 - 1] + results[results.length / 2]) / 2;
    console.log(total);
}

runLighthouse().catch((err) => {
    console.error('Lighthouse audit failed:', err);
    process.exit(1);
});
