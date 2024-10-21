async function load_settings(){
	let settings = await eel.load_settings()()
	Object.keys(settings).forEach(key=>{
		let el = document.querySelector(`.settings_element[name=${key}]`)
		if (el){
			if (el.type == "checkbox"){
				el.checked = settings[key]
			}
			else{
				el.value = settings[key]
			}
			el.dispatchEvent(new Event("change"))
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


function changeTheme(){
	let value = document.querySelector(".settings_element[name=theme]").value
	if (value == 'dark'){
		document.body.classList.add('dark')
	}
	else{
		document.body.classList.remove('dark')
	}
}

function donationPopup(){
	function checkLastNotificationTime(){
		let currentTime = Math.floor(Date.now() / 1000);
		let lastNotificationTime = localStorage.getItem('lastNotificationTime');
		if (!lastNotificationTime || (currentTime - lastNotificationTime > 12*60*60)) {
			return true;
		} else {
			return false;
		}
	}
	function callback(){
		document.querySelector("#donate-popup").classList.remove("show")
		var currentTime = Math.floor(Date.now() / 1000);
		localStorage.setItem('lastNotificationTime', currentTime);
	}
	document.querySelector("#donate-popup .close").onclick = callback
	document.querySelector("#donate-popup button").onclick = callback
	
	if (checkLastNotificationTime()){
		setTimeout(_=>{
			document.querySelector("#donate-popup").classList.add("show")
		}, 60*1000)
	}
}
