package org.windyroad;

import netscape.javascript.JSObject;

public class HelloWorld extends HiddenApplet {

	private static final String HELLO_WORLD = "Hello World!";
		
	public String getMsg()
	{
		System.out.println("HelloWorld.getMsg()");
		return HELLO_WORLD;
	}
	
	public void sendMsgUsingEval()
	{
		System.out.println("HelloWorld.sendMsgUsingEval()");
		eval( "alert( '" + HELLO_WORLD + "' );" );
	}
	
	public void sendMsgUsingCall()
	{
		System.out.println("HelloWorld.sendMsgUsingCall()");
		Object[] args = { HELLO_WORLD };
		call("alert", args);
	}
}
