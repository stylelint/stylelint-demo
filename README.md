# stylelint-demo

[![Build Status](https://travis-ci.com/stylelint/stylelint-demo.svg?branch=master)](https://travis-ci.com/stylelint/stylelint-demo)

An online demo of [stylelint](https://github.com/stylelint/stylelint).

## Getting started

-   `npm install`
-   `npm run start:dev`
-   Go to `http://localhost:8080`

Or view the live version at [https://stylelint-demo.herokuapp.com/](https://stylelint-demo.herokuapp.com/).

## About

It consists of two parts:

-   A web server that accepts `code` and `config` parameters, passes them to stylelint and then responds with stylelint's output.

-   A frontend for creating `code` and `config` blocks, and rendering server responses.

## Deployment

Commits to `master` will be tested by [Travis](https://travis-ci.org/stylelint/stylelint-demo). Successful builds will automatically be deployed to [https://stylelint-demo.herokuapp.com/](https://stylelint-demo.herokuapp.com/).
