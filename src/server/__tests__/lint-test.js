import request from "supertest";
import app from "../index";

const validCSS = "a { color: #fff; }";
const warningCSS = "a { color: #ffffff; }";
const invalidCSS = "a {";
const validConfig = `{
  "rules": {
    "color-hex-length": "short"
  }
}`;
const invalidConfig = '{ "rules": }}';
const nonExistentRuleConfig = `{
  "rules": {
    "this-rule-does-not-exist": true
  }
}`;
const invalidOptionConfig = `{
  "rules": {
    "color-hex-length": "short",
    "at-rule-empty-line-before": [
      "always",
      {
        "except": [
          "blockless-after-same-name-blockless",
          "first-nested"
        ],
        "ignore": [
          "all"
        ]
      }
    ]
  }
}`;

test("valid, no warnings", () => {
  const body = {
    code: validCSS,
    config: validConfig
  };

  return request(app)
    .post("/lint")
    .send(body)
    .expect(200)
    .then(res => {
      expect(res.body).toEqual({ invalidOptionWarnings: [], warnings: [] });
    });
});

test("valid, no warnings, custom syntax", () => {
  const body = {
    code: `a {
      // hello
      color: #fff;
    }`,
    config: `{
      "rules": {
        "no-invalid-double-slash-comments": true
      }
    }`,
    syntax: "scss"
  };

  return request(app)
    .post("/lint")
    .send(body)
    .expect(200)
    .then(res => {
      expect(res.body).toEqual({ invalidOptionWarnings: [], warnings: [] });
    });
});

test("CSS warning", () => {
  const body = {
    code: warningCSS,
    config: validConfig
  };

  return request(app)
    .post("/lint")
    .send(body)
    .expect(200)
    .then(res => {
      const expected = {
        invalidOptionWarnings: [],
        warnings: [
          {
            line: 1,
            column: 12,
            rule: "color-hex-length",
            severity: "error",
            text: 'Expected "#ffffff" to be "#fff" (color-hex-length)'
          }
        ]
      };

      expect(res.body).toEqual(expected);
    });
});

test("CSSSyntaxError warning", () => {
  const body = {
    code: invalidCSS,
    config: validConfig
  };

  return request(app)
    .post("/lint")
    .send(body)
    .expect(200)
    .then(res => {
      const expected = {
        invalidOptionWarnings: [],
        warnings: [
          {
            line: 1,
            column: 1,
            rule: "CssSyntaxError",
            severity: "error",
            text: "Unclosed block (CssSyntaxError)"
          }
        ]
      };

      expect(res.body).toEqual(expected);
    });
});

test("parse config error", () => {
  const body = {
    code: validCSS,
    config: invalidConfig
  };

  return request(app)
    .post("/lint")
    .send(body)
    .expect(500)
    .then(res => {
      expect(res.body).toEqual({
        error: "Could not parse stylelint config"
      });
    });
});

test("undefined rule error", () => {
  const body = {
    code: validCSS,
    config: nonExistentRuleConfig
  };

  return request(app)
    .post("/lint")
    .send(body)
    .expect(200)
    .then(res => {
      const expected = {
        invalidOptionWarnings: [],
        warnings: [
          {
            line: 1,
            column: 1,
            rule: "this-rule-does-not-exist",
            severity: "error",
            text: "Unknown rule this-rule-does-not-exist."
          }
        ]
      };

      expect(res.body).toEqual(expected);
    });
});

test("invalid option warnings", () => {
  const body = {
    code: validCSS,
    config: invalidOptionConfig
  };

  return request(app)
    .post("/lint")
    .send(body)
    .expect(200)
    .then(res => {
      const expected = {
        invalidOptionWarnings: [
          {
            text:
              'Invalid value "all" for option "ignore" of rule "at-rule-empty-line-before"'
          }
        ],
        warnings: []
      };

      expect(res.body).toEqual(expected);
    });
});

test("invalid option and warning css", () => {
  const body = {
    code: warningCSS,
    config: invalidOptionConfig
  };

  return request(app)
    .post("/lint")
    .send(body)
    .expect(200)
    .then(res => {
      const expected = {
        invalidOptionWarnings: [
          {
            text:
              'Invalid value "all" for option "ignore" of rule "at-rule-empty-line-before"'
          }
        ],
        warnings: [
          {
            line: 1,
            column: 12,
            rule: "color-hex-length",
            severity: "error",
            text: 'Expected "#ffffff" to be "#fff" (color-hex-length)'
          }
        ]
      };

      expect(res.body).toEqual(expected);
    });
});
