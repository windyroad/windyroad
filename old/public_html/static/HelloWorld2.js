var result = document.getElementById('result');
result.removeChild( result.childNodes[ 0 ] );
result.appendChild( document.createTextNode( navigator.javaEnabled() ?
					     "Loading" : 
					     "Sorry, Java must be enabled for this demonstration" ) );
					  
function HelloWorldApplet( id, base, code, params )
{
	this.inherits_from = HiddenApplet;
	this.inherits_from( id, base, code, params );
	
	this.loaded_super = this.loaded;
	this.loaded = function( applet )
	{
		this.loaded_super( applet );
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
	}
	
}

window.onload = function()
{
	var params = new Array();
	var applet = new HelloWorldApplet( "test", "http://howardfamily.id.au/static", "au/id/howardfamily/HelloWorld", params );
	applet.load();
}