function solver(start_state, moves_func, end) {
    ways_to = {}
    const seen = function(state, route) {
        const state_json = JSON.stringify(state)
        if (ways_to[state_json] !== undefined)
        {
            ways_to[state_json].push(route)
            return true
        }
        ways_to[state_json] = [route]
        return false
    }
    let unexplored = [[start_state, [start_state]]]
    while (unexplored.length) {
        const exploring = unexplored
        unexplored = []
        for (const x of exploring) {
            for (const next of moves_func(x[0])) {
                const next_route = x[1].slice(0)
                next_route.push(next)
                if (!seen(next, next_route)) {
                    unexplored.push([next, next_route])
                }
            }
        }
    }
    return ways_to
}

function get_shard_moves_func(iface) {
    let hexes = {}
    for (let h=0; h<iface.hexes.length; h++) {
        const hex = iface.hexes[h]
        hexes[hex.position] = hex
    }
    const moves_from = function(state) {
        const divs = hexes[state.pos].dividers
        const col = hexes[state.pos].colour
        let valid = []
        for (let d=0; d<divs.length; d++) {
            const divCol = divs[d][1].colour
            if (state.col === "w" || divCol === "w" || divCol === state.col) {
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
