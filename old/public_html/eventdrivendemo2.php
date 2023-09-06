<?php

/* 
Copyright (c) 2006, Tom Howard
All rights reserved.
This software may be licensed under the terms of the BSD License
See http://www.opensource.org/licenses/bsd-license.php for details.
*/

define( "MAX_PAGES", 5 );

function page_id()
{
    if( isset( $_REQUEST[ 'PID'] ) )
    {   
        return $_REQUEST[ 'PID' ];
    }
    else
    {
        $location = "Location: http://" . $_SERVER['HTTP_HOST'] . $_SERVER[ 'REQUEST_URI'];
        if( $_SERVER['QUERY_STRING'] )
            $location .= "&";
        else
            $location .= "?";
        $location .= "PID=" . urlencode( uniqid("PID_") );
        header( $location );
        exit;
    }
}

define( "PAGE_REMOVE_OLD", 0x00 );
define( "PAGE_CHECK_EXISTS", 0x01 );
define( "PAGE_DONT_CREATE", 0x02 );

function page_start( $mode = PAGE_CHECK_EXISTS )
{
    session_start();
    
    if( $mode == PAGE_CHECK_EXISTS )
    {
        global $sajax_response;
        if( !isset( $_SESSION[ 'PAGES' ] ) )
        {
            $sajax_response = array( new Error( Error_SESSION_EXPIRED ) );
            exit;
        }
        else if( !isset( $_SESSION[ 'PAGES' ][ page_id() ] ) )
        {
            if( count( $_SESSION[ 'PAGES' ] ) >= MAX_PAGES )
            {
                $sajax_response = array( new Error( Error_TOO_MANY_PAGES, MAX_PAGES ) );
            }
            else
            {
                $sajax_response = array( new Error( Error_SESSION_EXPIRED ) );
            }
            exit;
        }
    }
    
    if( !isset( $_SESSION[ 'PAGES' ] ) )
    {
        $_SESSION[ 'PAGES' ] = array();
    }
    
    if( $mode != PAGE_DONT_CREATE
        && !isset( $_SESSION[ 'PAGES' ][ page_id() ] ) )
    {
        $_SESSION[ 'PAGES' ][ page_id() ] = array();
    }
    
    // cull old pages
    while( count( $_SESSION[ 'PAGES' ] ) > MAX_PAGES )
    {
        array_shift( $_SESSION[ 'PAGES' ] );
    }
}

function page_write_close()
{   
	session_write_close();
}

if( !function_exists( 'ftok' ) )
{
    function ftok($pathname, $proj_id)
    {
	$st = @stat($pathname);
	if (!$st) return -1;

	$key = sprintf("%u", (($st['ino'] & 0xffff) | (($st['dev'] & 0xff) << 16) | (($proj_id & 0xff) << 24)));
	return $key;
    }
}



// Event IDs 
define( 'Event_INVALID', 0x0000 );
define( 'Event_ERROR', 0x0001 );
define( 'Event_PAGEHIT', 0x0002 );
define( 'Event_SESSIONHIT', 0x0003 );
define( 'Event_BRIGHTNESS', 0x0004 );

class Event
{        	
    var $id  = 0;
    var $data = array();

    function Event( $id )
    {
    	$this->id = $id;
    	$this->data = func_get_args();
    	array_shift( $this->data );
    }
	
    function getID()
    {
    	return $this->id;
    }
	
    function getData()
    {
    	return $this->data;
    }
}

// Error IDs
define( 'Error_INVALID', 0x0000 );
define( 'Error_OPEN_FAILED', 0x0001 );
define( 'Error_LOCK_FAILED', 0x0002 );
define( 'Error_TIMEOUT', 0x0003 );
define( 'Error_AJAX', 0x0004 );
define( 'Error_SESSION_EXPIRED', 0x0005 );
define( 'Error_TOO_MANY_PAGES', 0x0006 );

class Error extends Event
{
    function Error()
    {
    	$this->id = Event_ERROR;
    	$this->data = func_get_args();
    }
}

class EventQueue
{
	var $m_listeners = array();
	var $m_events = array();
	
	function addEvent( &$event )
	{
		if( isset( $this->m_listeners[ $event->getID() ] ) )
		{
			foreach( $this->m_listeners[ $event->getID() ] as $listener )
			{
				$listener->handleEvent( $event );
			}
		}
		array_push( $this->m_events, $event );
	}
	
	function addListener( $id, &$listener )
	{
		if( !isset( $this->m_listeners[ $id ] ) )
			$this->m_listeners[ $id ] = array();
		array_push( $this->m_listeners[ $id ], $listener );
	}

