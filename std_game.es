var joins;
var path;
var startColour;

//function reset(evt) {
//	//Restart current maze.
//	playerMove(path[0], startColour, false);
//	document.getElementById("route").setAttribute("display", "none"); //Hide Route (if shown)
//	clearChildren("route");
//	path = [path[0]];
//}

//function mazeComplete() {
//	var route = document.getElementById("route")
//	route.setAttribute("display", "inline"); //Show Path
//	alert("Success");
//	route.setAttribute("display", "none");
//	loadNextMaze();
//}

//function hexClick(evt) {
//	//Hexagon was clicked on (the game).
//	var h; //Svg Use Element that got clicked
//	h = evt.target.correspondingUseElement; //Standard
//	if (h == undefined) {
//		h = evt.target.parentElement; //Firefox
//	}
//	var pl = path.length; //Step number.
//	var join = joinedBy(path[pl-1], h);
//	if ((join != undefined) && ((join == fillId(path[pl-2])) || (join == "w") || (fillId(path[pl-2]) == "w"))) { //Valid step.
//		playerMove(h, path[pl-1].getAttribute("fill"), true);
//		if (h.getAttribute("id") == "end") {
//			mazeComplete();
//		}
//	}
//}

function parseCoordStr(s) {
	s = s.split(",");
	return [parseInt(s[0]), parseInt(s[1])]
}

function reset(evt) {
	if (!game.gameReset())
		mazeSet.showMenu()
}

function gameStandard(m) {
	//NEEDS ROUTE PLOT!
	//There are efficiency savings and interactivity gains to be made here
	game = this;
	loadMaze(m.maze);
	var col;
	if (m.startColour == undefined)
		m.startColour = "w";
	col = m.startColour;
	//Draw markers
	var p, e, pos, newPos;
	e = document.getElementById("end");
	pos = parseCoordStr(m.end);
	pos = getXY(pos[0], pos[1]);
	e.setAttribute("cx", pos[0]);
	e.setAttribute("cy", pos[1]);
	e.setAttribute("display", "inline");
	p = document.getElementById("player");
	pos = parseCoordStr(m.start);
	newPos = getXY(pos[0], pos[1]);
	p.setAttribute("cx", newPos[0]);
	p.setAttribute("cy", newPos[1]);
	p.setAttribute("fill", "url(#"+col+")");
	p.setAttribute("display", "inline");
	this.gameReset = function() {
		//resets maze, returning false if maze was already at start
		//if maze at start
		p.setAttribute("display", "none");
		e.setAttribute("display", "none");
		return false
	}
	this.gameHexClick = function(h) {
		//The game
		var jcol;
		newPos = parseCoordStr(h.id.slice(1));
		jcol = joins[linkId(pos, newPos)];
		if ((jcol != undefined) && (jcol == col || jcol == "w" || col == "w")) {
			col = fillId(document.getElementById("h"+pos.toString())); //Lacks Elegance
			pos = newPos;
			newPos = getXY(pos[0], pos[1]);
			p.setAttribute("cx", newPos[0]);
			p.setAttribute("cy", newPos[1]);
			p.setAttribute("fill", "url(#"+col+")");
			if (pos.toString() == m.end) {
				alert("Complete");
				//Maybe make it so the handler sorts out the next maze if a colour specifier is returned instead of null
			}
		}
	}
	hexClick = this.gameHexClick;
}
