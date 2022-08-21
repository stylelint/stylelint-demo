const stylelint = require('stylelint');
const { version: stylelintVersion } = require('stylelint/package.json');

const { uniqueParseErrors } = require('./utils');

module.exports = (req, res, next) => {
	let config;

	try {
		config = JSON.parse(req.body.config);
	} catch (err) {
		return next(new Error('parseConfig'));
	}

	const opts = {
		code: req.body.code,
		config,
	};

	if (req.body.syntax && req.body.syntax !== 'css') {
		if (req.body.syntax === 'sugarss') {
			opts.customSyntax = require('sugarss');
		} else if (req.body.syntax === 'html') {
			opts.customSyntax = require('postcss-html')();
		} else {
			opts.customSyntax = require(`postcss-${req.body.syntax}`);
		}
	}

	stylelint
		.lint(opts)
		.then((result) => {
			const { invalidOptionWarnings, parseErrors, warnings } = result.results[0];
			const { ruleMetadata } = result;
			const filteredParseErrors = uniqueParseErrors(parseErrors);

			// Sort by line and column
			warnings.sort((a, b) => {
				return a.line - b.line || a.column - b.column;
			});

			for (const warning of warnings) {
				warning.url = ruleMetadata[warning.rule]?.url;
			}

			res.send({
				invalidOptionWarnings,
				parseErrors: filteredParseErrors,
				warnings,
				stylelintVersion,
			});
		})
		.catch((err) => {
			return next(new Error(err.message));
		});
};
