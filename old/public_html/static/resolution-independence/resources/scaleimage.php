<?php

define('IMAGE_DIR', '/images/');

if( empty( $_REQUEST[ 'image' ] ) )
	die ( "error: image is not specified" );

$imagepath = dirname(__FILE__) . IMAGE_DIR . basename( $_REQUEST[ 'image' ] );

if( empty( $_REQUEST[ 'width' ] ) )
	die ( "error: target width is not specified" );
if( !is_numeric($_REQUEST[ 'width' ]) )
	die ( "error: width is not numeric: " . htmlspecialchars($targetwidth) );

$targetwidth = min( $_REQUEST[ 'width' ], 1200 );

$imageinfo = getimagesize($imagepath);

function strleft($s1, $s2) { 
	return substr($s1, 0, strpos($s1, $s2)); 
}


if( $imageinfo[0] == $targetwidth ) {
	// redirect to the original
	$s = empty($_SERVER["HTTPS"]) ? '' : ($_SERVER["HTTPS"] == "on") ? "s" : "";
	$protocol = strleft(strtolower($_SERVER["SERVER_PROTOCOL"]), "/").$s;
	$port = ($_SERVER["SERVER_PORT"] == "80") ? "" : (":".$_SERVER["SERVER_PORT"]); 
	$uri = dirname( $_SERVER['REQUEST_URI'] ) . IMAGE_DIR . basename( $_REQUEST[ 'image' ] );
	$location =  $protocol."://".$_SERVER['HTTP_HOST'].$port.$uri;

	header( "Location: " . $location );
	exit;
}
$scale = $imageinfo[0] /$targetwidth;  //<TD> WIDTH

//echo $scale . "<br />" ;


// Get new dimensions
list($width, $height) = getimagesize($imagepath);

$new_width = floor($width / $scale);
$new_height = floor($height / $scale);
//echo $new_width . "<br />" . $new_height . "<br/>";

// Resample
$image_p = imagecreatetruecolor($new_width, $new_height);
$image = null;

session_cache_limiter('public');

if (eregi("(.*)\.jpe?g",$imagepath)) { 
	$image = imagecreatefromjpeg($imagepath);
	imagecopyresampled($image_p, $image, 0, 0, 0, 0, $new_width, $new_height, $width, $height);

	// Output
	header('Content-type: image/jpeg');
	imagejpeg($image_p, null, 100);
}
elseif (eregi("(.*)\.png",$imagepath)) { 
	$image = imagecreatefrompng($imagepath);
	imagecopyresampled($image_p, $image, 0, 0, 0, 0, $new_width, $new_height, $width, $height);

	// Output
	header('Content-type: image/png');
	imagepng($image_p, null, 100);
}

?>

