var started = false;
var canvas, context;
var stampId = lastStampId = '#chipImg';
var backId = lastBack = 'bg1Img';
var flavorId = lastFlavor = 'flavor1Img';
var lastColor = '';
var enableDraw = false; 
var currentX = 0;
var currentY = 0;
var lastX;
var lastY;
var drawW = 4;
var drawOpacity = .4;
var drawRadius = drawW/2;
var drawColor = ["0", "0" , "0"];
var drawCounter = 0;
var drawSpeed = 100;
var canvasOffsetW = 0;
var canvasOffsetH = 0; 
var toolBarWidth = 180;
var syrupOpacity = .15;
var scaleRange = .15; // the range stamps can be scaled up or down in size
var angleRange = 20; //the degree range stamps can be rotated

function init() {
	canvas = $('#imageView').get(0);
	context = canvas.getContext('2d');
	
	// Adjust canvas size to fit window.
	canvas.width  = window.innerWidth - $("#colorToolbar").outerWidth() - canvasOffsetW;
	canvas.height = window.innerHeight - canvasOffsetH;	
	
  	// Add event listeners for canvas
	canvas.addEventListener('mousemove', onMouseMove, false);
	canvas.addEventListener('click', onClick, false);
	canvas.addEventListener('mousedown', function(e) { enableDraw = true; lastX = e.offsetX; lastY = e.offsetY;}, false); 
	canvas.addEventListener('mouseup', function(e) { enableDraw = false; started = false; }, false); 
	canvas.addEventListener("touchstart", function(e) { enableDraw = true; lastX = e.offsetX; lastY = e.offsetY; }, false);
	canvas.addEventListener("touchmove", onTouchMove, false);
    canvas.addEventListener("touchend", function(e) { enableDraw = false; started = false; }, false);
	
	// Add events for backgrounds
	$.each($('#backgrounds > div'), function (i, e) {
		$(e).get(0).addEventListener('click', function(e) { onBackgroundClick(e.target.id); }, false);
	}); 
	
	// Add events for flavors
	$.each($('#flavors > div'), function (i, e) {
		$(e).get(0).addEventListener('click', function(e) { onFlavorClick(e.target.id); }, false);
	}); 	
	
	// Add events for draw colors
	$.each($('#colors > div'), function (i, e) {
		$(e).get(0).addEventListener('click', function(e) { onColorClick(e.target.id); }, false);
	}); 	
	
	// Add events for stamps / toppings
	$.each($('#stampContainer > div'), function (i, e) {
		$(e).get(0).addEventListener('click', function(e) { onStamp(e.target.id); }, false);
	}); 
	
	// init misc
	$('#save').get(0).addEventListener('click', function(e) { onSave(); }, false);
	$('#clearIt').get(0).addEventListener('click', function(e) { clearCanvas(); }, false);
	$('#stampsDown').get(0).addEventListener('click', function(e) { moveStamps('down'); }, false);
	$('#stampsUp').get(0).addEventListener('click', function(e) { moveStamps('up'); }, false);
	
	// Draw main elements
	drawBackground();		
	drawLogo();		
	drawBuilder();	
	drawFroyo();
}



function moveStamps(dir) {
	// Moves the stamps up or down within the container div
	var currentTop = parseInt($('#stampContainer').css('top'));
	var rowHeight = $($('#stampContainer > div')[0]).outerHeight(true);
	var containerHeight = parseInt($('#stamps').css('max-height'));
	var distance = Math.floor(containerHeight / rowHeight) * rowHeight; // page up or down and keep one row visible
	if (distance == 0) distance = rowHeight; // if only one row is visible
	var newTop = (dir == 'up') ? currentTop + distance : currentTop - distance; 
	var stampsHeight = $('#stampContainer').outerHeight();

	if (newTop >= 0) { 
		newTop = 0;
		$('#stampsUp').addClass('off');	
	} else {
		$('#stampsUp').removeClass('off');	
	}
	
	if (newTop <= -(stampsHeight-rowHeight)) { 
		newTop = -(stampsHeight-rowHeight);
		$('#stampsDown').addClass('off');	
	} else {
		$('#stampsDown').removeClass('off');	
	}
	
	
	$('#stampContainer').css('top', newTop + 'px');
}

function onBackgroundClick(id) {
	
	backId = id;
	
	// Draw main elements
	drawBackground();		
	drawLogo();		
	drawBuilder();	
	drawFroyo();
	
	// Select the new color.
	$('#' + lastBack).parent().removeClass('on');
	$('#' + backId).parent().addClass('on');
	
	//console.log('backId: ' + backId);
	// Store color so we can un-highlight it next time around.
	lastBack = backId;
	
}

