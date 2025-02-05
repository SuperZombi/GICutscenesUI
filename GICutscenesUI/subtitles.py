import requests
from io import StringIO
import pysrt
import matplotlib.font_manager


def get_all_fonts():
	font_paths = matplotlib.font_manager.findSystemFonts()
	return [matplotlib.font_manager.FontProperties(fname=path).get_name() for path in font_paths]


def find_subtitle_in_web(sub_name, provider, lang):
	filename = f"{sub_name}_{lang}.srt"
	if provider == "https://gitlab.com/Dimbreath/AnimeGameData":
		url = f"{provider}/raw/master/Subtitle/{lang}/{filename}"
	else:
		raise NameError("Provider is not supported")

	r = requests.get(url)
	if r.ok:
		return StringIO(r.content.decode(r.encoding))


def srt_to_ass(srt_file, ass_file, font_name="Arial", font_size=18):
	subs = pysrt.stream(srt_file)
	with open(ass_file, 'w', encoding='utf-8') as f:
		f.write("[Script Info]\n")
		f.write("Title: Converted Subtitles\n")
		f.write("ScriptType: v4.00+\n")
		f.write("WrapStyle: 0\n")
		f.write("PlayDepth: 0\n\n")
		f.write("[V4+ Styles]\n")
		f.write(f"Style: Default,{font_name},{font_size},&H00FFFFFF,&H000000FF,"
				"&H00000000,&H00000000,-1,0,0,0,100,100,0,0,1,2.0,0,2,10,10,10,1\n\n")
		f.write("[Events]\n")
		f.write("Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text\n")

		for sub in subs:
			start = sub.start.to_time()
			end = sub.end.to_time()
			start_time = f"{start.hour:02}:{start.minute:02}:{start.second:02}.{int(start.microsecond/10000):02}"
			end_time = f"{end.hour:02}:{end.minute:02}:{end.second:02}.{int(end.microsecond/10000):02}"
			f.write(f"Dialogue: 0,{start_time},{end_time},Default,,0,0,0,,{sub.text}\n")
