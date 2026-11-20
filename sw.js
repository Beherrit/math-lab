const C='mathlab-v1',S=['/','/css/app.css','/js/app.js','/js/util.js','/js/skills.js','/js/skills-a.js','/js/skills-b.js','/js/skills-c.js','/js/skills-d.js','/js/facts.js','/icons/icon-192.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(S)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{const r=e.request;if(r.method!=='GET')return;e.respondWith(fetch(r).then(res=>{if(res&&(res.ok||res.type==='opaque')){const c=res.clone();caches.open(C).then(x=>x.put(r,c))}return res}).catch(()=>caches.match(r).then(m=>m||(r.mode==='navigate'?caches.match('/'):undefined))))});
