This is front-end code designed to display maps to item locations for a library collection. It was developed for use within the [Primo Discovery and Delivery system from ExLibris](http://www.exlibrisgroup.com/category/PrimoOverview). The code presented here is not Primo-specific and could serve as a model for developing location maps in other systems. See below for some notes on how to make the code work with Primo.

Again, this code is provided as a *model*. All libraries have their own unique quirks: architectural, organizational, cataloging, etc. and these will need to be accounted for in any mapping system.

## Summary ##
The code inserts a "where" link for each item returned by a search. When a user clicks on this link, a modal window opens displaying a floor map with the location of the item highlighted. 

More detail is available [here](http://rgilmour70.github.io/stackMaps/).

## A Little More Detail ##
When the user clicks on the "where" link, we grab a few bits of information about the associated item: location, call number, and availability. Locations may be either static (defined as a general area, e.g., newspapers, reference stacks) or dynamic (performing a call number lookup to show a very specific location).

If the item location is static, the script grabs the appropriate data from the `staticLocations` array, selecting a floor map and drawing a highlighted rectangle based on that data.

If the item location is dynamic (general stacks, music, or periodicals), the script consults the appropriate array in `mapData.js` (e.g., `musicStacks` if the location is "Music"). Each of these arrays contains objects representing one side of a shelving range. The script iterates through the array until it finds a start/end pair of call numbers between which the call number of the current item falls. This is determined using `sortLC_lib.js`, a JavaScript translation of [Michael Doran's sortLC Perl library](http://rocky.uta.edu/doran/sortlc/). The object and the call number are then passed to the `buildMap` function, which displays the appropriate floor map and draws a highlighted rectangle at the appropriate location, based on x, y, height, and width values encoded in the object. (The call number is passed so it can be displayed in the message below the map.)

## Dependencies ##
* jQuery 
* [Colorbox](http://www.jacklmoore.com/colorbox/) - for modal windows
* [sprint-js](https://www.npmjs.com/package/sprintf-js) - required by `sortLC_lib.js`
* [jquery.waituntilexists.js](https://gist.github.com/buu700/4200601) - you'll need this with Primo. Not used in the example files; see below.

## Customization ##
This code was developed at [Ithaca College Library](https://ithacalibrary.com). We're a fairly small library, consisting physically of one building with four floors. As you can see in `mapData.js`, we have 15 locations that we map statically (things like reference, newspapers, popular reading) and three dynamic locations for which we provide stack-level location data on the maps.
All of our stacks run north-south, so we use east and west to indicate which side of a shelving unit something is on.

I realize that many libraries are more spatially complex and will require more complex location info and possibly shapes other than simple rectangles.

IC Library uses the Library of Congress call number system. Libraries using other call number systems could still use a system like this, but would need to replace `sortLC_lib.js` with some other sorting algorithm.

## Primo-specific Notes ##
When using this system with Primo, we need to delay the running of the code until the contents of the location tab loads. I do this by the using the small but effective [jquery.waituntilexists.js](https://gist.github.com/buu700/4200601) as follows:

    $('.EXLLocationInfo').waitUntilExists(function() {
        // all the JS here!
    }

We also need to Primo-ize the selectors, for example:

    var location = $(this).prev('.EXLLocationsTitle').find('.EXLLocationsTitleContainer').text();
    var title = $(this).parents('.EXLSummary').find('.EXLResultTitle').text();
    var availability = $(this).find('em').attr('class');

rather than the simplified:

    var callNumber = $(this).siblings('.callNumber').text();
    var location = $(this).siblings('.location').text();
    var availability = $(this).siblings('.availability').text();

In the above examples, `$(this)` refers to `$('.EXLLocationInfo')`.