	function countEvents()
	{
	    return count( $this->m_events );
	}
	
	function getEvents()
	{
	    if( $this->countEvents() != 0 )
	    {
    		$items = $this->m_events;
    		$this->m_events = array();
    		return $items;
	    }
	}
}

function checkValues()
{
    page_start();    
    checkValue('page');
    checkValue('session');
    checkValue('brightness');
    page_write_close();
}

function getEvents()
{
    global $sajax_response;
    $sajax_response = array( new Error( Error_TIMEOUT ) );
    set_time_limit( 0 );
         
    checkValues();
    while( $_SESSION[ 'PAGES' ][ page_id() ][ 'eq' ]->countEvents() == 0 )
    {
    	sleep( 1 );       
        checkValues();
    }       
    page_start();
    $rval = $_SESSION[ 'PAGES' ][ page_id() ][ 'eq' ]->getEvents();
    page_write_close();
    return $rval;
}

function adjustValue( $type, $amount, $min = NULL, $max = NULL )
{
    $f= @fopen( $type . ".txt", "r+");
    if( !$f )
    {
        if( isset( $_SESSION[ 'PAGES' ][ page_id() ] ) )
        	$_SESSION[ 'PAGES' ][ page_id() ][ 'eq' ]->addEvent( new Error( Error_OPEN_FAILED ) );
    	return;
    }
    if( flock($f, LOCK_EX ) )
    {
    	$count = fgets( $f ) + $amount;
    	if( !is_null( $min ) )
    	    $count = max( $count, $min );
    	if( !is_null( $max ) )
    	    $count = min( $count, $max );
    	ftruncate($f, 0);
    	fseek( $f, 0 );
    	fwrite($f, $count);
    	fflush( $f );
    	flock($f, LOCK_UN);
    	fclose($f);	
    	return $count;
    }
    else
    {
        if( isset( $_SESSION[ 'PAGES' ][ page_id() ] ) )
        	$_SESSION[ 'PAGES' ][ page_id() ][ 'eq' ]->addEvent( new Error( Error_LOCK_FAILED ) );
    	return;
    }
}

function getValue( $type )
{
    $f=@fopen( $type . ".txt", "r");
    if( !$f )
    {
    	return new Error( Error_OPEN_FAILED );
    }
    if( flock($f, LOCK_SH) )
    {
    	$count = fgets( $f );
    	flock($f, LOCK_UN);
    	fclose($f);
    	return $count;
    }
    else
    {
    	return new Error( Error_LOCK_FAILED );
    }
}

function checkValue( $type )
{
    $count = getValue( $type );
	if( $count != $_SESSION[ 'PAGES' ][ page_id() ][ $type ] )
	{  
	    if( $type == 'page' )
    		$_SESSION[ 'PAGES' ][ page_id() ][ 'eq' ]->addEvent( new Event( Event_PAGEHIT, $count ) );
	    else if( $type == 'session' )
    		$_SESSION[ 'PAGES' ][ page_id() ][ 'eq' ]->addEvent( new Event( Event_SESSIONHIT, $count ) );
	    else if( $type == 'brightness' )
    		$_SESSION[ 'PAGES' ][ page_id() ][ 'eq' ]->addEvent( new Event( Event_BRIGHTNESS, $count ) );	    
        $_SESSION[ 'PAGES' ][ page_id() ][ $type ] = $count;
	}
	return $count;
}

function darkenPage()
{
    page_start( PAGE_DONT_CREATE );
    adjustValue( 'brightness', -1, 0, 255 );
    page_write_close();
}

function lightenPage()
{
    page_start( PAGE_DONT_CREATE );
    adjustValue( 'brightness', 1, 0, 255 );
    page_write_close();
}

require("Sajax.php");
$sajax_debug_mode = 1;

sajax_init();
sajax_export("getEvents", "lightenPage", "darkenPage");

sajax_handle_client_request();

function initValue( $type )
{
    $_SESSION[ 'PAGES' ][ page_id() ][ $type ] = getValue( $type );
    if( !is_scalar( $_SESSION[ 'PAGES' ][ page_id() ][ $type ] ) )
        $_SESSION[ 'PAGES' ][ page_id() ][ $type ] = -1;
}

page_start( PAGE_REMOVE_OLD );
if( !isset( $_SESSION[ 'PAGES' ][ page_id() ][ 'eq' ] ) )
{
    $_SESSION[ 'PAGES' ][ page_id() ][ 'eq' ] = new EventQueue();
}

adjustValue('page', 1);
initValue( 'page' );

