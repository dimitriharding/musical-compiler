/**
 * @author Dimitri Harding
 */
'use strict';

/**
 * <p>
 * 	Implementation of a LinkedList in JavaScript.<br>
 *  Use to generate token stream
 * </p>
 *
 * <b>Methods:</b>
 * <ul>
 * 	<li>Insert(node) adds node to list</li>
 * 	<li>GetNumberOfNodes returns the number of nodes in the list</li>
 * 	<li>GetFirst() returns first node in the list</li>
 *  <li>Show() print all nodes of the list to the console</li>
 *  <li>GetStream() returns JSON stringify stream of tokens</li>
 *  <li>Remove(node) removes node from list</li>
 *  <li>Update(node) updates node</li>
 * </ul>
 */
var LinkedList = function ( e ) {
	var self = this;
	var first, last, head, lookahead, count = 0;

	self.insert = function ( value ) {
		var node = new Node( value );
		if ( first == null ) {
			first = last = node;
		} else {
			var head = first;
			while ( head.next != null ) {
				head = head.next;
			}
			head.next = node;
			last = head.next;
		}

		count++;
	}

	self.getNumberOfNodes = function () {
		return count;
	}


	self.getFirst = function () {
		return first;
	}

	self.show = function () {
		var head = first;
		while ( head != null ) {
			console.log( head.node );
			head = head.next;
		}
	}

	self.getStream = function () {
		var stream = [];
		var temp = first;
		while ( temp != null ) {
			stream.push(JSON.stringify(temp.node,null,' '));
			temp = temp.next;
		}
		//console.log(stream);
		return stream;
	}

	self.remove = function ( value ) {
		var found = false;
		var head = first;
		while ( head != null ) {
			if ( first.node == value ) {
				prev = head = first = first.next;
				found = true;
			} else {
				if ( head.node == value ) {
					found = true;
					prev.next = head.next;
				}
				prev = head;
				head = head.next;
			}
		}

		if ( !found ) {
			console.log( "-->" + node + " not found" );
		}
	}

	self.update = function ( value, newValue ) {
		var head = first;
		while ( head != null ) {
			if ( head.node == value ) {
				head.node = newValue;
			}
			head = head.next;
		}

	}

	var Node = function ( value ) {
		this.node = value;
		var selfNode = this;
		var next = {};


		selfNode.get = function () {
			return selfNode.node;
		}

		selfNode.toString = function () {
			return "Node: " + selfNode.node;
		}

		return selfNode;
	}

	return self;
};

module.exports = LinkedList;
