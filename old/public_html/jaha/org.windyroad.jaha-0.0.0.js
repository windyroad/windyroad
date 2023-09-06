// IE doesn't provide console logging
// so if if doesn't exist, create a
// dummy version that does nothing.
if( !window.console )
	console = {};
if( !console.log )
	console.log = function(msg) {
		var pre = document.getElementById("debug");
		if( typeof(msg) == "object" ) {
			pre.appendChild(document.createTextNode("object:"));
			var list = document.createElement("ul");			
			for( i in msg ) {
				var li = document.createElement("li");
				li.appendChild(document.createTextNode(i + ": " + typeof(msg[i]) + ": " + msg[i]));
				list.appendChild(li);
			}
			pre.appendChild(list);
		}
		else {
			pre.appendChild(document.createTextNode(typeof(msg) + ": " + msg));
		}
		pre.appendChild(document.createElement("br"));
	};

// Create the org.windyroad.jaha namespace
if( !window.org )
	org = {};
if( !org.windyroad )
	org.windyroad = {};	

org.windyroad.jaha = {
	priv_currentApplet : null,
	onStart : function( applet ) {
		if( this.priv_currentApplet ) {
			this.priv_currentApplet.priv_onStart(applet);
		}
	},
	onInit : function( applet ) {
		if( this.priv_currentApplet ) {
			this.priv_currentApplet.priv_onInit(applet);
		}
	}
};

// declare the Applet class
org.windyroad.jaha.Applet = function(id, base, code, archives, params ) {
	if( arguments.length ) { 
		this.init(id, base, code, archives, params ); 
	}
}
org.windyroad.jaha.Applet.prototype.init = function(id, base, code, archives, params, callback) {
	
	this.id = id;
	this.base = base;
	this.code = code;
	this.params = params;
	this.archives = archives;
	this.appletElement = document.getElementById("test");
/*
	// create the applet element and set it's properties
	this.appletElement = document.createElement( "applet" );
	this.appletElement.id = this.id;
	this.appletElement.code = this.code;
	this.appletElement.codeBase = this.base;	
	// initially set the height and width 
	// of the applet to 1px and we'll hide it
	// later.
	// If it's hidden from the start IE won't call
	// the applets init() and start() methods 
	this.appletElement.style.width="1px";
	this.appletElement.style.height="1px";
	
	// essential for calling applet methods from JS
	// and JS functions from the applet
	this.appletElement.setAttribute("mayscript", true);
	
	// functions to call at various stages of the object's life cycle
	for(name in this.params)
	{
		var param = document.createElement('param');
		param.name=name;
		param.value=this.params[ name ];
		this.appletElement.appendChild( param );
	}
	if( archives ) {
		var param = document.createElement('param');
		param.name='archive';
		param.value=archives;
		this.appletElement.appendChild( param );
	}
	*/	
	this.priv_load();
}

org.windyroad.jaha.Applet.prototype.priv_load = function() {
	if( !org.windyroad.jaha.priv_currentApplet ) {
		org.windyroad.jaha.priv_currentApplet = this;
		// add the applet to the document, causing it to load
		document.body.appendChild(this.appletElement);	
	}
	else {
		// another applet is loading, so we have to wait our turn
		var self = this;
		window.setTimeout(function() { self.priv_load(); }, 100);
	}
}


org.windyroad.jaha.Applet.prototype.priv_onInit = function(applet) {
	this.onInit();
}

org.windyroad.jaha.Applet.prototype.onInit = function() {
}


org.windyroad.jaha.Applet.prototype.priv_onStart = function(applet) {
	this.appletElement.style.width='0';
	this.appletElement.style.height='0';
	this.applet = applet;
	org.windyroad.jaha.priv_currentApplet = null;
	this.onStart();
}

org.windyroad.jaha.Applet.prototype.onStart = function() {
}

// util function to convert the applet to a string		
org.windyroad.jaha.Applet.prototype.toString = function() {
	return 'org.windyroad.jaha.Applet Object; id: ' + this.id
		+ ', base: ' + this.base
		+ ', code: ' + this.code
		+ ', archives: ' + this.archives;
}