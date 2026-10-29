/* Tau Volantis: service worker.
   - Arquivos do próprio app: "rede primeiro". Com internet, sempre pega a versão mais nova (subir uma atualização no GitHub vale na hora).
     Sem internet, abre a última cópia guardada. Não precisa mudar este arquivo a cada versão do app.
   - Bibliotecas de CDN (Leaflet, Firebase SDK, fontes): "cache primeiro", porque o endereço de cada uma já traz a versão.
     Assim o app abre mesmo sem sinal. O mapa-base (blocos do OpenStreetMap), o Firebase (dados da mesa) e o Discord NÃO passam por aqui:
     sem internet o app abre, mas o mapa-base fica vazio e a mesa não sincroniza.
   - Só GET. Nada de POST/PUT é interceptado. */
const CACHE = 'tau-app-v1';
const CDN_CACHE = 'tau-cdn-v1';
const BASE = ['./', 'index.html', 'style.css', 'app.js', 'tv-icons.js', 'tv-sons.mp3', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png', 'apple-touch-icon.png'];
const CDN = ['https://unpkg.com/leaflet@1.9.4/', 'https://unpkg.com/leaflet-draw@1.0.4/', 'https://www.gstatic.com/firebasejs/', 'https://fonts.googleapis.com/', 'https://fonts.gstatic.com/'];

self.addEventListener('install', e => {
  // um arquivo que falhe (ex.: ainda não enviado ao GitHub) não pode impedir a instalação do service worker
  e.waitUntil(caches.open(CACHE).then(c => Promise.allSettled(BASE.map(u => c.add(new Request(u, { cache: 'reload' }))))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE && k !== CDN_CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

// guarda a cópia e apaga as versões antigas do mesmo arquivo (style.css?v=f10 etc.), para o cache não crescer a cada atualização
async function guardar(r, res) {
  const c = await caches.open(CACHE), u = new URL(r.url);
  const ks = await c.keys();
  await Promise.all(ks.filter(k => { const x = new URL(k.url); return x.pathname === u.pathname && x.search !== u.search; }).map(k => c.delete(k)));
  await c.put(r, res);
}
function redePrimeiro(r) {
  return fetch(r, { cache: 'no-cache' }).then(res => {
    if (res.ok && res.type === 'basic') guardar(r, res.clone());
    return res;
  }).catch(() => caches.match(r).then(m => m || caches.match(r, { ignoreSearch: true })).then(m => m || (r.mode === 'navigate' ? caches.match('index.html') : Response.error())));
}
function cdn(r) {
  return caches.open(CDN_CACHE).then(c => c.match(r.url).then(hit => hit || fetch(new Request(r.url, { mode: 'cors', credentials: 'omit' })).then(res => {
    if (res.ok) c.put(r.url, res.clone());
    return res;
  }).catch(() => fetch(r))));
}
self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET' || r.headers.has('range')) return;
  if (new URL(r.url).origin === location.origin) return e.respondWith(redePrimeiro(r));
  if (CDN.some(p => r.url.startsWith(p))) return e.respondWith(cdn(r));
  // o resto (Firebase em tempo real, blocos do mapa, Discord, login do Google) o navegador resolve sozinho
});
