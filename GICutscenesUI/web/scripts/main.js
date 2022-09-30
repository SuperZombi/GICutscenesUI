(async _=>{
	await load_settings()
	changeTheme()
	getTranslation()

	let tab_now = window.location.hash.split("#").at(-1)
	if (tab_now){
		openTab(tab_now)
	}

	let folder = await eel.get_script_file()();
	update_path(folder, document.getElementById("script_path"))
	get_output_folder()
})()

function openTab(tab){
	window.location.hash = tab
	document.querySelector(".tabcontent.showed").classList.remove("showed")
	document.getElementById(tab).classList.add("showed")
	document.querySelector(".tab > button.active").classList.remove("active")
	document.querySelector(`.tab > button[data=${tab}]`).classList.add("active")
	setTimeout(_=>{window.scrollTo(0, 0)})
	if (tab == "about"){
		load_about_info()
	}
}


async function change_script_folder(){
	var folder = await eel.ask_script_file()();
	update_path(folder, document.getElementById("script_path"))
	
	if (document.getElementById("script_path").value != folder){
		allow_reload_info()
	}
}
function update_path(path, input){
	if (path){
		input.value = path
		input.style.width = input.value.length + "ch";
		input.style.borderColor = ""
	}
	else{
		input.style.borderColor = "red"
	}
}


async function selectFiles(){
	var files = await eel.ask_files()();
	if (files && files.length > 0){
		updatePreview(files)
	}
}
function updatePreview(files){
	removeIcons_and_color()
	let preview = document.getElementById("preview_zone")
	files.forEach(e=>{
		if (!preview.querySelector(`div[path='${e}']`)){
			preview.innerHTML += `<div path='${e}'>${e.replace(/^.*[\\\/]/, '')}</div>`
		}
	})
	document.getElementById("fileCleaner").style.display = "inline-block"
}
function clearFiles(){
	let preview = document.getElementById("preview_zone")
	preview.innerHTML = '<summary></summary>'
	document.getElementById("fileCleaner").style.display = "none"
}

function removeIcons_and_color(){
	Array.from(document.getElementById("preview_zone").getElementsByTagName("div")).forEach(e=>{
		e.className = ""
		let icon = e.querySelector(".icon")
		if (icon){icon.remove()}
	})
}

async function openOutputFolder(){
	eel.open_output_folder()
}


var BLOCK_START = false;
async function start(){
	if (!BLOCK_START){
		var files = []
		Array.from(document.getElementById("preview_zone").getElementsByTagName("div")).forEach(e=>{
			files.push(e.getAttribute("path"))
		})

		if (files.length > 0){
			clearConsole()
			removeIcons_and_color()
			if (document.getElementById("script_path").value){
				// MAIN CALL
				let settings = parseSettings()
				document.getElementById("open_dir").style.display = "none"
				document.getElementById("progress").style.display = "block"
				await eel.start_work(files, settings)();
			}
			else{
				openTab('settings')
				setTimeout(()=>{
					alert(LANG("select_script_file"))
				},10)
			}
		}
		else{
			alert(LANG("no_files"))
		}
	}
}

async function stop(){
	document.getElementById("stop").disabled = true;
	eel.stop_work()();
}
