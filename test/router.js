module.exports = process.env.ROUTER === 'dist' ? require('../dist/susanin.js').Susanin : require('../');
