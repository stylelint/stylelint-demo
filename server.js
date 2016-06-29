const compression = require('compression')
const express = require('express')
const favicon = require('serve-favicon')
const bodyParser = require('body-parser')
const morgan = require('morgan')
const path = require('path')
const request = require('request')
const stylelint = require('stylelint')

const webpack = require('webpack')
const webpackMiddleware = require('webpack-dev-middleware')
const webpackHotMiddleware = require('webpack-hot-middleware')
const config = require('./webpack.config.dev.js')

const NODE_ENV = process.env.NODE_ENV
const PORT = process.env.PORT || 8080
const app = express()
const faviconPath = path.join(__dirname, 'src', 'static', 'favicon.ico')

app.locals.settings['x-powered-by'] = false
app.use(favicon(faviconPath))
app.use(morgan('dev'))
app.use(compression())
app.use(bodyParser.json())

if (NODE_ENV === 'development') {
  const compiler = webpack(config)
  const devMiddleware = webpackMiddleware(compiler, {
    publicPath: config.output.publicPath,
    contentBase: 'src',
    stats: {
      colors: true,
      hash: false,
      timings: true,
      chunks: false,
      chunkModules: false,
      modules: false
    }
  })

  app.use(devMiddleware);
  app.use(webpackHotMiddleware(compiler))
  app.get('*', (req, res) => {
    res.write(devMiddleware.fileSystem.readFileSync(path.join(__dirname, 'dist/index.html')));
    res.end()
  })
} else {
  app.use('/static', express.static(path.join(__dirname, 'dist', 'static'), {maxAge: '1 year'}))
  app.use(express.static(path.join(__dirname, 'dist'), {maxAge: '1 year'}))
}

app.post('/lint', (req, res) => {
  stylelint.lint({
    code: req.body.code,
    config: JSON.parse(req.body.config)
  }).then(result => {
    res.send({ warnings: result.results[0].warnings })
  }).catch(err => {
    console.log('ERROR', err)
  })
})

app.listen(PORT, () => {
  console.log(`Server started on ${PORT} in ${NODE_ENV}`)
})
