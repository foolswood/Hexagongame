var xlinkNS="http://www.w3.org/1999/xlink", svgNS="http://www.w3.org/2000/svg";

function SVGUIElement(svg_iface, dom_elem, colour_fill) {
    var colour, position, _current_cb

    this.__defineSetter__("position", function(pos) {
        var loc = svg_iface.svgCoord(pos)
        dom_elem.setAttribute("transform", "translate(" + loc[0] + "," + loc[1] + ")")
        position = pos
    })

    this.__defineGetter__("position", function() {
        return position
    })

    if (colour_fill) {
        this.__defineSetter__("colour", function(col) {
            dom_elem.setAttribute("fill", "url(#"+col+")")
            colour = col
        })
    } else {
        this.__defineSetter__("colour", function(col) {
            dom_elem.setAttribute("stroke", svg_iface.strokeColourMap[col])
            colour = col
        })
    }
    this.__defineGetter__("colour", function() {
        return colour
    })

    this.__defineSetter__("visible", function(bool) {
        if (bool) {
            dom_elem.removeAttribute("display")
        } else {
            dom_elem.setAttribute("display", "none")
        }
    })

    this.__defineSetter__("callback", function(func) {
        if (_current_cb !== undefined) {
            dom_elem.removeEventListener('click', _current_cb)
        }
        dom_elem.addEventListener('click', func)
        _current_cb = func
    })
}

