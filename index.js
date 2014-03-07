'use strict';

var debug = require('debug')('setHeader');

/**
 * This code mimics the internals of the setHeader methods that is found in the
 * _http_outgoing.js file which node uses as response object. The only big
 * difference is that we don't throw and crash your application and ensure that
 * the headers you set using this function CANNOT be removed.
 *
 * @param {Response} res The HTTP Outgoing response instance.
 * @param {String} name The header name.
 * @param {String} value The value of the header.
 * @returns {Boolean} The header was set.
 * @api public
 */
module.exports = function setHeader(res, name, value) {
  if (!res || !name || !value || res._header) return false;

  res.setHeader(name, value);

  //
  // Internally, the `res.setHeader` stores the lowercase name and it's value in
  // a private `_headers` object. We're going to override the value that got set
  // using the Object.defineProperty so nobody can set the same header again.
  //
  Object.defineProperty(res._headers, name.toLowerCase(), {
    enumerable: true,

    //
    // Return the value that got set using our `setHeader` method.
    //
    get: function get() {
      return value;
    },

    //
    // Log an override attempt on our protected header.
    //
    set: function set(val) {
      debug('attempt to override header %s:%s with %s', name, value, val);
      return value;
    }
  });

  return true;
};
