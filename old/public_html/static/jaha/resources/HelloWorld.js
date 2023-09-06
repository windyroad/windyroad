					  
function HelloWorldApplet(id, params) {
	if( arguments.length ) { 
		this.init(id, "http://windyroad.org/static/jaha/resources",
			 "org.windyroad.jaha.HelloWorld", 
			 null, params ); 
	}
}

HelloWorldApplet.prototype = new org.windyroad.jaha.Applet();
HelloWorldApplet.prototype.constructor = HelloWorldApplet;

HelloWorldApplet.prototype.init = function(id, base, code, archives, params, callback) {
	this.super_init = org.windyroad.jaha.Applet.prototype.init;
	this.super_init(id, base, code, archives, params, callback);
}	
HelloWorldApplet.prototype.onStart = function() {
		var result = document.getElementById('result');
		while( result.childNodes.length > 0 )
			result.removeChild( result.childNodes[ 0 ] );
		var self = this;
		document.getElementById("getMsg").onclick=function() { alert( self.applet.getMsg() ); };
		document.getElementById("getMsg").disabled=false;
		document.getElementById("sendMsgUsingEval").onclick=function() { self.applet.sendMsgUsingEval(); }
		document.getElementById("sendMsgUsingEval").disabled=false;
		document.getElementById("sendMsgUsingCall").onclick=function() { self.applet.sendMsgUsingCall(); }
		document.getElementById("sendMsgUsingCall").disabled=false;
		document.getElementById("sendMsgWithTwoArgsUsingCall").onclick=function() { self.applet.sendMsgWith2ArgsUsingCall(); }
		document.getElementById("sendMsgWithTwoArgsUsingCall").disabled=false;
		document.getElementById("runTests").onclick=function() { self.runTests(); }
		document.getElementById("runTests").disabled=false;
}

HelloWorldApplet.prototype.runTests = function() {
	assertTrue( "Check static String access", this.applet.HELLO_WORLD == "Hello World!" );
	assertTrue( "Check method String return", this.applet.getMsg() == this.applet.HELLO_WORLD );
}

function assertTrue( desc, value ) {
	var row = document.createElement("tr");
	var cell = document.createElement("td");
	cell.appendChild( document.createTextNode(desc ) );
	row.appendChild( cell );
	cell = document.createElement("td");
	cell.appendChild( document.createTextNode(value) );	
	row.appendChild( cell );
	document.getElementById("testResults").appendChild(row);
}

window.onload = function()
{
	var result = document.getElementById('result');
	result.removeChild( result.childNodes[ 0 ] );
	result.appendChild( document.createTextNode( navigator.javaEnabled() ?
					     "Loading..." : 
					     "Sorry, Java must be enabled for this demonstration" ) );
	
	var params = new Array();
	var jaha = new HelloWorldApplet( "test", params );
}

function testFunc2Args( arg1, arg2 ) {
	alert( arg1 + ", " + arg2 );
}
