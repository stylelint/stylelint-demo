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
    config
  };

  stylelint
    .lint(opts)
    .then(result => {
      res.send({ warnings: result.results[0].warnings });
    })
    .catch(err => {
      return next(new Error(err.message));
    });
};
