function solver(start_state, moves_func, end) {
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
                if (!is_win_state(next, end)) {
                    traverse(next, new_route)
                }
            } else {
                ways_to[next_json].push(route)
            }
        }
    }
    traverse(start_state, [start_state])
    return ways_to
}

function get_shard_moves_func(iface) {
    var hexes = {}
    var hex
    for (var h=0; h<iface.hexes.length; h++) {
        hex = iface.hexes[h]
        hexes[hex.position] = hex
    }
    var moves_from = function(state) {
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
    return function(state) {
        var perShardSolutions = []
        for (var shardIdx=0; shardIdx<state.pos.length; shardIdx++) {
            perShardSolutions.push(moves_from({"pos": state.pos[shardIdx], "col": state.col}))
        }
        var fullSolutions = []
        for (var shardIdx=0; shardIdx<perShardSolutions.length; shardIdx++) {
            for (var i=0; i<perShardSolutions[shardIdx].length; i++) {
                // Fill in all of the other slices of the solution from the state
                var solution = {"pos": state.pos.slice(0), "col": perShardSolutions[shardIdx][i].col}
                solution.pos[shardIdx] = perShardSolutions[shardIdx][i].pos
                for (var otherShardIdx=shardIdx+1; otherShardIdx<perShardSolutions.length; otherShardIdx++) {
                    var possibleMatches = perShardSolutions[otherShardIdx]
                    for (var j=0; j<possibleMatches.length; j++) {
                        if (solution.pos[shardIdx].toString() === possibleMatches[j].pos.toString()) {
                            if (solution.col !== possibleMatches[j].col) {
                                solution.col = "w"
                            }
                            solution.pos[otherShardIdx] = possibleMatches[j].pos
                            possibleMatches.splice(j, 1)
                        }
                    }
                }
                fullSolutions.push(solution)
            }
        }
        return fullSolutions
    }
}

function is_win_state(state, end) {
    for (var i=1; i<state.pos.length; i++) {
        if (state.pos[i].toString() !== state.pos[0].toString()) {
            return false
        }
    }
    if (end !== undefined) {
        return state.pos[0].toString() === end.toString()
    }
    return true
}
