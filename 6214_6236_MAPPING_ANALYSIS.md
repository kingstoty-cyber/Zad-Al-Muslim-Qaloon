# 6214_6236_MAPPING_ANALYSIS

- Qaloon canonical dataset: **6214** surah+ayah tuples.
- Existing Hafs reader/data declares **6236** ayahs and uses 6236-based progress/search text.
- `quran-libya.js` resolves Qaloon information by `surah + ayah` (or explicit `surah:ayah` lookup), not by blind `tafsir[globalAyahNumber]`.
- Qaloon audio timing and page lookup also use `surah + ayah`.

## Information datasets
- `tafsir-muyassar.json`: top-level dict, entries 114
- `tafsir-saadi.json`: top-level dict, entries 114
- `irab.json`: top-level dict, entries 6175
- `quran_asbab_al_nuzool.json`: top-level dict, entries 2
- `mutashabihat.json`: top-level dict, entries 2646

## Safe conclusion
- A direct global-index mapping between 6214 and 6236 is **NOT READY** and is not introduced.
- Qaloon information is shown only when a source-specific surah/ayah lookup returns data; otherwise the UI displays a no-data message.
- No Quran text or ayah numbering was rewritten.
- Result: **PASS** for avoiding blind cross-system mapping; **NOT READY** for a universal 6214↔6236 mapping.
