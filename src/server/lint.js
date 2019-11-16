const stylelint = require("stylelint");

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
      const { invalidOptionWarnings, warnings } = result.results[0];

      res.send({ invalidOptionWarnings, warnings });
    })
    .catch(err => {
      return next(new Error(err.message));
    });
};
