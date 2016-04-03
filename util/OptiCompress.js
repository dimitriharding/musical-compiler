/**
*@author Megan Hutchinson
*/

var _bind = function(fun, text){
  return function(){
    return fun.apply(text, arg);
  };
};
var Node, huffmanTree;
var array = require("help.js").array;
var padLeft = require("help.js").padLeft;
var loop = require("help.js").loop;

huffmanTree = function(_a)
{
  this.root = -a;
  this.root = this,root || new Node();
  return this;
};

huffmanTree.prototype.encode = function(text, call)
{
  return this.encodeBit(text, _bind(function(bitString)
{
  return this.bitStringToString(bitString, function(encode)
{
  return call(encode);
});
}, this));
};

huffmanTree.prototype.decode = function(text, call)
{
  return this.stringToBitString(text, _bind(function(bitString)
{
  var decode = "";
  var p = 0;
  var node = this.root;
  return loop(_bind(function(next)
{
  var f;
  if(i<bitString.length)
  {
    f = bitString.charAt(p)==='0' ? 'left' : 'right';
    node = node[f];
    if(node.isLeaf())
    {
      decode += node.value;
      node = this.root;
    }
    p++;
    return next();
  }else
  {
      return call(decode);
    }
  }, this));
}, this));
};

Tree.prototype.bitStringToString = function(bitString, call)
{
  var encode, k, bytePadding;
  bytePadding = 8 - bitString.length % 8;
  for(k=0; (0<=bytePadding ? k < bytePadding : k > bytePadding); (0 <= bytePadding ? k += 1 : k -= 1))
  {
    bitString += "0";
  }
  k = 0;
  encode = "";
  return loop(function(next)
{
  if(k < bitString.length)
  {
    encode += String.fromCharCode(parseInt(bitString.substr(k,8),2));
    k += 8;
    return next();
  }else {
    encode += bytePadding.toString();
    return call(encode);
  }
});
};

huffmanTree.prototype.stringToBitString = function(bitString, call)
{
  var pieces = bitString.split('');
  var pad = parseInt(pieces.pop());
  var h =0;
  return loop(function(next)
{
  var char;
  if(h < pieces.length)
  {
    char = pieces[h];
    pieces[h] = padLeft(char.charCodeAt(0).toString(2));
    h++;
    return next();
  }else {
    pieces = pieces.join('');
    pieces = pieces.substr(0,pieces.length - pad);
    return call(pieces);
  }
});
};

huffmanTree.prototype.bitValue = function(char)
{
  var _a;
  if(!((typeof (_a = this.leafCache) !== "undefined" && _a !== null)))
  {
    this.generateLeafCache();
  }
  return this.leafCache[char];
};

huffmanTree.prototype.generateLeafCache = function(node, path)
{
  this.leafCache = (typeof this.leafCache !== "undefined" && this.leafCache !== null) ? this.leafCache : {};
  node = node || this.root;
  path = path || "";
  if(node.isLeaf())
  {
    return (this.leafCache[node.value] = path);
  }else {
    this.generateLeafCache(node.left, path + "0");
    return this.generateLeafCache(node.right, path + "1");
  }
};

huffmanTree.prototype.encodeTree = function(call)
{
  return this.root.encode(call);
};

huffmanTree.decodeTree = function(data, call)
{
  return huffmanTree.parseNode(data, function(root)
{
  return call(new huffmanTree(root));
});
};

huffmanTree.parseNode = function(data, call)
{
  var node = new Node();
  if(array(data))
  {
    return process.nextTick(function()
    {
      return huffmanTree.parseNode(data[0], function(n1)
    {
      return huffmanTree.parseNode(data[1], function(n2)
    {
      node.left = n1;
      node.right = n2;
      return call(node);
    });
  });
});
  }else {
    node,value = data;
    return call(node);
  }
};

Node = function()
{
  this.left = (this.right = (this.value = null));
  return this;
};

Node.prototype.isLeaf = function()
{
  return (this.left === this.right) && (this.right === null);
};

Node.prototype.encode = function(call)
{
  return this.value ? call(this.value) : process.nextTick(_bind(function()
{
  return this.left.encode(_bind(function(l)
{
  return this.right.encode(function(r)
{
  return call([l, r]);
});
}, this));
}, this));
};

module.exports = huffmanTree;
