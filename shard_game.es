function gameShardAssemble(iface, m, doneCallback) {
    var hexes = loadMaze(m.maze, iface)
    var positions, col, nextCols
    // Player markers and initial conditions
    markers = iface.getShardMarkers(m.starts.length)
    var resetMaze = function() {
        positions = m.starts.slice()
        col = m.startColour
        nextCols = positions.map(pos => hexes[pos].colour)
        for (var i = 0; i < positions.length; i++) {
            var marker = markers[i]
            marker.position = positions[i]
            marker.colour = col
        }
    }
    resetMaze()
    for (var marker in markers) {
        markers[marker].callback = resetMaze
    }
    var updateCol = function(c) {
        col = c
        for (var m in markers) {
            markers[m].colour = col
        }
    }
    var updatePos = function(posIdx, p) {
        positions[posIdx] = p
        markers[posIdx].position = p
    }
    var allEqual = function(things) {
        var fstItem = things[0]
        return things.slice(1).every(p => p === fstItem)
    }
    updateCol(m.startColour)
    var hexFunc = function (hex) {
        var entryPoints = hex.dividers.map(x => x[0].toString())
        var hexCol = hex.colour
        var hexPos = hex.position
        var moveFunc =  function() {
            var indices = positions.map(pos => entryPoints.indexOf(pos.toString()))
            var finishCols = []
            for (var posIdx = 0; posIdx < indices.length; posIdx++) {
                var divIdx = indices[posIdx]
                if (divIdx != -1) {
                    var dcol = hex.dividers[divIdx][1].colour
                    if (col === "w" || dcol === "w" || col === dcol) {
                        finishCols.push(nextCols[posIdx])
                        updatePos(posIdx, hexPos)
                        nextCols[posIdx] = hexCol
                    }
                }
            }
            if (finishCols.length === 0) {
                return
            } else {
                if (allEqual(finishCols)) {
                    updateCol(finishCols[0])
                } else {
                    updateCol("w")
                }
            }
            if (allEqual(positions)) {
                alert("Win")
                doneCallback(col)
            }
        }
        return moveFunc
    }
    for (var h in hexes) {
        var hex = hexes[h]
        hex.callback = hexFunc(hex)
    }
}
