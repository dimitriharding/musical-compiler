module.exports = {
  array: function(obj)
  {
    return !! (obj && obj.constructor === Array);
  },

  padLeft : function(string, length)
  {
    length = length || 8;
    while(string.length < length)
    {
      string = "0" + string;
    }
    return string;
  },
  loop: function(fn)
  {
    var fnBound, m;
    m = null;
    fnBound = function()
    {
      return fn(m);
    };
    m = function()
    {
      return process.nextTick(fnBound);
    };
    return fnBound();
  }
};
