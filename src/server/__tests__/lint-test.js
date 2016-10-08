import test from "tape"
import request from "supertest"
import app from "../index"

const validCSS = "a { color: #fff; }"
const warningCSS = "a { color: #ffffff; }"
const invalidCSS = "a {"
const validConfig = `{
  "rules": {
    "color-hex-length": "short"
  }
}`
const invalidConfig = "{ \"rules\": }}"
const nonExistentRuleConfig = `{
  "rules": {
    "this-rule-does-not-exist": true
  }
}`

test("valid, no warnings", t => {
  const body = {
    code: validCSS,
    config: validConfig,
  }

  request(app)
    .post("/lint")
    .send(body)
    .expect(200)
    .end((err, res) => {
      const actual = JSON.stringify(res.body)
      const expected = JSON.stringify({ warnings: [] })
      t.error(err)
      t.same(actual, expected)
      t.end()
    })
})

test("CSS warning", t => {
  const body = {
    code: warningCSS,
    config: validConfig,
  }

  request(app)
    .post("/lint")
    .send(body)
    .expect(200)
    .end((err, res) => {
      const actual = JSON.stringify(res.body)
      const expected = JSON.stringify({ "warnings":[{ "line":1, "column":12, "rule":"color-hex-length", "severity":"error", "text":"Expected \"#ffffff\" to be \"#fff\" (color-hex-length)" }] })
      t.error(err)
      t.same(actual, expected)
      t.end()
    })
})

test("CSSSyntaxError warning", t => {
  const body = {
    code: invalidCSS,
    config: validConfig,
  }

  request(app)
    .post("/lint")
    .send(body)
    .expect(200)
    .end((err, res) => {
      const actual = JSON.stringify(res.body)
      const expected = JSON.stringify({ "warnings":[{ "line":1, "column":1, "rule":"CssSyntaxError", "severity":"error", "text":"Unclosed block (CssSyntaxError)" }] })
      t.error(err)
      t.same(actual, expected)
      t.end()
    })
})

test("parse config error", t => {
  const body = {
    code: validCSS,
    config: invalidConfig,
  }

  request(app)
    .post("/lint")
    .send(body)
    .expect(500)
    .end((err, res) => {
      const actual = JSON.stringify(res.body)
      const expected = JSON.stringify({ error: "Could not parse stylelint config" })
      t.error(err)
      t.same(actual, expected)
      t.end()
    })
})

test("undefined rule error", t => {
  const body = {
    code: validCSS,
    config: nonExistentRuleConfig,
  }

  request(app)
    .post("/lint")
    .send(body)
    .expect(500)
    .end((err, res) => {
      const actual = JSON.stringify(res.body)
      const expected = JSON.stringify({ error: "Undefined rule this-rule-does-not-exist" })
      t.error(err)
      t.same(actual, expected)
      t.end()
    })
})
