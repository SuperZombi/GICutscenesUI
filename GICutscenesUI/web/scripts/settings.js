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

function changeTheme(){
	let value = document.querySelector(".settings_element[name=theme]").value
	if (value == 'dark'){
		document.body.classList.add('dark')
	}
	else{
		document.body.classList.remove('dark')
	}
}


async function change_output_folder(){
	let folder = await eel.ask_output_folder()();
	update_path(folder, document.getElementById("output_path"))
}
async function get_output_folder(){
	let folder = await eel.get_output_folder()();
	update_path(folder, document.getElementById("output_path"))
}

async function change_subtitles_folder(){
	let folder = await eel.ask_subtitles_folder()();
	update_path(folder, document.getElementById("subtitles_path"))
}
async function get_subtitles_folder(){
	let folder = await eel.get_subtitles_folder()();
	update_path(folder, document.getElementById("subtitles_path"))
}

async function get_all_fonts(){
	let fonts = await eel.get_all_fonts()();
	let parent = document.querySelector("#subtitles_font")
	fonts.forEach(font=>{
		let option = document.createElement("option")
		option.value = font
		option.textContent = font
		parent.appendChild(option)
	})
}

function init_subtitles_preview(){
	let elements = document.querySelectorAll(".subtitles_setting")
	function get_values(){
		let replace_keys = {
			"subtitles_font": "font_name",
			"subtitles_fontsize": "font_size",
			"subtitles_text_color": "text_color",
			"subtitles_outline_color": "outline_color",
			"subtitles_outline_width": "outline_width",
			"subtitles_letter_spacing": "letter_spacing",
			"subtitles_bold": "bold",
			"subtitles_italic": "italic"
		}
		let final = {}
		elements.forEach(e=>{
			if (e.type == "checkbox"){
				final[replace_keys[e.name]] = e.checked
			}
			else {
				final[replace_keys[e.name]] = e.value
			}
		})
		return final
	}
	async function make_request(){
		let subs_lang = document.querySelector(".input_element[name='subtitles_lang']").value.toLocaleLowerCase()
		let data_img = await eel.make_subs_preview({lang: subs_lang,...get_values()})();
		document.getElementById("subtitles_preview").src = data_img || "";
	}
	[document.querySelector(".input_element[name='subtitles_lang']"), ...elements].forEach(e=>{
		e.onchange = make_request
	})
	make_request()
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
