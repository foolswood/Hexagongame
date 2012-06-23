var joins;

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

function gameStandard(m) {
	loadMaze(m.maze);
	var col;
	if (m.startColour == undefined)
		m.startColour = "w";
	col = m.startColour;
	//Draw markers
	var p, e, pos, newPos;
	e = document.getElementById("end");
	pos = parseCoordStr(m.end);
	pos = getXY(pos);
	e.setAttribute("cx", pos[0]);
	e.setAttribute("cy", pos[1]);
	e.setAttribute("display", "inline");
	p = document.getElementById("player");
	pos = parseCoordStr(m.start);
	newPos = getXY(pos);
	p.setAttribute("cx", newPos[0]);
	p.setAttribute("cy", newPos[1]);
	p.setAttribute("fill", "url(#"+col+")");
	p.setAttribute("display", "inline");
	//Route
	this.route = [[pos, col]];
	this.drawRoute = function() {
		var group, end, start = getXY(this.route[0][0]);
		group = document.getElementById("route");
		var l, i, c = this.route[0][1];
		for (i = 1; i < this.route.length; i++) {
			end = this.route[i][0];
			end = getXY(end);
			l = document.createElementNS(svgNS, "line");
			l.setAttribute("stroke", colourMap[c]);
			l.setAttribute("x1", start[0]);
			l.setAttribute("y1", start[1]);
			l.setAttribute("x2", end[0]);
			l.setAttribute("y2", end[1]);
			group.appendChild(l);
			c = this.route[i][1];
			start = end;
		}
	}
	this.gameReset = function() {
		//resets maze, returning true if maze was already at start
		if (this.route.length == 1) { //maze at start
			return true;
		} else { //reset
			pos = parseCoordStr(m.start);
			newPos = getXY(pos);
			p.setAttribute("cx", newPos[0]);
			p.setAttribute("cy", newPos[1]);
			col = m.startColour;
			p.setAttribute("fill", "url(#"+col+")");
			this.route = [[pos, col]];
			return false;
		}
	}
	this.cleanup = function() {
		p.setAttribute("display", "none");
		e.setAttribute("display", "none");
	}
	this.gameHexClick = function(h) {
		//The game
		var jcol;
		newPos = parseCoordStr(h.id.slice(1));
		jcol = joins[linkId(pos, newPos)];
		if ((jcol != undefined) && (jcol == col || jcol == "w" || col == "w")) {
			col = fillId(document.getElementById("h"+pos.toString())); //Lacks Elegance
			pos = newPos;
			newPos = getXY(pos);
			p.setAttribute("cx", newPos[0]);
			p.setAttribute("cy", newPos[1]);
			p.setAttribute("fill", "url(#"+col+")");
			this.route.push([pos, col]);
			if (pos.toString() == m.end) {
				this.drawRoute();
				alert("Complete");
				clearChildren("route");
				return col;
			}
		}
	}
	hexClick = [this, this.gameHexClick];
}
