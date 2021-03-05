function uniqueParseErrors(parseErrors) {
	return parseErrors.filter((parseError, i, arr) => {
		return (
			arr.findIndex((pe) => pe.line === parseError.line && pe.column === parseError.column) === i
		);
	});
}

exports.uniqueParseErrors = uniqueParseErrors;
