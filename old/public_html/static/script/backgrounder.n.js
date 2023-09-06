
function NJBackgrounder( initialFunc ) {
	this.timeout = null;
	
	this.yield = function() {
		var notifier = new EventNotifier();
		this.timeout = setTimeout(notifier, 0);
		notifier.wait->();
	}
	
	this.abort = function() {
		clearTimeout( this.timeout );
		this.timeout = null;
	}

	this.finished = function() {
		this.abort();
	}
	
	if( initialFunc != undefined ) { 
		initialFunc( this );
	}
}

var timeout = null;
var notifier;


function yield( notifier ) {
	setTimeout(notifier, 0);
	try {
		notifier.wait->();
		return true;
	} catch(e if e == NJS_INTERRUPT) {
		return false;
	}
}

function processSomeData7( target, someData, notifier ) {
	stopWatch = new StopWatch();
	initOutput(target, this);
	var batchSize = 100;
    for( i = 0; i < someData.length ; i+=batchSize ) {
		for( j = i; j < i+batchSize && j < someData.length; ++j ) {
			processAChange( target, someData[j] );
		}
		if( !yield->( notifier ) )
			return;
    }
	displayDuration( target, stopWatch );	
}


function runTest7() {
	var someData = new Array();
	for( i = 0; i < 5000; ++i ) {
		someData[i] = i + " ";
	}
	if( backgrounders[7] != null ) { 
		backgrounders[7].interrupt();
	}
	backgrounders[7] = new EventNotifier();
	processSomeData7->( 7, someData, backgrounders[7] );
	backgrounders[7] = null;
}
