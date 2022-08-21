import MonacoEditor, { useMonaco } from '@monaco-editor/react';
import React, { useEffect } from 'react';
import PropTypes from 'prop-types';

export default function Editor({ code, language, height, warnings, onChange }) {
	const monaco = useMonaco();

	const lang = normalizeLanguage(language);
	const path = `editor.${lang}`;

	useEffect(() => {
		if (!monaco) return;

		if (!warnings) return;

		const { Warning, Error } = monaco.MarkerSeverity;
		const markers = warnings.map(({ text, line, column, endLine, endColumn, severity }) => ({
			message: text,
			severity: severity === 'warning' ? Warning : Error,
			startLineNumber: line,
			startColumn: column,
			endLineNumber: endLine,
			endColumn,
		}));

		const model = monaco.editor.getModel(monaco.Uri.parse(path));

		monaco.editor.setModelMarkers(model, 'stylelint', markers);
	}, [monaco, lang, path, warnings]);

	return (
		<MonacoEditor
			language={lang}
			path={path}
			value={code}
			height={height}
			theme="light"
			options={{ colorDecorators: false, tabSize: 2, padding: { top: 10, bottom: 10 } }}
			onMount={(_editor, monacoInstance) => {
				monacoInstance.languages.css.cssDefaults.setOptions({ validate: false });
			}}
			onChange={(value) => onChange(value)}
		/>
	);
}

Editor.propTypes = {
	code: PropTypes.string.isRequired,
	language: PropTypes.string.isRequired,
	height: PropTypes.string.isRequired,
	warnings: PropTypes.array,
	onChange: PropTypes.func.isRequired,
};

function normalizeLanguage(language) {
	switch (language) {
		case 'json':
		case 'html':
			return language;
		default:
			return 'css';
	}
}
