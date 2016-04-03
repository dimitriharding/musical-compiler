/**
 * Implementation of a stack in JavaScript.
 *
 * Stack: Last in, first out data sctructure.
 *
 * Methods:
 * 	Push(n) adds n to the top of the stack
 * 	Pop() removes the top item on the stack
 * 	Peek() returns the top item on the stack
 */
function Stack() {
	this._size = 0;
	this._storage = {};
}

Stack.prototype.push = function ( data ) {
	var size = ++this._size;
	this._storage[ size ] = data;
};

Stack.prototype.pop = function () {
	var size = this._size,
		deletedData;

	if ( size ) {
		deletedData = this._storage[ size ];

		delete this._storage[ size ];
		this._size--;

		return deletedData;
	}
};

/**
 * Helps the caller determine if they have an empty stack
 */
Stack.prototype.isEmpty = function () {
	return ( this._size === 0 );
}

/**
 * Allows the caller to see the top of the stack
 * 
 */
Stack.prototype.peek = function () {
	return this._storage[ this._size ]
}

module.exports = Stack;
