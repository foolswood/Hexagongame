function gameShardAssemble(iface, m, doneCallback, progress, saveProgressCb) {
    var hexes = loadMaze(m.maze, iface)
    if (m.end !== undefined) {
        iface.endMarker.position = m.end
        iface.endMarker.visible = true
    }
    var col, nextCols
    // Player markers and initial conditions
    var shards = iface.getShardMarkers(m.starts.length)
    var returnToMenu = function() {
        shards.destroy()
        doneCallback()
    }
    var markers = shards.shards
    var updateCol = function(c) {
        col = c
        for (var m in markers) {
            markers[m].colour = col
        }
    }
    var n_steps
    var resetMaze = function() {
        if (n_steps === 0) {
            returnToMenu()
        } else {
            updateCol(m.startColour)
            nextCols = m.starts.map(pos => hexes[pos].colour)
            for (var i = 0; i < m.starts.length; i++) {
                markers[i].position = m.starts[i]
            }
            n_steps = 0
        }
    }
    resetMaze()
    for (var marker in markers) {
        markers[marker].callback = resetMaze
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
    var finished = function(positions) {
        return (allEqual(positions, listEq) && (
            m.end === undefined ||
            m.end.toString() === positions[0].toString()))
    }
    var hexFunc = function(hex) {
        var entryPoints = hex.dividers.map(x => x[0].toString())
        var hexCol = hex.colour
        var hexPos = hex.position
        var moveFunc =  function() {
            var finishCols = []
            for (var mIdx = 0; mIdx < markers.length; mIdx++) {
                var divIdx = entryPoints.indexOf(
                    markers[mIdx].position.toString())
                if (divIdx != -1) {
                    var dcol = hex.dividers[divIdx][1].colour
                    if (col === "w" || dcol === "w" || col === dcol) {
                        finishCols.push(nextCols[mIdx])
                        markers[mIdx].position = hexPos
                        nextCols[mIdx] = hexCol
                    }
                }
            }
            if (finishCols.length === 0) {
                return
            }
            if (allEqual(finishCols, (a, b) => a === b)) {
                updateCol(finishCols[0])
            } else {
                updateCol("w")
            }
            n_steps++
            if (finished(markers.map(m => m.position))) {
                addFinishCol(progress, col)
                iface.winModal(returnToMenu)
                saveProgressCb()
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
