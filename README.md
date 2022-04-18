# stylelint-demo

[![Build Status](https://github.com/stylelint/stylelint-demo/workflows/CI/badge.svg)](https://github.com/stylelint/stylelint-demo/actions)

An online demo of [stylelint](https://github.com/stylelint/stylelint).

## Getting started

- `npm install`
- `npm run start-dev`
- Go to `http://localhost:8080`

Or view the live version at [https://stylelint-demo.herokuapp.com/](https://stylelint-demo.herokuapp.com/).

## About

It consists of two parts:

- A web server that accepts `code` and `config` parameters, passes them to stylelint and then responds with stylelint's output.
- A frontend for creating `code` and `config` blocks, and rendering server responses.

## Deployment

Commits to `main` will be tested by [GitHub Actions](https://github.com/stylelint/stylelint-demo/actions).

Successful builds can be deployed to [https://stylelint-demo.herokuapp.com/](https://stylelint-demo.herokuapp.com/) using the Heroku CLI and git:

1. Install the [Heroku CLI](https://devcenter.heroku.com/articles/heroku-cli#install-the-heroku-cli)
2. Login using the Stylelint Heroku account: `heroku login`
3. Set up a remote: `heroku git:remote -a stylelint-demo`
4. Push the code: `git push heroku main`
