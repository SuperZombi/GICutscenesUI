from tkinter import Tk
from tkinter.filedialog import askdirectory, askopenfilename, askopenfilenames
import eel
import sys, os
import shutil
import subprocess
import json
from json_minify import json_minify
import re
import requests

CONSOLE_DEBUG_MODE = False
__version__ = '0.4.3.1'

# ---- Required Functions ----

def resource_path(relative_path):
	""" Get absolute path to resource, works for dev and for PyInstaller """
	base_path = getattr(sys, '_MEIPASS', os.path.dirname(os.path.abspath(__file__)))
	return os.path.join(base_path, relative_path)

@eel.expose
def get_version():
	return __version__

# ---- Locales ----

@eel.expose
def get_translation(code):
	tr_file = os.path.join(resource_path("web"), "locales", code + ".json")
	if os.path.exists(tr_file):
		with open(tr_file, 'r', encoding="utf-8") as file:
			string = json_minify(file.read()) # remove comments

			# remove coma at the end of json
			regex = r'''(?<=[}\]"']),(?!\s*[{["'])'''
			string = re.sub(regex, "", string, 0)

			output = json.loads(string)
			return output
	return


# ---- GICutscenes Functions ----

def find_GICutscenes():
	def find_in(folder):
		files = [f for f in os.listdir(folder) if os.path.isfile(os.path.join(folder, f))]
		if "GICutscenes.exe" in files:
			return os.path.join(folder, "GICutscenes.exe")
	
	result = find_in(os.getcwd())
	if result: return result

	result = find_in(os.path.dirname(os.getcwd()))
	if result: return result


# ---- Settings Functions ----

def load_settings_inline():
	global SCRIPT_FILE, OUTPUT_F
	set_file = os.path.join(os.getcwd(), "UI-settings.json")
	if os.path.exists(set_file):
		with open(set_file, 'r', encoding='utf-8') as file:
			settings = json.loads(file.read())
			if "script_file" in settings.keys():
				SCRIPT_FILE = settings["script_file"]
			if "output_folder" in settings.keys():
				OUTPUT_F = settings["output_folder"]
	else:
		SCRIPT_FILE = find_GICutscenes()
		OUTPUT_F = os.path.join(os.getcwd(), "output")

load_settings_inline()

@eel.expose
def load_settings():
	set_file = os.path.join(os.getcwd(), "UI-settings.json")
	if os.path.exists(set_file):
		with open(set_file, 'r', encoding='utf-8') as file:
			settings = json.loads(file.read())
			return settings
	return {}

@eel.expose
def save_settings(settings):
	settings['script_file'] = SCRIPT_FILE
	settings['output_folder'] = OUTPUT_F
	with open(os.path.join(os.getcwd(), "UI-settings.json"), 'w', encoding='utf-8') as file:
		file.write(json.dumps(settings, indent=4, ensure_ascii=False))
	return True

@eel.expose
def delete_settings():
	global SCRIPT_FILE, OUTPUT_F
	SCRIPT_FILE = find_GICutscenes()
	OUTPUT_F = os.path.join(os.getcwd(), "output")
	
	set_file = os.path.join(os.getcwd(), "UI-settings.json")
	if os.path.exists(set_file):
		os.remove(set_file)
		return True
	return False



# ---- About Tab Functions ----

@eel.expose
def get_GICutscenes_ver():
	if SCRIPT_FILE:
		process = subprocess.Popen([SCRIPT_FILE, "--version"], stdout=subprocess.PIPE)
		answer = process.communicate()[0]
		try:
			text = answer.decode('utf-8')
		except UnicodeDecodeError:
			text = answer.decode(os.device_encoding(0))
		return text.strip()

@eel.expose
def get_ffmpeg_ver():
	def find_ver(text):
		return text.splitlines()[0].split("ffmpeg version")[-1].strip().split()[0]
	def find_year(text):
		match = re.findall(r'\b([1-3][0-9]{3})\b', text)
		if match is not None:
			return match
	try:
		process = subprocess.Popen(["ffmpeg", "-version"], stdout=subprocess.PIPE)
		answer = process.communicate()[0]
		try:
			text = answer.decode('utf-8')
		except UnicodeDecodeError:
			text = answer.decode(os.device_encoding(0))
		final = {'ver': find_ver(text.strip()), 'year': find_year(text.strip())}
		return final
	except: return {}


