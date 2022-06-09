function clearConsole(){
	document.getElementById("output").value = "";
}

eel.expose(putMessageInOutput);
function putMessageInOutput(type, message) {
	if (type == "console"){
		if (message){
			const outputNode = document.querySelector('#output');

			if (message.includes("bitrate")){
				var last_line = outputNode.value.split('\n').filter(n=>n).at(-1);
				if (last_line.includes("bitrate")){
					outputNode.value = outputNode.value.substring(0, outputNode.value.lastIndexOf(last_line))
				}
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
			document.getElementById("current_work_file").innerHTML = ""
			document.getElementById("open_dir").style.display = "block"
			document.getElementById("start").disabled = false;
			BLOCK_START = false;
		}
		else if (message == "start"){
			BLOCK_START = true;
			document.getElementById("start").disabled = true;
		}
		else{
			work_status.innerHTML = LANG(message)
		}
	}
	else if (type == "work_file"){
		document.getElementById("current_work_file").innerHTML = message.replace(/^.*[\\\/]/, '')
	}
	else{
		console.log(message)
	}
}
