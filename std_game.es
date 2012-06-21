var xlinkNS="http://www.w3.org/1999/xlink", svgNS="http://www.w3.org/2000/svg";

var joins;
var path;
var startColour;

loadNextMaze();

function reset(evt) {
	//Restart current maze.
	playerMove(path[0], startColour, false);
	document.getElementById("route").setAttribute("display", "none"); //Hide Route (if shown)
	clearChildren("route");
	path = [path[0]];
}

function mazeComplete() {
	var route = document.getElementById("route")
	route.setAttribute("display", "inline"); //Show Path
	alert("Success");
	route.setAttribute("display", "none");
	loadNextMaze();
}

function hexClick(evt) {
	//Hexagon was clicked on (the game).
	var h; //Svg Use Element that got clicked
	h = evt.target.correspondingUseElement; //Standard
	if (h == undefined) {
		h = evt.target.parentElement; //Firefox
	}
	var pl = path.length; //Step number.
	var join = joinedBy(path[pl-1], h);
	if ((join != undefined) && ((join == fillId(path[pl-2])) || (join == "w") || (fillId(path[pl-2]) == "w"))) { //Valid step.
		playerMove(h, path[pl-1].getAttribute("fill"), true);
		if (h.getAttribute("id") == "end") {
			mazeComplete();
		}
	}
}
