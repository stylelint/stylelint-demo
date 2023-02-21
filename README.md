# stylelint-demo

[![Build Status](https://github.com/stylelint/stylelint-demo/workflows/CI/badge.svg)](https://github.com/stylelint/stylelint-demo/actions)

An online demo of [stylelint](https://github.com/stylelint/stylelint).

## Getting started

- `npm install`
- `npm run dev`
- Go to `http://localhost:5174/demo/`

## Build static files

- `npm run build`
- Output `./dist/demo/`

## Build lib

- `npm run build:lib`
- Output `./dist/lib`

## About

This demo works by calling stylelint in a Node.js process launched inside the browser using [WebContainers].

[WebContainers]: https://webcontainers.io/
