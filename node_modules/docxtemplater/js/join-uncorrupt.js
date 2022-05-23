"use strict";

var _require = require("./doc-utils.js"),
    startsWith = _require.startsWith,
    endsWith = _require.endsWith,
    isStarting = _require.isStarting,
    isEnding = _require.isEnding,
    isWhiteSpace = _require.isWhiteSpace;

var filetypes = require("./filetypes.js");

function addEmptyParagraphAfterTable(parts) {
  var lastNonEmpty = "";

  for (var i = 0, len = parts.length; i < len; i++) {
    var p = parts[i];

    if (isWhiteSpace(p)) {
      continue;
    }

    if (endsWith(lastNonEmpty, "</w:tbl>")) {
      if (!startsWith(p, "<w:p") && !startsWith(p, "<w:tbl") && !startsWith(p, "<w:sectPr")) {
        p = "<w:p/>".concat(p);
      }
    }

    lastNonEmpty = p;
    parts[i] = p;
  }

  return parts;
} // eslint-disable-next-line complexity


function joinUncorrupt(parts, options) {
  var contains = options.fileTypeConfig.tagShouldContain || []; // Before doing this "uncorruption" method here, this was done with the `part.emptyValue` trick, however, there were some corruptions that were not handled, for example with a template like this :
  //
  // ------------------------------------------------
  // | {-w:p falsy}My para{/falsy}   |              |
  // | {-w:p falsy}My para{/falsy}   |              |
  // ------------------------------------------------

  var collecting = "";
  var currentlyCollecting = -1;

  if (filetypes.docx.indexOf(options.contentType) !== -1) {
    parts = addEmptyParagraphAfterTable(parts);
  }

  for (var i = 0, len = parts.length; i < len; i++) {
    var part = parts[i];

    for (var j = 0, len2 = contains.length; j < len2; j++) {
      var _contains$j = contains[j],
          tag = _contains$j.tag,
          shouldContain = _contains$j.shouldContain,
          value = _contains$j.value;

      if (currentlyCollecting === j) {
        if (isEnding(part, tag)) {
          currentlyCollecting = -1;
          parts[i] = collecting + value + part;
          break;
        }

        collecting += part;

        for (var k = 0, len3 = shouldContain.length; k < len3; k++) {
          var sc = shouldContain[k];

          if (isStarting(part, sc)) {
            currentlyCollecting = -1;
            parts[i] = collecting;
            break;
          }
        }

        if (currentlyCollecting > -1) {
          parts[i] = "";
        }

        break;
      }

      if (currentlyCollecting === -1 && isStarting(part, tag) && // to verify that the part doesn't have multiple tags, such as <w:tc><w:p>
      part.substr(1).indexOf("<") === -1) {
        // self-closing tag such as <w:t/>
        if (part[part.length - 2] === "/") {
          parts[i] = "";
          break;
        } else {
          currentlyCollecting = j;
          collecting = part;
          parts[i] = "";
          break;
        }
      }
    }
  }

  return parts;
}

module.exports = joinUncorrupt;