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
	alert(LANG("saved"))
}
async function resetSettings(){
	if (confirm(LANG("confirm_delete_settings"))){
		let uns = await eel.delete_settings()();
		if (uns){
			window.location.reload()
		}
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


async function change_output_folder(){
	var folder = await eel.ask_output_folder()();
	update_path(folder, document.getElementById("output_path"))
}
async function get_output_folder(){
	var folder = await eel.get_output_folder()();
	update_path(folder, document.getElementById("output_path"))
}