function SVGInterface(element_id) {
    var svg = document.getElementById(element_id).getSVGDocument()
	var hexGroup = svg.getElementById("hexes")
	var dividerGroup = svg.getElementById("dividers")
    var routeGroup = svg.getElementById("route")
    var finishMarkers = svg.getElementById("finishMarkers")
    var playerMarkers = svg.getElementById("playerMarkers")
    var defs = svg.getElementsByTagName("defs")[0]

    // Data that I would rather wasn't here
    this.strokeColourMap = { //Colours for dividing lines
        "w": "white",
        "k": "#252525",
        "r": "red",
        "g": "forestgreen",
        "b": "blue",
        "y": "yellow",
        "p": "magenta"
    }

    var hexHeight = 866
    var hexWidth = 1001
    var shardClipRadius = 250 // Bigger than player circle

    var finishPositions = [[370, 0], [185, 320], [-185, 320], [-370, 0], [-185, -320], [185, -320]];
    // End of data that should be in the svg file really

    this.hexes = []
    this.endMarker = new SVGUIElement(this, svg.getElementById("end"), true)
    this.upArrow = new SVGUIElement(this, svg.getElementById("upArrow"), true)
    this.playMeta = new SVGUIElement(this, svg.getElementById("playMeta"), true)

    function shardPointStr(angle) {
        return Math.sin(angle) * shardClipRadius + "," + Math.cos(angle) * shardClipRadius
    }

    this.getShardMarkers = function(nShards) {
        if (nShards === 1) {
            var playerMarkerUse = this.svgNewUse("playerMarker", true)
            playerMarkers.appendChild(playerMarkerUse[1])
            return {
                shards: [playerMarkerUse[0]],
                destroy: () => playerMarkerUse[1].remove()}
        }
        var degPerShard = 2 * Math.PI / nShards
        var rmElems = []
        var shards = []
        for (var s=0; s<nShards; s++) {
            var shardStart = shardPointStr(degPerShard * s)
            var shardEnd = shardPointStr(degPerShard * (s + 1))
            var path = svg.createElementNS(svgNS, "path")
            path.setAttribute(
                "d",
                "M 0 0 " +
                "L " + shardStart +
                " A " + shardClipRadius + " " + shardClipRadius + " 0 0 0 " + shardEnd +
                " Z")
            var clipPath = svg.createElementNS(svgNS, "clipPath")
            var clipPathId = "playerMarkerClip" + s
            clipPath.setAttribute("id", clipPathId)
            clipPath.appendChild(path)
            defs.appendChild(clipPath)
            rmElems.push(clipPath)
            var playerMarkerUse = this.svgNewUse("playerMarker", true)
            playerMarkerUse[1].setAttribute("clip-path", "url(#" + clipPathId + ")")
            playerMarkers.appendChild(playerMarkerUse[1])
            rmElems.push(playerMarkerUse[1])
            shards.push(playerMarkerUse[0])
        }
        return {shards: shards, destroy: () => rmElems.map((n) => n.remove())}
    }

    this.svgCoord = function(pos) {
        var x = ((0.75*pos[0])+0.5)*hexWidth
        var y = ((pos[1]+((pos[0]%2)*0.5))+0.5)*hexHeight
        return [x, y]
    }

    this.svgNewUse = function(type, colour_fill) {
        if (colour_fill === undefined) {
            colour_fill = false
        }
        //Creates a new svgUse object
        var nu = svg.createElementNS(svgNS, "use")
        nu.setAttributeNS(xlinkNS, "href", "#"+type)
        var uie = new SVGUIElement(this, nu, colour_fill)
        return [uie, nu]
    }

    this.addDivider = function(a, b, colour) {
        var divider
        if (a[0] === b[0]) { //a on top of b
            divider = this.svgNewUse("center")
            divider[0].position = a
        } else {
            if (b[1] === a[1]) { //Same Line
                if (a[0]%2) { //Odd Rows
                    divider = this.svgNewUse("left")
                    divider[0].position = b
                } else { //Even Rows
                    divider = this.svgNewUse("right")
                    divider[0].position = a
                }
            } else { //Line Below
                if (a[0] - b[0] === 1) {
                    divider = this.svgNewUse("left")
                    divider[0].position = a
                } else {
                    divider = this.svgNewUse("right")
                    divider[0].position = a
                }
            }
        }
        divider[0].colour = colour
        dividerGroup.appendChild(divider[1])
        return divider[0]
    }

    this.addHex = function(pos, colour) {
        var hex = this.svgNewUse("hex", true);
        hexGroup.appendChild(hex[1])
        hex[0].colour = colour
        hex[0].position = pos
        this.hexes.push(hex[0])
        return hex[0]
    }

    this.addFinishMarkers = function(pos, n) {
        var loc = this.svgCoord(pos)
        var elem, x, y
        var elems = []
        for (var i=0; i<n; i++) {
            elem = this.svgNewUse("finishCircle", true)
            x = loc[0] + finishPositions[i][0]
            y = loc[1] + finishPositions[i][1]
            elem[1].setAttribute("x", x)
            elem[1].setAttribute("cx", x)
            elem[1].setAttribute("y", y)
            elem[1].setAttribute("cy", y)
            finishMarkers.appendChild(elem[1])
            elem[0].move = function(pos) {console.log("Moving finish markers is not supported")}
            elems.push(elem[0])
        }
        return elems
    }

    this.revealMetaMarkers = function(pos, upCb, playCb) {
        this.upArrow.position = pos
        this.upArrow.visible = true
        this.upArrow.callback = upCb
        this.playMeta.position = pos
        this.playMeta.visible = true
        this.playMeta.callback = playCb
    }

    this.addRoute = function(route) {
		var end, start = this.svgCoord(route[0][0])
		var elem, i, c = route[0][1]
		for (i = 1; i < route.length; i++) {
			end = this.svgCoord(route[i][0])
			elem = svg.createElementNS(svgNS, "line")
			elem.setAttribute("stroke", this.strokeColourMap[c])
			elem.setAttribute("x1", start[0])
			elem.setAttribute("y1", start[1])
			elem.setAttribute("x2", end[0])
			elem.setAttribute("y2", end[1])
			routeGroup.appendChild(elem)
			c = route[i][1]
			start = end
		}
    }

    var clearChildren = function(p) {
        //Remove all children of group.
        while (p.childNodes.length >= 1) {
            p.removeChild(p.firstChild);
        }
    }

    this.clearRoutes = function() {
        clearChildren(routeGroup)
    }

    this.clear = function() {
        clearChildren(hexGroup)
        clearChildren(dividerGroup)
        clearChildren(routeGroup)
        clearChildren(finishMarkers)
        this.hexes = []
        this.endMarker.visible = false
        this.upArrow.visible = false
        this.playMeta.visible = false
    }

    this.hexBounds = function(hex) {
        var svgPos = this.svgCoord(hex.position)
        return [svgPos[0]-(hexWidth/2), svgPos[1]-(hexHeight/2), svgPos[0]+(hexWidth/2), svgPos[1]+(hexHeight/2)]
    }

    this.mazeBounds = function() {
        if (this.hexes.length === 0) {
            [0, 0, 1, 1]
        }
        var hex = this.hexes[0]
        var bounds = this.hexBounds(hex)
        for (var h=1; h<this.hexes.length; h++) {
            hex = this.hexes[h]
            var hexbounds = this.hexBounds(hex)
            if (hexbounds[0] < bounds[0]) {
                bounds[0] = hexbounds[0]
            }
            if (hexbounds[1] < bounds[1]) {
                bounds[1] = hexbounds[1]
            }
            if (hexbounds[2] > bounds[2]) {
                bounds[2] = hexbounds[2]
            }
            if (hexbounds[3] > bounds[3]) {
                bounds[3] = hexbounds[3]
            }
        }
        bounds[2] = bounds[2] - bounds[0]
        bounds[3] = bounds[3] - bounds[1]
        return bounds
    }

    this.maximise = function() {
        svg.getElementById("gameGrid").setAttribute("viewBox", this.mazeBounds().join(" "))
    }

    this.winModal = function(cb) {
        var greyBox = svg.getElementById("modalBg")
        var bounds = this.mazeBounds()
        greyBox.setAttribute("x", bounds[0])
        greyBox.setAttribute("y", bounds[1])
        greyBox.setAttribute("width", bounds[2] + bounds[0])
        greyBox.setAttribute("height", bounds[3] + bounds[1])
        greyBox.removeAttribute("display");
        var modalClicked = function(evt) {
            greyBox.setAttribute("display", "none");
            cb();
        }
        greyBox.addEventListener('click', modalClicked)
    }
}