if( !isset( $_SESSION[ 'session_counted' ] ) )
{
    $_SESSION[ 'session_counted' ] = true;
    adjustValue('session', 1);    
}    
initValue( 'session' );

initValue( 'brightness' );
page_write_close();

?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.1//EN"
"http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en">
<head>
<meta http-equiv="content-type" content="text/html; charset=utf-8" />
<meta name="description" content="Test page" />
<script type="text/javascript">/* <![CDATA[ */
<?php
	sajax_show_javascript();
?>
	sajax_js_error_handler = function( status, statusText )
	{
	    if( !cont ) // abort was called
	        return;
	    error( connection, "Error: The connection to the server has failed" );
	}

    window.onload = function() 
    {
    }

var cont = false;
var count = 0;

function gotEvents( results ) 
{ 
	sajax_debug("gotEvents();");
    handleErrors( results );
	setTimeout( function(){ handleEvents( results ); }, 0 );
};

function handleErrors( results )
{
    if( results === null ) // handle timeout in old version of PHP
	return;
    for( i in results )
    {
	var result = results[ i ];
	if( result[ 'id' ] == <?php echo Event_ERROR; ?> )
	    handleError( result );
    }
}


function handleError( error )
{
    switch( error[ 'data' ][ 0 ] )
    {
    case <?php echo Error_TIMEOUT; ?>:
    	// we can ignore timeout
    	break;
    case <?php echo Error_SESSION_EXPIRED; ?>:
        // the session expired.  Don't know how far out of sync the clients
        // page is so we reload
        stop( connection );
        location.href = "<?php echo "http://" . $_SERVER['HTTP_HOST'] . $_SERVER['PHP_SELF']; ?>";
        break;
    case <?php echo Error_TOO_MANY_PAGES; ?>:
        err = "Sorry, you have too many pages open (" + error[ 'data' ][ 1 ] + " allowed)";    
        stop( connection, err );
        break;
    default:
    	err = "Error: Something has gone awry on the server.<br/>Error ID: " +
    	    error[ 'data' ][ 0 ];
    	stop( connection, err );
    	break;
    }
}

function clearError()
{
    document.getElementById( 'error' ).innerHTML = "";
}

function handleEvents( results )
{
	sajax_debug("handleEvents();");
    if( results === null ) // handle timeout in old version of PHP
	return;
    for( i in results )
    {
    	var result = results[ i ];
    	switch( result[ 'id' ] )
    	{
    	case <?php echo Event_ERROR; ?>:
            // already handled
    	    break;
    	case <?php echo Event_PAGEHIT; ?>:
    	    document.getElementById( 'page_hit_hook' ).innerHTML = "Page Hits: " + result[ 'data' ][ 0 ];	
    	    break;
    	case <?php echo Event_SESSIONHIT; ?>:
    	    document.getElementById( 'session_hit_hook' ).innerHTML = "Sessions Created: " + result[ 'data' ][ 0 ];	
    	    break;
    	case <?php echo Event_BRIGHTNESS; ?>:
    	    document.getElementById( 'brightness_hook' ).innerHTML = "Page Brightness: " + result[ 'data' ][ 0 ];
    	    var br = result[ 'data' ][ 0 ];
    	    document.getElementsByTagName('body')[ 0 ].style.background = "rgb( " + br + ", " + br + ", " + br + ")";
    	    break;
    	}	
    }
}

function stop(self, err)
{
    cont = false; 
    if( comet_client )
        comet_client.stopGetEvents();
    self.innerHTML = "Connect to Server";
    // we use the href so the status bar reflects what will happen on click
    self.href = 'javascript: start( connection );';
    if( err )
        document.getElementById( 'error' ).innerHTML = err; 
}

function start(self)
{
    if( !cont && comet_client )
    {
		cont = true; 
    	comet_client.startGetEvents();
		self.innerHTML = "Terminate Connection with Server";
		// we use the href so the status bar reflects what will happen on click
		self.href = 'javascript: stop( connection );';
		clearError();
    }
}


function debugOn(self)
{
    sajax_debug_mode = true;
    self.innerHTML = "Turn Debugging Off";
    // we use the href so the status bar reflects what will happen on click
    self.href = 'javascript: debugOff( debug );';
}

function debugOff(self)
{
    sajax_debug_mode = false;
    self.innerHTML = "Turn Debugging On";
    // we use the href so the status bar reflects what will happen on click
    self.href = 'javascript: debugOn( debug );';
}

var comet_client = null;

function cometClientStarted( applet )
{
	comet_client = applet;
    start( connection );
}

function cometClientStopped( applet )
{
    comet_client = null;
    stop( connection );
}

