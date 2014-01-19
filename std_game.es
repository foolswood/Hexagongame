function gameStandard(iface, m, doneCallback) {
    var hexes = loadMaze(m.maze, iface)
    console.log(saveMaze(hexes))
    var pos, col, nextCol
    //End marker
    iface.endMarker.move(m.end)
    iface.endMarker.setShown(true)
    //Player marker and initial conditions
    if (m.startcolour == undefined)
        m.startcolour = "w"
    col = m.startcolour
    pos = m.start
    nextCol = hexes[pos].getColour()
    iface.playerMarker.setColour(col)
    iface.playerMarker.move(pos)
    iface.playerMarker.setShown(true)
    //Route
    var route = [[pos, col]];
    iface.playerMarker.setCallback(
        function() {
            //resets maze
            if (route.length == 1) { //maze at start
                doneCallback(null)
            } else { //reset
                pos = route[0][0]
                nextCol = route[0][1]
                col = m.startcolour
                route = [route[0]]
                iface.playerMarker.move(pos)
                iface.playerMarker.setColour(col)
            }
        }
    )
    var hexFunc = function(hex) {
        var entryPoints = hex.dividers.map(function(x) {return x[0].toString()})
        var hexCol = hex.getColour()
        var hexPos = hex.getPos()
        var moveFunc =  function() {
            var i = entryPoints.indexOf(pos.toString())
            if (i != -1) {
                var dcol = hex.dividers[i][1].getColour()
                if (col == "w" || dcol == "w" || col == dcol) {
                    col = nextCol
                    pos = hexPos
                    nextCol = hexCol
                    iface.playerMarker.move(pos)
                    iface.playerMarker.setColour(col)
                    route.push([pos, hexCol])
                    return
                }
            }
            throw "Invalid Move"
        }
        if (hexPos.toString() == m.end.toString()) {
            return function() {
                moveFunc()
                iface.addRoute(route)
                alert("Complete")
                doneCallback(col)
            }
        } else {
            return moveFunc
        }
    }
    for (var h in hexes) {
        var hex = hexes[h]
        hex.setCallback(hexFunc(hex))
    }
    /*IF EDIT
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
    //FI */
}
