import {devices} from "@playwright/test"

import type {PlaywrightTestConfig} from "@playwright/test"

const config: PlaywrightTestConfig = {
	testDir: `./tests`,
	timeout: 30 * 1000,
	expect: {
		timeout: 5000,
	},
	fullyParallel: true,
	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 2 : 0,
	workers: process.env.CI ? 1 : undefined,
	reporter: `html`,
	use: {
		storageState: `./tests/authState.json`,
		actionTimeout: 0,
		baseURL: `http://localhost:3010`,
		trace: `on-first-retry`,
	},
	projects: [
		{
			name: `chromium`,
			use: {
				...devices[`Desktop Chrome`],
			},
		},
		{
			name: `firefox`,
			use: {
				...devices[`Desktop Firefox`],
			},
		},
		{
			name: `webkit`,
			use: {
				...devices[`Desktop Safari`],
			},
		},
	],
	webServer: {
		command: `pnpm dev -p 3010`,
		port: 3010,
	},
}

export default config
