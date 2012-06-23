var xlinkNS="http://www.w3.org/1999/xlink", svgNS="http://www.w3.org/2000/svg";

function getXY(pos) {
	//Returns placement position for a grid reference.
	var x = ((0.75*pos[0])+0.5)*hexWidth;
	var y = ((pos[1]+((pos[0]%2)*0.5))+0.5)*hexHeight;
	return [x,y]
}

function genHexagon(col, row, colour) {
	//Create a hexagon at col,row specified colour, id is usually null.
	var pos = getXY([col, row]);
	var newhex = document.createElementNS(svgNS, "use");
	newhex.setAttribute("id", "h"+col+","+row);
	newhex.setAttribute("x", pos[0]);
	newhex.setAttribute("y", pos[1]);
	newhex.setAttribute("fill", "url(#"+colour+")");
	newhex.setAttributeNS(xlinkNS, "href", "#hex");
	document.getElementById("hexes").appendChild(newhex);
	return newhex;
}

function drawDivider(hp, stroke, side) {
	//Draw a divider on the bottom of hexagon hp, stroke is colour, side is left/right/center
	var pos = getXY(hp);
	var newd = document.createElementNS(svgNS, "use");
	newd.setAttribute("x", pos[0]);
	newd.setAttribute("y", pos[1]);
	newd.setAttribute("stroke", stroke);
	newd.setAttributeNS(xlinkNS, "href", "#"+side);
	document.getElementById("joins").appendChild(newd);
}

function fillId(thing) {
	//Returns the map description letter corresponding to the fill
	var c;
	if (thing == undefined) {
		c = startColour;
	} else {
		c = thing.getAttribute("fill");
	}
	return c.slice(5,6);
}

function linkId(a, b) {
	//Get the identifier linking these points.
	if (a < b) {
		return a+"-"+b;
	} else {
		return b+"-"+a;
	}
}

function genDivider(a, b, colour) {
	//Draws and creates an entry in joins for the line between grid positions a and b.
	var stroke = colourMap[colour];
	if (a[0] == b[0]) { //a on top of b
		drawDivider(a, stroke, "center");
	} else {
		if (b[1] == a[1]) { //Same Line
			if (a[0]%2) { //Odd Rows
				drawDivider(b, stroke, "left");
			} else { //Even Rows
				drawDivider(a, stroke, "right");
			}
		} else { //Line Below
			if (a[0] - b[0] == 1) {
				drawDivider(a, stroke, "left");
			} else {
				drawDivider(a, stroke, "right");
			}
		}
	}
	joins[linkId(a,b)] = colour;
}

function gridSize(c, r) {
	//Setup the viewbox for a maze of size cxr
	r = (r+0.5)*hexHeight;
	c = ((0.75*c)+0.25)*hexWidth;
	var g = document.getElementById("gameGrid");
	g.setAttribute("viewBox", "0 0 "+c.toString()+" "+r.toString());
}

function clearChildren(group) {
	//Remove all children of group.
	var p = document.getElementById(group);
	while (p.childNodes.length >= 1) {
		p.removeChild(p.firstChild);
	}
}

var joins;

function loadMaze(m) {
	var i, j, c;
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
				if ((j+1)%2) {
					//Hexagon
					genHexagon(j/2, i/2, c);
				} else {
					//Divider
					if ((j+1)%4) {
						genDivider([(j-1)/2, i/2], [(j+1)/2, i/2], c);
					} else {
						genDivider([(j-1)/2, i/2], [(j+1)/2, i/2], c);
					}
				}
			}
		} else { //Divider Line
			for (j=0; j<l.length; j++) {
				c = l[j];
				if (c == " ") {
					continue;
				}
				if ((j+1)%2) {
					genDivider([j/2, (i-1)/2], [j/2, (i+1)/2], c);
				} else {
					if ((j+1)%4) {
						genDivider([(j+1)/2, (i-1)/2], [(j-1)/2, (i+1)/2], c);
					} else {
						genDivider([(j-1)/2, (i-1)/2], [(j+1)/2, (i+1)/2], c);
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
