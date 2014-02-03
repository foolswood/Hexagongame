function loadSet(iface, ms, progress=null) {
	if (progress == null) {
		//Generate the progress 
        var m, i, s;
        progress = [];
        for (m = 0; m < ms.mazes.length; m++) {
            s = []
            for (i = 0; i < ms.mazes[m].nEnds; i++)
                s.push("n")
            progress.push(s)
        }
        s = []
        for (i = 0; i < ms.nEnds; i++) {
            s.push("n")
        }
        progress.push(s);
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
            if (c == "?") {
                cb = function(col) {
                    updateProgress(progress[count], col)
                }
                ml += progress[count++][0]
                mazeHexes.push([x/2, y/2])
            } else {
                ml += c
            }
        }
        mm.push(ml)
    }
    ms.maze = mm  //This should pull data from there rather than pushing it in
    var updateProgress = function(prog, col) {
        if (col != null) {
            for (var p=0; p<prog.length; p++) {
                if (prog[p] == "n") {  // Finished in a new colour
                    prog[p] = col
                    break
                } else if (prog[p] == col) {  // Finished a second time in the same colour
                    break
                }
            }
        }
        show()
    }
    var playMazeFunc = function(i) {
        return function() {
            iface.clear()
            gameStandard(iface, ms.mazes[i], function(col) {updateProgress(progress[i], col)})
        }
    }
    var finishMarkerCb = function(hex, i, j, hexes) {
        return function() {
            hex.colour = progress[i][j]
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
            markers = iface.addFinishMarkers(pos, progress[i].length)
            for (j=0; j<progress[i].length; j++) {
                markers[j].callback = finishMarkerCb(hex, i, j, hexes)
                markers[j].colour = progress[i][j]
            }
        }
        hex = hexes[ms.end]
        hex.callback = function () {
            iface.clear()
            gameStandard(iface, ms, function (col) {updateProgress(progress[i], col)})
        }
        markers = iface.addFinishMarkers(ms.end, progress[i].length, true)
        for (j=0; j<progress[i].length; j++) {
            markers[j].colour = progress[i][j]
        }
    }
    show()
}
