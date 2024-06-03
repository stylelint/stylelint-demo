# stylelint-demo

[![Build Status](https://github.com/stylelint/stylelint-demo/workflows/CI/badge.svg)](https://github.com/stylelint/stylelint-demo/actions)
[![Netlify Status](https://api.netlify.com/api/v1/badges/9525ba74-5a0f-4ec7-8f36-3a305d880e55/deploy-status)](https://app.netlify.com/sites/chimerical-trifle-8d3c21/deploys)

An online demo of [Stylelint](https://github.com/stylelint/stylelint).

## Development

- `npm install`
- `npm run dev`
- Go to `http://localhost:5174/`

## Build static files

- `npm install`
- `npm run build`
- Output `./dist/`

## Build lib

- `npm install`
- `npm run build:lib`
- Output `./dist/`

## About

This demo works by calling Stylelint in a Node.js process launched inside the browser using [WebContainers](https://webcontainers.io/).

It is [deployed to Netlify](https://chimerical-trifle-8d3c21.netlify.app/).
