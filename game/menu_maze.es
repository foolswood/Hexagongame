function loadStdMenu(iface, ms, goUp, progress, saveProgressCb) {
    let ensureSubObject = function(obj, attr, defaultSub) {
        if (defaultSub === undefined) {
            defaultSub = {}
        }
        if (obj[attr] === undefined) {
            obj[attr] = defaultSub
        }
        return obj[attr]
    }
    ensureSubObject(progress, "chosenFinishes")
    ensureSubObject(progress, "sub")
    ensureSubObject(progress, "finishCols", "")
    let colView = function(obj, attr) {
        let c = obj[attr]
        if (c === undefined) {
            return "n"
        } else {
            return c
        }
    }
    let getFinishFor = function(loc) {
        return colView(progress.chosenFinishes, loc)
    }
    let getProgressFor = function(loc) {
        return ensureSubObject(progress.sub, loc)
    }
    //Generate metaMaze
    let line, c, ml, x, y, cb, count = 0, mm = [], mazeHexes = []
    for (y = 0; y < ms.mazeLayout.length; y++) {
        line = ms.mazeLayout[y]
        if (y%2) { //Odd (divider line)
            mm.push(line)
            continue
        }
        ml = ""
        for (x = 0; x < line.length; x++) {
            c = line[x]
            if (c === "?") {
                let loc = [x/2, y/2]
                ml += getFinishFor(loc)
                mazeHexes.push([x/2, y/2])
            } else {
                ml += c
            }
        }
        mm.push(ml)
    }
    ms.maze = mm  //This should pull data from there rather than pushing it in
    let playMazeFunc = function(i) {
        return function() {
            iface.clear()
            playMaze(
                iface, ms.mazes[i], (col) => show(col, i), getProgressFor(mazeHexes[i]),
                saveProgressCb)
        }
    }
    const isColoured = function(hex)
    {
        return hex.colour !== 'n'
    }
    let finishMarkerCb = function(hex, loc, finIdx, hexes) {
        return function() {
            const c = getFinishCol(getProgressFor(loc), finIdx)
            const wasUncoloured = !isColoured(hex)
            hex.colour = c
            ensureSubObject(progress, 'chosenFinishes')[loc] = c
            saveProgressCb()
            ms.maze = saveMaze(hexes)
            if (wasUncoloured && Object.values(hexes).every(isColoured))
                iface.playMeta.flash()
        }
    }
    const show = function(col, highlightIdx) {
        if (typeof setHelp !== 'undefined')
            setHelp("menu")
        //Cache the callbacks?
        const hexes = loadMaze(ms.maze, iface)
        for (let i=0; i<mazeHexes.length; i++) {
            const pos = mazeHexes[i]
            const hex = hexes[pos]
            hex.callback = playMazeFunc(i)
            const maze = ms.mazes[i]
            const p = getProgressFor(pos)
            const markers = iface.addFinishMarkers(pos, maze.nEnds)
            for (let j=0; j<maze.nEnds; j++) {
                markers[j].callback = finishMarkerCb(hex, pos, j, hexes)
                markers[j].colour = getFinishCol(p, j)
                if (col === markers[j].colour && i === highlightIdx)
                    markers[j].flash()
            }
        }
        const playMeta = function () {
            iface.clear()
            gameStandard(iface, ms, (col) => show(col, -1), progress, saveProgressCb)
        }
        iface.revealMetaMarkers(ms.end, goUp, playMeta)
        if (highlightIdx === -1)
            iface.upArrow.flash()
    }
    show(null, null)
}

mazeModes.menu = loadStdMenu
