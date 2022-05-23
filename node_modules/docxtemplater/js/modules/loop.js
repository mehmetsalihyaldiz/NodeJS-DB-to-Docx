"use strict";

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _iterableToArrayLimit(arr, i) { var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"]; if (_i == null) return; var _arr = []; var _n = true; var _d = false; var _s, _e; try { for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }

var _require = require("../doc-utils.js"),
    mergeObjects = _require.mergeObjects,
    chunkBy = _require.chunkBy,
    last = _require.last,
    isParagraphStart = _require.isParagraphStart,
    isModule = _require.isModule,
    isParagraphEnd = _require.isParagraphEnd,
    isContent = _require.isContent,
    startsWith = _require.startsWith,
    isTagEnd = _require.isTagEnd,
    isTagStart = _require.isTagStart,
    getSingleAttribute = _require.getSingleAttribute,
    setSingleAttribute = _require.setSingleAttribute;

var wrapper = require("../module-wrapper.js");

var moduleName = "loop";

function hasContent(parts) {
  return parts.some(function (part) {
    return isContent(part);
  });
}

function getFirstMeaningFulPart(parsed) {
  for (var i = 0, len = parsed.length; i < len; i++) {
    if (parsed[i].type !== "content") {
      return parsed[i];
    }
  }

  return null;
}

function isInsideParagraphLoop(part) {
  var firstMeaningfulPart = getFirstMeaningFulPart(part.subparsed);
  return firstMeaningfulPart != null && firstMeaningfulPart.tag !== "w:t";
}

function getPageBreakIfApplies(part) {
  return part.hasPageBreak && isInsideParagraphLoop(part) ? '<w:p><w:r><w:br w:type="page"/></w:r></w:p>' : "";
}

function isEnclosedByParagraphs(parsed) {
  return parsed.length && isParagraphStart(parsed[0]) && isParagraphEnd(last(parsed));
}

function getOffset(chunk) {
  return hasContent(chunk) ? 0 : chunk.length;
}

function addPageBreakAtEnd(subRendered) {
  var found = false;
  var i = subRendered.parts.length - 1;

  for (var j = subRendered.parts.length - 1; i >= 0; i--) {
    var p = subRendered.parts[j];

    if (p === "</w:p>" && !found) {
      found = true;
      subRendered.parts.splice(j, 0, '<w:r><w:br w:type="page"/></w:r>');
      break;
    }
  }

  if (!found) {
    subRendered.parts.push('<w:p><w:r><w:br w:type="page"/></w:r></w:p>');
  }
}

function addPageBreakAtBeginning(subRendered) {
  subRendered.parts.unshift('<w:p><w:r><w:br w:type="page"/></w:r></w:p>');
}

function isContinuous(parts) {
  return parts.some(function (part) {
    return isTagStart("w:type", part) && part.value.indexOf("continuous") !== -1;
  });
}

function addContinuousType(parts) {
  var stop = false;
  var inSectPr = false;
  return parts.reduce(function (result, part) {
    if (stop === false && startsWith(part, "<w:sectPr")) {
      inSectPr = true;
    }

    if (inSectPr) {
      if (startsWith(part, "<w:type")) {
        stop = true;
      }

      if (stop === false && startsWith(part, "</w:sectPr")) {
        result.push('<w:type w:val="continuous"/>');
      }
    }

    result.push(part);
    return result;
  }, []);
}

function dropHeaderFooterRefs(parts) {
  return parts.filter(function (text) {
    return !startsWith(text, "<w:headerReference") && !startsWith(text, "<w:footerReference");
  });
}

function hasPageBreak(chunk) {
  return chunk.some(function (part) {
    return part.tag === "w:br" && part.value.indexOf('w:type="page"') !== -1;
  });
}

function hasImage(chunk) {
  return chunk.some(function (_ref) {
    var tag = _ref.tag;
    return tag === "w:drawing";
  });
}

function getSectPr(chunks) {
  var collectSectPr = false;
  var sectPrs = [];
  chunks.forEach(function (part) {
    if (isTagStart("w:sectPr", part)) {
      sectPrs.push([]);
      collectSectPr = true;
    }

    if (collectSectPr) {
      sectPrs[sectPrs.length - 1].push(part);
    }

    if (isTagEnd("w:sectPr", part)) {
      collectSectPr = false;
    }
  });
  return sectPrs;
}

function getSectPrHeaderFooterChangeCount(chunks) {
  var collectSectPr = false;
  var sectPrCount = 0;
  chunks.forEach(function (part) {
    if (isTagStart("w:sectPr", part)) {
      collectSectPr = true;
    }

    if (collectSectPr) {
      if (part.tag === "w:headerReference" || part.tag === "w:footerReference") {
        sectPrCount++;
        collectSectPr = false;
      }
    }

    if (isTagEnd("w:sectPr", part)) {
      collectSectPr = false;
    }
  });
  return sectPrCount;
}

function getLastSectPr(parsed) {
  var sectPr = [];
  var inSectPr = false;

  for (var i = parsed.length - 1; i >= 0; i--) {
    var part = parsed[i];

    if (isTagEnd("w:sectPr", part)) {
      inSectPr = true;
    }

    if (isTagStart("w:sectPr", part)) {
      sectPr.unshift(part.value);
      inSectPr = false;
    }

    if (inSectPr) {
      sectPr.unshift(part.value);
    }

    if (isParagraphStart(part)) {
      if (sectPr.length > 0) {
        return sectPr.join("");
      }

      break;
    }
  }

  return "";
}

var LoopModule = /*#__PURE__*/function () {
  function LoopModule() {
    _classCallCheck(this, LoopModule);

    this.name = "LoopModule";
    this.inXfrm = false;
    this.totalSectPr = 0;
    this.prefix = {
      start: "#",
      end: "/",
      dash: /^-([^\s]+)\s(.+)/,
      inverted: "^"
    };
  }

  _createClass(LoopModule, [{
    key: "optionsTransformer",
    value: function optionsTransformer(opts, docxtemplater) {
      this.docxtemplater = docxtemplater;
      return opts;
    }
  }, {
    key: "preparse",
    value: function preparse(parsed, _ref2) {
      var contentType = _ref2.contentType;

      if (contentType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml") {
        this.sects = getSectPr(parsed);
      }
    }
  }, {
    key: "matchers",
    value: function matchers() {
      var module = moduleName;
      return [[this.prefix.start, module, {
        expandTo: "auto",
        location: "start",
        inverted: false
      }], [this.prefix.inverted, module, {
        expandTo: "auto",
        location: "start",
        inverted: true
      }], [this.prefix.end, module, {
        location: "end"
      }], [this.prefix.dash, module, function (_ref3) {
        var _ref4 = _slicedToArray(_ref3, 3),
            expandTo = _ref4[1],
            value = _ref4[2];

        return {
          location: "start",
          inverted: false,
          expandTo: expandTo,
          value: value
        };
      }]];
    }
  }, {
    key: "getTraits",
    value: function getTraits(traitName, parsed) {
      // Stryker disable all : because getTraits should disappear in v4
      if (traitName !== "expandPair") {
        return;
      } // Stryker restore all


      return parsed.reduce(function (tags, part, offset) {
        if (isModule(part, moduleName) && part.subparsed == null) {
          tags.push({
            part: part,
            offset: offset
          });
        }

        return tags;
      }, []);
    }
  }, {
    key: "postparse",
    value: function postparse(parsed, _ref5) {
      var basePart = _ref5.basePart;

      if (basePart && this.docxtemplater.fileType === "docx") {
        basePart.sectPrCount = getSectPrHeaderFooterChangeCount(parsed);
        this.totalSectPr += basePart.sectPrCount;
        var sects = this.sects;
        sects.some(function (sect, index) {
          if (sect[0].lIndex > basePart.lIndex) {
            if (index + 1 < sects.length && isContinuous(sects[index + 1])) {
              basePart.addContinuousType = true;
            }

            return true;
          }
        });
        basePart.lastParagrapSectPr = getLastSectPr(parsed);
      }

      if (!basePart || basePart.expandTo !== "auto" || basePart.module !== moduleName || !isEnclosedByParagraphs(parsed)) {
        return parsed;
      }

      basePart.paragraphLoop = true;
      var level = 0;
      var chunks = chunkBy(parsed, function (p) {
        if (isParagraphStart(p)) {
          level++;

          if (level === 1) {
            return "start";
          }
        }

        if (isParagraphEnd(p)) {
          level--;

          if (level === 0) {
            return "end";
          }
        }

        return null;
      });
      var firstChunk = chunks[0];
      var lastChunk = last(chunks);
      var firstOffset = getOffset(firstChunk);
      var lastOffset = getOffset(lastChunk);
      basePart.hasPageBreakBeginning = hasPageBreak(firstChunk);
      basePart.hasPageBreak = hasPageBreak(lastChunk);

      if (hasImage(firstChunk)) {
        firstOffset = 0;
      }

      if (hasImage(lastChunk)) {
        lastOffset = 0;
      }

      return parsed.slice(firstOffset, parsed.length - lastOffset);
    }
  }, {
    key: "resolve",
    value: function resolve(part, options) {
      if (!isModule(part, moduleName)) {
        return null;
      }

      var sm = options.scopeManager;
      var promisedValue = sm.getValueAsync(part.value, {
        part: part
      });
      var promises = [];

      function loopOver(scope, i, length) {
        var scopeManager = sm.createSubScopeManager(scope, part.value, i, part, length);
        promises.push(options.resolve({
          filePath: options.filePath,
          modules: options.modules,
          baseNullGetter: options.baseNullGetter,
          resolve: options.resolve,
          compiled: part.subparsed,
          tags: {},
          scopeManager: scopeManager
        }));
      }

      var errorList = [];
      return promisedValue.then(function (values) {
        return new Promise(function (resolve) {
          if (values instanceof Array) {
            Promise.all(values).then(resolve);
          } else {
            resolve(values);
          }
        }).then(function (values) {
          sm.loopOverValue(values, loopOver, part.inverted);
          return Promise.all(promises).then(function (r) {
            return r.map(function (_ref6) {
              var resolved = _ref6.resolved,
                  errors = _ref6.errors;
              errorList.push.apply(errorList, _toConsumableArray(errors));
              return resolved;
            });
          }).then(function (value) {
            if (errorList.length > 0) {
              throw errorList;
            }

            return value;
          });
        });
      });
    } // eslint-disable-next-line complexity

  }, {
    key: "render",
    value: function render(part, options) {
      if (part.tag === "p:xfrm") {
        this.inXfrm = part.position === "start";
      }

      if (part.tag === "a:ext" && this.inXfrm) {
        this.lastExt = part;
        return part;
      }

      if (!isModule(part, moduleName)) {
        return null;
      }

      var totalValue = [];
      var errors = [];
      var heightOffset = 0;
      var firstTag = part.subparsed[0];
      var tagHeight = 0;

      if ((firstTag === null || firstTag === void 0 ? void 0 : firstTag.tag) === "a:tr") {
        tagHeight = +getSingleAttribute(firstTag.value, "h");
      }

      heightOffset -= tagHeight;
      var a16RowIdOffset = 0;

      function loopOver(scope, i, length) {
        heightOffset += tagHeight;
        var scopeManager = options.scopeManager.createSubScopeManager(scope, part.value, i, part, length);
        part.subparsed.forEach(function (pp) {
          if (isTagStart("a16:rowId", pp)) {
            var val = +getSingleAttribute(pp.value, "val") + a16RowIdOffset;
            a16RowIdOffset = 1;
            pp.value = setSingleAttribute(pp.value, "val", val);
          }
        });
        var subRendered = options.render(mergeObjects({}, options, {
          compiled: part.subparsed,
          tags: {},
          scopeManager: scopeManager
        }));

        if (part.hasPageBreak && i === length - 1 && isInsideParagraphLoop(part)) {
          addPageBreakAtEnd(subRendered);
        }

        var isNotFirst = scopeManager.scopePathItem.some(function (i) {
          return i !== 0;
        });

        if (isNotFirst) {
          if (part.sectPrCount === 1) {
            subRendered.parts = dropHeaderFooterRefs(subRendered.parts);
          }

          if (part.addContinuousType) {
            subRendered.parts = addContinuousType(subRendered.parts);
          }
        }

        if (part.hasPageBreakBeginning && isInsideParagraphLoop(part)) {
          addPageBreakAtBeginning(subRendered);
        }

        for (var _i2 = 0, len = subRendered.parts.length; _i2 < len; _i2++) {
          totalValue.push(subRendered.parts[_i2]);
        }

        Array.prototype.push.apply(errors, subRendered.errors);
      }

      var result = options.scopeManager.loopOver(part.value, loopOver, part.inverted, {
        part: part
      }); // if the loop is showing empty content

      if (result === false) {
        if (part.lastParagrapSectPr) {
          if (part.paragraphLoop) {
            return {
              value: "<w:p><w:pPr>".concat(part.lastParagrapSectPr, "</w:pPr></w:p>")
            };
          }

          return {
            value: "</w:t></w:r></w:p><w:p><w:pPr>".concat(part.lastParagrapSectPr, "</w:pPr><w:r><w:t>")
          };
        }

        return {
          value: getPageBreakIfApplies(part) || "",
          errors: errors
        };
      }

      if (heightOffset !== 0) {
        var cy = +getSingleAttribute(this.lastExt.value, "cy");
        this.lastExt.value = setSingleAttribute(this.lastExt.value, "cy", cy + heightOffset);
      }

      return {
        value: options.joinUncorrupt(totalValue, _objectSpread(_objectSpread({}, options), {}, {
          basePart: part
        })),
        errors: errors
      };
    }
  }]);

  return LoopModule;
}();

module.exports = function () {
  return wrapper(new LoopModule());
};