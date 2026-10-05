# QALOON_AUDIO_TIMING_AUDIT

- DOKALI: **114 surahs / 6214 timings**, unique tuples 6214, missing from regions 0, invalid intervals 0, non-monotonic intervals 0 — **PASS**
- HUSARY: **114 surahs / 6214 timings**, unique tuples 6214, missing from regions 0, invalid intervals 0, non-monotonic intervals 0 — **PASS**
- HUDHAIFY: **114 surahs / 6214 timings**, unique tuples 6214, missing from regions 0, invalid intervals 0, non-monotonic intervals 0 — **PASS**

- Static checks cover non-negative starts, `end_ms > start_ms`, monotonic order inside each surah, and 114-surah/6214-timing completeness.
- Actual browser/WebView audio playback, `ended` timing, and audible segment correctness: **NOT RUN** in this Sandbox.
