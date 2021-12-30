function gameShardAssemble(iface, m, doneCallback, progress, saveProgressCb) {
    const hexes = loadMaze(m.maze, iface)
    const shards = iface.getShardMarkers(m.starts.length)
    const returnToMenu = function(col) {
        shards.destroy()
        doneCallback(col)
    }
    this.abort = () => shards.destroy()  // Used by editor
    let markers = shards.shards
    let col
    let updateCol = function(c) {
        col = c
        for (let m in markers) {
            markers[m].colour = col
        }
    }
    let nextCols, routes = [[]]
    let resetMaze = function() {
        if (routes.every((route) => route.length === 1)) {
            returnToMenu(null)
        } else {
            updateCol(m.startColour)
            nextCols = m.starts.map(pos => hexes[pos].colour)
            routes = m.starts.map(pos => [[pos, col]])
            for (let i = 0; i < m.starts.length; i++) {
                markers[i].position = m.starts[i]
            }
        }
    }
    resetMaze()
    for (let marker in markers) {
        markers[marker].callback = resetMaze
    }
    let allEqual = function(things, eq) {
        let fstItem = things[0]
        return things.slice(1).every(p => eq(p, fstItem))
    }
    let listEq = function(a, b) {
        if (a.length === b.length) {
            for (let i = 0; i < a.length; i++) {
                if (a[i] !== b[i]) {
                    return false
                }
            }
            return true
        }
        return false
    }
    const finished = function(positions) {
        return (allEqual(positions, listEq) && (
            m.end === undefined ||
            m.end.toString() === positions[0].toString()))
    }
    let hexFunc = function(hex) {
        let entryPoints = hex.dividers.map(x => x[0].toString())
        let hexCol = hex.colour
        let hexPos = hex.position
        let moveFunc =  function() {
            let finishCols = []
            for (let mIdx = 0; mIdx < markers.length; mIdx++) {
                let divIdx = entryPoints.indexOf(
                    markers[mIdx].position.toString())
                if (divIdx != -1) {
                    let dcol = hex.dividers[divIdx][1].colour
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
            for (let mIdx = 0; mIdx < routes.length; mIdx++)
            {
                routes[mIdx].push([markers[mIdx].position, col])
            }
            if (finished(markers.map(m => m.position))) {
                addFinishCol(progress, col)
                saveProgressCb()
                routes.forEach((route) => iface.addRoute(route))
                iface.winModal(() => returnToMenu(col), markers[0].position)
            }
        }
        return moveFunc
    }
    for (let h in hexes) {
        const hex = hexes[h]
        hex.callback = hexFunc(hex)
    }
    if (m.end !== undefined) {
        iface.endMarker.position = m.end
        iface.endMarker.visible = true
        iface.endMarker.callback = hexes[m.end].callback
    }
}

mazeModes.shard = gameShardAssemble
