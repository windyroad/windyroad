

var clickStats = {
	start: new Date(),
	count: 0,
	duration : 0,
	addClick: function() {
		this.duration = new Date() - this.start;
		++this.count;
		updateCounter( this );
		updateCounterPM( this );
		updateChart( this );
		//statsLogger( this );
	},
	clicksPM : function() { 
		return Math.round((this.count/(this.duration/1000.0/60.0))*100.0) / 100.0; 
	}
}

function updateCounter( stats ) {
	document.getElementById("counter").innerHTML = stats.count;
}

function updateCounterPM( stats ) {
	document.getElementById("counterpm").innerHTML = stats.clicksPM();
}

function updateChart( stats ) {
	addClick( stats.duration , stats.count, stats.clicksPM() );
}

//function statsLogger( stats ) {
//	if( console != undefined && console.log != undefined ) {
//		console.log( stats );
//	}
//}
