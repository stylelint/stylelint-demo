import request from 'supertest'; // eslint-disable-line node/no-unpublished-import

import app from '../index';

const validCSS = 'a { color: #fff; }';
const warningCSS = `a {
  color: #ffffff;
  color: #000000;
}`;
const invalidCSS = 'a {';
const validConfig = `{
  "rules": {
    "color-hex-length": "short"
  }
}`;
const invalidConfig = '{ "rules": }}';
const nonExistentRuleConfig = `{
  "rules": {
    "this-rule-does-not-exist": true
  }
}`;
const invalidOptionConfig = `{
  "rules": {
    "color-hex-length": "short",
    "at-rule-empty-line-before": [
      "always",
      {
        "except": [
          "blockless-after-same-name-blockless",
          "first-nested"
        ],
        "ignore": [
          "all"
        ]
      }
    ]
  }
}`;
const parseErrorsCss = 'a:b(a:(f)) {}';
const parseErrorsConfig = `{
  "rules": {
    "selector-pseudo-class-no-unknown": true
  }
}`;

test('valid, no warnings', () => {
	const body = {
		code: validCSS,
		config: validConfig,
	};

	return request(app)
		.post('/lint')
		.send(body)
		.expect(200)
		.then((res) => {
			expect(res.body).toEqual({
				invalidOptionWarnings: [],
				parseErrors: [],
				warnings: [],
				stylelintVersion: expect.stringMatching(/^\d+\.\d+\.\d+$/),
			});
		});
});

test('valid, no warnings, custom syntax', () => {
	const body = {
		code: `a {
      // hello
      color: #fff;
    }`,
		config: `{
      "rules": {
        "no-invalid-double-slash-comments": true
      }
    }`,
		syntax: 'scss',
	};

	return request(app)
		.post('/lint')
		.send(body)
		.expect(200)
		.then((res) => {
			expect(res.body).toEqual({
				invalidOptionWarnings: [],
				parseErrors: [],
				warnings: [],
				stylelintVersion: expect.stringMatching(/^\d+\.\d+\.\d+$/),
			});
		});
});

test('CSS warning', () => {
	const body = {
		code: warningCSS,
		config: validConfig,
	};

	return request(app)
		.post('/lint')
		.send(body)
		.expect(200)
		.then((res) => {
			const expected = {
				invalidOptionWarnings: [],
				parseErrors: [],
				warnings: [
					{
						line: 2,
						column: 10,
						endLine: 2,
						endColumn: 17,
						rule: 'color-hex-length',
						severity: 'error',
						text: 'Expected "#ffffff" to be "#fff" (color-hex-length)',
						url: 'https://stylelint.io/user-guide/rules/list/color-hex-length',
					},
					{
						line: 3,
						column: 10,
						endLine: 3,
						endColumn: 17,
						rule: 'color-hex-length',
						severity: 'error',
						text: 'Expected "#000000" to be "#000" (color-hex-length)',
						url: 'https://stylelint.io/user-guide/rules/list/color-hex-length',
					},
				],
				stylelintVersion: expect.stringMatching(/^\d+\.\d+\.\d+$/),
			};

			expect(res.body).toEqual(expected);
		});
});

test('CSSSyntaxError warning', () => {
	const body = {
		code: invalidCSS,
		config: validConfig,
	};

	return request(app)
		.post('/lint')
		.send(body)
		.expect(200)
		.then((res) => {
			const expected = {
				invalidOptionWarnings: [],
				parseErrors: [],
				warnings: [
					{
						line: 1,
						column: 1,
						rule: 'CssSyntaxError',
						severity: 'error',
						text: 'Unclosed block (CssSyntaxError)',
					},
				],
				stylelintVersion: expect.stringMatching(/^\d+\.\d+\.\d+$/),
			};

			expect(res.body).toEqual(expected);
		});
});

