import { version as stylelintConfigStandardVersion } from 'stylelint-config-standard/package.json';
import { version as stylelintVersion } from 'stylelint/package.json';

export default {
	stylelint: `~${stylelintVersion}`,
	'stylelint-config-standard': `^${stylelintConfigStandardVersion}`,
};
