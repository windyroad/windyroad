var my_applet = null;
var result = document.getElementById('result');
result.removeChild( result.childNodes[ 0 ] );
result.appendChild( document.createTextNode( navigator.javaEnabled() ?
											 "Loading" : 
											 "Sorry, Java must be enabled for this demonstration" ) );
function updateResult( value )
{
	result.appendChild( 
		document.createTextNode( value + " (via applet.sendMsgUsingCall())" ) );
	result.appendChild( document.createElement( "br" ) );
}

function appletLoaded( applet )
{
	my_applet = applet;
	while( result.childNodes.length > 0 )
		result.removeChild( result.childNodes[ 0 ] );
	try
	{
		result.appendChild( 
			document.createTextNode( applet.getMsg() + " (via applet.getMsg())" ) );
		result.appendChild( document.createElement( "br" ) );
		applet.sendMsgUsingEval( "result" );
		applet.sendMsgUsingCall( "updateResult" );
	}
	catch( e )
	{
		result.appendChild( 
			document.createTextNode( "An error occured whilst trying to communicate with the applet: ") );
		var pre = document.createElement('pre');
	}
}