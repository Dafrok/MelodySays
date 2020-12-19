(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.clipIt = factory());
}(this, (function () { 'use strict';

var excuteCopy = (function ($el, value, options) {
  /* istanbul ignore next */
  $el.addEventListener('copy', function (e) {
    return e.clipboardData.setData(options.contentType || 'text/plain', value);
  });
  var result = document.execCommand('copy');
  document.body.removeChild($el);
  return result;
});

var createInvisibleEl = (function (tag) {
  var $el = document.createElement(tag);
  $el.style.pointerEvents = 'none';
  $el.style.top = '-1000px';
  $el.style.left = '-1000px';
  $el.transform = 'scale(0)';
  $el.style.position = 'absolute';
  document.body.appendChild($el);
  return $el;
});

var copyByContentEditable = (function (value, options) {
  var $el = createInvisibleEl('span');
  $el.innerHTML = value;
  $el.contentEditable = true;

  var range = document.createRange();
  range.selectNodeContents($el);
  var selection = window.getSelection();
  selection.removeAllRanges();
  selection.addRange(range);

  return excuteCopy($el, value, options);
});

var copyByInput = (function (value, options) {
  var $el = createInvisibleEl('textarea');
  $el.setAttribute('readonly', '');

  $el.value = value;
  $el.selectStart = 0;
  $el.selectEnd = $el.value.length;
  $el.select();

  return excuteCopy($el, value, options);
});

var index = (function (value) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  return (
    /* istanbul ignore next */
    copyByInput(value, options) || copyByContentEditable(value, options)
  );
});

return index;

})));