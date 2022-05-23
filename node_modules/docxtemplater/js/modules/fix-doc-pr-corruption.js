"use strict";

var _require = require("../doc-utils.js"),
    setSingleAttribute = _require.setSingleAttribute,
    isTagStart = _require.isTagStart;

module.exports = {
  name: "FixDocPRCorruptionModule",
  set: function set(options) {
    if (options.Lexer) {
      this.Lexer = options.Lexer;
    }

    if (options.zip) {
      this.zip = options.zip;
    }
  },
  on: function on(event) {
    /* Stryker disable all : because this is an optimisation that won't make any tests fail */
    if (event === "attached") {
      this.attached = false;
    }
    /* Stryker restore all */


    if (event !== "syncing-zip") {
      return;
    }

    var zip = this.zip;
    var Lexer = this.Lexer;
    var prId = 1;
    zip.file(/\.xml$/).forEach(function (f) {
      var text = f.asText();
      var xmllexed = Lexer.xmlparse(text, {
        text: [],
        other: ["wp:docPr"]
      });

      if (xmllexed.length > 1) {
        text = xmllexed.reduce(function (fullText, part) {
          if (isTagStart("wp:docPr", part)) {
            return fullText + setSingleAttribute(part.value, "id", prId++);
          }

          return fullText + part.value;
        }, "");
      }

      zip.file(f.name, text);
    });
  }
};