/* ]]> */</script>
<style type="text/css" media="screen">/* <![CDATA[ */
body
{
    font-family: tahoma,verdana,sans-serif;
    background: rgb(<?php $br = $_SESSION[ 'PAGES' ][ page_id() ][ 'brightness' ]; echo "$br,$br,$br"; ?>);
    color: #00ff00;
}

a
{
    color: #00ff00;
}
/* ]]> */</style>
<title>Event Driven Ajax/Comet Demonstration</title>


</head>
<script src="http://www.google-analytics.com/urchin.js" type="text/javascript">
</script>
<script type="text/javascript">
_uacct = "UA-808591-1";
urchinTracker();
</script>
<body>
<h1>Event Driven Ajax/Comet Demonstration</h1>
<h2><a href="http://howardfamily.id.au/2006/09/14/event-driven-ajax-comet-part-2-handling-concurrent-views/">Part 2: Handling Concurrent Views</a></h2>

<script type="text/javascript"><!--
google_ad_client = "pub-6770968883708243";
google_alternate_color = "000000";
google_ad_width = 728;
google_ad_height = 90;
google_ad_format = "728x90_as";
google_ad_type = "text_image";
//2006-10-15: banner
google_ad_channel = "3761855022";
google_color_border = "FFFFFF";
google_color_bg = "000000";
google_color_link = "3BA6E4";
google_color_text = "FFFFFF";
google_color_url = "EAAB02";
//--></script>
<script type="text/javascript"
  src="http://pagead2.googlesyndication.com/pagead/show_ads.js">
</script>


<h3>Instructions</h3>
<p>
<ol>
<li>Open this page in two browser windows (on the same or different computers)</li>
<li>Click on 'Lighten Page' or 'Darken Page' links in one of the windows</li>
<li>Notice the 'Page Brightness' change in both windows</li>
</ol>
</p>
<script type="text/javascript">/* <![CDATA[ */
var connection = document.createElement('a');
connection.href = 'javascript: stop( connection );';
connection.innerHTML = "Connecting to server...";
document.getElementsByTagName( 'body' )[ 0 ].appendChild( connection );
/* ]]> */</script>
<div id="error"></div>
<div id="page_hit_hook">Page Hits: <?php echo $_SESSION[ 'PAGES' ][ page_id() ][ 'page' ]; ?></div>
<div id="page_count">Page Count: <?php echo count( $_SESSION[ 'PAGES' ] ); ?></div>
<div id="session_hit_hook">Sessions Created: <?php echo $_SESSION[ 'PAGES' ][ page_id() ][ 'session' ]; ?></div>
<div id="brightness_hook">Page Brightness: <?php echo $_SESSION[ 'PAGES' ][ page_id() ][ 'brightness' ]; ?></div>
<p>
<?php
 sajax_link( "darkenPage", "Darken Page", "start( connection );" ); 
 ?> 
<?php sajax_link( "lightenPage", "Lighten Page", "start( connection );" ); ?>
</p>
<script type="text/javascript">/* <![CDATA[ */
var debug = document.createElement('a');
document.getElementsByTagName( 'body' )[ 0 ].appendChild( debug );
debugOff( debug );
/* ]]> */</script>
<pre id="debug_hook" style="border: solid gray 1px; padding: 0.5em;"></pre>
<div style="float: left;">
      <!--[if !IE]> Firefox and others will use first object tag -->
      <object id="comet-client"
              classid="java:au/id/howardfamily/HTTPCometClient.class" 
              type="application/x-java-applet"
              style="width: 0; height: 0;">
      <!--<![endif]-->
      <!--[if IE]> 
      <object id="comet-client"
                classid="clsid:8AD9C840-044E-11D1-B3E9-00805F499D93" 
                codebase="http://java.sun.com/update/1.5.0/jinstall-1_5_0-windows-i586.cab"
                style="width: 1px; height: 1px;"> 
          <param name="code" value="au/id/howardfamily/HTTPCometClient" />
      <![endif]-->     
          <param name="id" value="comet-client" />
          <param name="mayscript" value="true" />
          <param name="onstart" value="cometClientStarted" />
          <param name="onstop" value="cometClientStopped" />
          <param name="ondebug" value="sajax_debug" />
          <param name="onevent" value="gotEvents" />
          <param name="eventurl" value="http://<?php echo $_SERVER["HTTP_HOST"] . $_SERVER["REQUEST_URI"]; ?>&amp;rs=getEvents&amp;rst=&amp;rsrnd=1154336872603" />
      </object> 
</div>
</body>
</html>
