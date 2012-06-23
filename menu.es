var game;

function loadSet(ms, progress) {
	//Constructs a mazeSet object
	this.nMazes = ms.mazes.length;
	if (progress == null) {
		//Generate the progress data structure
		function genProgress(mazes) { //This insane construction exists because you can't delete a local variable
			var m, i, s;
			progress = [];
			for (m = 0; m < mazes.length; m++) {
				s = "";
				for (i = 0; i <= mazes[m].nEnds; i++)
					s += "n";
				progress.push(s);
			}
			s = "";
			for (i = 0; i <= ms.nEnds; i++) {
				s+= "n";
			}
			progress.push(s);
			return progress;
		}
		progress = genProgress(ms.mazes);
	}
	function genMeta() {
		//Generate metaMaze and hexLocs (if first run)
		var dohl, line, c, ml, x, y, count = 0, mm = [];
		(hexLocs.length == 0) ? dohl = true : dohl = false;
		for (y = 0; y < ms.mazeLayout.length; y++) {
			ml = "";
			line = ms.mazeLayout[y];
			for (x = 0; x < line.length; x++) {
				c = line[x];
				if (c == "?") {
					ml += progress[count++][0];
					if (dohl) {
						hexLocs.push([x/2, y/2]);
					}
				} else {
					ml += c;
				}
			}
			mm.push(ml);
		}
		ms.maze = mm;
	}
	var hexLocs = [];
	this.finishChange = function(c) {
		var col, pos, hex, i;
		//Callback for clicking the coloured circles
		col = fillId(c);
		//Update hexagon
		pos = c.getAttribute("id").slice(2);
		hex = document.getElementById("h"+pos);
		hex.setAttribute("fill", "url(#"+col+")");
		//Update progress
		for (i = 0; i < this.nMazes; i++) {
			if (hexLocs[i].toString() == pos) {
				progress[i] = col+progress[i].slice(1);
				break;
			}
		}
		//Update metaMaze (meaning it wouldn't have to be regenerated)?
	}
	fcClick = [this, this.finishChange];
	this.drawFinishColours = function() {
		//Draw on some finish colour circles
		var pos, loc, col, cols, circ, layer, i, j, offset, glyph;
		layer = document.getElementById("finishMarkers");
		glyph = "#finishCircle";
		for (i = 0; i <= this.nMazes; i++) {
			if (i == this.nMazes) {
				pos = parseCoordStr(ms.start);
				glyph = "#finishStar";
			} else {
				pos = hexLocs[i];
			}
			cols = progress[i].slice(1);
			loc = getXY(pos);
			for (j = 0; j < cols.length; j++) {
				offset = finishPositions[j];
				offset = [offset[0]+loc[0], offset[1]+loc[1]];
				layer.appendChild(newUse(glyph, "c"+j+pos, offset, cols[j]));
			}
		}
	}
	this.playing;
	this.completeCallback = function(col) {
		//When maze has been completed
		game.cleanup();
		var pstr = progress[this.playing].slice(1); //Completed colours section of string
		if (pstr.indexOf(col) == -1) { //Hasn't been completed this colour before
			var nstr;
			nstr = pstr.slice(0, pstr.indexOf("n")) + col;
			while (nstr.length < pstr.length) {
				nstr += "n";
			}
			if (pstr[0] == "n") {
				progress[this.playing] = col+nstr;
			} else {
				progress[this.playing] = pstr[0]+nstr;
			}
		}
		this.showMenu();
	}
	mazeComplete = this.completeCallback;
	this.completeMeta = function(col) {
		alert("Congrats!");
		mazeComplete = this.completeCallback;
		this.completeCallback(col);
	}
	this.menuHexClick = function(h) {
		//Play the corresponding maze
		var i, loc;
		loc = h.id.slice(1);
		for (i=0; i<hexLocs.length; i++) {
			if (hexLocs[i].toString() == loc) {
				break;
			}
		}
		this.playing = i;
		clearChildren("finishMarkers");
		if (i < hexLocs.length) {
			game = new gameStandard(ms.mazes[i]);
		} else if (loc == ms.start) {
			//mazeComplete = this.completeMeta;
			genMeta();
			game = new gameStandard(ms);
		}
	}
	this.showMenu = function() {
		//Draw the level select menu
		genMeta();
		loadMaze(ms.maze);
		this.drawFinishColours();
		hexClick = [this, this.menuHexClick];
	}
	this.showMenu();
}

//To instanciate
mazeSet = new loadSet(msd, null);
