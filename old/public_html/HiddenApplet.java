

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
		debug("Hidde