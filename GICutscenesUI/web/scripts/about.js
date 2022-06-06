var info_loaded = false;
async function load_about_info(){
	if (!info_loaded){
		info_loaded = true;
		let script_ver = await eel.get_GICutscenes_ver()();
		let ffmpeg_ver = await eel.get_ffmpeg_ver()();

		if (script_ver){
			document.getElementById("script_ver").innerHTML = script_ver
		}
		if (Object.keys(ffmpeg_ver).length > 0){
			document.getElementById("ffmpeg_ver").innerHTML = ffmpeg_ver.ver
			if (ffmpeg_ver.year.length > 0){
				document.getElementById("ffmpeg_year_line").style.display = "table-row"
				document.getElementById("ffmpeg_year").innerHTML = ffmpeg_ver.year
			}
		}
		document.getElementById("loading").style.display = "none"
	}
}
function allow_reload_info(){
	info_loaded = false;
	document.getElementById("loading").style.display = "block"
}