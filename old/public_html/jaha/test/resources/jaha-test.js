
					  
function TestApplet(id, params) {
	if( arguments.length ) { 
		this.init(id, "http://windyroad.org/jaha/resources",
			 "org.windyroad.jaha.JAHATest", 
			 null, params ); 
	}
}

TestApplet.prototype = new org.windyroad.jaha.Applet();
TestApplet.prototype.constructor = TestApplet;

TestApplet.prototype.init = function(id, base, code, archives, params, callback) {
	this.super_init = org.windyroad.jaha.Applet.prototype.init;
	this.super_init(id, base, code, archives, params, callback);
}


TestApplet.prototype.onStart = function() {
		var result = document.getElementById('result');
		while( result.childNodes.length > 0 )
			result.removeChild( result.childNodes[ 0 ] );
		var self = this;
		document.getElementById("runTests").onclick=function() { self.runTests(); }
		document.getElementById("runTests").disabled=false;
		//this.runTests();
}

TestApplet.prototype.runTests = function() {
	var writer = new StringWriter( JsUtil.prototype.getSystemWriter() );
	var printer = new XMLResultPrinter( writer );
	var runner = new EmbeddedTextTestRunner( printer );
	var collector = new TestSuiteCollector( window );
	var suites = collector.collectTests();
	var testsNode = document.getElementById('tests');
	runner.run( suites );
	var results = document.getElementById('results');
	if( results.childNodes.length > 0 )
		results.removeChild( results.childNodes[ 0 ] );		
	var pre = document.createElement("pre");
	pre.appendChild( document.createTextNode(writer.get()));
	results.appendChild(pre);
}


var jaha = null;
window.onload = function()
{
	var result = document.getElementById('result');
	result.removeChild( result.childNodes[ 0 ] );
	result.appendChild( document.createTextNode( navigator.javaEnabled() ?
					     "Loading..." : 
					     "Sorry, Java must be enabled" ) );
	
	var params = new Array();
	jaha = new TestApplet( "test", params );	
}

function JAHATest( name ) {
    TestCase.call( this, name );
}
JAHATest.prototype = new TestCase();

JAHATest.prototype.STATIC_STRING = "Static String";
JAHATest.prototype.STATIC_INT = 2465;
JAHATest.prototype.STATIC_DOUBLE = 24.2;
JAHATest.prototype.STATIC_HASHMAP = { "String" : JAHATest.prototype.STATIC_STRING,
									  "int" : JAHATest.prototype.STATIC_INT,
									  "double" : JAHATest.prototype.STATIC_DOUBLE };
JAHATest.prototype.testAppletExists = function() {
    this.assertTrue( jaha.applet );
    this.assertTrue( jaha.applet instanceof Object );
}

JAHATest.prototype.testGetDocumentBase = function() {
    this.assertEquals( document.location.href, jaha.applet.getDocumentBase() );
}

JAHATest.prototype.testStaticStringAccess = function() {
    this.assertEquals( this.STATIC_STRING, jaha.applet.STATIC_STRING );
}

JAHATest.prototype.testStaticIntAccess = function() {
    this.assertEquals( this.STATIC_INT, jaha.applet.STATIC_INT );
}

JAHATest.prototype.testStaticDoubleAccess = function() {
    this.assertEquals( this.STATIC_DOUBLE, jaha.applet.STATIC_DOUBLE );
}

JAHATest.prototype.testStaticHashMapAccess = function() {
    this.assertEquals( this.STATIC_HASHMAP["String"], jaha.applet.STATIC_HASHMAP.get("String") );
    this.assertEquals( this.STATIC_HASHMAP["int"], jaha.applet.STATIC_HASHMAP.get("int") );
    this.assertEquals( this.STATIC_HASHMAP["double"], jaha.applet.STATIC_HASHMAP.get("double") );
}

JAHATest.prototype.testStringReturn = function() {
	for( var i = 0; i < 100; ++i ) {
		jaha.applet.getString();
	}
    this.assertEquals( this.STATIC_STRING, jaha.applet.getString() );
}

JAHATest.prototype.testIntReturn = function() {
    this.assertEquals( this.STATIC_INT, jaha.applet.getInt() );
}

JAHATest.prototype.testDoubleReturn = function() {
    this.assertEquals( this.STATIC_DOUBLE, jaha.applet.getDouble() );
}

JAHATest.prototype.testNestedClassReturn = function() {
	var nested = jaha.applet.getNestedClass();
    this.assertEquals( this.STATIC_INT, nested.test() );
}