def parse_releases(relative_path):
	r = requests.get(f'https://api.github.com/repos/{relative_path}/tags')
	if r.status_code == 200:
		answer = r.json()
		latest = answer[0]["name"]
		return latest
	else:
		r = requests.get(f'https://github.com/{relative_path}/tags')
		links = []
		for line in r.text.split("\n"):
			match = re.search(r"href=\"(.+)\">", line)
			if match:
				links.append(match.group(1))

		pat = re.compile(r'releases\/tag')
		content = [ s for s in links if pat.findall(s) ]
		latest = sorted(content)[-1].split("/")[-1]
		return latest

@eel.expose
def get_latest_ui_version():
	return parse_releases('SuperZombi/GICutscenesUI')

@eel.expose
def get_latest_script_version():
	return parse_releases('ToaHartor/GI-cutscenes')

@eel.expose
def compare_version_files():
	if SCRIPT_FILE:
		local_ver_file = os.path.join(
			os.path.dirname(SCRIPT_FILE),
			"versions.json"
		)
		if os.path.exists(local_ver_file):
			with open(local_ver_file, 'r') as file:
				LOCAL = file.read()

			try:
				r = requests.get("https://raw.githubusercontent.com/ToaHartor/GI-cutscenes/main/versions.json")
				GLOBAL = r.text

				if json.loads(LOCAL) == json.loads(GLOBAL):
					return {"success": True, "status": True}
				else:
					return {"success": True, "status": False}
			except: None
	return {"success": False}

@eel.expose
def download_latest_version_file():
	r = requests.get("https://raw.githubusercontent.com/ToaHartor/GI-cutscenes/main/versions.json")
	local_ver_file = os.path.join(os.path.dirname(SCRIPT_FILE), "versions.json")
	with open(local_ver_file, 'w') as file:
		file.write(r.text)


# ---- Logger Functions ----

def send_message_to_ui_output(type_, message):
	eel.putMessageInOutput(type_, message)()

def log_subprocess_output(pipe, process=None):
	for line in pipe:
		if process:
			if STOPED_BY_USER:
				process.kill()
		send_message_to_ui_output("console", line.strip())


# ---- Explorer Functions ----

@eel.expose
def ask_files():
	root = Tk()
	root.withdraw()
	root.wm_attributes('-topmost', 1)
	files = askopenfilenames(parent=root, filetypes=[("Genshin Impact Cutscene", "*.usm"), ("All files", "*.*")])
	return files


@eel.expose
def get_script_file():
	return SCRIPT_FILE

@eel.expose
def get_output_folder():
	return OUTPUT_F

@eel.expose
def ask_script_file():
	global SCRIPT_FILE
	root = Tk()
	root.withdraw()
	root.wm_attributes('-topmost', 1)
	file = askopenfilename(parent=root)
	if file:
		SCRIPT_FILE = file
	return SCRIPT_FILE

@eel.expose
def ask_output_folder():
	global OUTPUT_F
	root = Tk()
	root.withdraw()
	root.wm_attributes('-topmost', 1)
	folder = askdirectory(parent=root)
	if folder:
		OUTPUT_F = folder
	return OUTPUT_F

@eel.expose
def open_output_folder():
	os.system(f'explorer "{OUTPUT_F}"')



# ---- MAIN Functions ----
STOPED_BY_USER = None
@eel.expose
def stop_work():
	global STOPED_BY_USER
	STOPED_BY_USER = True

