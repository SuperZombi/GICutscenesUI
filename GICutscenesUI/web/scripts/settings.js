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