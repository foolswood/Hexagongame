var mf_no = 0;
var mazes = [];
var m_no = 1;
function loadNextMaze() {
	if (m_no >= mazes.length) {
		if (mf_no >= mazeFiles.length) {
			mf_no = 0;
		}
		var mapFile = new XMLHttpRequest();
		mapFile.open('GET', "mazes/"+mazeFiles[mf_no++], false);
		mapFile.send(null);
		mazes = JSON.parse(mapFile.responseText);
		m_no = 0;
	}
	loadMaze(mazes[m_no++]);
}
