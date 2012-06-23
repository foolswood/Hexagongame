function circleMove(c, pcPair) {
	var loc = getXY(pcPair[0]);
	c.setAttribute("cx", loc[0]);
	c.setAttribute("cy", loc[1]);
	c.setAttribute("fill", "url(#"+pcPair[1]+")");
}

function gameStandard(m) {
	loadMaze(m.maze);
	var p, e, pos, newPos, nextCol, startHexCol, col = m.startColour;
	if (col == undefined)
		col = "w";
	//End marker
	e = document.getElementById("end");
	pos = parseCoordStr(m.end);
	pos = getXY(pos);
	e.setAttribute("cx", pos[0]);
	e.setAttribute("cy", pos[1]);
	e.setAttribute("display", "inline");
	//Player marker and initial conditions
	p = document.getElementById("player");
	pos = parseCoordStr(m.start);
	startHexCol = nextCol = fillId(document.getElementById("h"+pos));
	newPos = [pos, col];
	circleMove(p, newPos);
	p.setAttribute("display", "inline");
	//Route
	this.route = [newPos];
	this.drawRoute = function() {
		var group, end, start = getXY(this.route[0][0]);
		group = document.getElementById("route");
		var l, i, c = this.route[0][1];
		for (i = 1; i < this.route.length; i++) {
			end = getXY(this.route[i][0]);
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
			newPos = this.route[0];
			col = newPos[1];
			nextCol = startHexCol;
			circleMove(p, newPos);
			this.route = [newPos];
			pos = newPos[0];
			return false;
		}
	}
	this.cleanup = function() {
		p.setAttribute("display", "none");
		e.setAttribute("display", "none");
	}
	this.gameHexClick = function(h) {
		//The game
		var jcol; //Join colour
		newPos = h.id.slice(1);
		jcol = joins[linkId(pos, newPos)];
		if ((jcol != undefined) && (jcol == col || jcol == "w" || col == "w")) {
			col = nextCol;
			pos = parseCoordStr(newPos);
			newPos = [pos, col];
			circleMove(p, newPos);
			this.route.push(newPos);
			if (pos.toString() == m.end) {
				this.drawRoute();
				alert("Complete");
				clearChildren("route");
				return col;
			}
			nextCol = fillId(h);
		}
	}
	hexClick = [this, this.gameHexClick];
}
