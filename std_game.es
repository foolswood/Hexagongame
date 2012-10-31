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
	this.drawRoute = function(r) {
		var group, end, start = getXY(r[0][0]);
		group = document.getElementById("route");
		var l, i, c = r[0][1];
		for (i = 1; i < r.length; i++) {
			end = getXY(r[i][0]);
			l = document.createElementNS(svgNS, "line");
			l.setAttribute("stroke", colourMap[c]);
			l.setAttribute("x1", start[0]);
			l.setAttribute("y1", start[1]);
			l.setAttribute("x2", end[0]);
			l.setAttribute("y2", end[1]);
			group.appendChild(l);
			c = r[i][1];
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
				this.drawRoute(this.route);
				alert("Complete");
				clearChildren("route");
				return col;
			}
			nextCol = fillId(h);
		}
	}
	hexClick = [this, this.gameHexClick];
	//IF EDIT
	this.solve = function() {
		//Solve the given maze
		var bailout = 0;
		var traversed = {};
		var finishColours = [];
		var routes = [];
		function hexColour(from) {
			var pos = parseCoordStr(from.slice(1));
			return m.maze[pos[1]*2][pos[0]*2].toLowerCase();
		}
		function validMoves(from) {
			var moves = [];
			var loc = from.slice(1);
			var col = from.slice(0,1);
			var join, ends, jcol;
			for (join in joins) {
				jcol = joins[join];
				if (jcol == col || jcol == "w" || col == "w") {
					ends = join.split("-");
					switch (loc) {
						case ends[0]:
							moves.push(ends[1]);
							break;
						case ends[1]:
							moves.push(ends[0]);
							break;
					}
				}
			}
			return moves;
		}
		function traverse(from, retrace) {
			retrace += "-" + from;
			if (from.slice(1) == m.end) {
				if (finishColours.indexOf(from.slice(0,1))) {
					routes.push(retrace.slice(1));
					finishColours.push(from.slice(0,1));
				} else {
					routes.push(retrace.slice(1));
				}
			} else {
				if (traversed[from] == undefined) {
					traversed[from] = [retrace.slice(1)];
					var vMoves = validMoves(from);
					var mi, hc = hexColour(from);
					for (mi = 0; mi < vMoves.length; mi++) {
						traverse(hc+vMoves[mi], retrace);
					}
				} else {
					traversed[from].push(retrace.slice(1));
				}
			}
		}
		if (m.startColour == undefined) {
			traverse("w"+m.start, "");
		} else {
			traverse(m.startColour+m.start, "");
		}
		routes = routes[0].split("-");
		console.log(routes);
		function qp(t) {
			return [parseCoordStr(t.slice(1)), t.slice(0,1)]
		}
		routes = routes.map(qp);
		console.log(routes);
		this.drawRoute(routes);
		return finishColours.length;
	}
	//FI
}
