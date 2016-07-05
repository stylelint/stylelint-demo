const stylelint = require("stylelint")

module.exports = (req, res, next) => {
  let config
  try {
    config = JSON.parse(req.body.config)
  } catch (err) {
    return next(new Error("parseConfig"))
  }
  stylelint.lint({
    code: req.body.code,
    config,
  }).then(result => {
    res.send({ warnings: result.results[0].warnings })
  }).catch((err) => {
    return next(new Error(err.message))
  })
}
