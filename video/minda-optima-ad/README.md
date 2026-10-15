# Minda Optima — "Cawangan Baru" (iklan video 9:16)

Video iklan ~42.5s, 1080×1920, diedit dengan **HyperFrames** (HTML + GSAP → MP4).

**Hasil akhir:** `output/minda-optima-cawangan-baru.mp4`

## Konsep
"Kami baru buka cawangan di Minda Optima… besar ni je?" → cawangan paling dekat
sebenarnya **dalam rumah anda** (kelas online one-to-one). Motif grafik: pin lokasi
yang mengira jarak turun ke 0 KM dan bertukar jadi rumah tepat pada beat drop.

## Struktur
| Fail | Fungsi |
|---|---|
| `scripts/transcribe.py`, `scripts/chunks.py` | Transkripsi BM (Whisper medium, sherpa-onnx, lokal) |
| `scripts/edl.py` | Pilih take terbaik, buang ulangan & jeda, potong ikut grid beat 120 BPM, potong track suara |
| `scripts/music.py` | Muzik latar asal (disintesis, bebas royalti) 120 BPM |
| `scripts/audio.py` | SFX (disintesis), ducking muzik bawah suara, master −14 LUFS |
| `scripts/template.html` + `scripts/build_comp.py` | Komposisi HyperFrames (motion graphics, caption, transisi) → `public/index.html` |
| `public/` | Projek HyperFrames (fonts Anton/Montserrat, GSAP, soundtrack) |

## Bina semula
Klip raw (DJI_…0816–0823) dari folder Drive → transcode ke `public/media/clips/<id>.mp4`
(1080×1920, 30fps, `-g 15`), audio dibersihkan (DeepFilterNet) ke folder `clean/`, kemudian:

```bash
python3 scripts/edl.py <clean_dir> build
python3 scripts/audio.py build public/media/soundtrack.wav
python3 scripts/build_comp.py
cd public && npx hyperframes lint . && npx hyperframes render . -o ../output/render-raw.mp4 --fps 30 --quality high
```