test('parse config error', () => {
	const body = {
		code: validCSS,
		config: invalidConfig,
	};

	return request(app)
		.post('/lint')
		.send(body)
		.expect(500)
		.then((res) => {
			expect(res.body).toEqual({
				error: 'Could not parse stylelint config',
			});
		});
});

test('undefined rule error', () => {
	const body = {
		code: validCSS,
		config: nonExistentRuleConfig,
	};

	return request(app)
		.post('/lint')
		.send(body)
		.expect(200)
		.then((res) => {
			const expected = {
				invalidOptionWarnings: [],
				parseErrors: [],
				warnings: [
					{
						line: 1,
						column: 1,
						endLine: 1,
						endColumn: 2,
						rule: 'this-rule-does-not-exist',
						severity: 'error',
						text: 'Unknown rule this-rule-does-not-exist.',
					},
				],
				stylelintVersion: expect.stringMatching(/^\d+\.\d+\.\d+$/),
			};

			expect(res.body).toEqual(expected);
		});
});

test('invalid option warnings', () => {
	const body = {
		code: validCSS,
		config: invalidOptionConfig,
	};

	return request(app)
		.post('/lint')
		.send(body)
		.expect(200)
		.then((res) => {
			const expected = {
				invalidOptionWarnings: [
					{
						text: 'Invalid value "all" for option "ignore" of rule "at-rule-empty-line-before"',
					},
				],
				parseErrors: [],
				warnings: [],
				stylelintVersion: expect.stringMatching(/^\d+\.\d+\.\d+$/),
			};

			expect(res.body).toEqual(expected);
		});
});

test('invalid option and warning css', () => {
	const body = {
		code: warningCSS,
		config: invalidOptionConfig,
	};

	return request(app)
		.post('/lint')
		.send(body)
		.expect(200)
		.then((res) => {
			const expected = {
				invalidOptionWarnings: [
					{
						text: 'Invalid value "all" for option "ignore" of rule "at-rule-empty-line-before"',
					},
				],
				parseErrors: [],
				warnings: [
					{
						line: 2,
						column: 10,
						endLine: 2,
						endColumn: 17,
						rule: 'color-hex-length',
						severity: 'error',
						text: 'Expected "#ffffff" to be "#fff" (color-hex-length)',
						url: 'https://stylelint.io/user-guide/rules/list/color-hex-length',
					},
					{
						line: 3,
						column: 10,
						endLine: 3,
						endColumn: 17,
						rule: 'color-hex-length',
						severity: 'error',
						text: 'Expected "#000000" to be "#000" (color-hex-length)',
						url: 'https://stylelint.io/user-guide/rules/list/color-hex-length',
					},
				],
				stylelintVersion: expect.stringMatching(/^\d+\.\d+\.\d+$/),
			};

			expect(res.body).toEqual(expected);
		});
});

test('parse errors warnings', () => {
	const body = {
		code: parseErrorsCss,
		config: parseErrorsConfig,
	};

	return request(app)
		.post('/lint')
		.send(body)
		.expect(200)
		.then((res) => {
			const expected = {
				invalidOptionWarnings: [],
				parseErrors: [
					{
						column: 1,
						line: 1,
						node: {
							indexes: {},
							inputs: [
								{
									css: 'a:b(a:(f)) {}',
									hasBOM: false,
								},
							],
							lastEach: 3,
							nodes: [],
							raws: {
								after: '',
								before: '',
								between: ' ',
							},
							selector: 'a:b(a:(f))',
							source: {
								end: {
									column: 13,
									line: 1,
									offset: 12,
								},
								inputId: 0,
								start: {
									column: 1,
									line: 1,
									offset: 0,
								},
							},
							type: 'rule',
						},
						stylelintType: 'parseError',
						text: 'Cannot parse selector (Error: Expected a pseudo-class or pseudo-element.)',
						type: 'warning',
					},
				],
				warnings: [],
			};

			expect(res.body).toMatchObject(expected);
		});
});
