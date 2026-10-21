"""Audio mix for Eja BA BA video. Usage: python3 mix.py <assets_dir> <video_noaudio> <out.mp4>"""
import re, subprocess, sys
A, VID, OUT = sys.argv[1] + '/', sys.argv[2], sys.argv[3]
POP = .1  # sfx_pop file holds several pops; keep only the first
# (file, start_sec, volume, trim_len or None, fade_out_start or None)
ev = [('sfx_blip', 0.05, .35, .6, None), ('sfx_blip', 0.35, .35, .6, None), ('sfx_pop', 0.70, .6, POP, None),
      ('sfx_blip', 2.10, .35, .6, None), ('sfx_blip', 2.45, .35, .6, None), ('sfx_pop', 2.85, .6, POP, None),
      ('sfx_blip', 3.40, .35, .6, None), ('sfx_blip', 3.75, .35, .6, None), ('sfx_pop', 4.15, .6, POP, None),
      ('01_mak_tanya', 5.10, 1.0, None, None), ('sfx_pop', 7.54, .55, POP, None),
      ('sfx_think', 8.55, .5, 1.6, None),
      ('sfx_pop', 10.80, .6, POP, None), ('sfx_boing', 10.85, 1.0, .4, None), ('sfx_boing', 11.45, .9, .4, None),
      ('sfx_boing', 11.86, .7, .4, None),
      ('sfx_krik', 12.40, .45, 2.6, 2.0), ('02_mak_keluh', 12.90, 1.0, None, None),
      ('sfx_ding', 15.65, .5, None, None), ('sfx_pop', 16.0, .45, POP, None)]
inp, fl = [], []
for i, (f, st, v, tl, fo) in enumerate(ev):
    inp += ['-i', A + f + '.mp3']
    c = f'[{i + 1}:a]aformat=sample_rates=48000:channel_layouts=stereo'
    if tl:
        fade_st = fo if fo else max(0, tl - 0.03)
        c += f',atrim=0:{tl},afade=t=out:st={fade_st}:d={tl - fade_st}'
    ms = int(st * 1000)
    fl.append(c + f',volume={v},adelay={ms}|{ms}[a{i}]')
fl.append(''.join(f'[a{i}]' for i in range(len(ev))) +
          f'amix=inputs={len(ev)}:normalize=0,apad,atrim=0:18.6,loudnorm=I=-14:TP=-1.5:LRA=11[m]')
subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', VID] + inp +
               ['-filter_complex', ';'.join(fl), '-map', '0:v', '-map', '[m]', '-c:v', 'copy', '-c:a', 'aac',
                '-b:a', '192k', '-ar', '48000', '-movflags', '+faststart', '-shortest', OUT], check=True)
