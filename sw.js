/* Service worker del Monitor SPB: guarda la carcasa de la app para abrir rápido y sin red.
   Los datos (Supabase) NUNCA se guardan en caché: siempre van a la red. */
const V='monitor-spb-v2';
const SHELL=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png','./logo.png','./emblema.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==V).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const r=e.request,u=new URL(r.url);
  if(r.method!=='GET')return;
  if(u.hostname.endsWith('supabase.co'))return;   // datos y login: siempre red
  if(r.mode==='navigate'){   // página: red primero, caché si no hay señal
    e.respondWith(fetch(r).then(x=>{const c=x.clone();caches.open(V).then(h=>h.put('./index.html',c));return x}).catch(()=>caches.match('./index.html')));return}
  if(u.hostname==='cdn.jsdelivr.net'||u.origin===location.origin){   // librería y archivos propios: caché y se actualiza detrás
    e.respondWith(caches.open(V).then(async c=>{const hit=await c.match(r);const net=fetch(r).then(x=>{if(x.ok)c.put(r,x.clone());return x}).catch(()=>hit);return hit||net}))}
});
