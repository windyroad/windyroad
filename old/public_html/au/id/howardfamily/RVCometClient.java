package au.id.howardfamily;

import java.awt.HeadlessException;

import com.tibco.tibrv.Tibrv;
import com.tibco.tibrv.TibrvDispatchable;
import com.tibco.tibrv.TibrvDispatcher;
import com.tibco.tibrv.TibrvException;
import com.tibco.tibrv.TibrvListener;
import com.tibco.tibrv.TibrvMsg;
import com.tibco.tibrv.TibrvMsgCallback;
import com.tibco.tibrv.TibrvMsgField;
import com.tibco.tibrv.TibrvRvaTransport;

public class RVCometClient extends CometClient implements TibrvMsgCallback {

	private static final String COMET_SUBJECT = "comet";
	private TibrvDispatcher dispatcher = null;

	public RVCometClient() throws HeadlessException {
		super();
		// TODO Auto-generated constructor stub
	}

	public void startGetEvents() {
		// TODO Auto-generated method stub
		try
		{
			Tibrv.open(Tibrv.IMPL_JAVA);
			TibrvRvaTransport transport = new TibrvRvaTransport( "localhost", 7600 );
			new TibrvListener(Tibrv.defaultQueue(), this, transport, COMET_SUBJECT, null);
			debug("Listening on: "+ COMET_SUBJECT);
			debug( "starting..." );
			this.dispatcher = new TibrvDispatcher( Tibrv.defaultQueue() );
		}
		catch( TibrvException e )
		{
			debug( "error: could not initialise client: " + e.getMessage() );
		}
	}

	public void stopGetEvents() {
		debug("...stopping");
		this.dispatcher.interrupt();
	}
	
	
	public void onMsg(TibrvListener listener, TibrvMsg msg )
	{
		debug("got msg: " + msg.toString() );
		try
		{
			TibrvMsgField field = msg.getField("DATA");
			debug("got field: " + (String)field.data );
			onEvent("var res = " + (String)field.data + "; res;");
		}
		catch( TibrvException e )
		{
			debug("error: could not extract event field: " + e.getMessage() ); 
		}
	}
}
