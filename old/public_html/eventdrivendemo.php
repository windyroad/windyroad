<?php
/* 
Copyright (c) 2006, Tom Howard
All rights reserved.
This software may be licensed under the terms of the BSD License
See http://www.opensource.org/licenses/bsd-license.php for details.
*/

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

function getEvents()
{
    global $sajax_response;
    $sajax_response = array( new Error( Error_TIMEOUT ) );
    set_time_limit( 0 ); // no limit

    session_start();
    session_write_close();

    if( !isset( $_SESSION[ 'eq' ] ) )
    {
	return array( new Error( Error_SESSION_EXPIRED ) );
    }

    checkValue('page');
    checkValue('session');
    checkValue('brightness');
    while( $_SESSION[ 'eq' ]->countEvents() == 0 )
    {
	sleep( 1 );
	checkValue('page');
	checkValue('session');
	checkValue('brightness');
    }
    session_start();    $rval = $_SESSION[ 'eq' ]->getEvents();
    session_write_close();
    return $rval;
}


function adjustValue( $type, $amount, $min = NULL, $max = NULL )
{
    $f= @fopen( $type . ".txt", "r+");
    if( !$f )
    {
	session_start();
	$_SESSION[ 'eq' ]->addEvent( new Error( Error_OPEN_FAILED ) );
	session_write_close();
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
	session_start();
	$_SESSION[ 'eq' ]->addEvent( new Error( Error_LOCK_FAILED ) );
	session_write_close();
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
    if( is_scalar( $count ) )
    {
	if( $count != $_SESSION[ $type ] )
	{
	    session_start();
	    if( $type == 'page' )
		$_SESSION[ 'eq' ]->addEvent( new Event( Event_PAGEHIT, $count ) );
	    else if( $type == 'session' )
		$_SESSION[ 'eq' ]->addEvent( new Event( Event_SESSIONHIT, $count ) );
	    else if( $type == 'brightness' )
		$_SESSION[ 'eq' ]->addEvent( new Event( Event_BRIGHTNESS, $count ) );	    
	    $_SESSION[ $type ] = $count;
	    session_write_close();
	}
	return $count;
    }
    else
    {
	session_start();
	$_SESSION[ 'eq' ]->addEvent( $count );
	session_write_close();
    }
}

function darkenPage()
{
    session_start();
    session_write_close();
    adjustValue( 'brightness', -1, 0, 255 );
}

function lightenPage()
{
    session_start();
    session_write_close();
    adjustValue( 'brightness', 1, 0, 255 );
}

require("Sajax.php");
$sajax_debug_mode = 1;

sajax_init();
sajax_export("getEvents", "lightenPage", "darkenPage");

sajax_handle_client_request();

session_start();
if( !isset( $_SESSION[ 'eq' ] ) )
{
    $_SESSION[ 'eq' ] = new EventQueue();
}
session_write_close();


function initValue( $type )
{
    session_start();
    $_SESSION[ $type ] = getValue( $type );
    if( !is_scalar( $_SESSION[ $type ] ) )
	$_SESSION[ $type ] = -1;
    session_write_close();
}

adjustValue('page', 1);
initValue( 'page' );

if( !isset( $_SESSION[ 'session' ] ) )
    adjustValue('session', 1);
initValue( 'session' );

initValue( 'brightness' );

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
	    var error = { "id": parseInt('<?php echo Event_ERROR; ?>'), 
			  "data": { 0: '<?php echo Error_AJAX; ?>',
				    1: status,
				    2: statusText } };
	    handleError( error );
	}

	
    window.onload = function() 
    {
	start( connection );
    }

function getEvents()
{
    x_getEvents(gotEvents);
}

