module.exports = (err, req, res, next) => { // eslint-disable-line no-unused-vars
  if (err.message === "parseConfig") {
    res.status(500).send({ error: "Could not parse stylelint config" })
  } else {
    res.status(500).send({ error: err.message })
  }
}
