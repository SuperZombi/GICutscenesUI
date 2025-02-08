import os
import re
import requests
from io import StringIO
import pysubs2


def hex_to_rgb(hex): return tuple(int(hex.lstrip('#')[i:i+2], 16) for i in (0, 2, 4))

def find_subtitles(name, lang, provider):
	filename = f"{name}_{lang}.srt"
	if provider.startswith('http'):
		pattern = r'https://(github|gitlab)\.com/([^/]+)/([^/]+)'
		match = re.search(pattern, provider)
		if match:
			site = match.group(1)
			author = match.group(2)
			repository = match.group(3)

			if site == "gitlab":
				url = f"https://gitlab.com/{author}/{repository}/raw/master/Subtitle/{lang}/{filename}"
			elif site == "github":
				url = f"https://raw.githubusercontent.com/{author}/{repository}/main/Subtitle/{lang}/{filename}"
		else:
			url = f"{provider}/{lang}/{filename}"
		r = requests.get(url)
		if r.ok:
			return StringIO(r.content.decode(r.encoding))
	else:
		path = os.path.join(provider, lang, filename)
		if os.path.exists(path):
			with open(path, 'r', encoding='utf-8') as f:
				data = f.read()
			return StringIO(data)


def srt_to_ass(srt_file, ass_file,
		font_name="Arial", font_size=14,
		text_color='#ffffff',
		outline_color='#000000', outline_width=1
	):
	subs = pysubs2.SSAFile.from_string(srt_file.read(), format_="srt")
	style = pysubs2.SSAStyle()
	style.fontname = font_name
	style.fontsize = font_size
	style.primarycolor = pysubs2.Color(*hex_to_rgb(text_color))
	style.outlinecolor = pysubs2.Color(*hex_to_rgb(outline_color))
	style.outline = outline_width
	style.shadow = 0
	subs.styles["Default"] = style
	subs.save(ass_file, format_="ass")
