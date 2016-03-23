// A require context allows you to require an expression that
// gets resolved to multiple files. The first parameter specifies
// a top level directory, and the third parameter is a regular
// expression used to match files. The second parameter is a
// boolean flag that signifies whether to search subdirectories.
var context = require.context('./src/', true, /.+\.spec\.jsx?$/);
context.keys().forEach(context);

module.exports = context;
