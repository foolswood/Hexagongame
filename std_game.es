function gameStandard(iface, m, doneCallback) {
    var hexes = loadMaze(m.maze, iface)
    var pos, col, nextCol
    //End marker
    iface.endMarker.position = m.end
    iface.endMarker.visible = true
    //Player marker and initial conditions
    if (m.startcolour === undefined)
        m.startcolour = "w"
    col = m.startcolour
    pos = m.start
    nextCol = hexes[pos].colour
    iface.playerMarker.colour = col
    iface.playerMarker.position = pos
    iface.playerMarker.visible = true
    //Route
    var route = [[pos, col]];
    iface.playerMarker.callback = function() {
        //resets maze
        if (route.length == 1) { //maze at start
            doneCallback(null)
        } else { //reset
            pos = route[0][0]
            nextCol = hexes[m.start].colour
            col = m.startcolour
            route = [route[0]]
            iface.playerMarker.position = pos
            iface.playerMarker.colour = col
        }
    }
    var hexFunc = function(hex) {
        var entryPoints = hex.dividers.map(function(x) {return x[0].toString()})
        var hexCol = hex.colour
        var hexPos = hex.position
        var moveFunc =  function() {
            var i = entryPoints.indexOf(pos.toString())
            if (i != -1) {
                var dcol = hex.dividers[i][1].colour
                if (col == "w" || dcol == "w" || col == dcol) {
                    col = nextCol
                    pos = hexPos
                    nextCol = hexCol
                    iface.playerMarker.position = pos
                    iface.playerMarker.colour = col
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
        hex.callback = hexFunc(hex)
    }
    this.get_moves = function(state) {
        var divs = hexes[state[0]].dividers
        var col = hexes[state[0]].colour
        var valid = []
        var divCol
        for (var d=0; d<divs.length; d++) {
            divCol = divs[d][1].colour
            if (state[1] == "w" || divCol == "w" || divCol == state[1]) {
                valid.push([divs[d][0], col])
            }
        }
        return valid
    }
}
