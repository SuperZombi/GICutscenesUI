function clearConsole(){
	document.getElementById("output").value = "";
}
function showConsole(){
	document.querySelector("#show_console").classList.add("hide")
	document.querySelector("#console_wrapper").classList.remove("hide")
}

var maxDuration = 1;

eel.expose(putMessageInOutput);
function putMessageInOutput(type, message) {
	if (type == "console"){
		if (message){
			const outputNode = document.querySelector('#output');

			if (message.toLowerCase().includes("duration")){
				message.replace(/\Duration:(.*?)\,/g, (match, contents)=>{
					maxDuration = durationToSeconds(contents.trim())
				})
			}

			if (message.includes("frame")){
				var last_line = outputNode.value.split('\n').filter(n=>n).at(-1);
				if (last_line && last_line.includes("frame")){
					outputNode.value = outputNode.value.substring(0, outputNode.value.lastIndexOf(last_line))
				}
			}

			if (message.includes("time")){
				message.replace(/\.*time=(.*?) /g, (match, contents)=>{
					let current_dur = durationToSeconds(contents.trim())
					if (current_dur){
						let current_percents = current_dur * 100 / maxDuration;
						let percents_rounded = Math.min(
														Math.max(0, 
															Math.round(current_percents)
														)
													, 100)
						document.querySelector("#ffmpeg_progress").value = percents_rounded
						document.querySelector("#ffmpeg_progress_text").innerHTML = percents_rounded + "%"
					}
				})
			}
			
			outputNode.value += message;
			if (!message.endsWith('\n')) {
				outputNode.value += '\n';
			}
			outputNode.scrollTo(0, outputNode.scrollHeight);
		}
	}
	else if (type == "file_count"){
		document.getElementById("progress_bar").value = message[0]
		document.getElementById("progress_bar").max = message[1]
		document.getElementById("current_progress").innerHTML = message[0] + "/" + message[1]
	}
	else if (type == "event"){
		let work_status = document.getElementById("current_work")
		if (message == "finish"){
			BLOCK_START = false;
			work_status.innerHTML = ""
			toggleStartStop("start")
			document.querySelector("#open_dir").classList.remove("hide")
			document.querySelector("#browse-area").classList.remove("hide")
			document.querySelector("#preview_zone").classList.remove("no-remove")
			document.querySelector("#progress").classList.add("hide")
			document.querySelector("#ffmpeg_progress_area").classList.add("hide")
		}
		else if (message == "start"){
			BLOCK_START = true;
			toggleStartStop("stop")
			document.querySelector("#open_dir").classList.add("hide")
			document.querySelector("#browse-area").classList.add("hide")
			document.querySelector("#preview_zone").classList.add("no-remove")
			document.querySelector("#progress").classList.remove("hide")
			if (document.querySelector("#console_wrapper").classList.contains("hide")){
				document.querySelector("#show_console").classList.remove("hide")
			}
		}
		else if (message == "run_merge"){
			document.querySelector("#ffmpeg_progress_area").classList.remove("hide")
			work_status.innerHTML = LANG(message)
		}
		else if (message == "ok" || message == "error" || message == "stoped"){
			file_status_in_list(message)
			if (message == "stoped"){
				work_status.innerHTML = LANG("Stopped")
			}
		}
		else{
			work_status.innerHTML = LANG(message)
		}
	}
	else if (type == "work_file"){
		document.querySelector("#ffmpeg_progress_area").classList.add("hide")
		document.querySelector("#ffmpeg_progress").value = 0
		document.querySelector("#ffmpeg_progress_text").innerHTML = "0%"
		file_status_in_list()
	}
	else if (type == "sub_work"){
		addWorkToFile(message.name, message.status)
	}
	else{
		console.log(message)
	}
}

function file_status_in_list(status="now"){
	let index = document.getElementById("progress_bar").value
	let element = document.querySelectorAll("#preview_zone > div")[index]
	if (status == "ok"){
		element.setClass("ok")
		element.setIcon("fa-regular fa-circle-check")
	}
	else if (status == "now"){
		element.setClass("now")
		element.setIcon("fa-solid fa-spinner fa-spin")
	}
	else if (status == "error"){
		element.setClass("error")
		element.setIcon("fa-regular fa-circle-exclamation")
	}
	else if (status == "stoped"){
		element.setClass("stoped")
		element.setIcon("fa-regular fa-circle-stop")
	}
}
function addWorkToFile(workname, status=true){
	let index = document.getElementById("progress_bar").value
	let element = document.querySelectorAll("#preview_zone > div")[index]
	if (workname == "subtitles"){
		element.addStatus(`fa-solid fa-closed-captioning ${status?"ok":"error"}`)
	}
	else if (workname == "keys"){
		element.addStatus(`fa-solid fa-key ${status?"ok":"error"}`)
	}
}

function toggleStartStop(action="start"){
	let start_but = document.querySelector("#start")
	let stop_but = document.querySelector("#stop")
	if (action == "stop"){
		start_but.disabled = true;
		stop_but.disabled = false;
		start_but.classList.add("hide")
		stop_but.classList.remove("hide")
	} else {
		stop_but.disabled = true;
		start_but.disabled = false;
		stop_but.classList.add("hide")
		start_but.classList.remove("hide")
	}
}


function durationToSeconds(hms){
	let a = hms.split(":")
	let seconds = (+a[0]) * 60 * 60 + (+a[1]) * 60 + (+a[2]);
	return seconds
}
