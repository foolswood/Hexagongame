function loadMaze(m, iface) {
    let i, j, c
    let dividers = {}
    let hexes = {}
    //Setup
    iface.clear()
    let newDivider = function(a, b, c) {
        let div = iface.addDivider(a, b, c)
        if (dividers[a] === undefined) {
            dividers[a] = [[b, div]]
        } else {
            dividers[a].push([b, div])
        }
        if (dividers[b] === undefined) {
            dividers[b] = [[a, div]]
        } else {
            dividers[b].push([a, div])
        }
    }
    //Draw
    for (i=0; i<m.length; i++) {
        l = m[i].toLowerCase()
        if ((i+1)%2) { //Hexagon Line
            for (j=0; j<l.length; j++) {
                c = l[j]
                if (c === " ") { //Gaps and impasses
                    continue
                }
                if ((j+1)%2) { //Odd :. Hexagon
                    hexes[[j/2, i/2]] = iface.addHex([j/2, i/2], c)
                } else { //Even :. Divider
                    newDivider([(j-1)/2, i/2], [(j+1)/2, i/2], c)
                }
            }
        } else { //Divider Line
            for (j=0; j<l.length; j++) {
                c = l[j]
                if (c === " ") {
                    continue
                }
                if ((j+1)%2) { //Odd
                    newDivider([j/2, (i-1)/2], [j/2, (i+1)/2], c)
                } else { //Even
                    if ((j+1)%4) { //Not divisible by 4
                        newDivider([(j+1)/2, (i-1)/2], [(j-1)/2, (i+1)/2], c)
                    } else {
                        newDivider([(j-1)/2, (i-1)/2], [(j+1)/2, (i+1)/2], c)
                    }
                }
            }
        }
    }
    iface.maximise()
    for (let hex in hexes) {
        hexes[hex].dividers = dividers[hex]
    }
    return hexes
}

function saveMaze(hexes) {
    let height = 0, width = 0
    let h, pos
    for (h in hexes) {
        pos = hexes[h].position
        if (pos[0] > width) {
            width = pos[0]
        }
        if (pos[1] > height) {
            height = pos[1]
        }
    }
    width++
    height++
    let r, c
    let ms = []
    for (r = 0; r < (height*2)-1; r++) {
        h = []
        for (c = 0; c < (width*2)-1; c++) {
            h.push(" ")
        }
        ms.push(h)
    }
    let hex, divider, d
    for (h in hexes) {
        hex = hexes[h]
        pos = hex.position
        ms[pos[1]*2][pos[0]*2] = hex.colour.toUpperCase()
        for (d in hex.dividers) {
            divider = hex.dividers[d]
            ms[pos[1] + divider[0][1]][pos[0] + divider[0][0]] = divider[1].colour
        }
    }
    ms = ms.map(function (x) {return x.join("")})
    return ms
}
