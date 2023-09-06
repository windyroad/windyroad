package au.id.howardfamily;

import netscape.javascript.JSObject;

public class HelloWorld extends HiddenApplet {

	private static final String HELLO_WORLD = "Hello World!";
		
	public String getMsg()
	{
		System.out.println("HelloWorld.getMsg()");
		return HELLO_WORLD;
	}
	
	public void sendMsgUsingEval( String id )
	{
		System.out.println("HelloWorld.sendMsgUsingEval()");
		JSObject.getWindow(this).eval( "document.getElementById( '" + id + "' ).appendChild( document.createTextNode( '" 
				+ HELLO_WORLD + " (via applet.sendMsgUsingEval())' ) );" );
		JSObject.getWindow(this).eval( "document.getElementById( '" + id + "' ).appendChild( "
				+ "document.createElement( 'br' ) );" );
	}
	
	public void sendMsgUsingCall( String method )
	{
		System.out.println("HelloWorld.sendMsgUsingCall()");
		Object[] args = { HELLO_WORLD };
		JSObject.getWindow(this).call(method, args);
	}
}
