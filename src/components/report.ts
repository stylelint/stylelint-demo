export type ReportOptions = {
	element: HTMLElement;
	getData: () => ReportData;
};

export type ReportData = {
	config: string;
	configFormat: string;
	code: string;
	fileName: string;
	packages: { name: string; version: string }[];
};

export function setupReport({ element, getData }: ReportOptions) {
	const link = element.querySelector('a');

	if (link) {
		link.addEventListener('click', () => {
			const data = getData();
			const url = new URL(link.href);

			const code = data.code.trim();
			const codeLang = data.fileName.split('.').pop() ?? 'css';
			const config = data.config.trim();
			const configLang = data.configFormat.split('.').pop() ?? 'mjs';
			const packages = data.packages.reduce(
				(acc, pkg) => ({ ...acc, [pkg.name]: pkg.version }),
				{},
			);
			const packagesJson = JSON.stringify(packages, null, 2);

			url.searchParams.set('reproduce-bug', `\`\`\`${codeLang}\n${code}\n\`\`\``);
			url.searchParams.set('stylelint-configuration', `\`\`\`${configLang}\n${config}\n\`\`\``);
			url.searchParams.set('stylelint-run', `[Demo](${window.location.href})`);
			url.searchParams.set('stylelint-version', `\`\`\`json\n${packagesJson}\n\`\`\``);
			link.href = url.toString();
		});
	}
}