var cont = false;
var count = 0;
function gotEvents( results ) 
{ 
    // handle errors first because they may decide to terminate the connection
    // or reload the page
    handleErrors( results );
    if( cont )
    {
	setTimeout( getEvents, 0 );
	setTimeout( function(){ handleEvents( results ); }, 0 );
    }
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
	// we can ignore timeouts
	break;
    case <?php echo Error_SESSION_EXPIRED; ?>:
	// the session expired.  Don't know how far out of sync the clients
	// page is so we reload
	location.href = "<?php echo "http://" . $_SERVER['HTTP_HOST'] . $_SERVER['PHP_SELF']; ?>";
	stop( connection );
	break;
    case <?php echo Error_AJAX; ?>:
	document.getElementById( 'error' ).innerHTML = "Error: The connection with the server has failed<br/>Status: " + 
	    error[ 'data' ][ 1 ] + "<br/>statusText: " + error[ 'data' ][ 2 ];
	stop( connection );
	break;
    default:
	document.getElementById( 'error' ).innerHTML = "Error: The network connection to te server has failed.<br/>Error ID: " +
	    error[ 'data' ][ 0 ];
	stop( connection );
	break;
    }
}

function clearError()
{
    document.getElementById( 'error' ).innerHTML = "";
}

function handleEvents( results )
{
    if( results === null ) // handle timeout in old version of PHP
	return;
    for( i in results )
    {
	var result = results[ i ];
	switch( result[ 'id' ] )
	{
	case <?php echo Event_ERROR; ?>:
	    handleError( result );
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
	    var back = "rgb( " + br + ", " + br + ", " + br + ")";
	    document.getElementsByTagName( 'body' )[ 0 ].style.background = back;
	    break;
	}	
    }
}

function stop(self)
{
    cont = false; 
    sajax_cancel();
    self.innerHTML = "Connect to Server";
    // we use the href so the status bar reflects what will happen on click
    self.href = 'javascript: start( connection );';
}

function start(self)
{
    if( !cont )
    {
	cont = true; 
	setTimeout( getEvents, 0 );
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

/* ]]> */</script>
<style type="text/css" media="screen">/* <![CDATA[ */
body
{
    font-family: tahoma,verdana,sans-serif;
    background: rgb(<?php $br = $_SESSION[ 'brightness' ]; echo "$br,$br,$br"; ?>);
    color: #00ff00;
}

a
{
    color: #00ff00;
}
/* ]]> */</style>
<title>Event Driven Ajax Demonstration</title>
</head>
<script src="http://www.google-analytics.com/urchin.js" type="text/javascript">
</script>
<script type="text/javascript">
_uacct = "UA-808591-1";
urchinTracker();
</script>
<body>
<h1>Event Driven Ajax Demonstration</h1>
<h2><a href="http://howardfamily.id.au/2006/07/25/event-driven-ajax-part-1-pushing-server-side-events/">Part 1: Pushing Server Side Events</a></h2>

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
<li>Open this page on two computers (in most cases it won't work if you open it twice on the same computer)</li>
<li>Click on 'Lighten Page' or 'Darken Page' links on one of the computers</li>
<li>Notice the 'Page Brightness' change on both computers</li>
</ol>
</p>
<p>Note: A <a href="eventdrivendemo2.php">newer version of this demonstration is available</a></p>
<script type="text/javascript">/* <![CDATA[ */
var connection = document.createElement('a');
document.getElementsByTagName( 'body' )[ 0 ].appendChild( connection );
/* ]]> */</script>
<div id="error"></div>
<div id="page_hit_hook">Page Hits: <?php echo $_SESSION['page']; ?></div>
<div id="session_hit_hook">Sessions Created: <?php echo $_SESSION['session']; ?></div>
<div id="brightness_hook">Page Brightness: <?php echo $_SESSION['brightness']; ?></div>
<p>
<?php 
sajax_link( "darkenPage", "Darken Page", "start( connection );" ); ?> 
<?php sajax_link( "lightenPage", "Lighten Page", "start( connection );" ); ?>
</p>
<script type="text/javascript">/* <![CDATA[ */
var debug = document.createElement('a');
document.getElementsByTagName( 'body' )[ 0 ].appendChild( debug );
debugOff( debug );
/* ]]> */</script>
<pre id="debug_hook" style="border: solid gray 1px; padding: 0.5em;"></pre>
</body>
</html>
