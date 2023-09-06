
var currTarget = null


updateTarget = function() {
	var hash = document.location.hash;
	hash = hash.substring(1);

	//console.log( hash );
	var target = document.getElementById(hash);
	if( target == currTarget ) return;
	
 	if( currTarget != null && currTarget.className == "lightbox" ) {
		currTarget.style.display = "none";
	}
	if( target != null && target.className == "lightbox") {
		target.style.display = "inline";
	}
	currTarget = target;
	//console.log( currTarget );	
}
	
document.onclick = function() {
	setTimeout( updateTarget, 0 );
}

window.onload = function() {
	setTimeout( updateTarget, 0 );
}