function onFlavorClick(id) {
	
	flavorId = id;
	
	// Draw main elements
	drawBackground();		
	drawLogo();		
	drawBuilder();	
	drawFroyo();
	
	// Select the new color.
	$('#' + lastFlavor).parent().removeClass('on');
	$('#' + flavorId).parent().addClass('on');
	
	//console.log('flavorId: ' + flavorId);
	// Store color so we can un-highlight it next time around.
	lastFlavor = flavorId;
	
}
function onColorClick(color) {
	
	drawColor = $('#' + color).css("background-color").replace('rgb(', '').replace(')', '').split(", "); // make an array of the RGB color
	console.log(drawColor);
	
	// Select the new color.
	$('#' + lastColor).removeClass('on');
	$(lastStampId).parent().removeClass('on');
	$('#' + color).addClass('on');
	lastStampId = '';
	stampId = '';
	
	// Store color so we can un-highlight it next time around.
	lastColor = color;
	
	
	
}


function onStamp(id) {
	// Update the stamp image.
	stampId = '#' + id;
	console.log("stampId: " + stampId);
	$('#' + lastColor).removeClass('on');
	$(stampId).parent().addClass('on');

	$(lastStampId).parent().removeClass('on');
	
	lastColor = '';
	
	// Store stamp so we can un-highlight it next time around.
	lastStampId = stampId;	
	
}

function onSave() {
	var img = canvas.toDataURL("image/png");
	document.write('<p>To save, right click on your image below. Feel free to share with your friends on social media</p><p><a href="index.html">Start over</a></p><div><img src="' + img + '"/></div>');
	$('body').css("background-color", "black");
	$('body').css("color", "white");
	$('body').css("font-family", "arial, verdana, sans-serif");
	$('a').css("color", "white");
	console.log('hello');
}
function onClick(e) {
	if (stampId.length > 0 && !enableDraw) {
		
		var drawX = e.pageX - toolBarWidth;
		var drawY = e.pageY;
		
		var a = (stampId == "#syrupImg" || stampId == "#caramelImg") ? syrupOpacity*6 : 1; // force syrup opacity 
		
		draw(drawX,drawY, 0, 0, 0, 0, a);
	}
}



function clearCanvas() {
	// Adjust canvas size to fit window.
	canvas.width  = window.innerWidth - $("#colorToolbar").outerWidth() - canvasOffsetW;
	canvas.height = window.innerHeight - canvasOffsetH;	
	
	// Draw main elements
	drawBackground();		
	drawLogo();		
	drawBuilder();	
	drawFroyo();
}
function drawFroyo() {
	// Draw FroYo
	var froyoSize = getFroyoSize();
	var	froyo_x = Math.round((canvas.width / 2) - (froyoSize['w'] / 2)),
		froyo_y = Math.round(canvas.height - (froyoSize['h'] * .85));
		
	var flavorElId = $('#' + flavorId).data('image');
		
	context.drawImage(document.getElementById(flavorElId),
                froyo_x, froyo_y, froyoSize['w'] , froyoSize['h'] );	
}

function getFroyoSize() {
	var froyoSize = [];
	froyoSize['ratio'] = 1333/1000;
	froyoSize['w'] =  Math.round(canvas.width * .75),
	froyoSize['h'] = Math.round(froyoSize['w'] * froyoSize['ratio'])
	
	if (froyoSize['h'] > canvas.height) { 
		froyoSize['h'] = Math.round(canvas.height * 1.1) ;
		froyoSize['w'] = Math.round(froyoSize['h'] / froyoSize['ratio']);
	}
	
	return froyoSize;
}

function drawBackground() {
	// Draw Background
	var back_ratio = 1200/1400,
		back_w = canvas.width,
	    back_h = Math.round(back_w * back_ratio);
	if (back_h < canvas.height) { 
		back_h = canvas.height;
		back_w = Math.round(back_h / back_ratio);
	}
	if (back_w < canvas.width) { back_w = canvas.width; }
	
	//console.log($('#' + backId).data('image'));
	var backElId = $('#' + backId).data('image');
	
	context.drawImage(document.getElementById(backElId),
                0, 0, back_w, back_h);
}
function drawBuilder() {
	// Draw froyoBuilder 
	var builder_ratio = 150 / 450,
	    builder_w = Math.round(canvas.width * .3);
	if (builder_w > 460) builder_w = 460;
	var builder_h = Math.round(builder_w * builder_ratio);
	var	builder_x = Math.round((canvas.width) - (builder_w *1.1)),
		builder_y = Math.round((canvas.width * .1));
	
	context.drawImage(document.getElementById('froyoBuilder'),
                builder_x, builder_y, builder_w, builder_h);	
}

function drawLogo() {
	//Draw Logo
	var logo_ratio = 1,
	    logo_w = Math.round(canvas.width * .25);
	if (logo_w > 240) logo_w = 240;
	var logo_h = Math.round(logo_w * logo_ratio);
	var	logo_x = Math.round((canvas.width * .1) - (logo_w * .25)),
		logo_y = Math.round((canvas.width * .1) - (logo_h * .25));
	if (logo_h > (canvas.height * .8)) { 
		logo_h = Math.round(canvas.height * .5) ;
		logo_w = Math.round(logo_h / logo_ratio);
		logo_y = Math.round((canvas.height * .5) - (logo_h * .5));
	}
	context.drawImage(document.getElementById('pumpLogo'),
                logo_x, logo_y, logo_w, logo_h);	
}

