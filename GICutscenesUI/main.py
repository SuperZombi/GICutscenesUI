from tkinter import Tk
from tkinter.filedialog import askdirectory, askopenfilename, askopenfilenames
import eel
import sys, os
import shutil
import subprocess
import json

CONSOLE_DEBUG_MODE = False
__version__ = '0.1.0'

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
	tr_file = os.path.join(resource_path("Web"), "locales", code + ".json")
	if os.path.exists(tr_file):
		with open(tr_file, 'r', encoding="utf-8") as file:
			output = json.loads(file.read())
			return output
	return


# ---- GICutscenes Functions ----

def find_GICutscenes():
	cur_folder = os.getcwd()
	files = [f for f in os.listdir(cur_folder) if os.path.isfile(os.path.join(cur_folder, f))]
	if "GICutscenes.exe" in files:
		return os.path.join(cur_folder, "GICutscenes.exe")

	cur_folder = os.path.dirname(os.getcwd())
	files = [f for f in os.listdir(cur_folder) if os.path.isfile(os.path.join(cur_folder, f))]
	if "GICutscenes.exe" in files:
		return os.path.join(cur_folder, "GICutscenes.exe")



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


# ---- Logger Functions ----

def send_message_to_ui_output(type_, message):
	eel.putMessageInOutput(type_, message)()

def log_subprocess_output(pipe):
	for line in iter(pipe.readline, b''):
		try:
			text = line.decode('utf-8')
		except UnicodeDecodeError:
			text = line.decode(os.device_encoding(0))
		send_message_to_ui_output("console", text.strip())


# ---- Explorer Functions ----

@eel.expose
def ask_files():
	root = Tk()
	root.withdraw()
	root.wm_attributes('-topmost', 1)
	files = askopenfilenames(parent=root)
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

@eel.expose
def start_work(files, args):
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
		send_message_to_ui_output("file_count", [i, file_lenth])
		send_message_to_ui_output("event", "copy_files")
		send_message_to_ui_output("work_file", file)
		# MAIN CALL
		shutil.copyfile(file, os.path.join(temp_folder, os.path.basename(file)))
		send_message_to_ui_output("event", "run_demux")
		if CONSOLE_DEBUG_MODE:
			subprocess.call([SCRIPT_FILE, 'batchDemux', temp_folder, '--output', OUTPUT_F])
		else:
			process = subprocess.Popen([SCRIPT_FILE, 'batchDemux', temp_folder, '--output', OUTPUT_F], stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
			with process.stdout:
				log_subprocess_output(process.stdout)

		os.remove(os.path.join(temp_folder, os.path.basename(file)))

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
			send_message_to_ui_output("event", "run_merge")
			audio_index = int(args['audio_index'])
			audio_file = os.path.join(OUTPUT_F , str(old_file_name) + "_" + str(audio_index) + ".wav")
			output_file = os.path.join(OUTPUT_F, str(old_file_name) + ".mp4")
			send_message_to_ui_output("console", "\nStarting ffmpeg")
			if os.path.exists(output_file):
				send_message_to_ui_output("console", f'File {output_file} already exists.')
				os.remove(output_file)

			send_message_to_ui_output("console", "Working ffmpeg...")
			subprocess.call(['ffmpeg', '-hide_banner', '-i', new_file_name, '-i', audio_file, output_file])
			send_message_to_ui_output("console", "Merging complete!")

		if i != file_lenth - 1:
			send_message_to_ui_output("console", "\n")

	send_message_to_ui_output("file_count", [file_lenth, file_lenth])
	send_message_to_ui_output("event", "finish")
	shutil.rmtree(temp_folder)
	os.chdir(OLD_DIR)


eel.init(resource_path("Web"))
eel.start("main.html", size=(600, 700))
