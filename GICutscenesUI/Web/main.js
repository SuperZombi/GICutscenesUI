window.onload = async _=>{
	let tab_now = window.location.hash.split("#").at(-1)
	if (tab_now){
		openTab(tab_now)
	}
	let version = await eel.get_version()();
	document.getElementById("version").innerHTML = version;

	let folder = await eel.get_script_file()();
	update_script_path(folder)
	load_settings()
}

function openTab(tab){
	window.location.hash = tab
	document.querySelector(".tabcontent.showed").classList.remove("showed")
	document.getElementById(tab).classList.add("showed")
	document.querySelector(".tab > button.active").classList.remove("active")
	document.querySelector(`.tab > button[data=${tab}]`).classList.add("active")
}


async function load_settings(){
	let settings = await eel.load_settings()()
	Object.keys(settings).forEach(key=>{
		let el = document.querySelector(`.settings_element[name=${key}]`)
		if (el.type == "checkbox"){
			el.checked = settings[key]
		}
		else{
			el.value = settings[key]
		}
	})
}
async function exportSettings(){
	let settings = parseSettings()
	await eel.save_settings(settings)()
	alert("Saved")
}
async function resetSettings(){
	if (confirm("Are you sure you want to Delete all Settings?")){
		let uns = await eel.delete_settings()();
		if (uns){
			window.location.reload()
		}
	}
}


async function change_script_folder(){
	var folder = await eel.ask_script_file()();
	update_script_path(folder)
}
function update_script_path(path){
	let input = document.getElementById("script_path")
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
	updatePreview(files)
}
function updatePreview(files){
	let preview = document.getElementById("preview_zone")
	preview.innerHTML = '<summary></summary>'
	if (files){
		files.forEach(e=>{
			preview.innerHTML += `<div path='${e}'>${e.replace(/^.*[\\\/]/, '')}</div>`
		})
	}
}


function parseSettings(){
	var settings = {}
	for (element of document.querySelectorAll(".settings_element")){
		if (element.type == "checkbox"){
			Object.assign(settings, { [element.name] : element.checked });
		}
		else{
			Object.assign(settings, { [element.name] : element.value });
		}
	}
	return settings
}
async function start(){
	var files = []
	Array.from(document.getElementById("preview_zone").getElementsByTagName("div")).forEach(e=>{
		files.push(e.getAttribute("path"))
	})

	if (files.length > 0){
		if (document.getElementById("script_path").value){
			// MAIN CALL
			let settings = parseSettings()
			document.getElementById("progress").style.display = "block"
			await eel.start_work(files, settings)();
		}
		else{
			openTab('settings')
			setTimeout(()=>{
				alert("Select Script File!")
			},10)
		}
	}
	else{
		alert("No Files!")
	}
}


function clearConsole(){
	document.getElementById("output").value = "";
}

eel.expose(putMessageInOutput);
function putMessageInOutput(type, message) {
	if (type == "console"){
		const outputNode = document.querySelector('#output');
		outputNode.value += message;
		if (!message.endsWith('\n')) {
			outputNode.value += '\n';
		}
		outputNode.scrollTo(0, outputNode.scrollHeight);		
	}
	else if (type == "file_count"){
		document.getElementById("progress_bar").value = message[0]
		document.getElementById("progress_bar").max = message[1]
		document.getElementById("current_progress").innerHTML = message[0] + "/" + message[1]
	}
	else if (type == "event"){
		var work_status = document.getElementById("current_work")
		if (message == "finish"){
			work_status.innerHTML = ""
			document.getElementById("current_work_file").innerHTML = ""
		}
		else{
			work_status.innerHTML = message
		}
	}
	else if (type == "work_file"){
		document.getElementById("current_work_file").innerHTML = message.replace(/^.*[\\\/]/, '')
	}
	else{
		console.log(message)
	}
}