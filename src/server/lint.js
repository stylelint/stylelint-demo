const stylelint = require("stylelint")

module.exports = (req, res) => {
  stylelint.lint({
    code: req.body.code,
    config: JSON.parse(req.body.config),
  }).then(result => {
    res.send({ warnings: result.results[0].warnings })
  }).catch(err => {
    console.log("ERROR", err)
  })
}
