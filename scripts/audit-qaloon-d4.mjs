import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const dataDir = resolve(root, 'quran-libya-data');
const readJson = async name => JSON.parse(await readFile(resolve(dataDir, name), 'utf8'));
const readText = async name => readFile(resolve(root, name), 'utf8');
const failures = [];
const ok = (condition, message) => { if (!condition) failures.push(message); };
const key = (surah, ayah) => `${surah}:${ayah}`;
const normalizeArabic = value => String(value ?? '')
  .replace(/[\u0610-\u061a\u064b-\u065f\u0670\u06d6-\u06ed]/g, '')
  .replace(/[٠-٩]/g, '')
  .replace(/[^ء-ي\s]/g, ' ')
  .replace(/\s+/g, ' ')
  .replaceAll('العلمين', 'العالمين')
  .trim();

const [text, regions, dokali, husary, hudhaifi, manifest, quranJs, qaloonJs, appJs, quranAudio, surahAudio, prepare, sw] = await Promise.all([
  readJson('qaloon-text.json'), readJson('ayah-regions.json'),
  readJson('dokali_qaloon-timings.json'), readJson('husary_qaloon-timings.json'),
  readJson('hudhaifi_qaloon-timings.json'), readJson('manifest.json'),
  readText('quran.js'), readText('quran-libya.js'), readText('app.js'),
  readText('quran-audio.js'), readText('surah-audio.js'), readText('scripts/prepare-capacitor.mjs'), readText('sw.js')
]);

const textKeys = new Set();
const textBySurah = text.verses || {};
for (const [surah, verses] of Object.entries(textBySurah)) {
  for (const verse of verses) textKeys.add(key(Number(surah), Number(verse.ayah)));
}
const regionKeys = new Set((regions.ayahs || []).map(item => key(item.surah, item.ayah)));
const timingSets = {
  dokali_qaloon: dokali,
  husary_qaloon: husary,
  hudhaifi_qaloon: hudhaifi
};
for (const id of manifest.reciters || []) {
  if (!timingSets[id]) timingSets[id] = await readJson(`${id}-timings.json`);
}
const coreTimingNames = new Set(['dokali_qaloon', 'husary_qaloon', 'hudhaifi_qaloon']);
const timingKeys = {};

ok(Array.isArray(text.surahs) && text.surahs.length === 114, `surahs=${text.surahs?.length ?? 0}, expected 114`);
ok(text.count === 6214 && textKeys.size === 6214, `Qaloon text count=${text.count}, unique keys=${textKeys.size}, expected 6214/6214`);
ok((regions.ayahs || []).length === 6214 && regionKeys.size === 6214, `regions count=${regions.ayahs?.length ?? 0}, unique keys=${regionKeys.size}, expected 6214/6214`);
ok(textKeys.size === regionKeys.size && [...textKeys].every(item => regionKeys.has(item)), 'Qaloon text ↔ regions key mismatch');

const pages = new Set();
let invalidRegions = 0;
for (const item of regions.ayahs || []) {
  for (const region of item.regions || []) {
    const page = Number(region.page);
    if (!Number.isInteger(page) || page < 1 || page > 602) invalidRegions++;
    else pages.add(page);
  }
}
ok(pages.size === 602 && [...pages].sort((a, b) => a - b).every((page, index) => page === index + 1), `pages=${pages.size}, expected continuous 1..602`);
ok(invalidRegions === 0, `invalid region pages=${invalidRegions}`);

for (const [name, timing] of Object.entries(timingSets)) {
  const keys = new Set();
  let invalid = 0;
  for (const [surah, verses] of Object.entries(timing)) {
    for (const item of verses || []) {
      const k = key(Number(surah), Number(item.ayah));
      if (keys.has(k)) invalid++;
      keys.add(k);
      if (!(Number(item.start_ms) >= 0 && Number(item.end_ms) > Number(item.start_ms))) invalid++;
    }
  }
  timingKeys[name] = keys;
  if (coreTimingNames.has(name)) {
    ok(keys.size === 6214, `${name} unique timing keys=${keys.size}, expected 6214`);
    ok(keys.size === textKeys.size && [...textKeys].every(item => keys.has(item)), `${name} key mismatch with Qaloon text`);
  } else {
    ok(Object.keys(timing).length === 114, `${name} surahs=${Object.keys(timing).length}, expected 114`);
    ok(keys.size > 0 && [...keys].every(item => textKeys.has(item)), `${name} contains keys outside Qaloon text`);
  }
  ok(invalid === 0, `${name} invalid intervals/duplicates=${invalid}`);
}

const fatiha = (textBySurah['1'] || []).find(item => Number(item.ayah) === 1);
ok(normalizeArabic(fatiha?.text).includes('الحمد لله رب العالمين'), `Fatiha 1:1 unexpected text: ${fatiha?.text ?? 'missing'}`);
ok(!(textBySurah['1'] || []).some(item => Number(item.ayah) === 0), 'Fatiha contains an invalid basmala ayah 0');
ok(manifest.verified === true && manifest.ayahRegions === 6214, 'Qaloon manifest verification metadata mismatch');
ok(Array.isArray(manifest.reciters) && manifest.reciters.length >= 3, 'Qaloon reciter manifest is missing reciters');
ok((manifest.reciters || []).every(id => qaloonJs.includes(`'${id}'`)), 'Qaloon reciter manifest and player list mismatch');

const sampleSurahs = [1, 2, 3, 9, 36, 55, 67, 112, 113, 114];
for (const surah of sampleSurahs) {
  const total = (textBySurah[String(surah)] || []).length;
  ok(total > 0, `sample surah ${surah} has no verses`);
  for (const ayah of [...new Set([1, Math.ceil(total / 2), total])]) {
    const k = key(surah, ayah);
    ok(textKeys.has(k) && regionKeys.has(k) && [...coreTimingNames].every(name => timingKeys[name].has(k)), `sample boundary missing ${k}`);
  }
}

ok(quranJs.includes("localStorage.setItem(KEYS.mode, 'qaloon')"), 'Qaloon mode persistence missing');
ok(quranJs.includes('selectQaloonAyah') && quranJs.includes('openQaloonSurah'), 'Qaloon text reader actions missing');
ok(!quranJs.includes('ZadQaloon.attach(content'), 'Qaloon must not attach to Uthmani 6236 DOM');
ok(qaloonJs.includes('activate(surah,next)') && qaloonJs.includes("detail:{surah:+surah,ayah:+ayah}"), 'Qaloon active ayah transition/highlight missing');
ok(qaloonJs.includes('window.stopDhikrAudio?.()') && qaloonJs.includes('window.stopQuranAyahAudio?.()') && qaloonJs.includes('window.stopSurahAudio?.()'), 'Qaloon audio conflict prevention missing');
ok(appJs.includes('window.ZadQaloon?.stop?.()') && quranAudio.includes('window.ZadQaloon?.stop?.()') && surahAudio.includes('window.ZadQaloon?.stop?.()'), 'other audio sources must stop Qaloon');

if (failures.length) {
  console.error('QALOON D4 AUDIT FAIL\n- ' + failures.join('\n- '));
  process.exit(1);
}
  console.log(`QALOON D8 AUDIT PASS — 114 surahs; 6214 unique ayahs; 602 continuous pages; ${manifest.reciters.length} reciters; Fatiha; audio conflict; sampled boundaries.`);
