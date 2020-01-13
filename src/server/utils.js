function uniqueParseErrors(parseErrors) {
  return parseErrors.filter((parseError, i, parseErrors) => {
    return (
      parseErrors.findIndex(
        pe => pe.line === parseError.line && pe.column === parseError.column
      ) === i
    );
  });
}

exports.uniqueParseErrors = uniqueParseErrors;
