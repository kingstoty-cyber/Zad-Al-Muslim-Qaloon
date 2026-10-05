/* UI15 Phase C — verified interactive ayah-region overlay for Libya Qaloon pages. */
(function(){'use strict';
 const DATA='quran-libya-data/ayah-regions.json'; let dbP;
 const load=()=>dbP||(dbP=fetch(DATA).then(r=>{if(!r.ok)throw Error('ayah regions');return r.json()}));
 function pts(poly){return poly.map(p=>`${p[0]*100},${p[1]*100}`).join(' ')}
 async function pageAyahs(page){const d=await load();return d.ayahs.filter(a=>a.regions?.some(r=>+r.page===+page));}
 async function mount(host,page,imageUrl){if(!host)return;const ayahs=await pageAyahs(page);host.classList.add('libya-mushaf-page');host.innerHTML='';
  if(imageUrl){const img=document.createElement('img');img.className='libya-page-image';img.alt=`صفحة ${page} من مصحف ليبيا برواية قالون`;img.src=imageUrl;host.appendChild(img)}
  else {const msg=document.createElement('div');msg.className='libya-page-source-pending';msg.innerHTML=`<strong>صفحة ${page}</strong><span>خريطة الآيات جاهزة. صورة الصفحة المعتمدة غير مضمّنة حتى يتوفر أصل قابل للعرض والتحقق.</span>`;host.appendChild(msg)}
  const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('viewBox','0 0 100 100');svg.classList.add('libya-ayah-overlay');svg.setAttribute('aria-label','مناطق الآيات القابلة للضغط');
  for(const a of ayahs) for(const r of a.regions.filter(x=>+x.page===+page)) for(const seg of r.segments||[]){if(!seg.polygon?.length)continue;const p=document.createElementNS(svg.namespaceURI,'polygon');p.setAttribute('points',pts(seg.polygon));p.dataset.surah=a.surah;p.dataset.ayah=a.ayah;p.setAttribute('tabindex','0');p.setAttribute('role','button');p.setAttribute('aria-label',`سورة ${a.surah} الآية ${a.ayah}`);p.addEventListener('click',()=>select(a.surah,a.ayah));p.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();select(a.surah,a.ayah)}});svg.appendChild(p)}host.appendChild(svg);return ayahs.length}
 function select(surah,ayah){window.ZadQaloon?.save({surah:+surah,ayah:+ayah});highlight(surah,ayah);window.dispatchEvent(new CustomEvent('zad:quran-ayah-selected',{detail:{surah:+surah,ayah:+ayah}}));}
 function highlight(surah,ayah){document.querySelectorAll('.libya-ayah-overlay polygon.is-active').forEach(x=>x.classList.remove('is-active'));document.querySelectorAll(`.libya-ayah-overlay polygon[data-surah="${surah}"][data-ayah="${ayah}"]`).forEach(x=>x.classList.add('is-active'));}
 window.addEventListener('zad:quran-ayah-active',e=>highlight(e.detail.surah,e.detail.ayah));
 window.ZadLibyaPage={load,pageAyahs,mount,select,highlight};
})();
