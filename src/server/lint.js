const stylelint = require("stylelint");

const { uniqueParseErrors } = require("./utils");

module.exports = (req, res, next) => {
  let config;

  try {
    config = JSON.parse(req.body.config);
  } catch (err) {
    return next(new Error("parseConfig"));
  }

  const opts = {
    code: req.body.code,
    config,
    syntax: req.body.syntax
  };

  stylelint
    .lint(opts)
    .then(result => {
      const {
        invalidOptionWarnings,
        parseErrors,
        warnings
      } = result.results[0];
      const filteredParseErrors = uniqueParseErrors(parseErrors);

      res.send({
        invalidOptionWarnings,
        parseErrors: filteredParseErrors,
        warnings
      });
    })
    .catch(err => {
      return next(new Error(err.message));
    });
};
