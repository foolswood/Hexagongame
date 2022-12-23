function shardMoves(iface, m) {
    const hexes = loadMaze(m.maze, iface)
    this.hexes = hexes
    const shards = iface.getShardMarkers(m.starts.length)
    this.cleanUp = function() {
        shards.destroy()
    }
    const markers = shards.shards
    this.setMarkerCb = function(cb) {
        for (let marker in markers) {
            markers[marker].callback = cb
        }
    }
    let col
    let updateCol = function(c) {
        col = c
        for (let m in markers) {
            markers[m].colour = col
        }
        return c
    }
    let nextCols, routes = [[]]
    this.reset = function() {
        updateCol(m.startColour)
        nextCols = m.starts.map(pos => hexes[pos].colour)
        routes = m.starts.map(pos => [[pos, col]])
        for (let i = 0; i < m.starts.length; i++) {
            markers[i].position = m.starts[i]
        }
    }
    this.reset()
    this.isAtStart = function() {
        return routes.every((route) => route.length === 1)
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
    this.state = function() {
        return {pos: markers.map(marker => marker.position), col: col}
    }
    this.finished = function() {
        const positions = markers.map(marker => marker.position)
        return (allEqual(positions, listEq) && (
            m.end === undefined ||
            m.end.toString() === positions[0].toString()))
    }
    this.getHexFunc = function(hex) {
        let entryPoints = hex.dividers.map(x => x[0].toString())
        let hexCol = hex.colour
        let hexPos = hex.position
        // Returns null for invalid moves, or the resulting colour
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
                return null
            }
            if (allEqual(finishCols, (a, b) => a === b)) {
                updateCol(finishCols[0])
            } else {
                updateCol("w")
            }
            for (let mIdx = 0; mIdx < routes.length; mIdx++) {
                routes[mIdx].push([markers[mIdx].position, col])
            }
            return col
        }
        return moveFunc
    }
    this.hexFuncsSetup = function(getHexFunc) {
        for (let h in hexes) {
            const hex = hexes[h]
            hex.callback = getHexFunc(hex)
        }
        if (m.end !== undefined) {
            iface.endMarker.position = m.end
            iface.endMarker.visible = true
            iface.endMarker.callback = hexes[m.end].callback
        }
    }
    this.showWin = function(cb) {
        routes.forEach((route) => iface.addRoute(route))
        iface.winModal(cb, markers[0].position)
    }
}
