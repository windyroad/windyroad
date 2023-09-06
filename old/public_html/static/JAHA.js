
function HiddenApplet( id, base, code, params )
{
	this.id = id;
	this.base = base;
	this.code = code;
	this.params = params;
	this.applet = null;
	
	this.loaded = function( applet )
	{
		this.applet = applet;
	}

	
	this.load = function()
	{
		this.applet = document.createElement( "applet" );
		this.applet.id = id;
		this.applet.code = code;
		this.applet.codeBase = base;
		this.applet.style.width="1px";
		this.applet.style.height="1px";
		this.applet.setAttribute("mayscript", true);
		this.params[ 'onstart' ] = 'JAHALoaded';
		for(name in this.params)
		{
			var param = document.createElement('param');
			param.name=name;
			param.value=params[ name ];
			this.applet.appendChild( param );
		}
		this.applet.jsobj = this;
		document.body.appendChild(this.applet);
	}
	
}

function JAHALoaded( applet )
{
	var element = document.getElementById( applet.getParameter( 'id' ) );
	element.jsobj.loaded( applet );
}