JAHATest.prototype.testHashMapReturn = function() {
    var hm = jaha.applet.getHashMap()
    this.assertEquals( this.STATIC_HASHMAP["String"], hm.get("String") );
    this.assertEquals( this.STATIC_HASHMAP["int"], hm.get("int") );
    this.assertEquals( this.STATIC_HASHMAP["double"], hm.get("double") );
}

JAHATest.prototype.testEvalStringReturn = function() {
    this.assertEquals( this.STATIC_STRING, jaha.applet.evalString() );
}

JAHATest.prototype.testEvalIntReturn = function() {
    this.assertEquals( this.STATIC_INT, jaha.applet.evalInt() );
}

JAHATest.prototype.testEvalDoubleReturn = function() {
    this.assertEquals( this.STATIC_DOUBLE, jaha.applet.evalDouble() );
}

JAHATest.prototype.testEvalHashMapReturn = function() {
    var hm = jaha.applet.evalHashMap();
    console.log(hm);
    this.assertEquals( this.STATIC_HASHMAP["String"], hm.getMember("StringValue").toString() );
    this.assertEquals( this.STATIC_HASHMAP["int"], +hm.getMember("IntValue").toString() );
    this.assertEquals( this.STATIC_HASHMAP["double"], +hm.getMember("DoubleValue").toString() );
}

JAHATest.prototype.testCallString = function() {
    this.assertEquals( this.STATIC_STRING, jaha.applet.callString() );
}

JAHATest.prototype.testCallInt = function() {
    this.assertEquals( this.STATIC_INT, jaha.applet.callInt() );
}

JAHATest.prototype.testCallDouble = function() {
    this.assertEquals( this.STATIC_DOUBLE, jaha.applet.callDouble() );
}

JAHATest.prototype.testCallHashMap = function() {
	try {
    var hm = jaha.applet.callHashMap( this.STATIC_HASHMAP );
    console.log( "got hm");
    console.log( hm.getClass().getName() );
    
    this.assertEquals( this.STATIC_HASHMAP["String"], hm.get("String").toString() );
    this.assertEquals( this.STATIC_HASHMAP["int"], +hm.get("int").toString() );
    this.assertEquals( this.STATIC_HASHMAP["double"], +hm.get("double").toString() );
	}
	catch (e) {
		console.log( e );
		throw e;
	}
}

JAHATest.prototype.testCallNestedClass = function() {
	var nested = jaha.applet.callNestedClass();
    this.assertEquals( this.STATIC_INT, nested.test() );
}

JAHATest.prototype.testCallWith2Args = function() {
    this.assertEquals( testFunc3(this.STATIC_INT, this.STATIC_DOUBLE), jaha.applet.callWith2Args() );
}

JAHATest.prototype.testCallWith5Args = function() {
	var result = jaha.applet.callWith5Args( this );
	if( "netscape.javascript.JSException" == result.getClass().getName() ) {
		throw result.getWrappedException();	
	}
	else {
	    this.assertEquals( 5, jaha.applet.callWith5Args( this ) );
	}
}

JAHATest.prototype.testCallNamespacedFunction = function() {
	var result = jaha.applet.callNamespacedFunction( this );
	if( "netscape.javascript.JSException" == result.getClass().getName() ) {
		throw result.getWrappedException();	
	}
	else {
	    this.assertEquals( 5, jaha.applet.callWith5Args( this ) );
	}
}


function AllTests()
{
    TestSuite.call( this, "AllTests" );
    this.addTestSuite( JAHATest );
}
AllTests.prototype = new TestSuite();
AllTests.prototype.suite = function () { return new AllTests(); }

function testFunc2( arg ) {
	return arg;
}

function testFunc3( arg1, arg2 ) {
	return arg1 + "," + arg2;
}

function testFunc4( tester, arg1, arg2, arg3, arg4 ) {
	tester.assertEquals( tester.STATIC_STRING, arg1 );
	tester.assertEquals( tester.STATIC_INT, arg2 );
	tester.assertEquals( tester.STATIC_DOUBLE, arg3 );
    tester.assertEquals( tester.STATIC_HASHMAP["String"], arg4.get("String") );
    tester.assertEquals( tester.STATIC_HASHMAP["int"], arg4.get("int") );
    tester.assertEquals( tester.STATIC_HASHMAP["double"], arg4.get("double") );
	return arguments.length;
}

if( !window.test )
	test = {};
test.testFunc = function( tester, arg1, arg2, arg3, arg4 ) {
	return testFunc4( tester, arg1, arg2, arg3, arg4 );
}
