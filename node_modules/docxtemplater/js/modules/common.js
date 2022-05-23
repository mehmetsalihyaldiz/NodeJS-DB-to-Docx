"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }

var wrapper = require("../module-wrapper.js");

var filetypes = require("../filetypes.js");

var coreContentType = "application/vnd.openxmlformats-package.core-properties+xml";
var appContentType = "application/vnd.openxmlformats-officedocument.extended-properties+xml";
var customContentType = "application/vnd.openxmlformats-officedocument.custom-properties+xml";
var settingsContentType = "application/vnd.openxmlformats-officedocument.wordprocessingml.settings+xml";
var commonContentTypes = [settingsContentType, coreContentType, appContentType, customContentType];

var Common = /*#__PURE__*/function () {
  function Common() {
    _classCallCheck(this, Common);

    this.name = "Common";
  }

  _createClass(Common, [{
    key: "getFileType",
    value: function getFileType(_ref) {
      var doc = _ref.doc;
      var invertedContentTypes = doc.invertedContentTypes;

      if (!invertedContentTypes) {
        return;
      }

      var keys = Object.keys(filetypes);
      var ftCandidate;

      for (var i = 0, len = keys.length; i < len; i++) {
        var contentTypes = filetypes[keys[i]];

        for (var j = 0, len2 = contentTypes.length; j < len2; j++) {
          var ct = contentTypes[j];

          if (invertedContentTypes[ct]) {
            ftCandidate = keys[i];
            Array.prototype.push.apply(doc.targets, invertedContentTypes[ct]);
          }
        }
      }

      for (var _j = 0, _len = commonContentTypes.length; _j < _len; _j++) {
        var _ct = commonContentTypes[_j];

        if (invertedContentTypes[_ct]) {
          Array.prototype.push.apply(doc.targets, invertedContentTypes[_ct]);
        }
      }

      return ftCandidate;
    }
  }]);

  return Common;
}();

module.exports = function () {
  return wrapper(new Common());
};