function loadStdMenu(iface, ms, goUp, progress, saveProgressCb) {
    var ensureSubObject = function(obj, attr, defaultSub) {
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
    var colView = function(obj, attr) {
        var c = obj[attr]
        if (c === undefined) {
            return "n"
        } else {
            return c
        }
    }
    var getFinishFor = function(loc) {
        return colView(progress.chosenFinishes, loc)
    }
    var getProgressFor = function(loc) {
        return ensureSubObject(progress.sub, loc)
    }
    //Generate metaMaze
    var line, c, ml, x, y, cb, count = 0, mm = [], mazeHexes = []
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
                var loc = [x/2, y/2]
                ml += getFinishFor(loc)
                mazeHexes.push([x/2, y/2])
            } else {
                ml += c
            }
        }
        mm.push(ml)
    }
    ms.maze = mm  //This should pull data from there rather than pushing it in
    var playMazeFunc = function(i) {
        return function() {
            iface.clear()
            playMaze(
                iface, ms.mazes[i], show, getProgressFor(mazeHexes[i]),
                saveProgressCb)
        }
    }
    var finishMarkerCb = function(hex, loc, finIdx, hexes) {
        return function() {
            var c = getFinishCol(getProgressFor(loc), finIdx)
            hex.colour = c
            ensureSubObject(progress, 'chosenFinishes')[loc] = c
            saveProgressCb()
            ms.maze = saveMaze(hexes)
        }
    }
    var show = function() {
        //Cache the callbacks?
        var hexes = loadMaze(ms.maze, iface)
        var i, j, hex, pos, markers
        for (i=0; i<mazeHexes.length; i++) {
            pos = mazeHexes[i]
            hex = hexes[pos]
            hex.callback = playMazeFunc(i)
            var maze = ms.mazes[i]
            var p = getProgressFor(pos)
            markers = iface.addFinishMarkers(pos, maze.nEnds)
            for (j=0; j<maze.nEnds; j++) {
                markers[j].callback = finishMarkerCb(hex, pos, j, hexes)
                markers[j].colour = getFinishCol(p, j)
            }
        }
        var playMeta = function () {
            iface.clear()
            gameStandard(iface, ms, show, progress, saveProgressCb)
        }
        iface.revealMetaMarkers(ms.end, goUp, playMeta)
    }
    show()
}

mazeModes.menu = loadStdMenu
