(function(){
  const PIN_ICONS = {
    saque:        '<path d="M6 8a6 6 0 0 1 12 0v11a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V8Z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/><path d="M9 13h6"/>',
    perigo:       '<path d="M12 3 2 21h20L12 3Z"/><path d="M12 10v5"/><path d="M12 18h.01"/>',
    abrigo:       '<path d="M3 11 12 3l9 8"/><path d="M5 10v10h14V10"/>',
    npc:          '<circle cx="12" cy="7" r="4"/><path d="M4 21c1.5-4 5-6 8-6s6.5 2 8 6"/>',
    agua:         '<path d="M12 2.5s6.5 7.2 6.5 11.5a6.5 6.5 0 0 1-13 0C5.5 9.7 12 2.5 12 2.5Z"/>',
    suprimentos:  '<path d="M21 8 12 3 3 8l9 5 9-5Z"/><path d="M3 8v9l9 5V13"/><path d="M21 8v9l-9 5"/>',
    combustivel:  '<path d="M7 3h7l3 3v14a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z"/><path d="M10 3v3h4"/><path d="M8 12h6"/><path d="M8 16h6"/>',
    medico:       '<rect x="3" y="3" width="18" height="18" rx="3"/><path d="M12 7.5v9M7.5 12h9"/>',
    municao:      '<rect x="6" y="2" width="4" height="9" rx="1.4"/><rect x="14" y="2" width="4" height="9" rx="1.4"/><path d="M3 12h18v9H3z"/>',
    radiacao:     '<circle cx="12" cy="12" r="2.6"/><path d="M12 2v4.6M12 17.4V22M3.5 7.2l4 2.3M16.5 14.5l4 2.3M20.5 7.2l-4 2.3M7.5 14.5l-4 2.3"/>',
    ameaca:       '<path d="M12 2a8 8 0 0 0-8 8c0 3 1.6 5 3 6.1V19a1 1 0 0 0 1 1h1v-2.2h2V20h2v-2.2h2V20h1a1 1 0 0 0 1-1v-2.9c1.4-1.1 3-3.1 3-6.1a8 8 0 0 0-8-8Z"/><circle cx="9" cy="10" r="1.3"/><circle cx="15" cy="10" r="1.3"/>',
    extracao:     '<path d="M5 3v18"/><path d="M5 4h13l-3 4 3 4H5"/>',
    comunicacao:  '<path d="M12 3v5"/><circle cx="12" cy="13" r="2.6"/><path d="M6 9.5a8.5 8.5 0 0 1 0 7M18 9.5a8.5 8.5 0 0 1 0 7M8.8 11.3a4.5 4.5 0 0 0 0 3.4M15.2 11.3a4.5 4.5 0 0 0 0 3.4"/>',
    armadilha:    '<path d="M3 12h18"/><path d="M6.5 12V7.2a2.3 2.3 0 0 1 4.6 0V12"/><path d="M12.9 12V7.2a2.3 2.3 0 0 1 4.6 0V12"/><path d="M4.5 12l1.6 8h11.8l1.6-8"/>',
    veiculo:      '<path d="M5 11 6.7 5.4A2 2 0 0 1 8.6 4h6.8a2 2 0 0 1 1.9 1.4L19 11"/><rect x="3" y="11" width="18" height="7" rx="2"/><circle cx="7.5" cy="18.3" r="1.6"/><circle cx="16.5" cy="18.3" r="1.6"/>',
    nota:         '<path d="M6 2h9l3 3v17H6z"/><path d="M15 2v3h3"/><path d="M9 12h6M9 16h6"/>',
    pin:          '<path d="M12 21s-7-7.2-7-12a7 7 0 0 1 14 0c0 4.8-7 12-7 12Z"/><circle cx="12" cy="9" r="2.4"/>'
  };
  const PIN_TYPES = [
    { id:'saque',        label:'Saque',        color:'var(--frost)' },
    { id:'perigo',       label:'Perigo',       color:'var(--hazard)' },
    { id:'abrigo',       label:'Abrigo',       color:'var(--safe)' },
    { id:'npc',          label:'NPC',          color:'var(--ice-300)' },
    { id:'agua',         label:'Água',         color:'var(--water)' },
    { id:'suprimentos',  label:'Suprimentos',  color:'var(--supply)' },
    { id:'combustivel',  label:'Combustível',  color:'var(--fuel)' },
    { id:'medico',       label:'Médico',       color:'var(--medic)' },
    { id:'municao',      label:'Munição',      color:'var(--ammo)' },
    { id:'radiacao',     label:'Radiação',     color:'var(--rad)' },
    { id:'ameaca',       label:'Ameaça',       color:'var(--threat)' },
    { id:'extracao',     label:'Extração',     color:'var(--extract)' },
    { id:'comunicacao',  label:'Rádio',        color:'var(--comm)' },
    { id:'armadilha',    label:'Armadilha',    color:'var(--trap)' },
    { id:'veiculo',      label:'Veículo',      color:'var(--vehicle)' },
    { id:'nota',         label:'Nota',         color:'var(--ice-100)' },
    { id:'pin',          label:'Pino',         color:'var(--neutral)' }
  ];
  const PING_TYPES = ['perigo', 'radiacao', 'ameaca', 'armadilha'];
  const KEY_PINS = 'tv-map:pins';
  const KEY_TOKENS = 'tv-map:tokens';
  const KEY_SHAPES = 'tv-map:shapes';
  const KEY_ROUTES = 'tv-map:routes';
  const KEY_WEATHER = 'tv-map:weather';
  const KEY_INV = 'tv-map:inventories';
  const KEY_LOG = 'tv-map:loot-log';
  let MAX_INV = 20;
  const KEY_CHARS = 'tv-map:characters';
  const KEY_ROLLS = 'tv-map:rolls';
  const KEY_RECIPES = 'tv-map:recipes';
  const KEY_CLOCK = 'tv-map:clock';
  const KEY_SHORTCUTS = 'tv-map:shortcuts';
  const DB_KEYS = new Set([KEY_CHARS, KEY_ROLLS, KEY_RECIPES, KEY_CLOCK, KEY_SHORTCUTS]);
  const SCOPED_KEYS = new Set([KEY_PINS, KEY_TOKENS, KEY_SHAPES, KEY_ROUTES, KEY_WEATHER, KEY_INV, KEY_LOG].concat(Array.from(DB_KEYS)));

  // ---------- campanhas: todo dado de jogo pertence a uma campanha ----------
  // A campanha "legacy" (a que já existia) continua nos caminhos antigos, sem
  // copiar nem mover nada. As campanhas novas gravam em campaigns/{id}/...
  let activeCampaignId = (function(){
    try{ return localStorage.getItem('tv-map:active-campaign') || 'legacy'; }catch(e){ return 'legacy'; }
  })();
  const syncOff = [];
  function scopedKey(key, cid){
    cid = cid || activeCampaignId;
    return (cid === 'legacy' || !SCOPED_KEYS.has(key)) ? key : 'campaigns/' + cid + '/' + key;
  }
  function localKey(key, cid){
    cid = cid || activeCampaignId;
    return (cid === 'legacy' || !SCOPED_KEYS.has(key)) ? key : 'tv-map:c:' + cid + ':' + key.slice(7);
  }
  function fbRefOf(key){ return firebaseDb.ref('tau-volantis/' + scopedKey(key)); }
  function listen(ref, cb, errCb){
    ref.on('value', cb, errCb);
    syncOff.push(() => ref.off('value', cb));
  }
  function detachSync(){
    while(syncOff.length){ try{ syncOff.pop()(); }catch(e){} }
  }

  // Banco simples para os módulos novos (fichas, rolagens, sessões, receitas...).
  // Com Firebase usa o mesmo banco do mapa; sem Firebase guarda tudo no navegador.
  const DB = (function(){
    let tree = {};
    const subs = [];
    try{ tree = JSON.parse(localStorage.getItem('tv-map:db') || '{}') || {}; }catch(e){ tree = {}; }
    const persist = () => { try{ localStorage.setItem('tv-map:db', JSON.stringify(tree)); }catch(e){} };
    const parts = p => p.split('/').filter(Boolean);
    function getLocal(path){
      let n = tree;
      for(const k of parts(path)){ if(n == null || typeof n !== 'object') return null; n = n[k]; }
      return n === undefined ? null : n;
    }
    function setLocal(path, val){
      const ps = parts(path);
      if(!ps.length) return;
      let n = tree;
      for(let i = 0; i < ps.length - 1; i++){
        if(n[ps[i]] == null || typeof n[ps[i]] !== 'object') n[ps[i]] = {};
        n = n[ps[i]];
      }
      const last = ps[ps.length - 1];
      if(val === null || val === undefined) delete n[last];
      else n[last] = JSON.parse(JSON.stringify(val));
    }
    function notify(path){
      subs.slice().forEach(s => {
        if(s.path === path || s.path.startsWith(path + '/') || path.startsWith(s.path + '/')) s.cb(getLocal(s.path));
      });
    }
    return {
      getLocal,
      async get(path){
        if(firebaseReady){
          try{ return (await firebaseDb.ref('tau-volantis/' + path).once('value')).val(); }
          catch(e){ console.error('Falha ao ler', path, e); return null; }
        }
        return getLocal(path);
      },
      async set(path, val){
        if(firebaseReady){
          try{ await firebaseDb.ref('tau-volantis/' + path).set(val); return true; }
          catch(e){ console.error('Falha ao gravar', path, e); return false; }
        }
        setLocal(path, val); persist(); notify(path);
        return true;
      },
      async update(map){
        if(firebaseReady){
          try{ await firebaseDb.ref('tau-volantis').update(map); return true; }
          catch(e){ console.error('Falha ao gravar', e); return false; }
        }
        Object.keys(map).forEach(p => setLocal(p, map[p]));
        persist();
        Object.keys(map).forEach(notify);
        return true;
      },
      newId(path){
        return firebaseReady ? firebaseDb.ref('tau-volantis/' + path).push().key
          : 'i' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
      },
      ts(){ return firebaseReady ? firebase.database.ServerValue.TIMESTAMP : Date.now(); },
      on(path, cb, limit){
        if(firebaseReady){
          let ref = firebaseDb.ref('tau-volantis/' + path);
          if(limit) ref = ref.limitToLast(limit);
          const h = snap => cb(snap.val());
          ref.on('value', h, err => console.error('Erro de sincronização', path, err));
          return () => ref.off('value', h);
        }
        const s = { path, cb };
        subs.push(s);
        Promise.resolve().then(() => { if(subs.indexOf(s) >= 0) cb(getLocal(path)); });
        return () => { const i = subs.indexOf(s); if(i >= 0) subs.splice(i, 1); };
      }
    };
  })();

  // leitura/escrita de uma chave de campanha qualquer (usado ao copiar/excluir)
  async function readScoped(cid, key){
    if(firebaseReady){
      try{ return (await firebaseDb.ref('tau-volantis/' + scopedKey(key, cid)).once('value')).val(); }
      catch(e){ return null; }
    }
    if(DB_KEYS.has(key)) return DB.getLocal(scopedKey(key, cid));
    try{ const raw = localStorage.getItem(localKey(key, cid)); return raw ? JSON.parse(raw) : null; }catch(e){ return null; }
  }
  async function writeScoped(cid, key, val){
    if(firebaseReady){ await firebaseDb.ref('tau-volantis/' + scopedKey(key, cid)).set(val); return; }
    if(DB_KEYS.has(key)){ await DB.set(scopedKey(key, cid), val); return; }
    if(val === null) localStorage.removeItem(localKey(key, cid));
    else localStorage.setItem(localKey(key, cid), JSON.stringify(val));
  }

  const WEATHER_STATES = {
    calmo: { label: 'Calmo', desc: 'Céu claro, visibilidade normal.', emoji: '🌤️' },
    nevasca: { label: 'Nevasca', desc: 'Neve pesada reduz visibilidade e castiga quem está exposto.', emoji: '🌨️' },
    espectral: { label: 'Nevasca Espectral', desc: 'Algo se move dentro da nevasca. Perigo ativo — considere convocar um evento.', emoji: '👁️' }
  };

  const SP_CENTER = [-23.5505, -46.6333];
  const SHAPE_STYLE = { color: 'var(--hazard)', weight: 2, fillColor: 'var(--hazard)', fillOpacity: 0.1, dashArray: '6 4' };

  let pins = [];
  let tokens = [];
  let shapes = [];
  let routes = [];
  let inventories = {}; // donoId -> { itemUid: item }
  let lootLog = [];     // registro de transações (somente acréscimo)
  var invReady = false; // var de propósito: lido antes do módulo de inventário existir
  let weather = { state: 'calmo', updatedAt: null, updatedBy: null };
  let selectedPinType = null;
  let tokenModeOn = false;
  let circleModeOn = false;
  let routeModeOn = false;
  let idCounter = 1;

  function newId(){ return 'id' + (Date.now()) + '-' + (idCounter++); }
  function escapeHtml(str){
    const d = document.createElement('div');
    d.textContent = str || '';
    return d.innerHTML;
  }
  function formatDistance(meters){
    if(meters < 1000) return Math.round(meters) + ' m';
    return (meters/1000).toFixed(2) + ' km';
  }
  function totalDistanceOf(points){
    let d = 0;
    for(let i=1;i<points.length;i++){
      d += L.latLng(points[i-1]).distanceTo(L.latLng(points[i]));
    }
    return d;
  }

  // ---------- travel-time estimates for the route tool ----------
  // The route tool measures straight-line (geodesic) distance between the
  // clicked points — there's no road/trail routing engine here — so these
  // times are estimates based on average speed per mode, not a real route.
  const SPEED_PROFILES = [
    { id:'pe',      label:'A pé',      kmh:5  },
    { id:'corrida', label:'Corrida',   kmh:10 },
    { id:'bike',    label:'Bicicleta', kmh:16 },
    { id:'carro',   label:'Carro',     kmh:60 }
  ];
  function estimateHours(meters, kmh){ return (meters / 1000) / kmh; }
  function formatDuration(hours){
    const totalMin = Math.max(1, Math.round(hours * 60));
    if(totalMin < 60) return totalMin + ' min';
    const h = Math.floor(totalMin / 60);
    const m = totalMin % 60;
    return h + 'h' + (m > 0 ? ' ' + m + 'min' : '');
  }

  // ---------- storage / sincronização em tempo real ----------
  // Prioridade: Firebase Realtime Database (multiplayer de verdade, funciona
  // hospedado no GitHub Pages) > Claude artifact cloud storage (window.storage,
  // só existe dentro do claude.ai) > localStorage (fallback só-neste-navegador,
  // usado se nada online estiver disponível, ex. sem internet).
  const FIREBASE_CONFIG = {
    apiKey: "AIzaSyAcvhEVhvTHDoIXr_Q4w_7Kj5U5p4_3iRQ",
    authDomain: "tau-volantis-mapa.firebaseapp.com",
    databaseURL: "https://tau-volantis-mapa-default-rtdb.firebaseio.com",
    projectId: "tau-volantis-mapa",
    storageBucket: "tau-volantis-mapa.firebasestorage.app",
    messagingSenderId: "625162616810",
    appId: "1:625162616810:web:55255b2ab4ec3b0fc27c93"
  };
  let firebaseDb = null;
  let firebaseReady = false;
  try{
    if(typeof firebase !== 'undefined'){
      firebase.initializeApp(FIREBASE_CONFIG);
      firebaseDb = firebase.database();
      firebaseReady = true;
    }
  }catch(e){
    console.error('Firebase indisponível, usando armazenamento local/nuvem do Claude', e);
  }
  function setSyncStatus(state){
    const el = document.getElementById('sync-status');
    if(!el) return;
    el.classList.remove('live','offline');
    if(state === 'live'){ el.textContent = 'Tempo real — conectado'; el.classList.add('live'); }
    else if(state === 'offline'){ el.textContent = 'Sem Firebase — salvando só neste navegador'; el.classList.add('offline'); }
    else { el.textContent = 'Conectando...'; }
  }

  // ---------- login com Google + camada de "jogador" ----------
  // O login em si só identifica a conta Google; o "jogador" é um perfil à
  // parte (nome escolhido por quem está jogando), guardado em
  // tau-volantis/players/{uid} no mesmo Firebase que já sincroniza o mapa.
  // Isso é o que fica gravado em pins/tokens/áreas/rotas como "quem criou".
  let auth = null;
  try{
    if(firebaseReady && typeof firebase !== 'undefined' && firebase.auth){
      auth = firebase.auth();
    }
  }catch(e){ console.error('Firebase Auth indisponível', e); }

  let currentUser = null;   // usuário do Firebase Auth (uid, displayName, photoURL do Google)
  let currentPlayer = null; // perfil de jogador: { uid, playerName, googleName, photoURL }

  // usado ao criar pins/tokens/shapes/rotas, pra registrar quem criou
  function ownerFields(){
    return currentPlayer
      ? { ownerId: currentPlayer.uid, ownerName: currentPlayer.playerName }
      : { ownerId: null, ownerName: null };
  }

  async function loadPlayerProfile(uid){
    if(!firebaseReady) return null;
    try{
      const snap = await firebaseDb.ref('tau-volantis/players/' + uid).once('value');
      return snap.val();
    }catch(e){ console.error('Falha ao carregar perfil do jogador', e); return null; }
  }
  async function savePlayerProfile(profile){
    if(!firebaseReady) return;
    try{
      await firebaseDb.ref('tau-volantis/players/' + profile.uid).set(profile);
    }catch(e){ console.error('Falha ao salvar perfil do jogador', e); }
  }

  function renderAccountPanel(){
    const loginBtn = document.getElementById('google-login-btn');
    const userBox = document.getElementById('hud-account-user');
    if(currentUser && currentPlayer){
      loginBtn.style.display = 'none';
      userBox.style.display = 'flex';
      document.getElementById('hud-account-name').textContent = currentPlayer.playerName;
      const avatar = document.getElementById('hud-account-avatar');
      if(currentPlayer.photoURL){
        avatar.style.backgroundImage = `url('${currentPlayer.photoURL}')`;
        avatar.textContent = '';
      } else {
        avatar.style.backgroundImage = 'none';
        avatar.textContent = (currentPlayer.playerName || '?').trim().slice(0,1).toUpperCase();
      }
    } else {
      loginBtn.style.display = '';
      userBox.style.display = 'none';
    }
    if(typeof syncHeaderAvatar === 'function') syncHeaderAvatar();
  }

  function openPlayerNameModal(prefill){
    document.getElementById('player-name-input').value = prefill || '';
    document.getElementById('player-name-backdrop').classList.add('open');
    document.getElementById('player-name-modal').classList.add('open');
    setTimeout(() => document.getElementById('player-name-input').focus(), 50);
  }
  function closePlayerNameModal(){
    document.getElementById('player-name-backdrop').classList.remove('open');
    document.getElementById('player-name-modal').classList.remove('open');
  }

  document.getElementById('google-login-btn').addEventListener('click', async () => {
    if(!auth){ alert('Login indisponível: não foi possível carregar o Firebase Auth.'); return; }
    try{
      const provider = new firebase.auth.GoogleAuthProvider();
      await auth.signInWithPopup(provider);
    }catch(e){
      console.error('Falha no login com Google', e);
      // erro visível, não só no console — sem isso, um clique que falha
      // (domínio não autorizado, popup bloqueado, etc) parece "não fazer nada"
      alert('Não foi possível entrar com Google.\n\nMotivo: ' + (e.code || e.message || e) +
        '\n\nSe você abriu este HTML como arquivo local, isso é esperado: o login só funciona quando o mapa está hospedado num domínio (ex: GitHub Pages) cadastrado nos "Authorized domains" do Firebase.');
    }
  });
  document.getElementById('hud-account-logout-btn').addEventListener('click', async () => {
    if(auth) await auth.signOut();
  });
  document.getElementById('hud-account-edit-btn').addEventListener('click', () => {
    openPlayerNameModal(currentPlayer ? currentPlayer.playerName : '');
  });
  document.getElementById('player-name-backdrop').addEventListener('click', closePlayerNameModal);
  document.getElementById('player-name-save-btn').addEventListener('click', async () => {
    const val = document.getElementById('player-name-input').value.trim();
    if(!val || !currentUser) return;
    currentPlayer = {
      uid: currentUser.uid,
      playerName: val,
      googleName: currentUser.displayName || '',
      photoURL: currentUser.photoURL || ''
    };
    await savePlayerProfile(currentPlayer);
    renderAccountPanel();
    closePlayerNameModal();
  });

  if(auth){
    auth.onAuthStateChanged(async (user) => {
      currentUser = user;
      if(user){
        const existing = await loadPlayerProfile(user.uid);
        if(existing && existing.playerName){
          currentPlayer = existing;
          renderAccountPanel();
        } else {
          // primeiro login: usa o nome do Google como rascunho enquanto o
          // jogador não confirma/edita o nome que quer usar no mapa
          currentPlayer = {
            uid: user.uid,
            playerName: user.displayName || 'Jogador',
            googleName: user.displayName || '',
            photoURL: user.photoURL || ''
          };
          renderAccountPanel();
          await savePlayerProfile(currentPlayer);
          openPlayerNameModal(user.displayName || '');
        }
      } else {
        currentPlayer = null;
        renderAccountPanel();
      }
    });
  }

  const hasCloudStorage = (typeof window !== 'undefined') &&
    !!window.storage && typeof window.storage.get === 'function' && typeof window.storage.set === 'function';

  function loadLocal(key){
    try{
      const raw = localStorage.getItem(localKey(key));
      return raw ? JSON.parse(raw) : [];
    }catch(e){ return []; }
  }
  function saveLocal(key, data){
    try{
      localStorage.setItem(localKey(key), JSON.stringify(data));
      return true;
    }catch(e){ console.error('Erro ao salvar localmente', key, e); return false; }
  }

  async function loadKey(key){
    // Usado só quando o Firebase não está disponível — quando está, o carregamento
    // inicial e as atualizações chegam pelo listener em tempo real (initRealtimeSync).
    if(hasCloudStorage){
      try{
        const r = await window.storage.get(localKey(key).replace(/[\/\\'" ]/g, '_'), true);
        if(r) return JSON.parse(r.value);
      }catch(e){ /* cai pro localStorage abaixo */ }
    }
    return loadLocal(key);
  }
  async function saveKey(key, data){
    // sempre grava local também, assim funciona igual quando o arquivo é aberto
    // direto no navegador (offline) e recarregado depois
    saveLocal(key, data);
    if(firebaseReady){
      try{
        await firebaseDb.ref('tau-volantis/' + scopedKey(key)).set(data);
        return;
      }catch(e){ console.error('Falha ao salvar no Firebase', key, e); }
    }
    if(hasCloudStorage){
      try{
        const r = await window.storage.set(localKey(key).replace(/[\/\\'" ]/g, '_'), JSON.stringify(data), true);
        if(!r) console.error('Falha ao salvar na nuvem, usando apenas local', key);
      }catch(e){ console.error('Falha ao salvar na nuvem, usando apenas local', key, e); }
    }
  }

  // ---------- map setup ----------
  const map = L.map('map', { zoomControl:true, attributionControl:false }).setView(SP_CENTER, 12);
  const mapEl = document.getElementById('map');
  mapEl.classList.add('dark-streets');

  const streetsLayer = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors',
    maxZoom: 19
  }).addTo(map);

  const topoLayer = L.tileLayer('https://tile.opentopomap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenTopoMap (CC-BY-SA)',
    maxZoom: 17
  });

  // Satélite: imagens aéreas/satélite da Esri (gratuito, sem chave de API),
  // com uma camada extra só de rótulos (nomes de ruas/cidades) por cima,
  // já que a imagem de satélite sozinha não tem nenhum texto.
  const satLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    attribution: '&copy; Esri &mdash; Source: Esri, Maxar, Earthstar Geographics',
    maxZoom: 19
  });
  const satLabelsLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}', {
    attribution: '&copy; Esri',
    maxZoom: 19
  });

  const pinsLayer = L.layerGroup().addTo(map);
  const tokensLayer = L.layerGroup().addTo(map);
  const shapesLayer = L.layerGroup().addTo(map);
  const routesLayer = L.layerGroup().addTo(map);

  // ---------- sincronização "ao vivo" tipo mesa física ----------
  // Os pins agora são sincronizados por diff: cada atualização remota só
  // toca os marcadores que realmente mudaram (posição/ícone), sem nunca
  // destruir e reconstruir a camada inteira. Isso significa que enquanto
  // um jogador está com o popup de um pin aberto digitando uma nota, os
  // OUTROS pins continuam se movendo/atualizando normalmente na tela dela
  // — só aquele pin específico fica "protegido" até ela fechar o popup.
  let pinMarkers = {};      // id do pin -> marker
  let pinDraggingId = null; // id do pin sendo arrastado localmente agora
  let editingPinId = null;  // id do pin com popup de edição aberto localmente

  // Tokens/áreas/rotas ainda usam a trava por camada inteira (mais simples,
  // e edições nesses são bem mais raras que mover peças no tabuleiro).
  let tokenPopupActive = false;
  let shapePopupActive = false;
  let routePopupActive = false;
  map.on('popupopen', (e) => {
    const src = e.popup && e.popup._source;
    if(!src) return;
    if(src._pinId !== undefined) editingPinId = src._pinId;
    if(tokensLayer.hasLayer(src)) tokenPopupActive = true;
    if(shapesLayer.hasLayer(src)) shapePopupActive = true;
    if(routesLayer.hasLayer(src)) routePopupActive = true;
  });
  map.on('popupclose', (e) => {
    const src = e.popup && e.popup._source;
    if(!src) return;
    // ao fechar, libera a trava e recupera qualquer atualização remota que
    // tenha chegado enquanto o popup estava aberto
    if(src._pinId !== undefined && src._pinId === editingPinId){ editingPinId = null; renderPins(); }
    if(tokensLayer.hasLayer(src)){ tokenPopupActive = false; renderTokens(); }
    if(shapesLayer.hasLayer(src)){ shapePopupActive = false; renderShapes(); }
    if(routesLayer.hasLayer(src)){ routePopupActive = false; renderRoutes(); }
  });

  document.getElementById('layer-streets').addEventListener('click', () => setLayer('streets'));
  document.getElementById('layer-topo').addEventListener('click', () => setLayer('topo'));
  document.getElementById('layer-sat').addEventListener('click', () => setLayer('sat'));

  // ---------- painel de camadas: colapsar/expandir, com estado lembrado ----------
  const HUD_LAYER_COLLAPSED_KEY = 'tv-map:hud-layer-collapsed';
  const hudLayerPanel = document.getElementById('hud-layer');
  const hudLayerToggleBtn = document.getElementById('hud-layer-toggle');
  function setHudLayerCollapsed(collapsed){
    hudLayerPanel.classList.toggle('collapsed', collapsed);
    hudLayerToggleBtn.setAttribute('aria-expanded', String(!collapsed));
    try{ localStorage.setItem(HUD_LAYER_COLLAPSED_KEY, collapsed ? '1' : '0'); }catch(e){}
  }
  hudLayerToggleBtn.addEventListener('click', () => {
    setHudLayerCollapsed(!hudLayerPanel.classList.contains('collapsed'));
  });
  try{ setHudLayerCollapsed(localStorage.getItem(HUD_LAYER_COLLAPSED_KEY) === '1'); }catch(e){}

  const ALL_BASE_LAYERS = [streetsLayer, topoLayer, satLayer, satLabelsLayer];
  function activeLayerBtnId(){
    if(map.hasLayer(topoLayer)) return 'layer-topo';
    if(map.hasLayer(satLayer)) return 'layer-sat';
    return 'layer-streets';
  }

  function setLayer(which){
    document.querySelectorAll('#layer-streets, #layer-topo, #layer-sat').forEach(b => b.classList.remove('active'));
    ALL_BASE_LAYERS.forEach(l => { if(map.hasLayer(l)) map.removeLayer(l); });
    mapEl.classList.remove('dark-streets');
    if(which === 'streets'){
      streetsLayer.addTo(map);
      mapEl.classList.add('dark-streets');
      document.getElementById('layer-streets').classList.add('active');
      document.getElementById('stat-layer').textContent = 'Ruas';
    } else if(which === 'sat'){
      satLayer.addTo(map);
      satLabelsLayer.addTo(map);
      document.getElementById('layer-sat').classList.add('active');
      document.getElementById('stat-layer').textContent = 'Satélite';
    } else {
      topoLayer.addTo(map);
      document.getElementById('layer-topo').classList.add('active');
      document.getElementById('stat-layer').textContent = 'Relevo';
    }
  }

  // ---------- pin toolbar: only the "named" types get a button; the rest of
  // PIN_TYPES are icon options only, offered in the icon picker (see below) so
  // players can reskin any pin without the toolbar being flooded with buttons ----------
  const TOOLBAR_PIN_IDS = ['saque', 'perigo', 'abrigo', 'npc', 'veiculo', 'nota', 'pin'];

  function buildIconPickerHtml(currentType){
    return PIN_TYPES.map(pt => `
      <button type="button" class="icon-picker-btn ${pt.id===currentType?'active':''}" data-type="${pt.id}" style="--picker-color:${pt.color}" title="${pt.label}">
        <svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${PIN_ICONS[pt.id] || PIN_ICONS.nota}</svg>
      </button>`).join('');
  }

  const pinButtonsWrap = document.getElementById('pin-buttons');
  PIN_TYPES.filter(pt => TOOLBAR_PIN_IDS.includes(pt.id)).forEach(pt => {
    const btn = document.createElement('button');
    btn.className = 'tool-btn';
    btn.dataset.pinType = pt.id;
    btn.innerHTML = `<span class="dot" style="background:${pt.color}"></span>${pt.label}`;
    btn.addEventListener('click', () => {
      const isActive = btn.classList.contains('active');
      clearModes();
      if(!isActive){
        selectedPinType = pt.id;
        btn.classList.add('active');
      }
    });
    pinButtonsWrap.appendChild(btn);
  });

  const tokenBtn = document.getElementById('tool-token');
  tokenBtn.addEventListener('click', () => {
    const isActive = tokenBtn.classList.contains('active');
    clearModes();
    if(!isActive){
      tokenModeOn = true;
      tokenBtn.classList.add('active');
    }
  });

  function clearModes(){
    selectedPinType = null;
    tokenModeOn = false;
    stopCircleMode();
    stopRouteMode();
    document.querySelectorAll('.tool-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(activeLayerBtnId()).classList.add('active');
    hideDrawHint();
  }

  // ---------- view settings: toolbar position + compact (mobile) mode ----------
  const VIEW_PREFS_KEY = 'tv-map:view-prefs';
  function loadViewPrefs(){
    try{
      const raw = localStorage.getItem(VIEW_PREFS_KEY);
      return raw ? JSON.parse(raw) : { position:'bottom', compact:false };
    }catch(e){ return { position:'bottom', compact:false }; }
  }
  function saveViewPrefs(prefs){
    try{ localStorage.setItem(VIEW_PREFS_KEY, JSON.stringify(prefs)); }catch(e){}
  }
  let viewPrefs = loadViewPrefs();

  // Keeps the side toolbar from ever overlapping the layer/visual panel above it:
  // instead of a hardcoded "top" offset, measure the real bottom edge of
  // #hud-layer (which changes size depending on content/compact mode/screen
  // width) and push the side toolbar below it, with a small gap.
  function syncToolbarSideOffset(){
    const layer = document.getElementById('hud-layer');
    if(!layer) return;
    const gap = 16; // px, ~1rem
    const bottom = layer.getBoundingClientRect().bottom;
    document.documentElement.style.setProperty('--toolbar-side-top', `${Math.round(bottom + gap)}px`);
  }

  function applyViewPrefs(){
    document.body.classList.toggle('toolbar-side', viewPrefs.position === 'side');
    document.body.classList.toggle('compact-mode', !!viewPrefs.compact);
    document.querySelectorAll('.vs-btn[data-pos]').forEach(b => b.classList.toggle('active', b.dataset.pos === viewPrefs.position));
    document.querySelectorAll('.vs-btn[data-mode]').forEach(b => b.classList.toggle('active', b.dataset.mode === (viewPrefs.compact ? 'compact' : 'normal')));
    // compact-mode / position changes affect the layer panel's height, so
    // recompute the offset after the browser applies the new classes.
    requestAnimationFrame(syncToolbarSideOffset);
  }
  applyViewPrefs();
  syncToolbarSideOffset();
  window.addEventListener('resize', syncToolbarSideOffset);
  window.addEventListener('load', syncToolbarSideOffset);
  if('ResizeObserver' in window){
    new ResizeObserver(syncToolbarSideOffset).observe(document.getElementById('hud-layer'));
  }

  const viewSettingsToggle = document.getElementById('view-settings-toggle');
  const viewSettingsPopover = document.getElementById('view-settings-popover');
  const viewSettingsBackdrop = document.getElementById('view-settings-backdrop');
  function openViewSettings(){
    viewSettingsPopover.classList.add('open');
    viewSettingsBackdrop.classList.add('open');
  }
  function closeViewSettings(){
    viewSettingsPopover.classList.remove('open');
    viewSettingsBackdrop.classList.remove('open');
  }
  viewSettingsToggle.addEventListener('click', (ev) => {
    ev.stopPropagation();
    viewSettingsPopover.classList.contains('open') ? closeViewSettings() : openViewSettings();
  });
  viewSettingsBackdrop.addEventListener('click', closeViewSettings);
  document.addEventListener('click', (e) => {
    if(viewSettingsPopover.classList.contains('open') && !viewSettingsPopover.contains(e.target) && e.target !== viewSettingsToggle){
      closeViewSettings();
    }
  });
  viewSettingsPopover.querySelectorAll('.vs-btn[data-pos]').forEach(b => {
    b.addEventListener('click', () => {
      viewPrefs.position = b.dataset.pos;
      saveViewPrefs(viewPrefs);
      applyViewPrefs();
    });
  });
  viewSettingsPopover.querySelectorAll('.vs-btn[data-mode]').forEach(b => {
    b.addEventListener('click', () => {
      viewPrefs.compact = b.dataset.mode === 'compact';
      saveViewPrefs(viewPrefs);
      applyViewPrefs();
    });
  });

  // ---------- redesign: popovers sob demanda (menu, busca, conta, ações) ----------
  // Registra um par botão-gatilho + popover + backdrop, seguindo o mesmo
  // padrão já usado pelo view-settings-popover. Fechar um popover destes
  // fecha só ele mesmo (não mexe nos outros), e clicar fora ou no backdrop
  // também fecha.
  function registerAppPopover(triggerId, popoverId, backdropId){
    const trigger = document.getElementById(triggerId);
    const popover = document.getElementById(popoverId);
    const backdrop = document.getElementById(backdropId);
    if(!trigger || !popover || !backdrop) return null;
    function open(){
      popover.classList.add('open');
      backdrop.classList.add('open');
      trigger.classList.add('active');
      trigger.setAttribute('aria-expanded', 'true');
    }
    function close(){
      popover.classList.remove('open');
      backdrop.classList.remove('open');
      trigger.classList.remove('active');
      trigger.setAttribute('aria-expanded', 'false');
    }
    trigger.addEventListener('click', (ev) => {
      ev.stopPropagation();
      popover.classList.contains('open') ? close() : open();
    });
    backdrop.addEventListener('click', close);
    return { open, close, popover, trigger };
  }

  const appPopovers = [
    registerAppPopover('menu-toggle-btn', 'menu-popover', 'menu-backdrop'),
    registerAppPopover('search-toggle-btn', 'hud-search', 'search-backdrop'),
    registerAppPopover('account-toggle-btn', 'account-popover', 'account-backdrop'),
    registerAppPopover('fab-add', 'add-popover', 'add-backdrop'),
    registerAppPopover('fab-tools', 'tools-popover', 'tools-backdrop'),
    registerAppPopover('fab-system', 'system-popover', 'system-backdrop'),
  ].filter(Boolean);

  // abrir um fecha os outros, pra nunca empilhar dois de uma vez na tela
  appPopovers.forEach(p => {
    p.trigger.addEventListener('click', () => {
      appPopovers.forEach(other => { if(other !== p) other.close(); });
    });
  });

  // foca o campo de busca assim que o popover de busca abre
  const searchPopoverEntry = appPopovers.find(p => p.popover.id === 'hud-search');
  if(searchPopoverEntry){
    document.getElementById('search-toggle-btn').addEventListener('click', () => {
      if(searchPopoverEntry.popover.classList.contains('open')){
        setTimeout(() => document.getElementById('search-input').focus(), 50);
      }
    });
  }

  // ações (adicionar/ferramentas) fecham o próprio painel assim que uma
  // ferramenta é escolhida — igual um bottom sheet: escolheu, some.
  ['add-popover', 'tools-popover'].forEach(id => {
    const entry = appPopovers.find(p => p.popover.id === id);
    if(!entry) return;
    entry.popover.querySelectorAll('.tool-btn').forEach(btn => {
      btn.addEventListener('click', () => setTimeout(entry.close, 120));
    });
  });

  // mantém o avatar do header sincronizado com o estado de login (o próprio
  // renderAccountPanel, definido mais abaixo, também chama isto)
  function syncHeaderAvatar(){
    const badge = document.getElementById('header-avatar-badge');
    if(!badge) return;
    if(currentUser && currentPlayer){
      if(currentPlayer.photoURL){
        badge.style.backgroundImage = `url('${currentPlayer.photoURL}')`;
        badge.innerHTML = '';
      } else {
        badge.style.backgroundImage = 'none';
        badge.innerHTML = '';
        badge.textContent = (currentPlayer.playerName || '?').trim().slice(0,1).toUpperCase();
      }
    } else {
      badge.style.backgroundImage = 'none';
      badge.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>';
    }
  }

  // ---------- pin icon factory ----------
  function pinIcon(pin){
    const typeId = pin.type;
    const svgPath = PIN_ICONS[typeId] || PIN_ICONS.nota;
    const defaultColor = (PIN_TYPES.find(t => t.id === typeId) || {}).color || 'var(--ice-100)';
    const color = (typeId === 'npc' && pin.color) ? pin.color : defaultColor;
    const ping = PING_TYPES.includes(typeId) ? `<div class="pin-ping" style="border-color:${color}"></div>` : '';
    const lockCls = pin.locked ? ' locked' : '';
    // NPCs podem ter foto/GIF em vez do ícone padrão — vira um quadradinho de avatar
    const hasPhoto = typeId === 'npc' && !!pin.image;
    const badgeInner = hasPhoto
      ? `<img src="${pin.image}" alt="">`
      : `<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${svgPath}</svg>`;
    const badgeStyle = hasPhoto
      ? `background:var(--bg-2); border-color:${escapeHtml(color)}`
      : `background:${color}; border-color:var(--bg-0)`;
    // NPC, veículo e abrigo ficam do mesmo "tamanho" visual que o token de
    // jogador (44px) — isso é o que os deixa com peso equivalente no mapa,
    // já que os três também podem "conter"/agrupar gente dentro deles
    const isNpc = typeId === 'npc';
    const isContainer = typeId === 'veiculo' || typeId === 'abrigo';
    const isBig = isNpc || isContainer;
    const sizeCls = isNpc ? ' pin-wrap-npc' : (isContainer ? ` pin-wrap-${typeId}` : '');
    // veículo/abrigo mostram quantos tokens e NPCs estão "dentro" deles
    const occupantCount = isContainer
      ? (typeof tokens !== 'undefined' ? tokens.filter(t => t.containerId === pin.id).length : 0)
        + (typeof pins !== 'undefined' ? pins.filter(p => p.type === 'npc' && p.containerId === pin.id).length : 0)
      : 0;
    const occupancyBadge = occupantCount > 0 ? `<div class="pin-occupancy">${occupantCount}</div>` : '';
    // NPC ganha etiqueta de nome abaixo do badge, seguindo a mesma regra dos
    // tokens: só a primeira palavra do nome, pra não tampar o mapa
    const npcNameTag = isNpc ? `<span class="pin-name-tag">${escapeHtml((pin.title || 'NPC').trim().split(/\s+/)[0])}</span>` : '';
    return L.divIcon({
      className: '',
      html: `<div class="pin-wrap${lockCls}${sizeCls}">${ping}${occupancyBadge}<div class="pin-badge${hasPhoto ? ' pin-badge-photo' : ''}" style="${badgeStyle}">${badgeInner}</div>${npcNameTag}</div>`,
      iconSize: isBig ? [44,44] : [30,30],
      iconAnchor: isBig ? [22,38] : [15,26],
      popupAnchor: isBig ? [0,-35] : [0,-24]
    });
  }
  // ícone de um "empilhamento" liderado por um NPC (sem jogador na pilha) —
  // reaproveita o badge redondo do NPC, só troca o ícone padrão pelo emblema
  // de contagem quando há mais de um integrante no mesmo ponto
  function npcGroupIcon(pin, stackCount){
    const defaultColor = (PIN_TYPES.find(t => t.id === 'npc') || {}).color || 'var(--ice-300)';
    const color = pin.color || defaultColor;
    const hasPhoto = !!pin.image;
    const badgeInner = hasPhoto
      ? `<img src="${pin.image}" alt="">`
      : `<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${PIN_ICONS.npc}</svg>`;
    const badgeStyle = hasPhoto
      ? `background:var(--bg-2); border-color:${escapeHtml(color)}`
      : `background:${color}; border-color:var(--bg-0)`;
    const stackBadge = stackCount && stackCount > 1 ? `<div class="pin-occupancy" style="background:var(--hazard)">${stackCount}</div>` : '';
    // mesma regra de nome dos tokens: primeira palavra do nome, com "+N" quando
    // o NPC lidera um empilhamento
    const npcShortName = escapeHtml((pin.title || 'NPC').trim().split(/\s+/)[0]);
    const npcNameTag = `<span class="pin-name-tag">${stackCount && stackCount > 1 ? `${npcShortName} +${stackCount - 1}` : npcShortName}</span>`;
    return L.divIcon({
      className: '',
      html: `<div class="pin-wrap pin-wrap-npc">${stackBadge}<div class="pin-badge${hasPhoto ? ' pin-badge-photo' : ''}" style="${badgeStyle}">${badgeInner}</div>${npcNameTag}</div>`,
      iconSize: [44,44],
      iconAnchor: [22,38],
      popupAnchor: [0,-35]
    });
  }
  function tokenIcon(token, stackCount){
    const borderColor = token.color || '#8fd7e8';
    const isSelected = (typeof selectedTokenIds !== 'undefined') && selectedTokenIds.has(token.id);
    let inner;
    if(token.image){
      inner = `<img src="${token.image}" alt="">`;
    } else {
      inner = `<span>${escapeHtml((token.label || 'TK').slice(0,2).toUpperCase())}</span>`;
    }
    const name = (token.label || 'Token').trim();
    // mostra só a primeira palavra do nome (evita etiqueta gigante tampando o mapa)
    const shortName = escapeHtml(name.split(/\s+/)[0]);
    const isStack = stackCount && stackCount > 1;
    const stackAttrs = isStack ? ` data-count="${stackCount}"` : '';
    const nameLabel = isStack ? `${shortName} +${stackCount - 1}` : shortName;
    return L.divIcon({
      className: '',
      html: `<div class="token-wrap">
               <div class="token-icon${isSelected ? ' selected' : ''}${isStack ? ' is-stack' : ''}"${stackAttrs} style="border-color:${escapeHtml(borderColor)}; color:${escapeHtml(borderColor)}">${inner}</div>
               <span class="token-name-tag">${nameLabel}</span>
             </div>`,
      iconSize: [44,64],
      iconAnchor: [22,22]
    });
  }

  // ---------- pin popup (create/edit) ----------
  function buildPinPopupContent(pin){
    const container = document.createElement('div');
    const typeLabel = (PIN_TYPES.find(t => t.id === pin.type) || {label:pin.type}).label;
    const isNpc = pin.type === 'npc';
    const npcColor = pin.color || '#7fa6bf';
    // veículos e abrigos podem "conter" tokens dentro deles (jogadores e/ou NPCs),
    // como forma de agrupar quem está ali sem lotar o mapa de tokens soltos
    const isContainer = pin.type === 'veiculo' || pin.type === 'abrigo';
    const occupants = isContainer
      ? [...tokens.filter(t => t.containerId === pin.id), ...pins.filter(p => p.type === 'npc' && p.containerId === pin.id)]
      : [];
    container.innerHTML = `
      <div class="popup-kicker">${typeLabel}</div>
      ${pin.ownerName ? `<div class="popup-owner">Criado por: ${escapeHtml(pin.ownerName)}</div>` : ''}
      <input type="text" class="pin-title" placeholder="Título" value="${escapeHtml(pin.title || '')}">
      <textarea class="pin-note" rows="3" placeholder="Anotação...">${escapeHtml(pin.note || '')}</textarea>
      ${isContainer ? `
      <div class="group-popup-title">Ocupantes${occupants.length ? ' · ' + occupants.length : ''}</div>
      <div class="occupant-list-pin"></div>` : ''}
      ${isNpc ? `
      <div class="token-popup-row">
        <div class="token-preview-wrap">
          <div class="token-preview" style="border-color:${escapeHtml(npcColor)}">
            ${pin.image ? `<img src="${pin.image}" alt="">` : ''}
          </div>
        </div>
        <div class="token-popup-fields">
          <label class="token-field-label">Cor</label>
          <input type="color" class="pin-color-input" value="${npcColor}">
          <label class="token-field-label">Foto / GIF</label>
          <input type="file" accept="image/*" class="pin-image-input">
          ${pin.image ? '<button type="button" class="pin-image-clear">Remover imagem</button>' : ''}
        </div>
      </div>` : ''}
      ${isNpc ? `<button type="button" class="inv-open-btn">🎒 Inventário (${capTxt(pin.id)})</button>` : ''}
      <div class="icon-picker-label">Alterar ícone</div>
      <div class="icon-picker icon-picker-inline">${buildIconPickerHtml(pin.type)}</div>
      <div class="popup-actions">
        <button class="save">Salvar</button>
        <button class="lock">${pin.locked ? '🔓 Destravar' : '🔒 Travar'}</button>
        <button class="del">Excluir</button>
      </div>
    `;
    if(isContainer){
      const list = container.querySelector('.occupant-list-pin');
      if(occupants.length === 0){
        list.innerHTML = '<div class="occupant-empty">Vazio — arraste um token pra cima deste pin no mapa pra colocar alguém aqui.</div>';
      } else {
        occupants.forEach(t => {
          const row = document.createElement('div');
          row.className = 'occupant-row';
          row.innerHTML = `<span class="occupant-name">${escapeHtml(t.label || 'Token')}</span>
            <button type="button" class="release">Retirar</button>`;
          row.querySelector('.release').addEventListener('click', async () => {
            const isPinOccupant = t.type === 'npc';
            t.containerId = null;
            // solta o token/NPC de volta no mapa perto do pin, com um pequeno espalhamento
            const jitter = () => (Math.random() - 0.5) * 0.00025;
            t.lat = pin.lat + jitter();
            t.lng = pin.lng + jitter();
            if(isPinOccupant) await saveKey(KEY_PINS, pins);
            else await saveKey(KEY_TOKENS, tokens);
            renderTokens();
            renderPins();
            openPinPopupById(pin.id);
          });
          list.appendChild(row);
        });
      }
    }
    let pendingPinImage = pin.image || null;
    if(isNpc){
      const preview = container.querySelector('.token-preview');
      const imgInput = container.querySelector('.pin-image-input');
      imgInput.addEventListener('change', async () => {
        const file = imgInput.files && imgInput.files[0];
        if(!file) return;
        try{
          pendingPinImage = await resizeImageDataUrl(file, 160);
          preview.innerHTML = `<img src="${pendingPinImage}" alt="">`;
        }catch(e){
          console.error('Falha ao processar imagem do NPC', e);
          alert(e && e.message ? e.message : 'Não foi possível usar essa imagem.');
          imgInput.value = '';
        }
      });
      const clearBtn = container.querySelector('.pin-image-clear');
      if(clearBtn){
        clearBtn.addEventListener('click', () => {
          pendingPinImage = null;
          imgInput.value = '';
          preview.innerHTML = '';
        });
      }
      const colorInput = container.querySelector('.pin-color-input');
      colorInput.addEventListener('input', () => {
        preview.style.borderColor = colorInput.value;
      });
    }
    const pinInvBtn = container.querySelector('.inv-open-btn');
    if(pinInvBtn) pinInvBtn.addEventListener('click', () => { map.closePopup(); openInventory(pin.id); });
    container.querySelector('.lock').addEventListener('click', async () => {
      pin.locked = !pin.locked;
      await saveKey(KEY_PINS, pins);
      // atualiza o marcador direto: renderPins() por diff não mexe no pin
      // com popup aberto localmente (é o próprio, por isso fazemos aqui)
      const marker = pinMarkers[pin.id];
      if(marker){
        marker.setIcon(pinIcon(pin));
        if(marker.dragging){ if(pin.locked) marker.dragging.disable(); else marker.dragging.enable(); }
      }
      renderPins();
      openPinPopupById(pin.id);
    });
    container.querySelectorAll('.icon-picker-btn').forEach(b => {
      b.addEventListener('click', async () => {
        const newType = b.dataset.type;
        if(newType === pin.type) return;
        // preserve whatever the person already typed before swapping the icon
        const titleVal = container.querySelector('.pin-title').value.trim();
        const noteVal = container.querySelector('.pin-note').value.trim();
        if(titleVal) pin.title = titleVal;
        pin.note = noteVal;
        pin.type = newType;
        await saveKey(KEY_PINS, pins);
        const marker = pinMarkers[pin.id];
        if(marker) marker.setIcon(pinIcon(pin));
        renderPins();
        openPinPopupById(pin.id);
      });
    });
    container.querySelector('.save').addEventListener('click', () => {
      pin.title = container.querySelector('.pin-title').value.trim() || typeLabel;
      pin.note = container.querySelector('.pin-note').value.trim();
      if(isNpc){
        pin.color = container.querySelector('.pin-color-input').value;
        pin.image = pendingPinImage;
      }
      renderPins();
      map.closePopup();
      saveKey(KEY_PINS, pins); // salva em segundo plano — a UI já reagiu na hora
    });
    container.querySelector('.del').addEventListener('click', () => {
      if(isNpc && invCount(pin.id) > 0 &&
         !window.confirm(`Este NPC tem ${invCount(pin.id)} item(ns) no inventário. Excluir apaga o inventário (a perda fica no registro). Continuar?`)) return;
      if(isNpc) removeHolderInventory(pin.id, 'NPC excluído');
      // libera quem estava "dentro" desse veículo/abrigo antes de excluir o pin
      let releasedTokens = false;
      tokens.forEach(t => {
        if(t.containerId === pin.id){ t.containerId = null; t.lat = pin.lat; t.lng = pin.lng; releasedTokens = true; }
      });
      pins.forEach(p => {
        if(p.id !== pin.id && p.type === 'npc' && p.containerId === pin.id){ p.containerId = null; p.lat = pin.lat; p.lng = pin.lng; }
      });
      pins = pins.filter(p => p.id !== pin.id);
      renderPins();
      renderTokens();
      map.closePopup();
      // salva em segundo plano: a exclusão já aconteceu na tela, não precisa
      // esperar a rede pra sumir o pin (isso que causava a sensação de lag)
      saveKey(KEY_PINS, pins);
      if(releasedTokens) saveKey(KEY_TOKENS, tokens);
    });
    return container;
  }

  // resizes/comprime a imagem enviada pra um thumbnail pequeno antes de guardar
  // (evita inflar o armazenamento com fotos em resolução cheia).
  // GIFs são um caso especial: passar por <canvas> "mata" a animação (fica só o 1º frame),
  // então pra GIF a gente mantém o arquivo original (até um limite de tamanho) sem redesenhar.
  function resizeImageDataUrl(file, maxSize){
    return new Promise((resolve, reject) => {
      const isGif = file.type === 'image/gif' || /\.gif$/i.test(file.name || '');
      if(isGif){
        const maxGifBytes = 2 * 1024 * 1024; // 2MB — GIF animado não passa por compressão
        if(file.size > maxGifBytes){
          reject(new Error('GIF muito grande (máx. 2MB) — reduza o arquivo antes de enviar.'));
          return;
        }
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result); // guarda o GIF original, animação preservada
        reader.onerror = reject;
        reader.readAsDataURL(file);
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.onload = () => {
          let { width, height } = img;
          const scale = Math.min(1, maxSize / Math.max(width, height));
          width = Math.max(1, Math.round(width * scale));
          height = Math.max(1, Math.round(height * scale));
          const canvas = document.createElement('canvas');
          canvas.width = width; canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          try{ resolve(canvas.toDataURL('image/webp', 0.82)); }
          catch(e){ resolve(canvas.toDataURL('image/png')); }
        };
        img.onerror = reject;
        img.src = reader.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  function buildTokenPopupContent(token){
    const container = document.createElement('div');
    const currentColor = token.color || '#8fd7e8';
    const initials = escapeHtml((token.label || 'TK').slice(0,2).toUpperCase());

    container.innerHTML = `
      <div class="popup-kicker">Token</div>
      ${token.ownerName ? `<div class="popup-owner">Criado por: ${escapeHtml(token.ownerName)}</div>` : ''}
      <input type="text" class="token-label" placeholder="Nome" value="${escapeHtml(token.label || '')}">
      <div class="token-popup-row">
        <div class="token-preview-wrap">
          <div class="token-preview" style="border-color:${escapeHtml(currentColor)}">
            ${token.image ? `<img src="${token.image}" alt="">` : `<span>${initials}</span>`}
          </div>
        </div>
        <div class="token-popup-fields">
          <label class="token-field-label">Cor da borda</label>
          <input type="color" class="token-color-input" value="${currentColor}">
          <label class="token-field-label">Imagem</label>
          <input type="file" accept="image/*" class="token-image-input">
          ${token.image ? '<button type="button" class="token-image-clear">Remover imagem</button>' : ''}
        </div>
      </div>
      <button type="button" class="inv-open-btn">🎒 Inventário (${capTxt(token.id)})</button>
      <button type="button" class="inv-open-btn ficha-open-btn">📇 Ficha e dados</button>
      <div class="popup-actions">
        <button class="save">Salvar</button>
        <button class="del">Remover</button>
      </div>
    `;
    container.querySelector('.inv-open-btn').addEventListener('click', () => { map.closePopup(); openInventory(token.id); });
    container.querySelector('.ficha-open-btn').addEventListener('click', () => { map.closePopup(); hub.charToken = token.id; rollUI.who = token.id; openHub('ficha'); });
    const preview = container.querySelector('.token-preview');
    const colorInput = container.querySelector('.token-color-input');
    colorInput.addEventListener('input', () => { preview.style.borderColor = colorInput.value; });

    let pendingImage = token.image || null;
    const fileInput = container.querySelector('.token-image-input');
    fileInput.addEventListener('change', async () => {
      const file = fileInput.files && fileInput.files[0];
      if(!file) return;
      try{
        pendingImage = await resizeImageDataUrl(file, 160);
        preview.innerHTML = `<img src="${pendingImage}" alt="">`;
      }catch(e){
        console.error('Falha ao processar imagem do token', e);
        alert(e && e.message ? e.message : 'Não foi possível usar essa imagem.');
        fileInput.value = '';
      }
    });
    const clearBtn = container.querySelector('.token-image-clear');
    if(clearBtn){
      clearBtn.addEventListener('click', () => {
        pendingImage = null;
        fileInput.value = '';
        preview.innerHTML = `<span>${initials}</span>`;
      });
    }

    container.querySelector('.save').addEventListener('click', () => {
      token.label = container.querySelector('.token-label').value.trim() || 'Token';
      token.color = colorInput.value;
      token.image = pendingImage;
      renderTokens();
      map.closePopup();
      saveKey(KEY_TOKENS, tokens);
    });
    container.querySelector('.del').addEventListener('click', () => {
      if(invCount(token.id) > 0 &&
         !window.confirm(`Este token tem ${invCount(token.id)} item(ns) no inventário. Remover apaga o inventário (a perda fica no registro). Continuar?`)) return;
      removeHolderInventory(token.id, 'token removido');
      tokens = tokens.filter(t => t.id !== token.id);
      renderTokens();
      map.closePopup();
      saveKey(KEY_TOKENS, tokens);
    });
    return container;
  }

  function buildShapePopupContent(shape){
    const container = document.createElement('div');
    container.innerHTML = `
      <div class="popup-kicker">Área</div>
      ${shape.ownerName ? `<div class="popup-owner">Criado por: ${escapeHtml(shape.ownerName)}</div>` : ''}
      <input type="text" class="shape-title" placeholder="Nome da área" value="${escapeHtml(shape.label || '')}">
      <textarea class="shape-note" rows="3" placeholder="Anotação...">${escapeHtml(shape.note || '')}</textarea>
      <div class="popup-actions">
        <button class="save">Salvar</button>
        <button class="del">Excluir</button>
      </div>
    `;
    container.querySelector('.save').addEventListener('click', () => {
      shape.label = container.querySelector('.shape-title').value.trim() || 'Área sem nome';
      shape.note = container.querySelector('.shape-note').value.trim();
      renderShapes();
      saveKey(KEY_SHAPES, shapes);
    });
    container.querySelector('.del').addEventListener('click', () => {
      shapes = shapes.filter(s => s.id !== shape.id);
      renderShapes();
      map.closePopup();
      saveKey(KEY_SHAPES, shapes);
    });
    return container;
  }

  function buildRoutePopupContent(route){
    const container = document.createElement('div');
    const dist = route.distance != null ? route.distance : totalDistanceOf(route.points.map(p => L.latLng(p)));
    const timesHtml = SPEED_PROFILES.map(sp => `
      <div class="route-time-row"><span>${sp.label}</span><span>${formatDuration(estimateHours(dist, sp.kmh))}</span></div>
    `).join('');
    container.innerHTML = `
      <div class="popup-kicker">Rota · ${formatDistance(dist)}</div>
      ${route.ownerName ? `<div class="popup-owner">Criado por: ${escapeHtml(route.ownerName)}</div>` : ''}
      <input type="text" class="route-title" placeholder="Nome da rota" value="${escapeHtml(route.label || '')}">
      <textarea class="route-note" rows="3" placeholder="Anotação...">${escapeHtml(route.note || '')}</textarea>
      <div class="route-times">
        <div class="route-times-label">Tempo estimado (linha reta)</div>
        ${timesHtml}
      </div>
      <div class="popup-actions">
        <button class="save">Salvar</button>
        <button class="del">Excluir</button>
      </div>
    `;
    container.querySelector('.save').addEventListener('click', () => {
      route.label = container.querySelector('.route-title').value.trim() || 'Rota sem nome';
      route.note = container.querySelector('.route-note').value.trim();
      renderRoutes();
      saveKey(KEY_ROUTES, routes);
    });
    container.querySelector('.del').addEventListener('click', () => {
      routes = routes.filter(r => r.id !== route.id);
      renderRoutes();
      map.closePopup();
      saveKey(KEY_ROUTES, routes);
    });
    return container;
  }

  // ================= CLIMA GLOBAL (Timefall-like: estado compartilhado + overlay) =================
  // Estado único, visível pra todo mundo conectado (sincroniza como pins/tokens/etc).
  // Troca o overlay visual da tela inteira e narra a mudança no webhook do Discord,
  // igual já fazemos com os resultados de saque.
  function applyWeatherVisual(){
    const overlay = document.getElementById('weather-overlay');
    const badge = document.getElementById('weather-badge');
    const emojiEl = document.getElementById('weather-badge-emoji');
    const labelEl = document.getElementById('weather-badge-label');
    const cfg = WEATHER_STATES[weather.state] || WEATHER_STATES.calmo;
    overlay.className = 'state-' + weather.state;
    badge.className = 'weather-badge state-' + weather.state;
    emojiEl.textContent = cfg.emoji;
    labelEl.textContent = cfg.label;
    if(document.getElementById('weather-popover').classList.contains('open')) renderWeatherOptions();
  }

  function renderWeatherOptions(){
    const wrap = document.getElementById('weather-options');
    if(!wrap) return;
    wrap.innerHTML = Object.keys(WEATHER_STATES).map(key => {
      const cfg = WEATHER_STATES[key];
      const isCurrent = key === weather.state;
      return `
        <button type="button" class="weather-option-btn${isCurrent ? ' current' : ''}" data-state="${key}">
          <span class="weather-option-emoji">${cfg.emoji}</span>
          <span class="weather-option-text">
            <span class="weather-option-title">${escapeHtml(cfg.label)}${isCurrent ? ' (atual)' : ''}</span>
            <span class="weather-option-desc">${escapeHtml(cfg.desc)}</span>
          </span>
        </button>
      `;
    }).join('');
    wrap.querySelectorAll('.weather-option-btn').forEach(btn => {
      btn.addEventListener('click', () => setWeatherState(btn.dataset.state));
    });
    const metaEl = document.getElementById('weather-meta-line');
    if(metaEl) metaEl.textContent = weather.updatedBy ? `Definido por ${weather.updatedBy}` : '';
  }

  async function setWeatherState(newState){
    if(!WEATHER_STATES[newState] || newState === weather.state){ closeWeatherPopover(); return; }
    const prevState = weather.state;
    weather = { state: newState, updatedAt: Date.now(), updatedBy: currentPlayer ? currentPlayer.playerName : null };
    applyWeatherVisual();
    closeWeatherPopover();
    await saveKey(KEY_WEATHER, weather);
    sendWeatherNarrationToDiscord(prevState, newState);
  }

  async function sendWeatherNarrationToDiscord(prevState, newState){
    const url = (typeof webhookInput !== 'undefined' && webhookInput) ? webhookInput.value.trim() : '';
    if(!url) return;
    const cfg = WEATHER_STATES[newState];
    const payload = {
      username: "Tau Volantis — Registro de Saque",
      embeds: [{
        title: `${cfg.emoji} Clima: ${cfg.label}`,
        description: cfg.desc,
        color: newState === 'espectral' ? 0xc9433f : (newState === 'nevasca' ? 0x3f8fd1 : 0x7d909b),
        footer: { text: "Tau Volantis: Ano 0" },
        timestamp: new Date().toISOString()
      }]
    };
    try{ await fetch(url, { method: "POST", headers: {"Content-Type": "application/json"}, body: JSON.stringify(payload) }); }
    catch(e){ /* narração é só um extra — falha aqui não deve travar nada */ }
  }

  function openWeatherPopover(){
    renderWeatherOptions();
    document.getElementById('weather-backdrop').classList.add('open');
    document.getElementById('weather-popover').classList.add('open');
  }
  function closeWeatherPopover(){
    document.getElementById('weather-backdrop').classList.remove('open');
    document.getElementById('weather-popover').classList.remove('open');
  }
  document.getElementById('weather-badge').addEventListener('click', openWeatherPopover);
  document.getElementById('weather-backdrop').addEventListener('click', closeWeatherPopover);
  applyWeatherVisual();

  // ---------- render ----------
  // Renderiza por DIFF em vez de destruir e recriar tudo: cada pin já
  // visível ganha um marcador persistente (guardado em pinMarkers), que só
  // é atualizado (posição/ícone) quando o próprio dado daquele pin muda —
  // nunca quando outro pin qualquer muda. Isso é o que permite que o mapa
  // continue "vivo" pra todo mundo mesmo com alguém editando uma nota.
  function renderPins(){
    // NPCs (pins) que estão "dentro" de um veículo/abrigo, ou empilhados junto
    // com um token/outro NPC no mesmo ponto, não aparecem soltos no mapa —
    // eles já são representados pelo marcador do container ou da pilha.
    const npcGroupCounts = {};
    if(!tokenSelectMode){
      pins.forEach(p => { if(p.type === 'npc' && !p.containerId && p.groupId) npcGroupCounts[p.groupId] = (npcGroupCounts[p.groupId] || 0) + 1; });
      tokens.forEach(t => { if(!t.containerId && t.groupId) npcGroupCounts[t.groupId] = (npcGroupCounts[t.groupId] || 0) + 1; });
    }
    const visiblePins = pins.filter(p => {
      if(p.type !== 'npc') return true;
      if(p.containerId) return false;
      if(!tokenSelectMode && p.groupId && npcGroupCounts[p.groupId] >= 2) return false;
      return true;
    });
    const seen = new Set();
    visiblePins.forEach(pin => {
      seen.add(pin.id);
      let marker = pinMarkers[pin.id];
      if(!marker){
        marker = L.marker([pin.lat, pin.lng], { icon: pinIcon(pin), draggable: !pin.locked });
        marker._pinId = pin.id;
        marker.on('click', (e) => { L.DomEvent.stopPropagation(e); });
        marker.on('dragstart', () => { pinDraggingId = pin.id; });
        marker.on('dragend', async (e) => {
          pinDraggingId = null;
          const p = pins.find(pp => pp.id === pin.id);
          if(!p) return;
          const pos = e.target.getLatLng();
          p.lat = pos.lat; p.lng = pos.lng;
          if(p.type === 'npc') tryDockPinNpc(p, pos);
          await saveKey(KEY_PINS, pins);
          renderPins();
          renderTokens();
          if(typeof renderNavList === 'function') renderNavList();
        });
        // busca o pin atual na hora de abrir o popup (nunca o objeto "congelado"
        // no momento da criação do marker), pra sempre mostrar dado fresco
        marker.bindPopup(() => buildPinPopupContent(pins.find(pp => pp.id === pin.id) || pin));
        marker.addTo(pinsLayer);
        pinMarkers[pin.id] = marker;
      } else if(pin.id !== pinDraggingId && pin.id !== editingPinId){
        // protegido: enquanto está sendo arrastado ou com o popup de edição
        // aberto localmente, este marcador específico não é tocado
        const ll = marker.getLatLng();
        if(ll.lat !== pin.lat || ll.lng !== pin.lng) marker.setLatLng([pin.lat, pin.lng]);
        marker.setIcon(pinIcon(pin));
        if(marker.dragging){ if(pin.locked) marker.dragging.disable(); else marker.dragging.enable(); }
      }
    });
    // remove marcadores de pins que não existem mais / saíram de vista
    Object.keys(pinMarkers).forEach(id => {
      if(!seen.has(id)){
        pinsLayer.removeLayer(pinMarkers[id]);
        delete pinMarkers[id];
      }
    });
    document.getElementById('stat-pins').textContent = pins.length;
    if(typeof renderNavList === 'function') renderNavList();
  }
  function openPinPopupById(id){
    const marker = pinMarkers[id];
    if(marker && marker.openPopup) marker.openPopup();
  }

  // ---------- seleção múltipla de tokens (mover vários em grupo) ----------
  let tokenSelectMode = false;
  let selectedTokenIds = new Set();
  const tokenMarkers = {}; // id -> marker instance, usado pro arrasto em grupo

  function setTokenSelectMode(on){
    tokenSelectMode = on;
    if(!on) selectedTokenIds.clear();
    updateTokenSelectUI();
    renderTokens();
  }
  function toggleTokenSelection(id){
    if(selectedTokenIds.has(id)) selectedTokenIds.delete(id);
    else selectedTokenIds.add(id);
    updateTokenSelectUI();
    renderTokens();
  }
  function updateTokenSelectUI(){
    const btn = document.getElementById('token-select-toggle-btn');
    if(!btn) return;
    btn.classList.toggle('active', tokenSelectMode);
    const n = selectedTokenIds.size;
    btn.innerHTML = '<span class="dot" style="background:var(--frost)"></span>' +
      (tokenSelectMode ? ('Selecionando' + (n ? ' (' + n + ')' : '')) : 'Selecionar Tokens');
  }

  // ---------- agrupamento automático de tokens & mecânica de veículo/abrigo ----------
  // distância em pixels de tela: soltar um token dentro desse raio de outro token
  // (ou de um pin de veículo/abrigo) faz ele "encaixar" ali, formando uma pilha/grupo
  // ou entrando como ocupante do veículo/abrigo.
  const DOCK_THRESHOLD_PX = 28;
  function pxDistance(latlngA, latlngB){
    const a = map.latLngToContainerPoint(latlngA);
    const b = map.latLngToContainerPoint(latlngB);
    return Math.hypot(a.x - b.x, a.y - b.y);
  }
  // tenta "encaixar" um token recém-solto: dentro de um veículo/abrigo por perto vira
  // ocupante; em cima de outro token por perto forma/entra num grupo (pilha); solto
  // isolado, sai de qualquer grupo em que estivesse.
  function tryDockToken(token, latlng){
    const container = pins.find(p =>
      (p.type === 'veiculo' || p.type === 'abrigo') &&
      pxDistance(latlng, L.latLng(p.lat, p.lng)) < DOCK_THRESHOLD_PX
    );
    if(container){
      token.containerId = container.id;
      token.groupId = null;
      return;
    }
    // encaixa tanto em outro token quanto em um pin de NPC por perto — os dois
    // entram na mesma pilha/grupo, independente do tipo
    const nearToken = tokens.find(t =>
      t.id !== token.id && !t.containerId &&
      pxDistance(latlng, L.latLng(t.lat, t.lng)) < DOCK_THRESHOLD_PX
    );
    const nearNpc = !nearToken && pins.find(p =>
      p.type === 'npc' && !p.containerId &&
      pxDistance(latlng, L.latLng(p.lat, p.lng)) < DOCK_THRESHOLD_PX
    );
    const near = nearToken || nearNpc;
    if(near){
      const gid = near.groupId || newId();
      near.groupId = gid;
      token.groupId = gid;
      token.containerId = null;
      return;
    }
    token.groupId = null;
  }
  // mesma lógica de encaixe, só que pro lado de um pin de NPC sendo arrastado:
  // pode entrar num veículo/abrigo por perto, ou se juntar à pilha de um token
  // ou de outro NPC próximo
  function tryDockPinNpc(pin, latlng){
    const container = pins.find(p =>
      p.id !== pin.id &&
      (p.type === 'veiculo' || p.type === 'abrigo') &&
      pxDistance(latlng, L.latLng(p.lat, p.lng)) < DOCK_THRESHOLD_PX
    );
    if(container){
      pin.containerId = container.id;
      pin.groupId = null;
      return;
    }
    const nearToken = tokens.find(t =>
      !t.containerId &&
      pxDistance(latlng, L.latLng(t.lat, t.lng)) < DOCK_THRESHOLD_PX
    );
    const nearNpc = !nearToken && pins.find(p =>
      p.id !== pin.id && p.type === 'npc' && !p.containerId &&
      pxDistance(latlng, L.latLng(p.lat, p.lng)) < DOCK_THRESHOLD_PX
    );
    const near = nearToken || nearNpc;
    if(near){
      const gid = near.groupId || newId();
      near.groupId = gid;
      pin.groupId = gid;
      pin.containerId = null;
      return;
    }
    pin.groupId = null;
    pin.containerId = null;
  }

  function buildGroupPopupContent(gid, members){
    const container = document.createElement('div');
    container.innerHTML = `
      <div class="popup-kicker">Grupo · ${members.length} integrantes</div>
      <div class="group-popup-title">Empilhados neste ponto — clique pra editar cada um</div>
      <div class="occupant-list"></div>
      <div class="popup-actions">
        <button class="ungroup-all">Desagrupar todos</button>
      </div>
    `;
    const list = container.querySelector('.occupant-list');
    members.forEach(m => {
      const isPinMember = m.type === 'npc';
      const row = document.createElement('div');
      row.className = 'occupant-row';
      row.innerHTML = `<span class="occupant-name">${escapeHtml(m.label || m.title || 'Token')}</span>
        <button type="button" class="edit">Editar</button>
        <button type="button" class="leave">Tirar</button>`;
      row.querySelector('.edit').addEventListener('click', () => {
        const marker = tokenMarkers[m.id];
        if(!marker) return;
        const editContent = isPinMember ? buildPinPopupContent(m) : buildTokenPopupContent(m);
        const backBtn = document.createElement('button');
        backBtn.type = 'button';
        backBtn.textContent = '← Voltar ao grupo';
        backBtn.className = 'group-back-btn';
        backBtn.addEventListener('click', () => {
          marker.setPopupContent(buildGroupPopupContent(gid, members));
        });
        editContent.insertBefore(backBtn, editContent.firstChild);
        marker.setPopupContent(editContent);
      });
      row.querySelector('.leave').addEventListener('click', async () => {
        m.groupId = null;
        if(isPinMember) await saveKey(KEY_PINS, pins);
        else await saveKey(KEY_TOKENS, tokens);
        map.closePopup();
        renderTokens();
        renderPins();
      });
      list.appendChild(row);
    });
    container.querySelector('.ungroup-all').addEventListener('click', async () => {
      let touchedTokens = false, touchedPins = false;
      members.forEach(m => {
        m.groupId = null;
        if(m.type === 'npc') touchedPins = true; else touchedTokens = true;
      });
      if(touchedTokens) await saveKey(KEY_TOKENS, tokens);
      if(touchedPins) await saveKey(KEY_PINS, pins);
      map.closePopup();
      renderTokens();
      renderPins();
    });
    return container;
  }

  function renderTokens(){
    tokensLayer.clearLayers();
    Object.keys(tokenMarkers).forEach(k => delete tokenMarkers[k]);

    // tokens "dentro" de um veículo/abrigo não aparecem soltos no mapa
    const visibleTokens = tokens.filter(t => !t.containerId);
    // NPCs (pins) seguem a mesma regra e também podem entrar na mesma pilha
    // que jogadores ou outros NPCs
    const groupableNpcPins = pins.filter(p => p.type === 'npc' && !p.containerId);

    // fora do modo de seleção manual, tokens/NPCs com o mesmo groupId viram
    // uma única pilha visual no mapa (modo de seleção mantém o comportamento
    // antigo pra não atrapalhar quem quer escolher e mover vários manualmente)
    const groups = {};
    if(!tokenSelectMode){
      visibleTokens.forEach(t => {
        if(t.groupId) (groups[t.groupId] = groups[t.groupId] || []).push(t);
      });
      groupableNpcPins.forEach(p => {
        if(p.groupId) (groups[p.groupId] = groups[p.groupId] || []).push(p);
      });
      Object.keys(groups).forEach(gid => {
        if(groups[gid].length < 2){
          groups[gid].forEach(m => { m.groupId = null; });
          delete groups[gid];
        }
      });
    }
    const groupedIds = new Set();
    Object.values(groups).forEach(members => members.forEach(m => groupedIds.add(m.id)));

    // ---- marcadores de pilha/grupo ----
    Object.keys(groups).forEach(gid => {
      const members = groups[gid];
      // prioriza um token de jogador como "líder" visual da pilha; se a pilha
      // for só de NPCs, usa o badge redondo de NPC no lugar do quadrado de token
      const lead = members.find(m => m.type !== 'npc') || members[0];
      const isLeadNpc = lead.type === 'npc';
      const icon = isLeadNpc ? npcGroupIcon(lead, members.length) : tokenIcon(lead, members.length);
      const marker = L.marker([lead.lat, lead.lng], { icon, draggable:true });
      marker._groupId = gid;
      members.forEach(m => { tokenMarkers[m.id] = marker; });

      marker.on('click', (e) => { L.DomEvent.stopPropagation(e); });

      let groupDragStart = null;
      marker.on('dragstart', () => { tokenDragActive = true; groupDragStart = marker.getLatLng(); });
      marker.on('dragend', async (e) => {
        tokenDragActive = false;
        const pos = e.target.getLatLng();
        const dLat = pos.lat - groupDragStart.lat;
        const dLng = pos.lng - groupDragStart.lng;
        let touchedTokens = false, touchedPins = false;
        members.forEach(m => {
          m.lat += dLat; m.lng += dLng;
          if(m.type === 'npc') touchedPins = true; else touchedTokens = true;
        });
        groupDragStart = null;
        if(touchedTokens) await saveKey(KEY_TOKENS, tokens);
        if(touchedPins) await saveKey(KEY_PINS, pins);
        renderTokens();
        renderPins();
        if(typeof renderNavList === 'function') renderNavList();
      });

      marker.bindPopup(() => buildGroupPopupContent(gid, members));
      marker.addTo(tokensLayer);
    });

    // ---- tokens individuais (não empilhados, não dentro de veículo/abrigo) ----
    visibleTokens.filter(t => !groupedIds.has(t.id)).forEach(token => {
      const marker = L.marker([token.lat, token.lng], { icon: tokenIcon(token), draggable:true });
      marker._tokenId = token.id;
      tokenMarkers[token.id] = marker;

      marker.on('click', (e) => {
        L.DomEvent.stopPropagation(e);
        if(tokenSelectMode) toggleTokenSelection(token.id);
      });

      // quando vários tokens estão selecionados e um deles é arrastado, todos
      // os outros selecionados se movem junto, mantendo a formação do grupo
      let groupStart = null;
      let groupOthers = null;
      marker.on('dragstart', () => {
        tokenDragActive = true;
        if(tokenSelectMode && selectedTokenIds.has(token.id) && selectedTokenIds.size > 1){
          groupStart = marker.getLatLng();
          groupOthers = {};
          selectedTokenIds.forEach(id => {
            if(id !== token.id && tokenMarkers[id]) groupOthers[id] = tokenMarkers[id].getLatLng();
          });
        } else {
          groupStart = null; groupOthers = null;
        }
      });
      marker.on('drag', (e) => {
        if(!groupOthers) return;
        const cur = e.target.getLatLng();
        const dLat = cur.lat - groupStart.lat;
        const dLng = cur.lng - groupStart.lng;
        Object.keys(groupOthers).forEach(id => {
          const start = groupOthers[id];
          if(tokenMarkers[id]) tokenMarkers[id].setLatLng([start.lat + dLat, start.lng + dLng]);
        });
      });
      marker.on('dragend', async (e) => {
        tokenDragActive = false;
        const pos = e.target.getLatLng();
        token.lat = pos.lat; token.lng = pos.lng;
        if(groupOthers){
          const dLat = pos.lat - groupStart.lat;
          const dLng = pos.lng - groupStart.lng;
          Object.keys(groupOthers).forEach(id => {
            const t = tokens.find(tt => tt.id === id);
            const start = groupOthers[id];
            if(t){ t.lat = start.lat + dLat; t.lng = start.lng + dLng; }
          });
        } else if(!tokenSelectMode){
          // fora do modo de seleção manual: solto em cima de outro token ou de um
          // pin de veículo/abrigo, o token "encaixa" ali automaticamente
          tryDockToken(token, pos);
        }
        groupStart = null; groupOthers = null;
        await saveKey(KEY_TOKENS, tokens);
        if(typeof renderNavList === 'function') renderNavList();
        renderTokens();
        renderPins(); // atualiza o badge de ocupação em veículos/abrigos
      });

      if(!tokenSelectMode) marker.bindPopup(() => buildTokenPopupContent(token));
      marker.addTo(tokensLayer);
    });
    document.getElementById('stat-tokens').textContent = tokens.length;
    if(typeof refreshCharacterOptions === 'function') refreshCharacterOptions();
    if(typeof renderNavList === 'function') renderNavList();
  }
  function openTokenPopupById(id){
    tokensLayer.eachLayer(l => {
      if(l._tokenId === id && l.openPopup) l.openPopup();
    });
  }

  function renderShapes(){
    shapesLayer.clearLayers();
    shapes.forEach(shape => {
      let layer;
      const style = shapeStyleFor(shape);
      if(shape.type === 'circle' && shape.center && typeof shape.radius === 'number'){
        layer = L.circle(shape.center, Object.assign({ radius: shape.radius }, style));
      } else {
        layer = L.geoJSON(shape.geojson, { style: style });
      }
      layer._shapeId = shape.id;
      if(shape.label){
        layer.bindTooltip(shape.label, { permanent:true, direction:'center', className:'shape-label' });
      }
      layer.bindPopup(() => buildShapePopupContent(shape));
      layer.addTo(shapesLayer);
    });
    if(typeof renderNavList === 'function') renderNavList();
  }

  function renderRoutes(){
    routesLayer.clearLayers();
    routes.forEach(route => {
      const layer = L.polyline(route.points, { color:'var(--frost)', weight:3, opacity:0.85, dashArray:'2 8' });
      layer._routeId = route.id;
      const dist = route.distance != null ? route.distance : totalDistanceOf(route.points.map(p => L.latLng(p)));
      const walkTime = formatDuration(estimateHours(dist, 5));
      const label = (route.label || 'Rota') + ' · ' + formatDistance(dist) + ' · ~' + walkTime + ' a pé';
      layer.bindTooltip(label, { permanent:true, direction:'center', className:'shape-label route-label' });
      layer.bindPopup(() => buildRoutePopupContent(route));
      layer.addTo(routesLayer);
    });
    document.getElementById('stat-routes').textContent = routes.length;
    if(typeof renderNavList === 'function') renderNavList();
  }

  function openShapePopupById(id){
    shapesLayer.eachLayer(l => {
      if(l._shapeId === id && l.openPopup){
        l.openPopup(l.getBounds ? l.getBounds().getCenter() : (l.getLatLng ? l.getLatLng() : undefined));
      }
    });
  }
  function openRoutePopupById(id){
    routesLayer.eachLayer(l => {
      if(l._routeId === id && l.openPopup){
        l.openPopup(l.getBounds ? l.getBounds().getCenter() : undefined);
      }
    });
  }

  // ---------- nav drawer: lists every pin/token/área/rota for fast travel ----------
  const navDrawer = document.getElementById('nav-drawer');
  const navDrawerBackdrop = document.getElementById('nav-drawer-backdrop');
  const navSearchInput = document.getElementById('nav-search-input');
  function openNavDrawer(){
    closeDrawerIfOpen();
    renderNavList();
    navDrawer.classList.add('open');
    navDrawerBackdrop.classList.add('open');
  }
  function closeNavDrawer(){
    navDrawer.classList.remove('open');
    navDrawerBackdrop.classList.remove('open');
  }
  // closes the saque drawer if it's open, so only one drawer is ever open at once
  function closeDrawerIfOpen(){
    const sd = document.getElementById('saque-drawer');
    const sb = document.getElementById('drawer-backdrop');
    if(sd && sd.classList.contains('open')){ sd.classList.remove('open'); sb.classList.remove('open'); }
    if(typeof closeInventory === 'function') closeInventory();
    if(typeof closeHub === 'function') closeHub();
  }
  document.getElementById('nav-drawer-toggle-btn').addEventListener('click', () => {
    navDrawer.classList.contains('open') ? closeNavDrawer() : openNavDrawer();
  });
  document.getElementById('nav-drawer-close-btn').addEventListener('click', closeNavDrawer);
  navDrawerBackdrop.addEventListener('click', closeNavDrawer);
  navSearchInput.addEventListener('input', renderNavList);

  document.getElementById('token-select-toggle-btn').addEventListener('click', () => {
    setTokenSelectMode(!tokenSelectMode);
  });

  function renderNavList(){
    if(typeof invHoldersChanged === 'function') invHoldersChanged();
    const listPins = document.getElementById('nav-list-pins');
    const listTokens = document.getElementById('nav-list-tokens');
    const listShapes = document.getElementById('nav-list-shapes');
    const listRoutes = document.getElementById('nav-list-routes');
    if(!listPins || !listTokens || !listShapes || !listRoutes) return;

    const q = (navSearchInput.value || '').trim().toLowerCase();

    function fill(container, items, emptyMsg){
      const filtered = q ? items.filter(it => it.name.toLowerCase().includes(q)) : items;
      container.innerHTML = '';
      if(filtered.length === 0){
        container.innerHTML = `<div class="nav-empty">${emptyMsg}</div>`;
        return;
      }
      filtered.forEach(it => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'nav-item';
        btn.innerHTML = `<span class="nav-item-dot" style="background:${it.color}"></span><span class="nav-item-name">${escapeHtml(it.name)}</span><span class="nav-item-type">${it.typeLabel}</span>`;
        btn.addEventListener('click', it.go);
        container.appendChild(btn);
      });
    }

    const pinItems = pins.map(p => ({
      name: p.title || (PIN_TYPES.find(t=>t.id===p.type)||{}).label || 'Pin',
      color: (PIN_TYPES.find(t=>t.id===p.type)||{}).color || 'var(--ice-100)',
      typeLabel: p.locked ? 'Pin 🔒' : 'Pin',
      go: () => {
        closeNavDrawer();
        map.flyTo([p.lat, p.lng], Math.max(map.getZoom(), 16));
        setTimeout(() => openPinPopupById(p.id), 400);
      }
    }));
    fill(listPins, pinItems, 'Nenhum pin no mapa ainda.');

    const tokenItems = tokens.map(t => ({
      name: t.label || 'Token',
      color: t.color || '#8fd7e8',
      typeLabel: 'Token',
      go: () => {
        closeNavDrawer();
        map.flyTo([t.lat, t.lng], Math.max(map.getZoom(), 16));
        setTimeout(() => openTokenPopupById(t.id), 400);
      }
    }));
    fill(listTokens, tokenItems, 'Nenhum token no mapa ainda.');

    const shapeItems = [];
    shapes.forEach(s => {
      let center = null;
      if(s.type === 'circle' && s.center) center = s.center;
      else if(s.geojson){ try{ center = L.geoJSON(s.geojson).getBounds().getCenter(); }catch(e){} }
      if(!center) return;
      shapeItems.push({
        name: s.label || 'Área sem nome',
        color: 'var(--hazard)',
        typeLabel: 'Área',
        go: () => {
          closeNavDrawer();
          map.flyTo(center, Math.max(map.getZoom(), 15));
          setTimeout(() => openShapePopupById(s.id), 400);
        }
      });
    });
    fill(listShapes, shapeItems, 'Nenhuma área marcada ainda.');

    const routeItems = [];
    routes.forEach(r => {
      if(!r.points || !r.points.length) return;
      const mid = r.points[Math.floor(r.points.length/2)];
      routeItems.push({
        name: r.label || 'Rota sem nome',
        color: 'var(--frost)',
        typeLabel: 'Rota',
        go: () => {
          closeNavDrawer();
          map.flyTo(mid, Math.max(map.getZoom(), 15));
          setTimeout(() => openRoutePopupById(r.id), 400);
        }
      });
    });
    fill(listRoutes, routeItems, 'Nenhuma rota traçada ainda.');
  }

  // ---------- area drawing: circle (custom, click-based — leaflet-draw's own
  // circle tool is unreliable on this Leaflet version, and dragging.disable()
  // has side-effects here, so this uses two ordinary clicks instead of a drag) ----------
  let circleCenter = null;
  let circlePreview = null;

  function stopCircleMode(){
    circleModeOn = false;
    circleCenter = null;
    if(circlePreview){ map.removeLayer(circlePreview); circlePreview = null; }
    map.off('mousemove', onCircleMouseMove);
  }

  document.getElementById('tool-area-circle').addEventListener('click', () => {
    const btn = document.getElementById('tool-area-circle');
    const isActive = btn.classList.contains('active');
    clearModes();
    if(!isActive){
      circleModeOn = true;
      btn.classList.add('active');
      showDrawHint('Clique no centro do círculo. ESC cancela.');
    }
  });

  function onCircleMouseMove(e){
    if(!circlePreview || !circleCenter) return;
    circlePreview.setRadius(circleCenter.distanceTo(e.latlng));
  }

  // ---------- route / distance measuring tool (click to add points, double-click to finish) ----------
  let routePoints = [];
  let routePreviewLine = null;

  function stopRouteMode(){
    routeModeOn = false;
    routePoints = [];
    if(routePreviewLine){ map.removeLayer(routePreviewLine); routePreviewLine = null; }
    map.doubleClickZoom.enable();
  }

  document.getElementById('tool-route').addEventListener('click', () => {
    const btn = document.getElementById('tool-route');
    const isActive = btn.classList.contains('active');
    clearModes();
    if(!isActive){
      routeModeOn = true;
      btn.classList.add('active');
      map.doubleClickZoom.disable();
      showDrawHint('Clique pra marcar pontos da rota. Dê 2 cliques pra concluir. ESC cancela.');
    }
  });

  map.on('dblclick', async (e) => {
    if(!routeModeOn) return;
    // a double click also fires two ordinary click events right before it, which
    // already appended points at (or very near) this same spot — drop those so we
    // don't end the route with a bogus near-zero-length last segment
    while(routePoints.length >= 2){
      const a = routePoints[routePoints.length - 1];
      const b = routePoints[routePoints.length - 2];
      if(a.distanceTo(b) < 3) routePoints.pop();
      else break;
    }
    if(routePoints.length < 2){ clearModes(); return; }
    const distance = totalDistanceOf(routePoints);
    const route = { id:newId(), points: routePoints.map(p => [p.lat, p.lng]), distance, label:'Nova rota', note:'', ...ownerFields() };
    routes.push(route);
    await saveKey(KEY_ROUTES, routes);
    renderRoutes();
    openRoutePopupById(route.id);
    clearModes();
  });

  // ---------- map click: circle/route steps, or place pin/token ----------
  map.on('click', async (e) => {
    if(circleModeOn){
      if(!circleCenter){
        circleCenter = e.latlng;
        circlePreview = L.circle(circleCenter, Object.assign({ radius: 1 }, SHAPE_STYLE)).addTo(map);
        map.on('mousemove', onCircleMouseMove);
        showDrawHint('Clique novamente pra definir o raio. ESC cancela.');
      } else {
        const radius = circleCenter.distanceTo(e.latlng);
        map.off('mousemove', onCircleMouseMove);
        if(circlePreview){ map.removeLayer(circlePreview); circlePreview = null; }
        const center = circleCenter;
        circleCenter = null;
        if(radius >= 5){
          const shape = { id:newId(), type:'circle', center:[center.lat, center.lng], radius, label:'Nova área', note:'', ...ownerFields() };
          shapes.push(shape);
          await saveKey(KEY_SHAPES, shapes);
          renderShapes();
          openShapePopupById(shape.id);
        }
        clearModes();
      }
      return;
    }

    if(routeModeOn){
      routePoints.push(e.latlng);
      if(routePreviewLine){ routePreviewLine.setLatLngs(routePoints); }
      else{ routePreviewLine = L.polyline(routePoints, { color:'var(--frost)', weight:3, dashArray:'2 8' }).addTo(map); }
      if(routePoints.length > 1){
        showDrawHint(`Distância parcial: ${formatDistance(totalDistanceOf(routePoints))}. 2 cliques pra concluir. ESC cancela.`);
      }
      return;
    }

    if(selectedPinType){
      const typeLabel = (PIN_TYPES.find(t => t.id === selectedPinType) || {}).label || selectedPinType;
      const pin = {
        id: newId(),
        lat: e.latlng.lat,
        lng: e.latlng.lng,
        type: selectedPinType,
        title: typeLabel,
        note: '',
        ...ownerFields()
      };
      pins.push(pin);
      await saveKey(KEY_PINS, pins);
      renderPins();
      clearModes(); // um pin por clique — não fica no modo de colocar até o usuário escolher de novo
      // open the new pin's popup for immediate editing
      openPinPopupById(pin.id);
    } else if(tokenModeOn){
      const token = { id:newId(), lat:e.latlng.lat, lng:e.latlng.lng, label:'Token', ...ownerFields() };
      tokens.push(token);
      await saveKey(KEY_TOKENS, tokens);
      renderTokens();
      clearModes(); // idem pro token
    }
  });

  // ---------- area drawing: polygon & rectangle via Leaflet.draw engine ----------
  const drawControl = new L.Control.Draw({
    edit: false,
    draw: {
      polygon: { shapeOptions: { color: 'var(--hazard)' } },
      rectangle: { shapeOptions: { color: 'var(--hazard)' } },
      circle: false, marker: false, polyline: false, circlemarker: false
    }
  });
  map.addControl(drawControl); // control itself hidden via CSS; used only for engine

  const drawHint = document.getElementById('draw-hint');
  function showDrawHint(text){
    drawHint.innerHTML = `<span class="dot"></span>${text}`;
    drawHint.style.display = 'flex';
  }
  function hideDrawHint(){ drawHint.style.display = 'none'; }

  document.getElementById('tool-area-polygon').addEventListener('click', () => {
    const btn = document.getElementById('tool-area-polygon');
    const isActive = btn.classList.contains('active');
    clearModes();
    if(!isActive){
      btn.classList.add('active');
      new L.Draw.Polygon(map, drawControl.options.draw.polygon).enable();
      showDrawHint('Clique pra marcar os vértices, dê 2 cliques pra fechar. ESC cancela.');
    }
  });
  document.getElementById('tool-area-rect').addEventListener('click', () => {
    const btn = document.getElementById('tool-area-rect');
    const isActive = btn.classList.contains('active');
    clearModes();
    if(!isActive){
      btn.classList.add('active');
      new L.Draw.Rectangle(map, drawControl.options.draw.rectangle).enable();
      showDrawHint('Clique e arraste para desenhar o retângulo. ESC cancela.');
    }
  });

  map.on(L.Draw.Event.CREATED, async (e) => {
    hideDrawHint();
    document.querySelectorAll('.tool-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(activeLayerBtnId()).classList.add('active');
    const layer = e.layer;
    const geojson = layer.toGeoJSON();
    const shape = { id:newId(), geojson, label:'Nova área', note:'', ...ownerFields() };
    shapes.push(shape);
    await saveKey(KEY_SHAPES, shapes);
    renderShapes();
    openShapePopupById(shape.id);
  });
  map.on(L.Draw.Event.DRAWSTOP, hideDrawHint);

  // ESC cancels any active drawing/measuring mode
  document.addEventListener('keydown', (e) => {
    if(e.key === 'Escape' && (circleModeOn || routeModeOn)) clearModes();
  });

  // ---------- search: local pins/áreas/rotas + place search via Nominatim (OSM) ----------
  const searchInput = document.getElementById('search-input');
  const searchResultsEl = document.getElementById('search-results');
  let searchDebounce = null;
  let searchSeq = 0;

  function clearSearchResults(){
    searchResultsEl.innerHTML = '';
    searchResultsEl.style.display = 'none';
  }

  function renderSearchResults(items){
    if(!items.length){
      searchResultsEl.innerHTML = '<div class="search-empty">Nada encontrado.</div>';
      searchResultsEl.style.display = 'block';
      return;
    }
    searchResultsEl.innerHTML = items.map((it, idx) => `
      <div class="search-result" data-idx="${idx}">
        <span class="search-result-kicker">${escapeHtml(it.kicker)}</span>
        <span class="search-result-label">${escapeHtml(it.label)}</span>
      </div>
    `).join('');
    searchResultsEl.style.display = 'block';
    searchResultsEl.querySelectorAll('.search-result').forEach(el => {
      el.addEventListener('click', () => {
        goToSearchResult(items[Number(el.dataset.idx)]);
        clearSearchResults();
      });
    });
  }

  function goToSearchResult(item){
    if(item.bounds){
      map.fitBounds(item.bounds, { maxZoom:16 });
    } else {
      map.setView(item.latlng, Math.max(map.getZoom(), 15));
    }
    if(item.openPopup) setTimeout(item.openPopup, 250);
  }

  function searchLocal(query){
    const q = query.toLowerCase();
    const results = [];
    pins.forEach(p => {
      if((p.title||'').toLowerCase().includes(q) || (p.note||'').toLowerCase().includes(q)){
        results.push({ kicker:'Pin no mapa', label:p.title || 'Pin', latlng:[p.lat,p.lng],
          openPopup: () => { pinsLayer.eachLayer(l => { if(l.getLatLng && l.getLatLng().lat===p.lat && l.getLatLng().lng===p.lng) l.openPopup(); }); } });
      }
    });
    shapes.forEach(s => {
      if((s.label||'').toLowerCase().includes(q)){
        let center = null;
        if(s.type === 'circle' && s.center) center = s.center;
        else if(s.geojson){ try{ center = L.geoJSON(s.geojson).getBounds().getCenter(); }catch(e){} }
        if(center) results.push({ kicker:'Área', label:s.label, latlng:center, openPopup:() => openShapePopupById(s.id) });
      }
    });
    routes.forEach(r => {
      if((r.label||'').toLowerCase().includes(q) && r.points && r.points.length){
        const mid = r.points[Math.floor(r.points.length/2)];
        results.push({ kicker:'Rota', label:r.label, latlng:mid, openPopup:() => openRoutePopupById(r.id) });
      }
    });
    return results;
  }

  async function searchPlaces(query){
    try{
      const url = 'https://nominatim.openstreetmap.org/search?format=json&limit=5&q=' + encodeURIComponent(query);
      const res = await fetch(url, { headers: { 'Accept':'application/json' } });
      if(!res.ok) return [];
      const data = await res.json();
      return data.map(d => {
        let bounds = null;
        if(d.boundingbox && d.boundingbox.length === 4){
          const bb = d.boundingbox.map(Number);
          bounds = [[bb[0], bb[2]], [bb[1], bb[3]]];
        }
        return { kicker:'Lugar (OSM)', label:d.display_name, latlng:[parseFloat(d.lat), parseFloat(d.lon)], bounds };
      });
    }catch(e){ return []; }
  }

  searchInput.addEventListener('input', () => {
    clearTimeout(searchDebounce);
    const q = searchInput.value.trim();
    if(!q){ clearSearchResults(); return; }
    const mySeq = ++searchSeq;
    const local = searchLocal(q);
    renderSearchResults(local);
    searchDebounce = setTimeout(async () => {
      const places = await searchPlaces(q);
      if(mySeq !== searchSeq) return; // resposta antiga, ignora
      renderSearchResults([...local, ...places]);
    }, 400);
  });
  searchInput.addEventListener('keydown', (e) => {
    if(e.key === 'Escape'){ searchInput.blur(); clearSearchResults(); }
    if(e.key === 'Enter'){
      const first = searchResultsEl.querySelector('.search-result');
      if(first) first.click();
    }
  });
  document.addEventListener('click', (e) => {
    if(!document.getElementById('hud-search').contains(e.target)) clearSearchResults();
  });

  // ---------- reset ----------
  document.getElementById('reset-btn').addEventListener('click', async () => {
    if(!window.confirm('Isso remove todos os pins, tokens, áreas, rotas e inventários do mapa para todos (o registro de transações é mantido). Confirmar?')) return;
    clearAllInventories();
    pins = []; tokens = []; shapes = []; routes = [];
    await Promise.all([saveKey(KEY_PINS, pins), saveKey(KEY_TOKENS, tokens), saveKey(KEY_SHAPES, shapes), saveKey(KEY_ROUTES, routes)]);
    renderPins(); renderTokens(); renderShapes(); renderRoutes();
  });

  // ---------- carregamento inicial + sincronização em tempo real ----------
  // Pins usam renderPins() por diff (ver pinMarkers/pinDraggingId/editingPinId
  // acima) — por isso já pode chamar renderPins() sempre, sem trava de camada.
  // Tokens ainda usam a trava de camada inteira (mais simples de manter dado
  // o grafo de agrupamento/seleção múltipla).
  let tokenDragActive = false;

  function attachMapSync(){
    if(!firebaseReady){
      setSyncStatus('offline');
      (async function initFallback(){
        try{
          const [p, t, s, r, w] = await Promise.all([loadKey(KEY_PINS), loadKey(KEY_TOKENS), loadKey(KEY_SHAPES), loadKey(KEY_ROUTES), loadKey(KEY_WEATHER)]);
          pins = p; tokens = t; shapes = s; routes = r;
          weather = (w && w.state) ? w : weather;
          renderPins(); renderTokens(); renderShapes(); renderRoutes();
          applyWeatherVisual();
        }catch(e){
          console.error('Falha ao carregar dados do mapa', e);
        }finally{
          document.getElementById('map-loading').style.display = 'none';
        }
      })();
      return;
    }

    setSyncStatus('connecting');
    let loadedMask = 0;
    function markLoaded(bit){
      loadedMask |= bit;
      if(loadedMask === 0b11111) document.getElementById('map-loading').style.display = 'none';
    }
    // segurança: nunca deixa a tela de carregamento travada pra sempre. Se em
    // 8s os 4 dados não chegaram (erro de permissão nas regras do Firebase,
    // rede instável, etc), libera a interface mesmo assim — o mapa fica
    // vazio/desatualizado em vez de travado, e dá pra ver o status "offline"
    // e o botão de login pra tentar corrigir.
    setTimeout(() => {
      const loadingEl = document.getElementById('map-loading');
      if(loadingEl.style.display !== 'none'){
        loadingEl.style.display = 'none';
        if(loadedMask !== 0b11111) setSyncStatus('offline');
      }
    }, 8000);

    listen(fbRefOf(KEY_PINS), snap => {
      pins = snap.val() || [];
      saveLocal(KEY_PINS, pins);
      renderPins(); // por diff: nunca derruba o pin que outra pessoa está editando
      markLoaded(1);
      setSyncStatus('live');
    }, err => { console.error('Erro de sincronização (pins)', err); setSyncStatus('offline'); markLoaded(1); });

    listen(fbRefOf(KEY_TOKENS), snap => {
      tokens = snap.val() || [];
      saveLocal(KEY_TOKENS, tokens);
      if(!tokenDragActive && !tokenPopupActive) renderTokens();
      markLoaded(2);
      setSyncStatus('live');
    }, err => { console.error('Erro de sincronização (tokens)', err); setSyncStatus('offline'); markLoaded(2); });

    listen(fbRefOf(KEY_SHAPES), snap => {
      shapes = snap.val() || [];
      saveLocal(KEY_SHAPES, shapes);
      if(!shapePopupActive) renderShapes();
      markLoaded(4);
      setSyncStatus('live');
    }, err => { console.error('Erro de sincronização (áreas)', err); setSyncStatus('offline'); markLoaded(4); });

    listen(fbRefOf(KEY_ROUTES), snap => {
      routes = snap.val() || [];
      saveLocal(KEY_ROUTES, routes);
      if(!routePopupActive) renderRoutes();
      markLoaded(8);
      setSyncStatus('live');
    }, err => { console.error('Erro de sincronização (rotas)', err); setSyncStatus('offline'); markLoaded(8); });

    listen(fbRefOf(KEY_WEATHER), snap => {
      const w = snap.val();
      weather = (w && w.state) ? w : { state: 'calmo', updatedAt: null, updatedBy: null };
      saveLocal(KEY_WEATHER, weather);
      applyWeatherVisual();
      markLoaded(16);
      setSyncStatus('live');
    }, err => { console.error('Erro de sincronização (clima)', err); setSyncStatus('offline'); markLoaded(16); });
  }
  attachMapSync();


  // ================= SAQUE DRAWER (integração do sistema de saque) =================
  const LOOT_DATA = JSON.parse(document.getElementById('loot-data').textContent);
  const LOC_NAMES = LOOT_DATA.locNames;
  const ITEMS = LOOT_DATA.items;
  const LOC_ORDER = ["casas","farmacias","bases","veiculos","oficinas","mercados","acampamentos","fazendas","florestas","rios","convergencia"];
  const RURAL_LOCS = ["fazendas","florestas","rios"];
  const URBAN_LOCS = LOC_ORDER.filter(k => !RURAL_LOCS.includes(k) && k !== "convergencia");

  const byLoc = {};
  LOC_ORDER.forEach(k => byLoc[k] = ITEMS.filter(i => i.locations.includes(k)));

  const WEAPON_CATS = new Set(["Armas de Fogo", "Armas Brancas e Improvisadas"]);
  const weaponsByCalibre = {};
  const ammoByCalibre = {};
  ITEMS.forEach(it => {
    if (!it.calibre) return;
    if (it.category === "Munição") {
      (ammoByCalibre[it.calibre] = ammoByCalibre[it.calibre] || []).push(it.name);
    } else if (WEAPON_CATS.has(it.category)) {
      (weaponsByCalibre[it.calibre] = weaponsByCalibre[it.calibre] || []).push(it.name);
    }
  });

  function compatLine(item){
    if (!item.calibre) return '';
    if (item.category === "Munição") {
      const weapons = weaponsByCalibre[item.calibre];
      if (weapons && weapons.length) {
        return `<div class="compat-line"><b>Compatível com:</b> ${weapons.join(', ')}</div>`;
      }
      return `<div class="compat-line"><b>Compatível com:</b> nenhuma arma catalogada usa esse calibre — item raro ou obsoleto.</div>`;
    }
    if (WEAPON_CATS.has(item.category)) {
      const ammo = ammoByCalibre[item.calibre];
      if (ammo && ammo.length) {
        return `<div class="compat-line"><b>Munição compatível:</b> ${ammo.join(', ')}</div>`;
      }
      return `<div class="compat-line"><b>Munição compatível:</b> não há munição de fábrica para esta arma — funciona apenas com recarga improvisada ou está inutilizável.</div>`;
    }
    return '';
  }

  function buildSaqueLocGrid(container, keys, extraClass){
    keys.forEach(key => {
      const card = document.createElement('button');
      card.className = 'loc-card' + (extraClass ? ' ' + extraClass : '') + (key === 'convergencia' ? ' convergencia' : '');
      card.innerHTML = `
        <span class="tag">${key === 'convergencia' ? 'Evento raro' : 'Vasculhar'}</span>
        <span class="go">↻</span>
        <h3>${LOC_NAMES[key]}</h3>
        <span class="count">${byLoc[key].length} itens possíveis</span>
      `;
      card.addEventListener('click', () => rollLoot(key));
      container.appendChild(card);
    });
  }
  buildSaqueLocGrid(document.getElementById('loc-grid'), URBAN_LOCS.concat(['convergencia']));
  buildSaqueLocGrid(document.getElementById('loc-grid-rural'), RURAL_LOCS, 'rural-card');

  const resultZone = document.getElementById('result-zone');
  const webhookInput = document.getElementById('webhook-input');
  const autoSendBox = document.getElementById('auto-send');
  const charSelect = document.getElementById('char-select');
  let lootHistory = [];
  let lootUid = 0;

  // ---------- personagem: espelha os tokens marcados no mapa ----------
  function refreshCharacterOptions(){
    if(!charSelect) return;
    const prev = charSelect.value;
    charSelect.innerHTML = '<option value="">Sobrevivente desconhecido</option>' +
      tokens.map(t => `<option value="${escapeHtml(t.id)}">${escapeHtml(t.label || 'Token')}</option>`).join('');
    if(prev && tokens.some(t => t.id === prev)) charSelect.value = prev;
  }

  function selectedToken(){
    const id = charSelect.value;
    if(!id) return null;
    return tokens.find(t => t.id === id) || null;
  }

  function playerName(){
    const tok = selectedToken();
    if(tok) return (tok.label || 'Token').trim() || 'Sobrevivente desconhecido';
    return "Sobrevivente desconhecido";
  }

  // Armas de fogo e munição são de posse civil muito restrita no Brasil, então
  // ficam raras fora de bases militares ou do fundo do mato. Itens anômalos também são incomuns.
  function getWeight(item, locKey){
    if (item.category === "Armas de Fogo" || item.category === "Munição") {
      return locKey === "bases" ? 6 : (RURAL_LOCS.includes(locKey) ? 2 : 1);
    }
    if (item.category === "Itens Anômalos e Paranormais") {
      return 3;
    }
    return 10;
  }
  function rarityInfo(item, locKey){
    const w = getWeight(item, locKey);
    if (w <= 1) return {label:"Raro", cls:"rarity-raro"};
    if (w <= 3) return {label:"Incomum", cls:"rarity-incomum"};
    return {label:"Comum", cls:"rarity-comum"};
  }
  function weightedPick(pool, locKey){
    const weights = pool.map(it => getWeight(it, locKey));
    const total = weights.reduce((a,b)=>a+b,0);
    let r = Math.random() * total;
    for (let i = 0; i < pool.length; i++){
      r -= weights[i];
      if (r <= 0) return pool[i];
    }
    return pool[pool.length - 1];
  }

  function rollLoot(locKey){
    const pool = byLoc[locKey];
    const item = weightedPick(pool, locKey);
    const tok = selectedToken();
    const lf = locFields(tok);
    if(!exploreGate(lf)) return;
    const entry = Object.assign({kind:'loot', item, locKey, uid: ++lootUid, sendState: 'idle', foundBy: playerName(), holderId: tok ? tok.id : null, decision: 'pending'}, lf);
    explorePostRoll(entry);
    lootHistory.unshift(entry);
    logFound(entry);
    renderLootResults();
    if (autoSendBox.checked) sendLootToDiscord(entry);
  }

  function renderLootResults(){
    if(lootHistory.length === 0){
      resultZone.innerHTML = '<div class="empty-hint">Nenhuma busca realizada ainda. Clique em um local acima para vasculhar.</div>';
      return;
    }
    resultZone.innerHTML = '';
    const clearBtn = document.createElement('button');
    clearBtn.className = 'clear-btn';
    clearBtn.textContent = 'Limpar histórico';
    clearBtn.addEventListener('click', () => { flushPending(lootHistory); lootHistory = []; renderLootResults(); });

    lootHistory.slice(0, 25).forEach((entry) => {
      const {item, locKey, foundBy, coord} = entry;
      const rarity = rarityInfo(item, locKey);
      const card = document.createElement('div');
      card.className = 'result-card' + (item.category === 'Itens Anômalos e Paranormais' ? ' anomalo' : '');
      card.dataset.uid = entry.uid;
      card.innerHTML = `
        <div class="result-top">
          <div class="result-loc">Buscado em: ${LOC_NAMES[locKey]}</div>
          <div class="found-by">Encontrado por: ${escapeHtml(foundBy)}</div>
        </div>
        <div class="result-name">${item.name}<span class="rarity-tag ${rarity.cls}">${rarity.label}</span></div>
        <span class="result-cat">${item.category}</span>
        <div class="result-utility"><b>Utilidade:</b> ${item.utility}</div>
        ${compatLine(item)}
        ${coordHtml(entry)}
        <div class="send-row">
          <button class="send-btn" data-action="send">Enviar ao Discord</button>
          <span class="send-status" data-role="status">${lootStatusText(entry)}</span>
        </div>
      `;
      card.querySelector('[data-action="send"]').addEventListener('click', () => sendLootToDiscord(entry));
      attachDecision(card, entry);
      resultZone.appendChild(card);
    });
    resultZone.appendChild(clearBtn);
  }

  function lootStatusText(entry){
    if (entry.sendState === 'sending') return 'Enviando...';
    if (entry.sendState === 'ok') return 'Enviado ✓';
    if (entry.sendState === 'fail') return 'Falha ao enviar — clique para tentar de novo';
    return '';
  }

  function updateLootCardStatus(entry, zone){
    const scope = zone || resultZone;
    const card = scope.querySelector(`[data-uid="${entry.uid}"]`);
    if (!card) return;
    const statusEl = card.querySelector('[data-role="status"]');
    if (!statusEl) return;
    statusEl.textContent = lootStatusText(entry);
    statusEl.className = 'send-status' + (entry.sendState === 'ok' ? ' ok' : entry.sendState === 'fail' ? ' fail' : '');
  }

  async function sendLootToDiscord(entry){
    const url = webhookInput.value.trim();
    const zone = entry.kind === 'fish' ? fishResultEl : resultZone;
    if (!url) {
      entry.sendState = 'fail';
      updateLootCardStatus(entry, zone);
      return;
    }
    entry.sendState = 'sending';
    updateLootCardStatus(entry, zone);

    let payload;
    if (entry.kind === 'fish') {
      const isNothing = !entry.item;
      const fields = [
        { name: "Local", value: LOC_NAMES['rios'], inline: true },
        { name: "Atividade", value: "Pescaria", inline: true },
        { name: "Encontrado por", value: entry.foundBy, inline: true }
      ];
      if(entry.coord) fields.push({ name: "Local aproximado (lat, lng)", value: entry.coord, inline: true });
      payload = {
        username: "Tau Volantis — Registro de Saque",
        embeds: [{
          title: isNothing ? "Nada fisgou a isca" : entry.item.name,
          description: isNothing ? "A linha voltou vazia desta vez." : entry.item.utility,
          color: isNothing ? 0x26333d : 0x1f8890,
          fields,
          footer: { text: "Tau Volantis: Ano 0" },
          timestamp: new Date().toISOString()
        }]
      };
    } else {
      const {item, locKey, foundBy, coord} = entry;
      const rarity = rarityInfo(item, locKey);
      const isAnomalo = item.category === 'Itens Anômalos e Paranormais';
      const fields = [
        { name: "Local", value: LOC_NAMES[locKey], inline: true },
        { name: "Categoria", value: item.category, inline: true },
        { name: "Raridade", value: rarity.label, inline: true },
        { name: "Encontrado por", value: foundBy, inline: true }
      ];
      if(coord) fields.push({ name: "Local aproximado (lat, lng)", value: coord, inline: true });
      payload = {
        username: "Tau Volantis — Registro de Saque",
        embeds: [{
          title: item.name,
          description: item.utility,
          color: isAnomalo ? 0xd3572a : 0x3d6c8a,
          fields,
          footer: { text: "Tau Volantis: Ano 0" },
          timestamp: new Date().toISOString()
        }]
      };
    }

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(payload)
      });
      entry.sendState = (res.ok || res.status === 204) ? 'ok' : 'fail';
    } catch (e) {
      entry.sendState = 'fail';
    }
    updateLootCardStatus(entry, zone);
  }

  // ---------- pescaria ----------
  const FISH_POOL = ITEMS.filter(i => typeof i.fish === 'number');
  const NOTHING_WEIGHT = 650;
  const fishBtn = document.getElementById('fish-btn');
  const fishResultEl = document.getElementById('fish-result');
  let fishHistory = [];
  let fishUid = 0;

  function rollFish(){
    const totalFishWeight = FISH_POOL.reduce((a,b)=>a+b.fish,0);
    const totalWeight = totalFishWeight + NOTHING_WEIGHT;
    let r = Math.random() * totalWeight;
    let caught = null;
    if (r >= NOTHING_WEIGHT) {
      r -= NOTHING_WEIGHT;
      for (let i = 0; i < FISH_POOL.length; i++){
        r -= FISH_POOL[i].fish;
        if (r <= 0) { caught = FISH_POOL[i]; break; }
      }
      if (!caught) caught = FISH_POOL[FISH_POOL.length - 1];
    }
    const tok = selectedToken();
    const entry = Object.assign({kind:'fish', item: caught, uid: ++fishUid, sendState:'idle', foundBy: playerName(), holderId: tok ? tok.id : null, decision: 'pending'}, locFields(tok));
    fishHistory.unshift(entry);
    logFound(entry);
    renderFishResults();
    if (autoSendBox.checked) sendLootToDiscord(entry);
  }
  fishBtn.addEventListener('click', rollFish);

  function renderFishResults(){
    if (fishHistory.length === 0){
      fishResultEl.innerHTML = '<div class="fish-empty">Nenhuma tentativa de pesca ainda.</div>';
      return;
    }
    fishResultEl.innerHTML = '';
    const clearFishBtn = document.createElement('button');
    clearFishBtn.className = 'clear-btn';
    clearFishBtn.textContent = 'Limpar histórico de pesca';
    clearFishBtn.addEventListener('click', () => { flushPending(fishHistory); fishHistory = []; renderFishResults(); });

    fishHistory.slice(0, 10).forEach(entry => {
      const card = document.createElement('div');
      const isNothing = !entry.item;
      card.className = 'fish-card' + (isNothing ? ' nocatch' : '');
      card.dataset.uid = entry.uid;
      card.innerHTML = `
        <div class="result-top">
          <div class="result-loc">Rios, Igarapés e Margens</div>
          <div class="found-by">Pescado por: ${escapeHtml(entry.foundBy)}</div>
        </div>
        <div class="fish-name">${isNothing ? 'Nada fisgou a isca desta vez' : entry.item.name}</div>
        <div class="fish-desc">${isNothing ? 'A linha voltou vazia. Vale tentar de novo em outro ponto do rio.' : entry.item.utility}</div>
        ${coordHtml(entry)}
        <div class="send-row">
          <button class="send-btn" data-action="send">Enviar ao Discord</button>
          <span class="send-status" data-role="status">${lootStatusText(entry)}</span>
        </div>
      `;
      card.querySelector('[data-action="send"]').addEventListener('click', () => sendLootToDiscord(entry));
      attachDecision(card, entry);
      fishResultEl.appendChild(card);
    });
    fishResultEl.appendChild(clearFishBtn);
  }

  // ---------- tabela completa (referência) ----------
  const saqueBrowseToggle = document.getElementById('saque-browse-toggle');
  const saqueBrowsePanel = document.getElementById('saque-browse-panel');
  saqueBrowseToggle.addEventListener('click', () => {
    saqueBrowsePanel.classList.toggle('open');
    saqueBrowseToggle.textContent = (saqueBrowsePanel.classList.contains('open') ? '▾' : '▸') + ` Ver tabela completa de ${ITEMS.length} itens`;
    if(saqueBrowsePanel.classList.contains('open') && !saqueBrowsePanel.dataset.built){
      buildItemTable();
      saqueBrowsePanel.dataset.built = '1';
    }
  });

  const itemFilterLoc = document.getElementById('item-filter-loc');
  LOC_ORDER.forEach(key => {
    const opt = document.createElement('option');
    opt.value = key;
    opt.textContent = LOC_NAMES[key];
    itemFilterLoc.appendChild(opt);
  });

  const itemTbody = document.getElementById('item-table-body');
  function buildItemTable(){
    renderItemTable(ITEMS);
  }
  function renderItemTable(list){
    itemTbody.innerHTML = list.map(item => {
      const worstLoc = item.locations.includes('bases') && (item.category === "Armas de Fogo" || item.category === "Munição") ? 'bases' : item.locations[0];
      const rarity = rarityInfo(item, worstLoc);
      return `
      <tr>
        <td>${item.name}<span class="rarity-tag ${rarity.cls}">${rarity.label}</span>${compatLine(item)}</td>
        <td>${item.category}</td>
        <td>${item.locations.map(l => `<span class="mini-tag">${LOC_NAMES[l].split(' ')[0]}</span>`).join('')}</td>
        <td>${item.utility}</td>
        <td><button type="button" class="inv-add-btn" data-id="${item.id}">＋ Inventário</button></td>
      </tr>
    `;
    }).join('');
  }

  const itemSearchInput = document.getElementById('item-search-input');
  function applyItemFilters(){
    const q = itemSearchInput.value.trim().toLowerCase();
    const loc = itemFilterLoc.value;
    let list = ITEMS;
    if(loc) list = list.filter(i => i.locations.includes(loc));
    if(q) list = list.filter(i => i.name.toLowerCase().includes(q) || i.category.toLowerCase().includes(q));
    renderItemTable(list);
  }
  itemSearchInput.addEventListener('input', applyItemFilters);
  itemFilterLoc.addEventListener('change', applyItemFilters);

  // ---------- abrir/fechar a gaveta ----------
  const saqueDrawer = document.getElementById('saque-drawer');
  const drawerBackdrop = document.getElementById('drawer-backdrop');
  function openDrawer(){
    refreshCharacterOptions();
    if(typeof closeNavDrawer === 'function') closeNavDrawer();
    closeInventory();
    closeHub();
    saqueDrawer.classList.add('open');
    drawerBackdrop.classList.add('open');
  }
  function closeDrawer(){
    saqueDrawer.classList.remove('open');
    drawerBackdrop.classList.remove('open');
  }
  document.getElementById('drawer-toggle-btn').addEventListener('click', () => {
    saqueDrawer.classList.contains('open') ? closeDrawer() : openDrawer();
  });
  document.getElementById('drawer-close-btn').addEventListener('click', closeDrawer);
  drawerBackdrop.addEventListener('click', closeDrawer);

  // ================= INVENTÁRIO + REGISTRO (AUDITORIA) =================
  // Cada token de jogador e cada NPC (pin do tipo npc) tem um inventário de até
  // MAX_INV itens. Os itens ficam em tv-map:inventories/{donoId}/{itemUid} — um
  // filho por item, assim duas pessoas mexendo em itens diferentes nunca se
  // sobrescrevem. Toda ação gera uma entrada em tv-map:loot-log/{id}, gravada
  // NA MESMA operação atômica (update multi-caminho) que altera o inventário:
  // ou os dois acontecem, ou nenhum. O registro só recebe entradas novas.
  const ITEMS_BY_ID = {};
  ITEMS.forEach(i => { ITEMS_BY_ID[i.id] = i; });
  const CONSUMABLE_CATS = new Set(['Comida','Bebidas','Itens Médicos','Munição','Combustível e Aquecimento','Plantas, Ervas e Cultivos']);
  function consumableByDefault(inv){
    const ref = ITEMS_BY_ID[inv.itemId];
    return CONSUMABLE_CATS.has(inv.category) || !!(ref && typeof ref.fish === 'number');
  }

  const ACTION_LABELS = {
    saque:'Saque', guardar:'Guardou', recusar:'Não manteve', adicionar:'Adicionou (tabela)',
    usar:'Usou', descartar:'Descartou', troca:'Troca', craft:'Fabricação', inv_removido:'Inventário removido'
  };
  const SOURCE_LABELS = { saque:'saque', pesca:'pesca', tabela:'tabela de itens', inventario:'inventário' };

  const invDrawer = document.getElementById('inv-drawer');
  const invBackdrop = document.getElementById('inv-drawer-backdrop');
  const itemAddDest = document.getElementById('item-add-dest');
  const invUI = { holderId:null, tab:'inv', trade:null, panel:null, logHolder:'', logAction:'' };
  let lastHolderSig = '';

  function toast(msg, isErr){
    const el = document.createElement('div');
    el.className = 'inv-toast' + (isErr ? ' err' : '');
    el.textContent = msg;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 2800);
  }
  function newUid(prefix){ return prefix + Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }

  // ---------- donos de inventário ----------
  function holderList(){
    return tokens.map(t => ({ id:t.id, type:'token', name:(t.label || 'Token') }))
      .concat(pins.filter(p => p.type === 'npc').map(p => ({ id:p.id, type:'npc', name:(p.title || 'NPC') })));
  }
  function holderById(id){ return id ? (holderList().find(h => h.id === id) || null) : null; }
  function invItems(hid){
    const o = (hid && inventories[hid]) || {};
    return Object.keys(o).map(k => o[k]).sort((a, b) => (a.addedAt || 0) - (b.addedAt || 0));
  }
  function invCount(hid){ return hid && inventories[hid] ? Object.keys(inventories[hid]).length : 0; }
  function holderOptionsHtml(list, withCount){
    const tk = list.filter(h => h.type === 'token'), np = list.filter(h => h.type === 'npc');
    const opt = h => `<option value="${escapeHtml(h.id)}">${escapeHtml(h.name)}${withCount ? ` (${capTxt(h.id)})` : ''}</option>`;
    return (tk.length ? `<optgroup label="Jogadores">${tk.map(opt).join('')}</optgroup>` : '') +
           (np.length ? `<optgroup label="NPCs">${np.map(opt).join('')}</optgroup>` : '');
  }

  // ---------- registro ----------
  function actorFields(){
    return {
      actorId: currentUser ? currentUser.uid : null,
      actorName: currentPlayer ? currentPlayer.playerName : 'Anônimo (sem login)'
    };
  }
  function itemRef(i){
    return { uid: i.uid || null, itemId: i.itemId != null ? i.itemId : i.id, name: i.name, category: i.category };
  }
  function mkLog(action, holder, extra){
    return Object.assign({
      action,
      holderId: holder ? holder.id : null,
      holderName: holder ? holder.name : 'Sobrevivente desconhecido',
      holderType: holder ? holder.type : null,
      sessionId: (campaignMeta && campaignMeta.activeSessionId) || null
    }, actorFields(), extra || {});
  }

  // Grava alterações de inventário + entradas de registro de uma vez só.
  // invOps: { 'donoId/itemUid': objeto | null, 'donoId': null }
  async function commitInv(invOps, logEntries){
    const entries = (logEntries || []).map(e => Object.assign({
      id: firebaseReady ? fbRefOf(KEY_LOG).push().key : newUid('lg'),
      ts: firebaseReady ? firebase.database.ServerValue.TIMESTAMP : Date.now()
    }, e));
    if(firebaseReady){
      const upd = {};
      Object.keys(invOps).forEach(p => { upd[scopedKey(KEY_INV) + '/' + p] = invOps[p]; });
      entries.forEach(e => { upd[scopedKey(KEY_LOG) + '/' + e.id] = JSON.parse(JSON.stringify(e)); });
      try{
        await firebaseDb.ref('tau-volantis').update(upd);
        return true;
      }catch(err){
        console.error('Falha ao gravar inventário/registro', err);
        toast('Não foi possível salvar (confira as regras do Firebase).', true);
        return false;
      }
    }
    // sem Firebase: aplica na memória e salva local
    Object.keys(invOps).forEach(p => {
      const parts = p.split('/'), h = parts[0], u = parts[1];
      if(invOps[p] === null){
        if(u === undefined) delete inventories[h];
        else if(inventories[h]){ delete inventories[h][u]; if(!Object.keys(inventories[h]).length) delete inventories[h]; }
      } else {
        (inventories[h] = inventories[h] || {})[u] = invOps[p];
      }
    });
    lootLog = lootLog.concat(entries);
    await Promise.all([saveKey(KEY_INV, inventories), saveKey(KEY_LOG, lootLog)]);
    onInvChanged();
    return true;
  }

  // ---------- ações ----------
  async function addItemTo(holderId, item, source, action, logExtra, instExtra){
    const holder = holderById(holderId);
    if(!holder){ toast('Escolha um personagem ou NPC primeiro.', true); return false; }
    if(invCount(holderId) >= MAX_INV){ toast(`Inventário de ${holder.name} cheio (${fmtCount(MAX_INV)}).`, true); return false; }
    const inst = { uid:newUid('it'), itemId:item.id, name:item.name, category:item.category, source, addedAt:Date.now(), addedBy:actorFields().actorName };
    if(instExtra) Object.assign(inst, instExtra);
    const ok = await commitInv(
      { [holderId + '/' + inst.uid]: inst },
      [mkLog(action, holder, Object.assign({ item:itemRef(inst), source, invAfter:invCount(holderId) + 1 }, logExtra || {}))]
    );
    if(ok) toast(`${item.name} → inventário de ${holder.name}`);
    return ok;
  }

  function lootSource(entry){ return entry.kind === 'fish' ? 'pesca' : 'saque'; }
  function logFound(entry){
    if(!entry.item) return;
    commitInv({}, [mkLog('saque', holderById(entry.holderId), {
      item:itemRef(entry.item), source:lootSource(entry),
      locName: entry.kind === 'fish' ? LOC_NAMES['rios'] : LOC_NAMES[entry.locKey],
      coord: entry.coord || null, lat: entry.lat != null ? entry.lat : null, lng: entry.lng != null ? entry.lng : null,
      pinId: entry.pinId || null, pinTitle: entry.pinTitle || null
    })]);
  }
  async function keepLoot(entry){
    if(entry.decision !== 'pending') return;
    entry.decision = 'working';
    renderLootResults(); renderFishResults();
    const ok = await addItemTo(entry.holderId, entry.item, lootSource(entry), 'guardar', entry.lat != null ? { lat:entry.lat, lng:entry.lng } : null, entry.lat != null ? { foundAt:entry.coord } : null);
    entry.decision = ok ? 'kept' : 'pending';
    renderLootResults(); renderFishResults();
  }
  async function declineLoot(entry, reason){
    if(entry.decision !== 'pending') return;
    entry.decision = 'declined';
    renderLootResults(); renderFishResults();
    await commitInv({}, [mkLog('recusar', holderById(entry.holderId), { item:itemRef(entry.item), source:lootSource(entry), reason:reason || null })]);
  }
  // ao limpar o histórico de saque, o que ficou sem decisão vira "não mantido"
  // no registro, pra auditoria nunca ficar com item "no limbo"
  function flushPending(list){
    const logs = [];
    list.forEach(e => {
      if(e.item && e.decision === 'pending'){
        e.decision = 'declined';
        logs.push(mkLog('recusar', holderById(e.holderId), { item:itemRef(e.item), source:lootSource(e), reason:'histórico limpo sem decisão' }));
      }
    });
    if(logs.length) commitInv({}, logs);
  }
  function buildDecisionEl(entry){
    const el = document.createElement('div');
    el.className = 'loot-decision';
    const holder = holderById(entry.holderId);
    if(entry.decision === 'kept'){
      el.innerHTML = `<div class="loot-decision-state kept">✓ Guardado no inventário de ${escapeHtml(holder ? holder.name : entry.foundBy)}</div>`;
      return el;
    }
    if(entry.decision === 'declined'){
      el.innerHTML = '<div class="loot-decision-state declined">✕ Não mantido</div>';
      return el;
    }
    const n = holder ? invCount(holder.id) : 0;
    const full = !!holder && n >= MAX_INV;
    const working = entry.decision === 'working';
    let warn = '';
    if(!holder) warn = 'Selecione um personagem (token) antes de saquear para poder guardar o item.';
    else if(full) warn = 'Inventário cheio. Libere espaço (usar, trocar ou descartar) ou escolha "Não manter".';
    el.innerHTML = `
      <div class="loot-decision-q">Manter no inventário${holder ? ' de ' + escapeHtml(holder.name) : ''}?</div>
      <div class="loot-decision-btns">
        <button type="button" class="inv-mini-btn primary" data-act="keep" ${(!holder || full || working) ? 'disabled' : ''}>${working ? 'Guardando...' : `Guardar (${n}/${MAX_INV})`}</button>
        <button type="button" class="inv-mini-btn danger" data-act="decline" ${working ? 'disabled' : ''}>Não manter</button>
      </div>
      ${warn ? `<div class="loot-decision-warn">${warn}</div>` : ''}`;
    el.querySelector('[data-act="keep"]').addEventListener('click', () => keepLoot(entry));
    el.querySelector('[data-act="decline"]').addEventListener('click', () => declineLoot(entry));
    return el;
  }
  function attachDecision(card, entry){
    if(!entry.item) return;
    card.insertBefore(buildDecisionEl(entry), card.querySelector('.send-row'));
  }

  async function doUse(hid, uid, consume, note){
    const holder = holderById(hid), inst = inventories[hid] && inventories[hid][uid];
    if(!holder || !inst){ toast('Item não encontrado.', true); return; }
    const ok = await commitInv(consume ? { [hid + '/' + uid]: null } : {},
      [mkLog('usar', holder, { item:itemRef(inst), consumed:!!consume, note:note || null, source:'inventario', invAfter:invCount(hid) - (consume ? 1 : 0) })]);
    if(ok){ invUI.panel = null; toast(consume ? `${inst.name} usado e consumido.` : `${inst.name} usado.`); renderInvDrawer(); }
  }
  async function doDiscard(hid, uid, note){
    const holder = holderById(hid), inst = inventories[hid] && inventories[hid][uid];
    if(!holder || !inst){ toast('Item não encontrado.', true); return; }
    const ok = await commitInv({ [hid + '/' + uid]: null },
      [mkLog('descartar', holder, { item:itemRef(inst), note:note || null, source:'inventario', invAfter:invCount(hid) - 1 })]);
    if(ok){ invUI.panel = null; toast(`${inst.name} descartado.`); renderInvDrawer(); }
  }
  async function doTrade(){
    const t = invUI.trade;
    const a = holderById(invUI.holderId), b = holderById(t && t.otherId);
    if(!a || !b) return;
    const giveItems = t.give.map(u => inventories[a.id] && inventories[a.id][u]).filter(Boolean);
    const takeItems = t.take.map(u => inventories[b.id] && inventories[b.id][u]).filter(Boolean);
    if(giveItems.length !== t.give.length || takeItems.length !== t.take.length){
      toast('Algum item mudou de lugar enquanto você montava a troca. Refaça.', true);
      renderInvDrawer(); return;
    }
    if(!giveItems.length && !takeItems.length) return;
    const aAfter = invCount(a.id) - giveItems.length + takeItems.length;
    const bAfter = invCount(b.id) + giveItems.length - takeItems.length;
    if(aAfter > MAX_INV || bAfter > MAX_INV){ toast(`A troca excede o limite de ${MAX_INV} itens.`, true); return; }
    const ops = {};
    const moved = (inst) => Object.assign({}, inst, { source:'troca', addedAt:Date.now() });
    giveItems.forEach(i => { ops[a.id + '/' + i.uid] = null; ops[b.id + '/' + i.uid] = moved(i); });
    takeItems.forEach(i => { ops[b.id + '/' + i.uid] = null; ops[a.id + '/' + i.uid] = moved(i); });
    const ok = await commitInv(ops, [mkLog('troca', a, {
      counterpartId:b.id, counterpartName:b.name, counterpartType:b.type,
      gave:giveItems.map(itemRef), got:takeItems.map(itemRef),
      note:t.note || null, source:'inventario', invAfter:aAfter, counterpartInvAfter:bAfter
    })]);
    if(ok){ invUI.trade = null; toast('Troca concluída.'); renderInvDrawer(); }
  }
  // dono removido do mapa: o inventário some, mas o conteúdo fica registrado
  function removeHolderInventory(hid, reason){
    const items = invItems(hid);
    if(!items.length) return;
    const holder = holderById(hid) || { id:hid, name:'(removido)', type:null };
    commitInv({ [hid]: null }, [mkLog('inv_removido', holder, { items:items.map(itemRef), reason:reason || null })]);
  }
  function clearAllInventories(){
    const ids = Object.keys(inventories);
    if(!ids.length) return;
    const ops = {}, logs = [];
    ids.forEach(hid => {
      ops[hid] = null;
      logs.push(mkLog('inv_removido', holderById(hid) || { id:hid, name:'(removido)', type:null },
        { items:invItems(hid).map(itemRef), reason:'mapa reiniciado' }));
    });
    commitInv(ops, logs);
  }

  // ---------- gaveta de inventário ----------
  function openInventory(hid){
    closeHub();
    closeDrawer();
    closeNavDrawer();
    if(hid) invUI.holderId = hid;
    else if(!invUI.holderId || !holderById(invUI.holderId)) invUI.holderId = charSelect.value || (holderList()[0] || {}).id || null;
    invUI.trade = null; invUI.panel = null;
    renderInvDrawer();
    invDrawer.classList.add('open');
    invBackdrop.classList.add('open');
  }
  function closeInventory(){
    invDrawer.classList.remove('open');
    invBackdrop.classList.remove('open');
  }
  function setInvTab(tab){
    invUI.tab = tab;
    renderInvDrawer();
  }

  function renderInvDrawer(){
    const hl = holderList();
    const hs = document.getElementById('inv-holder-select');
    hs.innerHTML = hl.length ? holderOptionsHtml(hl, true) : '<option value="">Nenhum token ou NPC no mapa</option>';
    if(!hl.some(h => h.id === invUI.holderId)) invUI.holderId = hl[0] ? hl[0].id : null;
    hs.value = invUI.holderId || '';

    invDrawer.querySelectorAll('.inv-tab').forEach(b => b.classList.toggle('active', b.dataset.tab === invUI.tab));
    document.getElementById('inv-pane-inv').style.display = invUI.tab === 'inv' ? '' : 'none';
    document.getElementById('inv-pane-log').style.display = invUI.tab === 'log' ? '' : 'none';
    if(invUI.tab === 'log'){ renderInvLog(); return; }

    const hid = invUI.holderId, n = invCount(hid);
    const fill = document.getElementById('inv-cap-fill');
    const cc = cfg();
    const pct = cc.invMode === 'slots' ? n / MAX_INV : (cc.invMode === 'carga' ? invWeight(hid) / cc.invLimit : 0);
    fill.style.width = Math.min(100, pct * 100) + '%';
    fill.className = pct >= 1 ? 'full' : (pct >= 0.8 ? 'warn' : '');
    document.getElementById('inv-cap-text').textContent = capTxt(hid);
    document.getElementById('inv-trade-open').disabled = !hid;

    renderTradePanel();

    const list = document.getElementById('inv-list');
    list.innerHTML = '';
    const items = invItems(hid);
    if(!hid){
      list.innerHTML = '<div class="inv-empty">Crie um token ou um NPC no mapa para ter um inventário.</div>';
      return;
    }
    if(!items.length){
      list.innerHTML = '<div class="inv-empty">Inventário vazio. Itens chegam por saque, pela tabela de itens ou por troca.</div>';
      return;
    }
    items.forEach(inv => {
      const ref = ITEMS_BY_ID[inv.itemId];
      const row = document.createElement('div');
      row.className = 'inv-item' + (inv.category === 'Itens Anômalos e Paranormais' ? ' anomalo' : '');
      row.innerHTML = `
        <div class="inv-item-name">${escapeHtml(inv.name)}</div>
        <span class="inv-item-cat">${escapeHtml(inv.category)}</span>
        ${ref ? `<div class="inv-item-util">${escapeHtml(ref.utility)}</div>${compatLine(ref)}` : ''}
        ${inv.foundAt ? `<div class="inv-item-util">📍 Achado em: ${escapeHtml(inv.foundAt)}</div>` : ''}
        <div class="inv-item-actions">
          <button type="button" class="inv-mini-btn" data-act="use">Usar</button>
          <button type="button" class="inv-mini-btn" data-act="trade">Trocar</button>
          <button type="button" class="inv-mini-btn danger" data-act="discard">Descartar</button>
        </div>`;
      row.querySelector('[data-act="use"]').addEventListener('click', () => {
        invUI.panel = { type:'use', uid:inv.uid, consume:consumableByDefault(inv), note:'' };
        renderInvDrawer();
      });
      row.querySelector('[data-act="discard"]').addEventListener('click', () => {
        invUI.panel = { type:'discard', uid:inv.uid, note:'' };
        renderInvDrawer();
      });
      row.querySelector('[data-act="trade"]').addEventListener('click', () => {
        invUI.trade = { otherId:null, give:[inv.uid], take:[], note:'' };
        invUI.panel = null;
        renderInvDrawer();
        document.getElementById('inv-trade-panel').scrollIntoView({ block:'nearest' });
      });
      const pn = invUI.panel;
      if(pn && pn.uid === inv.uid){
        const box = document.createElement('div');
        box.className = 'inv-inline';
        if(pn.type === 'use'){
          box.innerHTML = `
            <label><input type="checkbox" data-role="consume" ${pn.consume ? 'checked' : ''}> Consumir (remove do inventário)</label>
            <input type="text" data-role="note" maxlength="140" placeholder="Observação (opcional)" value="${escapeHtml(pn.note)}">
            <div class="inv-inline-actions">
              <button type="button" class="inv-mini-btn primary" data-act="ok">Confirmar uso</button>
              <button type="button" class="inv-mini-btn" data-act="cancel">Cancelar</button>
            </div>`;
          box.querySelector('[data-role="consume"]').addEventListener('change', e => { pn.consume = e.target.checked; });
        } else {
          box.innerHTML = `
            <p>Descartar remove o item do inventário de vez. A ação fica registrada.</p>
            <input type="text" data-role="note" maxlength="140" placeholder="Observação (opcional)" value="${escapeHtml(pn.note)}">
            <div class="inv-inline-actions">
              <button type="button" class="inv-mini-btn danger" data-act="ok">Confirmar descarte</button>
              <button type="button" class="inv-mini-btn" data-act="cancel">Cancelar</button>
            </div>`;
        }
        box.querySelector('[data-role="note"]').addEventListener('input', e => { pn.note = e.target.value.trim(); });
        box.querySelector('[data-act="cancel"]').addEventListener('click', () => { invUI.panel = null; renderInvDrawer(); });
        box.querySelector('[data-act="ok"]').addEventListener('click', () => {
          if(pn.type === 'use') doUse(hid, inv.uid, pn.consume, pn.note);
          else doDiscard(hid, inv.uid, pn.note);
        });
        row.appendChild(box);
      }
      list.appendChild(row);
    });
  }

  function renderTradePanel(){
    const box = document.getElementById('inv-trade-panel');
    const t = invUI.trade;
    if(!t){ box.innerHTML = ''; return; }
    const me = holderById(invUI.holderId);
    const others = holderList().filter(h => h.id !== invUI.holderId);
    if(!me || !others.length){
      box.innerHTML = '<div class="inv-empty">Não há outro token ou NPC no mapa para trocar.</div>';
      invUI.trade = null;
      return;
    }
    if(!t.otherId || !others.some(h => h.id === t.otherId)){ t.otherId = others[0].id; t.take = []; }
    const other = holderById(t.otherId);
    const mine = invItems(me.id), theirs = invItems(other.id);
    t.give = t.give.filter(u => mine.some(i => i.uid === u));
    t.take = t.take.filter(u => theirs.some(i => i.uid === u));
    const aAfter = mine.length - t.give.length + t.take.length;
    const bAfter = theirs.length + t.give.length - t.take.length;
    const over = aAfter > MAX_INV || bAfter > MAX_INV;
    const empty = !t.give.length && !t.take.length;
    const checks = (list, side, sel) => list.length
      ? list.map(i => `<label><input type="checkbox" data-side="${side}" value="${escapeHtml(i.uid)}" ${sel.includes(i.uid) ? 'checked' : ''}><span>${escapeHtml(i.name)}</span></label>`).join('')
      : '<div class="inv-item-util">Nenhum item.</div>';
    box.innerHTML = `
      <div class="inv-trade">
        <select data-role="other">${holderOptionsHtml(others, true)}</select>
        <div class="inv-trade-cols">
          <div class="inv-trade-col"><h4>Você entrega (${escapeHtml(me.name)})</h4>${checks(mine, 'give', t.give)}</div>
          <div class="inv-trade-col"><h4>Você recebe (${escapeHtml(other.name)})</h4>${checks(theirs, 'take', t.take)}</div>
        </div>
        <div class="inv-trade-preview">
          ${escapeHtml(me.name)}: ${fmtCount(aAfter)} · ${escapeHtml(other.name)}: ${fmtCount(bAfter)}
          ${over ? `<br><span class="bad">A troca excede o limite de ${MAX_INV} itens.</span>` : ''}
        </div>
        <input type="text" data-role="note" maxlength="140" placeholder="Observação (opcional)" value="${escapeHtml(t.note || '')}">
        <div class="inv-inline-actions">
          <button type="button" class="inv-mini-btn primary" data-act="ok" ${(over || empty) ? 'disabled' : ''}>Confirmar troca</button>
          <button type="button" class="inv-mini-btn" data-act="cancel">Cancelar</button>
        </div>
      </div>`;
    const sel = box.querySelector('[data-role="other"]');
    sel.value = t.otherId;
    sel.addEventListener('change', () => { t.otherId = sel.value; t.take = []; renderInvDrawer(); });
    box.querySelectorAll('input[type=checkbox]').forEach(cb => cb.addEventListener('change', () => {
      const arr = cb.dataset.side === 'give' ? t.give : t.take;
      const idx = arr.indexOf(cb.value);
      if(cb.checked && idx < 0) arr.push(cb.value);
      if(!cb.checked && idx >= 0) arr.splice(idx, 1);
      renderInvDrawer();
    }));
    box.querySelector('[data-role="note"]').addEventListener('input', e => { t.note = e.target.value.trim(); });
    box.querySelector('[data-act="cancel"]').addEventListener('click', () => { invUI.trade = null; renderInvDrawer(); });
    box.querySelector('[data-act="ok"]').addEventListener('click', doTrade);
  }

  // ---------- registro (visualização) ----------
  function fmtTs(ts){
    if(!ts) return '';
    try{ return new Date(ts).toLocaleString('pt-BR', { dateStyle:'short', timeStyle:'short' }); }
    catch(e){ return ''; }
  }
  function namesOf(arr){ return (arr || []).map(i => `"${i.name}"`).join(', ') || 'nada'; }
  function logText(e){
    const who = escapeHtml(e.holderName || 'Sobrevivente desconhecido');
    const it = e.item ? `"${escapeHtml(e.item.name)}"` : '';
    const src = SOURCE_LABELS[e.source] || e.source || '';
    switch(e.action){
      case 'saque': return `${who} encontrou ${it}${e.locName ? ' em ' + escapeHtml(e.locName) : ''}${e.coord ? ' (📍 ' + escapeHtml(e.coord) + ')' : ''}${e.pinTitle ? ' · local: ' + escapeHtml(e.pinTitle) : ''}`;
      case 'guardar': return `${who} guardou ${it} no inventário (${escapeHtml(src)}) · ${e.invAfter != null ? fmtCount(e.invAfter) : ''}`;
      case 'recusar': return `${who} não manteve ${it}${e.reason ? ' (' + escapeHtml(e.reason) + ')' : ''}`;
      case 'adicionar': return `${who} recebeu ${it} direto da tabela de itens · ${e.invAfter != null ? fmtCount(e.invAfter) : ''}`;
      case 'usar': return `${who} usou ${it} · ${e.consumed ? 'consumido' : 'mantido no inventário'}`;
      case 'descartar': return `${who} descartou ${it}`;
      case 'troca': return `${who} ⇄ ${escapeHtml(e.counterpartName || '?')}: entregou ${escapeHtml(namesOf(e.gave))} · recebeu ${escapeHtml(namesOf(e.got))}`;
      case 'craft': return `${who} ${e.outcome === 'sucesso' ? 'fabricou' : 'tentou fabricar'} "${escapeHtml(e.recipe || '?')}"${e.outcome === 'sucesso' ? '' : ' e falhou'} · usou: ${escapeHtml(namesOf(e.used))}${e.made && e.made.length ? ' · obteve: ' + escapeHtml(namesOf(e.made)) : ''}`;
      case 'inv_removido': return `Inventário de ${who} removido${e.reason ? ' (' + escapeHtml(e.reason) + ')' : ''}: ${escapeHtml(namesOf(e.items))}`;
      default: return who;
    }
  }
  function logMatches(e){
    if(invUI.logAction && e.action !== invUI.logAction) return false;
    if(invUI.logHolder && e.holderId !== invUI.logHolder && e.counterpartId !== invUI.logHolder) return false;
    return true;
  }
  function renderInvLog(){
    const hsel = document.getElementById('inv-log-holder');
    const asel = document.getElementById('inv-log-action');
    const names = {};
    lootLog.forEach(e => {
      if(e.holderId) names[e.holderId] = e.holderName;
      if(e.counterpartId) names[e.counterpartId] = e.counterpartName;
    });
    hsel.innerHTML = '<option value="">Todos os personagens</option>' +
      Object.keys(names).map(id => `<option value="${escapeHtml(id)}">${escapeHtml(names[id] || '?')}</option>`).join('');
    hsel.value = invUI.logHolder;
    asel.innerHTML = '<option value="">Todas as ações</option>' +
      Object.keys(ACTION_LABELS).map(k => `<option value="${k}">${ACTION_LABELS[k]}</option>`).join('');
    asel.value = invUI.logAction;
    const rows = lootLog.filter(logMatches).sort((a, b) => (b.ts || 0) - (a.ts || 0) || String(b.id).localeCompare(String(a.id)));
    const box = document.getElementById('inv-log-list');
    if(!rows.length){ box.innerHTML = '<div class="inv-empty">Nenhuma transação registrada.</div>'; return; }
    box.innerHTML = rows.slice(0, 200).map(e => `
      <div class="log-row">
        <div class="log-meta">
          <span class="log-badge ${escapeHtml(e.action)}">${escapeHtml(ACTION_LABELS[e.action] || e.action)}</span>
          <span>${escapeHtml(fmtTs(e.ts))}</span>
          <span>por ${escapeHtml(e.actorName || '?')}</span>
        </div>
        <div>${logText(e)}</div>
        ${e.note ? `<div class="log-note">“${escapeHtml(e.note)}”</div>` : ''}
      </div>`).join('') +
      (rows.length > 200 ? `<div class="inv-log-note" style="margin-top:0.6rem;">Mostrando as 200 mais recentes de ${rows.length}. O CSV exporta todas as filtradas.</div>` : '');
  }
  function exportLogCsv(){
    const q = v => '"' + String(v == null ? '' : v).replace(/"/g, '""') + '"';
    const rows = [['data','acao','personagem','tipo','contraparte','item_ou_entregue','recebido','origem','local','coordenada','consumido','por','observacao','motivo']];
    lootLog.filter(logMatches).sort((a, b) => (a.ts || 0) - (b.ts || 0)).forEach(e => {
      rows.push([
        e.ts ? new Date(e.ts).toISOString() : '', e.action, e.holderName, e.holderType, e.counterpartName,
        e.action === 'craft' ? (e.used || []).map(i => i.name).join(' | ') : e.action === 'troca' ? (e.gave || []).map(i => i.name).join(' | ') : (e.action === 'inv_removido' ? (e.items || []).map(i => i.name).join(' | ') : (e.item ? e.item.name : '')),
        (e.action === 'craft' ? (e.made || []) : (e.got || [])).map(i => i.name).join(' | '),
        e.source, e.locName, e.coord, e.consumed == null ? '' : (e.consumed ? 'sim' : 'não'), e.actorName, e.note, e.reason
      ]);
    });
    const csv = '\ufeff' + rows.map(r => r.map(q).join(',')).join('\r\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type:'text/csv;charset=utf-8' }));
    a.download = 'registro-inventario.csv';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }

  // ---------- ligações com o resto da interface ----------
  function refreshAddDest(){
    if(!invReady) return;
    const prev = itemAddDest.value, hl = holderList();
    itemAddDest.innerHTML = hl.length ? holderOptionsHtml(hl, true) : '<option value="">Nenhum token ou NPC no mapa</option>';
    itemAddDest.value = (prev && hl.some(h => h.id === prev)) ? prev : (charSelect.value || (hl[0] || {}).id || '');
  }
  function updateSaqueInvCount(){
    if(!invReady) return;
    const t = selectedToken();
    document.getElementById('saque-inv-count').textContent = t ? `Inventário: ${capTxt(t.id)}` : 'Inventário: escolha um personagem';
  }
  // chamado quando tokens/NPCs mudam (renderNavList): só reage se nomes/ids mudaram
  function invHoldersChanged(){
    if(!invReady) return;
    const sig = holderList().map(h => h.id + ':' + h.name).join('|');
    if(sig === lastHolderSig) return;
    lastHolderSig = sig;
    refreshAddDest(); updateSaqueInvCount();
    if(invDrawer.classList.contains('open')) renderInvDrawer();
  }
  function onInvChanged(){
    if(!invReady) return;
    if(invDrawer.classList.contains('open')) renderInvDrawer();
    renderLootResults(); renderFishResults();
    refreshAddDest(); updateSaqueInvCount();
  }

  document.getElementById('inv-toggle-btn').addEventListener('click', () => {
    invDrawer.classList.contains('open') ? closeInventory() : openInventory(null);
  });
  document.getElementById('saque-open-inv').addEventListener('click', () => openInventory(charSelect.value || null));
  document.getElementById('inv-drawer-close-btn').addEventListener('click', closeInventory);
  invBackdrop.addEventListener('click', closeInventory);
  document.getElementById('inv-holder-select').addEventListener('change', e => {
    invUI.holderId = e.target.value || null; invUI.trade = null; invUI.panel = null; renderInvDrawer();
  });
  document.getElementById('inv-trade-open').addEventListener('click', () => {
    invUI.trade = { otherId:null, give:[], take:[], note:'' }; invUI.panel = null; renderInvDrawer();
  });
  invDrawer.querySelectorAll('.inv-tab').forEach(b => b.addEventListener('click', () => setInvTab(b.dataset.tab)));
  document.getElementById('inv-log-holder').addEventListener('change', e => { invUI.logHolder = e.target.value; renderInvLog(); });
  document.getElementById('inv-log-action').addEventListener('change', e => { invUI.logAction = e.target.value; renderInvLog(); });
  document.getElementById('inv-log-export').addEventListener('click', exportLogCsv);
  charSelect.addEventListener('change', () => {
    if(charSelect.value) itemAddDest.value = charSelect.value;
    updateSaqueInvCount();
  });
  // botão "＋ Inventário" da tabela completa de itens
  itemTbody.addEventListener('click', e => {
    const b = e.target.closest('.inv-add-btn');
    if(!b) return;
    const item = ITEMS_BY_ID[b.dataset.id];
    if(item) addItemTo(itemAddDest.value, item, 'tabela', 'adicionar');
  });

  async function initInventorySync(){
    if(firebaseReady){
      listen(fbRefOf(KEY_INV), snap => {
        inventories = snap.val() || {};
        saveLocal(KEY_INV, inventories);
        onInvChanged();
      }, err => console.error('Erro de sincronização (inventários)', err));
      listen(fbRefOf(KEY_LOG).limitToLast(500), snap => {
        const arr = [];
        snap.forEach(c => { arr.push(c.val()); });
        lootLog = arr;
        onInvChanged();
      }, err => console.error('Erro de sincronização (registro)', err));
    } else {
      const [inv, lg] = await Promise.all([loadKey(KEY_INV), loadKey(KEY_LOG)]);
      inventories = (inv && !Array.isArray(inv)) ? inv : {};
      lootLog = Array.isArray(lg) ? lg : [];
      onInvChanged();
    }
  }

  // ================= CAMPANHAS · SESSÕES · DADOS · FICHA · MUNDO · OFÍCIO =================
  const DIE_SIDES = [4, 6, 8, 10, 12, 20, 100];
  const NEED_LIST = [['fome','Fome'],['sede','Sede'],['fadiga','Fadiga'],['exposicao','Exposição'],['estresse','Estresse'],['ferimentos','Ferimentos']];
  const NEED_LEVELS = ['Sem marca','▲ Leve','▲▲ Moderado','▲▲▲ Grave','✖ Crítico'];
  const EXPLORE_STATES = [['desconhecido','❔ Desconhecido'],['conhecido','📍 Conhecido'],['explorado','✔ Explorado'],['esgotado','⛔ Esgotado'],['ameaca','⚠ Sob ameaça'],['bloqueado','🚧 Bloqueado'],['seguro','🛡 Seguro']];
  const CRAFT_FAMILIES = [['primeiros-socorros','Primeiros socorros'],['sobrevivencia','Sobrevivência'],['reparo','Reparo']];
  const DEFAULT_MODULES = { card:true, clock:false, needs:false, explore:false, crafting:false };
  const DEFAULT_CARD_MODULES = { identity:true, skills:true, notes:true, equip:true };

  let campaigns = {};
  let campaignMeta = null;
  let sessions = {};
  let characters = {};
  let rolls = {};
  let recipes = {};
  let clock = null;
  let campShortcuts = {};
  let personalShortcuts = {};
  let personalSubUid = '__none__';
  let personalOff = null;
  let legacyBooted = false;

  const hubDrawer = document.getElementById('hub-drawer');
  const hubBackdrop = document.getElementById('hub-drawer-backdrop');
  const hubBody = document.getElementById('hub-body');
  const hub = {
    tab:'dados', charToken:null, craftHolder:null,
    newCampaign:{ name:'', system:'', mode:'vazia', source:'legacy', copyTokens:true, copyInv:false, copyChars:false, copyRecipes:true, copyWeather:false },
    sessionForm:{ title:'', date:'', present:[], extra:'' },
    cfgDraft:null, recipeForm:null, joinCode:'', craftMsg:''
  };
  const rollUI = { counts:{ 20:1 }, expr:'', skill:'', bonuses:[], who:'', physical:false, phys:'', note:'', record:true, last:null, scName:'', scScope:'personal' };
  let hubDirty = false;

  // ---------- configuração da campanha ativa ----------
  function catKey(c){ return String(c).replace(/[.#$\/\[\]]/g, '_'); }
  function cfg(){
    const c = (campaignMeta && campaignMeta.config) || {};
    return {
      invMode: ['slots','carga','livre'].includes(c.invMode) ? c.invMode : 'slots',
      invLimit: Math.max(1, parseInt(c.invLimit, 10) || 20),
      decimals: Number.isInteger(c.decimals) ? Math.min(6, Math.max(0, c.decimals)) : 4,
      weights: c.weights || {},
      modules: Object.assign({}, DEFAULT_MODULES, c.modules || {}),
      cardModules: Object.assign({}, DEFAULT_CARD_MODULES, c.cardModules || {})
    };
  }
  function applyConfig(){
    const c = cfg();
    MAX_INV = c.invMode === 'slots' ? c.invLimit : Infinity;
    const sel = document.getElementById('loot-pin-row');
    if(sel) sel.style.display = c.modules.explore ? '' : 'none';
    refreshLootPins();
  }
  function itemWeight(inv){ const w = cfg().weights[catKey(inv.category)]; return typeof w === 'number' ? w : 1; }
  function invWeight(hid){ return invItems(hid).reduce((a, i) => a + itemWeight(i), 0); }
  function fmtNum(n){ return String(Math.round(n * 100) / 100).replace('.', ','); }
  function weightBand(w, cap){ const r = w / cap; return r <= 0.5 ? 'leve' : (r <= 1 ? 'carregado' : '⚠ sobrecarregado'); }
  function capTxt(hid){
    const c = cfg(), n = invCount(hid);
    if(c.invMode === 'slots') return `${n}/${MAX_INV}`;
    if(c.invMode === 'livre') return `${n} itens`;
    const w = invWeight(hid);
    return `${n} itens · carga ${fmtNum(w)}/${c.invLimit} (${weightBand(w, c.invLimit)})`;
  }
  function fmtCount(n){ return cfg().invMode === 'slots' ? `${n}/${MAX_INV}` : `${n} itens`; }

  // ---------- papéis ----------
  function isMaster(){
    if(!firebaseReady || !campaignMeta || !campaignMeta.masterId) return true;
    return !!currentUser && campaignMeta.masterId === currentUser.uid;
  }
  function isUnclaimed(){ return !!campaignMeta && !campaignMeta.masterId; }
  function canEditHolder(h){
    if(!h) return false;
    if(isMaster()) return true;
    if(h.type !== 'token') return false;
    const t = tokens.find(x => x.id === h.id);
    return !!t && (!t.ownerId || (currentUser && t.ownerId === currentUser.uid));
  }
  function memberOf(m){
    const u = currentUser && currentUser.uid;
    return !!(u && ((m.members && m.members[u]) || m.masterId === u));
  }
  function visibleCampaigns(){
    return Object.keys(campaigns).map(k => campaigns[k]).filter(m => m && (m.id === 'legacy' || !firebaseReady || memberOf(m)))
      .sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
  }
  function newCode(){
    const abc = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let s = ''; for(let i = 0; i < 6; i++) s += abc[Math.floor(Math.random() * abc.length)];
    return s;
  }
  function todayStr(){ const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }

  // ---------- ligar/desligar tudo de uma campanha ----------
  function resetCampaignState(){
    pins = []; tokens = []; shapes = []; routes = [];
    weather = { state:'calmo', updatedAt:null, updatedBy:null };
    inventories = {}; lootLog = []; characters = {}; rolls = {}; recipes = {}; clock = null; campShortcuts = {}; sessions = {};
    lootHistory = []; fishHistory = [];
    renderPins(); renderTokens(); renderShapes(); renderRoutes(); applyWeatherVisual();
    renderLootResults(); renderFishResults();
  }
  function attachModuleSync(){
    const on = (key, cb, limit) => syncOff.push(DB.on(scopedKey(key), cb, limit));
    on(KEY_CHARS, v => { characters = v || {}; hubChanged(); });
    on(KEY_ROLLS, v => { rolls = v || {}; hubChanged(); }, 300);
    on(KEY_RECIPES, v => { recipes = v || {}; hubChanged(); });
    on(KEY_CLOCK, v => { clock = v; updateHud(); hubChanged(); });
    on(KEY_SHORTCUTS, v => { campShortcuts = v || {}; hubChanged(); });
    syncOff.push(DB.on('campaign-sessions/' + activeCampaignId, v => { sessions = v || {}; updateHud(); hubChanged(); }));
  }
  function activateCampaign(id){
    detachSync();
    activeCampaignId = id;
    try{ localStorage.setItem('tv-map:active-campaign', id); }catch(e){}
    document.getElementById('map-loading').style.display = '';
    resetCampaignState();
    campaignMeta = campaigns[id] || null;
    applyConfig();
    attachMapSync();
    initInventorySync();
    attachModuleSync();
    updateHud(); onInvChanged(); renderHub();
  }
  function bootstrapLegacy(){
    if(legacyBooted) return;
    legacyBooted = true;
    const ts = DB.ts();
    DB.update({
      'campaign-meta/legacy': { id:'legacy', name:'Campanha atual', system:'Ordem Paranormal — Sobrevivendo ao Horror (adaptado)',
        masterId:null, masterName:null, createdAt:ts, archived:false, joinCode:newCode(), activeSessionId:'inaugural',
        note:'Criada a partir dos dados que já existiam. Nada foi movido.' },
      'campaign-sessions/legacy/inaugural': { id:'inaugural', title:'Sessão inaugural', date:todayStr(), present:[], summary:'', createdAt:ts, closed:false }
    });
  }
  function startMetaSync(){
    DB.on('campaign-meta', v => {
      campaigns = v || {};
      if(!campaigns.legacy) bootstrapLegacy();
      const m = campaigns[activeCampaignId];
      if(!m && activeCampaignId !== 'legacy' && campaigns.legacy){ activateCampaign('legacy'); return; }
      campaignMeta = m || null;
      applyConfig(); updateHud(); onInvChanged(); hubChanged();
    });
  }

  // ---------- campanhas: criar, trocar, arquivar, excluir ----------
  async function createCampaign(f){
    if(!isMaster()){ toast('Só o mestre cria campanhas.', true); return; }
    if(firebaseReady && !currentUser){ toast('Entre com sua conta para criar uma campanha.', true); return; }
    const name = (f.name || '').trim();
    if(!name){ toast('Dê um nome à campanha.', true); return; }
    const id = 'c' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
    const a = actorFields();
    const src = campaigns[f.source] || null;
    const meta = { id, name, system:(f.system || '').trim(), masterId:a.actorId, masterName:a.actorName, createdAt:DB.ts(),
      archived:false, joinCode:newCode(), activeSessionId:'s1' };
    if(a.actorId) meta.members = { [a.actorId]: { name:a.actorName, role:'master' } };
    if(f.mode === 'duplicar' && src && src.config) meta.config = JSON.parse(JSON.stringify(src.config));
    if(f.mode === 'modelo' || f.mode === 'duplicar'){
      const keys = [KEY_PINS, KEY_SHAPES, KEY_ROUTES];
      if(f.mode === 'duplicar'){
        if(f.copyTokens) keys.push(KEY_TOKENS);
        if(f.copyInv) keys.push(KEY_INV);
        if(f.copyChars) keys.push(KEY_CHARS);
        if(f.copyRecipes) keys.push(KEY_RECIPES);
        if(f.copyWeather) keys.push(KEY_WEATHER);
      }
      for(const k of keys){
        let v = await readScoped(f.source, k);
        if(v == null) continue;
        if(f.mode === 'modelo' && k === KEY_PINS && Array.isArray(v)) v = v.map(p => { const c = Object.assign({}, p); delete c.explore; return c; });
        await writeScoped(id, k, v);
      }
    }
    await DB.update({
      ['campaign-meta/' + id]: meta,
      ['campaign-sessions/' + id + '/s1']: { id:'s1', title:'Sessão 1', date:todayStr(), present:[], summary:'', createdAt:DB.ts(), closed:false }
    });
    hub.newCampaign.name = ''; hub.newCampaign.system = '';
    renderHub();
    if(window.confirm(`Campanha "${name}" criada. Abrir agora? (a campanha atual é salva e continua intacta)`)) activateCampaign(id);
  }
  function switchCampaign(id){
    if(id === activeCampaignId) return;
    const m = campaigns[id]; if(!m) return;
    if(!window.confirm(`Trocar para a campanha "${m.name}"? Mapa, tokens, inventários e registros passam a ser os dela. A campanha atual fica salva.`)) return;
    activateCampaign(id);
  }
  async function setArchived(id, v){
    if(!isMaster()){ toast('Só o mestre arquiva campanhas.', true); return; }
    if(id === activeCampaignId && v){ toast('Troque de campanha antes de arquivar esta.', true); return; }
    await DB.set('campaign-meta/' + id + '/archived', v ? true : null);
  }
  async function deleteCampaign(id){
    const m = campaigns[id];
    if(!m || id === 'legacy'){ toast('A campanha original não pode ser excluída.', true); return; }
    if(id === activeCampaignId){ toast('Troque de campanha antes de excluir esta.', true); return; }
    if(!isMasterOf(m)){ toast('Só o mestre da campanha exclui.', true); return; }
    const typed = window.prompt(`Excluir "${m.name}" apaga mapa, tokens, inventários, fichas e registros dela, sem volta.\nDigite o nome da campanha para confirmar:`);
    if(typed == null || typed.trim() !== m.name){ if(typed != null) toast('Nome diferente. Nada foi apagado.', true); return; }
    for(const k of SCOPED_KEYS){ await writeScoped(id, k, null); }
    await DB.update({ ['campaign-meta/' + id]: null, ['campaign-sessions/' + id]: null });
    toast('Campanha excluída.');
  }
  function isMasterOf(m){ return !firebaseReady || !m.masterId || (!!currentUser && m.masterId === currentUser.uid); }
  async function joinCampaign(code){
    code = String(code || '').trim().toUpperCase();
    if(!firebaseReady){ toast('Sem Firebase, todas as campanhas deste navegador já aparecem na lista.'); return; }
    if(!currentUser){ toast('Entre com sua conta para usar um código.', true); return; }
    const m = Object.keys(campaigns).map(k => campaigns[k]).find(x => x && x.joinCode === code);
    if(!m){ toast('Código não encontrado.', true); return; }
    await DB.set(`campaign-meta/${m.id}/members/${currentUser.uid}`, { name:actorFields().actorName, role:'player' });
    hub.joinCode = '';
    toast(`Você entrou em "${m.name}".`);
  }
  async function claimMaster(){
    if(!currentUser){ toast('Entre com sua conta para assumir como mestre.', true); return; }
    if(!isUnclaimed()){ return; }
    const a = actorFields();
    await DB.update({
      [`campaign-meta/${activeCampaignId}/masterId`]: a.actorId,
      [`campaign-meta/${activeCampaignId}/masterName`]: a.actorName,
      [`campaign-meta/${activeCampaignId}/members/${a.actorId}`]: { name:a.actorName, role:'master' }
    });
    toast('Você agora é o mestre desta campanha.');
  }
  async function saveConfig(){
    if(!isMaster()){ toast('Só o mestre altera a configuração.', true); return; }
    const d = hub.cfgDraft; if(!d) return;
    const weights = {};
    Object.keys(d.weights || {}).forEach(k => { const n = Number(d.weights[k]); if(!isNaN(n) && n >= 0 && n !== 1) weights[k] = n; });
    const config = {
      invMode:d.invMode, invLimit:Math.max(1, parseInt(d.invLimit, 10) || 20),
      decimals:Math.min(6, Math.max(0, parseInt(d.decimals, 10) || 0)),
      weights, modules:d.modules, cardModules:d.cardModules
    };
    await DB.update({
      [`campaign-meta/${activeCampaignId}/name`]: (d.name || '').trim() || 'Campanha',
      [`campaign-meta/${activeCampaignId}/system`]: (d.system || '').trim(),
      [`campaign-meta/${activeCampaignId}/config`]: config
    });
    toast('Configuração salva.');
    hub.cfgDraft = null; renderHub();
  }

  // ---------- sessões ----------
  function activeSession(){ return campaignMeta && campaignMeta.activeSessionId ? (sessions[campaignMeta.activeSessionId] || null) : null; }
  function candidateNames(){
    const set = new Set();
    if(campaignMeta && campaignMeta.members) Object.keys(campaignMeta.members).forEach(u => set.add(campaignMeta.members[u].name));
    tokens.forEach(t => { if(t.ownerName) set.add(t.ownerName); });
    return Array.from(set).filter(Boolean);
  }
  async function newSession(){
    if(!isMaster()){ toast('Só o mestre abre sessões.', true); return; }
    const f = hub.sessionForm;
    const title = (f.title || '').trim() || ('Sessão ' + (Object.keys(sessions).length + 1));
    const present = f.present.slice();
    (f.extra || '').split(',').map(s => s.trim()).filter(Boolean).forEach(n => { if(!present.includes(n)) present.push(n); });
    const id = DB.newId('campaign-sessions/' + activeCampaignId);
    const upd = {
      [`campaign-sessions/${activeCampaignId}/${id}`]: { id, title, date:f.date || todayStr(), present, summary:'', createdAt:DB.ts(), closed:false },
      [`campaign-meta/${activeCampaignId}/activeSessionId`]: id
    };
    const prev = activeSession();
    if(prev && !prev.closed) upd[`campaign-sessions/${activeCampaignId}/${prev.id}/closed`] = true;
    await DB.update(upd);
    hub.sessionForm = { title:'', date:'', present:[], extra:'' };
    toast('Nova sessão aberta. O mundo continua o mesmo.');
    renderHub();
  }
  async function saveSummary(text){
    const s = activeSession(); if(!s) return;
    if(!isMaster()){ toast('Só o mestre edita o resumo.', true); return; }
    await DB.set(`campaign-sessions/${activeCampaignId}/${s.id}/summary`, text || null);
    toast('Resumo salvo.');
  }
  async function closeSession(){
    const s = activeSession(); if(!s || !isMaster()) return;
    await DB.set(`campaign-sessions/${activeCampaignId}/${s.id}/closed`, true);
  }

  // ---------- faixa de status (HUD) ----------
  function clockText(){
    if(!clock || typeof clock.minutes !== 'number') return '';
    const m = clock.minutes, day = (clock.day || 1);
    return `Dia ${day} · ${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
  }
  function updateHud(){
    const chip = document.getElementById('campaign-chip');
    if(!chip) return;
    const s = activeSession();
    const parts = [campaignMeta ? campaignMeta.name + (campaignMeta.archived ? ' (arquivada)' : '') : 'Campanha', s ? s.title : 'sem sessão'];
    if(cfg().modules.clock && clockText()) parts.push(clockText());
    chip.textContent = '📖 ' + parts.join(' · ');
    chip.setAttribute('aria-label', 'Campanha ativa: ' + parts.join(', ') + '. Abrir campanhas e sessões.');
  }

  // ---------- roller ----------
  function rollDie(sides){
    const c = (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) ? window.crypto : null;
    if(!c) return 1 + Math.floor(Math.random() * sides);
    const lim = Math.floor(0x100000000 / sides) * sides;
    const a = new Uint32Array(1);
    do{ c.getRandomValues(a); }while(a[0] >= lim);
    return 1 + (a[0] % sides);
  }
  function parseExpr(str){
    const s = String(str || '').replace(/\s+/g, '').toLowerCase();
    if(!s) return { error:'Escreva uma expressão, ex.: 2d6+1d8+3.' };
    const re = /([+-]?)(\d*)d(\d+)|([+-]?\d+)/y;
    const counts = {}; let bonus = 0, i = 0;
    while(i < s.length){
      re.lastIndex = i;
      const m = re.exec(s);
      if(!m || m.index !== i) return { error:'Não entendi a expressão. Exemplo: 2d6+1d8+3.' };
      if(m[3]){
        if(m[1] === '-') return { error:'Dados negativos não são aceitos; use um bônus negativo.' };
        const n = m[2] === '' ? 1 : +m[2], sd = +m[3];
        if(!DIE_SIDES.includes(sd)) return { error:'Dados aceitos: ' + DIE_SIDES.map(d => 'd' + d).join(', ') + '.' };
        if(n < 1 || n > 50) return { error:'Use de 1 a 50 dados de cada tipo.' };
        counts[sd] = (counts[sd] || 0) + n;
      } else bonus += +m[4];
      i = re.lastIndex;
    }
    return { counts, bonus };
  }
  function applyExpr(){
    const r = parseExpr(rollUI.expr);
    if(r.error){ toast(r.error, true); return false; }
    rollUI.counts = r.counts;
    rollUI.bonuses = rollUI.bonuses.filter(b => b.label !== 'expressão');
    if(r.bonus) rollUI.bonuses.push({ label:'expressão', value:r.bonus });
    return true;
  }
  function poolOf(counts){ return DIE_SIDES.filter(s => (counts[s] || 0) > 0).map(s => ({ sides:s, n:counts[s] })); }
  function fmtGroups(groups){ return groups.map(g => `${g.values.length > 1 ? g.values.length : ''}d${g.sides} [${g.values.join(', ')}]`).join(' + '); }
  function fmtBonuses(bs){ return (bs || []).map(b => `${b.value >= 0 ? '+' : '−'}${Math.abs(b.value)}${b.label ? ' (' + b.label + ')' : ''}`).join(' '); }
  async function doRoll(){
    const pool = poolOf(rollUI.counts);
    if(!pool.length){ toast('Adicione ao menos um dado.', true); return; }
    let groups;
    if(rollUI.physical){
      const nums = (String(rollUI.phys).match(/-?\d+/g) || []).map(Number);
      const need = pool.reduce((a, p) => a + p.n, 0);
      if(nums.length !== need){ toast(`Informe ${need} resultado(s) dos dados físicos, na ordem dos dados.`, true); return; }
      let i = 0;
      groups = pool.map(p => ({ sides:p.sides, values:nums.slice(i, i += p.n) }));
      if(groups.some(g => g.values.some(v => v < 1 || v > g.sides))){ toast('Algum resultado está fora do alcance do dado.', true); return; }
    } else {
      groups = pool.map(p => ({ sides:p.sides, values:Array.from({ length:p.n }, () => rollDie(p.sides)) }));
    }
    const bonuses = rollUI.bonuses.map(b => ({ label:(b.label || '').trim(), value:Number(b.value) })).filter(b => !isNaN(b.value) && b.value !== 0);
    const diceSum = groups.reduce((a, g) => a + g.values.reduce((x, y) => x + y, 0), 0);
    const bonusSum = bonuses.reduce((a, b) => a + b.value, 0);
    const holder = holderById(rollUI.who);
    const a = actorFields();
    const rec = { skill:(rollUI.skill || '').trim(), groups, diceSum, bonuses, bonusSum, total:diceSum + bonusSum,
      note:(rollUI.note || '').trim(), physical:!!rollUI.physical, tokenId:holder ? holder.id : null,
      whoName:holder ? holder.name : a.actorName, actorId:a.actorId, actorName:a.actorName,
      sessionId:(campaignMeta && campaignMeta.activeSessionId) || null };
    rollUI.last = Object.assign({ ts:Date.now() }, rec);
    if(rollUI.record){
      const path = scopedKey(KEY_ROLLS);
      const id = DB.newId(path);
      await DB.set(path + '/' + id, Object.assign({ id, ts:DB.ts() }, JSON.parse(JSON.stringify(rec))));
    }
    renderHub();
  }
  function rollText(r){
    return `${r.whoName || ''}${r.skill ? ' — ' + r.skill : ''}: ${fmtGroups(r.groups || [])}${r.bonuses && r.bonuses.length ? ' ' + fmtBonuses(r.bonuses) : ''} = ${r.total}${r.note ? ' (' + r.note + ')' : ''}${r.physical ? ' [dados físicos]' : ''}`;
  }
  function copyText(t){
    try{ if(navigator.clipboard && navigator.clipboard.writeText){ navigator.clipboard.writeText(t); toast('Copiado.'); return; } }catch(e){}
    toast('Não foi possível copiar neste navegador.', true);
  }
  function ensurePersonalSub(){
    const uid = currentUser ? currentUser.uid : 'local';
    if(uid === personalSubUid) return;
    personalSubUid = uid;
    if(personalOff) personalOff();
    personalOff = DB.on('user-shortcuts/' + uid, v => { personalShortcuts = v || {}; hubChanged(); });
  }
  function allShortcuts(){
    const out = [];
    Object.keys(personalShortcuts).forEach(k => out.push(Object.assign({ scope:'personal' }, personalShortcuts[k])));
    const card = rollUI.who ? characters[rollUI.who] : null;
    if(card && card.shortcuts) Object.keys(card.shortcuts).forEach(k => out.push(Object.assign({ scope:'character' }, card.shortcuts[k])));
    Object.keys(campShortcuts).forEach(k => out.push(Object.assign({ scope:'campaign' }, campShortcuts[k])));
    return out;
  }
  function scPath(sc){
    if(sc.scope === 'personal') return `user-shortcuts/${currentUser ? currentUser.uid : 'local'}/${sc.id}`;
    if(sc.scope === 'character') return `${scopedKey(KEY_CHARS)}/${rollUI.who}/shortcuts/${sc.id}`;
    return `${scopedKey(KEY_SHORTCUTS)}/${sc.id}`;
  }
  async function saveShortcut(){
    const pool = poolOf(rollUI.counts);
    const name = (rollUI.scName || '').trim();
    if(!name){ toast('Dê um nome ao atalho.', true); return; }
    if(!pool.length){ toast('Adicione ao menos um dado.', true); return; }
    const scope = rollUI.scScope;
    if(scope === 'character' && !rollUI.who){ toast('Escolha um personagem para salvar na ficha.', true); return; }
    if(scope === 'character' && !canEditHolder(holderById(rollUI.who))){ toast('Você não pode editar essa ficha.', true); return; }
    if(scope === 'campaign' && !isMaster()){ toast('Só o mestre salva atalhos da campanha.', true); return; }
    const sc = { id:DB.newId('user-shortcuts'), name, counts:rollUI.counts, skill:rollUI.skill || '', bonuses:rollUI.bonuses.map(b => ({ label:b.label || '', value:Number(b.value) || 0 })), scope };
    delete sc.scope;
    await DB.set(scPath(Object.assign({ scope }, sc)), sc);
    rollUI.scName = '';
    toast('Atalho salvo.');
  }
  function useShortcut(sc){
    rollUI.counts = Object.assign({}, sc.counts || {});
    rollUI.skill = sc.skill || '';
    rollUI.bonuses = (sc.bonuses || []).map(b => ({ label:b.label, value:b.value }));
    rollUI.physical = false;
  }

  // ---------- ficha leve ----------
  function ensureCard(tokenId){
    if(characters[tokenId]) return characters[tokenId];
    const h = holderById(tokenId);
    const t = tokens.find(x => x.id === tokenId);
    const card = { tokenId, name:h ? h.name : '', player:(t && t.ownerName) || '', notes:'', reminders:[], skills:[], needs:{} };
    characters[tokenId] = card;
    return card;
  }
  let cardTimer = null;
  function scheduleSaveCard(){
    clearTimeout(cardTimer);
    const id = hub.charToken;
    cardTimer = setTimeout(() => {
      const card = characters[id];
      if(card) DB.set(`${scopedKey(KEY_CHARS)}/${id}`, JSON.parse(JSON.stringify(card)));
    }, 450);
  }

  // ---------- mundo: relógio e exploração ----------
  async function advanceClock(min){
    if(!isMaster()){ toast('Só o mestre mexe no relógio.', true); return; }
    let m = (clock && typeof clock.minutes === 'number') ? clock.minutes : 8 * 60;
    let day = (clock && clock.day) || 1;
    m += min;
    while(m >= 1440){ m -= 1440; day++; }
    while(m < 0){ m += 1440; day = Math.max(1, day - 1); }
    await DB.set(scopedKey(KEY_CLOCK), { day, minutes:m, updatedBy:actorFields().actorName });
  }
  function pinExplore(p){ return Object.assign({ status:'desconhecido', clue:'', risk:'', reserve:null, lastLoot:'' }, p.explore || {}); }
  function setPinExplore(id, field, value){
    if(!isMaster()){ toast('Só o mestre altera o estado dos locais.', true); return; }
    const p = pins.find(x => x.id === id); if(!p) return;
    p.explore = Object.assign(pinExplore(p), { [field]: value }, { updatedBy:actorFields().actorName });
    saveKey(KEY_PINS, pins);
  }
  function refreshLootPins(){
    const sel = document.getElementById('loot-pin-select');
    if(!sel) return;
    const prev = sel.value;
    sel.innerHTML = '<option value="">— nenhum —</option>' + pins.filter(p => p.type !== 'npc').map(p => `<option value="${escapeHtml(p.id)}">${escapeHtml(p.title || 'Pin')}</option>`).join('');
    sel.value = pins.some(p => p.id === prev) ? prev : '';
  }
  function locFields(tok){
    const d = cfg().decimals;
    let pin = null;
    const sel = document.getElementById('loot-pin-select');
    if(cfg().modules.explore && sel && sel.value) pin = pins.find(p => p.id === sel.value) || null;
    const src = tok || pin;
    const base = { pinId:pin ? pin.id : null, pinTitle:pin ? (pin.title || 'Pin') : null };
    if(!src || src.lat == null || src.lng == null) return Object.assign({ coord:null, lat:null, lng:null }, base);
    return Object.assign({ coord:`${src.lat.toFixed(d)}, ${src.lng.toFixed(d)}`, lat:Number(src.lat.toFixed(d)), lng:Number(src.lng.toFixed(d)) }, base);
  }
  function exploreGate(lf){
    const pin = lf.pinId ? pins.find(p => p.id === lf.pinId) : null;
    if(pin && pin.explore && typeof pin.explore.reserve === 'number' && pin.explore.reserve <= 0){
      toast(`A reserva de "${pin.title || 'Pin'}" está esgotada.`, true);
      return false;
    }
    return true;
  }
  function explorePostRoll(entry){
    const pin = entry.pinId ? pins.find(p => p.id === entry.pinId) : null;
    if(!pin || !entry.item) return;
    const ex = pinExplore(pin);
    ex.lastLoot = entry.item.name;
    if(typeof ex.reserve === 'number'){ ex.reserve = Math.max(0, ex.reserve - 1); if(ex.reserve === 0) ex.status = 'esgotado'; }
    pin.explore = ex;
    saveKey(KEY_PINS, pins);
  }
  function coordHtml(e){
    if(e.lat == null) return e.coord ? `<div class="result-coord">📍 ${escapeHtml(e.coord)}</div>` : '<div class="result-coord">📍 sem localização</div>';
    return `<div class="result-coord">📍 Local aproximado: ${escapeHtml(e.coord)}
      <button type="button" class="coord-btn" data-coord-copy="${escapeHtml(e.coord)}">Copiar</button>
      <button type="button" class="coord-btn" data-coord-go="${e.lat},${e.lng}">Ver no mapa</button></div>`;
  }
  document.addEventListener('click', ev => {
    const c = ev.target.closest && ev.target.closest('[data-coord-copy]');
    if(c){ copyText(c.dataset.coordCopy); return; }
    const g = ev.target.closest && ev.target.closest('[data-coord-go]');
    if(g){ const [la, ln] = g.dataset.coordGo.split(',').map(Number); map.flyTo([la, ln], Math.max(map.getZoom(), 15)); }
  });

  // ---------- ofício (crafting) ----------
  function itemByName(n){
    const k = String(n || '').trim().toLowerCase();
    return ITEMS.find(i => i.name.toLowerCase() === k) || null;
  }
  function craftCheck(rec, hid){
    const have = {};
    invItems(hid).forEach(i => { (have[i.itemId] = have[i.itemId] || []).push(i); });
    const missing = [];
    (rec.ingredients || []).forEach(ing => {
      const n = (have[ing.itemId] || []).length;
      if(n < ing.qty) missing.push({ itemId:ing.itemId, need:ing.qty, have:n });
    });
    const toolOk = !rec.tool || (have[rec.tool] || []).length > 0;
    return { missing, toolOk, canCraft:!missing.length && toolOk, have };
  }
  async function craftDo(rec, hid, outcome){
    const holder = holderById(hid);
    if(!holder){ toast('Escolha quem fabrica.', true); return; }
    if(!canEditHolder(holder)){ toast('Você não pode usar o inventário de ' + holder.name + '.', true); return; }
    const chk = craftCheck(rec, hid);
    if(!chk.canCraft){ toast('Faltam materiais ou ferramenta.', true); return; }
    const used = [];
    const take = () => {
      const left = {};
      (rec.ingredients || []).forEach(ing => {
        const list = chk.have[ing.itemId].slice();
        for(let k = 0; k < ing.qty; k++){ const inst = list.shift(); used.push(inst); }
      });
      return left;
    };
    const ops = {};
    let made = [];
    const consume = outcome === 'sucesso' || !!rec.wasteOnFail;
    if(consume){ take(); used.forEach(i => { ops[hid + '/' + i.uid] = null; }); }
    if(outcome === 'sucesso'){
      const ref = ITEMS_BY_ID[rec.result.itemId];
      if(!ref){ toast('O item resultante não existe mais no catálogo.', true); return; }
      const qty = Math.max(1, rec.result.qty || 1);
      if(invCount(hid) - used.length + qty > MAX_INV){ toast('Sem espaço no inventário para o resultado.', true); return; }
      for(let k = 0; k < qty; k++){
        const inst = { uid:newUid('it'), itemId:ref.id, name:ref.name, category:ref.category, source:'craft', addedAt:Date.now(), addedBy:actorFields().actorName };
        ops[hid + '/' + inst.uid] = inst; made.push(inst);
      }
    }
    const ok = await commitInv(ops, [mkLog('craft', holder, {
      recipe:rec.name, outcome, used:used.map(itemRef), made:made.map(itemRef), source:'inventario',
      invAfter:invCount(hid) - used.length + made.length })]);
    if(ok){ hub.craftMsg = outcome === 'sucesso' ? `Fabricado: ${made.map(m => m.name).join(', ')}.` : (consume ? 'Falhou: os materiais foram perdidos.' : 'Falhou: nada foi consumido.'); renderHub(); }
  }
  function blankRecipe(){ return { id:null, name:'', family:'sobrevivencia', resultName:'', resultQty:1, ingredients:[{ name:'', qty:1 }], toolName:'', station:'', skill:'', time:'', noise:'', risk:'', resolution:'', wasteOnFail:false, notes:'' }; }
  async function saveRecipe(){
    if(!isMaster()){ toast('Só o mestre cria receitas.', true); return; }
    const f = hub.recipeForm; if(!f) return;
    const res = itemByName(f.resultName);
    if(!(f.name || '').trim()){ toast('Dê um nome à receita.', true); return; }
    if(!res){ toast('Escolha o item resultante pelo nome do catálogo.', true); return; }
    const merged = {};
    for(const ing of f.ingredients){
      if(!(ing.name || '').trim()) continue;
      const it = itemByName(ing.name);
      if(!it){ toast(`Ingrediente "${ing.name}" não está no catálogo.`, true); return; }
      merged[it.id] = (merged[it.id] || 0) + Math.max(1, parseInt(ing.qty, 10) || 1);
    }
    if(!Object.keys(merged).length){ toast('Adicione ao menos um ingrediente.', true); return; }
    let tool = null;
    if((f.toolName || '').trim()){ const t = itemByName(f.toolName); if(!t){ toast('Ferramenta não está no catálogo.', true); return; } tool = t.id; }
    const path = scopedKey(KEY_RECIPES);
    const id = f.id || DB.newId(path);
    const rec = { id, name:f.name.trim(), family:f.family, result:{ itemId:res.id, qty:Math.max(1, parseInt(f.resultQty, 10) || 1) },
      ingredients:Object.keys(merged).map(k => ({ itemId:+k, qty:merged[k] })), tool, station:f.station || '', skill:f.skill || '',
      time:f.time || '', noise:f.noise || '', risk:f.risk || '', resolution:f.resolution || '', wasteOnFail:!!f.wasteOnFail, notes:f.notes || '' };
    await DB.set(path + '/' + id, rec);
    hub.recipeForm = null; toast('Receita salva.'); renderHub();
  }
  function recipeToForm(r){
    const nm = id => (ITEMS_BY_ID[id] || {}).name || '';
    return { id:r.id, name:r.name, family:r.family, resultName:nm(r.result.itemId), resultQty:r.result.qty, ingredients:(r.ingredients || []).map(i => ({ name:nm(i.itemId), qty:i.qty })),
      toolName:r.tool ? nm(r.tool) : '', station:r.station || '', skill:r.skill || '', time:r.time || '', noise:r.noise || '', risk:r.risk || '', resolution:r.resolution || '', wasteOnFail:!!r.wasteOnFail, notes:r.notes || '' };
  }
  async function seedRecipes(){
    if(!isMaster()) return;
    const defs = [
      ['Tala improvisada','primeiros-socorros','Talas improvisadas (madeira + tecido)',[['Retalhos de tecido',1],['Tábua de madeira empenada',1]],''],
      ['Filtro de água improvisado','sobrevivencia','Filtro de água de rio improvisado',[['Garrafa de água mineral',1],['Carvão',1],['Retalhos de tecido',1]],''],
      ['Isqueiro de pederneira','reparo','Isqueiro de pederneira caseiro',[['Isqueiro sem gás',1]],''],
      ['Botas improvisadas','reparo','Botas improvisadas com panos e fita',[['Retalhos de tecido',2],['Fita adesiva',1]],'']
    ];
    const path = scopedKey(KEY_RECIPES); let n = 0;
    for(const d of defs){
      const res = itemByName(d[2]); const ings = d[3].map(x => [itemByName(x[0]), x[1]]);
      if(!res || ings.some(x => !x[0])) continue;
      const id = DB.newId(path);
      await DB.set(path + '/' + id, { id, name:d[0], family:d[1], result:{ itemId:res.id, qty:1 }, ingredients:ings.map(x => ({ itemId:x[0].id, qty:x[1] })),
        tool:null, station:'', skill:'', time:'', noise:'', risk:'', resolution:'Resolver na mesa (rolagem ou decisão do mestre).', wasteOnFail:false, notes:'Exemplo editável.' });
      n++;
    }
    toast(n ? `${n} receitas de exemplo adicionadas. Edite como quiser.` : 'Nenhum exemplo pôde ser montado com este catálogo.', !n);
  }

  // ---------- painel "Mesa de jogo" ----------
  const esc = escapeHtml;
  function hubTabs(){
    const c = cfg().modules;
    const t = [['dados','🎲 Dados'], ['ficha','📇 Ficha'], ['sessao','📖 Sessão'], ['campanhas','🗂 Campanhas']];
    if(c.clock || c.explore) t.push(['mundo','🌍 Mundo']);
    if(c.crafting) t.push(['oficio','🛠 Ofício']);
    return t;
  }
  function openHub(tab){
    closeDrawer(); closeNavDrawer(); closeInventory();
    if(tab) hub.tab = tab;
    if(!hubTabs().some(t => t[0] === hub.tab)) hub.tab = 'dados';
    ensurePersonalSub();
    renderHub();
    hubDrawer.classList.add('open'); hubBackdrop.classList.add('open');
  }
  function closeHub(){ hubDrawer.classList.remove('open'); hubBackdrop.classList.remove('open'); }
  function hubIsOpen(){ return hubDrawer.classList.contains('open'); }
  function hubChanged(){
    if(!invReady || !hubIsOpen()) return;
    const ae = document.activeElement;
    if(ae && hubBody.contains(ae) && /^(INPUT|TEXTAREA|SELECT)$/.test(ae.tagName)){ hubDirty = true; return; }
    renderHub();
  }
  function opt(v, label, sel){ return `<option value="${esc(v)}" ${String(sel) === String(v) ? 'selected' : ''}>${esc(label)}</option>`; }
  function holderSelect(bind, value, withNone){
    const hl = holderList();
    return `<select data-bind="${bind}" data-rerender>${withNone ? '<option value="">— sem personagem —</option>' : ''}${
      hl.map(h => opt(h.id, (h.type === 'npc' ? '👤 ' : '') + h.name, value)).join('')}</select>`;
  }
  function renderHub(){
    if(!hubBody) return;
    const tabs = hubTabs();
    if(!tabs.some(t => t[0] === hub.tab)) hub.tab = 'dados';
    const ses = activeSession();
    let html = `<div class="hub-context" role="status">📖 <b>${esc(campaignMeta ? campaignMeta.name : 'Campanha')}</b> · ${esc(ses ? ses.title : 'sem sessão')}${isMaster() ? ' · mestre' : ''}</div>`;
    html += '<div class="hub-tabs" role="tablist">' + tabs.map(t => `<button type="button" role="tab" aria-selected="${hub.tab === t[0]}" class="inv-tab${hub.tab === t[0] ? ' active' : ''}" data-act="tab" data-tab="${t[0]}">${t[1]}</button>`).join('') + '</div>';
    const fn = { dados:renderDados, ficha:renderFicha, sessao:renderSessao, campanhas:renderCampanhas, mundo:renderMundo, oficio:renderOficio }[hub.tab];
    html += fn();
    hubBody.innerHTML = html;
    hubDirty = false;
  }

  // --- dados ---
  function renderDados(){
    const who = holderById(rollUI.who) ? rollUI.who : '';
    rollUI.who = who;
    const dice = DIE_SIDES.map(s => `<div class="die"><span>d${s}</span>
      <button type="button" class="die-btn" data-act="die-" data-s="${s}" aria-label="Menos um d${s}">−</button>
      <b>${rollUI.counts[s] || 0}</b>
      <button type="button" class="die-btn" data-act="die+" data-s="${s}" aria-label="Mais um d${s}">+</button></div>`).join('');
    const bon = rollUI.bonuses.map((b, i) => `<div class="bonus-row">
      <input type="text" data-bind="rollUI.bonuses.${i}.label" value="${esc(b.label)}" placeholder="Rótulo (item, condição, efeito...)" aria-label="Rótulo do bônus">
      <input type="number" data-bind="rollUI.bonuses.${i}.value" data-num value="${esc(b.value)}" aria-label="Valor do bônus">
      <button type="button" class="inv-mini-btn danger" data-act="bonus-del" data-i="${i}" aria-label="Remover bônus">✕</button></div>`).join('');
    const last = rollUI.last;
    const lastHtml = last ? `<div class="roll-result" aria-live="polite">
      <div class="roll-total">${last.total}</div>
      <div class="roll-detail"><b>${esc(last.whoName || '')}</b>${last.skill ? ' — ' + esc(last.skill) : ''}<br>
      ${esc(fmtGroups(last.groups))} = ${last.diceSum}${last.bonuses.length ? '<br>Bônus: ' + esc(fmtBonuses(last.bonuses)) + ' = ' + (last.bonusSum >= 0 ? '+' : '−') + Math.abs(last.bonusSum) : ''}
      ${last.note ? '<br><i>' + esc(last.note) + '</i>' : ''}${last.physical ? '<br><small>dados físicos informados</small>' : ''}</div>
      <button type="button" class="inv-mini-btn" data-act="roll-copy">Copiar</button></div>` : '';
    const scs = allShortcuts().map(sc => `<div class="sc-row"><span class="sc-name">${esc(sc.name)} <small>${{ personal:'pessoal', character:'personagem', campaign:'campanha' }[sc.scope]}</small></span>
      <button type="button" class="inv-mini-btn" data-act="sc-use" data-id="${esc(sc.id)}" data-scope="${sc.scope}">Usar</button>
      <button type="button" class="inv-mini-btn primary" data-act="sc-roll" data-id="${esc(sc.id)}" data-scope="${sc.scope}">Rolar</button>
      <button type="button" class="inv-mini-btn danger" data-act="sc-del" data-id="${esc(sc.id)}" data-scope="${sc.scope}" aria-label="Excluir atalho">✕</button></div>`).join('');
    const hist = Object.keys(rolls).map(k => rolls[k]).sort((a, b) => (b.ts || 0) - (a.ts || 0)).slice(0, 30).map(r =>
      `<div class="log-row"><div class="log-meta"><span>${esc(fmtTs(r.ts))}</span><span>por ${esc(r.actorName || '?')}</span></div><div>${esc(rollText(r))}</div></div>`).join('');
    return `<div class="hub-sec">
      <label class="hub-label">Personagem (opcional)</label>${holderSelect('rollUI.who', who, true)}
      <div class="hub-label">Dados</div><div class="dice-grid">${dice}</div>
      <div class="expr-row"><input type="text" data-bind="rollUI.expr" value="${esc(rollUI.expr)}" placeholder="Ou escreva: 2d6+1d8+3" aria-label="Expressão de dados">
        <button type="button" class="inv-mini-btn" data-act="expr-apply">Aplicar</button></div>
      <label class="hub-label">Perícia / ação (texto livre)</label>
      <input type="text" data-bind="rollUI.skill" value="${esc(rollUI.skill)}" placeholder="Qualquer perícia, atributo ou ação" maxlength="60">
      <div class="hub-label">Bônus</div>${bon}
      <button type="button" class="inv-mini-btn" data-act="bonus-add">＋ Bônus</button>
      <label class="check-row"><input type="checkbox" data-bind="rollUI.physical" data-rerender ${rollUI.physical ? 'checked' : ''}> Usei dados físicos (digitar resultados)</label>
      ${rollUI.physical ? `<input type="text" data-bind="rollUI.phys" value="${esc(rollUI.phys)}" placeholder="Resultados na ordem dos dados, ex.: 14 3 5" aria-label="Resultados dos dados físicos">` : ''}
      <input type="text" data-bind="rollUI.note" value="${esc(rollUI.note)}" placeholder="Observação (opcional)" maxlength="140">
      <label class="check-row"><input type="checkbox" data-bind="rollUI.record" ${rollUI.record ? 'checked' : ''}> Registrar no histórico da campanha</label>
      <button type="button" class="inv-mini-btn primary roll-go" data-act="roll">${rollUI.physical ? 'Registrar resultado' : 'Rolar'}</button>
      <p class="hub-hint">O site só mostra dados, bônus e total. Sucesso, dificuldade e consequência ficam com a mesa.</p>
      ${lastHtml}
    </div>
    <div class="hub-sec"><div class="hub-label">Atalhos</div>${scs || '<div class="inv-empty">Nenhum atalho ainda.</div>'}
      <div class="sc-save"><input type="text" data-bind="rollUI.scName" value="${esc(rollUI.scName)}" placeholder="Nome do atalho" maxlength="40">
        <select data-bind="rollUI.scScope"><option value="personal" ${rollUI.scScope === 'personal' ? 'selected' : ''}>Pessoal (só eu)</option><option value="character" ${rollUI.scScope === 'character' ? 'selected' : ''}>Personagem</option><option value="campaign" ${rollUI.scScope === 'campaign' ? 'selected' : ''}>Campanha</option></select>
        <button type="button" class="inv-mini-btn primary" data-act="sc-save">Salvar atual</button></div></div>
    <div class="hub-sec"><div class="hub-label">Histórico da campanha</div>${hist || '<div class="inv-empty">Nenhuma rolagem registrada.</div>'}</div>`;
  }

  // --- ficha ---
  function renderFicha(){
    const hl = holderList();
    if(!hl.length) return '<div class="inv-empty">Crie um token ou NPC no mapa para ter uma ficha.</div>';
    if(!hl.some(h => h.id === hub.charToken)) hub.charToken = (charSelect.value && hl.some(h => h.id === charSelect.value)) ? charSelect.value : hl[0].id;
    const h = holderById(hub.charToken), card = ensureCard(hub.charToken);
    const edit = canEditHolder(h), dis = edit ? '' : 'disabled';
    const cm = cfg().cardModules, mods = cfg().modules;
    let html = `<div class="hub-sec"><label class="hub-label">Ficha de</label>${holderSelect('hub.charToken', hub.charToken, false)}
      ${edit ? '' : '<p class="hub-hint">Somente leitura: esta ficha pertence a outra pessoa.</p>'}`;
    if(cm.identity){
      html += `<div class="hub-label">Identidade</div>
        <input type="text" data-bind="card.name" value="${esc(card.name)}" placeholder="Nome do personagem" ${dis}>
        <input type="text" data-bind="card.player" value="${esc(card.player)}" placeholder="Jogador" ${dis}>
        <div class="hub-label">Lembretes da mesa (PD, patente, o que o grupo quiser)</div>
        ${(card.reminders || []).map((r, i) => `<div class="bonus-row"><input type="text" data-bind="card.reminders.${i}.label" value="${esc(r.label)}" placeholder="Campo" ${dis}>
          <input type="text" data-bind="card.reminders.${i}.value" value="${esc(r.value)}" placeholder="Valor" ${dis}>
          <button type="button" class="inv-mini-btn danger" data-act="rem-del" data-i="${i}" ${dis} aria-label="Remover lembrete">✕</button></div>`).join('')}
        <button type="button" class="inv-mini-btn" data-act="rem-add" ${dis}>＋ Lembrete</button>`;
    }
    if(cm.skills){
      html += `<div class="hub-label">Perícias e bônus salvos</div>
        ${(card.skills || []).map((s, i) => `<div class="bonus-row"><input type="text" data-bind="card.skills.${i}.name" value="${esc(s.name)}" placeholder="Perícia" ${dis}>
          <input type="number" data-bind="card.skills.${i}.bonus" data-num value="${esc(s.bonus)}" aria-label="Bônus" ${dis}>
          <button type="button" class="inv-mini-btn primary" data-act="skill-use" data-i="${i}" aria-label="Levar para os dados">🎲</button>
          <button type="button" class="inv-mini-btn danger" data-act="skill-del" data-i="${i}" ${dis} aria-label="Remover perícia">✕</button></div>`).join('')}
        <button type="button" class="inv-mini-btn" data-act="skill-add" ${dis}>＋ Perícia</button>`;
    }
    if(cm.notes) html += `<div class="hub-label">Anotações</div><textarea data-bind="card.notes" rows="4" ${dis}>${esc(card.notes)}</textarea>`;
    if(cm.equip) html += `<div class="hub-label">Equipamento</div><p class="hub-hint">${esc(capTxt(h.id))}</p><button type="button" class="inv-mini-btn" data-act="open-inv" data-id="${esc(h.id)}">🎒 Abrir inventário</button>`;
    if(mods.needs){
      html += `<div class="hub-label">Necessidades (só registro; sem efeito automático)</div>` + NEED_LIST.map(n => {
        const v = (card.needs && card.needs[n[0]]) || 0;
        return `<div class="need-row"><span>${n[1]}</span><button type="button" class="die-btn" data-act="need" data-n="${n[0]}" data-d="-1" ${dis} aria-label="Reduzir ${n[1]}">−</button><b class="need-v">${NEED_LEVELS[v]}</b><button type="button" class="die-btn" data-act="need" data-n="${n[0]}" data-d="1" ${dis} aria-label="Aumentar ${n[1]}">+</button></div>`;
      }).join('');
    }
    return html + '</div>';
  }

  // --- sessão ---
  function renderSessao(){
    const s = activeSession(), master = isMaster(), f = hub.sessionForm;
    if(!f.date) f.date = todayStr();
    const names = candidateNames();
    const past = Object.keys(sessions).map(k => sessions[k]).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    return `<div class="hub-sec"><div class="hub-label">Sessão ativa</div>${s ? `
      <div class="inv-item"><div class="inv-item-name">${esc(s.title)}</div><div class="inv-item-util">${esc(s.date || '')} · ${s.closed ? 'encerrada' : 'em andamento'}<br>Presentes: ${esc((s.present || []).join(', ') || '—')}</div>
      <textarea data-bind="hub.summary" rows="4" placeholder="Resumo e acontecimentos da noite" ${master ? '' : 'disabled'}>${esc(s.summary || '')}</textarea>
      ${master ? `<div class="inv-item-actions"><button type="button" class="inv-mini-btn primary" data-act="sess-summary">Salvar resumo</button>${s.closed ? '' : '<button type="button" class="inv-mini-btn" data-act="sess-close">Encerrar sessão</button>'}</div>` : ''}</div>`
      : '<div class="inv-empty">Sem sessão ativa.</div>'}</div>
    ${master ? `<div class="hub-sec"><div class="hub-label">Nova sessão (continua o mesmo mundo)</div>
      <input type="text" data-bind="sf.title" value="${esc(f.title)}" placeholder="Título (opcional)" maxlength="60">
      <input type="date" data-bind="sf.date" value="${esc(f.date)}">
      <div class="hub-label">Quem está presente</div>
      ${names.map(n => `<label class="check-row"><input type="checkbox" data-act="present" data-name="${esc(n)}" ${f.present.includes(n) ? 'checked' : ''}> ${esc(n)}</label>`).join('') || '<p class="hub-hint">Sem jogadores conhecidos ainda.</p>'}
      <input type="text" data-bind="sf.extra" value="${esc(f.extra)}" placeholder="Outros (separe por vírgula)">
      <button type="button" class="inv-mini-btn primary" data-act="sess-new">Abrir sessão</button></div>` : ''}
    <div class="hub-sec"><div class="hub-label">Sessões anteriores</div>${past.map(p => `<div class="log-row"><div class="log-meta"><span>${esc(p.date || '')}</span><span>${p.id === (campaignMeta && campaignMeta.activeSessionId) ? 'ativa' : (p.closed ? 'encerrada' : '')}</span></div><b>${esc(p.title)}</b>${p.summary ? '<div class="log-note">' + esc(p.summary) + '</div>' : ''}</div>`).join('') || '<div class="inv-empty">Nenhuma.</div>'}</div>`;
  }

  // --- campanhas ---
  function renderCampanhas(){
    const list = visibleCampaigns(), master = isMaster();
    const act = list.filter(m => !m.archived), arch = list.filter(m => m.archived);
    const row = m => `<div class="inv-item"><div class="inv-item-name">${esc(m.name)}${m.id === activeCampaignId ? ' <span class="log-badge guardar">ativa</span>' : ''}</div>
      <div class="inv-item-util">${esc(m.system || 'sem sistema definido')}${m.masterName ? ' · mestre: ' + esc(m.masterName) : ''}${isMasterOf(m) && m.joinCode ? '<br>Código de convite: <b>' + esc(m.joinCode) + '</b>' : ''}</div>
      <div class="inv-item-actions">${m.id !== activeCampaignId ? `<button type="button" class="inv-mini-btn primary" data-act="camp-open" data-id="${esc(m.id)}">Abrir</button>` : ''}
      ${isMasterOf(m) && m.id !== 'legacy' ? (m.archived ? `<button type="button" class="inv-mini-btn" data-act="camp-reopen" data-id="${esc(m.id)}">Reabrir</button>` : (m.id !== activeCampaignId ? `<button type="button" class="inv-mini-btn" data-act="camp-archive" data-id="${esc(m.id)}">Arquivar</button>` : '')) : ''}
      ${isMasterOf(m) && m.id !== 'legacy' && m.id !== activeCampaignId ? `<button type="button" class="inv-mini-btn danger" data-act="camp-delete" data-id="${esc(m.id)}">Excluir</button>` : ''}</div></div>`;
    const nc = hub.newCampaign;
    if(!hub.cfgDraft){
      const c = cfg();
      hub.cfgDraft = { name:campaignMeta ? campaignMeta.name : '', system:campaignMeta ? campaignMeta.system || '' : '', invMode:c.invMode, invLimit:c.invLimit, decimals:c.decimals,
        weights:Object.assign({}, c.weights), modules:Object.assign({}, c.modules), cardModules:Object.assign({}, c.cardModules) };
    }
    const d = hub.cfgDraft;
    const cats = Array.from(new Set(ITEMS.map(i => i.category))).sort();
    const modLabels = { card:'Ficha leve', clock:'Relógio da campanha', needs:'Necessidades (registro)', explore:'Exploração dos locais', crafting:'Ofício (crafting)' };
    return `<div class="hub-sec"><div class="hub-label">Suas campanhas</div>${act.map(row).join('') || '<div class="inv-empty">Nenhuma.</div>'}
      ${arch.length ? '<div class="hub-label">Arquivadas</div>' + arch.map(row).join('') : ''}
      ${isUnclaimed() && firebaseReady ? '<button type="button" class="inv-mini-btn primary" data-act="claim">Assumir como mestre desta campanha</button>' : ''}
      <div class="expr-row"><input type="text" data-bind="hub.joinCode" value="${esc(hub.joinCode)}" placeholder="Código de convite" maxlength="6"><button type="button" class="inv-mini-btn" data-act="camp-join">Entrar</button></div></div>
    ${master ? `<div class="hub-sec"><div class="hub-label">Nova campanha (história independente)</div>
      <input type="text" data-bind="nc.name" value="${esc(nc.name)}" placeholder="Nome da campanha" maxlength="60">
      <input type="text" data-bind="nc.system" value="${esc(nc.system)}" placeholder="Sistema / perfil da mesa (opcional)" maxlength="80">
      <select data-bind="nc.mode" data-rerender>${opt('vazia', 'Começar vazia', nc.mode)}${opt('modelo', 'Copiar mapa-modelo (pins, áreas e rotas)', nc.mode)}${opt('duplicar', 'Duplicar uma campanha como nova história', nc.mode)}</select>
      ${nc.mode !== 'vazia' ? `<select data-bind="nc.source">${list.map(m => opt(m.id, m.name, nc.source)).join('')}</select>` : ''}
      ${nc.mode === 'duplicar' ? ['copyTokens:Tokens','copyInv:Inventários','copyChars:Fichas','copyRecipes:Receitas','copyWeather:Clima'].map(x => { const [k, l] = x.split(':'); return `<label class="check-row"><input type="checkbox" data-bind="nc.${k}" ${nc[k] ? 'checked' : ''}> ${l}</label>`; }).join('') : ''}
      <button type="button" class="inv-mini-btn primary" data-act="camp-create">Criar campanha</button>
      <p class="hub-hint">Nada é copiado sem você escolher. A campanha atual não é alterada.</p></div>
    <div class="hub-sec"><div class="hub-label">Configuração desta campanha</div>
      <input type="text" data-bind="cd.name" value="${esc(d.name)}" placeholder="Nome" maxlength="60">
      <input type="text" data-bind="cd.system" value="${esc(d.system)}" placeholder="Sistema / perfil" maxlength="80">
      <div class="hub-label">Módulos</div>
      ${Object.keys(modLabels).map(k => `<label class="check-row"><input type="checkbox" data-bind="cd.modules.${k}" ${d.modules[k] ? 'checked' : ''}> ${modLabels[k]}</label>`).join('')}
      <div class="hub-label">Partes da ficha</div>
      ${[['identity','Identidade'],['skills','Perícias e atalhos'],['notes','Anotações'],['equip','Equipamento']].map(x => `<label class="check-row"><input type="checkbox" data-bind="cd.cardModules.${x[0]}" ${d.cardModules[x[0]] ? 'checked' : ''}> ${x[1]}</label>`).join('')}
      <div class="hub-label">Inventário</div>
      <select data-bind="cd.invMode" data-rerender>${opt('slots', 'Limite de itens', d.invMode)}${opt('carga', 'Carga por peso (faixas)', d.invMode)}${opt('livre', 'Lista livre, sem limite', d.invMode)}</select>
      ${d.invMode !== 'livre' ? `<label class="hub-label">${d.invMode === 'slots' ? 'Máximo de itens' : 'Capacidade de carga'}</label><input type="number" min="1" data-bind="cd.invLimit" value="${esc(d.invLimit)}">` : ''}
      ${d.invMode === 'carga' ? '<div class="hub-label">Peso por categoria (padrão 1)</div>' + cats.map(c => `<div class="bonus-row"><span class="w-cat">${esc(c)}</span><input type="number" step="0.1" min="0" data-bind="cd.weights.${esc(catKey(c))}" value="${esc(d.weights[catKey(c)] != null ? d.weights[catKey(c)] : 1)}"></div>`).join('') : ''}
      <label class="hub-label">Casas decimais das coordenadas do saque (0 a 6)</label><input type="number" min="0" max="6" data-bind="cd.decimals" value="${esc(d.decimals)}">
      <button type="button" class="inv-mini-btn primary" data-act="cfg-save">Salvar configuração</button></div>` : '<p class="hub-hint">Só o mestre cria campanhas e altera a configuração.</p>'}`;
  }

  // --- mundo ---
  function renderMundo(){
    const mods = cfg().modules, master = isMaster();
    let html = '';
    if(mods.clock){
      html += `<div class="hub-sec"><div class="hub-label">Relógio da campanha</div><div class="clock-big" aria-live="polite">${esc(clockText() || 'Dia 1 · 08:00 (não iniciado)')}</div>
        ${master ? `<div class="inv-item-actions">${[[10, '+10 min'], [60, '+1 h'], [360, '+6 h'], [1440, '+1 dia'], [-60, '−1 h']].map(x => `<button type="button" class="inv-mini-btn" data-act="clock" data-m="${x[0]}">${x[1]}</button>`).join('')}</div>` : ''}
        <p class="hub-hint">O relógio só registra o tempo; nenhuma regra é aplicada sozinha.</p></div>`;
    }
    if(mods.explore){
      const ps = pins.filter(p => p.type !== 'npc');
      html += `<div class="hub-sec"><div class="hub-label">Locais (pins)</div>${ps.map(p => {
        const ex = pinExplore(p), dis = master ? '' : 'disabled';
        return `<div class="inv-item"><div class="inv-item-name">${esc(p.title || 'Pin')}</div>
          <select data-pin="${esc(p.id)}" data-field="status" ${dis}>${EXPLORE_STATES.map(s => opt(s[0], s[1], ex.status)).join('')}</select>
          <input type="text" data-pin="${esc(p.id)}" data-field="clue" value="${esc(ex.clue)}" placeholder="Pista" ${dis}>
          <input type="text" data-pin="${esc(p.id)}" data-field="risk" value="${esc(ex.risk)}" placeholder="Risco" ${dis}>
          <input type="number" min="0" data-pin="${esc(p.id)}" data-field="reserve" value="${ex.reserve == null ? '' : ex.reserve}" placeholder="Reserva de saque (vazio = ilimitada)" ${dis}>
          <div class="inv-item-util">Último saque: ${esc(ex.lastLoot || '—')}${ex.updatedBy ? ' · por ' + esc(ex.updatedBy) : ''}</div>
          <button type="button" class="inv-mini-btn" data-act="pin-go" data-id="${esc(p.id)}">Ver no mapa</button></div>`;
      }).join('') || '<div class="inv-empty">Nenhum pin no mapa.</div>'}</div>`;
    }
    return html || '<div class="inv-empty">Ative relógio ou exploração na configuração da campanha.</div>';
  }

  // --- ofício ---
  function renderOficio(){
    const master = isMaster(), hl = holderList().filter(h => h.type === 'token');
    if(!hl.some(h => h.id === hub.craftHolder)) hub.craftHolder = hl[0] ? hl[0].id : null;
    const list = Object.keys(recipes).map(k => recipes[k]).sort((a, b) => String(a.name).localeCompare(String(b.name)));
    const nm = id => (ITEMS_BY_ID[id] || {}).name || '?';
    let html = '<datalist id="item-names">' + ITEMS.map(i => `<option value="${esc(i.name)}">`).join('') + '</datalist>';
    html += `<div class="hub-sec"><label class="hub-label">Quem fabrica</label>${hl.length ? `<select data-bind="hub.craftHolder" data-rerender>${hl.map(h => opt(h.id, h.name, hub.craftHolder)).join('')}</select>` : '<div class="inv-empty">Crie um token no mapa.</div>'}
      ${hub.craftMsg ? `<p class="hub-hint" role="status">${esc(hub.craftMsg)}</p>` : ''}</div>`;
    CRAFT_FAMILIES.concat([['outro', 'Outras']]).forEach(([fk, fl]) => {
      const rs = list.filter(r => (CRAFT_FAMILIES.some(f => f[0] === r.family) ? r.family : 'outro') === fk);
      if(!rs.length) return;
      html += `<div class="hub-sec"><div class="hub-label">${fl}</div>${rs.map(r => {
        const chk = hub.craftHolder ? craftCheck(r, hub.craftHolder) : { missing:[], toolOk:false, canCraft:false };
        const ing = (r.ingredients || []).map(i => { const miss = chk.missing.find(m => m.itemId === i.itemId); return `<li class="${miss ? 'bad' : 'good'}">${miss ? '✖' : '✔'} ${i.qty}× ${esc(nm(i.itemId))}${miss ? ` (tem ${miss.have})` : ''}</li>`; }).join('');
        return `<div class="inv-item"><div class="inv-item-name">${esc(r.name)}</div>
          <div class="inv-item-util">Resultado: ${r.result.qty}× ${esc(nm(r.result.itemId))}</div><ul class="craft-ing">${ing}${r.tool ? `<li class="${chk.toolOk ? 'good' : 'bad'}">${chk.toolOk ? '✔' : '✖'} Ferramenta: ${esc(nm(r.tool))}</li>` : ''}</ul>
          <div class="inv-item-util">${[r.station && 'Estação: ' + r.station, r.skill && 'Perícia: ' + r.skill, r.time && 'Tempo: ' + r.time, r.noise && 'Ruído: ' + r.noise, r.risk && 'Risco: ' + r.risk].filter(Boolean).map(esc).join(' · ')}</div>
          ${r.resolution ? `<div class="inv-item-util"><i>${esc(r.resolution)}</i></div>` : ''}
          <div class="inv-item-actions"><button type="button" class="inv-mini-btn primary" data-act="craft" data-id="${esc(r.id)}" data-o="sucesso" ${chk.canCraft ? '' : 'disabled'}>Deu certo</button>
          <button type="button" class="inv-mini-btn danger" data-act="craft" data-id="${esc(r.id)}" data-o="falha" ${chk.canCraft ? '' : 'disabled'}>Deu errado${r.wasteOnFail ? ' (perde materiais)' : ''}</button>
          <button type="button" class="inv-mini-btn" data-act="craft-roll" data-id="${esc(r.id)}">🎲 Rolar</button>
          ${master ? `<button type="button" class="inv-mini-btn" data-act="recipe-edit" data-id="${esc(r.id)}">Editar</button><button type="button" class="inv-mini-btn danger" data-act="recipe-del" data-id="${esc(r.id)}" aria-label="Excluir receita">✕</button>` : ''}</div></div>`;
      }).join('')}</div>`;
    });
    if(!list.length) html += '<div class="inv-empty">Nenhuma receita configurada.</div>';
    if(master){
      const f = hub.recipeForm;
      html += f ? `<div class="hub-sec"><div class="hub-label">${f.id ? 'Editar receita' : 'Nova receita'}</div>
        <input type="text" data-bind="rf.name" value="${esc(f.name)}" placeholder="Nome da receita">
        <select data-bind="rf.family">${CRAFT_FAMILIES.map(x => opt(x[0], x[1], f.family)).join('')}</select>
        <input type="text" list="item-names" data-bind="rf.resultName" value="${esc(f.resultName)}" placeholder="Resultado (nome do item do catálogo)">
        <input type="number" min="1" data-bind="rf.resultQty" value="${esc(f.resultQty)}" aria-label="Quantidade do resultado">
        <div class="hub-label">Ingredientes</div>
        ${f.ingredients.map((g, i) => `<div class="bonus-row"><input type="text" list="item-names" data-bind="rf.ingredients.${i}.name" value="${esc(g.name)}" placeholder="Item"><input type="number" min="1" data-bind="rf.ingredients.${i}.qty" value="${esc(g.qty)}"><button type="button" class="inv-mini-btn danger" data-act="ing-del" data-i="${i}" aria-label="Remover ingrediente">✕</button></div>`).join('')}
        <button type="button" class="inv-mini-btn" data-act="ing-add">＋ Ingrediente</button>
        <input type="text" list="item-names" data-bind="rf.toolName" value="${esc(f.toolName)}" placeholder="Ferramenta necessária (opcional)">
        <input type="text" data-bind="rf.station" value="${esc(f.station)}" placeholder="Estação / local (opcional)">
        <input type="text" data-bind="rf.skill" value="${esc(f.skill)}" placeholder="Perícia sugerida (opcional)">
        <input type="text" data-bind="rf.time" value="${esc(f.time)}" placeholder="Tempo (texto livre)">
        <input type="text" data-bind="rf.noise" value="${esc(f.noise)}" placeholder="Ruído">
        <input type="text" data-bind="rf.risk" value="${esc(f.risk)}" placeholder="Risco">
        <input type="text" data-bind="rf.resolution" value="${esc(f.resolution)}" placeholder="Como resolver (teste, custo em falha...)">
        <label class="check-row"><input type="checkbox" data-bind="rf.wasteOnFail" ${f.wasteOnFail ? 'checked' : ''}> Falha consome os materiais</label>
        <div class="inv-item-actions"><button type="button" class="inv-mini-btn primary" data-act="recipe-save">Salvar receita</button><button type="button" class="inv-mini-btn" data-act="recipe-cancel">Cancelar</button></div></div>`
        : `<div class="inv-item-actions"><button type="button" class="inv-mini-btn primary" data-act="recipe-new">＋ Nova receita</button><button type="button" class="inv-mini-btn" data-act="recipe-seed">Adicionar exemplos</button></div>`;
    }
    return html;
  }

  // ---------- eventos do painel ----------
  function bindRoot(name){
    return { rollUI, hub, sf:hub.sessionForm, nc:hub.newCampaign, cd:hub.cfgDraft, rf:hub.recipeForm, card:characters[hub.charToken] || null }[name] || null;
  }
  function bindSet(path, value){
    const ps = path.split('.'), root = bindRoot(ps[0]);
    if(!root) return null;
    let o = root;
    for(let i = 1; i < ps.length - 1; i++){ if(o[ps[i]] == null) o[ps[i]] = {}; o = o[ps[i]]; }
    o[ps[ps.length - 1]] = value;
    return ps[0];
  }
  function onBind(t){
    const v = t.type === 'checkbox' ? t.checked : (t.hasAttribute('data-num') ? (t.value === '' ? '' : Number(t.value)) : t.value);
    const root = bindSet(t.dataset.bind, v);
    if(root === 'card') scheduleSaveCard();
    if(t.hasAttribute('data-rerender')) renderHub();
  }
  hubBody.addEventListener('input', e => {
    const t = e.target;
    if(t.dataset && t.dataset.bind && t.type !== 'checkbox' && t.tagName !== 'SELECT') onBind(t);
  });
  hubBody.addEventListener('change', e => {
    const t = e.target;
    if(t.dataset && t.dataset.pin){
      let v = t.value;
      if(t.dataset.field === 'reserve') v = v === '' ? null : Math.max(0, parseInt(v, 10) || 0);
      setPinExplore(t.dataset.pin, t.dataset.field, v);
      return;
    }
    if(t.dataset && t.dataset.act === 'present'){
      const arr = hub.sessionForm.present, n = t.dataset.name, i = arr.indexOf(n);
      if(t.checked && i < 0) arr.push(n);
      if(!t.checked && i >= 0) arr.splice(i, 1);
      return;
    }
    if(t.dataset && t.dataset.bind && (t.type === 'checkbox' || t.tagName === 'SELECT')) onBind(t);
  });
  hubBody.addEventListener('focusout', () => { setTimeout(() => { if(hubDirty && !(document.activeElement && hubBody.contains(document.activeElement))) renderHub(); }, 50); });
  hubBody.addEventListener('click', e => {
    const b = e.target.closest('[data-act]');
    if(!b || b.tagName === 'INPUT') return;
    hubAction(b.dataset.act, b);
  });
  function findShortcut(el){ return allShortcuts().find(s => s.id === el.dataset.id && s.scope === el.dataset.scope); }
  function hubAction(act, el){
    const D = el.dataset;
    switch(act){
      case 'tab': hub.tab = D.tab; renderHub(); break;
      case 'die+': rollUI.counts[D.s] = Math.min(50, (rollUI.counts[D.s] || 0) + 1); renderHub(); break;
      case 'die-': rollUI.counts[D.s] = Math.max(0, (rollUI.counts[D.s] || 0) - 1); renderHub(); break;
      case 'bonus-add': rollUI.bonuses.push({ label:'', value:0 }); renderHub(); break;
      case 'bonus-del': rollUI.bonuses.splice(+D.i, 1); renderHub(); break;
      case 'expr-apply': if(applyExpr()) renderHub(); break;
      case 'roll': doRoll(); break;
      case 'roll-copy': if(rollUI.last) copyText(rollText(rollUI.last)); break;
      case 'sc-save': saveShortcut(); break;
      case 'sc-use': { const sc = findShortcut(el); if(sc){ useShortcut(sc); renderHub(); } break; }
      case 'sc-roll': { const sc = findShortcut(el); if(sc){ useShortcut(sc); doRoll(); } break; }
      case 'sc-del': { const sc = findShortcut(el); if(sc){ DB.set(scPath(sc), null); } break; }
      case 'rem-add': ensureCard(hub.charToken).reminders = (characters[hub.charToken].reminders || []).concat([{ label:'', value:'' }]); scheduleSaveCard(); renderHub(); break;
      case 'rem-del': characters[hub.charToken].reminders.splice(+D.i, 1); scheduleSaveCard(); renderHub(); break;
      case 'skill-add': ensureCard(hub.charToken).skills = (characters[hub.charToken].skills || []).concat([{ name:'', bonus:0 }]); scheduleSaveCard(); renderHub(); break;
      case 'skill-del': characters[hub.charToken].skills.splice(+D.i, 1); scheduleSaveCard(); renderHub(); break;
      case 'skill-use': { const s = characters[hub.charToken].skills[+D.i]; rollUI.skill = s.name; rollUI.bonuses = Number(s.bonus) ? [{ label:s.name, value:Number(s.bonus) }] : []; rollUI.who = hub.charToken; hub.tab = 'dados'; renderHub(); break; }
      case 'need': { const c = ensureCard(hub.charToken); c.needs = c.needs || {}; c.needs[D.n] = Math.min(4, Math.max(0, (c.needs[D.n] || 0) + (+D.d))); scheduleSaveCard(); renderHub(); break; }
      case 'open-inv': openInventory(D.id); break;
      case 'sess-new': newSession(); break;
      case 'sess-summary': { const ta = hubBody.querySelector('[data-bind="hub.summary"]'); saveSummary(ta ? ta.value : ''); break; }
      case 'sess-close': closeSession(); break;
      case 'camp-open': switchCampaign(D.id); break;
      case 'camp-archive': setArchived(D.id, true); break;
      case 'camp-reopen': setArchived(D.id, false); break;
      case 'camp-delete': deleteCampaign(D.id); break;
      case 'camp-create': createCampaign(hub.newCampaign); break;
      case 'camp-join': joinCampaign(hub.joinCode); break;
      case 'claim': claimMaster(); break;
      case 'cfg-save': saveConfig(); break;
      case 'clock': advanceClock(+D.m); break;
      case 'pin-go': { const p = pins.find(x => x.id === D.id); if(p){ map.flyTo([p.lat, p.lng], Math.max(map.getZoom(), 15)); closeHub(); } break; }
      case 'craft': { const r = recipes[D.id]; if(r) craftDo(r, hub.craftHolder, D.o); break; }
      case 'craft-roll': { const r = recipes[D.id]; if(r){ rollUI.skill = r.skill || r.name; rollUI.who = hub.craftHolder || ''; hub.tab = 'dados'; renderHub(); } break; }
      case 'recipe-new': hub.recipeForm = blankRecipe(); renderHub(); break;
      case 'recipe-edit': hub.recipeForm = recipeToForm(recipes[D.id]); renderHub(); break;
      case 'recipe-cancel': hub.recipeForm = null; renderHub(); break;
      case 'recipe-save': saveRecipe(); break;
      case 'recipe-del': if(window.confirm('Excluir esta receita?')) DB.set(scopedKey(KEY_RECIPES) + '/' + D.id, null); break;
      case 'recipe-seed': seedRecipes(); break;
      case 'ing-add': hub.recipeForm.ingredients.push({ name:'', qty:1 }); renderHub(); break;
      case 'ing-del': hub.recipeForm.ingredients.splice(+D.i, 1); renderHub(); break;
    }
  }

  document.getElementById('hub-drawer-close-btn').addEventListener('click', closeHub);
  hubBackdrop.addEventListener('click', closeHub);
  document.getElementById('hub-toggle-btn').addEventListener('click', () => { hubIsOpen() ? closeHub() : openHub('dados'); });
  document.getElementById('roll-toggle-btn').addEventListener('click', () => { hubIsOpen() && hub.tab === 'dados' ? closeHub() : openHub('dados'); });
  document.getElementById('campaign-chip').addEventListener('click', () => openHub('campanhas'));
  document.addEventListener('keydown', e => {
    if(e.key === 'Escape' && hubIsOpen()) closeHub();
    const tag = (document.activeElement && document.activeElement.tagName) || '';
    if(/^(INPUT|TEXTAREA|SELECT)$/.test(tag) || e.ctrlKey || e.metaKey || e.altKey) return;
    if(e.key === 'd' || e.key === 'D') openHub('dados');
    else if(e.key === 'c' || e.key === 'C') openHub('campanhas');
  });

  renderLootResults();
  renderFishResults();
  refreshCharacterOptions();
  invReady = true;
  refreshAddDest();
  updateSaqueInvCount();
  initInventorySync();
  attachModuleSync();
  startMetaSync();
  applyConfig();
  updateHud();

})();
