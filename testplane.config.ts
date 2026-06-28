import { setupBrowser } from "@testplane/testing-library";
import type { WdioBrowser } from "testplane";

// Read more about configuring Testplane at https://testplane.io/docs/v8/config/main/
export default {
    gridUrl: "local",
    baseUrl: "http://localhost",
    pageLoadTimeout: 20000,
    httpTimeout: 20000,
    testTimeout: 90000,
    resetCursor: false,
    sets: {
        desktop: {
            files: [
                "testplane-tests/**/*.testplane.(t|j)s"
            ],
            browsers: [
                "chrome",
                // "firefox"
            ]
        }
    },
    browsers: {
        chrome: {
            headless: true,
            desiredCapabilities: {
                browserName: "chrome",
            }
        },
        // firefox: {
        //     headless: true,
        //     desiredCapabilities: {
        //         browserName: "firefox"
        //     }
        // }
    },
    prepareBrowser: (browser: WdioBrowser) => { setupBrowser(browser) },
    plugins: {
        "html-reporter/testplane": {
            // https://github.com/gemini-testing/html-reporter
            enabled: true,
            path: "artifacts/testplane-report",
            defaultView: "all",
            diffMode: "3-up-scaled"
        }
    }
} satisfies import("testplane").ConfigInput;
