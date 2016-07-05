const compression = require("compression")
const express = require("express")
const favicon = require("serve-favicon")
const bodyParser = require("body-parser")
const morgan = require("morgan")
const path = require("path")
const lint = require("./src/server/lint")
const errorHandler = require("./src/server/error-handler")
const developmentMiddleware = require("./src/server/development-middleware")

const NODE_ENV = process.env.NODE_ENV
const PORT = process.env.PORT || 8080
const app = express()
const faviconPath = path.join(__dirname, "src/static/favicon.ico")

app.locals.settings["x-powered-by"] = false
app.use(favicon(faviconPath))
app.use(morgan("dev"))
app.use(compression())
app.use(bodyParser.json())

if (NODE_ENV === "development") {
  app.use(developmentMiddleware.dev)
  app.use(developmentMiddleware.hot)
}

app.post("/lint", lint)
app.use(express.static(path.join(__dirname, "dist"), { maxAge: "1 year" }))
app.use(errorHandler)
app.listen(PORT, () => {
  console.log(`Server started on ${PORT} in ${NODE_ENV}`) // eslint-disable-line no-console
})
