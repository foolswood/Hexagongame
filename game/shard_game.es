function gameShardAssemble(iface, m, doneCallback, progress) {
    var returnToMenu = function() {
        shards.destroy()
        doneCallback()
    }
    var hexes = loadMaze(m.maze, iface)
    var positions, col, nextCols
    // Player markers and initial conditions
    var shards = iface.getShardMarkers(m.starts.length)
    var markers = shards.shards
    var n_steps
    var resetMaze = function() {
        if (n_steps === 0) {
            returnToMenu()
        } else {
            positions = m.starts.slice()
            col = m.startColour
            nextCols = positions.map(pos => hexes[pos].colour)
            for (var i = 0; i < positions.length; i++) {
                var marker = markers[i]
                marker.position = positions[i]
                marker.colour = col
                n_steps = 0
            }
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
    var allEqual = function(things, eq) {
        var fstItem = things[0]
        return things.slice(1).every(p => eq(p, fstItem))
    }
    var listEq = function(a, b) {
        if (a.length === b.length) {
            for (var i = 0; i < a.length; i++) {
                if (a[i] !== b[i]) {
                    return false
                }
            }
            return true
        }
        return false
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
                if (allEqual(finishCols, (a, b) => a === b)) {
                    updateCol(finishCols[0])
                } else {
                    updateCol("w")
                }
            }
            n_steps++
            if (allEqual(positions, listEq)) {
                addFinishCol(progress, col)
                iface.winModal(returnToMenu)
            }
        }
        return moveFunc
    }
    for (var h in hexes) {
        var hex = hexes[h]
        hex.callback = hexFunc(hex)
    }
}

mazeModes.shard = gameShardAssemble
