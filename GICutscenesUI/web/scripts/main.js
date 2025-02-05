(async _=>{
	await load_settings()
	changeTheme()
	getTranslation()

	let tab_now = window.location.hash.split("#").at(-1)
	if (tab_now){
		openTab(tab_now)
	}

	get_output_folder()
	get_subtitles_folder()
	donationPopup()
})()

function openTab(tab){
	window.location.hash = tab
	document.querySelector(".tabcontent.showed").classList.remove("showed")
	document.getElementById(tab).classList.add("showed")
	document.querySelector(".tabs > button.active").classList.remove("active")
	document.querySelector(`.tabs > button[data=${tab}]`).classList.add("active")
	setTimeout(_=>{window.scrollTo(0, 0)})
	if (tab == "about"){
		load_about_info()
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
			preview.appendChild(addFilePreview(e))
		}
	})
	document.getElementById("fileCleaner").style.display = "inline-block"
}
function addFilePreview(filename){
	let div = document.createElement("div")
	div.setAttribute("path", filename)
	let icon = document.createElement("span")
	icon.className = "icon"
	icon.innerHTML = "🗎"
	let text = document.createElement("span")
	text.innerHTML = filename.replace(/^.*[\\\/]/, '')
	let del_but = document.createElement("span")
	del_but.className = "del"
	del_but.innerHTML = "✖"
	del_but.title = LANG("remove")
	del_but.onclick = _=>{ div.remove() }
	div.resetIcon = _=>{ icon.innerHTML = "🗎" }
	div.setIcon = (text)=>{ icon.innerHTML = text }
	div.appendChild(icon)
	div.appendChild(text)
	div.appendChild(del_but)
	return div
}
function clearFiles(){
	let preview = document.getElementById("preview_zone")
	preview.innerHTML = ''
	document.getElementById("fileCleaner").style.display = "none"
	document.getElementById("progress").style.display = "none"
}

function removeIcons_and_color(){
	Array.from(document.getElementById("preview_zone").getElementsByTagName("div")).forEach(e=>{
		e.className = ""
		e.resetIcon()
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
			// MAIN CALL
			let settings = parseSettings()
			document.getElementById("open_dir").style.display = "none"
			document.getElementById("progress").style.display = "block"
			document.getElementById("preview_zone").classList.add("no-remove")
			await eel.start_work(files, settings)();
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
