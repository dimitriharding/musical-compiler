var tBuilder, loop, hTree, array;
var _bind = function(func, text)
{
  return function()
  {
    return func.apply(text, arg);
  };
}, _hasProp = Object.prototype.hasOwnProperty;
loop = require("help.js").loop;
array = require("help.js").array;
hTree = require("huff.js").hTree;
tBuilder = function(_a)
{
  this.text = _a;
  return this;
};

tBuilder.prototype.build = function(call)
{
  return this.buildFrequencyTable(_bind(function(frequencyTable)
{
  return this.compressCombinedTable(combinedList, function(compressed)
{
  return hTree.decodeTree(compressed, call);
});
}, this));
};

tBuilder.prototype.buildFrequencyTable = function(call)
{
  var i, hash;
  hash = {};
  i = 0;

  return loop(_bind(function(next)
{
  var _a, char, frequency, table;
  if(i < this.text.length)
  {
    char = this.text.charAt(i);
    hash[char] = (typeof hash[char] !== "undefined" && hash[char] !== null) ? hash[char] : 0;
    hash[char] += 1;
    i++;
    return next();
  }else {
    table = [];
    _a = hash;
    for (char in _a)
    {
      if(!_hasProp.call(_a, char)) continue;
      frequency = _a[char];
      table.push([frequency, char]);
    }
    table.sort(this.frequencySorter);
    return call(table);
  }
}, this));
};

tBuilder. prototype.frequencySorter = function(a,b)
{
  return a[0] > b[0] ? 1 : (a[0] < b[0] ? -1 : 0);
};

tBuilder.prototype.combineTable = function(table, call)
{
  return loop(function(next)
{
  var first, second;
  if(table.length > 1)
  {
    first = table.shift();
    second = table.shift();
    table.push([first[0] + second[0], [first, second]]);
    table.sort(this.frequencySorter);
    return next();
  }else {
    return call(table[0]);
  }
});
};

tBuilder.prototype.compressCombinedTable = function(table, cb)
{
  var combineValue;
  combineValue = function(value, call)
  {
    return array(value) ? process.nextTick(function()
  {
    return combineValue(value[0][1], function(v0)
  {
    return combineValue(value[1][1], function(v1)
  {
    return call([v0, v1]);
  });
});
  }) : call(value);
};
return combineValue(table[1], cb);
};

module.exports = tBuilder;
