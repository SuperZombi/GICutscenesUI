var APP_VERSION;
var info_loaded = false;
async function load_about_info(){
	if (!info_loaded){
		info_loaded = true;
		APP_VERSION = await eel.get_version()();
		document.getElementById("version").innerHTML = APP_VERSION;

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

		let latest_ui_ver = await eel.get_latest_ui_version()();
		let latest_script_ver = await eel.get_latest_script_version()();

		if (latest_ui_ver){
			if ( is_this_new_ver(APP_VERSION, latest_ui_ver) ){
				let el = document.createElement('code')
				el.className = "update"
				el.title = LANG("new_update")
				el.setAttribute("translation", "__title:new_update__")
				el.innerHTML = latest_ui_ver
				document.getElementById("version").parentNode.innerHTML += "<a class='arrow'></a>"
				document.getElementById("version").parentNode.appendChild(el)
			}
		}
		if (latest_script_ver && script_ver){
			if ( is_this_new_ver(script_ver, latest_script_ver) ){
				let el = document.createElement('code')
				el.className = "update"
				el.title = LANG("new_update")
				el.setAttribute("translation", "__title:new_update__")
				el.innerHTML = latest_script_ver
				document.getElementById("script_ver").parentNode.innerHTML += "<a class='arrow'></a>"
				document.getElementById("script_ver").parentNode.appendChild(el)
			}
		}

		await load_version_file();
		
		document.getElementById("loading").style.display = "none"
	}
}

async function load_version_file(){
	let compare_version_files = await eel.compare_version_files()();

	if (compare_version_files["success"]){
		document.getElementById("compare_ver_files_line").style.display = "table-row"
		if (compare_version_files["status"]){
			document.getElementById("ver_file_status").innerHTML = "OK"
			document.getElementById("ver_file_status").classList.remove("update")
			document.getElementById("ver_file_status").removeAttribute("translation")
			let button = document.getElementById("ver_file_status").parentNode.querySelector("button")
			if (button){ button.remove() }
		}
		else{
			document.getElementById("ver_file_status").setAttribute("translation", "__new_update__")
			document.getElementById("ver_file_status").classList.add("update")
			document.getElementById("ver_file_status").innerHTML = LANG("new_update")
			let button = document.createElement("button")
			button.classList.add("path_button")
			button.style.marginLeft = "5px"
			button.innerHTML = LANG("update")
			button.setAttribute("translation", "__update__")
			button.onclick = async () => {
				document.getElementById("loading").style.display = "block";
				await eel.download_latest_version_file()();
				await load_version_file();
				document.getElementById("loading").style.display = "none";
			}
			document.getElementById("ver_file_status").parentNode.appendChild(button)
		}
	}
}


function allow_reload_info(){
	info_loaded = false;
	document.getElementById("loading").style.display = "block"
}

function is_this_new_ver(old_ver, new_ver){
	function clean(string){
		return string.replace(/[^0-9. ]/g, "")
	}
	if (clean(old_ver) != clean(new_ver)){
		return true;
	}
	return false;
}
