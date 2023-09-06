<?php

define('IMAGE_DIR', '/');
define('GENERATED_IMAGE_DIR', 'generated/');
define('CACHE_IMAGES', true);

if( basename($_SERVER[ 'REQUEST_URI' ] ) == 'scaleimage.php' )
	die( "You cannot load this script directly");
	
$imagename =  explode( ".", basename($_SERVER[ 'REQUEST_URI']) );
//echo '<pre>'; print_r( $imagename ); exit;

if( count( $imagename ) == 2 ) {
	$imagename = $imagename[ 0 ];
	$basefiles = getFiles( $imagename );
	$largest = array_keys( $basefiles );
	$largest = $largest[ count( $largest ) - 1 ];
	$files = getAllFiles( $imagename );
	//print_r( $files ); exit;
	
	header( 'HTTP/1.1 300 Multiple Choices' );
	header( 'TCN: list' );
	$alternates = 'Alternates: ';
	$sep = '';
	foreach( $files as $size => $file ) {
		$timestamp = filemtime( $imagepath );
		$timestamp = gmdate('D, d M Y H:i:s T', $timestamp);
		$qf = $size / $largest;
		if( $size > $largest ) {
			// upscaled files get penalized because they use more bandwidth
			// but don't provide any more information
			$qf = $largest / $size;
		}
		$qf *= 1000;
		$qf = floor( $qf );
		$qf /= 1000;
		$alternates .= $sep . '{"' . $file . '" '. $qf .' {feature pix-y=' . $size . '}}';
		$sep = ', ';
	}
	header( $alternates );
	header( 'Vary: negotiate, accept, accept-language' );
	$etag = implode( $files );
	header( 'Content-Type: text/html' );
?>
     <h1>Multiple Choices:</h1>
     <ul>
<?php
	foreach( $files as $size => $file ) {
		echo "<li><a href=${file}>${size}px version</a>";
	}
?>
     </ul>
<?
	exit;
	
}
else if( count( $imagename ) != 3 ) {
	echo "No found"; exit;
}
$targetwidth = $imagename[ 1 ];
$targettype = $imagename[ count($imagename)-1 ];
$imagename = $imagename[ 0 ];
$imagepath = dirname(__FILE__) . IMAGE_DIR . $imagename;

if( !is_numeric($targetwidth) )
	die ( "error: width is not numeric: " . htmlspecialchars($targetwidth) );	

$targetwidth = min( $targetwidth, 2400 );
$targetname = $imagename . '/' . $targetwidth . '.' . $targettype;
$targetdir = dirname(__FILE__) . IMAGE_DIR . GENERATED_IMAGE_DIR . $imagename;


function getFiles( $imagename ) {
	$dir = opendir(dirname(__FILE__) . IMAGE_DIR);
	while ($f = readdir($dir)) { 
		$matches = null;
		if (eregi("^" . $imagename . "\.(.*)\.(jpe?g|png)$",$f,$matches)) { 
			$files[$matches[1]] = $f; 
		}
	}
	closedir($dir);
	ksort( $files );	
	return $files;
}

function getAllFiles( $imagename ) {
	$dir = opendir(dirname(__FILE__) . IMAGE_DIR);
	while ($f = readdir($dir)) { 
		$matches = null;
		if (eregi("^" . $imagename . "\.(.*)\.(jpe?g|png)$",$f,$matches)) { 
			$files[$matches[1]] = $f; 
		}
	}
	closedir($dir);
	$dir_path = dirname(__FILE__) . IMAGE_DIR . GENERATED_IMAGE_DIR . $imagename;
	if( is_dir( $dir_path ) ) {
		$dir = opendir($dir_path);
		while ($f = readdir($dir)) { 
			$matches = null;
			if (eregi("^(.*)\.(jpe?g|png)$",$f,$matches)) { 
				$files[$matches[1]] = GENERATED_IMAGE_DIR . $imagename . '/' . $matches[0]; 
			}
		}
		closedir($dir);
	}
	ksort( $files );	
	return $files;
}


$files = getAllFiles( $imagename );

function exactSizeMatch($files, $targetwidth ) {
	if( isset( $files[ $targetwidth ] ) ) {
		return $files[ $targetwidth ];
	}
	return null;
}

function bestSizeMatch( $files, $targetwidth ) {
	$idx = null;
	foreach( $files as $size => $file ) {
		$idx = $size;	
		if( $size >= $targetwidth ) {
			break;
		}		
	}
	return array($files[ $idx ], $idx);
}

