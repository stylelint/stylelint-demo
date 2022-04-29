import EditorNew, { useMonaco } from '@monaco-editor/react';
import React, { useEffect } from 'react';
import PropTypes from 'prop-types';

export default function Editor({ code, language, height, onChange }) {
	const monaco = useMonaco();

	useEffect(() => {
		if (monaco) {
			monaco.languages.css.cssDefaults.setOptions({ validate: false });
		}
	}, [monaco]);

	return (
		<EditorNew
			language={normalizeLanguage(language)}
			value={code}
			height={height}
			theme="light"
			options={{ colorDecorators: false, tabSize: 2, padding: { top: 10, bottom: 10 } }}
			onChange={(value) => onChange(value)}
		/>
	);
}

Editor.propTypes = {
	code: PropTypes.string.isRequired,
	language: PropTypes.string.isRequired,
	height: PropTypes.string.isRequired,
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
