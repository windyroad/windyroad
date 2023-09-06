package au.id.howardfamily;

import java.applet.Applet;
import java.awt.Graphics;
import java.awt.HeadlessException;
import java.util.ArrayList;

import netscape.javascript.JSException;
import netscape.javascript.JSObject;

public class HiddenApplet extends Applet {
	private static final String ONDEBUG = "ondebug";

	private static final String ONDESTROY = "ondestroy";

	private static final String ONSTOP = "onstop";

	private static final String ONSTART = "onstart";

	private static final String ONINIT = "oninit";

	private ArrayList m_paramter_info = new ArrayList();

	public HiddenApplet() throws HeadlessException {
		super();
		addParameterInfo("id", "String", "the (X)HTML element ID of the applet");
		addParameterInfo(ONINIT, "String",
				"JS function name to execute when the applet is inited");
		addParameterInfo(ONSTART, "String",
				"JS function name to execute when the applet is started");
		addParameterInfo(ONSTOP, "String",
				"JS function name to execute when the applet is stopped");
		addParameterInfo(ONDESTROY, "String",
				"JS function name to execute when the applet is destroyed");
		addParameterInfo(ONDEBUG, "String",
				"JS function name to execute for debug output");
	}

	public void init() {
		debug("HiddenApplet.init()");
		callJSCallback(ONINIT);
	}

	public void start() {
		debug("HiddenApplet.start()");
		hideApplet();
		callJSCallback(ONSTART);
	}

	public void stop() {
		debug("HiddenApplet.stop()");
		callJSCallback(ONSTOP);
	}

	public void destroy() {
		debug("HiddenApplet.destroy()");
		callJSCallback(ONDESTROY);
	}

	public String[][] getParameterInfo() {
		return (String[][]) m_paramter_info.toArray();
	}

	protected void debug(String msg)
	{
		System.out.println(msg);
		try
		{
			String ondebug = getParameter( ONDEBUG );
			if( ondebug != null )
			{
				Object[] args = { msg };
				JSObject.getWindow(this).call(ondebug, args );
			}
		}
		catch( JSException e )
		{
			System.err.println("error: " + e.getMessage());
		}
		
	}

	protected void eval(String str)
	{
		try
		{
			JSObject.getWindow(this).eval(str);
		}
		catch( JSException e )
		{
			debug("Error evaluating '" + str + "': " + e.getMessage());
		}
	}

	protected void call(String function, Object[] args)
	{
		try
		{
			JSObject.getWindow(this).call( function, args);
		}
		catch( JSException e )
		{
			debug("Error calling '" + function + "': " + e.getMessage());
		}
	}

	
	protected void addParameterInfo(String name, String type, String description) {
		String[] info = { name, type, description };
		m_paramter_info.add(info);
	}
	
	private void callJSCallback(String callback_type) {
		String function = getParameter(callback_type);
		if (function != null) {
			Object[] args = { this };
			debug("calling " + callback_type + ": " + function);
			call(function, args);
		}
	}
	
	private void hideApplet() {
		String id = getParameter("id");
		if (id != null) {
			JSObject.getWindow(this).eval("var applet = document.getElementById( '" + id + "' );"
										+ "if( applet ) { applet.style.width='0'; applet.style.height='0'; }");
		}
		this.resize(0, 0);
	}
	
}
	