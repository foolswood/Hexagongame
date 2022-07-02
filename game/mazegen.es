function randCol(nColours, divider)
{
    const allColours = "RGBYKP"  // In order we'd want to use them
    let c = allColours[Math.floor(Math.random() * nColours)]
    return divider ? c.toLowerCase() : c
}

function genMazeLayout(xsize, ysize, nColours) {
    let layout = []
    for (let y = 0; y < ysize; y++)
    {
        let row = ""
        for (let x = 0; x < (xsize * 2) - 1; x++) {
            row += randCol(nColours, x % 2 == 1)
        }
        layout.push(row)
        if (y !== ysize - 1)  // Don't want dividers after last line
        {
            row = ""
            for (let x = 0; x < (xsize * 2) - 1; x++) {
                row += randCol(nColours, true)
            }
            layout.push(row)
        }
    }
    return layout;
}

function genMultiplayerMaze() {
    const nColours = 4
    return {
        "mode": "shard",
        "maze": genMazeLayout(6, 6, nColours),
        "starts": [[1,1], [4,4]],
        "startColour": randCol(nColours, true)
    }
}
