package au.id.howardfamily;

import java.awt.HeadlessException;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.MalformedURLException;
import java.net.URL;

public class HTTPCometClient extends CometClient implements Runnable {
	
	private static final String EVENTURL = "eventurl";
	private URL base = null;
	private Thread thread = null;
	private HttpURLConnection conn = null;
	private boolean kontinue = false;
	
	public HTTPCometClient() throws HeadlessException {
		super();
		addParameterInfo(EVENTURL, "URL", "The URL to get events from");
	}

	public void init()
	{
		super.init();
		try
		{
			this.base = new URL( getParameter(EVENTURL) );
			debug("GetEvents: " + getParameter(EVENTURL) );
		}
		catch( MalformedURLException e )
		{
			String err = "failed: Bad URL: " + e.getMessage();
			debug(err);
		}
	}	

	public void startGetEvents()
	{
		debug( "starting..." );
		this.thread = new Thread( this );
		this.thread.start();
	}
	
	public void stopGetEvents()
	{
		debug("...stopping");
		this.kontinue = false;
	}
	
	public void run()
	{
		debug("...started");
		this.kontinue = true;
		getEvents();
	}

	private void getEvents() {
		while( this.kontinue )
		{
			try
			{
				this.conn = (HttpURLConnection)this.base.openConnection();
				this.conn.connect();
				int code = this.conn.getResponseCode();
				String response_msg = this.conn.getResponseMessage();
				if( code == 200 )
				{
					InputStream stream = this.conn.getInputStream();
					BufferedReader reader = new BufferedReader( new InputStreamReader(stream) );
					String data = "";
					String currLine = reader.readLine();
					if( currLine == null)
					{
						debug("no data");
						continue;
					}
					while(currLine != null){
						data += currLine;
						debug("data: " + currLine);							
				        currLine = reader.readLine();
					}
					data = data.substring(2);
					onEvent(data);
				}
				else
				{
					String err = "Connection failed: http error: " + code + " " + response_msg;
					eval("error( connection, '" + err + "' );");
					debug(err);
					break;
				}
			} 
			catch( IOException e )
			{
				String err = "failed: IO error: " + e.getLocalizedMessage();
				eval("error( connection, '" + err + "');");
				debug(err);
				break;
			}
		}
	}
	
	public void stop()
	{
		super.stop();
		this.stopGetEvents();
		this.thread = null;			
		debug("...stopped");
	}
}
