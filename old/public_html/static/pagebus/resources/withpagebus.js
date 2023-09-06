
var STATS_SUBJECT = "Stats.Clicks";
var BUTTON_SUBJECT = "Button.Clicked";

var clickStats = {
	start: new Date(),
	count: 0,
	duration : 0,
	addClick: function() {
		this.duration = new Date() - this.start;
		++this.count;
		PageBus.publish( STATS_SUBJECT, this );
	},
	clicksPM : function() { 
		return Math.round((this.count/(this.duration/1000.0/60.0))*100.0) / 100.0; 
	}
}
PageBus.subscribe( BUTTON_SUBJECT, clickStats, clickStats.addClick );

function updateCounter( subject, stats ) {
	document.getElementById("counter").innerHTML = stats.count;
}
PageBus.subscribe( STATS_SUBJECT, null, updateCounter );

function updateCounterPM( subject, stats ) {
	document.getElementById("counterpm").innerHTML = stats.clicksPM();
}
PageBus.subscribe( STATS_SUBJECT, null, updateCounterPM );

function updateChart( subject, stats ) {
	addClick( stats.duration , stats.count, stats.clicksPM() );
}
PageBus.subscribe( STATS_SUBJECT, null, updateChart );

//function statsLogger( subject, stats, data ) {
//	if( console != undefined && console.log != undefined ) {
//		console.log( stats );
//	}
//}
//PageBus.subscribe( "Stats.**", null, statsLogger );

