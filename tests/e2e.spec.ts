import { type Page, expect, test } from '@playwright/test';

test.describe.serial('Stylelint demo', () => {
	let page: Page;

	let inputTabs: ReturnType<Page['locator']>;
	let codeMonaco: ReturnType<Page['locator']>;
	let config: ReturnType<Page['locator']>;
	let configMonaco: ReturnType<Page['locator']>;
	let depsMonaco: ReturnType<Page['locator']>;
	let depsInstalled: ReturnType<Page['locator']>;
	let warnings: ReturnType<Page['locator']>;
	let console: ReturnType<Page['locator']>;

	test.beforeAll(async ({ browser }) => {
		page = await browser.newPage();
		await page.goto('/');

		inputTabs = page.locator('sd-input-tabs');
		codeMonaco = page.locator('sd-code-monaco').getByRole('code').first();
		config = page.locator('sd-config');
		configMonaco = page.locator('sd-config-monaco').getByRole('code').first();
		depsMonaco = page.locator('sd-deps-monaco').getByRole('code').first();
		depsInstalled = page.locator('sd-deps-installed');
		warnings = page.locator('sd-warnings');
		console = page.locator('sd-console');
	});

	test.afterAll(async () => {
		await page.close();
	});

	test('server starts', async () => {
		await expect(console).toContainText('Server started', { timeout: 60_000 });
	});

	test('warnings for invalid CSS  ', async () => {
		await expect(warnings).toContainText('Expected same number of cell tokens in each string');
	});

	test('no warnings for valid CSS', async () => {
		await expect(codeMonaco).toBeVisible();
		await codeMonaco.click();
		await pressBackspace();
		await page.keyboard.type('a { color: #fff; }');
		await expect
			.poll(async () => {
				const ul = warnings.locator('ul');

				return await ul.evaluate((el: Element) => {
					return window.getComputedStyle(el, '::before').content;
				});
			})
			.toContain('No problems');
	});

	test('changing config and format', async () => {
		await inputTabs.getByText('Config').click();
		await config.getByRole('combobox').selectOption('.stylelintrc.json');
		await expect(configMonaco).toBeVisible();
		await configMonaco.click();
		await pressBackspace(100);
		await page.keyboard.type('{ "rules": { "color-no-hex": true }}');
		await expect(warnings).toContainText('Unexpected hex color');
	});

	test('changing dependencies', async () => {
		await inputTabs.getByText('Dependencies').click();
		await expect(depsMonaco).toBeVisible();
		await depsMonaco.click();
		await pressBackspace();
		await page.keyboard.type('{"stylelint": "16.0.0"}');
		await expect(depsInstalled).toContainText('stylelint');
		await expect(depsInstalled).toContainText('16.0.0', { timeout: 60_000 });
	});

	test('copying the link', async () => {
		await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);
		await page.getByRole('button', { name: 'Copy link' }).click();

		/* eslint-disable-next-line n/no-unsupported-features/node-builtins */
		const clipboardText = await page.evaluate(() => navigator.clipboard.readText());

		await expect(clipboardText).toContain(page.url());
	});

	test('reporting a bug', async () => {
		const [bugPage] = await Promise.all([
			page.context().waitForEvent('page'),
			page.getByRole('link', { name: 'Report a bug' }).click(),
		]);
		const bugUrl = bugPage.url();

		await expect(bugUrl).toContain('template%3DREPORT_A_BUG.yml');
		await expect(bugUrl).toContain('reproduce-bug%3D');
		await expect(bugUrl).toContain('stylelint-configuration%3D');
		await expect(bugUrl).toContain('stylelint-run%3D');
		await expect(bugUrl).toContain('stylelint-version%3D');
	});

	// Workaround for Ctrl+A in Playwright and Monaco editor being buggy
	async function pressBackspace(times = 250) {
		for (let i = 0; i < times; i++) {
			await page.keyboard.press('Backspace');
		}
	}
});
