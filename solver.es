var solver = function(start_state, moves_func) {
    ways_to = {}
    var traverse = function(state, route) {
        var moves = moves_func(state)
        var next
        for (var m=0; m<moves.length; m++) {
            next = moves[m]
            if (ways_to[next] === undefined) {
                ways_to[next] = [route]
                var new_route = route.slice(0)
                new_route.push(next)
                traverse(next, new_route)
            } else {
                ways_to[next].push(route)
            }
        }
    }
    traverse(start_state, [start_state])
    return ways_to
}

get_std_moves_func = function(iface) {
    var hexes = {}
    var hex
    for (var h=0; h<iface.hexes.length; h++) {
        hex = iface.hexes[h]
        hexes[hex.position] = hex
    }
    return function(state) {
        var divs = hexes[state[0]].dividers
        var col = hexes[state[0]].colour
        var valid = []
        var divCol
        for (var d=0; d<divs.length; d++) {
            divCol = divs[d][1].colour
            if (state[1] == "w" || divCol == "w" || divCol == state[1]) {
                valid.push([divs[d][0], col])
            }
        }
        return valid
    }
}
