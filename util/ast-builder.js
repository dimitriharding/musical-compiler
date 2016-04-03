/**
 * @author Dimitri Harding
 */
'use strict';
var help = require ( './helper.js' )
var log  = console.log;

/**
 * An AstBuilder to generate a parse tree on the file.
 *
 * Methods:
 * 	CreateDoc() creates the json base of the ast
 * 	InsertCategoryNode(string) adds category node to base Ast
 *  InsertTitleNode(string) adds title node to base Ast
 *  insertSentenceNode(string) adds sentence node to category node source
 *  InsertWordNode(string) adds word node to sentence node source
 * 	GetTree() returns the parse tree
 */
var AstBuilder = function ( e ) {
	var self = this;
	var CATNODE = 1;
	var TITNODE = 0;
	var parent, currentSenNode = 0,
		currentCatNode = 0, currentWordNode = 0, currentTitNode = 0, catSet;

	/**
	 * createDoc()
	 * Create Ast root object
	 * @example {"type":"LyricsNode","children":[]}
	 */
	self.createDoc = function () {
		parent = new Doc();
		catSet = false
	}

	/**
	 * insertCategoryNode(string)
	 * Creates a CategoryNode and adds different
	 * as its' child
	 * @example
	 * .... "type":"CategoryNode",
	 *      "children":[
	 *       {
	 *          "type":"ChorusNode",
	 *          "children":[
	 *           {
	 * ....
	 *
	 * @param {String} category name
	 */
	self.insertCategoryNode = function ( catName ) {
		var categoryNode = new CategoryNode();
		var catNode = new classification( catName );

		/**
		 * Check if categoryNode was already
		 * created if not then create one
		 *
		 */
		if ( parent.children.length < 2 ) {
			parent.children.push( categoryNode );
			catSet = true;
		}

		parent.children[ CATNODE ].children.push( catNode );
		currentCatNode = parent.children[ CATNODE ].children.length - 1;
	}

	/**
	 * insertTitleNode(string)
	 * Creates Title node and adds
	 * title value to textNode
	 *
	 * @example {"type":"TitleNode","children":[{"type":"TextNode","value":''}]}
	 * @param {String} Title text
	 */
	self.insertTitleNode = function ( value ) {
		var textNode = new TextNode( value );
		var titleNode = new TitleNode();
		titleNode.children.push( textNode );
		parent.children.push( titleNode );
	}

	/**
	 * insertSentenceNode(string)
	 * Creates Sentnce node and adds
	 * it to the current category node
	 *
	 * @example {"type":"SentenceNode","children":[]}
	 * @param {String} Sentnce text
	 */
	self.insertSentenceNode = function ( value ) {
		var sentenceNode = new SentenceNode();
		parent.children[ CATNODE ].children[ currentCatNode ].children.push( sentenceNode );
		currentSenNode = parent.children[ CATNODE ].children[ currentCatNode ].children.length - 1;
	}

	/**
	 * insertWordNode(string)
	 * Creates Word node and adds
	 * it to the current sentence node or title node
	 *
	 * @example {"type":"WordNode","value": value, "pos": ""}
	 * @param {String} Word text
	 */
	self.insertWordNode = function ( value ) {

		var wordNode = new WordNode( value );
		if(catSet){
			parent.children[ CATNODE ].children[ currentCatNode ].children[ currentSenNode ].children.push( wordNode );
			currentWordNode = parent.children[ CATNODE ].children[ currentCatNode ].children[ currentSenNode ].children.length - 1;
		}else {
			parent.children[TITNODE].children.push(wordNode)
		}
	}

	self.insertPuncNode = function (value) {
		var puncNode = new PuncNode( value );
		parent.children[ CATNODE ].children[ currentCatNode ].children[ currentSenNode ].children[currentWordNode].children.push( puncNode );
	}

	/**
	 * getTree()
	 * Return parse tree
	 * @return {JSON} parent - generated tree
	 */
	self.getTree = function () {
		return parent;
	}

	var Doc = function () {
		return {
			"type": "LyricsNode",
			"children": []
		}
	}

	var TitleNode = function () {
		return {
			"type": "TitleNode",
			"children": []
		}
	}

	var SentenceNode = function () {
		return {
			"type": "SentenceNode",
			"children": []
		}
	}

	var CategoryNode = function () {
		return {
			"type": "CategoryNode",
			"children": []
		}
	}

	var classification = function ( catVal ) {
		if ( 'chorus' === catVal.toLowerCase() ) {
			return {
				"type": "ChorusNode",
				"children": []
			}
		}

		if ( 'verse' === catVal.toLowerCase() ) {
			return {
				"type": "VerseNode",
				"children": []
			}
		}

		if ( 'bridge' === catVal.toLowerCase() ) {
			return {
				"type": "BridgeNode",
				"children": []
			}
		}

		log('\tUnknown Category Labeling : ' + catVal.error)
		log('\tValid Labels:' + ' Chorus|Verse|Bridge'.info);
		process.exit( 1 );
	}

	var TextNode = function ( value ) {
		return {
			"type": "TextNode",
			"value": value,
			"pos": ""
		}
	}

	var WordNode = function ( value ) {
		return {
			"type": "WordNode",
			"value": value,
			"children": [],
			"pos": ""
		}
	}

	var PuncNode = function (value){
		return {
			"type": "PuncNode",
			"value": value,
			"pos": ""
		}
	}

	return self;
};

module.exports = AstBuilder;
