# WaterlooBudget launch video

`WaterlooBudget_Launch.mp4` is a 47-second, 1920x1080, 30fps launch video with a 128 BPM soundtrack. It uses the Campus Receipt design (cream, ink and #FF5A1F, Space Mono).

## Contents

- `WaterlooBudget_Launch.mp4`: the final video.
- `screens/`: screenshots of the real app (latest `main`), taken at 2x with demo data.
- `source/video.html`: the animated video. Every scene is driven by `render(t)`, so any frame can be reproduced exactly.
- `source/capture.mjs`: Playwright script that takes the screenshots. It runs against `next dev` on port 3100 and mocks Supabase and the AI endpoints with demo data (the user "Vedant Parikh", the team "SYDE 2027 Squad" and example spends).
- `source/render.mjs` and `source/shot.mjs`: render frames or preview stills from `video.html`.
- `source/music.py`: synthesizes `soundtrack.wav` with numpy and scipy.

## Rebuild

```bash
# 1. screenshots (app running: npx next dev -p 3100, with dummy NEXT_PUBLIC_SUPABASE_* env vars)
cd launch-video/source && node capture.mjs
# 2. soundtrack
python3 music.py              # writes music.wav
# 3. frames (1407 frames at 30fps)
node render.mjs 0 1407 30 frames
# 4. encode
ffmpeg -framerate 30 -i frames/f%05d.jpg -i music.wav -af loudnorm=I=-14:TP=-1 \
  -c:v libx264 -crf 18 -pix_fmt yuv420p -c:a aac -b:a 192k -shortest out.mp4
```

Note: in the Map scene, the map tiles are replaced with a grid background, because OpenStreetMap tiles couldn't be loaded where the video was rendered. The markers and popup are real.
