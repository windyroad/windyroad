<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.1//EN"
"http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en">
<head>
<meta http-equiv="content-type" content="text/html; charset=utf-8" />
<meta name="description" content="Test page" />
<title>Applet Test</title>
</head>
<body>
<h1>Applet Test</h1>
<p style="display: none">
	<!--[if !IE]> Firefox and others will use outer object -->
		<object id="hello_world" name="hello_world" classid="java:id/au/howardfamily/AppletTest.class"
				type="application/x-java-applet" style="width: 10; height: 10;">
		<param name="mayscript" value="true" />
	<!--<![endif]-->
	<!-- MSIE (Microsoft Internet Explorer) will use inner object -->
		<object id="hello_world_ie" name="hello_world_ie"
				classid="clsid:8AD9C840-044E-11D1-B3E9-00805F499D93"
				codebase="http://java.sun.com/update/1.5.0/jinstall-1_5_0-windows-i586.cab"
				style="width: 0; height: 0;">
			<param name="code" value="id/au/howardfamily/AppletTest" />
			<param name="mayscript" value="true" />
		</object>
	<!--[if !IE]> close outer object --> </object> <!--<![endif]-->
</p>
<p id="result">Javascript is disabled</p>
<script type="text/javascript">/* <![CDATA[ */
	var hello_world = null;

	if( document.hello_world )
	{
		alert( document.hello_world );
		hello_world = document.hello_world;
		document.getElementById("result").innerHTML = "Msg from java: " + document.hello_world.getMsg();
	}
	else if( document.hello_world_ie )
	{
		hello_world = document.hello_world_ie;
		document.getElementById("result").innerHTML = "Msg from java: " + document.hello_world_ie.getMsg();
	}
	else
	{
		document.getElementById("result").innerHTML = "Could not load applet";
	}
	
	//if( hello_world )
	//{
	//	document.getElementById("result").innerHTML = "Msg from java: " + hello_world.getMsg();
	//}
/* ]]> */</script>
</body>
</html>
<?php

?>