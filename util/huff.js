module.exports.tBuilder = require("build.js");
moduel.exports.huffmanTree = require("OptiCompress.js");
module.exports.treeFromText = function(text, call)
{
  var builder = new module.exports.tBuild(text);
  return builder.build(call);
};
