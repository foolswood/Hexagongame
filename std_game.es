function addFinishCol(s, c) {
    if (s.includes(c)) {
        return s
    } else {
        return s + c
    }
}

function gameStandard(iface, m, doneCallback, progress) {
    var hexes = loadMaze(m.maze, iface)
    var pos, col, nextCol
    //End marker
    iface.endMarker.position = m.end
    iface.endMarker.visible = true
    //Player marker and initial conditions
    if (m.startColour === undefined)
        m.startColour = "w"
    col = m.startColour
    pos = m.start
    nextCol = hexes[pos].colour
    iface.playerMarker.colour = col
    iface.playerMarker.position = pos
    iface.playerMarker.visible = true
    //Route
    var route = [[pos, col]];
    iface.playerMarker.callback = function() {
        //resets maze
        if (route.length === 1) { //maze at start
            doneCallback(null)
        } else { //reset
            pos = route[0][0]
            nextCol = hexes[m.start].colour
            col = m.startColour
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
                if (col === "w" || dcol === "w" || col === dcol) {
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
        if (hexPos.toString() === m.end.toString()) {
            return function() {
                moveFunc()
                progress.finishCols = addFinishCol(progress.finishCols, col)
                iface.addRoute(route)
                iface.winModal(doneCallback)
            }
        } else {
            return moveFunc
        }
    }
    for (var h in hexes) {
        var hex = hexes[h]
        hex.callback = hexFunc(hex)
    }
}
