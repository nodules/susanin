module.exports = process.env.ROUTER === 'dist' ? require('../../dist/susanin.min.js').Susanin : require('../..');