function strleft($s1, $s2) { 
	return substr($s1, 0, strpos($s1, $s2)); 
}


function redirectToImage( $imagename ) {
	$s = empty($_SERVER["HTTPS"]) ? '' : ($_SERVER["HTTPS"] == "on") ? "s" : "";
	$protocol = strleft(strtolower($_SERVER["SERVER_PROTOCOL"]), "/").$s;
	$port = ($_SERVER["SERVER_PORT"] == "80") ? "" : (":".$_SERVER["SERVER_PORT"]); 
	$uri = dirname( $_SERVER['REQUEST_URI'] ) . '/' . $imagename;
	$location =  $protocol."://".$_SERVER['HTTP_HOST'].$port.$uri;

	header( "Location: " . $location );
	exit;	
}

$match = exactSizeMatch( $files, $targetwidth );

if( $match != null ) {
	/// hmmm... they should have been served the image directly
	/// oh well, there could be a reason for this in some strange
	/// configurations.
	redirectToImage($match);
}

// we only want to resize from the originals
$files = getFiles( $imagename );
list($imagename, $imagesize) = bestSizeMatch( $files, $targetwidth );
$imagepath = dirname(__FILE__) . IMAGE_DIR . $imagename;
$targetpath = dirname(__FILE__) . IMAGE_DIR . GENERATED_IMAGE_DIR . $targetname;

//echo '<pre>' . $imagepath; print_r( $files ); echo $targetwidth; exit;
//echo '<pre>' . $imagepath; exit;

$imageinfo = getimagesize($imagepath);
if( $imageinfo[0] != $imagesize ) {
	die ("image is supposed to be ${imagesize}px wide but is ${imageinfo[0]}px");
}
//print_r( $imageinfo ); exit;

$scale = $imageinfo[0] /$targetwidth; 

// Get new dimensions
list($width, $height) = getimagesize($imagepath);

$new_width = max( 1, round($width / $scale) );
$new_height = max( 1, round($height / $scale) );
//echo $new_width . "<br />" . $new_height . "<br/>";

// Resample
$image_p = imagecreatetruecolor($new_width, $new_height);
$image = null;

//echo '<pre>';
//print_r( $_SERVER ); exit;

$timestamp = filemtime( $imagepath );
$timestamp = gmdate('D, d M Y H:i:s T', $timestamp);

$etag = $imagename . '-' . $new_width; 
//echo '<pre>';
//print_r( $_SERVER );
//exit;

if( isset( $_SERVER[ 'HTTP_IF_NONE_MATCH' ] ) 
	&& $_SERVER[ 'HTTP_IF_NONE_MATCH' ] == $etag
	&& isset( $_SERVER[ 'HTTP_IF_MODIFIED_SINCE' ] )
	&& $_SERVER[ 'HTTP_IF_MODIFIED_SINCE' ] == $timestamp ) {
	header('HTTP/1.1 304 Not Modified');
	header('Status: 304 Not Modified');
	header('ETag: ' . $etag );
	header('Expires: ' . gmdate('D, d M 2018 H:i:s T', $timestamp) );
	exit;	
}

if (eregi("(.*)\.jpe?g",$imagepath)) { 
	$image = imagecreatefromjpeg($imagepath);
}
elseif (eregi("(.*)\.png",$imagepath)) { 
	$image = imagecreatefrompng($imagepath);
}
else {
	die ( "error: unsupported file type: " . htmlspecialchars($imagepath) );	
}

imagecopyresampled($image_p, $image, 0, 0, 0, 0, $new_width, $new_height, $width, $height);
if (eregi("jpe?g",$targettype)) {
	if( CACHE_IMAGES ) {
		if( !is_dir( $targetdir ) ) {
			mkdir( $targetdir );
		}
		@imagejpeg($image_p, $targetpath, 100);
	}
	header('ETag: ' . $etag );
	header('Content-type: image/jpeg');
 	header('Last-Modified: ' . $timestamp );
	imagejpeg($image_p, null, 100);
}
else { 
	if( CACHE_IMAGES ) {
		if( !is_dir( $targetdir ) ) {
			mkdir( $targetdir );
		}
		@imagepng($image_p, $targetpath, 9);
	}
	header('ETag: ' . $etag );
	header('Content-type: image/png');
	header('Content-Feature: width=' . $new_width . 'px; height=' . $new_height . 'px;');
 	header('Last-Modified: ' . $timestamp );
	imagepng($image_p, null, 9);
}

?>

