(async _=>{
	await get_all_fonts()
	await get_encoders()
	await load_settings()
	changeTheme()
	await getTranslation()

	let tab_now = window.location.hash.split("#").at(-1)
	if (tab_now){
		openTab(tab_now)
	}

	get_output_folder()
	get_subtitles_folder()
	init_subtitles_preview()
	donationPopup()
	setTimeout(_=>{
		document.querySelector("#loader-area").classList.add("hidden")
	}, 100)
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
	let files = await eel.ask_files()();
	if (files && files.length > 0){
		updatePreview(files)
	}
}
function updatePreview(files){
	removeIcons_and_color()
	let parent = document.getElementById("preview_zone")
	files.forEach(e=>{
		if (!parent.querySelector(`.file[path='${e}']`)){
			parent.appendChild(addFilePreview(e))
		}
	})
	document.querySelector("#fileCleaner").classList.remove("hide")
}
function addFilePreview(filename){
	let base_classname = "file input_element"
	let div = document.createElement("div")
	div.className = base_classname
	div.setAttribute("path", filename)
	let icon_wrapper = document.createElement("span")
	icon_wrapper.className = "icon"
	let icon = document.createElement("i")
	icon.className = "fa-regular fa-file"
	icon_wrapper.appendChild(icon)
	let text = document.createElement("span")
	text.className = "text"
	text.innerHTML = filename.replace(/^.*[\\\/]/, '')
	let del_but = document.createElement("span")
	del_but.className = "icon del"
	del_but.innerHTML = '<i class="fa-regular fa-circle-xmark"></i>'
	del_but.title = LANG("remove")
	del_but.onclick = _=>{ div.remove() }
	let statuses = document.createElement("div")
	statuses.className = "statuses"
	div.addStatus = status=>{
		let i = document.createElement("i")
		i.className = status
		statuses.appendChild(i)
	}
	div.reset = _=>{
		div.className = base_classname
		icon.className = "fa-solid fa-file"
		statuses.innerHTML = ""
	}
	div.setClass = class_=>{ div.className = `${base_classname} ${class_}` }
	div.setIcon = classes=>{ icon.className = classes }
	div.appendChild(icon_wrapper)
	div.appendChild(text)
	div.appendChild(statuses)
	div.appendChild(del_but)
	return div
}
function clearFiles(){
	let preview = document.getElementById("preview_zone")
	preview.innerHTML = ''
	document.querySelector("#fileCleaner").classList.add("hide")
}

function removeIcons_and_color(){
	document.querySelectorAll("#preview_zone .file").forEach(e=>{e.reset()})
}

async function openOutputFolder(){
	eel.open_output_folder()
}


var BLOCK_START = false;
async function start(){
	if (!BLOCK_START){
		var files = []
		document.querySelectorAll("#preview_zone .file").forEach(e=>{
			files.push(e.getAttribute("path"))
		})

		if (files.length > 0){
			clearConsole()
			removeIcons_and_color()
			// MAIN CALL
			let settings = parseSettings()
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
