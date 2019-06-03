/*
Brorlandi/big-text.js v1.0.0, 2017
Adapted from DanielHoffmann/jquery-bigtext, v1.3.0, May 2014
And from Jetroid/bigtext.js v1.0.0, September 2016

Usage:
BigText("#myElement",{
	rotateText: {Number}, (null)
	fontSizeFactor: {Number}, (0.8)
	maximumFontSize: {Number}, (null)
	limitingDimension: {String}, ("both")
	horizontalAlign: {String}, ("center")
	verticalAlign: {String}, ("center")
	textAlign: {String}, ("center")
	whiteSpace: {String}, ("nowrap")
});


Original Projects: 
https://github.com/DanielHoffmann/jquery-bigtext
https://github.com/Jetroid/bigtext.js

Options:

rotateText: Rotates the text inside the element by X degrees.

fontSizeFactor: This option is used to give some vertical spacing for letters that overflow the line-height (like 'g', 'Á' and most other accentuated uppercase letters). This does not affect the font-size if the limiting factor is the width of the parent div. The default is 0.8

maximumFontSize: maximum font size to use.

limitingDimension: In which dimension the font size should be limited. Possible values: "width", "height" or "both". Defaults to both. Using this option with values different than "both" overwrites the element parent width or height.

horizontalAlign: Where to align the text horizontally. Possible values: "left", "center", "right". Defaults to "center".

verticalAlign: Where to align the text vertically. Possible values: "top", "center", "bottom". Defaults to "center".

textAlign: Sets the text align of the element. Possible values: "left", "center", "right". Defaults to "center". This option is only useful if there are linebreaks (<br> tags) inside the text.

whiteSpace: Sets whitespace handling. Possible values: "nowrap", "pre". Defaults to "nowrap". (Can also be set to enable wrapping but this doesn't work well.)

Bruno Orlandi - 2017

Copyright (C) 2013 Daniel Hoffmann Bernardes, Ícaro Technologies
Copyright (C) 2016 Jet Holt

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

function _calculateInnerDimensions(computedStyle){
	//Calculate the inner width and height
	var innerWidth;
	var innerHeight;

	var width = parseInt(computedStyle.getPropertyValue("width"));
	var height = parseInt(computedStyle.getPropertyValue("height"));
	var paddingLeft = parseInt(computedStyle.getPropertyValue("padding-left"));
	var paddingRight = parseInt(computedStyle.getPropertyValue("padding-right"));
	var paddingTop = parseInt(computedStyle.getPropertyValue("padding-top"));
	var paddingBottom = parseInt(computedStyle.getPropertyValue("padding-bottom"));
	var borderLeft = parseInt(computedStyle.getPropertyValue("border-left-width"));
	var borderRight = parseInt(computedStyle.getPropertyValue("border-right-width"));
	var borderTop = parseInt(computedStyle.getPropertyValue("border-top-width"));
	var borderBottom = parseInt(computedStyle.getPropertyValue("border-bottom-width"));

	//If box-sizing is border-box, we need to subtract padding and border.
	var parentBoxSizing = computedStyle.getPropertyValue("box-sizing");
	if(parentBoxSizing == "border-box"){
		innerWidth = width - (paddingLeft + paddingRight + borderLeft + borderRight);
		innerHeight = height - (paddingTop + paddingBottom + borderTop + borderBottom);
	}else{
		innerWidth = width;
		innerHeight = height;
	}
	var obj = {};
	obj["width"] = innerWidth;
	obj["height"] = innerHeight;
	return obj;
}

BigText = function(selector, options){
	var elements;
	if (typeof selector === 'string') {
		elements = document.querySelectorAll(selector);
	} else if (selector instanceof Element || selector instanceof HTMLDocument) {
		// Support for DOM nodes
		elements = selector;
	} else if (selector.length) {
		// Support for array based queries (such as jQuery)
		elements = selector;
	}

	var defaultOptions = {
		rotateText: null,
		fontSizeFactor: 0.8,
		maximumFontSize: null,
		limitingDimension: "both",
		horizontalAlign: "center",
		verticalAlign: "center",
		textAlign: "center",
		whiteSpace: "nowrap"
	};
	
	//Merge provided options and default options
	options = options || {};
	for (var opt in defaultOptions)
		if (defaultOptions.hasOwnProperty(opt) && !options.hasOwnProperty(opt))
			options[opt] = defaultOptions[opt];
	
	for (var i = 0; i < elements.length; i++) {
		var element = elements[i];
		//Get variables which we will reference frequently
		var style = element.style;
		var computedStyle = document.defaultView.getComputedStyle(element);
		var parent = element.parentNode;
		var parentStyle = parent.style;
		var parentComputedStyle = document.defaultView.getComputedStyle(parent);
		
		//hides the element to prevent "flashing"
		style.visibility = "hidden";
		
		//Set some properties
		style.display = "inline-block";
		style.clear = "both";
		style.float = "left";
		style.fontSize = (1000 * options.fontSizeFactor) + "px";
		style.lineHeight = "1000px";
		style.whiteSpace = options.whiteSpace;
		style.textAlign = options.textAlign;
		style.position = "relative";
		style.padding = 0;
		style.margin = 0;
		style.left = "50%";
		style.top = "50%";

		//Get properties of parent to allow easier referencing later.
		var parentPadding = {
			top: parseInt(parentComputedStyle.getPropertyValue("padding-top")),
			right: parseInt(parentComputedStyle.getPropertyValue("padding-right")),
			bottom: parseInt(parentComputedStyle.getPropertyValue("padding-bottom")),
			left: parseInt(parentComputedStyle.getPropertyValue("padding-left")),
		};
		var parentBorder = {
			top: parseInt(parentComputedStyle.getPropertyValue("border-top")),
			right: parseInt(parentComputedStyle.getPropertyValue("border-right")),
			bottom: parseInt(parentComputedStyle.getPropertyValue("border-bottom")),
			left: parseInt(parentComputedStyle.getPropertyValue("border-left")),
		};

		//Calculate the parent inner width and height
		var parentInnerDimensions = _calculateInnerDimensions(parentComputedStyle);
		var parentInnerWidth = parentInnerDimensions["width"];
		var parentInnerHeight = parentInnerDimensions["height"];
		
		var box = {
			width: element.offsetWidth, //Note: This is slightly larger than the jQuery version
			height: element.offsetHeight,
		};

		
		if (options.rotateText !== null) {
			if (typeof options.rotateText !== "number")
				throw "bigText error: rotateText value must be a number";
			var rotate= "rotate(" + options.rotateText + "deg)";
			style.webkitTransform = rotate;
			style.msTransform = rotate;
			style.MozTransform = rotate;
			style.OTransform = rotate;
			style.transform = rotate;
			//calculating bounding box of the rotated element
			var sine = Math.abs(Math.sin(options.rotateText * Math.PI / 180));
			var cosine = Math.abs(Math.cos(options.rotateText * Math.PI / 180));
			box.width = element.offsetWidth * cosine + element.offsetHeight * sine;
			box.height = element.offsetWidth * sine + element.offsetHeight * cosine;
		}
		
		var widthFactor = (parentInnerWidth - parentPadding.left - parentPadding.right) / box.width;
		var heightFactor = (parentInnerHeight - parentPadding.top - parentPadding.bottom) / box.height;
		var lineHeight;

		if (options.limitingDimension.toLowerCase() === "width") {
			lineHeight= Math.floor(widthFactor * 1000);
			parentStyle.height = lineHeight + "px";
		} else if (options.limitingDimension.toLowerCase() === "height") {
			lineHeight= Math.floor(heightFactor * 1000);
		} else if (widthFactor < heightFactor)
			lineHeight= Math.floor(widthFactor * 1000);
		else if (widthFactor >= heightFactor)
			lineHeight= Math.floor(heightFactor * 1000);

		var fontSize = lineHeight * options.fontSizeFactor;
		if (options.maximumFontSize !== null && fontSize > options.maximumFontSize) {
			fontSize = options.maximumFontSize;
			lineHeight = fontSize / options.fontSizeFactor;
		}

		style.fontSize = Math.floor(fontSize) + "px";
		style.lineHeight = Math.ceil(lineHeight)  + "px";
		style.marginBottom = "0px";
		style.marginRight = "0px";

		if (options.limitingDimension.toLowerCase() === "height") {
			//this option needs the font-size to be set already so computedStyle.getPropertyValue("width") returns the right size
			//this +4 is to compensate the rounding erros that can occur due to the calls to Math.floor in the centering code
			parentStyle.width = (parseInt(computedStyle.getPropertyValue("width")) + 4) + "px";
		}

		//Calculate the inner width and height
		var innerDimensions = _calculateInnerDimensions(computedStyle);
		var innerWidth = innerDimensions["width"];
		var innerHeight = innerDimensions["height"];

		switch(options.verticalAlign.toLowerCase()) {
			case "top":
				style.top = "0%";
			break;
			case "bottom":
				style.top = "100%";
				style.marginTop = Math.floor(-innerHeight) + "px";
			break;
			default:
				style.marginTop = Math.floor((-innerHeight / 2)) + "px";
			break;
		}

		switch(options.horizontalAlign.toLowerCase()) {
			case "left":
				style.left = "0%";
			break;
			case "right":
				style.left = "100%";
				style.marginLeft = Math.floor(-innerWidth) + "px";
			break;
			default:
				style.marginLeft = Math.floor((-innerWidth / 2)) + "px";
			break;
		}

		//shows the element after the work is done
		style.visibility = "visible";
	}
}

module.exports = BigText;