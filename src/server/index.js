const bodyParser = require("body-parser");
const compression = require("compression");
const errorHandler = require("./error-handler");
const express = require("express");
const favicon = require("serve-favicon");
const lint = require("./lint");
const morgan = require("morgan");
const path = require("path");

const NODE_ENV = process.env.NODE_ENV;

const app = express();
const faviconPath = path.join(__dirname, "../static/favicon.ico");

app.locals.settings["x-powered-by"] = false;
app.use(favicon(faviconPath));
app.use(morgan("dev"));
app.use(compression());
app.use(bodyParser.json());

if (NODE_ENV === "development") {
  const developmentMiddleware = require("./development-middleware");

  app.use(developmentMiddleware.dev);
  app.use(developmentMiddleware.hot);
}

app.post("/lint", lint);
app.use(
  express.static(path.join(__dirname, "../../dist"), { maxAge: "1 year" })
);
app.use(errorHandler);

module.exports = app;
