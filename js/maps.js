// Activates a simple modal window that contains only text

function buildMessage(text) {
	$.colorbox({
		opacity:0,
		transition:"none",
		html:text,
		height:"200px",
		width:"500px",
		scrolling:false
	});
}

// Activates a modal window displaying a map
// Used for both static and dynamic locations

function buildMap(data, callNumber) {
	var locMessage = "";
	var locCode = "";
	var isStatic = false;
	var splitId = data.id.split('.'); // id generally looks like "5.G47.w"
	var floor = splitId[0]; // first element of the id
	var stack = "";
	var f = splitId[2] || ""; // east or west side of shelving unit
	var face = "";
	if (f === 'e') {
		face = 'east';
	}
	if (f === 'w') {
		face = 'west';
	}
	if (f === "") { // no 3rd part of id (e.g., "2.newspapers")
		locCode = splitId[1];
		locMessage = $('<p class="locMessage">' + messages[locCode] + '</p>');
	} else {
		stack = splitId[1];
		locMessage = $('<p class="locMessage">' + callNumber + ' is available at ' + '<span class="stack">' + stack + '</span> <span class="face">' + face + '</span></p>');
	}

	locMessage.insertAfter('#theCanvas');

	// Get the appropriate floor map image and insert it
	// into the div that contains the canvas.
	var theImage = $('<img>');
	var imageURL = "img/mapImages/floor_" + floor + ".png";
	theImage.attr('src', imageURL);
	theImage.attr('id', 'theImage');
	$('#theMap').prepend(theImage);

	// Draw a rectangle on the canvas and then unhide the canvas.
	var drawingLayer = document.getElementById("theCanvas");
	var drawingContext = drawingLayer.getContext("2d");
	drawingContext.globalAlpha = 0.6;
	drawingContext.fillStyle = "#A34687";
	drawingContext.fillRect(data.x, data.y, data.width, data.height);
	$('#theCanvas').show();
   
   	// Display the map in a modal window.
	$.colorbox({
		opacity:0,
		transition:"none",
		inline:true,
		href:"#theMap",
		height:"550px",
		width:"650px",
		scrolling:false,
		onCleanup:function() {
			// When the modal window closes, get rid of the image, message, and rectangle
			// and re-hide the canvas.
			drawingContext.clearRect(0, 0, drawingLayer.width, drawingLayer.height);
			$('#theImage').remove();
			$('#theCanvas').hide();
			$('.locMessage').remove();
		}
	});
}

// Add a "Where?" link at end of each record.
$('.holding').append($('<a href="#" class="where">Where?</a>'));

// Here's what happens when you click on a "where" link.
$('.where').click(function(e) {
	e.preventDefault();
	var callNumber = $(this).siblings('.callNumber').text();
	var location = $(this).siblings('.location').text();
	var availability = $(this).siblings('.availability').text();

	if (availability === 'Available') {
		var start = "";
		var end = "";
		var test = []; // later, we use this array to determine item's location
		var response = "";
		var message = "";
		var lookupArray;
		var locationStatic;
		// Determine which data array we need to use (from mapData.js).
		switch(location) {
			case "Music Stacks":
				lookupArray = musicStacks;
				locationStatic = false;
				break;
			case "Periodical Stacks":
				lookupArray = perStacks;
				locationStatic = false;
				break;
			case "General Stacks":
				lookupArray = stacks;
				locationStatic = false;
				break;
			default:
				lookupArray = staticLocations;
				locationStatic = true;
			break;
		}
		if (!locationStatic) { // it's in a dynamically mapped location
			// loop through the appropriate locations array (from mapData.js)
			for(var i = 0; i < lookupArray.length; i++) {
				start = lookupArray[i].start;
				end = lookupArray[i].end;
				// for each stack face object in the array, populate a test
				// array with the start and end callnumbers for that stack face
				// as well as the current callnumber that you're interested in.
				test = sortLC(start, end, callNumber);
				if (test[1] === callNumber || test.length === 2) {
					// your callnumber is between "start" and "end" for
					// the current stack face object
					response = lookupArray[i];
					// pass the current stack face object and your callnumber
					// to the map building function (above).
					buildMap(response, callNumber);
					break;
			 	}
			}
			if (response === "") {  // can't find the range for that call number
				buildMessage(messages['mapFail']);
			}
		} else { // it's in a static location (not mapped to stack level; e.g., newspapers)
			response = lookupArray[location];
			buildMap(response);
		}
	} else { // the item is not available
		buildMessage(messages['unavailable']);
	}
});