function onTouchMove(ev) {
	ev.preventDefault();
		
	// Get the  position.
	currentX = ev.targetTouches[0].pageX - canvas.offsetLeft;
	currentY = ev.targetTouches[0].pageY - canvas.offsetTop;
	
	doDraw(currentX, currentY);
}
function doDraw(x,y) {
	
	if (enableDraw) {
		console.log('doDraw');
		// the distance the mouse has moved since last mousemove event
		var dis = Math.sqrt(Math.pow(lastX-currentX, 2)+Math.pow(lastY-currentY, 2));
		
		// for each pixel distance, draw a circle on the line connecting the two points to get a continous line.
		for (i=0;i<dis;i+=1) {
			var s = i/dis;
			if (stampId == '') {
				// Draw brush
				draw(lastX*s + currentX*(1-s), lastY*s + currentY*(1-s),drawW,drawColor[0],drawColor[1],drawColor[2], drawOpacity);
			} else if (drawCounter == 0 && stampId != "#syrupImg" && stampId != "#caramelImg") {
				// Draw stamp
				draw(lastX*s + currentX*(1-s), lastY*s + currentY*(1-s),drawW,drawColor[0],drawColor[1],drawColor[2], 1);
			}
			else if (stampId == "#syrupImg" || stampId == "#caramelImg") {
				// Draw syrup
				draw(lastX*s + currentX*(1-s), lastY*s + currentY*(1-s),drawW,drawColor[0],drawColor[1],drawColor[2], syrupOpacity);
			}
			drawCounter++;
			if (drawCounter >= drawSpeed) drawCounter = 0;
			
		}
		lastX = currentX;
		lastY = currentY;
	}
}
function onMouseMove(ev) {

	// Get the mouse position.
	currentX = (ev.offsetX==undefined) ? ev.layerX - toolBarWidth : ev.offsetX; // built in fix for Firefox
	currentY = (ev.offsetY==undefined) ? ev.layerY : ev.offsetY; // built in fix for Firefox
	
	doDraw(currentX, currentY);
	
}
function draw(x,y,w,r,g,b,a){
		if(typeof(w)==='undefined') w = 1;
		if(typeof(r)==='undefined') r = 0;
		if(typeof(g)==='undefined') g = 0;
		if(typeof(b)==='undefined') b = 0;
		if(typeof(a)==='undefined') a = 1;
		
		if (stampId == '') {
			// Draw line
			var gradient = context.createRadialGradient(x, y, 0, x, y, w);
			gradient.addColorStop(0, 'rgba('+r+', '+g+', '+b+', '+a+')');
			gradient.addColorStop(1, 'rgba('+r+', '+g+', '+b+', 0)');
			
			context.beginPath();
			context.arc(x, y, w, 0, 2 * Math.PI);
			context.fillStyle = gradient;
			context.fill();
			context.closePath();
		}
		else {
			// Draw stamp
			
			// Assign size
			var randomizeSize =  1 + ((Math.random() * (scaleRange * 2)) - (scaleRange)); 
			if (stampId == "#syrupImg" && stampId == "#caramelImg") randomizeSize =  1; // DO NOT RANDOMIZE THE SIZE
			var size = Math.floor(getFroyoSize()['w'] / 10 * randomizeSize); // scale elements based on froyo width
			if ($(stampId).data("scale")) size = Math.round(size * $(stampId).data("scale")) ; // scale the stamp based on element data

			// Assign rotation angle
			var randomizeAngle =  (Math.random() * (angleRange * (Math.PI/180) * 2)) - (angleRange * (Math.PI/180)); 
			
			// Assign stamp offset for centering stamps
			var offsetX = offsetY = -.5; // default offset (will be multiplied by the size of the stamp)
			if ($(stampId).data("offsetx")) offsetX = $(stampId).data("offsetx") ; // offset the stamp based on element data
			if ($(stampId).data("offsety")) offsetY = $(stampId).data("offsety") ; // offset the stamp based on element data
			
			// Save Canvas Settings
			context.save(); 
			
			// Position canvas
			context.translate(x, y);
			
			// Rotate canvas/stamp
			if (stampId != "#syrupImg" && stampId != "#caramelImg") context.rotate(randomizeAngle); 
			
			// Set opacity
			context.globalAlpha = a;
		
			// Draw stamp
			context.drawImage($(stampId).get(0), Math.round(size*offsetX), Math.round(size*offsetY), size, size);
			
			// Restore canvas settings
			context.restore();
			
		}
		
		// Prevent drawing on top of key elements
		drawLogo(); 
};

