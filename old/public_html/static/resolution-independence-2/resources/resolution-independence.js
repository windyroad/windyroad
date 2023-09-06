// Copyright (C)2007 Windy Road
// This work is licensed under a Creative Commons Attribution 2.5 License.  See http://creativecommons.org/licenses/by/2.5/au/

function debug(msg) {
	if( $("#debug").css("display") != "none" ) 
		$("#debug").html("<div>" + msg + "</div>" + $("#debug").html() );		
}


var autoResize = {
	timeout : null,
	currentWidth : 0,

	calculateScale : function() {
		targetWidth = $(window).width();
		mainW = $("#content").width();
		debug(targetWidth / mainW);
		return targetWidth / mainW;
	},

	fitToScreen : function() {
		// if the resize changed the width of the window
		if( $(window).width() != this.currentWidth ) {
			debug( "curr: " + this.currentWidth + "; new: " + $(window).width() );
			this.resetLayout();
					
			scale = this.calculateScale();
	
			this.setFontSize( scale, $("body") );
			this.setImageSize( scale );
			this.handleFixedSize( scale );
	
			this.currentWidth = $(window).width();
	
	
			// handle minimum font size
			mainW = $("#content").width();
			if( mainW > this.currentWidth ) {
				scale *= mainW / targetWidth;
				this.setFontSize( scale, $("body") );
				this.setImageSize( scale );
				this.handleFixedSize( scale );
				$('#header' ).css( "width" , mainW + "px" );
				$('#footer' ).css( "width" , mainW + "px" );
				this.currentWidth = $(window).width();
			}	
		}
	},

	setFontSize : function( scale, elem ) {
		elem.css("font-size", (scale * 100) + '%' );
	},
	
	innerWidth : function(elem) {
		e = $(elem)
		return e.width() - parseInt(e.css("padding-left")) - parseInt(e.css("padding-right"));
	},
	
	outerWidth : function(elem) {	
		e = $(elem)
		rval =  e.width() + parseInt(e.css("margin-left")) + parseInt(e.css("margin-right"));
		debug( "outer: " + rval );
		return rval;
	},
	
	getChildDisplay : function(elem) {
		if( elem.childDisplay != undefined ) {
			return elem.childDisplay;
		}
		rval = "none";
		$(elem).children().each( function(j) {
			if( rval == "none" 
				&& $(this).css("display") != "none" ) {
				rval = $(this).css("display");
			}
		} );
		elem.childDisplay = rval;
		return rval;
	},

	getDisplay : function(elem) {
		if( elem.display != undefined ) {
			return elem.display;
		}
		elem.display = $(elem).css("display");
		return elem.display;
	},
	
	displayLargest : function( elem, i ) {
		// find out how to correctly display children
		ar = this;
		elem.childDisplay = this.getChildDisplay(elem);
		elem.display = this.getDisplay(elem);
		
		$(elem).css("display", elem.display );			
		// show all the children, so we can get their width
		$(elem).children().each( function(j) {
			$(this).css("display", elem.childDisplay );	
			$(this).css("position", "fixed" );	
		} );


		// find the largest we can display
		width = this.innerWidth(elem);
		parentWidth = this.innerWidth($(elem).parent());
		if( width > parentWidth ) {
			width = parentWidth;
		}
		debug("width: " + width + " parent: " + parentWidth );		
		
		
		largest = null;
		largestWidth = 0;
		ar = this;
		$(elem).children().each( function(j) {
			childWidth = ar.outerWidth(this);
			if( childWidth > largestWidth
				&& childWidth <= width ) {
				largest = this;
				largestWidth = childWidth;
			}
		} );
		
		debug("width: " + width + " largest: " + largestWidth );

		// hide all the children
		$(elem).children().each( function(j) {
			$(this).css("display", "none" );			
			$(this).css("position", "static" );	
		} );

		// and show the largest
		if( largest != null ) {
			$(largest).css("display", elem.childDisplay );
		}
		else {
			$(elem).css("display", "none" );					
		}
	
	},
	
	displayIfFits : function( elem, i ) {
		var parent = $(elem).parent();
		width = $(elem).width() + parseInt($(elem).css("margin-left")) + parseInt($(elem).css("margin-right"));
		//console.log( this, parent );
		parentWidth = parent.width() - parseInt(parent.css("padding-left")) - parseInt(parent.css("padding-right"));
		if( !elem.oldDisplay ) {
			elem.oldDisplay = $(elem).css("display");
		}
		$(elem).css("display", "none" );
		if( width == parentWidth ) {
			parent = parent.parent();
			parentWidth = parent.width() - parseInt(parent.css("padding-left")) - parseInt(parent.css("padding-right"));
		}
		if( width > parentWidth ) {
			$(elem).css("display", "none" );
		}
		else {
			$(elem).css("display", elem.oldDisplay );		
		}
	},
	
	handleFixedSize : function( size ) {
		ar = this;
		$(".display-largest").each( function(i) { ar.displayLargest(this, i); } );
		$(".display-if-fits").each( function(i) { ar.displayIfFits(this, i); } );
	},
	
	
	setImageSize : function( size ) {
		// resize img elements
		$("img").not(".display-if-fits").each( function(i){
			if( this.originalWidth == undefined ) {
				this.originalWidth = $(this).width();
			}
			width = Math.floor( this.originalWidth * size );
			this.src = this.src.replace(/^(.*)\.[^\.]+\.([^\.]+)$/g, "\$1." + width + ".\$2");
			$(this).width(width);
		});
		// resize backgrounds
		$("*").each( function(i) {
			if( $(this).css("background-image") != "none" ) {
				//console.log( this );
				if( this.originalWidth == undefined ) {
					currImg = $(this).css("background-image");
					width = /^.*\.([^\.]+)\.[^\.]+$/.exec(currImg);
					this.originalWidth = width[ 1 ];
				}
				width = Math.floor( this.originalWidth * size );
				currImg = $(this).css("background-image");
				newImg = currImg.replace(/^(.*)\.[^\.]+\.([^\.]+)$/g, "\$1." + width + ".\$2");
				$(this).css("background-image", newImg);
			}
		} );
	},
	
	resetLayout : function() {
		this.setFontSize( 1, $("body") );
		$("#header").css("width", null);
		$("#footer").css("width", null);
	}
}

$(window).load( function() {
	autoResize.fitToScreen();
} ); 

$(window).resize( function() { //return;
	clearTimeout( autoResize.timeout );
	autoResize.timeout = setTimeout( function() { autoResize.fitToScreen(); }, 100 );
} );
