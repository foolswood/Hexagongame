function solver(start_state, moves_func) {
    ways_to = {}
    var traverse = function(state, route) {
        var moves = moves_func(state)
        var next, next_json
        for (var m=0; m<moves.length; m++) {
            next = moves[m]
            next_json = JSON.stringify(next)
            if (ways_to[next_json] === undefined) {
                ways_to[next_json] = [route]
                var new_route = route.slice(0)
                new_route.push(next)
                traverse(next, new_route)
            } else {
                ways_to[next_json].push(route)
            }
        }
    }
    traverse(start_state, [start_state])
    return ways_to
}

function get_std_moves_func(iface) {
    var hexes = {}
    var hex
    for (var h=0; h<iface.hexes.length; h++) {
        hex = iface.hexes[h]
        hexes[hex.position] = hex
    }
    return function(state) {
        var divs = hexes[state.pos].dividers
        var col = hexes[state.pos].colour
        var valid = []
        var divCol
        for (var d=0; d<divs.length; d++) {
            divCol = divs[d][1].colour
            if (state.col == "w" || divCol == "w" || divCol == state.col) {
                valid.push({"pos": divs[d][0], "col": col})
            }
        }
        return valid
    }
}
