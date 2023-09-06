// Copyright (C)2007 Windy Road
// This work is licensed under a Creative Commons Attribution 2.5 License.  See http://creativecommons.org/licenses/by/2.5/au/
function StopWatch() {
	this.startTime = new Date();
	this.endTime = null;
	
	this.stop = function() {
		this.endTime = new Date();
	}

	this.reset = function() {
		this.startTime = new Date();
		this.endTime = null;
	}

	this.resume = function() {
		this.endTime = null;
	}
	
	this.duration = function() {
		if( this.endTime == null ) {
			this.stop();
			var rval = this.endTime-this.startTime;
			this.resume();
			return rval;
		}
		else {
			return this.endTime-this.startTime;
		}
	}
}

var stopWatch = new StopWatch();
var interval = null;

function startStopWatch() {
	stopWatch.reset();
	updateDisplay();
	
	document.getElementById( 'start' ).style.display='none';
	document.getElementById( 'resume' ).style.display='none';
	document.getElementById( 'stop' ).style.display='inline';
}

function resumeStopWatch() {
	stopWatch.resume();
	updateDisplay();
	
	document.getElementById( 'start' ).style.display='none';
	document.getElementById( 'resume' ).style.display='none';
	document.getElementById( 'stop' ).style.display='inline';
}

function stopStopWatch() {
	stopWatch.stop();
	clearTimeout( interval );
	updateDisplay();
	clearTimeout( interval );

	document.getElementById( 'start' ).style.display='inline';
	document.getElementById( 'start' ).innerHTML='Restart';
	document.getElementById( 'resume' ).style.display='inline';
	document.getElementById( 'stop' ).style.display='none';
}

function updateDisplay() {
	var ms = stopWatch.duration();
	var micro = Math.floor( ms / 10 ) % 100;
	if( micro < 10 )
		micro = '0' + micro;
	var sec = Math.floor( ms / 1000 ) % 60;
	if( sec < 10 )
		sec = '0' + sec;
	var min = Math.floor( ms / 60000 );
	if( min < 10 )
		min = '00' + min;	
	else if( min < 100 )
		min = '0' + min;	
	document.getElementById( 'minutes' ).innerHTML = min;
	document.getElementById( 'seconds' ).innerHTML = sec;
	document.getElementById( 'microseconds' ).innerHTML = micro;
	interval = setTimeout( updateDisplay, 100 );
}




window.onload= function() {
	document.getElementById( 'start' ).onclick=startStopWatch;
	document.getElementById( 'resume' ).onclick=resumeStopWatch;
	document.getElementById( 'stop' ).onclick=stopStopWatch;

	fitToScreen();
}

var timeout = null;

window.onresize= function() {
	clearTimeout( timeout );
	timeout = setTimeout( fitToScreen, 100 );
};

function windowHeight() {
	var height = window.innerHeight;
	if( height == undefined )
		height = document.documentElement.clientHeight;
	return height;
}

function textHeight() {
	return document.getElementById( 'timetext' ).offsetHeight;
}


function windowWidth() {
	return document.getElementById( 'header' ).offsetWidth;
}


function textWidth() {
	return document.getElementById( 'timetext' ).offsetWidth;
}

function displayDims() {
	tH = textHeight();
	tW = textWidth();
	targetWidth = windowWidth();
	targetHeight = windowHeight();
	targetHeight -= document.getElementById( 'header' ).offsetHeight;
	targetHeight -= document.getElementById( 'debug' ).offsetHeight;
	targetHeight -= document.getElementById( 'controls' ).offsetHeight;
	targetHeight -= document.getElementById( 'footer' ).offsetHeight;
	targetHeight -= 1;
	deltaH = targetHeight - tH;
	deltaW = targetWidth - tW;
	fs2 = fontsize * 3;
	fs2 += fontsize * 0.5 * 2;
	fs2 += fontsize * 0.25 * 2;
	document.getElementById( 'debug' ).innerHTML = 
		"tH " + tH + " : targetH "  + targetHeight + "<br/>"
		+ "tW " + tW + " : targetW "  + targetWidth + "<br/>"
		+ "dH " + deltaH + " : dW "  + deltaW + "<br/>"
		+ "fs " + fontsize + "<br/>"
		+ "fs2 " + fs2;
}


function fitToScreen() {	
	targetWidth = windowWidth();
	targetHeight = windowHeight();
	targetHeight -= document.getElementById( 'header' ).offsetHeight;
	targetHeight -= document.getElementById( 'controls' ).offsetHeight;
	targetHeight -= document.getElementById( 'footer' ).offsetHeight;
	targetHeight -= 1;
	
	document.getElementById( 'time' ).style.width = targetWidth + "px";
	if( targetHeight > 0 ) {
		document.getElementById( 'time' ).style.height = targetHeight + "px";
		fontsize = Math.max( 10, Math.floor( Math.min( targetWidth * 1.57 / 4.25, targetHeight * 0.88 ) ) );
		setFontSize( fontsize );
	}
	else {
		fontsize = 10;
		document.getElementById( 'time' ).style.height = (textHeight()+2) + "px";
		setFontSize( fontsize );
	}
	//displayDims();
}

function setFontSize( size ) {
	document.getElementById('timetext').style.fontSize=size + 'px';
}