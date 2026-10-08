const V='satzbuch-v1';
const SHELL=['./','index.html','manifest.webmanifest','icon-180.png','icon-192.png','icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==V).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const r=e.request,u=new URL(r.url);
  if(r.method!=='GET')return;
  // Gemini und Open Food Facts nie cachen
  if(u.hostname.endsWith('googleapis.com')&&u.hostname.startsWith('generativelanguage'))return;
  if(u.hostname.endsWith('openfoodfacts.org'))return;
  const cdn=['fonts.googleapis.com','fonts.gstatic.com','cdn.jsdelivr.net','unpkg.com'].includes(u.hostname);
  if(u.origin!==location.origin&&!cdn)return;
  // Netz zuerst für die App-Seite (damit Updates ankommen), sonst Cache zuerst
  if(r.mode==='navigate'||u.pathname.endsWith('index.html')){
    e.respondWith(fetch(r).then(res=>{const cp=res.clone();caches.open(V).then(c=>c.put(r,cp));return res}).catch(()=>caches.match(r).then(m=>m||caches.match('index.html'))));
    return;
  }
  e.respondWith(caches.match(r).then(m=>m||fetch(r).then(res=>{if(res&&(res.ok||res.type==='opaque')){const cp=res.clone();caches.open(V).then(c=>c.put(r,cp))}return res})));
});
