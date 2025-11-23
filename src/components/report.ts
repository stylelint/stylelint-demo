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

			const codeLang = data.fileName.split('.').pop() ?? 'css';
			const configLang = data.configFormat.split('.').pop() ?? 'mjs';

			url.searchParams.set('stylelint-run', `[Demo](${window.location.href})`);
			url.searchParams.set(
				'stylelint-configuration',
				`\`\`\`${configLang}\n${data.config}\n\`\`\``,
			);
			url.searchParams.set('reproduce-bug', `\`\`\`${codeLang}\n${data.code}\n\`\`\``);
			url.searchParams.set(
				'stylelint-version',
				`\`\`\`json\n${JSON.stringify(
					data.packages.reduce((acc, pkg) => ({ ...acc, [pkg.name]: pkg.version }), {}),
					null,
					2,
				)}\n\`\`\``,
			);
			link.href = url.toString();
		});
	}
}