@eel.expose
def start_work(files, args):
	global STOPED_BY_USER
	STOPED_BY_USER = False
	send_message_to_ui_output("event", "start")
	file_lenth = len(files)
	send_message_to_ui_output("file_count", [0, file_lenth])
	# Make folders
	temp_folder = resource_path("Temp")
	if not os.path.exists(temp_folder):
		os.mkdir(temp_folder)
	if not os.path.exists(OUTPUT_F):
		os.mkdir(OUTPUT_F)

	OLD_DIR = os.getcwd()
	os.chdir(os.path.dirname(SCRIPT_FILE))

	for i, file in enumerate(files):
		if STOPED_BY_USER: break
		else:
			send_message_to_ui_output("file_count", [i, file_lenth])
			send_message_to_ui_output("event", "copy_files")
			send_message_to_ui_output("work_file", file)
			# MAIN CALL
			shutil.copyfile(file, os.path.join(temp_folder, os.path.basename(file)))
			send_message_to_ui_output("event", "run_demux")
			p_status = 0
			if CONSOLE_DEBUG_MODE:
				subprocess.call([SCRIPT_FILE, 'batchDemux', temp_folder, '--output', OUTPUT_F])
			else:
				process = subprocess.Popen([SCRIPT_FILE, 'batchDemux', temp_folder, '--output', OUTPUT_F], encoding=os.device_encoding(0), universal_newlines=True, stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
				with process.stdout:
					log_subprocess_output(process.stdout)
				p_status = process.wait()

			os.remove(os.path.join(temp_folder, os.path.basename(file)))
			if p_status != 0:
				send_message_to_ui_output("event", "error")
			else:
				send_message_to_ui_output("event", "rename_files")

				# Rename to m2v
				old_file_name = os.path.splitext(os.path.basename(file))[0]
				file_name = str(old_file_name) + ".ivf"
				new_file_name = str(old_file_name) + ".m2v"
				file_name = os.path.join(OUTPUT_F, file_name)
				new_file_name = os.path.join(OUTPUT_F, new_file_name)
				try:
					os.rename(file_name, new_file_name)
				except: None

				# Delete hca encoded Audio (cuz wav files decoded)
				for index in [0, 1, 2, 3]:
					f = str(old_file_name) + "_" + str(index) + ".hca"
					f = os.path.join(OUTPUT_F, f)
					if os.path.exists(f):
						os.remove(f)

				# Merge Video and Audio
				if args['merge']:
					if STOPED_BY_USER: break
					else:
						send_message_to_ui_output("event", "run_merge")
						audio_index = int(args['audio_index'])
						audio_file = os.path.join(OUTPUT_F , str(old_file_name) + "_" + str(audio_index) + ".wav")
						output_file = os.path.join(OUTPUT_F, str(old_file_name) + ".mp4")
						send_message_to_ui_output("console", "\nStarting ffmpeg")
						if os.path.exists(output_file):
							send_message_to_ui_output("console", f'File {output_file} already exists.')
							os.remove(output_file)

						send_message_to_ui_output("console", "Working ffmpeg...")
						p_status = 0
						if CONSOLE_DEBUG_MODE:
							subprocess.call(['ffmpeg', '-hide_banner', '-i', new_file_name, '-i', audio_file, output_file])
						else:
							process = subprocess.Popen(['ffmpeg', '-hide_banner', '-i', new_file_name, '-i', audio_file, output_file], encoding='utf-8', universal_newlines=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
							with process.stderr:
								log_subprocess_output(process.stderr, process)
							p_status = process.wait()

						if p_status != 0:
							if os.path.exists(output_file): os.remove(output_file)
							send_message_to_ui_output("event", "error")
							continue
						else:
							send_message_to_ui_output("console", "Merging complete!")
							if args['delete_after_merge']:
								send_message_to_ui_output("console", "Removing trash...")
								files_to_remove = [
									old_file_name + ".m2v",
									*[f"{old_file_name}_{i}.wav" for i in [0, 1, 2, 3]]
								]
								files_to_remove = list(map(lambda x: os.path.join(OUTPUT_F, x),files_to_remove))
								for f in files_to_remove:
									os.remove(f)
								send_message_to_ui_output("console", "OK")

				if i != file_lenth - 1:
					send_message_to_ui_output("console", "\n")

				send_message_to_ui_output("event", "ok")

	send_message_to_ui_output("event", "finish")
	if STOPED_BY_USER:
		send_message_to_ui_output("console", "\nStoped by user")
		send_message_to_ui_output("event", "stoped")
	else:
		send_message_to_ui_output("file_count", [file_lenth, file_lenth])
	shutil.rmtree(temp_folder)
	os.chdir(OLD_DIR)


eel.init(resource_path("web"))

browsers = ['chrome', 'edge', 'default']
for browser in browsers:
	try:
		eel.start("main.html", size=(600, 700), mode=browser)
		break
	except Exception:
		print(f"Failed to launch the app using {browser.title()} browser")
