var xlinkNS="http://www.w3.org/1999/xlink", svgNS="http://www.w3.org/2000/svg";

function getXY(pos) {
	//Returns placement position for a grid reference.
	var x = ((0.75*pos[0])+0.5)*hexWidth;
	var y = ((pos[1]+((pos[0]%2)*0.5))+0.5)*hexHeight;
	return [x,y]
}

function newUse(type, id, loc, col) {
	//Creates a new svgUse object
	var nu = document.createElementNS(svgNS, "use");
	nu.setAttribute("id", id);
	nu.setAttribute("x", loc[0]);
	nu.setAttribute("y", loc[1]);
	nu.setAttribute("fill", "url(#"+col+")");
	nu.setAttributeNS(xlinkNS, "href", type);
	return nu;
}

function drawDivider(joinGroup, hp, stroke, side) {
	//Draw a divider on the bottom of hexagon hp, stroke is colour, side is left/right/center
	var pos = getXY(hp);
	var newd = document.createElementNS(svgNS, "use");
	newd.setAttribute("x", pos[0]);
	newd.setAttribute("y", pos[1]);
	newd.setAttribute("stroke", stroke);
	newd.setAttributeNS(xlinkNS, "href", "#"+side);
	joinGroup.appendChild(newd);
}

function fillId(thing) {
	//Returns the map description letter corresponding to the fill
	return thing.getAttribute("fill").slice(5,6);
}

function linkId(a, b) {
	//Get the identifier linking these points.
	if (a < b) {
		return a+"-"+b;
	} else {
		return b+"-"+a;
	}
}

function genDivider(joinGroup, a, b, colour) {
	//Draws and creates an entry in joins for the line between grid positions a and b.
	var stroke = colourMap[colour];
	if (a[0] == b[0]) { //a on top of b
		drawDivider(joinGroup, a, stroke, "center");
	} else {
		if (b[1] == a[1]) { //Same Line
			if (a[0]%2) { //Odd Rows
				drawDivider(joinGroup, b, stroke, "left");
			} else { //Even Rows
				drawDivider(joinGroup, a, stroke, "right");
			}
		} else { //Line Below
			if (a[0] - b[0] == 1) {
				drawDivider(joinGroup, a, stroke, "left");
			} else {
				drawDivider(joinGroup, a, stroke, "right");
			}
		}
	}
	joins[linkId(a,b)] = colour;
}

var gridRatio = 1;
function gridSize(c, r) {
	//Setup the viewbox for a maze of size cxr
	r = (r+0.5)*hexHeight;
	c = ((0.75*c)+0.25)*hexWidth;
	var g = document.getElementById("gameGrid");
	g.setAttribute("viewBox", "0 0 "+c.toString()+" "+r.toString());
	gridRatio = c/r;
	scaleToWindow();
}

function scaleToWindow() {
	//make the browser show it the right size
	var g =	document.getElementById("gameGrid");
	if (gridRatio > (window.innerWidth/window.innerHeight)) {
		g.setAttribute("height", window.innerHeight/gridRatio);
	} else {
		g.setAttribute("height", window.innerHeight);
	}
}
window.onresize = scaleToWindow;

function clearChildren(group) {
	//Remove all children of group.
	var p = document.getElementById(group);
	while (p.childNodes.length >= 1) {
		p.removeChild(p.firstChild);
	}
}

var joins;

function loadMaze(m) {
	var i, j, c, hexGroup, joinGroup;
	var pos;
	hexGroup = document.getElementById("hexes");
	joinGroup = document.getElementById("joins");
	//Clear existing drawing and globals
	joins = {};
	clearChildren("hexes");
	clearChildren("joins");
	//Setup
	gridSize(Math.ceil(m[0].length/2), Math.ceil(m.length/2));
	//Draw
	for (i=0; i<m.length; i++) {
		l = m[i].toLowerCase();
		if ((i+1)%2) { //Hexagon Line
			for (j=0; j<l.length; j++) {
				c = l[j];
				if (c == " ") { //Gaps in the maze and impasses
					continue;
				}
				if ((j+1)%2) { //Odd
					//Hexagon
					pos = [j/2, i/2];
					hexGroup.appendChild(newUse("#hex", "h"+pos, getXY(pos), c));
				} else { //Even
					//Divider
					genDivider(joinGroup, [(j-1)/2, i/2], [(j+1)/2, i/2], c);
				}
			}
		} else { //Divider Line
			for (j=0; j<l.length; j++) {
				c = l[j];
				if (c == " ") {
					continue;
				}
				if ((j+1)%2) { //Odd
					genDivider(joinGroup, [j/2, (i-1)/2], [j/2, (i+1)/2], c);
				} else { //Even
					if ((j+1)%4) { //Not divisible by 4
						genDivider(joinGroup, [(j+1)/2, (i-1)/2], [(j-1)/2, (i+1)/2], c);
					} else {
						genDivider(joinGroup, [(j-1)/2, (i-1)/2], [(j+1)/2, (i+1)/2], c);
					}
				}
			}
		}
	}
}

var mazeComplete;

function hexClickHandler(evt) {
	var h = evt.target.correspondingUseElement; //Standard
	if (h == undefined) {
		h = evt.target.parentElement; //Firefox
	}
	var c = hexClick[1].call(hexClick[0], h);
	if (c != null) {
		mazeComplete.call(mazeSet, c);
	}
}

var fcClick;

function finishCircleHandler(evt) {
	var h = evt.target.correspondingUseElement; //Standard
	if (h == undefined) {
		h = evt.target.parentElement; //Firefox
	}
	fcClick[1].call(fcClick[0], h);
}

function parseCoordStr(s) {
	s = s.split(",");
	return [parseInt(s[0]), parseInt(s[1])]
}

function reset(evt) {
	if (game.gameReset()) {
		game.cleanup()
		mazeSet.showMenu()
	}
}
