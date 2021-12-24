function solver(start_state, moves_func, end) {
    ways_to = {}
    let traverse = function(state, route) {
        let moves = moves_func(state)
        let next, next_json
        for (let m=0; m<moves.length; m++) {
            next = moves[m]
            next_json = JSON.stringify(next)
            if (ways_to[next_json] === undefined) {
                ways_to[next_json] = [route]
                let new_route = route.slice(0)
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
    let hexes = {}
    let hex
    for (let h=0; h<iface.hexes.length; h++) {
        hex = iface.hexes[h]
        hexes[hex.position] = hex
    }
    let moves_from = function(state) {
        let divs = hexes[state.pos].dividers
        let col = hexes[state.pos].colour
        let valid = []
        let divCol
        for (let d=0; d<divs.length; d++) {
            divCol = divs[d][1].colour
            if (state.col == "w" || divCol == "w" || divCol == state.col) {
                valid.push({"pos": divs[d][0], "col": col})
            }
        }
        return valid
    }
    return function(state) {
        let perShardSolutions = []
        for (let shardIdx=0; shardIdx<state.pos.length; shardIdx++) {
            perShardSolutions.push(moves_from({"pos": state.pos[shardIdx], "col": state.col}))
        }
        let fullSolutions = []
        for (let shardIdx=0; shardIdx<perShardSolutions.length; shardIdx++) {
            for (let i=0; i<perShardSolutions[shardIdx].length; i++) {
                // Fill in all of the other slices of the solution from the state
                let solution = {"pos": state.pos.slice(0), "col": perShardSolutions[shardIdx][i].col}
                solution.pos[shardIdx] = perShardSolutions[shardIdx][i].pos
                for (let otherShardIdx=shardIdx+1; otherShardIdx<perShardSolutions.length; otherShardIdx++) {
                    let possibleMatches = perShardSolutions[otherShardIdx]
                    for (let j=0; j<possibleMatches.length; j++) {
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
    for (let i=1; i<state.pos.length; i++) {
        if (state.pos[i].toString() !== state.pos[0].toString()) {
            return false
        }
    }
    if (end !== undefined) {
        return state.pos[0].toString() === end.toString()
    }
    return true
}
