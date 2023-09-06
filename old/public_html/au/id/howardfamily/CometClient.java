package au.id.howardfamily;

import java.awt.HeadlessException;

public abstract class CometClient extends HiddenApplet {
	private static final String ONEVENT = "onevent";
	
	public abstract void startGetEvents();
	
	public abstract void stopGetEvents();

	public CometClient() throws HeadlessException {
		super();
		addParameterInfo(ONEVENT, "String",
		"JS function name to execute on revieving events");
	}

	protected void onEvent(String data) {
		debug(data);
		String function = getParameter(ONEVENT);
		if (function != null) {
			eval(function + "(eval('" + data + "'));");
		}
	}

}
