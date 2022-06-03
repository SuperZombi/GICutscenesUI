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