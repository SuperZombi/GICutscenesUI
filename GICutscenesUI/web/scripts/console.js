function clearConsole(){
	document.getElementById("output").value = "";
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
					let current_percents = current_dur * 100 / maxDuration;
					let percents_rounded = Math.min(
													Math.max(0, 
														Math.round(current_percents)
													)
												, 100)

					document.getElementById("ffmpeg_progress").value = percents_rounded
					document.getElementById("ffmpeg_progress_text").innerHTML = percents_rounded + "%"
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
		var work_status = document.getElementById("current_work")
		if (message == "finish"){
			work_status.innerHTML = ""
			document.getElementById("fileSelector").style.display = "inline-block"
			document.getElementById("fileCleaner").style.display = "inline-block"
			document.getElementById("open_dir").style.display = "block"
			document.getElementById("start").disabled = false;
			document.getElementById("stop").style.display = "none";

			document.getElementById("ffmpeg_progress").style.display = "none"
			document.getElementById("ffmpeg_progress_text").style.display = "none"
			BLOCK_START = false;
		}
		else if (message == "start"){
			BLOCK_START = true;
			document.getElementById("start").disabled = true;
			document.getElementById("stop").disabled = false;
			document.getElementById("stop").style.display = "inline-block";
			document.getElementById("fileSelector").style.display = "none"
			document.getElementById("fileCleaner").style.display = "none"
		}
		else if (message == "run_merge"){
			document.getElementById("ffmpeg_progress").style.display = "inline-block"
			document.getElementById("ffmpeg_progress_text").style.display = "inline-block"
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
		document.getElementById("ffmpeg_progress").style.display = "none"
		document.getElementById("ffmpeg_progress_text").style.display = "none"
		document.getElementById("ffmpeg_progress").value = 0
		document.getElementById("ffmpeg_progress_text").innerHTML = "0%"
		file_status_in_list()
	}
	else{
		console.log(message)
	}
}

function file_status_in_list(status="now"){
	let index = document.getElementById("progress_bar").value
	let element = document.querySelectorAll("#preview_zone > div")[index]

	function add_icon(element, text){
		let el = element.querySelector(".icon");
		if (!el){
			el = document.createElement("span");
			el.className = "icon"
			el.style.display = "inline-block"
			el.style.textAlign = "center"
			el.style.width = "25px"
			element.prepend(el);
		}
		el.innerHTML = text;
	}

	if (status == "ok"){
		element.className = "ok"
		add_icon(element, "✓")
	}
	else if (status == "now"){
		element.className = "now"
		add_icon(element, "➤")
	}
	else if (status == "error"){
		element.className = "error"
		add_icon(element, "❌")
	}
	else if (status == "stoped"){
		element.className = "now"
		add_icon(element, "🛑")
	}
}


function durationToSeconds(hms){
	let a = hms.split(":")
	let seconds = (+a[0]) * 60 * 60 + (+a[1]) * 60 + (+a[2]);
	return seconds
}
