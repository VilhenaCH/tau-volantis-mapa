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
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : [];
    }catch(e){ return []; }
  }
  function saveLocal(key, data){
    try{
      localStorage.setItem(key, JSON.stringify(data));
      return true;
    }catch(e){ console.error('Erro ao salvar localmente', key, e); return false; }
  }

  async function loadKey(key){
    // Usado só quando o Firebase não está disponível — quando está, o carregamento
    // inicial e as atualizações chegam pelo listener em tempo real (initRealtimeSync).
    if(hasCloudStorage){
      try{
        const r = await window.storage.get(key, true);
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
        await firebaseDb.ref('tau-volantis/' + key).set(data);
        return;
      }catch(e){ console.error('Falha ao salvar no Firebase', key, e); }
    }
    if(hasCloudStorage){
      try{
        const r = await window.storage.set(key, JSON.stringify(data), true);
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
      <div class="popup-actions">
        <button class="save">Salvar</button>
        <button class="del">Remover</button>
      </div>
    `;
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
    if(!window.confirm('Isso remove todos os pins, tokens, áreas e rotas do mapa para todos. Confirmar?')) return;
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

  function initRealtimeSync(){
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

    firebaseDb.ref('tau-volantis/' + KEY_PINS).on('value', snap => {
      pins = snap.val() || [];
      saveLocal(KEY_PINS, pins);
      renderPins(); // por diff: nunca derruba o pin que outra pessoa está editando
      markLoaded(1);
      setSyncStatus('live');
    }, err => { console.error('Erro de sincronização (pins)', err); setSyncStatus('offline'); markLoaded(1); });

    firebaseDb.ref('tau-volantis/' + KEY_TOKENS).on('value', snap => {
      tokens = snap.val() || [];
      saveLocal(KEY_TOKENS, tokens);
      if(!tokenDragActive && !tokenPopupActive) renderTokens();
      markLoaded(2);
      setSyncStatus('live');
    }, err => { console.error('Erro de sincronização (tokens)', err); setSyncStatus('offline'); markLoaded(2); });

    firebaseDb.ref('tau-volantis/' + KEY_SHAPES).on('value', snap => {
      shapes = snap.val() || [];
      saveLocal(KEY_SHAPES, shapes);
      if(!shapePopupActive) renderShapes();
      markLoaded(4);
      setSyncStatus('live');
    }, err => { console.error('Erro de sincronização (áreas)', err); setSyncStatus('offline'); markLoaded(4); });

    firebaseDb.ref('tau-volantis/' + KEY_ROUTES).on('value', snap => {
      routes = snap.val() || [];
      saveLocal(KEY_ROUTES, routes);
      if(!routePopupActive) renderRoutes();
      markLoaded(8);
      setSyncStatus('live');
    }, err => { console.error('Erro de sincronização (rotas)', err); setSyncStatus('offline'); markLoaded(8); });

    firebaseDb.ref('tau-volantis/' + KEY_WEATHER).on('value', snap => {
      const w = snap.val();
      weather = (w && w.state) ? w : { state: 'calmo', updatedAt: null, updatedBy: null };
      saveLocal(KEY_WEATHER, weather);
      applyWeatherVisual();
      markLoaded(16);
      setSyncStatus('live');
    }, err => { console.error('Erro de sincronização (clima)', err); setSyncStatus('offline'); markLoaded(16); });
  }
  initRealtimeSync();


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

  // ---------- coordenada aproximada de onde o saque/pesca foi realizado ----------
  // Converte lat/lng num "setor" tipo grade tática (ex: "Setor N7"), em vez de
  // expor coordenadas GPS reais — mais no clima do mapa de sobrevivência.
  const GRID_CELL_DEG = 0.012; // ~1.3km por célula, no centro de SP
  function gridRef(lat, lng){
    const originLat = SP_CENTER[0] + GRID_CELL_DEG * 13;
    const originLng = SP_CENTER[1] - GRID_CELL_DEG * 13;
    const col = Math.floor((lng - originLng) / GRID_CELL_DEG);
    const row = Math.floor((originLat - lat) / GRID_CELL_DEG);
    let letters = '';
    let n = Math.max(0, col);
    do{
      letters = String.fromCharCode(65 + (n % 26)) + letters;
      n = Math.floor(n / 26) - 1;
    }while(n >= 0);
    return `Setor ${letters}${Math.max(0, row)}`;
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
    const entry = {kind:'loot', item, locKey, uid: ++lootUid, sendState: 'idle', foundBy: playerName(), coord: tok ? gridRef(tok.lat, tok.lng) : null};
    lootHistory.unshift(entry);
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
    clearBtn.addEventListener('click', () => { lootHistory = []; renderLootResults(); });

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
        ${coord ? `<div class="result-coord">📍 ${coord}</div>` : ''}
        <div class="send-row">
          <button class="send-btn" data-action="send">Enviar ao Discord</button>
          <span class="send-status" data-role="status">${lootStatusText(entry)}</span>
        </div>
      `;
      card.querySelector('[data-action="send"]').addEventListener('click', () => sendLootToDiscord(entry));
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
      if(entry.coord) fields.push({ name: "Coordenada aproximada", value: entry.coord, inline: true });
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
      if(coord) fields.push({ name: "Coordenada aproximada", value: coord, inline: true });
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
    const entry = {kind:'fish', item: caught, uid: ++fishUid, sendState:'idle', foundBy: playerName(), coord: tok ? gridRef(tok.lat, tok.lng) : null};
    fishHistory.unshift(entry);
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
    clearFishBtn.addEventListener('click', () => { fishHistory = []; renderFishResults(); });

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
        ${entry.coord ? `<div class="result-coord">📍 ${entry.coord}</div>` : ''}
        <div class="send-row">
          <button class="send-btn" data-action="send">Enviar ao Discord</button>
          <span class="send-status" data-role="status">${lootStatusText(entry)}</span>
        </div>
      `;
      card.querySelector('[data-action="send"]').addEventListener('click', () => sendLootToDiscord(entry));
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

  renderLootResults();
  renderFishResults();
  refreshCharacterOptions();

})();
