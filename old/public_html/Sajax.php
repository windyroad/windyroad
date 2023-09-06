<?php	

/* 
Orginal Code:
contributed and copyighted by Thomas Lackner and ModernMethod
(http://www.modernmethod.com/). Licensed under the BSD Licnses.

Modifications:
Copyright (c) 2006, Tom Howard
All rights reserved.
This software may be licensed under the terms of the BSD License
See http://www.opensource.org/licenses/bsd-license.php for details.
*/



if (!isset($SAJAX_INCLUDED)) {

	/*  
	 * GLOBALS AND DEFAULTS
	 *
	 */ 
	$GLOBALS['sajax_version'] = '0.12e';	
	$GLOBALS['sajax_debug_mode'] = 0;
	$GLOBALS['sajax_export_list'] = array();
	$GLOBALS['sajax_request_type'] = 'GET';
	$GLOBALS['sajax_remote_uri'] = '';
	$GLOBALS['sajax_failure_redirect'] = '';
	$GLOBALS['sajax_error_handler'] = null;
	$GLOBALS['sajax_js_error_handler'] = null;
	$GLOBALS['sajax_response'] = null;
	
	/*
	 * CODE
	 *
	 */ 
	 
	//
	// Initialize the Sajax library.
	//
	function sajax_init() {
	}
	
	//
		// Helper function to return the script's own URI. 
	// 
	function sajax_get_my_uri() {
		return $_SERVER["REQUEST_URI"];
	}
	$sajax_remote_uri = sajax_get_my_uri();
	
	//
	// Helper function to return an eval()-usable representation
	// of an object in JavaScript.
	// 
	function sajax_get_js_repr($value) {
		$type = gettype($value);
		
		if ($type == "boolean") {
			return ($value) ? "Boolean(true)" : "Boolean(false)";
		} 
		elseif ($type == "integer") {
			return "parseInt($value)";
		} 
		elseif ($type == "double") {
			return "parseFloat($value)";
		} 
		elseif ($type == "array" || $type == "object" ) {
			//
			// XXX Arrays with non-numeric indices are not
			// permitted according to ECMAScript, yet everyone
			// uses them.. We'll use an object.
			// 
			$s = "{ ";
			if ($type == "object") {
				$value = get_object_vars($value);
			} 
			foreach ($value as $k=>$v) {
				$esc_key = sajax_esc($k);
				if (is_numeric($k)) 
					$s .= "$k: " . sajax_get_js_repr($v) . ", ";
				else
					$s .= "\"$esc_key\": " . sajax_get_js_repr($v) . ", ";
			}
			if (count($value))
				$s = substr($s, 0, -2);
			return $s . " }";
		} 
		else {
			$esc_val = sajax_esc($value);
			$s = "\"$esc_val\"";
			return $s;
		}
	}



	$sajax_response = null;    
    
	function sajax_send_response()
	{
	    global $sajax_response;
	    if( !is_null( $sajax_response ) )
		echo "+:var res = " . trim(sajax_get_js_repr($sajax_response)) . "; res;";
	}

	function sajax_handle_client_request() {
		global $sajax_export_list;
		
		$mode = "";
		
		if (! empty($_GET["rs"])) 
			$mode = "get";
		
		if (!empty($_POST["rs"]))
			$mode = "post";
			
		if (empty($mode)) 
			return;

		$target = "";
		
		if ($mode == "get") {
			// Bust cache in the head
			header ("Expires: Mon, 26 Jul 1997 05:00:00 GMT");    // Date in the past
			header ("Last-Modified: " . gmdate("D, d M Y H:i:s") . " GMT");
			// always modified
			header ("Cache-Control: no-cache, must-revalidate");  // HTTP/1.1
			header ("Pragma: no-cache");                          // HTTP/1.0
			$func_name = $_GET["rs"];
			if (! empty($_GET["rsargs"])) 
				$args = $_GET["rsargs"];
			else
				$args = array();
		}
		else {
			$func_name = $_POST["rs"];
			if (! empty($_POST["rsargs"])) 
				$args = $_POST["rsargs"];
			else
				$args = array();
		}
		
		if (! in_array($func_name, $sajax_export_list))
			echo "-:$func_name not callable";
		else {
		    error_reporting(0);
			if( is_callable( $GLOBALS[ 'sajax_error_handler'] ) )
			    set_error_handler( $GLOBALS[ 'sajax_error_handler'] );
		    register_shutdown_function( 'sajax_send_response' ); 
			$result = call_user_func_array($func_name, $args);
			if( isset( $_REQUEST[ 'non-js' ] ) )
			{
			    $host  = $_SERVER['HTTP_HOST'];
			    $uri   = $_SERVER['PHP_SELF'];
			    header("Location: http://$host$uri");
			}	
			else
			{
			    global $sajax_response;
			    $sajax_response = $result;
			}
		}
		exit;
	}
	
	function sajax_get_common_js() {
		global $sajax_debug_mode;
		global $sajax_request_type;
		global $sajax_remote_uri;
		global $sajax_failure_redirect;
		global $sajax_js_error_handler;
		
		$t = strtoupper($sajax_request_type);
		if ($t != "" && $t != "GET" && $t != "POST") 
			return "// Invalid type: $t.. \n\n";
		
		ob_start();
		?>
		
		// remote scripting library
		// (c) copyright 2005 modernmethod, inc
		var sajax_debug_mode = <?php echo $sajax_debug_mode ? "true" : "false"; ?>;
		var sajax_request_type = "<?php echo $t; ?>";
		var sajax_target_id = "";
		var sajax_failure_redirect = "<?php echo $sajax_failure_redirect; ?>";
		var sajax_js_error_handler = "<?php echo $sajax_js_error_handler; ?>";
		var PID = "<?php echo isset( $GLOBALS[ 'PID' ] ) ? $GLOBALS[ 'PID' ]: ""; ?>";

		function sajax_debug(text) {
			if (sajax_debug_mode)
			{
			    var debug_hook = document.getElementById( 'debug_hook' );
			    if( debug_hook )
			    {
				var currentTime = new Date();
				var hours = currentTime.getHours();
				if (hours < 10) 
					hours = "0" + hours; 
				var minutes = currentTime.getMinutes();
				if (minutes < 10)
				    minutes = "0" + minutes;
				var seconds = currentTime.getSeconds();
				if (seconds < 10)
				    seconds = "0" + seconds;
				var time = "[" + hours + ":" + minutes + ":" + seconds + "]";
				
				function prependChild( ref, node )
				{
				    if( ref.firstChild )
					ref.insertBefore( node, ref.firstChild );
				    else
					ref.appendChild( node );
				}
				prependChild( debug_hook, document.createTextNode( time + ": " + text + "\r\n" ) );
			    }
			    else
			    {
				alert(text);
			    }
			}
		}
		
 		function sajax_init_object() {
 			sajax_debug("sajax_init_object() called..")
 			
 			var A;
 			
 			var msxmlhttp = new Array(
				'Msxml2.XMLHTTP.5.0',
				'Msxml2.XMLHTTP.4.0',
				'Msxml2.XMLHTTP.3.0',
				'Msxml2.XMLHTTP',
				'Microsoft.XMLHTTP');
			for (var i = 0; i < msxmlhttp.length; i++) {
				try {
					A = new ActiveXObject(msxmlhttp[i]);
				} catch (e) {
					A = null;
				}
			}
 			
			if(!A && typeof XMLHttpRequest != "undefined")
				A = new XMLHttpRequest();
			if (!A)
				sajax_debug("Could not create connection object.");
			return A;
		}
		
		var sajax_requests = new Array();
		
		function sajax_cancel() {
			for (var i = 0; i < sajax_requests.length; i++) 
				sajax_requests[i].abort();
		}
		
		function sajax_do_call(func_name, args) {
			var i, x, n;
			var uri;
			var post_data;
			var target_id;
			
			sajax_debug("in sajax_do_call().." + sajax_request_type + "/" + sajax_target_id);
			target_id = sajax_target_id;
			if (typeof(sajax_request_type) == "undefined" || sajax_request_type == "") 
				sajax_request_type = "GET";
			
			uri = "<?php echo $sajax_remote_uri; ?>";
			if (sajax_request_type == "GET") {
			
				if (uri.indexOf("?") == -1) 
					uri += "?rs=" + escape(func_name);
				else
					uri += "&rs=" + escape(func_name);
				uri += "&rst=" + escape(sajax_target_id);
				uri += "&rsrnd=" + new Date().getTime();
				
				for (i = 0; i < args.length-1; i++) 
					uri += "&rsargs[]=" + escape(args[i]);

				post_data = null;
			} 
			else if (sajax_request_type == "POST") {
				post_data = "rs=" + escape(func_name);
				post_data += "&rst=" + escape(sajax_target_id);
				post_data += "&rsrnd=" + new Date().getTime();
				
				for (i = 0; i < args.length-1; i++) 
					post_data = post_data + "&rsargs[]=" + escape(args[i]);
			}
			else {
				alert("Illegal request type: " + sajax_request_type);
			}
			
			x = sajax_init_object();
			if (x == null) {
				if (sajax_failure_redirect != "") {
					location.href = sajax_failure_redirect;
					return false;
				} else {
					sajax_debug("NULL sajax object for user agent:\n" + navigator.userAgent);
					return false;
				}
			} else {
				x.open(sajax_request_type, uri, true);
				// window.open(uri);
				
				sajax_requests[sajax_requests.length] = x;
				
				if (sajax_request_type == "POST") {
					x.setRequestHeader("Method", "POST " + uri + " HTTP/1.1");
					x.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
				}
			
				x.onreadystatechange = function() {
					sajax_debug("readyState = " + x.readyState );
					if (x.readyState != 4)
						return;
					try
					{
					    sajax_debug("status = " + x.status );
					    try
					    {
						    sajax_debug("statusText = " + x.statusText ); 
						    if( x.status != 200 )  
						    {
							/* in IE if the server goes down, the status code is 12029 and
							   the statusText is "Unknown" */
							if( sajax_js_error_handler )
							    sajax_js_error_handler( x.status, x.statusText );
							return;
						    }
						}
						catch( e )
						{
					    	sajax_debug("statusText = exception: " + e.message );
							if( sajax_js_error_handler )
							    sajax_js_error_handler( x.status, "Unknown" );
							return;
						}
					}
					catch(e)
					{
					    sajax_debug("status = exception: " + e.message );
					    try
					    {
					    	sajax_debug("statusText = " + x.statusText ); 
					    }
					    catch( e2 )
					    {
					    	sajax_debug("statusText = exception: " + e2.message );
					    }
					    /* In firefox if connection is terminated (i.e. network disconnect
					       or server goes down) then status and statusText are unavailable */
					    if( sajax_js_error_handler )
						sajax_js_error_handler( "None", "Unknown" );
					    return;
					}
					
					sajax_debug("received: " + x.responseText);

					var status;
					var data;
					var txt = x.responseText.replace(/^\s*|\s*$/g,"");
					status = txt.charAt(0);
					data = txt.substring(2);

					if (status == "-") 
						alert("Error: " + data);
					else {
						if (target_id != "") 
							document.getElementById(target_id).innerHTML = eval(data);
						else {
							try {
								var callback;
								var extra_data = false;
								if (typeof args[args.length-1] == "object") {
									callback = args[args.length-1].callback;
									extra_data = args[args.length-1].extra_data;
								} else {
									callback = args[args.length-1];
								}
								if( callback )
								    callback(eval(data), extra_data);
							} catch (e) {
								sajax_debug("Caught error " + e + ": Could not eval " + data );
							}
						}
					}
				}
			}
			
			sajax_debug(func_name + " uri = " + uri + "/post = " + post_data);
			x.send(post_data);
			sajax_debug(func_name + " waiting..");
			delete x;
			return true;
		}
		
		<?php
		$html = ob_get_contents();
		ob_end_clean();
		return $html;
	}
	
	function sajax_show_common_js() {
		echo sajax_get_common_js();
	}
	
	// javascript escape a value
	function sajax_esc($val)
	{
		$val = str_replace("\\", "\\\\", $val);
		$val = str_replace("\r", "\\r", $val);
		$val = str_replace("\n", "\\n", $val);
		$val = str_replace("'", "\\'", $val);
		return str_replace('"', '\\"', $val);
	}

	function sajax_get_one_stub($func_name) {
		ob_start();	
		?>
		
		// wrapper for <?php echo $func_name; ?>
		
		function x_<?php echo $func_name; ?>() {
			sajax_do_call("<?php echo $func_name; ?>",
				x_<?php echo $func_name; ?>.arguments);
		}
		
		<?php
		$html = ob_get_contents();
		ob_end_clean();
		return $html;
	}
	
	function sajax_show_one_stub($func_name) {
		echo sajax_get_one_stub($func_name);
	}
	
	function sajax_export() {
		global $sajax_export_list;
		
		$n = func_num_args();
		for ($i = 0; $i < $n; $i++) {
			$sajax_export_list[] = func_get_arg($i);
		}
	}
	
	$sajax_js_has_been_shown = 0;
	function sajax_get_javascript()
	{
		global $sajax_js_has_been_shown;
		global $sajax_export_list;
		
		$html = "";
		if (! $sajax_js_has_been_shown) {
			$html .= sajax_get_common_js();
			$sajax_js_has_been_shown = 1;
		}
		foreach ($sajax_export_list as $func) {
			$html .= sajax_get_one_stub($func);
		}
		return $html;
	}
	
	function sajax_show_javascript()
	{
		echo sajax_get_javascript();
	}

	function sajax_link( $func_name, $link, $before = null )
	{
	    global $PID;
	    echo "<a href='?rs=$func_name&amp;PID=$PID&amp;non-js=true'";
	    echo "onclick='" . $before . " x_$func_name(); return false;'";
	    echo "onkeyup='if( event.key_code == 13 ) x_$func_name(); return false;'";
	    echo ">$link</a>";
	}
	
	$SAJAX_INCLUDED = 1;
}
?>
