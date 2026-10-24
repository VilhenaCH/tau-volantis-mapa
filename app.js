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
  // Ícones de interface (SVG de traço, 24x24). Usados no dock, índice, feed, ficha e clima no lugar de emojis.
  const UI_IC = {
    trash:'<path d="M4 7h16"/><path d="M9 7V4h6v3"/><path d="M6 7l1 13h10l1-13"/><path d="M10 11v6M14 11v6"/>',
    fish:'<path d="M3 12c3-5 9-6 14-2l4-3v10l-4-3c-5 4-11 3-14-2z"/><circle cx="8" cy="11" r="0.8"/>',
    download:'<path d="M12 4v11"/><path d="M7 11l5 5 5-5"/><path d="M5 20h14"/>',
    cut:'<circle cx="6" cy="6" r="2.5"/><circle cx="6" cy="18" r="2.5"/><path d="M8 8l12 10M8 16L20 6"/>',
    dice:'<rect x="4" y="4" width="16" height="16" rx="3"/><circle cx="9" cy="9" r="1"/><circle cx="15" cy="9" r="1"/><circle cx="9" cy="15" r="1"/><circle cx="15" cy="15" r="1"/>',
    compass:'<circle cx="12" cy="12" r="9"/><path d="M15.5 8.5l-2 5-5 2 2-5z"/>',
    bag:'<path d="M6 8h12l1 12H5z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/>',
    swords:'<path d="M14.5 17.5L3 6V3h3l11.5 11.5"/><path d="M13 19l6-6M16 16l4 4M19 21l2-2"/><path d="M14.5 6.5L18 3h3v3l-3.5 3.5"/><path d="M5 14l4 4M7 17l-3 3M3 19l2 2"/>',
    more:'<circle cx="5" cy="12" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="19" cy="12" r="1.6"/>',
    search:'<circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/>',
    box:'<path d="M21 8 12 3 3 8l9 5 9-5Z"/><path d="M3 8v9l9 5V13"/><path d="M21 8v9l-9 5"/>',
    book:'<path d="M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3z"/><path d="M5 17a3 3 0 0 1 3-3h11"/>',
    users:'<circle cx="9" cy="8" r="3"/><path d="M3 20c.5-3.5 3-5 6-5s5.5 1.5 6 5"/><circle cx="17" cy="9" r="2.5"/><path d="M17 14.5c2.3.2 3.8 1.5 4 4.5"/>',
    list:'<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>',
    plus:'<path d="M12 5v14M5 12h14"/>',
    minus:'<path d="M5 12h14"/>',
    tool:'<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94z"/>',
    close:'<path d="M6 6l12 12M18 6L6 18"/>',
    heart:'<path d="M12 21s-8-5.5-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 10c0 5.5-8 11-8 11z"/>',
    bolt:'<path d="M13 2L4 14h7l-1 8 9-12h-7z"/>',
    target:'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4"/><path d="M12 1v4M12 19v4M1 12h4M19 12h4"/>',
    alert:'<path d="M12 3 2 21h20L12 3Z"/><path d="M12 10v5"/><path d="M12 18h.01"/>',
    snow:'<path d="M12 3v18M4.5 7.5l15 9M19.5 7.5l-15 9"/>',
    fog:'<path d="M5 8h14M3 12h18M5 16h14M8 20h8"/>',
    wind:'<path d="M9.6 4.6A2 2 0 1 1 11 8H2M12.6 19.4A2 2 0 1 0 14 16H2M17.7 7.7A2.5 2.5 0 1 1 19.5 12H2"/>',
    storm:'<path d="M19 16.9A5 5 0 0 0 18 7h-1.26a8 8 0 1 0-11.62 9"/><path d="M13 11l-4 6h6l-4 6"/>',
    sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
    eye:'<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
    layers:'<path d="M12 3l9 5-9 5-9-5z"/><path d="M3 13l9 5 9-5"/>',
    route:'<circle cx="6" cy="19" r="2"/><circle cx="18" cy="5" r="2"/><path d="M8 19h8a3 3 0 0 0 0-6H8a3 3 0 0 1 0-6h8"/>',
    pin:'<path d="M12 21s-7-7.2-7-12a7 7 0 0 1 14 0c0 4.8-7 12-7 12Z"/><circle cx="12" cy="9" r="2.4"/>',
    note:'<path d="M6 2h9l3 3v17H6z"/><path d="M15 2v3h3"/><path d="M9 12h6M9 16h6"/>',
    shape:'<path d="M4 7l8-4 8 4v10l-8 4-8-4z"/>',
    map:'<path d="M3 6l6-2 6 2 6-2v14l-6 2-6-2-6 2z"/><path d="M9 4v14M15 6v14"/>',
    user:'<circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 5-6 8-6s6.5 2 8 6"/>',
    sliders:'<path d="M4 6h10M18 6h2M4 12h2M10 12h10M4 18h12M20 18h0"/><circle cx="16" cy="6" r="2"/><circle cx="8" cy="12" r="2"/><circle cx="18" cy="18" r="2"/>',
    rain:'<path d="M20 16.2A4.5 4.5 0 0 0 17.5 8h-1.8A7 7 0 1 0 4 14.9"/><path d="M8 19v2M12 17v4M16 19v2"/>',
    back:'<path d="M15 5l-7 7 7 7"/>',
    chev:'<path d="M9 5l7 7-7 7"/>',
    check:'<path d="M5 12l5 5 9-10"/>',
    skull:'<path d="M12 2a8 8 0 0 0-8 8c0 3 1.6 5 3 6.1V19a1 1 0 0 0 1 1h1v-2.2h2V20h2v-2.2h2V20h1a1 1 0 0 0 1-1v-2.9c1.4-1.1 3-3.1 3-6.1a8 8 0 0 0-8-8Z"/><circle cx="9" cy="10" r="1.3"/><circle cx="15" cy="10" r="1.3"/>',
    drop:'<path d="M12 2.5s6.5 7.2 6.5 11.5a6.5 6.5 0 0 1-13 0C5.5 9.7 12 2.5 12 2.5Z"/>',
    copy:'<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V6a2 2 0 0 1 2-2h9"/>',
    lock:'<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
    unlock:'<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 7.5-2"/>'
  };
  function ic(name, size){
    const s = size || 20;
    return `<svg class="ui-ic" width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${UI_IC[name] || ''}</svg>`;
  }
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
  // Filtros do mapa (chips do topo): a que categoria pertence cada coisa desenhada.
  //  tokens = tokens + NPCs · perigos = pins de perigo/ameaça/radiação/armadilha + áreas · notas = pins de nota · pins = o resto
  const mapfCat = type => type === 'nota' ? 'notas' : (type === 'npc' ? 'tokens' : (PING_TYPES.includes(type) ? 'perigos' : 'pins'));
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
  const KEY_JOURNAL = 'tv-map:journal';       // diário público (membros da campanha)
  const KEY_GMJ = 'tv-map:gm-journal';        // diário privado do mestre
  const KEY_TAC = 'tv-map:tactical';          // mapa tático: cenas, grade, regras, tokens públicos
  const KEY_TACIMG = 'tv-map:tactical-img';   // imagens de cena enviadas do celular (lidas só ao abrir a cena)
  const KEY_GMTAC = 'tv-map:gm-tactical';     // tokens ocultos do mestre
  const DB_KEYS = new Set([KEY_CHARS, KEY_ROLLS, KEY_RECIPES, KEY_CLOCK, KEY_SHORTCUTS, KEY_JOURNAL, KEY_GMJ, KEY_TAC, KEY_TACIMG, KEY_GMTAC]);
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
      lastError:'',
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
          catch(e){ this.lastError = String((e && (e.code || e.message)) || e); console.error('Falha ao gravar', path, e); return false; }
        }
        setLocal(path, val); persist(); notify(path);
        return true;
      },
      async update(map){
        if(firebaseReady){
          try{ await firebaseDb.ref('tau-volantis').update(map); return true; }
          catch(e){ this.lastError = String((e && (e.code || e.message)) || e); console.error('Falha ao gravar', e); return false; }
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

  // Estados do clima. Os três originais (calmo, nevasca, espectral) continuam iguais; os novos trazem
  // efeitos mecânicos das regras de Ordem Paranormal. Nada é automático: só vale o estado que o mestre escolher.
  //  eff   = linhas de efeito mostradas na mesa; mods = modificadores aplicados nas rolagens da ficha
  //  (percepcao: perícia Percepção; ranged: ataques à distância = perícia Pontaria); difficult = deslocamento ×2;
  //  lightning = chance de raio por rodada; emoji = só para a mensagem enviada ao Discord.
  const WEATHER_STATES = {
    calmo: { label: 'Calmo', desc: 'Céu claro, visibilidade normal.', icon: 'sun', emoji: '🌤️', eff: [] },
    neblina: { label: 'Neblina', desc: 'Névoa densa cobre o terreno.', icon: 'fog', emoji: '🌫️',
      eff: ['−5 em Percepção', 'Camuflagem total além de 9 m'], mods: { percepcao: -5 } },
    vento: { label: 'Vento Forte', desc: 'Rajadas constantes dificultam tiros e apagam chamas.', icon: 'wind', emoji: '💨',
      eff: ['−2 em ataques à distância', '50% por rodada de apagar chamas ou dissipar névoa'], mods: { ranged: -2 } },
    vendaval: { label: 'Vendaval', desc: 'Vento violento: ninguém mira direito e nada queima.', icon: 'wind', emoji: '🌪️',
      eff: ['−5 em ataques à distância', 'Apaga chamas e dissipa névoas'], mods: { ranged: -5 } },
    tempestade: { label: 'Tempestade', desc: 'Chuva pesada, vento de vendaval e raios.', icon: 'storm', emoji: '⛈️',
      eff: ['−5 em Percepção', '−5 em ataques à distância; apaga chamas e dissipa névoas', '10% de raio por rodada (8d12 de dano de eletricidade)'],
      mods: { percepcao: -5, ranged: -5 }, lightning: { chance: 10, dice: '8d12' } },
    nevasca: { label: 'Nevasca', desc: 'Neve pesada reduz visibilidade e castiga quem está exposto.', icon: 'snow', emoji: '🌨️', eff: [] },
    nevasca_forte: { label: 'Nevasca Forte', desc: 'Neve cega e o chão some sob os pés.', icon: 'snow', emoji: '❄️',
      eff: ['−5 em Percepção', 'Terreno difícil: deslocamento custa o dobro'], mods: { percepcao: -5 }, difficult: true },
    espectral: { label: 'Nevasca Espectral', desc: 'Algo se move dentro da nevasca. Perigo ativo — considere convocar um evento.', icon: 'eye', emoji: '👁️', eff: [] }
  };
  function weatherDef(){ return WEATHER_STATES[weather.state] || WEATHER_STATES.calmo; }
  // modificadores do clima atual para um teste da ficha (entram na conta como as condições, com o nome do clima)
  function weatherMods(kind, skillKey){
    const w = weatherDef(), m = w.mods || {}, out = [];
    if(skillKey === 'percepcao' && m.percepcao) out.push({ label:'Clima: ' + w.label, value:m.percepcao, cond:true, weather:true });
    if(kind === 'attack' && skillKey === 'pontaria' && m.ranged) out.push({ label:'Clima: ' + w.label, value:m.ranged, cond:true, weather:true });
    return out;
  }
  const weatherTerrainFactor = () => weatherDef().difficult ? 2 : 1;

  const SP_CENTER = [-23.5505, -46.6333];
  const SHAPE_STYLE = { color: 'var(--hazard)', weight: 2, fillColor: 'var(--hazard)', fillOpacity: 0.1, dashArray: '6 4' };
  // estilo de cada área no mapa (todas usam o padrão). Esta função havia se perdido
  // entre commits: sem ela nenhuma área era desenhada, embora continuassem na lista.
  function shapeStyleFor(shape){ return Object.assign({}, SHAPE_STYLE); }

  let pins = [];
  let hudReady = false;     // o módulo do HUD (dock, feed...) liga no fim do arquivo
  let mapEntitiesHook = null; // o mapa tático se registra aqui para acompanhar mudanças nos tokens/pins
  let tokens = [];
  let shapes = [];
  let routes = [];
  const renderedShapeIds = new Set(); // áreas que realmente foram desenhadas no mapa
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
      if(typeof syncGm === 'function') setTimeout(syncGm, 0);
      setTimeout(() => { hudMiniChanged(); hudFeedChanged(); hudQRChanged(); }, 0);
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
  // lugares reais (OpenStreetMap): camada própria, acima da dos pins
  const PLACE_ZOOM = 14, PLACE_MAX_TILES = 20, PLACE_CHUNK = 8, PLACE_TTL = 14 * 864e5, PLACE_TTL_EMPTY = 864e5, PLACE_NEAR_M = 250;
  // tempos da consulta: pergunta ao próximo servidor se o atual demorar PLACE_HEDGE_MS (sem cancelá-lo); cada tentativa e o total têm prazo
  const PLACE_HEDGE_MS = 1800, PLACE_TRY_MS = 14000, PLACE_TOTAL_MS = 22000, PLACE_COOL = 6000;
  const PLACE_API = [
    { name:'overpass-api.de', url:'https://overpass-api.de/api/interpreter' },
    { name:'overpass.private.coffee', url:'https://overpass.private.coffee/api/interpreter' },
    { name:'overpass.kumi.systems', url:'https://overpass.kumi.systems/api/interpreter' }
  ];
  const PLACE_CATS = [
    { id:'saude', label:'Saúde', type:'medico' },
    { id:'mercado', label:'Comércio', type:'suprimentos' },
    { id:'combustivel', label:'Combustível e oficinas', type:'combustivel' },
    { id:'hospedagem', label:'Hospedagem', type:'saque' },
    { id:'seguranca', label:'Segurança', type:'municao' },
    { id:'fe', label:'Locais de fé', type:'saque' }
  ];
  const PLACE_TAGS = {
    amenity:{ hospital:'saude', clinic:'saude', pharmacy:'saude', doctors:'saude', fuel:'combustivel', car_repair:'combustivel', police:'seguranca', fire_station:'seguranca', place_of_worship:'fe', marketplace:'mercado' },
    shop:{ chemist:'saude', supermarket:'mercado', convenience:'mercado', bakery:'mercado', mall:'mercado', general:'mercado', butcher:'mercado', greengrocer:'mercado', hardware:'combustivel', doityourself:'combustivel', car_repair:'combustivel' },
    tourism:{ hotel:'hospedagem', hostel:'hospedagem', guest_house:'hospedagem', motel:'hospedagem' }
  };
  const placesLayer = L.layerGroup().addTo(map);
  // agrupamento de tokens ao afastar o mapa: tokens, NPCs, veículos/abrigos e pilhas que ficariam colados na tela
  // (a menos de CLUSTER_PX) viram um único círculo com o total. Só vale com o mapa afastado (zoom até CLUSTER_MAX_ZOOM).
  const CLUSTER_MAX_ZOOM = 15, CLUSTER_PX = 52;
  const clusterLayer = L.layerGroup().addTo(map);
  const cl = { on:(function(){ try{ return localStorage.getItem('tv-cluster') !== '0'; }catch(e){ return true; } })(), hidden:[] };
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

  try{ localStorage.removeItem('tv-map:hud-layer-collapsed'); }catch(e){}   // o antigo painel recolhível de camadas virou a folha "Camadas"

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

  // preferência antiga do botão "Visual" (removido): limpa o que ficou salvo
  try{ localStorage.removeItem('tv-map:view-prefs'); }catch(e){}

  // ---------- redesign: popovers sob demanda (menu, busca, conta, ações) ----------
  // Registra um par botão-gatilho + popover + backdrop, seguindo o mesmo
  // padrão dos popovers do app. Fechar um popover destes
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

  // (as ferramentas de "Adicionar ao mapa" agora ficam no Índice, que se fecha sozinho ao escolher uma: ver o módulo do dock)

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
      className: 'mk-' + mapfCat(typeId),
      html: `<div class="pin-wrap${lockCls}${sizeCls}">${ping}${occupancyBadge}<div class="pin-badge${hasPhoto ? ' pin-badge-photo' : ''}" style="${badgeStyle}">${badgeInner}</div>${npcNameTag}</div>`,
      iconSize: isBig ? [36,36] : [26,26],
      iconAnchor: isBig ? [18,31] : [13,23],
      popupAnchor: isBig ? [0,-29] : [0,-21]
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
      className: 'mk-tokens',
      html: `<div class="pin-wrap pin-wrap-npc">${stackBadge}<div class="pin-badge${hasPhoto ? ' pin-badge-photo' : ''}" style="${badgeStyle}">${badgeInner}</div>${npcNameTag}</div>`,
      iconSize: [36,36],
      iconAnchor: [18,31],
      popupAnchor: [0,-29]
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
      className: 'mk-tokens',
      html: `<div class="token-wrap">
               <div class="token-icon${isSelected ? ' selected' : ''}${isStack ? ' is-stack' : ''}"${stackAttrs} style="border-color:${escapeHtml(borderColor)}; color:${escapeHtml(borderColor)}">${inner}</div>
               <span class="token-name-tag">${nameLabel}</span>
             </div>`,
      iconSize: [36,56],
      iconAnchor: [18,18]
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
      ${pin.osm ? `<div class="popup-owner">Lugar real · OpenStreetMap${pin.osmTag ? ' · ' + escapeHtml(pin.osmTag) : ''}</div>` : ''}
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
      ${isNpc ? `<button type="button" class="inv-open-btn">${ic('bag', 14)} Inventário (${capTxt(pin.id)})</button>` : ''}
      ${isContainerPin(pin) ? `<button type="button" class="inv-open-btn">${ic('box', 16)} Abrir contêiner · ${escapeHtml(CONT_STATE_LABELS[containerState(pin.id)] || '')}</button>` : ''}
      ${canSearchPin(pin) ? `<button type="button" class="inv-open-btn pin-search-btn">${ic('search', 16)} Vasculhar</button>` : ''}
      <div class="icon-picker-label">Alterar ícone</div>
      <div class="icon-picker icon-picker-inline">${buildIconPickerHtml(pin.type)}</div>
      <div class="popup-actions">
        <button class="save">Salvar</button>
        <button class="lock">${ic(pin.locked ? 'unlock' : 'lock', 14)} ${pin.locked ? 'Destravar' : 'Travar'}</button>
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
    const pinSearchBtn = container.querySelector('.pin-search-btn');
    if(pinSearchBtn) pinSearchBtn.addEventListener('click', async () => { pinSearchBtn.disabled = true; const ok = await generateContainer(pin.id, false); map.closePopup(); if(ok) openInventory(pin.id); });
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
    container.querySelector('.del').addEventListener('click', () => { deletePinById(pin.id); });
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
      <button type="button" class="inv-open-btn">${ic('bag', 14)} Inventário (${capTxt(token.id)})</button>
      <button type="button" class="inv-open-btn ficha-open-btn">${ic('user', 14)} Ficha e dados</button>
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
    container.querySelector('.del').addEventListener('click', () => { deleteTokenById(token.id); });
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
    container.querySelector('.del').addEventListener('click', () => { deleteShapeById(shape.id); });
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
    container.querySelector('.del').addEventListener('click', () => { deleteRouteById(route.id); });
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
    emojiEl.innerHTML = ic(cfg.icon, 16);
    labelEl.textContent = cfg.label;
    badge.title = cfg.eff.length ? cfg.label + ': ' + cfg.eff.join('; ') : cfg.label;
    if(document.getElementById('weather-popover').classList.contains('open')) renderWeatherOptions();
    if(hudReady){ hubChanged(); hudMiniChanged(); hudQRChanged(); if(tacUI.open) tacChanged(); }   // totais da ficha e terreno do tático acompanham o clima
  }

  function renderWeatherOptions(){
    const wrap = document.getElementById('weather-options');
    if(!wrap) return;
    wrap.innerHTML = Object.keys(WEATHER_STATES).map(key => {
      const cfg = WEATHER_STATES[key];
      const isCurrent = key === weather.state;
      return `
        <button type="button" class="weather-option-btn${isCurrent ? ' current' : ''}" data-state="${key}">
          <span class="weather-option-emoji">${ic(cfg.icon, 20)}</span>
          <span class="weather-option-text">
            <span class="weather-option-title">${escapeHtml(cfg.label)}${isCurrent ? ' (atual)' : ''}</span>
            <span class="weather-option-desc">${escapeHtml(cfg.desc)}</span>
            ${cfg.eff.length ? `<span class="weather-option-eff">${cfg.eff.map(x => '<i>' + escapeHtml(x) + '</i>').join('')}</span>` : ''}
          </span>
        </button>
      `;
    }).join('');
    wrap.querySelectorAll('.weather-option-btn').forEach(btn => {
      btn.addEventListener('click', () => setWeatherState(btn.dataset.state));
    });
    if(isMaster() && weatherDef().lightning){
      wrap.insertAdjacentHTML('beforeend', `<button type="button" class="inv-mini-btn weather-lightning" id="weather-lightning">${ic('bolt', 16)} Testar o raio desta rodada (${weatherDef().lightning.chance}%)</button>`);
      document.getElementById('weather-lightning').addEventListener('click', weatherLightning);
    }
    const metaEl = document.getElementById('weather-meta-line');
    if(metaEl) metaEl.textContent = (weather.updatedBy ? `Definido por ${weather.updatedBy}` : '') + (!isMaster() ? (weather.updatedBy ? ' · ' : '') + 'Só o mestre muda o clima.' : '');
  }
  // raio da Tempestade: o mestre testa a cada rodada (10%); se cair, rola 8d12 de eletricidade. Tudo vai para o feed.
  async function weatherLightning(){
    const w = weatherDef(); if(!isMaster() || !w.lightning) return;
    const t = rollTerm({ sign:1, n:1, sides:100 }, makeSource(null)), hit = t.dice[0].v <= w.lightning.chance;
    await opRecord(null, `Raio da ${w.label} (${w.lightning.chance}%): ${hit ? 'CAIU' : 'não caiu'}`, [t], [], { kind:'weather', hit });
    if(hit){
      const pe = parseExpr(w.lightning.dice), res = pe.terms.map(x => rollTerm(x, makeSource(null)));
      await opRecord(null, `Raio · ${w.lightning.dice} de eletricidade`, res, [], { kind:'weather', damage:true });
    }
  }

  async function setWeatherState(newState){
    if(!WEATHER_STATES[newState] || newState === weather.state){ closeWeatherPopover(); return; }
    // com um mestre definido, só ele muda o clima (campanha sem mestre continua aberta a todos)
    if(!isMaster()){ toast('Só o mestre muda o clima.', true); closeWeatherPopover(); return; }
    const prevState = weather.state;
    weather = { state: newState, updatedAt: Date.now(), updatedBy: currentPlayer ? currentPlayer.playerName : null };
    applyWeatherVisual();
    closeWeatherPopover();
    await saveKey(KEY_WEATHER, weather);
    sendWeatherNarrationToDiscord(prevState, newState);
    logEvent(`Clima: ${WEATHER_STATES[prevState].label} → ${WEATHER_STATES[newState].label}` + (WEATHER_STATES[newState].eff.length ? ' (' + WEATHER_STATES[newState].eff.join('; ') + ')' : ''), 'clima', { wx:newState });
  }

  async function sendWeatherNarrationToDiscord(prevState, newState){
    const url = (typeof currentWebhookUrl === 'function') ? currentWebhookUrl() : '';
    if(!url) return;
    const cfg = WEATHER_STATES[newState];
    const payload = {
      username: "Tau Volantis — Registro de Saque",
      embeds: [{
        title: `${cfg.emoji} Clima: ${cfg.label}`,
        description: cfg.desc + (cfg.eff.length ? '\n' + cfg.eff.map(x => '• ' + x).join('\n') : ''),
        color: newState === 'espectral' ? 0xc9433f : (/nevasca/.test(newState) ? 0x3f8fd1 : (newState === 'tempestade' ? 0x6a5fba : 0x7d909b)),
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
  function renderPins(){ renderPinsCore(); if(mapEntitiesHook) mapEntitiesHook(); plDraw(); clusterUpdate(); }
  function renderPinsCore(){
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
    mapfRender();
    if(typeof renderNavList === 'function') renderNavList();
  }
  // ---------- exclusões (usadas pelos popups e pela lista de navegação) ----------
  function deletePinById(id){
    const pin = pins.find(p => p.id === id);
    if(!pin) return false;
    const isNpc = isHolderPin(pin);
    if(isNpc && invCount(pin.id) > 0 &&
       !window.confirm(`${pin.type === 'npc' ? 'Este NPC' : 'Este contêiner'} tem ${invCount(pin.id)} item(ns) no inventário. Excluir apaga o inventário (a perda fica no registro). Continuar?`)) return false;
    if(isNpc) removeHolderInventory(pin.id, pin.type === 'npc' ? 'NPC excluído' : 'contêiner excluído');
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
    // salva em segundo plano: a exclusão já aconteceu na tela
    saveKey(KEY_PINS, pins);
    if(releasedTokens) saveKey(KEY_TOKENS, tokens);
    return true;
  }
  function deleteTokenById(id){
    const token = tokens.find(t => t.id === id);
    if(!token) return false;
    if(invCount(token.id) > 0 &&
       !window.confirm(`Este token tem ${invCount(token.id)} item(ns) no inventário. Remover apaga o inventário (a perda fica no registro). Continuar?`)) return false;
    removeHolderInventory(token.id, 'token removido');
    tokens = tokens.filter(t => t.id !== token.id);
    renderTokens();
    map.closePopup();
    saveKey(KEY_TOKENS, tokens);
    return true;
  }
  function deleteShapeById(id){
    shapes = shapes.filter(s => s.id !== id);
    renderShapes();
    map.closePopup();
    saveKey(KEY_SHAPES, shapes);
  }
  function deleteRouteById(id){
    routes = routes.filter(r => r.id !== id);
    renderRoutes();
    map.closePopup();
    saveKey(KEY_ROUTES, routes);
  }
  // por que uma área não aparece no mapa (null = está tudo bem)
  function shapeProblem(shape){
    if(!renderedShapeIds.has(shape.id)) return 'não pôde ser desenhada';
    if(shape.type === 'circle' && !(shape.radius >= 3)) return 'raio zero ou minúsculo';
    return null;
  }
  function deleteBrokenShapes(){
    const bad = shapes.filter(s => shapeProblem(s));
    if(!bad.length) return;
    if(!window.confirm(`Excluir ${bad.length} área(s) que não aparecem no mapa? Áreas visíveis não são tocadas.`)) return;
    const ids = new Set(bad.map(s => s.id));
    shapes = shapes.filter(s => !ids.has(s.id));
    renderShapes();
    saveKey(KEY_SHAPES, shapes);
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


  // ---------- agrupamento de tokens ao afastar o mapa ----------
  // Não mexe nos marcadores de verdade: só esconde (classe cl-hide) os que entraram num círculo de grupo e os mostra
  // de volta ao aproximar. Roda depois de cada desenho de tokens/pins e a cada mudança de zoom.
  function clEntities(){
    const out = [], off = k => hudReady && hud.mapf.has(k);
    tokensLayer.eachLayer(m => {
      if(!m.getLatLng || !m._icon || off('tokens')) return;
      out.push({ m, n:m._clCount || 1, ll:m.getLatLng(), kind:m._groupId ? 'pilha' : 'token' });
    });
    pins.forEach(p => {
      if(p.type !== 'npc' && p.type !== 'veiculo' && p.type !== 'abrigo') return;
      const m = pinMarkers[p.id]; if(!m || !m._icon || !pinsLayer.hasLayer(m) || off(mapfCat(p.type))) return;
      out.push({ m, n:1, ll:m.getLatLng(), kind:p.type });
    });
    return out;
  }
  function clearClusters(){
    clusterLayer.clearLayers();
    cl.hidden.forEach(m => { if(m._icon) m._icon.classList.remove('cl-hide'); });
    cl.hidden = [];
  }
  function clusterUpdate(){
    if(!hudReady) return;
    clearClusters();
    if(!cl.on || tokenSelectMode || tokenDragActive || pinDraggingId || map.getZoom() > CLUSTER_MAX_ZOOM) return;
    const ents = clEntities().map(e => Object.assign(e, { pt:map.latLngToLayerPoint(e.ll) }));
    if(ents.length < 2) return;
    ents.sort((a, b) => (a.pt.x - b.pt.x) || (a.pt.y - b.pt.y));
    const groups = [];
    ents.forEach(e => {
      let g = null, best = CLUSTER_PX;
      groups.forEach(c => { const d = Math.hypot(c.x - e.pt.x, c.y - e.pt.y); if(d < best){ best = d; g = c; } });
      if(g){ g.items.push(e); g.n += e.n; g.x += (e.pt.x - g.x) / g.items.length; g.y += (e.pt.y - g.y) / g.items.length; }
      else groups.push({ x:e.pt.x, y:e.pt.y, n:e.n, items:[e] });
    });
    groups.filter(g => g.items.length > 1).forEach(g => {
      g.items.forEach(e => { e.m._icon.classList.add('cl-hide'); cl.hidden.push(e.m); });
      const cnt = { token:0, npc:0, veiculo:0, abrigo:0 };
      g.items.forEach(e => { if(e.kind === 'pilha') cnt.token += e.n; else cnt[e.kind] += e.n; });
      const parts = [];
      if(cnt.token) parts.push(cnt.token + (cnt.token === 1 ? ' token' : ' tokens'));
      if(cnt.npc) parts.push(cnt.npc + (cnt.npc === 1 ? ' NPC' : ' NPCs'));
      if(cnt.veiculo) parts.push(cnt.veiculo + (cnt.veiculo === 1 ? ' veículo' : ' veículos'));
      if(cnt.abrigo) parts.push(cnt.abrigo + (cnt.abrigo === 1 ? ' abrigo' : ' abrigos'));
      const label = 'Grupo de ' + g.n + ' no mapa: ' + parts.join(', ') + '. Toque para aproximar.';
      const pts = g.items.map(e => e.ll);
      const mk = L.marker(map.layerPointToLatLng(L.point(g.x, g.y)), {
        icon:L.divIcon({ className:'cl-mk', iconSize:[44, 44], iconAnchor:[22, 22], html:`<div class="cl-badge"><b>${g.n > 99 ? '99+' : g.n}</b></div>` }),
        title:label, keyboard:true, zIndexOffset:600
      });
      const go = () => map.fitBounds(L.latLngBounds(pts), { padding:[80, 80], maxZoom:CLUSTER_MAX_ZOOM + 2 });
      mk.on('click', e => { L.DomEvent.stopPropagation(e); go(); });
      mk.on('keypress', e => { const k = e.originalEvent; if(k && (k.key === 'Enter' || k.key === ' ' || k.keyCode === 13 || k.keyCode === 32)){ if(k.preventDefault) k.preventDefault(); go(); } });   // teclado: Enter ou espaço
      mk.addTo(clusterLayer);
    });
    // um popup aberto num marcador que acabou de ser escondido ficaria solto na tela
    const src = map._popup && map._popup._source;
    if(src && cl.hidden.indexOf(src) >= 0) map.closePopup();
  }
  function clusterSetOn(on){
    cl.on = !!on;
    try{ localStorage.setItem('tv-cluster', cl.on ? '1' : '0'); }catch(e){}
    clusterSync(); clusterUpdate();
  }
  function clusterSync(){
    const b = document.getElementById('cluster-toggle'); if(!b) return;
    b.classList.toggle('active', cl.on); b.setAttribute('aria-pressed', String(cl.on));
    b.textContent = cl.on ? 'Agrupar ao afastar: ligado' : 'Agrupar ao afastar: desligado';
  }

  function renderTokens(){ renderTokensCore(); if(mapEntitiesHook) mapEntitiesHook(); hudMiniChanged(); mapfRender(); plDraw(); plWarmSoon(); clusterUpdate(); }
  function renderTokensCore(){
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
      marker._groupId = gid; marker._clCount = members.length;
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
    renderedShapeIds.clear();
    // cada forma é desenhada isoladamente: uma forma com dado quebrado não
    // pode mais impedir o desenho das outras
    shapes.forEach(shape => {
      try{
        let layer;
        const style = shapeStyleFor(shape);
        if(shape.type === 'circle' && shape.center && typeof shape.radius === 'number'){
          layer = L.circle(shape.center, Object.assign({ radius: shape.radius }, style));
        } else {
          layer = L.geoJSON(shape.geojson, { style: style });
        }
        if(layer instanceof L.Circle){
          // getBounds() de círculo exige estar no mapa: valida centro e raio direto
          const c = shape.center;
          if(!Array.isArray(c) || !isFinite(c[0]) || !isFinite(c[1]) || !isFinite(shape.radius) || shape.radius <= 0) throw new Error('círculo inválido');
        } else {
          const bounds = layer.getBounds ? layer.getBounds() : null;
          if(bounds && !bounds.isValid()) throw new Error('forma sem geometria');
        }
        layer._shapeId = shape.id;
        if(shape.label){
          layer.bindTooltip(shape.label, { permanent:true, direction:'center', className:'shape-label' });
        }
        layer.bindPopup(() => buildShapePopupContent(shape));
        layer.addTo(shapesLayer);
        renderedShapeIds.add(shape.id);
      }catch(err){
        console.warn('Área não pôde ser desenhada:', shape && shape.id, err && err.message);
      }
    });
    mapfRender();
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
    mapfRender();
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
  // (antes era uma gaveta lateral; agora é a folha "Camadas": mapa-base + filtros + esta lista)
  const navDrawer = document.getElementById('lay-sheet');
  const navDrawerBackdrop = document.getElementById('lay-backdrop');
  const navSearchInput = document.getElementById('nav-search-input');
  function openNavDrawer(){
    closeDrawerIfOpen();
    renderNavList();
    hudOpenSheet('lay-sheet');
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

    function fill(container, items, emptyMsg, headerHtml){
      const filtered = q ? items.filter(it => it.name.toLowerCase().includes(q)) : items;
      container.innerHTML = '';
      if(headerHtml){
        const hd = document.createElement('div');
        hd.innerHTML = headerHtml;
        container.appendChild(hd.firstElementChild);
      }
      if(filtered.length === 0){
        container.insertAdjacentHTML('beforeend', `<div class="nav-empty">${emptyMsg}</div>`);
        return;
      }
      filtered.forEach(it => {
        const row = document.createElement('div');
        row.className = 'nav-row' + (it.bad ? ' nav-row-bad' : '');
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'nav-item';
        btn.innerHTML = `<span class="nav-item-dot" style="background:${it.color}"></span><span class="nav-item-name">${escapeHtml(it.name)}</span><span class="nav-item-type">${it.typeLabel}</span>`;
        if(it.go) btn.addEventListener('click', it.go); else btn.disabled = true;
        row.appendChild(btn);
        if(it.remove){
          const del = document.createElement('button');
          del.type = 'button';
          del.className = 'nav-del';
          del.innerHTML = ic('trash', 16); del.setAttribute('aria-label', del.getAttribute('aria-label') || 'Excluir');
          del.title = 'Excluir';
          del.setAttribute('aria-label', 'Excluir ' + it.name);
          del.addEventListener('click', (ev) => { ev.stopPropagation(); it.remove(); });
          row.appendChild(del);
        }
        container.appendChild(row);
      });
    }

    const pinItems = pins.map(p => {
      const name = p.title || (PIN_TYPES.find(t=>t.id===p.type)||{}).label || 'Pin';
      return {
        name,
        color: (PIN_TYPES.find(t=>t.id===p.type)||{}).color || 'var(--ice-100)',
        typeLabel: p.locked ? 'Pin (travado)' : 'Pin',
        go: () => {
          closeNavDrawer(); mapfReveal(mapfCat(p.type), true);
          map.flyTo([p.lat, p.lng], Math.max(map.getZoom(), 16));
          setTimeout(() => openPinPopupById(p.id), 400);
        },
        remove: () => {
          // NPC com itens já tem a própria confirmação (que avisa do inventário)
          if(!(isHolderPin(p) && invCount(p.id) > 0) && !window.confirm(`Excluir o pin "${name}"?`)) return;
          deletePinById(p.id);
        }
      };
    });
    fill(listPins, pinItems, 'Nenhum pin no mapa ainda.');

    const tokenItems = tokens.map(t => {
      const name = t.label || 'Token';
      return {
        name,
        color: t.color || '#8fd7e8',
        typeLabel: 'Token',
        go: () => {
          closeNavDrawer(); mapfReveal('tokens', true);
          map.flyTo([t.lat, t.lng], Math.max(map.getZoom(), 16));
          setTimeout(() => openTokenPopupById(t.id), 400);
        },
        remove: () => {
          if(invCount(t.id) === 0 && !window.confirm(`Remover o token "${name}"?`)) return;
          deleteTokenById(t.id);
        }
      };
    });
    fill(listTokens, tokenItems, 'Nenhum token no mapa ainda.');

    // áreas: as que não aparecem no mapa continuam na lista, marcadas, para
    // poderem ser excluídas (antes elas ficavam "invisíveis" e sem como apagar)
    const shapeItems = [];
    let brokenShapes = 0;
    shapes.forEach(s => {
      let center = null;
      if(s.type === 'circle' && s.center) center = s.center;
      else if(s.geojson){ try{ center = L.geoJSON(s.geojson).getBounds().getCenter(); }catch(e){} }
      const problem = shapeProblem(s);
      if(problem) brokenShapes++;
      const name = s.label || 'Área sem nome';
      shapeItems.push({
        name,
        color: 'var(--hazard)',
        typeLabel: problem ? 'Área (sem forma)' : 'Área',
        bad: !!problem,
        go: (center && !problem) ? () => {
          closeNavDrawer(); mapfReveal('perigos', true);
          map.flyTo(center, Math.max(map.getZoom(), 15));
          setTimeout(() => openShapePopupById(s.id), 400);
        } : null,
        remove: () => { if(window.confirm(`Excluir a área "${name}"?`)) deleteShapeById(s.id); }
      });
    });
    fill(listShapes, shapeItems, 'Nenhuma área marcada ainda.', brokenShapes
      ? `<div class="nav-warning">${ic('alert', 14)} ${brokenShapes} área(s) não aparecem no mapa. <button type="button" class="nav-bulk">Excluir essas ${brokenShapes}</button></div>` : '');
    const bulk = listShapes.querySelector('.nav-bulk');
    if(bulk) bulk.addEventListener('click', deleteBrokenShapes);

    const routeItems = [];
    routes.forEach(r => {
      const hasPts = r.points && r.points.length;
      const mid = hasPts ? r.points[Math.floor(r.points.length/2)] : null;
      const name = r.label || 'Rota sem nome';
      routeItems.push({
        name,
        color: 'var(--frost)',
        typeLabel: hasPts ? 'Rota' : 'Rota (sem pontos)',
        bad: !hasPts,
        go: hasPts ? () => {
          closeNavDrawer(); mapfReveal('rotas', true);
          map.flyTo(mid, Math.max(map.getZoom(), 15));
          setTimeout(() => openRoutePopupById(r.id), 400);
        } : null,
        remove: () => { if(window.confirm(`Excluir a rota "${name}"?`)) deleteRouteById(r.id); }
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

  // ---------- ícones dos itens ----------
  // Ícones de verdade (game-icons.net, CC BY 3.0), vindos de tv-icons.js. Nome
  // reconhecível → ícone específico; o resto usa o ícone do tipo do item.
  const GI = window.TV_ICONS || {};
  // categorias novas do catálogo ampliado ganham ícone aqui; as regras extras só valem para nomes que as de tv-icons.js não reconhecem
  const CAT_ICONS = Object.assign({ 'Higiene e Itens Pessoais':'rolled-cloth', 'Lazer e Itens Pessoais':'book-pile' }, window.TV_CAT_ICONS || {});
  const EXTRA_ICON_RULES = [
    ['\\b(guia|manual|cartilha|revista)\\b', 'book-pile'], ['\\b(calendario|recibo)\\b', 'notebook'],
    ['\\b(aveia|lentilha|granola|castanhas?|grao-de-bico)\\b', 'bowl-of-rice'], ['\\bpipoca\\b', 'corn'], ['\\bsalame\\b', 'sausage'],
    ['\\bpasta de amendoim\\b', 'honey-jar'], ['\\b(colchonete|forro termico)\\b', 'sleeping-bag'], ['\\btoldo\\b', 'camping-tent'],
    ['\\bmegafone\\b', 'aerial-signal'], ['\\bcarregador portatil\\b', 'battery-75'], ['\\bbalaclava\\b', 'hood'],
    ['\\bmacacao\\b', 'hoodie'], ['\\btoalha\\b', 'rolled-cloth']
  ];
  const ICON_RULES = (window.TV_ICON_RULES || []).concat(EXTRA_ICON_RULES.filter(r => GI[r[1]])).map(r => [new RegExp(r[0]), r[1]]);
  const ICON_CACHE = {};
  function normName(s){ return String(s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''); }
  function itemIconName(item){
    if(!item) return 'hole';
    const key = item.id != null ? 'i' + item.id : 'n' + item.name;
    if(ICON_CACHE[key]) return ICON_CACHE[key];
    // "sem bateria", "sem combustível"...: o que falta não define o item
    const n = normName(item.name).replace(/\bsem [a-z]+/g, '');
    let ic = null;
    for(const r of ICON_RULES){ if(r[0].test(n)){ ic = r[1]; break; } }
    return (ICON_CACHE[key] = ic || CAT_ICONS[item.category] || 'wooden-crate');
  }
  function svgIcon(name){
    return `<svg class="gi" viewBox="0 0 512 512" data-icon="${name}" aria-hidden="true" focusable="false">${GI[name] || GI['wooden-crate'] || ''}</svg>`;
  }
  function iconHtml(item){ return `<span class="item-icon" aria-hidden="true">${svgIcon(itemIconName(item))}</span>`; }

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

  // ---------- ficha do item: volume, capacidades, efeitos sugeridos, validade, isolamento, dano ----------
  // Todos os campos são opcionais e só informam: nenhum número é aplicado sozinho (a mesa decide).
  const TAG_LABELS = { corte:'Corta', perfurar:'Fura', martelar:'Martela', serrar:'Serra', escavar:'Escava', alavanca:'Alavanca', arrombar:'Arromba', aperto:'Aperta e solta',
    solda:'Solda', fogo:'Acende fogo', calor:'Dá calor', cozinhar:'Cozinha', luz:'Ilumina', sinalizar:'Sinaliza', filtrar:'Filtra água', recipiente:'Guarda líquido',
    carregar:'Carrega', amarrar:'Amarra', costurar:'Costura', reparo:'Reparo', energia:'Energia', combustivel:'Combustível', inflamavel:'Inflamável', explosivo:'Explosivo',
    comunicar:'Comunica', orientar:'Orienta', observar:'Observa', registrar:'Registra', pescar:'Pesca', cacar:'Caça', armadilha:'Armadilha', cultivo:'Cultivo',
    curativo:'Trata ferida', desinfetar:'Desinfeta', medicamento:'Remédio', imobilizar:'Imobiliza', toxico:'Tóxico', isolante:'Isolante', impermeavel:'Impermeável',
    protecao:'Proteção', abrigo:'Abrigo', barricada:'Barricada', comestivel:'Comida', bebivel:'Bebida', perecivel:'Estraga', enlatado:'Conserva', cru:'Cru',
    alcoolico:'Alcoólico', estimulante:'Estimulante', arma:'Arma', municao:'Munição', anomalo:'Anômalo', pista:'Pista', valioso:'Escambo', conforto:'Conforto',
    veiculo:'Veículo', material:'Material', madeira:'Madeira', metal:'Metal', tecido:'Tecido', couro:'Couro', plastico:'Plástico', vidro:'Vidro', borracha:'Borracha',
    papel:'Papel', eletronico:'Eletrônico' };
  const MATERIAL_TAGS = ['madeira','metal','tecido','couro','plastico','vidro','borracha','papel','eletronico'];
  const FACT_HIDE_TAGS = ['arma','perecivel','municao','anomalo','comestivel','bebivel'];
  const NEED_WORD = { fome:'fome', sede:'sede', fadiga:'fadiga', exposicao:'exposição', estresse:'estresse', ferimentos:'ferimentos' };
  function tagLabel(t){ return TAG_LABELS[t] || t; }
  function itemFactParts(item, o){
    const out = [];
    if(!item) return out;
    const full = !!(o && o.full);
    if(typeof item.esp === 'number') out.push({ t:item.esp === 0 ? 'Sem volume' : 'Volume ' + item.esp, c:'vol', h:'Espaço que ocupa, de 0 a 4' });
    if(item.dano) out.push({ t:'Dano ' + item.dano + ' · ' + (item.crit || '20/x2') + ' · ' + (item.alc || 'corpo a corpo') + (item.dtipo ? ' · ' + item.dtipo : ''), c:'weapon', h:'Números sugeridos; a mesa ajusta' });
    if(item.cura) out.push({ t:'Cura ~' + item.cura + ' PV', c:'good', h:'Sugestão; a mesa decide' });
    if(item.fx) Object.keys(item.fx).forEach(k => {
      const v = item.fx[k];
      if(v && NEED_WORD[k]) out.push({ t:(v < 0 ? 'Alivia ' : 'Agrava ') + NEED_WORD[k] + ' ' + Math.abs(v), c:v < 0 ? 'good' : 'bad', h:'Sugestão; a mesa decide' });
    });
    if(item.iso > 0) out.push({ t:'Isolamento ' + item.iso + '/4', c:'iso', h:'Quanto segura o calor do corpo' });
    if(item.prot > 0) out.push({ t:'Proteção ' + item.prot + '/3', c:'iso', h:'Proteção contra dano físico' });
    if(item.perece) out.push({ t:'Estraga em ~' + item.perece + (item.perece === 1 ? ' dia' : ' dias'), c:'bad', h:'Sem conservar' });
    const tags = item.tags || [];
    tags.filter(t => !FACT_HIDE_TAGS.includes(t) && !MATERIAL_TAGS.includes(t)).slice(0, full ? 6 : 4).forEach(t => out.push({ t:tagLabel(t), c:'tag' }));
    if(full){ const m = tags.filter(t => MATERIAL_TAGS.includes(t)); if(m.length) out.push({ t:m.map(tagLabel).join(', '), c:'mat', h:'Material' }); }
    return out;
  }
  function itemFactsHtml(item, o){
    const p = itemFactParts(item, o);
    return p.length ? `<div class="item-facts">${p.map(x => `<span class="fact fact-${x.c}"${x.h ? ` title="${escapeHtml(x.h)}"` : ''}>${escapeHtml(x.t)}</span>`).join('')}</div>` : '';
  }
  function itemFactsText(item){ return itemFactParts(item, {}).filter(x => x.c !== 'tag').map(x => x.t).join(' · '); }

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
  const webhookMode = document.getElementById('webhook-mode');
  // Webhook fixo da mesa: trocar aqui se um dia ele for renovado no Discord.
  // Atenção: este arquivo é público, então quem abrir o site consegue ler este link.
  const FIXED_WEBHOOK_URL = 'https://discord.com/api/webhooks/1529516260893655162/DEa2KT9Z-PiN4ClFrGc_XuaiXYj1-XLgLpvlYxqujMETdpTeoFEvyDiKRQazfFSCxpxm';
  try{
    webhookMode.value = localStorage.getItem('tv-map:webhook-mode') || 'fixed';
    webhookInput.value = localStorage.getItem('tv-map:webhook-custom') || '';
  }catch(e){}
  if(!webhookMode.value) webhookMode.value = 'fixed';
  function syncWebhookUi(){
    webhookInput.style.display = webhookMode.value === 'custom' ? '' : 'none';
    try{ localStorage.setItem('tv-map:webhook-mode', webhookMode.value); }catch(e){}
  }
  webhookMode.addEventListener('change', syncWebhookUi);
  webhookInput.addEventListener('input', () => { try{ localStorage.setItem('tv-map:webhook-custom', webhookInput.value.trim()); }catch(e){} });
  syncWebhookUi();
  // link realmente usado nos envios (saque, clima e dados)
  function currentWebhookUrl(){
    if(webhookMode.value === 'fixed') return FIXED_WEBHOOK_URL;
    if(webhookMode.value === 'custom') return webhookInput.value.trim();
    return '';
  }
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
  function baseWeight(item, locKey){
    if (item.category === "Armas de Fogo" || item.category === "Munição") {
      return locKey === "bases" ? 6 : (RURAL_LOCS.includes(locKey) ? 2 : 1);
    }
    if (item.category === "Itens Anômalos e Paranormais") {
      return 3;
    }
    return 10;
  }
  // `rar` (1 comum, 2 incomum, 3 raro) vem do catálogo ampliado e só reduz o peso: o que já era raro por categoria continua raro
  function getWeight(item, locKey){
    const w = baseWeight(item, locKey);
    if (item.rar === 3) return w * (w < 10 ? 0.45 : 0.22);
    if (item.rar === 2) return w * (w < 10 ? 0.75 : 0.55);
    return w;
  }
  function rarityInfo(item, locKey){
    const w = baseWeight(item, locKey);
    let lvl = w <= 1 ? 3 : (w <= 3 ? 2 : 1);
    if (item.rar === 2 || item.rar === 3) lvl = Math.max(lvl, item.rar);
    if (lvl === 3) return {label:"Raro", cls:"rarity-raro"};
    if (lvl === 2) return {label:"Incomum", cls:"rarity-incomum"};
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

  // ---------- animação de busca: roleta de itens e revelação um a um ----------
  const lootStage = document.getElementById('loot-stage');
  const fishStage = document.getElementById('fish-stage');
  const animBox = document.getElementById('search-anim');
  try{ animBox.checked = localStorage.getItem('tv-map:search-anim') !== 'off'; }catch(e){}
  animBox.addEventListener('change', () => { try{ localStorage.setItem('tv-map:search-anim', animBox.checked ? 'on' : 'off'); }catch(e){} });
  let searching = false;
  function animEnabled(){
    if(!animBox.checked) return false;
    // quem pediu menos movimento no aparelho vê o resultado direto
    try{ if(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false; }catch(e){}
    return true;
  }
  function setSearchBusy(on){
    searching = on;
    document.querySelectorAll('#loc-grid .loc-card, #loc-grid-rural .loc-card, #fish-btn').forEach(b => { b.disabled = on; });
  }
  // O resultado já foi sorteado e registrado antes de a animação começar:
  // ela é só visual (fechar a página no meio não muda nada).
  function playSearch(opts){
    const stage = opts.stage, pool = opts.pool, found = opts.found;
    return new Promise(resolve => {
      let skipped = false, finished = false;
      const timers = [];
      const wait = ms => new Promise(r => { timers.push(setTimeout(r, ms)); });
      stage.hidden = false;
      stage.innerHTML = `
        <div class="ss-head"><span class="ss-title"></span><button type="button" class="ss-skip">Pular</button></div>
        <div class="ss-reel" aria-hidden="true"><div class="ss-row ss-prev"></div><div class="ss-row ss-cur"></div><div class="ss-row ss-next"></div></div>
        <div class="ss-found"></div>`;
      const titleEl = stage.querySelector('.ss-title'), reel = stage.querySelector('.ss-reel');
      const rPrev = stage.querySelector('.ss-prev'), rCur = stage.querySelector('.ss-cur'), rNext = stage.querySelector('.ss-next');
      const foundBox = stage.querySelector('.ss-found');
      titleEl.textContent = opts.title;
      const rowHtml = it => `<span class="item-icon" aria-hidden="true">${svgIcon(it._icon || itemIconName(it))}</span><span class="ss-name">${escapeHtml(it.name)}</span>`;
      const rand = prev => {
        let it, g = 0;
        do{ it = pool[Math.floor(Math.random() * pool.length)]; }while(it === prev && pool.length > 1 && g++ < 6);
        return it;
      };
      const paint = (a, b, c2, landed) => {
        rPrev.innerHTML = rowHtml(a); rCur.innerHTML = rowHtml(b); rNext.innerHTML = rowHtml(c2);
        rCur.classList.toggle('ss-landed', !!landed);
      };
      const finish = () => {
        if(finished) return;
        finished = true;
        timers.forEach(clearTimeout);
        stage.hidden = true; stage.innerHTML = '';
        resolve();
      };
      stage.querySelector('.ss-skip').addEventListener('click', () => { skipped = true; finish(); });
      async function spinTo(target, steps, endDelay){
        let cur = rand(null), nxt = rand(cur), prv = rand(cur);
        for(let i = 0; i < steps && !skipped; i++){
          const t = steps > 1 ? i / (steps - 1) : 1;
          prv = cur; cur = nxt; nxt = rand(cur);
          paint(prv, cur, nxt, false);
          reel.classList.remove('ss-tick'); void reel.offsetWidth; reel.classList.add('ss-tick');
          await wait(55 + (endDelay - 55) * t * t);   // desacelera até parar
        }
        if(skipped) return;
        paint(rand(target._icon ? null : target), target, rand(target._icon ? null : target), true);
      }
      (async () => {
        for(let k = 0; k < found.length && !skipped; k++){
          titleEl.textContent = found.length > 1 ? `${opts.title} (${k + 1}/${found.length})` : opts.title;
          await spinTo(found[k], k === 0 ? 14 : 9, k === 0 ? 220 : 180);
          if(skipped) return;
          const it = found[k], rar = opts.rarity ? opts.rarity(it) : null;
          const chip = document.createElement('div');
          chip.className = 'ss-chip' + (it.category === 'Itens Anômalos e Paranormais' ? ' ss-anom' : '');
          chip.innerHTML = `${iconHtml(it)}<span class="ss-chip-name">${escapeHtml(it.name)}</span>${rar ? `<span class="rarity-tag ${rar.cls}">${rar.label}</span>` : ''}`;
          foundBox.appendChild(chip);
          await wait(380);
        }
        if(!found.length && !skipped){
          await spinTo({ name: opts.emptyText || 'Nada de útil aqui', _icon: 'hole', category: '' }, 14, 220);
          if(skipped) return;
          await wait(380);
        }
        if(skipped) return;
        await wait(450);
        finish();
      })();
    });
  }

  // quantos itens uma busca rende (configurável por campanha: mínimo e máximo)
  function lootCount(){
    const c = cfg();
    return c.lootMin + Math.floor(Math.random() * (c.lootMax - c.lootMin + 1));
  }
  function rollLoot(locKey){
    if(searching) return;
    const pool = byLoc[locKey].slice();
    const tok = selectedToken();
    const lf = locFields(tok);
    if(!exploreGate(lf)) return;
    let count = lootCount();
    // local com reserva: não dá para achar mais do que ainda resta
    const pin = lf.pinId ? pins.find(p => p.id === lf.pinId) : null;
    if(pin && pin.explore && typeof pin.explore.reserve === 'number') count = Math.min(count, pin.explore.reserve);
    count = Math.min(count, pool.length);
    const items = [];
    for(let i = 0; i < count; i++){
      const it = weightedPick(pool, locKey);
      items.push({ item: it, decision: 'pending' });
      pool.splice(pool.indexOf(it), 1); // sem repetir item na mesma busca
    }
    const entry = Object.assign({kind:'loot', items, locKey, uid: ++lootUid, searchId: newUid('sr'), sendState: 'idle', foundBy: playerName(), holderId: tok ? tok.id : null}, lf);
    explorePostRoll(entry);
    logFound(entry);
    if (autoSendBox.checked) sendLootToDiscord(entry);
    const show = () => { lootHistory.unshift(entry); renderLootResults(); };
    if(!animEnabled()){ show(); return; }
    setSearchBusy(true);
    playSearch({ stage:lootStage, title:`Vasculhando ${LOC_NAMES[locKey]}…`, pool:byLoc[locKey], found:items.map(x => x.item),
      rarity:it => rarityInfo(it, locKey), emptyText:'Nada de útil aqui' }).then(() => { setSearchBusy(false); show(); });
  }

  function renderLootResults(){
    if(lootHistory.length === 0){
      const c = cfg();
      resultZone.innerHTML = `<div class="empty-hint">Nenhuma busca realizada ainda. Clique em um local acima para vasculhar. Cada busca rende de ${c.lootMin} a ${c.lootMax} item(ns) e você escolhe o que levar.</div>`;
      return;
    }
    resultZone.innerHTML = '';
    const clearBtn = document.createElement('button');
    clearBtn.className = 'clear-btn';
    clearBtn.textContent = 'Limpar histórico';
    clearBtn.addEventListener('click', () => { flushPending(lootHistory); lootHistory = []; renderLootResults(); });

    lootHistory.slice(0, 25).forEach((entry) => {
      const {locKey, foundBy} = entry;
      const its = entry.items || [];
      const anomalo = its.some(x => x.item.category === 'Itens Anômalos e Paranormais');
      const card = document.createElement('div');
      card.className = 'result-card' + (anomalo ? ' anomalo' : '');
      card.dataset.uid = entry.uid;
      card.innerHTML = `
        <div class="result-top">
          <div class="result-loc">Buscado em: ${LOC_NAMES[locKey]}</div>
          <div class="found-by">Encontrado por: ${escapeHtml(foundBy)}</div>
        </div>
        ${its.length ? `<div class="loot-count">${its.length} item(ns) encontrado(s)</div>` : '<div class="result-name">Nada de útil aqui</div><div class="result-utility">A busca não rendeu nada desta vez.</div>'}
        <div class="loot-items"></div>
        ${coordHtml(entry)}
        <div class="send-row">
          <button class="send-btn" data-action="send">Enviar ao Discord</button>
          <span class="send-status" data-role="status">${lootStatusText(entry)}</span>
        </div>
      `;
      const box = card.querySelector('.loot-items');
      const bulk = buildBulkBar(entry);
      if(bulk) box.appendChild(bulk);
      its.forEach((it, i) => {
        const item = it.item;
        const rarity = rarityInfo(item, locKey);
        const row = document.createElement('div');
        row.className = 'loot-item' + (item.category === 'Itens Anômalos e Paranormais' ? ' anomalo' : '') + (it.decision === 'declined' ? ' declined' : '');
        row.innerHTML = `
          <div class="result-name">${iconHtml(item)}${item.name}<span class="rarity-tag ${rarity.cls}">${rarity.label}</span></div>
          <span class="result-cat">${item.category}</span>
          <div class="result-utility"><b>Utilidade:</b> ${item.utility}</div>
          ${itemFactsHtml(item)}
          ${compatLine(item)}`;
        row.appendChild(buildItemDecision(entry, i, its.length === 1));
        box.appendChild(row);
      });
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
    const url = currentWebhookUrl();
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
      const {locKey, foundBy, coord} = entry;
      const its = (entry.items || []).map(x => x.item);
      const base = [
        { name: "Local", value: LOC_NAMES[locKey], inline: true },
        { name: "Encontrado por", value: foundBy, inline: true }
      ];
      if(coord) base.push({ name: "Local aproximado (lat, lng)", value: coord, inline: true });
      const anyAnom = its.some(i => i.category === 'Itens Anômalos e Paranormais');
      if(its.length === 0){
        payload = { username: "Tau Volantis — Registro de Saque", embeds: [{ title: "Nada de útil encontrado",
          description: "A busca não rendeu nada desta vez.", color: 0x26333d, fields: base,
          footer: { text: "Tau Volantis: Ano 0" }, timestamp: new Date().toISOString() }] };
      } else if(its.length === 1){
        const item = its[0], rarity = rarityInfo(item, locKey);
        payload = { username: "Tau Volantis — Registro de Saque", embeds: [{ title: item.name, description: item.utility,
          color: anyAnom ? 0xd3572a : 0x3d6c8a,
          fields: [base[0], { name: "Categoria", value: item.category, inline: true }, { name: "Raridade", value: rarity.label, inline: true }].concat(base.slice(1)).concat(itemFactsText(item) ? [{ name: "Ficha", value: itemFactsText(item).slice(0, 1024) }] : []),
          footer: { text: "Tau Volantis: Ano 0" }, timestamp: new Date().toISOString() }] };
      } else {
        payload = { username: "Tau Volantis — Registro de Saque", embeds: [{
          title: `Saque: ${its.length} itens`,
          description: `Buscado em ${LOC_NAMES[locKey]}`,
          color: anyAnom ? 0xd3572a : 0x3d6c8a,
          fields: base.concat(its.map(item => ({
            name: item.name.slice(0, 256),
            value: `${item.category} · ${rarityInfo(item, locKey).label}\n${item.utility}${itemFactsText(item) ? '\n' + itemFactsText(item) : ''}`.slice(0, 1024)
          }))).slice(0, 25),
          footer: { text: "Tau Volantis: Ano 0" }, timestamp: new Date().toISOString() }] };
      }
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
    if(searching) return;
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
    const entry = Object.assign({kind:'fish', item: caught, items: caught ? [{ item: caught, decision: 'pending' }] : [], searchId: newUid('sr'), uid: ++fishUid, sendState:'idle', foundBy: playerName(), holderId: tok ? tok.id : null}, locFields(tok));
    logFound(entry);
    if (autoSendBox.checked) sendLootToDiscord(entry);
    const showFish = () => { fishHistory.unshift(entry); renderFishResults(); };
    if(!animEnabled()){ showFish(); return; }
    setSearchBusy(true);
    playSearch({ stage:fishStage, title:'Lançando a linha…', pool:FISH_POOL, found:caught ? [caught] : [],
      rarity:null, emptyText:'Nada fisgou' }).then(() => { setSearchBusy(false); showFish(); });
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
        <div class="fish-name">${isNothing ? '<span class="item-icon" aria-hidden="true">' + svgIcon('hole') + '</span>Nada fisgou a isca desta vez' : iconHtml(entry.item) + entry.item.name}</div>
        <div class="fish-desc">${isNothing ? 'A linha voltou vazia. Vale tentar de novo em outro ponto do rio.' : entry.item.utility}</div>
        ${isNothing ? '' : itemFactsHtml(entry.item)}
        ${coordHtml(entry)}
        <div class="send-row">
          <button class="send-btn" data-action="send">Enviar ao Discord</button>
          <span class="send-status" data-role="status">${lootStatusText(entry)}</span>
        </div>
      `;
      card.querySelector('[data-action="send"]').addEventListener('click', () => sendLootToDiscord(entry));
      if(entry.items.length) card.insertBefore(buildItemDecision(entry, 0, true), card.querySelector('.send-row'));
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

  // lista organizada por TIPO de item (categoria), não por local de encontro
  const CATEGORY_ORDER = ['Comida','Bebidas','Itens Médicos','Armas de Fogo','Armas Brancas e Improvisadas','Munição','Ferramentas','Ferramentas Agrícolas',
    'Roupas e Proteção contra Frio','Mochilas e Contêineres','Componentes e Materiais de Crafting','Peças de Veículos','Eletrônicos e Comunicação',
    'Combustível e Aquecimento','Iluminação','Acampamento e Utilidades','Abrigo Rural e Construção','Floresta e Caça','Pesca e Rio',
    'Animais e Produtos de Fazenda','Plantas, Ervas e Cultivos','Higiene e Itens Pessoais','Lazer e Itens Pessoais','Documentos e Itens de Lore','Itens Anômalos e Paranormais'];
  const itemFilterCat = document.getElementById('item-filter-cat');
  const itemFilterTag = document.getElementById('item-filter-tag');
  const collapsedCats = new Set();
  (function(){
    const cats = Array.from(new Set(ITEMS.map(i => i.category)));
    cats.sort((a, b) => {
      const ia = CATEGORY_ORDER.indexOf(a), ib = CATEGORY_ORDER.indexOf(b);
      return (ia < 0 ? 999 : ia) - (ib < 0 ? 999 : ib) || a.localeCompare(b);
    });
    cats.forEach(cat => {
      const opt = document.createElement('option');
      opt.value = cat;
      opt.textContent = `${cat} (${ITEMS.filter(i => i.category === cat).length})`;
      itemFilterCat.appendChild(opt);
    });
  })();

  // filtro por capacidade (tags do catálogo): capacidades primeiro, materiais depois
  (function(){
    if(!itemFilterTag) return;
    const cnt = {};
    ITEMS.forEach(i => (i.tags || []).forEach(t => { cnt[t] = (cnt[t] || 0) + 1; }));
    const mk = list => list.map(t => `<option value="${escapeHtml(t)}">${escapeHtml(tagLabel(t))} (${cnt[t]})</option>`).join('');
    const byLabel = (a, b) => tagLabel(a).localeCompare(tagLabel(b), 'pt-BR');
    const keys = Object.keys(cnt);
    itemFilterTag.insertAdjacentHTML('beforeend',
      '<optgroup label="Capacidades">' + mk(keys.filter(t => !MATERIAL_TAGS.includes(t)).sort(byLabel)) + '</optgroup>' +
      '<optgroup label="Materiais">' + mk(keys.filter(t => MATERIAL_TAGS.includes(t)).sort(byLabel)) + '</optgroup>');
  })();
  const ITEM_SEARCH = new Map();
  function itemSearchText(i){
    let t = ITEM_SEARCH.get(i.id);
    if(t == null){ t = normName([i.name, i.category, (i.tags || []).map(tagLabel).join(' '), i.utility].join(' ')); ITEM_SEARCH.set(i.id, t); }
    return t;
  }
  const itemTbody = document.getElementById('item-table-body');
  function buildItemTable(){
    renderItemTable(ITEMS);
  }
  function renderItemTable(list){
    const groups = {};
    list.forEach(i => { (groups[i.category] = groups[i.category] || []).push(i); });
    const cats = Object.keys(groups).sort((a, b) => {
      const ia = CATEGORY_ORDER.indexOf(a), ib = CATEGORY_ORDER.indexOf(b);
      return (ia < 0 ? 999 : ia) - (ib < 0 ? 999 : ib) || a.localeCompare(b);
    });
    const searching = itemSearchInput.value.trim() !== '' || itemFilterCat.value !== '' || !!(itemFilterTag && itemFilterTag.value !== '');
    itemTbody.innerHTML = cats.map(cat => {
      const closed = !searching && collapsedCats.has(cat);
      const rows = groups[cat].slice().sort((a, b) => a.name.localeCompare(b.name)).map(item => {
        const worstLoc = item.locations.includes('bases') && (item.category === "Armas de Fogo" || item.category === "Munição") ? 'bases' : item.locations[0];
        const rarity = rarityInfo(item, worstLoc);
        return `
      <tr class="item-row" data-cat="${escapeHtml(cat)}" ${closed ? 'hidden' : ''}>
        <td>${iconHtml(item)}${item.name}<span class="rarity-tag ${rarity.cls}">${rarity.label}</span>${compatLine(item)}</td>
        <td>${item.utility}${itemFactsHtml(item, { full:true })}</td>
        <td><button type="button" class="inv-add-btn" data-id="${item.id}">＋ Inventário</button></td>
      </tr>`;
      }).join('');
      return `<tr class="cat-row" data-cat="${escapeHtml(cat)}" tabindex="0" role="button" aria-expanded="${!closed}"><td colspan="3">${closed ? '▸' : '▾'} ${CAT_ICONS[cat] ? '<span class="item-icon" aria-hidden="true">' + svgIcon(CAT_ICONS[cat]) + '</span>' : ''}${escapeHtml(cat)} <span class="cat-count">${groups[cat].length}</span></td></tr>${rows}`;
    }).join('') || '<tr><td colspan="3" class="inv-empty">Nenhum item encontrado.</td></tr>';
  }
  function toggleCat(row){
    const cat = row.dataset.cat;
    if(collapsedCats.has(cat)) collapsedCats.delete(cat); else collapsedCats.add(cat);
    applyItemFilters();
  }
  itemTbody.addEventListener('click', e => { const r = e.target.closest('.cat-row'); if(r) toggleCat(r); });
  itemTbody.addEventListener('keydown', e => { const r = e.target.closest && e.target.closest('.cat-row'); if(r && (e.key === 'Enter' || e.key === ' ')){ e.preventDefault(); toggleCat(r); } });

  const itemSearchInput = document.getElementById('item-search-input');
  function applyItemFilters(){
    const q = itemSearchInput.value.trim().toLowerCase();
    const cat = itemFilterCat.value;
    const tg = itemFilterTag ? itemFilterTag.value : '';
    let list = ITEMS;
    if(cat) list = list.filter(i => i.category === cat);
    if(tg) list = list.filter(i => (i.tags || []).includes(tg));
    if(q){ const nq = normName(q); list = list.filter(i => itemSearchText(i).includes(nq)); }
    renderItemTable(list);
  }
  itemSearchInput.addEventListener('input', applyItemFilters);
  itemFilterCat.addEventListener('change', applyItemFilters);
  if(itemFilterTag) itemFilterTag.addEventListener('change', applyItemFilters);

  // ---------- abrir/fechar a gaveta ----------
  const saqueDrawer = document.getElementById('saque-drawer');
  const drawerBackdrop = document.getElementById('drawer-backdrop');
  function openDrawer(){
    hudCloseSheets();
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
  const CONSUMABLE_CATS = new Set(['Comida','Bebidas','Itens Médicos','Munição','Combustível e Aquecimento','Plantas, Ervas e Cultivos','Higiene e Itens Pessoais']);
  function consumableByDefault(inv){
    const ref = ITEMS_BY_ID[inv.itemId];
    return CONSUMABLE_CATS.has(inv.category) || !!(ref && typeof ref.fish === 'number');
  }

  const ACTION_LABELS = {
    saque:'Saque', guardar:'Guardou', recusar:'Não manteve', adicionar:'Adicionou (tabela)',
    usar:'Usou', descartar:'Descartou', troca:'Troca', craft:'Fabricação', inv_removido:'Inventário removido',
    vasculhar:'Vasculhou contêiner', pegar:'Pegou de contêiner', depositar:'Guardou em contêiner',
    condicao:'Condição', reparar:'Reparo', ajuste:'Ajuste do mestre'
  };
  const SOURCE_LABELS = { saque:'saque', pesca:'pesca', tabela:'tabela de itens', inventario:'inventário', 'contêiner':'contêiner', mestre:'concedido pelo mestre', craft:'fabricação', troca:'troca' };

  const invDrawer = document.getElementById('inv-drawer');
  const invBackdrop = document.getElementById('inv-drawer-backdrop');
  const itemAddDest = document.getElementById('item-add-dest');
  const invUI = { holderId:null, tab:'inv', trade:null, panel:null, logHolder:'', logAction:'', takeTo:null, depositOpen:false, filter:'', cat:'' };
  let lastHolderSig = '';

  function toast(msg, isErr){
    const el = document.createElement('div');
    el.className = 'inv-toast' + (isErr ? ' err' : '');
    el.setAttribute('role', isErr ? 'alert' : 'status');
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
  // Contêiner = pin comum (não NPC) que o mestre marcou em pin.container.enabled.
  // O conteúdo mora no mesmo lugar dos inventários (inventories/{pinId}/{itemUid}),
  // e o estado de exploração fica em inventories/{pinId}/_meta (chaves com "_"
  // nunca são itens). Assim não é preciso criar nenhum caminho novo no Firebase.
  const DATA_SCHEMA = 2; // itens v1 (sem qty/cond/slot) continuam válidos; v2 só acrescenta campos opcionais
  // Cada tipo de pin que é um local de saque já nasce como contêiner (sem o mestre configurar nada).
  // Exceções do mestre: p.container.enabled = false desliga; p.container.locKey troca a tabela.
  const PIN_LOC_MAP = {
    medico:'farmacias', suprimentos:'mercados', combustivel:'oficinas', veiculo:'veiculos', abrigo:'acampamentos',
    agua:'rios', saque:'casas', municao:'bases', comunicacao:'bases', extracao:'bases', radiacao:'convergencia'
  };
  // configuração efetiva do contêiner de um pin (ou null se o pin não é contêiner)
  function pinCC(p){
    if(!p || p.type === 'npc') return null;
    const c = p.container;
    if(c && c.enabled) return c;                       // configurado à mão pelo mestre
    if(c && c.enabled === false) return null;          // desligado pelo mestre
    const loc = PIN_LOC_MAP[p.type];
    return loc ? { enabled:true, auto:true, locKey:loc, min:1, max:3, cap:null, access:'aberto' } : null;   // automático pelo tipo
  }
  function isContainerPin(p){ return !!pinCC(p); }
  function isHolderPin(p){ return !!p && (p.type === 'npc' || isContainerPin(p)); }
  function containerPin(id){ return pins.find(p => p.id === id && isContainerPin(p)) || null; }
  function isContainerId(id){ return !!containerPin(id); }
  function containerList(){ return pins.filter(isContainerPin).map(p => ({ id:p.id, type:'container', name:(p.title || 'Contêiner') })); }
  function allHolders(){ return holderList().concat(containerList()); }
  function holderById(id){ return id ? (allHolders().find(h => h.id === id) || null) : null; }
  function isItemKey(k){ return String(k).charAt(0) !== '_'; }
  function invItems(hid){
    const o = (hid && inventories[hid]) || {};
    return Object.keys(o).filter(isItemKey).map(k => o[k]).filter(i => i && typeof i === 'object')
      .sort((a, b) => (a.addedAt || 0) - (b.addedAt || 0));
  }
  function invCount(hid){ return invItems(hid).length; } // pilhas ocupam 1 espaço
  function instQty(i){ const q = parseInt(i && i.qty, 10); return q > 0 ? q : 1; }
  function invUnits(hid){ return invItems(hid).reduce((a, i) => a + instQty(i), 0); }
  function holderCap(hid){
    const p = containerPin(hid);
    if(p){ const c = parseInt(pinCC(p).cap, 10); return c > 0 ? c : Infinity; }
    return MAX_INV;
  }
  function itemQtyTxt(i){ const q = instQty(i); return q > 1 ? ' ×' + q : ''; }
  // estado do inventário de um dono depois de aplicar `ops` (sem gravar nada)
  function stateOf(hid, ops){
    const m = {};
    Object.keys((inventories[hid]) || {}).filter(isItemKey).forEach(k => { m[k] = inventories[hid][k]; });
    Object.keys(ops || {}).forEach(p => {
      const ps = p.split('/');
      if(ps[0] !== hid) return;
      if(ps.length === 1){ if(ops[p] === null) Object.keys(m).forEach(k => delete m[k]); return; }
      if(!isItemKey(ps[1])) return;
      if(ops[p] === null) delete m[ps[1]]; else m[ps[1]] = ops[p];
    });
    return m;
  }
  function simCount(hid, ops){ return Object.keys(stateOf(hid, ops)).length; }

  // ---------- itens: pilhas, condição e equipamento ----------
  const STACKABLE_CATS = new Set(['Comida','Bebidas','Itens Médicos','Munição','Combustível e Aquecimento','Plantas, Ervas e Cultivos','Componentes e Materiais de Crafting','Higiene e Itens Pessoais']);
  function isStackable(item){
    if(!item) return false;
    const ref = ITEMS_BY_ID[item.id != null ? item.id : item.itemId];
    return STACKABLE_CATS.has(item.category) || !!(ref && typeof ref.fish === 'number');
  }
  const COND_LEVELS = ['Quebrado','Danificado','Gasto','Bom','Novo'];
  const CONDITION_CATS = new Set(['Armas de Fogo','Armas Brancas e Improvisadas','Ferramentas','Ferramentas Agrícolas','Roupas e Proteção contra Frio',
    'Mochilas e Contêineres','Eletrônicos e Comunicação','Peças de Veículos','Iluminação','Pesca e Rio','Acampamento e Utilidades','Abrigo Rural e Construção']);
  function hasCondition(i){ return !!i && CONDITION_CATS.has(i.category) && !isStackable(i); }
  const EQUIP_SLOTS = [['cabeca','Cabeça'],['tronco','Tronco'],['maos','Mãos'],['pernas','Pernas'],['botas','Botas'],['mochila','Mochila'],['acessorio','Acessório']];
  const DEFAULT_SLOT_CAP = { cabeca:1, tronco:1, maos:2, pernas:1, botas:1, mochila:1, acessorio:3 };
  function slotLabel(k){ const s = EQUIP_SLOTS.find(x => x[0] === k); return s ? s[1] : k; }
  // Sugestão de espaço pelo nome do item. É só um palpite para pré-selecionar:
  // quem equipa pode escolher qualquer espaço, e nenhum bônus é aplicado.
  function suggestSlot(i){
    const n = normName(i.name);
    if(/\b(bota|botina)/.test(n)) return 'botas';
    if(/gorro|balaclava|capuz|chapeu|bandana|protetor de ouvido|oculos|mascara|headlamp|lanterna de cabeca/.test(n)) return 'cabeca';
    if(i.category === 'Mochilas e Contêineres' && /mochila|sacola|saco de estopa|bolsa/.test(n) && !/cinto|coldre/.test(n)) return 'mochila';
    if(/mochila de escoteiro/.test(n)) return 'mochila';
    if(/cinto|coldre|luva|cachecol|relogio|fones|suspensorio/.test(n)) return 'acessorio';
    if(/calca|perneira|meia|meiao/.test(n)) return 'pernas';
    if(/jaqueta|casaco|parka|colete|sobretudo|macacao|poncho|capa de|uniforme|jaleco|blusao|camisa|avental|roupa|traje/.test(n)) return 'tronco';
    if(i.category === 'Armas de Fogo' || i.category === 'Armas Brancas e Improvisadas' || i.category === 'Ferramentas' || i.category === 'Ferramentas Agrícolas' || i.category === 'Iluminação') return 'maos';
    return null;
  }
  function canEquip(i){ return !!i && !consumableByDefault(i) && i.category !== 'Documentos e Itens de Lore'; }
  function equippedItems(hid){ return invItems(hid).filter(i => i.slot); }

  // Planeja a entrada de itens num dono, juntando em pilhas quando possível.
  // Não grava: acumula em `ops` e devolve o resultado de cada item.
  function planAdds(hid, entries, ops){
    ops = ops || {};
    const cap = holderCap(hid), m = stateOf(hid, ops), res = [];
    entries.forEach(en => {
      const item = en.item, qty = Math.max(1, parseInt(en.qty, 10) || 1);
      let tgt = null;
      if(isStackable(item) && !en.noStack){
        const id = item.id != null ? item.id : item.itemId;
        tgt = Object.keys(m).map(k => m[k]).find(i => i.itemId === id && !i.slot && i.cond == null);
      }
      if(tgt){
        const upd = Object.assign({}, tgt, { qty:instQty(tgt) + qty, v:DATA_SCHEMA });
        m[tgt.uid] = upd; ops[hid + '/' + tgt.uid] = upd;
        res.push({ ok:true, inst:upd, stacked:true, qty, item });
      } else if(Object.keys(m).length >= cap){
        res.push({ ok:false, item, qty });
      } else {
        const id = item.id != null ? item.id : item.itemId;
        const inst = Object.assign({ uid:newUid('it'), itemId:id, name:item.name, category:item.category, addedAt:Date.now(), addedBy:actorFields().actorName, v:DATA_SCHEMA },
          qty > 1 ? { qty } : {}, en.extra || {});
        Object.keys(inst).forEach(k => { if(inst[k] === undefined) delete inst[k]; });
        m[inst.uid] = inst; ops[hid + '/' + inst.uid] = inst;
        res.push({ ok:true, inst, stacked:false, qty, item });
      }
    });
    return { ops, res, after:Object.keys(m).length };
  }
  // quantos dos itens dados ainda cabem (em sequência) no inventário
  function roomFor(hid, items){
    const ops = {};
    let n = 0;
    for(const it of items){ const p = planAdds(hid, [{ item:it, qty:1 }], ops); if(!p.res[0].ok) break; n++; }
    return n;
  }
  function holderOptionsHtml(list, withCount){
    const tk = list.filter(h => h.type === 'token'), np = list.filter(h => h.type === 'npc'), ct = list.filter(h => h.type === 'container');
    const opt = h => `<option value="${escapeHtml(h.id)}">${escapeHtml(h.name)}${withCount ? ` (${capTxt(h.id)})` : ''}</option>`;
    return (tk.length ? `<optgroup label="Jogadores">${tk.map(opt).join('')}</optgroup>` : '') +
           (np.length ? `<optgroup label="NPCs">${np.map(opt).join('')}</optgroup>` : '') +
           (ct.length ? `<optgroup label="Contêineres">${ct.map(opt).join('')}</optgroup>` : '');
  }

  // ---------- registro ----------
  function actorFields(){
    return {
      actorId: currentUser ? currentUser.uid : null,
      actorName: currentPlayer ? currentPlayer.playerName : 'Anônimo (sem login)'
    };
  }
  function itemRef(i, qty){
    const r = { uid: i.uid || null, itemId: i.itemId != null ? i.itemId : i.id, name: i.name, category: i.category };
    const q = qty != null ? qty : (i.qty != null ? instQty(i) : 1);
    if(q > 1) r.qty = q;
    return r;
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

  // ---------- auditoria no Discord ----------
  // Toda transação registrada (saque, guardar, descartar, usar, trocar, fabricar...)
  // também vai para o webhook FIXO da mesa, sempre: não depende da caixa de envio
  // nem do webhook que cada jogador escolheu. Fica numa fila com nova tentativa
  // (limite de taxa do Discord, falha de rede) e sobrevive a recarregar a página.
  const AUDIT_QUEUE_KEY = 'tv-map:audit-queue';
  const AUDIT_STYLE = {
    saque:['🔎 Saque', 0x3d6c8a], guardar:['🎒 Guardou', 0x4f9a63], recusar:['🗑 Não manteve', 0x8a5a4a],
    adicionar:['➕ Adicionou pela tabela', 0x4f9a63], usar:['🧪 Usou', 0xd9a441], descartar:['🗑 Descartou', 0xb04a32],
    troca:['⇄ Troca', 0x7a64c8], craft:['🛠 Fabricação', 0xc9923a], inv_removido:['⚠ Inventário removido', 0xb04a32],
    vasculhar:['📦 Contêiner vasculhado', 0x3d6c8a], pegar:['📤 Pegou de contêiner', 0x4f9a63], depositar:['📥 Guardou em contêiner', 0x4f9a63],
    condicao:['🔧 Condição alterada', 0xd9a441], reparar:['🔧 Reparo', 0xc9923a], ajuste:['🧰 Ajuste do mestre', 0x7a64c8]
  };
  let auditQueue = [];
  let auditBusy = false;
  try{ auditQueue = JSON.parse(localStorage.getItem(AUDIT_QUEUE_KEY) || '[]') || []; }catch(e){ auditQueue = []; }
  const auditSleep = ms => new Promise(r => setTimeout(r, ms));
  function persistAudit(){ try{ localStorage.setItem(AUDIT_QUEUE_KEY, JSON.stringify(auditQueue)); }catch(e){} }
  function md(s){ return String(s == null ? '' : s).replace(/([\\*_~`|>])/g, '\\$1').replace(/@/g, '@\u200b'); }
  function qnames(a){ return (a || []).map(i => '"' + md(i.name) + '"' + (i.qty > 1 ? ' ×' + i.qty : '')).join(', ') || 'nada'; }
  function auditLine(e){
    const who = '**' + md(e.holderName || 'Sobrevivente desconhecido') + '**';
    const it = e.item ? '"' + md(e.item.name) + '"' + (e.item.qty > 1 ? ' ×' + e.item.qty : '') : '';
    const cap = e.invAfter != null ? ' · inventário ' + fmtCount(e.invAfter) : '';
    switch(e.action){
      case 'saque': return `${who} encontrou ${it}${e.total > 1 ? ' (item ' + e.n + ' de ' + e.total + ')' : ''}${e.locName ? ' em ' + md(e.locName) : ''}${e.coord ? ' · 📍 ' + md(e.coord) : ''}`;
      case 'guardar': return `${who} **guardou** ${it} no inventário${cap}`;
      case 'recusar': return `${who} **não manteve** ${it}${e.reason ? ' (' + md(e.reason) + ')' : ''}`;
      case 'adicionar': return `${who} recebeu ${it} direto da tabela de itens${cap}`;
      case 'usar': return `${who} usou ${it} · ${e.consumed ? 'consumido' : 'mantido no inventário'}${e.note ? ' — ' + md(e.note) : ''}`;
      case 'descartar': return `${who} **descartou** ${it}${e.note ? ' — ' + md(e.note) : ''}`;
      case 'troca': return `${who} ⇄ **${md(e.counterpartName || '?')}**: entregou ${qnames(e.gave)} · recebeu ${qnames(e.got)}${e.note ? ' — ' + md(e.note) : ''}`;
      case 'craft': return `${who} ${e.outcome === 'sucesso' ? 'fabricou' : 'tentou fabricar'} "${md(e.recipe || '?')}"${e.outcome === 'sucesso' ? '' : ' e falhou'} · usou: ${qnames(e.used)}${e.made && e.made.length ? ' · obteve: ' + qnames(e.made) : ''}`;
      case 'inv_removido': return `Inventário de ${who} removido${e.reason ? ' (' + md(e.reason) + ')' : ''}: ${qnames(e.items)}`;
      case 'vasculhar': return `**${md(e.actorName || '?')}** vasculhou ${who}${e.locName ? ' (' + md(e.locName) + ')' : ''} · encontrou: ${qnames(e.made)}`;
      case 'pegar': return `${who} **pegou** ${qnames(e.got)} de **${md(e.counterpartName || '?')}**${cap}`;
      case 'depositar': return `${who} **guardou** ${qnames(e.gave)} em **${md(e.counterpartName || '?')}**`;
      case 'condicao': case 'reparar': return `${who}: ${it} · condição ${md(e.condFrom || '—')} → **${md(e.condTo || '—')}**${e.note ? ' — ' + md(e.note) : ''}`;
      case 'ajuste': return `**${md(e.actorName || '?')}** (mestre) ajustou ${who}: ${md(e.note || '')}${e.item ? ' · ' + it : ''}`;
      default: return who;
    }
  }
  function queueAudit(entries){
    if(typeof fetch !== 'function' || !entries || !entries.length) return;
    const ses = (campaignMeta && campaignMeta.activeSessionId && sessions[campaignMeta.activeSessionId]) || null;
    for(let i = 0; i < entries.length; i += 15){
      const chunk = entries.slice(i, i + 15);
      const same = chunk.every(e => e.action === chunk[0].action);
      const st = AUDIT_STYLE[chunk[0].action] || ['Registro', 0x3d6c8a];
      auditQueue.push({ tries:0, payload:{
        username:'Tau Volantis — Auditoria',
        allowed_mentions:{ parse:[] },
        embeds:[{
          title: same ? st[0] + (chunk.length > 1 ? ' ×' + chunk.length : '') : 'Registro de transações',
          description: chunk.map(auditLine).join('\n').slice(0, 4000),
          color: same ? st[1] : 0x3d6c8a,
          footer:{ text:`${campaignMeta ? campaignMeta.name : 'Tau Volantis'}${ses ? ' · ' + ses.title : ''} · por ${chunk[0].actorName || '?'}` },
          timestamp:new Date().toISOString()
        }]
      }});
    }
    persistAudit();
    pumpAudit();
  }
  async function pumpAudit(){
    if(auditBusy || typeof fetch !== 'function') return;
    auditBusy = true;
    let warned = false;
    while(auditQueue.length){
      const job = auditQueue[0];
      let wait = 0;
      try{
        const res = await fetch(FIXED_WEBHOOK_URL, { method:'POST', headers:{ 'Content-Type':'application/json' }, body:JSON.stringify(job.payload) });
        if(res.ok || res.status === 204){ auditQueue.shift(); persistAudit(); await auditSleep(350); continue; }
        if(res.status === 429){
          let ra = 1500;
          try{ const j = await res.json(); ra = Math.ceil((j.retry_after || 1.5) * 1000); }catch(e){}
          wait = ra;
        } else { wait = 1500 * (job.tries + 1); }
      }catch(e){ wait = 2000 * (job.tries + 1); }
      job.tries++;
      if(job.tries >= 8){
        auditQueue.shift(); persistAudit();
        if(!warned){ warned = true; toast('Não foi possível enviar um registro de auditoria ao Discord.', true); }
        continue;
      }
      persistAudit();
      await auditSleep(wait || 1000);
    }
    auditBusy = false;
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
        queueAudit(entries);
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
    queueAudit(entries);
    onInvChanged();
    return true;
  }

  // ---------- ações ----------
  async function addItemTo(holderId, item, source, action, logExtra, instExtra, qty){
    const holder = holderById(holderId);
    if(!holder){ toast('Escolha um personagem ou NPC primeiro.', true); return false; }
    const p = planAdds(holderId, [{ item, qty, extra:Object.assign({ source }, instExtra || {}) }]);
    const r = p.res[0];
    if(!r.ok){ toast(`Inventário de ${holder.name} cheio (${capTxt(holderId)}).`, true); return false; }
    const ok = await commitInv(p.ops,
      [mkLog(action, holder, Object.assign({ item:itemRef(r.inst, r.qty), source, invAfter:p.after }, logExtra || {}))]
    );
    if(ok) toast(`${item.name}${r.qty > 1 ? ' ×' + r.qty : ''} → inventário de ${holder.name}`);
    return ok;
  }

  function lootSource(entry){ return entry.kind === 'fish' ? 'pesca' : 'saque'; }
  function rerenderLoot(){ renderLootResults(); renderFishResults(); }
  // cada item achado vira uma linha "saque" no registro, ligadas pelo mesmo searchId
  function logFound(entry){
    const its = entry.items || [];
    if(!its.length) return;
    const holder = holderById(entry.holderId);
    commitInv({}, its.map((it, i) => mkLog('saque', holder, {
      item:itemRef(it.item), source:lootSource(entry), searchId:entry.searchId, n:i + 1, total:its.length,
      locName: entry.kind === 'fish' ? LOC_NAMES['rios'] : LOC_NAMES[entry.locKey],
      coord: entry.coord || null, lat: entry.lat != null ? entry.lat : null, lng: entry.lng != null ? entry.lng : null,
      pinId: entry.pinId || null, pinTitle: entry.pinTitle || null
    })));
  }
  function pendingIdx(entry){ return (entry.items || []).map((it, i) => i).filter(i => entry.items[i].decision === 'pending'); }
  // guarda um ou vários itens da mesma busca numa única operação atômica
  async function keepLootItems(entry, idxs){
    const holder = holderById(entry.holderId);
    if(!holder){ toast('Selecione um personagem (token) antes de saquear para poder guardar.', true); return; }
    idxs = idxs.filter(i => entry.items[i] && entry.items[i].decision === 'pending');
    // planeja em sequência: itens empilháveis entram numa pilha existente sem ocupar espaço
    const ops = {}, logs = [], take = [], insts = [];
    for(const i of idxs){
      const item = entry.items[i].item;
      const p = planAdds(holder.id, [{ item, qty:1, extra:Object.assign({ source:lootSource(entry) }, entry.lat != null ? { foundAt:entry.coord } : {}) }], ops);
      if(!p.res[0].ok) break;
      take.push(i); insts.push(p.res[0].inst);
      logs.push(mkLog('guardar', holder, Object.assign({ item:itemRef(p.res[0].inst, 1), source:lootSource(entry), searchId:entry.searchId, invAfter:p.after },
        entry.lat != null ? { lat:entry.lat, lng:entry.lng } : {})));
    }
    if(!take.length){ toast(`Inventário de ${holder.name} cheio (${capTxt(holder.id)}). Libere espaço ou descarte.`, true); return; }
    take.forEach(i => { entry.items[i].decision = 'working'; });
    rerenderLoot();
    const ok = await commitInv(ops, logs);
    take.forEach(i => { entry.items[i].decision = ok ? 'kept' : 'pending'; });
    if(ok){
      if(take.length < idxs.length) toast(`Inventário cheio: guardei ${take.length}, sobraram ${idxs.length - take.length}.`, true);
      else toast(take.length > 1 ? `${take.length} itens → inventário de ${holder.name}` : `${insts[0].name} → inventário de ${holder.name}`);
    }
    rerenderLoot();
  }
  async function declineLootItems(entry, idxs, reason){
    idxs = idxs.filter(i => entry.items[i] && entry.items[i].decision === 'pending');
    if(!idxs.length) return;
    idxs.forEach(i => { entry.items[i].decision = 'declined'; });
    rerenderLoot();
    const holder = holderById(entry.holderId);
    await commitInv({}, idxs.map(i => mkLog('recusar', holder, { item:itemRef(entry.items[i].item), source:lootSource(entry), searchId:entry.searchId, reason:reason || null })));
  }
  // ao limpar o histórico de saque, o que ficou sem decisão vira "não mantido"
  // no registro, pra auditoria nunca ficar com item "no limbo"
  function flushPending(list){
    const logs = [];
    list.forEach(e => {
      (e.items || []).forEach(it => {
        if(it.decision === 'pending'){
          it.decision = 'declined';
          logs.push(mkLog('recusar', holderById(e.holderId), { item:itemRef(it.item), source:lootSource(e), searchId:e.searchId, reason:'histórico limpo sem decisão' }));
        }
      });
    });
    if(logs.length) commitInv({}, logs);
  }
  function buildItemDecision(entry, idx, ask){
    const it = entry.items[idx];
    const el = document.createElement('div');
    el.className = 'loot-decision';
    const holder = holderById(entry.holderId);
    if(it.decision === 'kept'){
      el.innerHTML = `<div class="loot-decision-state kept">✓ Guardado no inventário de ${escapeHtml(holder ? holder.name : entry.foundBy)}</div>`;
      return el;
    }
    if(it.decision === 'declined'){
      el.innerHTML = '<div class="loot-decision-state declined">✕ Não mantido</div>';
      return el;
    }
    const full = !!holder && roomFor(holder.id, [it.item]) < 1;
    const working = it.decision === 'working';
    let warn = '';
    if(ask){
      if(!holder) warn = 'Selecione um personagem (token) antes de saquear para poder guardar o item.';
      else if(full) warn = 'Inventário cheio. Libere espaço (usar, trocar ou descartar) ou escolha "Não manter".';
    }
    el.innerHTML = `
      ${ask ? `<div class="loot-decision-q">Manter no inventário${holder ? ' de ' + escapeHtml(holder.name) : ''}?</div>` : ''}
      <div class="loot-decision-btns">
        <button type="button" class="inv-mini-btn primary" data-act="keep" ${(!holder || full || working) ? 'disabled' : ''}>${working ? 'Guardando...' : 'Guardar'}</button>
        <button type="button" class="inv-mini-btn danger" data-act="decline" ${working ? 'disabled' : ''}>${ask ? 'Não manter' : 'Descartar'}</button>
      </div>
      ${warn ? `<div class="loot-decision-warn">${warn}</div>` : ''}`;
    el.querySelector('[data-act="keep"]').addEventListener('click', () => keepLootItems(entry, [idx]));
    el.querySelector('[data-act="decline"]').addEventListener('click', () => declineLootItems(entry, [idx]));
    return el;
  }
  // barra "Guardar tudo / Descartar o resto" (só quando há mais de um item sem decisão)
  function buildBulkBar(entry){
    const its = entry.items || [];
    const pend = pendingIdx(entry);
    if(its.length < 2 || pend.length < 1) return null;
    const holder = holderById(entry.holderId);
    const room = !holder ? 0 : roomFor(holder.id, pend.map(i => entry.items[i].item));
    const el = document.createElement('div');
    el.className = 'loot-bulk';
    let note = '';
    if(!holder) note = 'Selecione um personagem (token) antes de saquear para poder guardar.';
    else if(room === 0) note = 'Inventário cheio. Libere espaço ou descarte o que não quiser.';
    else if(room < pend.length) note = `Só cabem ${room} dos ${pend.length} itens restantes.`;
    el.innerHTML = `
      <div class="loot-decision-q">${pend.length} item(ns) sem decisão${holder ? ' · inventário de ' + escapeHtml(holder.name) + ': ' + escapeHtml(capTxt(holder.id)) : ''}</div>
      <div class="loot-decision-btns">
        <button type="button" class="inv-mini-btn primary" data-act="keep-all" ${(!holder || room === 0) ? 'disabled' : ''}>Guardar tudo${holder && room < pend.length && room > 0 ? ` (${room})` : ''}</button>
        <button type="button" class="inv-mini-btn danger" data-act="decline-all">Descartar o resto</button>
      </div>
      ${note ? `<div class="loot-decision-warn">${note}</div>` : ''}`;
    el.querySelector('[data-act="keep-all"]').addEventListener('click', () => keepLootItems(entry, pendingIdx(entry)));
    el.querySelector('[data-act="decline-all"]').addEventListener('click', () => declineLootItems(entry, pendingIdx(entry)));
    return el;
  }

  // tira `n` unidades de uma instância: devolve a operação (instância reduzida ou null)
  function takeUnits(inst, n){
    const q = instQty(inst);
    return n >= q ? null : Object.assign({}, inst, { qty:q - n, v:DATA_SCHEMA });
  }
  // efeitos sugeridos pelo catálogo (campo `fx`): só valem com o módulo de necessidades ligado, em token que o usuário pode editar, e se marcados ao usar
  function usableFx(hid, ref){
    if(!ref || !ref.fx || !cfg().modules.needs) return [];
    const h = holderById(hid);
    if(!h || h.type !== 'token' || !canEditHolder(h)) return [];
    return NEED_LIST.filter(n => ref.fx[n[0]]).map(n => [n[0], n[1], ref.fx[n[0]]]);
  }
  function fxText(list){ return list.map(x => x[1] + ' ' + (x[2] < 0 ? '−' : '+') + Math.abs(x[2])).join(', '); }
  function applyNeedsFx(hid, list){
    const card = ensureCard(hid);
    list.forEach(x => { card.needs[x[0]] = Math.min(4, Math.max(0, (card.needs[x[0]] || 0) + x[2])); });
    scheduleSaveCard(hid);
    if(hubIsOpen()) renderHub();
  }
  async function doUse(hid, uid, consume, note, applyFx){
    const holder = holderById(hid), inst = inventories[hid] && inventories[hid][uid];
    if(!holder || !inst){ toast('Item não encontrado.', true); return; }
    const ops = consume ? { [hid + '/' + uid]: takeUnits(inst, 1) } : {};
    const fxList = applyFx ? usableFx(hid, ITEMS_BY_ID[inst.itemId]) : [];
    const fullNote = [note, fxList.length ? 'Necessidades: ' + fxText(fxList) : ''].filter(Boolean).join(' · ').slice(0, 140) || null;
    const ok = await commitInv(ops,
      [mkLog('usar', holder, { item:itemRef(inst, 1), consumed:!!consume, note:fullNote, source:'inventario', invAfter:simCount(hid, ops) })]);
    if(ok){
      if(fxList.length) applyNeedsFx(hid, fxList);
      invUI.panel = null;
      toast((consume ? `${inst.name} usado e consumido.` : `${inst.name} usado.`) + (fxList.length ? ' Necessidades ajustadas.' : ''));
      renderInvDrawer();
    }
  }
  async function doDiscard(hid, uid, note, amount){
    const holder = holderById(hid), inst = inventories[hid] && inventories[hid][uid];
    if(!holder || !inst){ toast('Item não encontrado.', true); return; }
    const q = instQty(inst), n = Math.min(q, Math.max(1, parseInt(amount, 10) || q));
    const ops = { [hid + '/' + uid]: takeUnits(inst, n) };
    const ok = await commitInv(ops,
      [mkLog('descartar', holder, { item:itemRef(inst, n), note:note || null, source:'inventario', invAfter:simCount(hid, ops) })]);
    if(ok){ invUI.panel = null; toast(`${inst.name}${n > 1 ? ' ×' + n : ''} descartado.`); renderInvDrawer(); }
  }
  // dividir uma pilha: `n` unidades viram uma nova instância (ocupa um espaço)
  async function doSplit(hid, uid, n){
    const holder = holderById(hid), inst = inventories[hid] && inventories[hid][uid];
    if(!holder || !inst){ toast('Item não encontrado.', true); return; }
    const q = instQty(inst); n = parseInt(n, 10);
    if(!(n >= 1 && n < q)){ toast(`Escolha de 1 a ${q - 1} unidades.`, true); return; }
    if(invCount(hid) >= holderCap(hid)){ toast('Sem espaço livre para a nova pilha.', true); return; }
    const copy = Object.assign({}, inst, { uid:newUid('it'), qty:n, slot:null, addedAt:Date.now(), v:DATA_SCHEMA });
    delete copy.slot;
    const ok = await commitInv({ [hid + '/' + uid]: takeUnits(inst, n), [hid + '/' + copy.uid]: copy }, []);
    if(ok){ invUI.panel = null; toast(`Pilha dividida: ${q - n} + ${n}.`); renderInvDrawer(); }
  }
  // agrupar: junta instâncias iguais (mesmo item, sem condição própria, não equipadas)
  async function doMerge(hid){
    const groups = {};
    invItems(hid).filter(i => isStackable(i) && !i.slot && i.cond == null).forEach(i => { (groups[i.itemId] = groups[i.itemId] || []).push(i); });
    const ops = {}; let merged = 0;
    Object.keys(groups).forEach(k => {
      const g = groups[k]; if(g.length < 2) return;
      const total = g.reduce((a, i) => a + instQty(i), 0);
      ops[hid + '/' + g[0].uid] = Object.assign({}, g[0], { qty:total, v:DATA_SCHEMA });
      g.slice(1).forEach(i => { ops[hid + '/' + i.uid] = null; merged += 1; });
    });
    if(!merged){ toast('Nada para agrupar.'); return; }
    const ok = await commitInv(ops, []);
    if(ok) toast(`${merged} pilha(s) agrupada(s).`);
  }
  async function doEquip(hid, uid, slot){
    const holder = holderById(hid), inst = inventories[hid] && inventories[hid][uid];
    if(!holder || !inst){ toast('Item não encontrado.', true); return; }
    if(slot){
      const cap = cfg().equipSlots[slot] != null ? cfg().equipSlots[slot] : 1;
      const used = equippedItems(hid).filter(i => i.slot === slot && i.uid !== uid);
      if(used.length >= cap){ toast(`${slotLabel(slot)} cheio (${used.length}/${cap}). Desequipe ${used[0].name} antes.`, true); return; }
    }
    const upd = Object.assign({}, inst, { v:DATA_SCHEMA });
    if(slot) upd.slot = slot; else delete upd.slot;
    // gravar `null` remove a chave no Firebase; reescrever a instância sem `slot` faz o mesmo efeito
    const ok = await commitInv({ [hid + '/' + uid]: upd }, []);
    if(ok){ invUI.panel = null; toast(slot ? `${inst.name} equipado (${slotLabel(slot)}).` : `${inst.name} desequipado.`); renderInvDrawer(); }
  }
  async function doCondition(hid, uid, level, note){
    const holder = holderById(hid), inst = inventories[hid] && inventories[hid][uid];
    if(!holder || !inst){ toast('Item não encontrado.', true); return; }
    level = parseInt(level, 10);
    if(!(level >= 0 && level < COND_LEVELS.length)){ toast('Escolha uma condição.', true); return; }
    const from = inst.cond;
    if(from === level){ invUI.panel = null; renderInvDrawer(); return; }
    // pilha com condição própria não faz sentido: separa 1 unidade se houver mais
    const upd = Object.assign({}, inst, { cond:level, v:DATA_SCHEMA });
    const ok = await commitInv({ [hid + '/' + uid]: upd }, [mkLog(from != null && level > from ? 'reparar' : 'condicao', holder, {
      item:itemRef(inst, 1), condFrom:from != null ? COND_LEVELS[from] : null, condTo:COND_LEVELS[level], note:note || null, source:'inventario' })]);
    if(ok){ invUI.panel = null; toast(`${inst.name}: ${COND_LEVELS[level]}.`); renderInvDrawer(); }
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
    if(aAfter > holderCap(a.id) || bAfter > holderCap(b.id)){ toast('A troca excede o limite de itens de um dos lados.', true); return; }
    const ops = {};
    const moved = (inst) => { const c = Object.assign({}, inst, { source:'troca', addedAt:Date.now(), v:DATA_SCHEMA }); delete c.slot; return c; };
    giveItems.forEach(i => { ops[a.id + '/' + i.uid] = null; ops[b.id + '/' + i.uid] = moved(i); });
    takeItems.forEach(i => { ops[b.id + '/' + i.uid] = null; ops[a.id + '/' + i.uid] = moved(i); });
    // itens que saem de um contêiner são "reivindicados" antes, numa transação:
    // se duas pessoas pegarem o mesmo item ao mesmo tempo, só uma consegue
    const claimed = await claimFromContainers([[a, giveItems], [b, takeItems]]);
    if(claimed === false) return;
    const ok = await commitInv(ops, [mkLog('troca', a, {
      counterpartId:b.id, counterpartName:b.name, counterpartType:b.type,
      gave:giveItems.map(itemRef), got:takeItems.map(itemRef),
      note:t.note || null, source:'inventario', invAfter:aAfter, counterpartInvAfter:bAfter
    })]);
    if(!ok) await restoreClaims(claimed);
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

  // ---------- contêineres: reivindicar, vasculhar, pegar, guardar ----------
  // Itens que saem de um contêiner passam por uma transação do Firebase sobre
  // aquele item: se duas pessoas tentarem pegar o mesmo, só a primeira consegue.
  function containerOpenFor(id){
    const p = containerPin(id);
    return !!p && (pinCC(p).access !== 'bloqueado' || isMaster());
  }
  async function claimFromContainers(pairs){
    const claims = [];
    if(!firebaseReady) return claims;
    for(const pair of pairs){
      const h = pair[0], insts = pair[1];
      if(!h || h.type !== 'container') continue;
      for(const inst of insts){
        const ref = fbRefOf(KEY_INV).child(h.id).child(inst.uid);
        let got = null;
        try{
          const r = await ref.transaction(cur => { got = cur; return cur ? null : undefined; });
          if(!r.committed){ await restoreClaims(claims); toast(`"${inst.name}" já foi pego por outra pessoa.`, true); return false; }
        }catch(e){
          console.error('Falha ao reservar item do contêiner', e);
          await restoreClaims(claims);
          toast('Não foi possível reservar o item (confira as regras do Firebase).', true);
          return false;
        }
        claims.push({ cid:h.id, uid:inst.uid, val:got });
      }
    }
    return claims;
  }
  async function restoreClaims(claims){
    if(!claims || !claims.length || !firebaseReady) return;
    for(const c of claims){
      try{ await fbRefOf(KEY_INV).child(c.cid).child(c.uid).set(c.val); }
      catch(e){ console.error('Falha ao devolver item reservado ao contêiner', e); }
    }
  }
  function containerMeta(id){ const o = inventories[id]; return (o && o._meta) || null; }
  const CONT_STATE_LABELS = { inexplorado:'Inexplorado', parcial:'Explorado parcialmente', explorado:'Explorado', esgotado:'Esgotado', bloqueado:'Bloqueado' };
  // o botão "Vasculhar" do popup só aparece se há tabela de saque, o contêiner está aberto (ou é o mestre) e ainda não foi vasculhado
  function canSearchPin(p){
    const cc = pinCC(p);
    if(!cc || !cc.locKey || !byLoc[cc.locKey]) return false;
    const meta = containerMeta(p.id);
    return !(meta && meta.generatedAt) && (cc.access !== 'bloqueado' || isMaster());
  }
  function containerState(id){
    const pin = containerPin(id);
    if(!pin) return null;
    const cfg0 = pinCC(pin);
    if(cfg0.access === 'bloqueado') return 'bloqueado';
    const meta = containerMeta(id), n = invCount(id), generative = !!(cfg0.locKey && byLoc[cfg0.locKey]);
    if(generative && !(meta && meta.generatedAt)) return n > 0 ? 'parcial' : 'inexplorado';
    if(n === 0) return 'esgotado';
    return meta && meta.initial && n < meta.initial ? 'parcial' : 'explorado';
  }
  function rollContainerContents(cc, free){
    const pool = (byLoc[cc.locKey] || []).slice();
    const lo = Math.max(0, cc.min != null ? parseInt(cc.min, 10) || 0 : 1);
    const hi = Math.max(lo, cc.max != null ? parseInt(cc.max, 10) || 0 : 3);
    const count = Math.min(lo + Math.floor(Math.random() * (hi - lo + 1)), pool.length, free);
    const out = [];
    for(let i = 0; i < count; i++){ const it = weightedPick(pool, cc.locKey); out.push(it); pool.splice(pool.indexOf(it), 1); }
    return out;
  }
  // Gera o conteúdo UMA vez (ou de novo, se force = mestre reabastecendo). A transação
  // grava itens + _meta juntos: quem chega depois descobre que já foi vasculhado.
  async function generateContainer(id, force){
    const pin = containerPin(id), holder = holderById(id);
    if(!pin || !holder) return false;
    const cc = pinCC(pin);
    if(!cc.locKey || !byLoc[cc.locKey]){ toast('Este contêiner não tem tabela de saque. O mestre pode definir uma ou abastecê-lo à mão.', true); return false; }
    if(!containerOpenFor(id)){ toast('Contêiner bloqueado.', true); return false; }
    const cap = holderCap(id), free = cap === Infinity ? 99 : Math.max(0, cap - invCount(id));
    const now = Date.now(), a = actorFields();
    const insts = rollContainerContents(cc, free).map(it => ({ uid:newUid('it'), itemId:it.id, name:it.name, category:it.category, source:'contêiner', addedAt:now, addedBy:a.actorName, v:DATA_SCHEMA }));
    const metaFor = (prev, n) => ({ state:'explorado', generatedAt:now, generatedBy:a.actorName, initial:n, gen:((prev && prev.gen) || 0) + 1, locKey:cc.locKey });
    let added = [];
    if(firebaseReady){
      try{
        const r = await fbRefOf(KEY_INV).child(id).transaction(cur => {
          if(!force && cur && cur._meta && cur._meta.generatedAt) return; // outra pessoa já vasculhou
          const node = {}; let n = 0;
          if(cur) Object.keys(cur).forEach(k => { if(isItemKey(k)){ node[k] = cur[k]; n++; } });
          const add = [];
          insts.forEach(i => { if(cap === Infinity || n + add.length < cap) add.push(i); });
          add.forEach(i => { node[i.uid] = i; });
          node._meta = metaFor(cur && cur._meta, n + add.length);
          return node;
        });
        if(!r.committed){ toast('Outra pessoa já vasculhou este contêiner.'); return false; }
        const snap = r.snapshot.val() || {};
        added = insts.filter(i => snap[i.uid]);
      }catch(e){ console.error('Falha ao vasculhar contêiner', e); toast('Não foi possível vasculhar (confira as regras do Firebase).', true); return false; }
    } else {
      const meta0 = containerMeta(id);
      if(!force && meta0 && meta0.generatedAt){ toast('Este contêiner já foi vasculhado.'); return false; }
      const ops = {}, keep = invCount(id);
      insts.forEach(i => { if(cap === Infinity || keep + added.length < cap){ added.push(i); ops[id + '/' + i.uid] = i; } });
      ops[id + '/_meta'] = metaFor(meta0, keep + added.length);
      await commitInv(ops, []);
    }
    await commitInv({}, [mkLog('vasculhar', holder, { made:added.map(i => itemRef(i, 1)), locName:LOC_NAMES[cc.locKey], source:'contêiner', refill:!!force })]);
    toast(added.length ? `${holder.name}: ${added.length} item(ns) encontrado(s).` : `${holder.name}: nada de útil.`);
    onInvChanged();
    return true;
  }
  async function containerTake(cid, uids, toId){
    const cont = holderById(cid), to = holderById(toId);
    if(!cont || !to || to.type === 'container'){ toast('Escolha quem vai pegar os itens.', true); return; }
    if(!containerOpenFor(cid)){ toast('Contêiner bloqueado.', true); return; }
    if(!canEditHolder(to)){ toast('Você não pode mexer no inventário de ' + to.name + '.', true); return; }
    const insts = uids.map(u => inventories[cid] && inventories[cid][u]).filter(i => i && isItemKey(i.uid));
    if(!insts.length){ toast('Item não encontrado (talvez já tenha sido pego).', true); return; }
    const entriesFor = list => list.map(inst => ({ item:{ id:inst.itemId, name:inst.name, category:inst.category }, qty:instQty(inst), noStack:inst.cond != null,
      extra:{ uid:inst.uid, source:'contêiner', cond:inst.cond, note:inst.note, foundAt:inst.foundAt } }));
    if(planAdds(to.id, entriesFor(insts)).res.some(r => !r.ok)){ toast(`Inventário de ${to.name} cheio (${capTxt(to.id)}).`, true); return; }
    const claims = await claimFromContainers([[cont, insts]]);
    if(claims === false){ onInvChanged(); return; }
    const got = claims.length ? claims.map(c => c.val).filter(Boolean) : insts;
    const plan = planAdds(to.id, entriesFor(got));
    if(plan.res.some(r => !r.ok)){ await restoreClaims(claims); toast(`Inventário de ${to.name} cheio.`, true); return; }
    got.forEach(i => { plan.ops[cid + '/' + i.uid] = null; });
    const ok = await commitInv(plan.ops, [mkLog('pegar', to, { counterpartId:cid, counterpartName:cont.name, counterpartType:'container',
      got:plan.res.map(r => itemRef(r.inst, r.qty)), source:'contêiner', invAfter:plan.after })]);
    if(!ok){ await restoreClaims(claims); return; }
    toast(got.length > 1 ? `${got.length} itens → inventário de ${to.name}` : `${got[0].name}${got[0].qty > 1 ? ' ×' + got[0].qty : ''} → inventário de ${to.name}`);
    onInvChanged();
  }
  async function containerDeposit(cid, fromId, uids){
    const cont = holderById(cid), from = holderById(fromId);
    if(!cont || !from){ return; }
    if(!containerOpenFor(cid)){ toast('Contêiner bloqueado.', true); return; }
    if(!canEditHolder(from)){ toast('Você não pode mexer no inventário de ' + from.name + '.', true); return; }
    const insts = uids.map(u => inventories[fromId] && inventories[fromId][u]).filter(Boolean);
    if(!insts.length) return;
    const entries = insts.map(inst => ({ item:{ id:inst.itemId, name:inst.name, category:inst.category }, qty:instQty(inst), noStack:inst.cond != null,
      extra:{ uid:inst.uid, source:'inventario', cond:inst.cond, note:inst.note, foundAt:inst.foundAt } }));
    const plan = planAdds(cid, entries);
    if(plan.res.some(r => !r.ok)){ toast(`${cont.name} está cheio (${capTxt(cid)}).`, true); return; }
    insts.forEach(i => { plan.ops[fromId + '/' + i.uid] = null; });
    const ok = await commitInv(plan.ops, [mkLog('depositar', from, { counterpartId:cid, counterpartName:cont.name, counterpartType:'container',
      gave:insts.map(i => itemRef(i)), source:'inventario', invAfter:simCount(fromId, plan.ops) })]);
    if(ok){ toast(`${insts.length} item(ns) guardado(s) em ${cont.name}.`); onInvChanged(); }
  }
  async function containerClear(cid){
    if(!isMaster()){ toast('Só o mestre esvazia contêineres.', true); return; }
    const cont = holderById(cid), items = invItems(cid);
    if(!cont || !items.length) return;
    if(!window.confirm(`Esvaziar "${cont.name}"? ${items.length} item(ns) serão removidos (fica no registro).`)) return;
    const ops = {}; items.forEach(i => { ops[cid + '/' + i.uid] = null; });
    await commitInv(ops, [mkLog('inv_removido', cont, { items:items.map(i => itemRef(i)), reason:'esvaziado pelo mestre' })]);
    onInvChanged();
  }
  function setContainerCfg(id, patch){
    if(!isMaster()){ toast('Só o mestre configura contêineres.', true); return; }
    const p = pins.find(x => x.id === id); if(!p) return;
    const base = pinCC(p) || p.container || {}; delete base.auto;
    p.container = Object.assign({ enabled:false, locKey:'', min:1, max:3, cap:null, access:'aberto' }, base, patch, { updatedBy:actorFields().actorName });
    saveKey(KEY_PINS, pins);
    onInvChanged(); hubChanged();
  }

  // ---------- gaveta de inventário ----------
  function openInventory(hid){
    hudCloseSheets();
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

  function slotsHtml(hid){
    const eq = equippedItems(hid), caps = cfg().equipSlots;
    return `<div class="eq-panel"><div class="eq-title">Equipado</div><div class="eq-grid">${EQUIP_SLOTS.map(s => {
      const list = eq.filter(i => i.slot === s[0]), cap = caps[s[0]] != null ? caps[s[0]] : 1;
      return `<div class="eq-slot"><span class="eq-slot-name">${escapeHtml(s[1])} <small>${list.length}/${cap}</small></span>${
        list.length ? list.map(i => `<button type="button" class="eq-item" data-act="unequip" data-uid="${escapeHtml(i.uid)}" aria-label="Desequipar ${escapeHtml(i.name)}">${escapeHtml(i.name)}${i.cond != null ? ' · ' + COND_LEVELS[i.cond] : ''} ✕</button>`).join('') : '<span class="eq-empty">vazio</span>'}</div>`;
    }).join('')}</div><p class="hub-hint">Equipar só organiza o personagem. Nenhum bônus é aplicado sozinho: os efeitos ficam com a mesa.</p></div>`;
  }
  function containerHeaderHtml(h){
    const pin = containerPin(h.id), st = containerState(h.id), cc = pinCC(pin), master = isMaster(), locked = cc.access === 'bloqueado';
    const chars = holderList().filter(x => x.type === 'token' && canEditHolder(x));
    if(!chars.some(x => x.id === invUI.takeTo)) invUI.takeTo = (charSelect.value && chars.some(x => x.id === charSelect.value)) ? charSelect.value : (chars[0] ? chars[0].id : null);
    const meta = containerMeta(h.id);
    let html = `<div class="cont-head"><div class="cont-state st-${st}">${escapeHtml(CONT_STATE_LABELS[st] || st)}</div>
      <div class="inv-item-util">${cc.locKey ? 'Tabela: ' + escapeHtml(LOC_NAMES[cc.locKey] || cc.locKey) : 'Abastecido à mão pelo mestre'}${meta && meta.generatedBy ? ' · vasculhado por ' + escapeHtml(meta.generatedBy) : ''}</div>`;
    if(locked && !master) html += '<p class="hub-hint">Este contêiner está bloqueado. Só o mestre pode abri-lo.</p>';
    else {
      if(cc.locKey && !(meta && meta.generatedAt)) html += '<button type="button" class="inv-mini-btn primary" data-act="cont-search">' + ic('search', 16) + ' Vasculhar</button>';
      html += chars.length ? `<label class="hub-label">Pegar para</label><select data-role="take-to">${chars.map(x => `<option value="${escapeHtml(x.id)}" ${x.id === invUI.takeTo ? 'selected' : ''}>${escapeHtml(x.name)} (${escapeHtml(capTxt(x.id))})</option>`).join('')}</select>
        <div class="inv-item-actions"><button type="button" class="inv-mini-btn primary" data-act="cont-take-all" ${invCount(h.id) ? '' : 'disabled'}>Pegar tudo</button>
        <button type="button" class="inv-mini-btn" data-act="cont-deposit-open">Guardar do inventário…</button></div>`
        : '<p class="hub-hint">Você não controla nenhum token neste mapa, então não pode pegar itens.</p>';
    }
    if(invUI.depositOpen && chars.length){
      const mine = invItems(invUI.takeTo).filter(i => !i.slot);
      html += `<div class="inv-inline"><div class="hub-label">Guardar de ${escapeHtml((holderById(invUI.takeTo) || {}).name || '')}</div>${
        mine.length ? mine.map(i => `<div class="cont-row"><span>${iconHtml({ id:i.itemId, name:i.name, category:i.category })}${escapeHtml(i.name)}${itemQtyTxt(i)}</span><button type="button" class="inv-mini-btn" data-act="cont-deposit" data-uid="${escapeHtml(i.uid)}">Guardar</button></div>`).join('') : '<div class="inv-item-util">Nada para guardar (itens equipados ficam de fora).</div>'}</div>`;
    }
    if(master){
      html += `<div class="hub-label">Mestre</div><div class="inv-item-actions">
        ${cc.locKey ? '<button type="button" class="inv-mini-btn" data-act="cont-refill">Reabastecer</button>' : ''}
        <button type="button" class="inv-mini-btn danger" data-act="cont-clear" ${invCount(h.id) ? '' : 'disabled'}>Esvaziar</button>
        <button type="button" class="inv-mini-btn" data-act="cont-lock">${ic(locked ? 'unlock' : 'lock', 14)} ${locked ? 'Desbloquear' : 'Bloquear'}</button></div>`;
    }
    return html + '</div>';
  }

  function renderInvDrawer(){
    const hl = allHolders();
    const hs = document.getElementById('inv-holder-select');
    hs.innerHTML = hl.length ? holderOptionsHtml(hl, true) : '<option value="">Nenhum token, NPC ou contêiner no mapa</option>';
    if(!hl.some(h => h.id === invUI.holderId)) invUI.holderId = hl[0] ? hl[0].id : null;
    hs.value = invUI.holderId || '';


    const hid = invUI.holderId, n = invCount(hid), hobj = holderById(hid), isCont = !!hobj && hobj.type === 'container';
    const fill = document.getElementById('inv-cap-fill');
    const cc = cfg(), cap = hid ? holderCap(hid) : Infinity;
    const pct = isCont ? (cap === Infinity ? 0 : n / cap) : (cc.invMode === 'slots' ? n / MAX_INV : (cc.invMode === 'carga' ? invWeight(hid) / cc.invLimit : 0));
    fill.style.width = Math.min(100, pct * 100) + '%';
    fill.className = pct >= 1 ? 'full' : (pct >= 0.8 ? 'warn' : '');
    document.getElementById('inv-cap-text').textContent = capTxt(hid);
    document.getElementById('inv-trade-open').disabled = !hid;
    document.getElementById('inv-trade-open').style.display = isCont ? 'none' : '';
    document.getElementById('inv-merge').style.display = isCont ? 'none' : '';

    renderTradePanel();

    // categorias presentes, para o filtro
    const catSel = document.getElementById('inv-cat');
    const cats = Array.from(new Set(invItems(hid).map(i => i.category))).sort();
    if(invUI.cat && !cats.includes(invUI.cat)) invUI.cat = '';
    catSel.innerHTML = '<option value="">Todas as categorias</option>' + cats.map(c => `<option value="${escapeHtml(c)}" ${c === invUI.cat ? 'selected' : ''}>${escapeHtml(c)}</option>`).join('');
    document.getElementById('inv-extra').innerHTML = !hid ? '' : (isCont ? containerHeaderHtml(hobj) : slotsHtml(hid));

    const list = document.getElementById('inv-list');
    list.innerHTML = '';
    if(!hid){
      list.innerHTML = '<div class="inv-empty">Crie um token, um NPC ou um contêiner no mapa para ter um inventário.</div>';
      return;
    }
    const q = (invUI.filter || '').trim().toLowerCase();
    const items = invItems(hid).filter(i => (!invUI.cat || i.category === invUI.cat) && (!q || normName(i.name).includes(normName(q))));
    if(!invItems(hid).length){
      list.innerHTML = isCont ? '<div class="inv-empty">Vazio.</div>' : '<div class="inv-empty">Inventário vazio. Itens chegam por saque, pela tabela de itens, por troca ou de contêineres.</div>';
      return;
    }
    if(!items.length){ list.innerHTML = '<div class="inv-empty">Nenhum item com esse filtro.</div>'; return; }
    items.forEach(inv => {
      const ref = ITEMS_BY_ID[inv.itemId];
      const row = document.createElement('div');
      row.className = 'inv-item' + (inv.category === 'Itens Anômalos e Paranormais' ? ' anomalo' : '') + (inv.cond === 0 ? ' broken' : '');
      row.innerHTML = `
        <div class="inv-item-name">${iconHtml({ id:inv.itemId, name:inv.name, category:inv.category })}${escapeHtml(inv.name)}${instQty(inv) > 1 ? ` <span class="qty-chip">×${instQty(inv)}</span>` : ''}${inv.slot ? ` <span class="eq-chip">${escapeHtml(slotLabel(inv.slot))}</span>` : ''}</div>
        <span class="inv-item-cat">${escapeHtml(inv.category)}</span>${inv.cond != null ? `<span class="inv-item-cat cond-${inv.cond}">${escapeHtml(COND_LEVELS[inv.cond])}</span>` : ''}
        ${ref ? `<div class="inv-item-util">${escapeHtml(ref.utility)}</div>${itemFactsHtml(ref)}${compatLine(ref)}` : ''}
        ${inv.foundAt ? `<div class="inv-item-util">${ic('pin', 13)} Achado em: ${escapeHtml(inv.foundAt)}</div>` : ''}
        <div class="inv-item-actions">
          ${isCont ? `<button type="button" class="inv-mini-btn primary" data-act="cont-take" ${containerOpenFor(hid) ? '' : 'disabled'}>Pegar</button>` : `
          <button type="button" class="inv-mini-btn" data-act="use">Usar</button>
          ${canEquip(inv) ? `<button type="button" class="inv-mini-btn" data-act="${inv.slot ? 'unequip' : 'equip'}">${inv.slot ? 'Desequipar' : 'Equipar'}</button>` : ''}
          <button type="button" class="inv-mini-btn" data-act="trade">Trocar</button>`}
          <button type="button" class="inv-mini-btn" data-act="more" aria-label="Mais ações">⋯ Mais</button>
        </div>`;
      const act = (a, fn) => { const b = row.querySelector(`[data-act="${a}"]`); if(b) b.addEventListener('click', fn); };
      const setPanel = p => { invUI.panel = Object.assign({ uid:inv.uid, note:'' }, p); renderInvDrawer(); };
      act('use', () => setPanel({ type:'use', consume:consumableByDefault(inv) }));
      act('equip', () => setPanel({ type:'equip', slot:suggestSlot(inv) || 'acessorio' }));
      act('unequip', () => doEquip(hid, inv.uid, null));
      act('cont-take', () => containerTake(hid, [inv.uid], invUI.takeTo));
      act('more', () => { invUI.panel = (invUI.panel && invUI.panel.uid === inv.uid && invUI.panel.type === 'more') ? null : { type:'more', uid:inv.uid, note:'' }; renderInvDrawer(); });
      act('trade', () => {
        invUI.trade = { otherId:null, give:[inv.uid], take:[], note:'' };
        invUI.panel = null;
        renderInvDrawer();
        document.getElementById('inv-trade-panel').scrollIntoView({ block:'nearest' });
      });
      const pn = invUI.panel;
      if(pn && pn.uid === inv.uid) row.appendChild(buildInvPanel(pn, inv, hid, isCont));
      list.appendChild(row);
    });
  }

  function itemHistory(uid){
    const hit = e => (e.item && e.item.uid === uid) || [e.gave, e.got, e.used, e.made, e.items].some(a => (a || []).some(i => i && i.uid === uid));
    return lootLog.filter(hit).sort((a, b) => (b.ts || 0) - (a.ts || 0)).slice(0, 8);
  }
  // painel embutido na linha do item (usar, equipar, dividir, condição, descartar, inspecionar)
  function buildInvPanel(pn, inv, hid, isCont){
    const box = document.createElement('div');
    box.className = 'inv-inline';
    const q = instQty(inv);
    const noteField = `<input type="text" data-role="note" maxlength="140" placeholder="Observação (opcional)" value="${escapeHtml(pn.note || '')}">`;
    const actions = (okLabel, okCls) => `<div class="inv-inline-actions"><button type="button" class="inv-mini-btn ${okCls || 'primary'}" data-act="ok">${okLabel}</button><button type="button" class="inv-mini-btn" data-act="cancel">Cancelar</button></div>`;
    if(pn.type === 'more'){
      box.innerHTML = `<div class="inv-item-actions">
        <button type="button" class="inv-mini-btn" data-go="inspect">${ic('search', 14)} Inspecionar</button>
        ${!isCont && q > 1 ? `<button type="button" class="inv-mini-btn" data-go="split">${ic('cut', 14)} Dividir pilha</button>` : ''}
        ${!isCont && hasCondition(inv) ? `<button type="button" class="inv-mini-btn" data-go="cond">${ic('tool', 14)} ${inv.cond != null && inv.cond < COND_LEVELS.length - 1 ? 'Reparar / condição' : 'Condição'}</button>` : ''}
        ${!isCont || isMaster() ? '<button type="button" class="inv-mini-btn danger" data-go="discard">Descartar</button>' : ''}
        <button type="button" class="inv-mini-btn" data-act="cancel">Fechar</button></div>`;
      box.querySelectorAll('[data-go]').forEach(b => b.addEventListener('click', () => {
        invUI.panel = { type:b.dataset.go, uid:inv.uid, note:'', amount:q, level:inv.cond != null ? inv.cond : 3, split:Math.max(1, Math.floor(q / 2)) };
        renderInvDrawer();
      }));
    } else if(pn.type === 'inspect'){
      const ref = ITEMS_BY_ID[inv.itemId];
      const hist = itemHistory(inv.uid);
      box.innerHTML = `<div class="inv-item-util"><b>Categoria:</b> ${escapeHtml(inv.category)}${q > 1 ? ` · <b>Quantidade:</b> ${q}` : ''}${inv.cond != null ? ` · <b>Condição:</b> ${escapeHtml(COND_LEVELS[inv.cond])}` : ''}${inv.slot ? ` · <b>Equipado:</b> ${escapeHtml(slotLabel(inv.slot))}` : ''}</div>
        ${ref ? `<div class="inv-item-util"><b>Utilidade:</b> ${escapeHtml(ref.utility)}</div>${itemFactsHtml(ref, { full:true })}${compatLine(ref)}` : ''}
        <div class="inv-item-util"><b>Origem:</b> ${escapeHtml(SOURCE_LABELS[inv.source] || inv.source || '—')}${inv.addedBy ? ' · por ' + escapeHtml(inv.addedBy) : ''}${inv.addedAt ? ' · ' + escapeHtml(fmtTs(inv.addedAt)) : ''}${inv.foundAt ? '<br>📍 ' + escapeHtml(inv.foundAt) : ''}</div>
        <div class="hub-label">Histórico deste item</div>${hist.length ? hist.map(e => `<div class="log-row"><div class="log-meta"><span class="log-badge ${escapeHtml(e.action)}">${escapeHtml(ACTION_LABELS[e.action] || e.action)}</span><span>${escapeHtml(fmtTs(e.ts))}</span></div><div>${logText(e)}</div></div>`).join('') : '<div class="inv-item-util">Sem movimentações registradas para esta unidade.</div>'}
        <div class="inv-inline-actions"><button type="button" class="inv-mini-btn" data-act="cancel">Fechar</button></div>`;
    } else if(pn.type === 'use'){
      const fxList = usableFx(hid, ITEMS_BY_ID[inv.itemId]);
      box.innerHTML = `<label><input type="checkbox" data-role="consume" ${pn.consume ? 'checked' : ''}> Consumir (${q > 1 ? 'gasta 1 unidade' : 'remove do inventário'})</label>
        ${fxList.length ? `<label><input type="checkbox" data-role="applyfx" ${pn.applyFx ? 'checked' : ''}> Aplicar à ficha o efeito sugerido: ${escapeHtml(fxText(fxList))}</label>` : ''}${noteField}${actions('Confirmar uso')}`;
      box.querySelector('[data-role="consume"]').addEventListener('change', e => { pn.consume = e.target.checked; });
      const afx = box.querySelector('[data-role="applyfx"]'); if(afx) afx.addEventListener('change', e => { pn.applyFx = e.target.checked; });
    } else if(pn.type === 'discard'){
      box.innerHTML = `<p>Descartar remove ${q > 1 ? 'unidades' : 'o item'} do inventário de vez. A ação fica registrada.</p>
        ${q > 1 ? `<label class="hub-label">Quantidade a descartar (1 a ${q})</label><input type="number" min="1" max="${q}" data-role="amount" value="${pn.amount || q}">` : ''}${noteField}${actions('Confirmar descarte', 'danger')}`;
      const am = box.querySelector('[data-role="amount"]'); if(am) am.addEventListener('input', e => { pn.amount = e.target.value; });
    } else if(pn.type === 'split'){
      box.innerHTML = `<label class="hub-label">Separar quantas unidades? (1 a ${q - 1})</label><input type="number" min="1" max="${q - 1}" data-role="split" value="${pn.split}">${actions('Dividir')}`;
      box.querySelector('[data-role="split"]').addEventListener('input', e => { pn.split = e.target.value; });
    } else if(pn.type === 'equip'){
      const caps = cfg().equipSlots;
      box.innerHTML = `<label class="hub-label">Equipar em</label><select data-role="slot">${EQUIP_SLOTS.map(s => {
        const used = equippedItems(hid).filter(i => i.slot === s[0]).length, cap = caps[s[0]] != null ? caps[s[0]] : 1;
        return `<option value="${s[0]}" ${s[0] === pn.slot ? 'selected' : ''}>${escapeHtml(s[1])} (${used}/${cap})</option>`;
      }).join('')}</select>${actions('Equipar')}`;
      box.querySelector('[data-role="slot"]').addEventListener('change', e => { pn.slot = e.target.value; });
    } else if(pn.type === 'cond'){
      box.innerHTML = `<label class="hub-label">Condição${inv.cond != null ? ' (atual: ' + escapeHtml(COND_LEVELS[inv.cond]) + ')' : ' (ainda não definida)'}</label>
        <select data-role="level">${COND_LEVELS.map((l, i) => `<option value="${i}" ${i === Number(pn.level) ? 'selected' : ''}>${escapeHtml(l)}</option>`).join('')}</select>${noteField}
        <p class="hub-hint">Reparar é subir a condição; dano é descê-la. O resultado de um teste de reparo é decidido pela mesa.</p>${actions('Registrar')}`;
      box.querySelector('[data-role="level"]').addEventListener('change', e => { pn.level = e.target.value; });
    }
    const nf = box.querySelector('[data-role="note"]'); if(nf) nf.addEventListener('input', e => { pn.note = e.target.value.trim(); });
    const cancel = box.querySelector('[data-act="cancel"]'); if(cancel) cancel.addEventListener('click', () => { invUI.panel = null; renderInvDrawer(); });
    const ok = box.querySelector('[data-act="ok"]');
    if(ok) ok.addEventListener('click', () => {
      if(pn.type === 'use') doUse(hid, inv.uid, pn.consume, pn.note, pn.applyFx);
      else if(pn.type === 'discard') doDiscard(hid, inv.uid, pn.note, pn.amount);
      else if(pn.type === 'split') doSplit(hid, inv.uid, pn.split);
      else if(pn.type === 'equip') doEquip(hid, inv.uid, pn.slot);
      else if(pn.type === 'cond') doCondition(hid, inv.uid, pn.level, pn.note);
    });
    return box;
  }

  function renderTradePanel(){
    const box = document.getElementById('inv-trade-panel');
    const t = invUI.trade;
    if(!t){ box.innerHTML = ''; return; }
    const me = holderById(invUI.holderId);
    const others = allHolders().filter(h => h.id !== invUI.holderId && !(h.type === 'container' && !containerOpenFor(h.id)));
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
    const over = aAfter > holderCap(me.id) || bAfter > holderCap(other.id);
    const empty = !t.give.length && !t.take.length;
    const checks = (list, side, sel) => list.length
      ? list.map(i => `<label><input type="checkbox" data-side="${side}" value="${escapeHtml(i.uid)}" ${sel.includes(i.uid) ? 'checked' : ''}><span>${iconHtml({ id:i.itemId, name:i.name, category:i.category })}${escapeHtml(i.name)}${itemQtyTxt(i)}</span></label>`).join('')
      : '<div class="inv-item-util">Nenhum item.</div>';
    box.innerHTML = `
      <div class="inv-trade">
        <select data-role="other">${holderOptionsHtml(others, true)}</select>
        <div class="inv-trade-cols">
          <div class="inv-trade-col"><h4>Você entrega (${escapeHtml(me.name)})</h4>${checks(mine.filter(i => !i.slot), 'give', t.give)}</div>
          <div class="inv-trade-col"><h4>Você recebe (${escapeHtml(other.name)})</h4>${checks(theirs, 'take', t.take)}</div>
        </div>
        <div class="inv-trade-preview">
          ${escapeHtml(me.name)}: ${fmtCount(aAfter)} · ${escapeHtml(other.name)}: ${fmtCount(bAfter)}
          ${over ? `<br><span class="bad">A troca excede o limite de itens de um dos lados.</span>` : ''}
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
  function namesOf(arr){ return (arr || []).map(i => `"${i.name}"${i.qty > 1 ? ' ×' + i.qty : ''}`).join(', ') || 'nada'; }
  function logText(e){
    const who = escapeHtml(e.holderName || 'Sobrevivente desconhecido');
    const it = e.item ? `"${escapeHtml(e.item.name)}"${e.item.qty > 1 ? ' ×' + e.item.qty : ''}` : '';
    const src = SOURCE_LABELS[e.source] || e.source || '';
    switch(e.action){
      case 'saque': return `${who} encontrou ${it}${e.total > 1 ? ' (item ' + e.n + ' de ' + e.total + ')' : ''}${e.locName ? ' em ' + escapeHtml(e.locName) : ''}${e.coord ? ' (' + ic('pin', 12) + ' ' + escapeHtml(e.coord) + ')' : ''}${e.pinTitle ? ' · local: ' + escapeHtml(e.pinTitle) : ''}`;
      case 'guardar': return `${who} guardou ${it} no inventário (${escapeHtml(src)}) · ${e.invAfter != null ? fmtCount(e.invAfter) : ''}`;
      case 'recusar': return `${who} não manteve ${it}${e.reason ? ' (' + escapeHtml(e.reason) + ')' : ''}`;
      case 'adicionar': return `${who} recebeu ${it} direto da tabela de itens · ${e.invAfter != null ? fmtCount(e.invAfter) : ''}`;
      case 'usar': return `${who} usou ${it} · ${e.consumed ? 'consumido' : 'mantido no inventário'}`;
      case 'descartar': return `${who} descartou ${it}`;
      case 'troca': return `${who} ⇄ ${escapeHtml(e.counterpartName || '?')}: entregou ${escapeHtml(namesOf(e.gave))} · recebeu ${escapeHtml(namesOf(e.got))}`;
      case 'craft': return `${who} ${e.outcome === 'sucesso' ? 'fabricou' : 'tentou fabricar'} "${escapeHtml(e.recipe || '?')}"${e.outcome === 'sucesso' ? '' : ' e falhou'} · usou: ${escapeHtml(namesOf(e.used))}${e.made && e.made.length ? ' · obteve: ' + escapeHtml(namesOf(e.made)) : ''}`;
      case 'inv_removido': return `Inventário de ${who} removido${e.reason ? ' (' + escapeHtml(e.reason) + ')' : ''}: ${escapeHtml(namesOf(e.items))}`;
      case 'vasculhar': return `${escapeHtml(e.actorName || '?')} vasculhou ${who}${e.locName ? ' (' + escapeHtml(e.locName) + ')' : ''} e encontrou: ${escapeHtml(namesOf(e.made))}`;
      case 'pegar': return `${who} pegou ${escapeHtml(namesOf(e.got))} de ${escapeHtml(e.counterpartName || '?')}`;
      case 'depositar': return `${who} guardou ${escapeHtml(namesOf(e.gave))} em ${escapeHtml(e.counterpartName || '?')}`;
      case 'condicao': case 'reparar': return `${who}: ${it} · condição ${escapeHtml(e.condFrom || '—')} → ${escapeHtml(e.condTo || '—')}`;
      case 'ajuste': return `${escapeHtml(e.actorName || '?')} (mestre) ajustou ${who}: ${escapeHtml(e.note || '')}${e.item ? ' · ' + it : ''}`;
      default: return who;
    }
  }
  function logMatches(e){
    if(invUI.logAction && e.action !== invUI.logAction) return false;
    if(invUI.logHolder && e.holderId !== invUI.logHolder && e.counterpartId !== invUI.logHolder) return false;
    return true;
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
    const prev = itemAddDest.value, hl = allHolders();
    itemAddDest.innerHTML = hl.length ? holderOptionsHtml(hl, true) : '<option value="">Nenhum token, NPC ou contêiner no mapa</option>';
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
    const sig = allHolders().map(h => h.id + ':' + h.name).join('|');
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
    hudFeedChanged();
  }

  document.getElementById('saque-open-inv').addEventListener('click', () => openInventory(charSelect.value || null));
  document.getElementById('inv-drawer-close-btn').addEventListener('click', closeInventory);
  invBackdrop.addEventListener('click', closeInventory);
  document.getElementById('inv-holder-select').addEventListener('change', e => {
    invUI.holderId = e.target.value || null; invUI.trade = null; invUI.panel = null; renderInvDrawer();
  });
  document.getElementById('inv-trade-open').addEventListener('click', () => {
    invUI.trade = { otherId:null, give:[], take:[], note:'' }; invUI.panel = null; renderInvDrawer();
  });
  document.getElementById('inv-filter').addEventListener('input', e => { invUI.filter = e.target.value; renderInvDrawer(); const f = document.getElementById('inv-filter'); f.focus(); try{ f.setSelectionRange(f.value.length, f.value.length); }catch(err){} });
  document.getElementById('inv-cat').addEventListener('change', e => { invUI.cat = e.target.value; renderInvDrawer(); });
  document.getElementById('inv-merge').addEventListener('click', () => { if(invUI.holderId) doMerge(invUI.holderId); });
  // contêineres e equipamento: um único ouvinte no painel que é redesenhado
  document.getElementById('inv-extra').addEventListener('click', e => {
    const b = e.target.closest('[data-act]');
    if(!b) return;
    const hid = invUI.holderId, a = b.dataset.act;
    if(a === 'unequip') doEquip(hid, b.dataset.uid, null);
    else if(a === 'cont-search') generateContainer(hid, false);
    else if(a === 'cont-refill'){ if(window.confirm('Reabastecer sorteia novos itens e os soma ao que já existe. Continuar?')) generateContainer(hid, true); }
    else if(a === 'cont-take-all') containerTake(hid, invItems(hid).map(i => i.uid), invUI.takeTo);
    else if(a === 'cont-deposit-open'){ invUI.depositOpen = !invUI.depositOpen; renderInvDrawer(); }
    else if(a === 'cont-deposit') containerDeposit(hid, invUI.takeTo, [b.dataset.uid]);
    else if(a === 'cont-clear') containerClear(hid);
    else if(a === 'cont-lock'){ const p = containerPin(hid); if(p) setContainerCfg(hid, { access:pinCC(p).access === 'bloqueado' ? 'aberto' : 'bloqueado' }); }
  });
  document.getElementById('inv-extra').addEventListener('change', e => {
    if(e.target.dataset && e.target.dataset.role === 'take-to'){ invUI.takeTo = e.target.value; renderInvDrawer(); }
  });
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
  const NEED_LEVELS = ['Sem marca','▲ Leve','▲▲ Moderado','▲▲▲ Grave','Crítico'];
  const EXPLORE_STATES = [['desconhecido','Desconhecido'],['conhecido','Conhecido'],['explorado','Explorado'],['esgotado','Esgotado'],['ameaca','Sob ameaça'],['bloqueado','Bloqueado'],['seguro','Seguro']];
  const CRAFT_FAMILIES = [['primeiros-socorros','Primeiros socorros'],['sobrevivencia','Sobrevivência'],['reparo','Reparo']];
  const DEFAULT_MODULES = { card:true, clock:false, needs:false, explore:false, crafting:false, places:false };
  const DEFAULT_CARD_MODULES = { identity:true, skills:true, notes:true, equip:true };

  let campaigns = {};
  let campaignMeta = null;
  let sessions = {};
  let characters = {};
  let rolls = {};
  let recipes = {};
  let clock = null;
  let campShortcuts = {};
  let journal = {};
  let gmJournal = {};
  let gmOff = null;
  let tac = { active:null, scenes:{} };   // mapa tático (público)
  let gmTac = {};                          // tokens ocultos (só o mestre recebe)
  let tacGmOff = null;
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
    cfgDraft:null, recipeForm:null, joinCode:'', craftMsg:'',
    jf:{ type:'resumo', title:'', text:'', vis:'grupo' }, djFilter:'', djTimeline:false,
    give:{ name:'', qty:1, to:'' }, bulkPick:[], bulkNeed:'exposicao', bulkDelta:1, resDraft:null, slotDraft:null, backupMsg:''
  };
  const rollUI = { terms:[{ sign:1, n:1, sides:20 }], modTerm:0, modType:'kh', modVal:1, expr:'', skill:'', bonuses:[], who:'', physical:false, phys:'', note:'', record:true, important:false, discord:false, last:null, scName:'', scScope:'character' };
  let hubDirty = false;

  // ---------- configuração da campanha ativa ----------
  function catKey(c){ return String(c).replace(/[.#$\/\[\]]/g, '_'); }
  function cfg(){
    const c = (campaignMeta && campaignMeta.config) || {};
    return {
      invMode: ['slots','carga','livre'].includes(c.invMode) ? c.invMode : 'slots',
      invLimit: Math.max(1, parseInt(c.invLimit, 10) || 20),
      decimals: Number.isInteger(c.decimals) ? Math.min(6, Math.max(0, c.decimals)) : 4,
      lootMin: Number.isInteger(c.lootMin) ? Math.min(8, Math.max(0, c.lootMin)) : 1,
      lootMax: Math.max(Number.isInteger(c.lootMin) ? Math.min(8, Math.max(0, c.lootMin)) : 1, Number.isInteger(c.lootMax) ? Math.min(8, Math.max(1, c.lootMax)) : 5),
      weights: c.weights || {},
      espMode: !!c.espMode,
      equipSlots: Object.assign({}, DEFAULT_SLOT_CAP, (c.equipSlots && typeof c.equipSlots === 'object') ? c.equipSlots : {}),
      resources: Array.isArray(c.resources) ? c.resources.filter(r => r && r.key && r.label) : [],
      modules: Object.assign({}, DEFAULT_MODULES, c.modules || {}),
      cardModules: Object.assign({}, DEFAULT_CARD_MODULES, c.cardModules || {}),
      // sistema fixo: Ordem Paranormal (segundo recurso: PD). Só a progressão é escolha da mesa.
      systemId: 'ordem',
      progressionMode: c.progressionMode === 'nex_only' ? 'nex_only' : 'nex_level',
      // lugares reais do OpenStreetMap: categorias ligadas e quando aparecem ('all' = sempre; 'near' = só perto de um token)
      places: { cats: Object.assign({}, c.places && c.places.cats), reveal: c.places && c.places.reveal === 'near' ? 'near' : 'all' }
    };
  }
  function applyConfig(){
    const c = cfg();
    MAX_INV = c.invMode === 'slots' ? c.invLimit : Infinity;
    const sel = document.getElementById('loot-pin-row');
    if(sel) sel.style.display = c.modules.explore ? '' : 'none';
    refreshLootPins();
    placesRefresh();
  }
  // volume do catálogo (0 a 4) vira peso quando a mesa liga a opção; volume 0 pesa um pouco, para pilhas grandes contarem
  const ESP_W = [0.25, 1, 2, 3, 4];
  function itemWeight(inv){
    const c = cfg();
    if(c.espMode){
      const ref = ITEMS_BY_ID[inv.itemId];
      if(ref && typeof ref.esp === 'number') return ESP_W[Math.min(4, Math.max(0, ref.esp))];
    }
    const w = c.weights[catKey(inv.category)];
    return typeof w === 'number' ? w : 1;
  }
  function invWeight(hid){ return invItems(hid).reduce((a, i) => a + itemWeight(i) * instQty(i), 0); }
  function fmtNum(n){ return String(Math.round(n * 100) / 100).replace('.', ','); }
  function weightBand(w, cap){ const r = w / cap; return r <= 0.5 ? 'leve' : (r <= 1 ? 'carregado' : 'sobrecarregado'); }
  function capTxt(hid){
    const c = cfg(), n = invCount(hid);
    if(isContainerId(hid)){ const cap = holderCap(hid); return cap === Infinity ? `${n} itens` : `${n}/${cap}`; }
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
    if(h.type === 'container') return containerOpenFor(h.id);
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
  // código que ainda não pertence a nenhuma campanha conhecida
  function uniqueCode(){
    const used = new Set(Object.keys(campaigns).map(k => campaigns[k] && campaigns[k].joinCode).filter(Boolean));
    let c = newCode(), n = 0;
    while(used.has(c) && n++ < 50) c = newCode();
    return c;
  }
  // mensagem clara quando o banco recusa uma gravação (antes falhava em silêncio)
  function dbFailMsg(what){
    const e = DB.lastError || '';
    return what + ' não foi salvo.' + (/permission|denied/i.test(e) ? ' O Firebase recusou a gravação: confira se as regras publicadas são as de firebase-rules.SUGESTAO-v3.json.' : (e ? ' (' + e + ')' : ''));
  }
  function todayStr(){ const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }

  // ---------- ligar/desligar tudo de uma campanha ----------
  function resetCampaignState(){
    pins = []; tokens = []; shapes = []; routes = [];
    weather = { state:'calmo', updatedAt:null, updatedBy:null };
    inventories = {}; lootLog = []; characters = {}; rolls = {}; recipes = {}; clock = null; campShortcuts = {}; sessions = {}; journal = {}; gmJournal = {};
    hub.resDraft = null; hub.slotDraft = null; hub.cfgDraft = null;
    tacReset();
    lootHistory = []; fishHistory = [];
    renderPins(); renderTokens(); renderShapes(); renderRoutes(); applyWeatherVisual();
    renderLootResults(); renderFishResults();
  }
  function attachModuleSync(){
    const on = (key, cb, limit) => syncOff.push(DB.on(scopedKey(key), cb, limit));
    on(KEY_CHARS, v => { characters = v || {}; hubChanged(); hudMiniChanged(); hudQRChanged(); });
    on(KEY_ROLLS, v => { rolls = v || {}; hubChanged(); hudFeedChanged(); }, 300);
    on(KEY_RECIPES, v => { recipes = v || {}; hubChanged(); });
    on(KEY_CLOCK, v => { clock = v; updateHud(); hubChanged(); });
    on(KEY_SHORTCUTS, v => { campShortcuts = v || {}; hubChanged(); });
    syncOff.push(DB.on('campaign-sessions/' + activeCampaignId, v => { sessions = v || {}; updateHud(); hubChanged(); }));
    on(KEY_JOURNAL, v => { journal = v || {}; hubChanged(); hudFeedChanged(); }, 300);
    on(KEY_TAC, v => tacOnData(v));
    syncOff.push(() => { if(gmOff){ gmOff(); gmOff = null; } if(tacGmOff){ tacGmOff(); tacGmOff = null; } });
    syncGm();
  }
  function activateCampaign(id){
    detachSync();
    activeCampaignId = id;
    try{ localStorage.setItem('tv-map:active-campaign', id); }catch(e){}
    document.getElementById('map-loading').style.display = '';
    resetCampaignState();
    campaignMeta = campaigns[id] || null;
    applyConfig();
    hudCampaignChanged();
    attachMapSync();
    initInventorySync();
    attachModuleSync();
    updateHud(); onInvChanged(); renderHub();
  }
  function bootstrapLegacy(){
    if(legacyBooted) return;
    legacyBooted = true;
    const ts = DB.ts();
    // A campanha e a sessão vão em gravações separadas: as regras só deixam gravar
    // a sessão depois que a campanha existe (e, na original, só depois de ter mestre).
    DB.set('campaign-meta/legacy', { id:'legacy', name:'Campanha atual', system:'Ordem Paranormal — Sobrevivendo ao Horror (adaptado)',
      masterId:null, masterName:null, createdAt:ts, archived:false, joinCode:newCode(), activeSessionId:'inaugural',
      note:'Criada a partir dos dados que já existiam. Nada foi movido.' }).then(ok => { if(ok) ensureLegacySession(); });
  }
  function ensureLegacySession(){
    if(!campaigns.legacy || sessions.inaugural || activeCampaignId !== 'legacy') return;
    if(firebaseReady && !(currentUser && campaigns.legacy.masterId === currentUser.uid)) return; // sem mestre, as regras não permitem
    DB.set('campaign-sessions/legacy/inaugural', { id:'inaugural', title:'Sessão inaugural', date:todayStr(), present:[], summary:'', createdAt:DB.ts(), closed:false });
  }
  // registros antigos da campanha original podem ter ficado sem id/data/sessão ativa
  let legacyRepaired = false;
  function repairLegacyMeta(noId){
    const m = campaigns.legacy;
    if(legacyRepaired || !m) return;
    if(!noId && m.createdAt && m.activeSessionId) return;
    if(firebaseReady && !(currentUser && (!m.masterId || m.masterId === currentUser.uid))) return;
    legacyRepaired = true;
    const up = {};
    up['campaign-meta/legacy/id'] = 'legacy';
    if(!m.createdAt) up['campaign-meta/legacy/createdAt'] = DB.ts();
    if(!m.activeSessionId) up['campaign-meta/legacy/activeSessionId'] = 'inaugural';
    DB.update(up).then(() => ensureLegacySession());
  }
  function startMetaSync(){
    DB.on('campaign-meta', v => {
      campaigns = v || {};
      const legacyNoId = !!(campaigns.legacy && !campaigns.legacy.id);
      Object.keys(campaigns).forEach(k => { if(campaigns[k] && typeof campaigns[k] === 'object') campaigns[k].id = k; });
      if(!campaigns.legacy) bootstrapLegacy(); else repairLegacyMeta(legacyNoId);
      const m = campaigns[activeCampaignId];
      if(!m && activeCampaignId !== 'legacy' && campaigns.legacy){ activateCampaign('legacy'); return; }
      const wasMaster = campaignMeta ? campaignMeta.masterId : undefined;
      campaignMeta = m || null;
      if(!gmOff || (campaignMeta ? campaignMeta.masterId : undefined) !== wasMaster) syncGm();
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
      archived:false, joinCode:uniqueCode(), activeSessionId:'s1' };
    if(a.actorId) meta.members = { [a.actorId]: { name:a.actorName, role:'master' } };
    if(f.mode === 'duplicar' && src && src.config) meta.config = JSON.parse(JSON.stringify(src.config));
    // 1) a campanha primeiro: as regras só liberam sessão e dados depois que ela existe
    if(!(await DB.set('campaign-meta/' + id, meta))){ toast(dbFailMsg('A campanha'), true); return; }
    // 2) a primeira sessão
    const sessOk = await DB.set('campaign-sessions/' + id + '/s1', { id:'s1', title:'Sessão 1', date:todayStr(), present:[], summary:'', createdAt:DB.ts(), closed:false });
    // 3) dados copiados (modelo/duplicar)
    let copyOk = true;
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
        try{
          let v = await readScoped(f.source, k);
          if(v == null) continue;
          if(f.mode === 'modelo' && k === KEY_PINS && Array.isArray(v)) v = v.map(p => { const c = Object.assign({}, p); delete c.explore; return c; });
          await writeScoped(id, k, v);
        }catch(e){ copyOk = false; console.error('Falha ao copiar', k, e); }
      }
    }
    hub.newCampaign.name = ''; hub.newCampaign.system = '';
    renderHub();
    if(!sessOk || !copyOk) toast('A campanha foi criada, mas ' + (!sessOk ? 'a primeira sessão' : 'parte dos dados copiados') + ' não pôde ser salva. Você pode abrir uma nova sessão depois.', true);
    if(window.confirm(`Campanha "${name}" criada. Abrir agora? (a campanha atual é salva e continua intacta)`)) activateCampaign(id);
  }
  // gerar ou trocar o código de convite (só o mestre da campanha)
  async function setJoinCode(id, replace){
    const m = campaigns[id];
    if(!m || !isMasterOf(m)){ toast('Só o mestre da campanha gera o código.', true); return; }
    if(firebaseReady && !currentUser){ toast('Entre com sua conta para gerar o código.', true); return; }
    if(replace && m.joinCode && !window.confirm(`Trocar o código de "${m.name}"? O código antigo (${m.joinCode}) deixa de funcionar para novos jogadores. Quem já entrou continua na campanha.`)) return;
    const code = uniqueCode();
    const ok = await DB.update({ ['campaign-meta/' + id + '/joinCode']: code, ['campaign-meta/' + id + '/id']: id });
    if(!ok){ toast(dbFailMsg('O código'), true); return; }
    toast(`Código de convite: ${code}`);
  }
  async function copyJoinCode(id){
    const m = campaigns[id]; if(!m || !m.joinCode) return;
    try{ await navigator.clipboard.writeText(m.joinCode); toast('Código copiado: ' + m.joinCode); }
    catch(e){ toast('Código: ' + m.joinCode + ' (copie manualmente)'); }
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
    if(!isMasterOf(m)){ toast('Só o mestre da campanha exclui.', true); return; }
    if(firebaseReady && !currentUser){ toast('Entre com sua conta para excluir.', true); return; }
    const aberta = id === activeCampaignId;
    const typed = window.prompt(`Excluir "${m.name}" apaga mapa, tokens, inventários, fichas e registros dela, sem volta.${aberta ? '\nEla está aberta agora: você volta para a campanha original.' : ''}\nDigite o nome da campanha para confirmar:`);
    if(typed == null) return;
    if(typed.trim().toLowerCase() !== String(m.name || '').trim().toLowerCase()){ toast('Nome diferente. Nada foi apagado.', true); return; }
    // se estiver aberta, sai dela antes de apagar (os ouvintes dela são desligados)
    if(aberta) activateCampaign('legacy');
    // 1) os dados (as regras dependem de a campanha ainda existir, por isso ela é apagada por último).
    //    Uma chave que o banco recuse não impede o resto.
    let skipped = 0;
    for(const k of SCOPED_KEYS){
      try{ await writeScoped(id, k, null); }catch(e){ skipped++; console.error('Não foi possível apagar', k, e); }
    }
    // 2) sessões e a própria campanha
    const ok = await DB.update({ ['campaign-meta/' + id]: null, ['campaign-sessions/' + id]: null });
    if(!ok){ toast(dbFailMsg('A exclusão'), true); return; }
    toast(skipped ? `Campanha excluída. ${skipped} tipo(s) de dado não puderam ser apagados (regras antigas do Firebase); ficam escondidos e sem uso.` : 'Campanha excluída.', false);
  }
  function isMasterOf(m){ return !firebaseReady || !m.masterId || (!!currentUser && m.masterId === currentUser.uid); }
  async function joinCampaign(code){
    code = String(code || '').trim().toUpperCase();
    if(!firebaseReady){ toast('Sem Firebase, todas as campanhas deste navegador já aparecem na lista.'); return; }
    if(!currentUser){ toast('Entre com sua conta para usar um código.', true); return; }
    const m = Object.keys(campaigns).map(k => campaigns[k]).find(x => x && x.joinCode === code);
    if(!m){ toast('Código não encontrado.', true); return; }
    if(!(await DB.set(`campaign-meta/${m.id}/members/${currentUser.uid}`, { name:actorFields().actorName, role:'player' }))){ toast(dbFailMsg('A entrada na campanha'), true); return; }
    hub.joinCode = '';
    toast(`Você entrou em "${m.name}".`);
  }
  async function claimMaster(){
    if(!currentUser){ toast('Entre com sua conta para assumir como mestre.', true); return; }
    if(!isUnclaimed()){ return; }
    const a = actorFields();
    const ok = await DB.update({
      [`campaign-meta/${activeCampaignId}/masterId`]: a.actorId,
      [`campaign-meta/${activeCampaignId}/masterName`]: a.actorName,
      [`campaign-meta/${activeCampaignId}/members/${a.actorId}`]: { name:a.actorName, role:'master' }
    });
    if(!ok){ toast(dbFailMsg('A troca de mestre'), true); return; }
    toast('Você agora é o mestre desta campanha.');
    legacyRepaired = false; setTimeout(() => { repairLegacyMeta(false); ensureLegacySession(); }, 400);
  }
  async function saveConfig(){
    if(!isMaster()){ toast('Só o mestre altera a configuração.', true); return; }
    const d = hub.cfgDraft; if(!d) return;
    const weights = {};
    Object.keys(d.weights || {}).forEach(k => { const n = Number(d.weights[k]); if(!isNaN(n) && n >= 0 && n !== 1) weights[k] = n; });
    if(parseInt(d.lootMax, 10) < parseInt(d.lootMin, 10)){ toast('O máximo de itens por saque não pode ser menor que o mínimo.', true); return; }
    const config = Object.assign({}, (campaignMeta && campaignMeta.config) || {}, {
      systemId:'ordem', progressionMode:d.progressionMode === 'nex_only' ? 'nex_only' : 'nex_level',
      invMode:d.invMode, invLimit:Math.max(1, parseInt(d.invLimit, 10) || 20),
      decimals:Math.min(6, Math.max(0, parseInt(d.decimals, 10) || 0)),
      lootMin:Math.min(8, Math.max(0, parseInt(d.lootMin, 10) || 0)),
      lootMax:Math.min(8, Math.max(1, parseInt(d.lootMax, 10) || 1)),
      weights, espMode:!!d.espMode, modules:d.modules, cardModules:d.cardModules,
      places:{ cats:d.placeCats || {}, reveal:d.placeReveal === 'near' ? 'near' : 'all' },
      equipSlots:cfg().equipSlots, resources:cfg().resources
    });
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
    logEvent('Nova sessão aberta: ' + title);
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
    chip.innerHTML = ic('book', 13) + '<span>' + esc(parts.join(' · ')) + '</span>';
    chip.setAttribute('aria-label', 'Campanha ativa: ' + parts.join(', ') + '. Abrir campanhas e sessões.');
    hudMiniChanged(); hudFeedChanged();
  }

  // ---------- roller ----------
  const PAD_DICE = [4, 6, 8, 10, 12, 20, 100, 'F'];
  const OK_SIDES = [2, 3, 4, 6, 8, 10, 12, 20, 100];
  const DIE_SHAPES = {
    4:'<polygon points="24,5 44,41 4,41"/>',
    6:'<rect x="7" y="7" width="34" height="34" rx="7"/>',
    8:'<polygon points="24,3 44,24 24,45 4,24"/>',
    10:'<polygon points="24,3 43,19 24,45 5,19"/>',
    12:'<polygon points="24,3 44,18 37,43 11,43 4,18"/>',
    20:'<polygon points="24,3 43,14 43,34 24,45 5,34 5,14"/>',
    100:'<circle cx="24" cy="24" r="20"/>',
    F:'<rect x="7" y="7" width="34" height="34" rx="15"/>'
  };
  // forma visual do dado (d4 triângulo, d6 quadrado, d8 losango, d10 pipa, d12 pentágono, d20 hexágono, d100 círculo)
  function dieSvg(sides, text, cls, label){
    const shape = DIE_SHAPES[sides] || DIE_SHAPES[100];
    const len = String(text).length;
    return `<svg class="dshape${len >= 3 ? ' t3' : ''}${cls ? ' ' + cls : ''}" viewBox="0 0 48 48" role="img" aria-label="${esc(label || text)}">${shape}<text x="24" y="29" text-anchor="middle">${esc(text)}</text></svg>`;
  }
  function rollDie(sides){
    const c = (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) ? window.crypto : null;
    if(!c) return 1 + Math.floor(Math.random() * sides);
    const lim = Math.floor(0x100000000 / sides) * sides;
    const a = new Uint32Array(1);
    do{ c.getRandomValues(a); }while(a[0] >= lim);
    return 1 + (a[0] % sides);
  }
  function cmpOp(op, v, x){
    switch(op){ case '>=': return v >= x; case '<=': return v <= x; case '>': return v > x; case '<': return v < x; default: return v === x; }
  }
  function hasMods(t){ return t.kh != null || t.kl != null || t.dh != null || t.dl != null || !!t.ex || !!t.rr || !!t.sc; }
  function termDefLabel(t){
    let l = (t.sign < 0 ? '−' : '') + t.n + 'd' + t.sides;
    if(t.kh != null) l += 'kh' + t.kh;
    if(t.kl != null) l += 'kl' + t.kl;
    if(t.dh != null) l += 'dh' + t.dh;
    if(t.dl != null) l += 'dl' + t.dl;
    if(t.ex) l += (t.ex.op === '=' && t.ex.val === t.sides) ? '!' : '!' + t.ex.op + t.ex.val;
    if(t.rr) l += 'r' + (t.rr.op === '=' ? '' : t.rr.op) + t.rr.val;
    if(t.sc) l += t.sc.op + t.sc.val;
    return l;
  }
  // Lê expressões como: 2d6+1d8+3 · 4d6kh3 · 2d20kl1 · 4d6dl1 · 3d6! · 5d10!>=9 · 4d6r1 · 10d10>=8 · adv · dis · dF · d%
  function parseExpr(str){
    let s = String(str || '').toLowerCase().replace(/\s+/g, '');
    if(!s) return { error:'Escreva uma expressão, ex.: 4d6kh3+2.' };
    s = s.replace(/desv(antagem)?|dis/g, '2d20kl1').replace(/vant(agem)?|adv/g, '2d20kh1').replace(/d%/g, 'd100');
    const HEAD = /([+-]?)(?:(\d*)d(\d+|f)|(\d+))/y;
    const MOD = /(kh|kl|dh|dl|k)(\d*)|!(>=|<=|>|<|=)?(\d*)|ro?(>=|<=|>|<|=)?(\d+)|(>=|<=|>|<|=)(\d+)/y;
    const terms = []; let bonus = 0, i = 0, total = 0;
    while(i < s.length){
      HEAD.lastIndex = i;
      const m = HEAD.exec(s);
      if(!m || m.index !== i) return { error:'Não entendi a expressão. Exemplos: 2d6+1d8+3 · 4d6kh3 · 3d6! · 10d10>=8 · adv.' };
      i = HEAD.lastIndex;
      const sign = m[1] === '-' ? -1 : 1;
      if(m[4] !== undefined){ bonus += sign * Number(m[4]); continue; }
      const n = m[2] === '' ? 1 : Number(m[2]);
      const sides = m[3] === 'f' ? 'F' : Number(m[3]);
      if(n < 1 || n > 50) return { error:'Use de 1 a 50 dados de cada vez.' };
      if(sides !== 'F' && !OK_SIDES.includes(sides)) return { error:`d${sides} não é suportado. Use ${OK_SIDES.map(d => 'd' + d).join(', ')} ou dF.` };
      const t = { sign, n, sides };
      for(;;){
        MOD.lastIndex = i;
        const mm = MOD.exec(s);
        if(!mm || mm.index !== i || mm[0] === '') break;
        i = MOD.lastIndex;
        if(mm[1]){
          const N = mm[2] === '' ? 1 : Number(mm[2]);
          if(N < 1) return { error:'Manter/descartar precisa de pelo menos 1.' };
          t[{ kh:'kh', k:'kh', kl:'kl', dh:'dh', dl:'dl' }[mm[1]]] = N;
        } else if(mm[0][0] === '!'){
          const v = mm[4] === '' ? null : Number(mm[4]);
          if(v === null && mm[3]) return { error:'Depois de ! com comparação, informe o número (ex.: !>=5).' };
          t.ex = v === null ? { op:'=', val:sides } : { op:mm[3] || '=', val:v };
        } else if(mm[0][0] === 'r'){
          t.rr = { op:mm[5] || '=', val:Number(mm[6]) };
        } else {
          t.sc = { op:mm[7], val:Number(mm[8]) };
        }
      }
      if(sides === 'F' && hasMods(t)) return { error:'dF não aceita modificadores.' };
      total += n;
      terms.push(t);
    }
    if(total > 100) return { error:'No máximo 100 dados por rolagem.' };
    return { terms, bonus };
  }
  function applyExpr(){
    const r = parseExpr(rollUI.expr);
    if(r.error){ toast(r.error, true); return false; }
    rollUI.terms = r.terms;
    rollUI.bonuses = rollUI.bonuses.filter(b => b.label !== 'expressão');
    if(r.bonus) rollUI.bonuses.push({ label:'expressão', value:r.bonus });
    return true;
  }
  function countsToTerms(counts){
    return Object.keys(counts || {}).filter(k => counts[k] > 0).map(k => ({ sign:1, n:counts[k], sides:Number(k) }));
  }
  // fonte dos dados: aleatória, ou a fila de resultados digitados (dados físicos)
  function makeSource(queue){
    if(!queue){ return sides => sides === 'F' ? rollDie(3) - 2 : rollDie(sides); }
    let i = 0;
    const f = sides => {
      if(i >= queue.length) throw new Error('NEED_MORE');
      const v = queue[i++];
      if(sides === 'F' ? (v < -1 || v > 1) : (v < 1 || v > sides)) throw new Error('RANGE');
      return v;
    };
    f.used = () => i;
    return f;
  }
  function rollTerm(t, src){
    const dice = [];
    for(let k = 0; k < t.n; k++){
      let v = src(t.sides);
      const die = { v };
      if(t.rr && cmpOp(t.rr.op, v, t.rr.val)){ die.was = v; v = src(t.sides); die.v = v; }
      dice.push(die);
      if(t.ex){
        let cur = die.v, guard = 0;
        while(cmpOp(t.ex.op, cur, t.ex.val) && guard++ < 20 && dice.length < 200){ cur = src(t.sides); dice.push({ v:cur, x:true }); }
      }
    }
    const live = () => dice.map((d, i) => i).filter(i => !dice[i].drop);
    const byVal = (asc) => live().sort((a, b) => (asc ? dice[a].v - dice[b].v : dice[b].v - dice[a].v) || a - b);
    if(t.kh != null) byVal(false).slice(t.kh).forEach(i => { dice[i].drop = true; });
    if(t.kl != null) byVal(true).slice(t.kl).forEach(i => { dice[i].drop = true; });
    if(t.dh != null) byVal(false).slice(0, t.dh).forEach(i => { dice[i].drop = true; });
    if(t.dl != null) byVal(true).slice(0, t.dl).forEach(i => { dice[i].drop = true; });
    let value = 0;
    if(t.sc){
      live().forEach(i => { if(cmpOp(t.sc.op, dice[i].v, t.sc.val)){ dice[i].s = true; value++; } });
    } else {
      live().forEach(i => { value += dice[i].v; });
    }
    return { sign:t.sign, n:t.n, sides:t.sides, label:termDefLabel(t), dice, value:t.sign * value, succ:!!t.sc };
  }
  function fmtDie(d){
    let t = String(d.v);
    if(d.x) t += '!';
    if(d.was != null) t = d.was + '→' + t;
    return d.drop ? '(' + t + ')' : t;
  }
  function fmtTerms(terms){
    return terms.map(t => `${t.label} [${t.dice.map(fmtDie).join(', ')}] = ${t.value}${t.succ ? ' suc.' : ''}`).join(' + ');
  }
  function fmtGroups(groups){ return groups.map(g => `${g.values.length > 1 ? g.values.length : ''}d${g.sides} [${g.values.join(', ')}]`).join(' + '); }
  function fmtRoll(r){ return r.terms ? fmtTerms(r.terms) : fmtGroups(r.groups || []); }
  function fmtBonuses(bs){ return (bs || []).map(b => `${b.value >= 0 ? '+' : '−'}${Math.abs(b.value)}${b.label ? ' (' + b.label + ')' : ''}`).join(' '); }
  async function doRoll(){
    if(!rollUI.terms.length){ toast('Adicione ao menos um dado.', true); return; }
    let queue = null;
    if(rollUI.physical) queue = (String(rollUI.phys).match(/-?\d+/g) || []).map(Number);
    const src = makeSource(queue);
    let results;
    try{
      results = rollUI.terms.map(t => rollTerm(t, src));
    }catch(err){
      if(err.message === 'NEED_MORE') toast('Faltam resultados dos dados físicos (explosões e rerrolagens pedem dados a mais, na ordem em que acontecem).', true);
      else if(err.message === 'RANGE') toast('Algum resultado está fora do alcance do dado.', true);
      else throw err;
      return;
    }
    if(queue && src.used() < queue.length){ toast('Sobraram resultados: confira quantos dados foram rolados.', true); return; }
    const bonuses = rollUI.bonuses.map(b => ({ label:(b.label || '').trim(), value:Number(b.value) })).filter(b => !isNaN(b.value) && b.value !== 0);
    const diceSum = results.reduce((a, t) => a + t.value, 0);
    const bonusSum = bonuses.reduce((a, b) => a + b.value, 0);
    const holder = holderById(rollUI.who);
    const a = actorFields();
    const rec = { important:!!rollUI.important, skill:(rollUI.skill || '').trim(), terms:results, diceSum, bonuses, bonusSum, total:diceSum + bonusSum,
      note:(rollUI.note || '').trim(), physical:!!rollUI.physical, tokenId:holder ? holder.id : null,
      whoName:holder ? holder.name : a.actorName, actorId:a.actorId, actorName:a.actorName,
      sessionId:(campaignMeta && campaignMeta.activeSessionId) || null };
    rollUI.last = Object.assign({ ts:Date.now() }, rec);
    if(rollUI.record){
      const path = scopedKey(KEY_ROLLS);
      const id = DB.newId(path);
      await DB.set(path + '/' + id, Object.assign({ id, ts:DB.ts() }, JSON.parse(JSON.stringify(rec))));
    }
    if(rollUI.discord) sendRollToDiscord(rollUI.last);
    renderHub();
  }
  // envia a rolagem ao webhook escolhido (só quando a caixa está marcada)
  async function sendRollToDiscord(r){
    const url = currentWebhookUrl();
    if(!url){ toast('Escolha um webhook (ou cole o seu) no painel de Saque para enviar ao Discord.', true); return; }
    const ses = activeSession();
    const fields = [];
    if(r.skill) fields.push({ name:'Perícia / ação', value:r.skill.slice(0, 200), inline:true });
    fields.push({ name:'Dados', value:(fmtRoll(r) + ' = ' + r.diceSum).slice(0, 900), inline:false });
    if(r.bonuses.length) fields.push({ name:'Bônus', value:(fmtBonuses(r.bonuses) + ' = ' + (r.bonusSum >= 0 ? '+' : '−') + Math.abs(r.bonusSum)).slice(0, 500), inline:true });
    if(r.note) fields.push({ name:'Observação', value:r.note.slice(0, 300), inline:false });
    const payload = {
      username:'Tau Volantis — Dados',
      allowed_mentions:{ parse:[] },
      embeds:[{
        title:`🎲 ${r.whoName || 'Rolagem'}: ${r.total}`,
        description:r.physical ? 'Dados físicos informados pelo jogador.' : undefined,
        color:0x3f8fd1, fields,
        footer:{ text:`${campaignMeta ? campaignMeta.name : 'Tau Volantis'}${ses ? ' · ' + ses.title : ''}` },
        timestamp:new Date().toISOString()
      }]
    };
    try{
      const res = await fetch(url, { method:'POST', headers:{ 'Content-Type':'application/json' }, body:JSON.stringify(payload) });
      toast(res.ok ? 'Rolagem enviada ao Discord.' : 'O Discord recusou o envio. Confira o webhook.', !res.ok);
    }catch(e){ toast('Não foi possível enviar ao Discord.', true); }
  }
  function rollText(r){
    return `${r.whoName || ''}${r.skill ? ' — ' + r.skill : ''}: ${fmtRoll(r)}${r.bonuses && r.bonuses.length ? ' ' + fmtBonuses(r.bonuses) : ''} = ${r.total}${r.note ? ' (' + r.note + ')' : ''}${r.physical ? ' [dados físicos]' : ''}`;
  }
  function copyText(t){
    try{ if(navigator.clipboard && navigator.clipboard.writeText){ navigator.clipboard.writeText(t); toast('Copiado.'); return; } }catch(e){}
    toast('Não foi possível copiar neste navegador.', true);
  }
  function padCount(s){ return rollUI.terms.filter(t => t.sides === s && t.sign === 1 && !hasMods(t)).reduce((a, t) => a + t.n, 0); }
  function padAdd(s, d){
    const t = rollUI.terms.find(x => x.sides === s && x.sign === 1 && !hasMods(x));
    if(d > 0){ if(t) t.n = Math.min(50, t.n + 1); else rollUI.terms.push({ sign:1, n:1, sides:s }); }
    else if(t){ t.n -= 1; if(t.n <= 0) rollUI.terms.splice(rollUI.terms.indexOf(t), 1); }
  }
  function addModifier(){
    const t = rollUI.terms[rollUI.modTerm | 0];
    if(!t){ toast('Escolha primeiro os dados.', true); return; }
    if(t.sides === 'F'){ toast('dF não aceita modificadores.', true); return; }
    const raw = rollUI.modVal;
    const v = (raw === '' || raw == null) ? null : Number(raw);
    const ty = rollUI.modType;
    if(['kh', 'kl', 'dh', 'dl'].includes(ty)){
      if(v != null && v < 1){ toast('Use um número de 1 em diante.', true); return; }
      t[ty] = v || 1;
    } else if(ty === 'ex'){
      t.ex = v == null ? { op:'=', val:t.sides } : { op:'>=', val:v };
    } else if(ty === 'rr'){
      if(v == null){ toast('Informe até qual valor rerrolar (ex.: 2 rerrola 1 e 2).', true); return; }
      t.rr = { op:'<=', val:v };
    } else if(ty === 'sc'){
      if(v == null){ toast('Informe o valor mínimo de sucesso (ex.: 8).', true); return; }
      t.sc = { op:'>=', val:v };
    }
  }
  function ensurePersonalSub(){
    const uid = currentUser ? currentUser.uid : 'local';
    if(uid === personalSubUid) return;
    personalSubUid = uid;
    if(personalOff) personalOff();
    personalOff = DB.on('user-shortcuts/' + uid, v => { personalShortcuts = v || {}; hubChanged(); });
  }
  // Atalhos pertencem a um personagem (aparecem só quando ele está selecionado)
  // ou à campanha toda (só o mestre cria). Os "pessoais" são de uma versão
  // anterior: continuam listados à parte, para poderem ser movidos ou apagados.
  function allShortcuts(){
    const out = [];
    const card = rollUI.who ? characters[rollUI.who] : null;
    if(card && card.shortcuts) Object.keys(card.shortcuts).forEach(k => out.push(Object.assign({ scope:'character' }, card.shortcuts[k])));
    Object.keys(campShortcuts).forEach(k => out.push(Object.assign({ scope:'campaign' }, campShortcuts[k])));
    Object.keys(personalShortcuts).forEach(k => out.push(Object.assign({ scope:'personal' }, personalShortcuts[k])));
    return out;
  }
  function scPath(sc){
    if(sc.scope === 'personal') return `user-shortcuts/${currentUser ? currentUser.uid : 'local'}/${sc.id}`;
    if(sc.scope === 'character') return `${scopedKey(KEY_CHARS)}/${rollUI.who}/shortcuts/${sc.id}`;
    return `${scopedKey(KEY_SHORTCUTS)}/${sc.id}`;
  }
  async function saveShortcut(){
    const name = (rollUI.scName || '').trim();
    if(!name){ toast('Dê um nome ao atalho.', true); return; }
    if(!rollUI.terms.length){ toast('Adicione ao menos um dado.', true); return; }
    const scope = (rollUI.scScope === 'campaign' && isMaster()) ? 'campaign' : 'character';
    if(scope === 'character'){
      if(!rollUI.who){
        toast('Selecione primeiro o personagem: o atalho fica salvo só nele.', true);
        const sel = hubBody.querySelector('[data-bind="rollUI.who"]'); if(sel) sel.focus();
        return;
      }
      if(!canEditHolder(holderById(rollUI.who))){ toast('Você não pode editar a ficha desse personagem.', true); return; }
    }
    const sc = { id:DB.newId('user-shortcuts'), name, terms:JSON.parse(JSON.stringify(rollUI.terms)), skill:rollUI.skill || '',
      bonuses:rollUI.bonuses.map(b => ({ label:b.label || '', value:Number(b.value) || 0 })) };
    await DB.set(scPath({ scope, id:sc.id }), sc);
    rollUI.scName = '';
    toast(scope === 'character' ? `Atalho salvo em ${(holderById(rollUI.who) || {}).name}.` : 'Atalho da campanha salvo.');
    renderHub();
  }
  function useShortcut(sc){
    rollUI.terms = sc.terms ? JSON.parse(JSON.stringify(sc.terms)) : countsToTerms(sc.counts);
    rollUI.skill = sc.skill || '';
    rollUI.bonuses = (sc.bonuses || []).map(b => ({ label:b.label, value:b.value }));
    rollUI.physical = false;
    rollUI.modTerm = 0;
  }
  async function moveShortcut(sc){
    if(!rollUI.who){ toast('Selecione um personagem para receber o atalho.', true); return; }
    const copy = Object.assign({}, sc); delete copy.scope;
    await DB.set(scPath({ scope:'character', id:sc.id }), copy);
    await DB.set(scPath(sc), null);
    toast('Atalho movido para ' + (holderById(rollUI.who) || {}).name + '.');
  }

  // ---------- ficha leve ----------
  function ensureCard(tokenId){
    const h = holderById(tokenId);
    const t = tokens.find(x => x.id === tokenId);
    const card = characters[tokenId] || (characters[tokenId] = {});
    if(card.tokenId == null) card.tokenId = tokenId;
    if(card.name == null) card.name = h ? h.name : '';
    if(card.player == null) card.player = (t && t.ownerName) || '';
    if(card.notes == null) card.notes = '';
    if(!card.reminders) card.reminders = [];
    if(!card.skills) card.skills = [];
    if(!card.needs) card.needs = {};
    return card;
  }
  const cardTimers = {};
  function scheduleSaveCard(tokenId){
    const id = tokenId || hub.charToken;
    clearTimeout(cardTimers[id]);
    cardTimers[id] = setTimeout(() => {
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
    if(!pin) return;
    const its = entry.items || [];
    const ex = pinExplore(pin);
    if(its.length) ex.lastLoot = its.slice(0, 3).map(x => x.item.name).join(', ') + (its.length > 3 ? '…' : '');
    if(typeof ex.reserve === 'number'){ ex.reserve = Math.max(0, ex.reserve - its.length); if(ex.reserve === 0) ex.status = 'esgotado'; }
    pin.explore = ex;
    saveKey(KEY_PINS, pins);
  }
  function coordHtml(e){
    if(e.lat == null) return e.coord ? `<div class="result-coord">${ic('pin', 13)} ${escapeHtml(e.coord)}</div>` : `<div class="result-coord">${ic('pin', 13)} sem localização</div>`;
    return `<div class="result-coord">${ic('pin', 13)} Local aproximado: ${escapeHtml(e.coord)}
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
  // ingredientes: só itens fora do equipamento, somando as quantidades das pilhas
  function craftCheck(rec, hid){
    const have = {};
    invItems(hid).filter(i => !i.slot).forEach(i => { (have[i.itemId] = have[i.itemId] || []).push(i); });
    const units = id => (have[id] || []).reduce((a, i) => a + instQty(i), 0);
    const missing = [];
    (rec.ingredients || []).forEach(ing => {
      const n = units(ing.itemId);
      if(n < ing.qty) missing.push({ itemId:ing.itemId, need:ing.qty, have:n });
    });
    // a ferramenta pode estar equipada; não é consumida
    const toolOk = !rec.tool || invItems(hid).some(i => i.itemId === rec.tool);
    return { missing, toolOk, canCraft:!missing.length && toolOk, have };
  }
  async function craftDo(rec, hid, outcome){
    const holder = holderById(hid);
    if(!holder){ toast('Escolha quem fabrica.', true); return; }
    if(!canEditHolder(holder)){ toast('Você não pode usar o inventário de ' + holder.name + '.', true); return; }
    const chk = craftCheck(rec, hid);
    if(!chk.canCraft){ toast('Faltam materiais ou ferramenta.', true); return; }
    const used = [];
    const ops = {};
    let made = [], after = invCount(hid);
    const consume = outcome === 'sucesso' || !!rec.wasteOnFail;
    if(consume){
      (rec.ingredients || []).forEach(ing => {
        let need = ing.qty;
        chk.have[ing.itemId].slice().sort((a, b) => instQty(a) - instQty(b)).forEach(inst => {
          if(need <= 0) return;
          const take = Math.min(instQty(inst), need);
          need -= take;
          used.push(itemRef(inst, take));
          ops[hid + '/' + inst.uid] = takeUnits(inst, take);
        });
      });
      after = simCount(hid, ops);
    }
    if(outcome === 'sucesso'){
      const ref = ITEMS_BY_ID[rec.result.itemId];
      if(!ref){ toast('O item resultante não existe mais no catálogo.', true); return; }
      const qty = Math.max(1, rec.result.qty || 1);
      // empilháveis viram uma pilha; os demais, uma instância por unidade
      const entries = isStackable(ref) ? [{ item:ref, qty, extra:{ source:'craft' } }] : Array.from({ length:qty }, () => ({ item:ref, qty:1, extra:{ source:'craft' } }));
      const p = planAdds(hid, entries, ops);
      if(p.res.some(r => !r.ok)){ toast('Sem espaço no inventário para o resultado.', true); return; }
      made = p.res.map(r => itemRef(r.inst, r.qty)); after = p.after;
    }
    const ok = await commitInv(ops, [mkLog('craft', holder, {
      recipe:rec.name, outcome, used, made, source:'inventario', invAfter:after })]);
    if(ok){ hub.craftMsg = outcome === 'sucesso' ? `Fabricado: ${made.map(m => m.name + (m.qty > 1 ? ' ×' + m.qty : '')).join(', ')}.` : (consume ? 'Falhou: os materiais foram perdidos.' : 'Falhou: nada foi consumido.'); renderHub(); }
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
      ['Botas improvisadas','reparo','Botas improvisadas com panos e fita',[['Retalhos de tecido',2],['Fita adesiva',1]],''],
      ['Torniquete de campo','primeiros-socorros','Torniquete improvisado (cinto)',[['Retalhos de tecido',1],['Galho pontiagudo endurecido no fogo',1]],''],
      ['Tala de bambu','primeiros-socorros','Tala de imobilização',[['Bambu recém-cortado',1],['Retalhos de tecido',1]],''],
      ['Colar cervical de toalha','primeiros-socorros','Colar cervical improvisado',[['Retalhos de tecido',2],['Fita adesiva reforçada (duct tape)',1]],''],
      ['Sutura de campo','primeiros-socorros','Kit de sutura improvisado',[['Agulha hipodérmica',1],['Linha de pesca',1],['Álcool líquido para desinfecção',1]],''],
      ['Bandagem fervida','primeiros-socorros','Bandagem de gaze',[['Retalhos de tecido',2],['Álcool líquido para desinfecção',1]],''],
      ['Tocha de resina','sobrevivencia','Tocha improvisada',[['Bambu recém-cortado',1],['Retalhos de tecido',1],['Resina de árvore em bloco pegajoso',1]],''],
      ['Forninho de lata','sobrevivencia','Forninho improvisado feito de lata',[['Lata vazia',1],['Arame de cerca reaproveitado',1]],'Alicate universal'],
      ['Lamparina de lata','sobrevivencia','Lamparina a óleo',[['Lata vazia',1],['Pavio de algodão para lamparina',1],['Óleo de lamparina',1]],''],
      ['Laço de caça','sobrevivencia','Armadilha caseira de laço',[['Corda de couro cru trançada',1],['Galho pontiagudo endurecido no fogo',1]],''],
      ['Arapuca de bambu','sobrevivencia','Arapuca de bambu montada',[['Bambu recém-cortado',2],['Corda de embira (fibra vegetal)',1]],''],
      ['Rede de dormir de juta','sobrevivencia','Rede de dormir (hammock)',[['Corda de embira (fibra vegetal)',2],['Saco de juta vazio',2]],''],
      ['Corda de couro trançada','sobrevivencia','Corda de couro cru trançada',[['Couro cru',2]],'Faca multiuso (canivete suíço)'],
      ['Corda de bananeira','sobrevivencia','Corda de embira (fibra vegetal)',[['Fibra de bananeira seca',2]],''],
      ['Carvão de forno de barro','sobrevivencia','Carvão',[['Lenha cortada',2]],''],
      ['Camuflagem de folhas','sobrevivencia','Camuflagem improvisada de folhas amarradas',[['Folha larga usada como cobertura improvisada',3],['Barbante grosso',1]],''],
      ['Filtro de carvão e tecido','sobrevivencia','Filtro de água portátil',[['Tubo de PVC',1],['Carvão',2],['Retalhos de tecido',1]],''],
      ['Lança de bambu','sobrevivencia','Taquara afiada na ponta',[['Bambu recém-cortado',1]],'Faca multiuso (canivete suíço)'],
      ['Briquetes caseiros','sobrevivencia','Briquetes de carvão para fogareiro',[['Carvão',2],['Serragem',1]],''],
      ['Escada de tábuas','reparo','Escada de madeira improvisada',[['Tábua de madeira empenada',2],['Prego enferrujado (punhado)',1]],'Martelo comum'],
      ['Tijolo de adobe','reparo','Tijolo de adobe seco ao sol',[['Barro para reboco',2],['Palha de milho seca para artesanato',1]],''],
      ['Toldo de lona','reparo','Toldo leve de emergência',[['Lona plástica para cobertura de rancho',1],['Cordas de varal para secar roupas',1]],''],
      ['Palha para telhado','reparo','Palha trançada para cobertura',[['Palha de milho seca para artesanato',3]],''],
      ['Isca de penas','reparo','Isca artificial',[['Anzol de pesca',1],['Pena de gavião encontrada no chão',1]],''],
      ['Colete de couro cru','reparo','Colete de couro',[['Couro cru',3],['Corda de couro cru trançada',1]],'Faca multiuso (canivete suíço)'],
      ['Gorro de retalhos','reparo','Gorro de lã',[['Retalhos de tecido',2]],'Agulhas de tricô']
    ];
    const path = scopedKey(KEY_RECIPES); let n = 0;
    const have = new Set(Object.keys(recipes).map(k => String(recipes[k].name).toLowerCase()));
    for(const d of defs){
      if(have.has(d[0].toLowerCase())) continue;
      const res = itemByName(d[2]); const ings = d[3].map(x => [itemByName(x[0]), x[1]]);
      const tl = d[4] ? itemByName(d[4]) : null;
      if(!res || ings.some(x => !x[0]) || (d[4] && !tl)) continue;
      const id = DB.newId(path);
      await DB.set(path + '/' + id, { id, name:d[0], family:d[1], result:{ itemId:res.id, qty:1 }, ingredients:ings.map(x => ({ itemId:x[0].id, qty:x[1] })),
        tool:tl ? tl.id : null, station:'', skill:'', time:'', noise:'', risk:'', resolution:'Resolver na mesa (rolagem ou decisão do mestre).', wasteOnFail:false, notes:'Exemplo editável.' });
      n++;
    }
    toast(n ? `${n} receitas de exemplo adicionadas. Edite como quiser.` : (have.size ? 'Os exemplos já estão na lista.' : 'Nenhum exemplo pôde ser montado com este catálogo.'), !n && !have.size);
  }

  // ---------- painel "Mesa de jogo" ----------
  const esc = escapeHtml;
  function hubTabs(){
    const c = cfg().modules;
    const t = [['mundo', ic('map', 14) + ' Mundo'], ['ficha', ic('user', 14) + ' Personagem'], ['grupo', ic('users', 14) + ' Grupo'], ['diario', ic('book', 14) + ' Diário'], ['dados', ic('dice', 14) + ' Dados'], ['sessao', ic('list', 14) + ' Sessão']];
    if(c.crafting) t.push(['oficio', ic('tool', 14) + ' Ofício']);
    t.push(['campanhas', ic('layers', 14) + ' Campanhas']);
    if(isMaster()) t.push(['mestre', ic('lock', 14) + ' Mestre']);
    return t;
  }
  function openHub(tab){
    closeDrawer(); closeNavDrawer(); closeInventory(); hudCloseSheets();
    if(tab) hub.tab = tab;
    if(!hubTabs().some(t => t[0] === hub.tab)) hub.tab = 'mundo';
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
      hl.map(h => opt(h.id, (h.type === 'npc' ? 'NPC · ' : '') + h.name, value)).join('')}</select>`;
  }
  function renderHub(){
    if(!hubBody) return;
    const tabs = hubTabs();
    if(!tabs.some(t => t[0] === hub.tab)) hub.tab = 'dados';
    const ses = activeSession();
    let html = `<div class="hub-context" role="status">${ic('book', 14)} <b>${esc(campaignMeta ? campaignMeta.name : 'Campanha')}</b> · ${esc(ses ? ses.title : 'sem sessão')}${isMaster() ? ' · mestre' : ''}</div>`;
    html += '<div class="hub-tabs" role="tablist">' + tabs.map(t => `<button type="button" role="tab" aria-selected="${hub.tab === t[0]}" class="inv-tab${hub.tab === t[0] ? ' active' : ''}" data-act="tab" data-tab="${t[0]}">${t[1]}</button>`).join('') + '</div>';
    const fn = { dados:renderDados, ficha:renderFicha, sessao:renderSessao, campanhas:renderCampanhas, mundo:renderMundo, oficio:renderOficio, diario:renderDiario, grupo:renderGrupo, mestre:renderMestre }[hub.tab];
    html += fn();
    // se a tela for redesenhada com um campo em foco, devolve o foco e o cursor
    // à mesma posição (senão o texto digitado passa a entrar no começo do campo)
    const ae = document.activeElement;
    const keep = (ae && hubBody.contains(ae) && ae.dataset && ae.dataset.bind) ? { bind:ae.dataset.bind, s:ae.selectionStart, e:ae.selectionEnd } : null;
    hubBody.innerHTML = html;
    if(keep){
      const el = Array.from(hubBody.querySelectorAll('[data-bind]')).find(x => x.dataset.bind === keep.bind);
      if(el){ el.focus(); try{ if(keep.s != null) el.setSelectionRange(keep.s, keep.e); }catch(e){} }
    }
    hubDirty = false;
  }

  // --- dados ---
  function modChips(t, i){
    const chips = [];
    if(t.kh != null) chips.push(['kh', `manter ${t.kh} maior${t.kh > 1 ? 'es' : ''}`]);
    if(t.kl != null) chips.push(['kl', `manter ${t.kl} menor${t.kl > 1 ? 'es' : ''}`]);
    if(t.dh != null) chips.push(['dh', `descartar ${t.dh} maior${t.dh > 1 ? 'es' : ''}`]);
    if(t.dl != null) chips.push(['dl', `descartar ${t.dl} menor${t.dl > 1 ? 'es' : ''}`]);
    if(t.ex) chips.push(['ex', (t.ex.op === '=' && t.ex.val === t.sides) ? 'explode no máximo' : `explode ${t.ex.op} ${t.ex.val}`]);
    if(t.rr) chips.push(['rr', `rerrola 1× ${t.rr.op} ${t.rr.val}`]);
    if(t.sc) chips.push(['sc', `conta sucessos ${t.sc.op} ${t.sc.val}`]);
    return chips.map(c => `<button type="button" class="mod-chip" data-act="mod-del" data-i="${i}" data-k="${c[0]}" aria-label="Remover: ${esc(c[1])}">${esc(c[1])} ✕</button>`).join('');
  }
  function trayHtml(){
    if(!rollUI.terms.length) return '<div class="inv-empty">Toque nos dados acima (ou escreva uma expressão) para montar a rolagem.</div>';
    return rollUI.terms.map((t, i) => {
      const max = 12, shown = Math.min(t.n, max), name = t.sides === 'F' ? 'dF' : 'd' + t.sides;
      return `<div class="tray-term"><div class="tray-dice">${Array.from({ length:shown }, () => dieSvg(t.sides, name, '', name)).join('')}${t.n > max ? `<span class="tray-more">+${t.n - max}</span>` : ''}</div>
        <div class="tray-meta"><b>${esc(termDefLabel(t))}</b>${modChips(t, i)}
        <button type="button" class="mod-chip" data-act="term-del" data-i="${i}" aria-label="Remover ${esc(termDefLabel(t))}">remover ✕</button></div></div>`;
    }).join('');
  }
  function resultHtml(r){
    if(!r) return '';
    const body = r.terms ? r.terms.map(t => `<div class="res-term"><div class="res-label">${esc(t.label)}</div>
      <div class="res-dice">${t.dice.map(d => {
        const txt = t.sides === 'F' ? (d.v > 0 ? '+' : d.v < 0 ? '−' : '0') : String(d.v);
        const cls = [d.drop ? 'dropped' : '', d.x ? 'exploded' : '', d.was != null ? 'rerolled' : '', d.s ? 'succ' : ''].filter(Boolean).join(' ');
        const lbl = `${t.sides === 'F' ? 'dF' : 'd' + t.sides}: ${d.v}${d.drop ? ' (descartado)' : ''}${d.x ? ' (explosão)' : ''}${d.was != null ? ' (rerrolado de ' + d.was + ')' : ''}${d.s ? ' (sucesso)' : ''}`;
        return dieSvg(t.sides, txt, cls, lbl);
      }).join('')}</div><div class="res-sub">${t.succ ? t.value + ' sucesso(s)' : '= ' + t.value}</div></div>`).join('') : `<div class="res-sub">${esc(fmtRoll(r))}</div>`;
    return `<div class="roll-result" aria-live="polite">
      <div class="roll-total">${r.total}</div>
      <div class="roll-detail"><b>${esc(r.whoName || '')}</b>${r.skill ? ' — ' + esc(r.skill) : ''}
        <div class="res-terms">${body}</div>
        ${r.bonuses.length ? '<div class="res-sub">Bônus: ' + esc(fmtBonuses(r.bonuses)) + ' = ' + (r.bonusSum >= 0 ? '+' : '−') + Math.abs(r.bonusSum) + '</div>' : ''}
        ${r.note ? '<div class="res-sub"><i>' + esc(r.note) + '</i></div>' : ''}${r.physical ? '<div class="res-sub"><small>dados físicos informados</small></div>' : ''}</div>
      <button type="button" class="inv-mini-btn" data-act="roll-copy">Copiar</button></div>`;
  }
  function scRow(sc){
    return `<div class="sc-row"><span class="sc-name" dir="ltr">${esc(sc.name)}</span>
      <button type="button" class="inv-mini-btn" data-act="sc-use" data-id="${esc(sc.id)}" data-scope="${sc.scope}">Usar</button>
      <button type="button" class="inv-mini-btn primary" data-act="sc-roll" data-id="${esc(sc.id)}" data-scope="${sc.scope}">Rolar</button>
      ${sc.scope === 'personal' && rollUI.who ? `<button type="button" class="inv-mini-btn" data-act="sc-move" data-id="${esc(sc.id)}" data-scope="personal">Mover p/ personagem</button>` : ''}
      <button type="button" class="inv-mini-btn danger" data-act="sc-del" data-id="${esc(sc.id)}" data-scope="${sc.scope}" aria-label="Excluir atalho ${esc(sc.name)}">✕</button></div>`;
  }
  function renderDados(){
    const who = holderById(rollUI.who) ? rollUI.who : '';
    rollUI.who = who;
    const whoName = who ? holderById(who).name : '';
    if((rollUI.modTerm | 0) >= rollUI.terms.length) rollUI.modTerm = 0;
    const pad = PAD_DICE.map(s => {
      const n = padCount(s), name = s === 'F' ? 'dF' : 'd' + s;
      return `<div class="pad-cell"><button type="button" class="pad-die${n ? ' has-count' : ''}" data-act="die+" data-s="${s}" aria-label="Adicionar um ${name} (agora ${n})">${dieSvg(s, name, '', name)}${n ? `<span class="pad-count">${n}</span>` : ''}</button>
        <button type="button" class="die-btn" data-act="die-" data-s="${s}" aria-label="Remover um ${name}" ${n ? '' : 'disabled'}>−</button></div>`;
    }).join('');
    const bon = rollUI.bonuses.map((b, i) => `<div class="bonus-row">
      <input type="text" data-bind="rollUI.bonuses.${i}.label" value="${esc(b.label)}" placeholder="Rótulo (item, condição, efeito...)" aria-label="Rótulo do bônus">
      <input type="number" data-bind="rollUI.bonuses.${i}.value" data-num value="${esc(b.value)}" aria-label="Valor do bônus">
      <button type="button" class="inv-mini-btn danger" data-act="bonus-del" data-i="${i}" aria-label="Remover bônus">✕</button></div>`).join('');
    const mine = allShortcuts();
    const grp = (title, arr) => arr.length ? `<div class="hub-label">${title}</div>${arr.map(scRow).join('')}` : '';
    const scs = grp(whoName ? 'De ' + esc(whoName) : '', mine.filter(s => s.scope === 'character'))
      + grp('Da campanha', mine.filter(s => s.scope === 'campaign'))
      + grp('Antigos (sem personagem)', mine.filter(s => s.scope === 'personal'));
    const hist = Object.keys(rolls).map(k => rolls[k]).sort((a, b) => (b.ts || 0) - (a.ts || 0)).slice(0, 30).map(r =>
      `<div class="log-row"><div class="log-meta"><span>${esc(fmtTs(r.ts))}</span><span>por ${esc(r.actorName || '?')}</span></div><div>${esc(rollText(r))}</div></div>`).join('');
    const modOpts = [['kh', 'Manter os maiores (kh)'], ['kl', 'Manter os menores (kl)'], ['dh', 'Descartar os maiores (dh)'], ['dl', 'Descartar os menores (dl)'], ['ex', 'Explodir (!)'], ['rr', 'Rerrolar 1× até N (r)'], ['sc', 'Contar sucessos ≥ N']];
    return `<div class="hub-sec">
      <label class="hub-label">Personagem</label>${holderSelect('rollUI.who', who, true)}
      <div class="hub-label">Dados (toque para adicionar)</div><div class="dice-pad">${pad}</div>
      <div class="hub-label">Na mesa</div><div class="tray">${trayHtml()}</div>
      ${rollUI.terms.length ? `<div class="mod-row">
        <select data-bind="rollUI.modTerm" data-num aria-label="Grupo de dados">${rollUI.terms.map((t, i) => opt(i, termDefLabel(t), rollUI.modTerm)).join('')}</select>
        <select data-bind="rollUI.modType" aria-label="Modificador">${modOpts.map(m => opt(m[0], m[1], rollUI.modType)).join('')}</select>
        <input type="number" min="1" data-bind="rollUI.modVal" data-num value="${esc(rollUI.modVal)}" placeholder="N" aria-label="Valor N do modificador">
        <button type="button" class="inv-mini-btn" data-act="mod-add">Aplicar</button></div>` : ''}
      <div class="expr-row"><input type="text" data-bind="rollUI.expr" dir="ltr" autocomplete="off" spellcheck="false" value="${esc(rollUI.expr)}" placeholder="Ou escreva: 4d6kh3+2" aria-label="Expressão de dados">
        <button type="button" class="inv-mini-btn" data-act="expr-apply">Aplicar</button></div>
      <div class="inv-item-actions"><button type="button" class="inv-mini-btn" data-act="preset-adv">Vantagem</button><button type="button" class="inv-mini-btn" data-act="preset-dis">Desvantagem</button><button type="button" class="inv-mini-btn" data-act="roll-clear">Limpar</button></div>
      <p class="hub-hint">Aceito: <b>kh</b>/<b>kl</b> manter maiores/menores · <b>dh</b>/<b>dl</b> descartar · <b>!</b> explode (<b>!&gt;=5</b>) · <b>r1</b> rerrola 1× · <b>&gt;=8</b> conta sucessos · <b>adv</b>/<b>dis</b> · <b>dF</b> · <b>d%</b>. Ex.: 4d6dl1, 5d10!&gt;=9, 10d10&gt;=8.</p>
      <label class="hub-label">Perícia / ação (texto livre)</label>
      <input type="text" data-bind="rollUI.skill" value="${esc(rollUI.skill)}" placeholder="Qualquer perícia, atributo ou ação" maxlength="60">
      <div class="hub-label">Bônus</div>${bon}
      <button type="button" class="inv-mini-btn" data-act="bonus-add">＋ Bônus</button>
      <label class="check-row"><input type="checkbox" data-bind="rollUI.physical" data-rerender ${rollUI.physical ? 'checked' : ''}> Usei dados físicos (digitar resultados)</label>
      ${rollUI.physical ? `<input type="text" data-bind="rollUI.phys" value="${esc(rollUI.phys)}" placeholder="Resultados na ordem, ex.: 14 3 5 (explosões vêm logo depois do dado)" aria-label="Resultados dos dados físicos">` : ''}
      <input type="text" data-bind="rollUI.note" value="${esc(rollUI.note)}" placeholder="Observação (opcional)" maxlength="140">
      <label class="check-row"><input type="checkbox" data-bind="rollUI.record" ${rollUI.record ? 'checked' : ''}> Registrar no histórico da campanha</label>
      <label class="check-row"><input type="checkbox" data-bind="rollUI.important" ${rollUI.important ? 'checked' : ''}> Marcar como relevante (aparece na linha do tempo do diário)</label>
      <label class="check-row"><input type="checkbox" data-bind="rollUI.discord" ${rollUI.discord ? 'checked' : ''}> Enviar esta rolagem ao Discord (webhook do painel de Saque)</label>
      <button type="button" class="inv-mini-btn primary roll-go" data-act="roll">${rollUI.physical ? 'Registrar resultado' : 'Rolar'}</button>
      <p class="hub-hint">O site só mostra dados, bônus e total. Sucesso, dificuldade e consequência ficam com a mesa.</p>
      ${resultHtml(rollUI.last)}
    </div>
    <div class="hub-sec"><div class="hub-label">Atalhos</div>${scs || '<div class="inv-empty">Nenhum atalho' + (whoName ? ' de ' + esc(whoName) : '') + ' ainda.</div>'}
      <div class="sc-save">
        <input type="text" class="sc-name-input" dir="ltr" autocomplete="off" autocapitalize="sentences" spellcheck="false" maxlength="40" data-bind="rollUI.scName" value="${esc(rollUI.scName)}" placeholder="Nome do atalho (ex.: Furtividade +3)" aria-label="Nome do atalho">
        ${isMaster() ? `<select data-bind="rollUI.scScope" aria-label="Onde salvar">${opt('character', 'Salvar neste personagem', rollUI.scScope)}${opt('campaign', 'Salvar para a campanha toda', rollUI.scScope)}</select>` : ''}
        <button type="button" class="inv-mini-btn primary" data-act="sc-save">Salvar atual</button>
      </div>
      <p class="hub-hint">${who && rollUI.scScope !== 'campaign' ? `O atalho fica salvo só em <b>${esc(whoName)}</b> e só aparece quando ele está selecionado.` : (rollUI.scScope === 'campaign' && isMaster() ? 'Atalhos da campanha aparecem para todos.' : 'Escolha um personagem acima: o atalho fica salvo só nele.')}</p></div>
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
    const ordem = card.systemId === 'ordem';
    if(ordem){
      // ficha nova (Ordem Paranormal); os campos antigos (anotações, lembretes, necessidades, atalhos) continuam existindo
      html += renderFichaOrdem(h, card, dis);
      if(cm.identity) html += renderReminders(card, dis);
    } else {
      html += opBanner(card, edit);
      if(cm.identity){
        html += `<div class="hub-label">Identidade</div>
          <input type="text" data-bind="card.name" value="${esc(card.name)}" placeholder="Nome do personagem" ${dis}>
          <input type="text" data-bind="card.player" value="${esc(card.player)}" placeholder="Jogador" ${dis}>
          ${renderReminders(card, dis)}`;
      }
      if(cm.skills){
        html += `<div class="hub-label">Perícias e bônus salvos</div>
          ${(card.skills || []).map((s, i) => `<div class="bonus-row"><input type="text" data-bind="card.skills.${i}.name" value="${esc(s.name)}" placeholder="Perícia" ${dis}>
            <input type="number" data-bind="card.skills.${i}.bonus" data-num value="${esc(s.bonus)}" aria-label="Bônus" ${dis}>
            <button type="button" class="inv-mini-btn primary" data-act="skill-use" data-i="${i}" aria-label="Levar para os dados">${ic('dice', 18)}</button>
            <button type="button" class="inv-mini-btn danger" data-act="skill-del" data-i="${i}" ${dis} aria-label="Remover perícia">${ic('close', 16)}</button></div>`).join('')}
          <button type="button" class="inv-mini-btn" data-act="skill-add" ${dis}>${ic('plus', 16)} Perícia</button>`;
      }
    }
    if(cm.notes) html += `<div class="hub-label">Anotações</div><textarea data-bind="card.notes" rows="4" ${dis}>${esc(card.notes)}</textarea>`;
    if(!ordem) html += renderFichaExtras(h, card, dis);
    if(cm.equip){
      const eq = equippedItems(h.id);
      html += `<div class="hub-label">Equipamento</div>${eq.length ? '<ul class="craft-ing">' + eq.map(i => `<li>${esc(slotLabel(i.slot))}: ${esc(i.name)}${i.cond != null ? ' · ' + esc(COND_LEVELS[i.cond]) : ''}</li>`).join('') + '</ul>' : '<p class="hub-hint">Nada equipado.</p>'}
        <p class="hub-hint">Inventário ${esc(capTxt(h.id))}</p><button type="button" class="inv-mini-btn" data-act="open-inv" data-id="${esc(h.id)}">${ic('bag', 16)} Abrir inventário</button>`;
    }
    if(mods.needs){
      const w = WEATHER_STATES[weather.state] || WEATHER_STATES.calmo;
      html += `<div class="hub-label">Necessidades (registro; o mestre decide os efeitos)</div><p class="hub-hint">${ic(w.icon, 14)} Clima agora: <b>${esc(w.label)}</b>. ${esc(w.desc)}${w.eff.length ? ' Efeitos: ' + esc(w.eff.join('; ')) + '.' : ''}</p>` + NEED_LIST.map(n => {
        const v = (card.needs && card.needs[n[0]]) || 0;
        return `<div class="need-row"><span>${n[1]}</span><button type="button" class="die-btn" data-act="need" data-n="${n[0]}" data-d="-1" ${dis} aria-label="Reduzir ${n[1]}">−</button><b class="need-v">${NEED_LEVELS[v]}</b><button type="button" class="die-btn" data-act="need" data-n="${n[0]}" data-d="1" ${dis} aria-label="Aumentar ${n[1]}">+</button></div>`;
      }).join('');
    }
    if(ordem && edit) html += `<div class="hub-label">Formato da ficha</div><button type="button" class="inv-mini-btn" data-act="op-revert">Voltar ao formato antigo</button><p class="hub-hint">Os dados antigos (perícias e recursos) foram guardados na migração e voltam como estavam.</p>`;
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
      <div class="inv-item-util">${esc(m.system || 'sem sistema definido')}${m.masterName ? ' · mestre: ' + esc(m.masterName) : ''}${isMasterOf(m) ? (m.joinCode ? '<br>Código de convite: <b>' + esc(m.joinCode) + '</b>' : '<br>Sem código de convite ainda.') : ''}</div>
      <div class="inv-item-actions">${isMasterOf(m) ? (m.joinCode ? `<button type="button" class="inv-mini-btn" data-act="camp-code-copy" data-id="${esc(m.id)}">Copiar código</button><button type="button" class="inv-mini-btn" data-act="camp-code-new" data-id="${esc(m.id)}">Trocar código</button>` : `<button type="button" class="inv-mini-btn primary" data-act="camp-code-gen" data-id="${esc(m.id)}">Gerar código</button>`) : ''}${m.id !== activeCampaignId ? `<button type="button" class="inv-mini-btn primary" data-act="camp-open" data-id="${esc(m.id)}">Abrir</button>` : ''}
      ${isMasterOf(m) && m.id !== 'legacy' ? (m.archived ? `<button type="button" class="inv-mini-btn" data-act="camp-reopen" data-id="${esc(m.id)}">Reabrir</button>` : (m.id !== activeCampaignId ? `<button type="button" class="inv-mini-btn" data-act="camp-archive" data-id="${esc(m.id)}">Arquivar</button>` : '')) : ''}
      ${isMasterOf(m) && m.id !== 'legacy' ? `<button type="button" class="inv-mini-btn danger" data-act="camp-delete" data-id="${esc(m.id)}">Excluir</button>` : ''}</div></div>`;
    const nc = hub.newCampaign;
    if(!hub.cfgDraft){
      const c = cfg();
      hub.cfgDraft = { name:campaignMeta ? campaignMeta.name : '', system:campaignMeta ? campaignMeta.system || '' : '', invMode:c.invMode, invLimit:c.invLimit, decimals:c.decimals, lootMin:c.lootMin, lootMax:c.lootMax,
        weights:Object.assign({}, c.weights), espMode:c.espMode, modules:Object.assign({}, c.modules), cardModules:Object.assign({}, c.cardModules), progressionMode:c.progressionMode,
        placeCats:Object.assign({}, c.places.cats), placeReveal:c.places.reveal };
    }
    const d = hub.cfgDraft;
    const cats = Array.from(new Set(ITEMS.map(i => i.category))).sort();
    const modLabels = { card:'Ficha leve', clock:'Relógio da campanha', needs:'Necessidades (registro)', explore:'Exploração dos locais', crafting:'Ofício (crafting)', places:'Lugares reais no mapa (OpenStreetMap)' };
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
    <div class="hub-sec"><div class="hub-label" id="cfg-anchor">Configuração desta campanha</div>
      <input type="text" data-bind="cd.name" value="${esc(d.name)}" placeholder="Nome" maxlength="60">
      <input type="text" data-bind="cd.system" value="${esc(d.system)}" placeholder="Sistema / perfil" maxlength="80">
      <div class="hub-label">Sistema: Ordem Paranormal (fixo)</div>
      <select data-bind="cd.progressionMode" aria-label="Progressão do personagem">${opt('nex_level', 'Progressão: NEX + Nível', d.progressionMode)}${opt('nex_only', 'Progressão: só NEX', d.progressionMode)}</select>
      <p class="hub-hint">NEX vai de 5% a 99%, de 5 em 5. O segundo recurso é o PD (Pontos de Determinação). Escolha uma vez; trocar depois não apaga nada.</p>
      <div class="hub-label">Módulos</div>
      ${Object.keys(modLabels).map(k => `<label class="check-row"><input type="checkbox" data-bind="cd.modules.${k}"${k === 'places' ? ' data-rerender' : ''} ${d.modules[k] ? 'checked' : ''}> ${modLabels[k]}</label>`).join('')}
      ${d.modules.places ? `<div class="hub-label">Lugares reais: categorias</div>
        ${PLACE_CATS.map(pc => `<label class="check-row"><input type="checkbox" data-bind="cd.placeCats.${pc.id}" ${d.placeCats[pc.id] === false ? '' : 'checked'}> ${esc(pc.label)}</label>`).join('')}
        <label class="hub-label" for="cd-place-reveal">Quando aparecem</label>
        <select id="cd-place-reveal" data-bind="cd.placeReveal">${opt('all', 'Sempre (a partir do zoom de cidade)', d.placeReveal)}${opt('near', 'Só perto de um token (' + PLACE_NEAR_M + ' m)', d.placeReveal)}</select>
        <p class="hub-hint">Hotéis, farmácias, postos e outros lugares reais viram pontos de saque. O primeiro Vasculhar cria o pin, e o resultado vale para toda a mesa.</p>
        <button type="button" class="inv-mini-btn" data-act="pl-test">Testar conexão com o OpenStreetMap</button>
        <div id="pl-test-out" class="hub-hint pl-test-out" role="status" aria-live="polite"></div>` : ''}
      <div class="hub-label">Partes da ficha</div>
      ${[['identity','Identidade'],['skills','Perícias e atalhos'],['notes','Anotações'],['equip','Equipamento']].map(x => `<label class="check-row"><input type="checkbox" data-bind="cd.cardModules.${x[0]}" ${d.cardModules[x[0]] ? 'checked' : ''}> ${x[1]}</label>`).join('')}
      <div class="hub-label">Inventário</div>
      <select data-bind="cd.invMode" data-rerender>${opt('slots', 'Limite de itens', d.invMode)}${opt('carga', 'Carga por peso (faixas)', d.invMode)}${opt('livre', 'Lista livre, sem limite', d.invMode)}</select>
      ${d.invMode !== 'livre' ? `<label class="hub-label">${d.invMode === 'slots' ? 'Máximo de itens' : 'Capacidade de carga'}</label><input type="number" min="1" data-bind="cd.invLimit" value="${esc(d.invLimit)}">` : ''}
      ${d.invMode === 'carga' ? `<label class="check-row"><input type="checkbox" data-bind="cd.espMode" data-rerender ${d.espMode ? 'checked' : ''}> Usar o volume de cada item (0 a 4, da ficha do catálogo) em vez do peso por categoria</label>` + (d.espMode ? '<p class="hub-hint">Volume 0 conta 0,25; 1 conta 1; 2 conta 2; 3 conta 3; 4 conta 4. Ajuste a capacidade de carga acima (padrão 20).</p>' : '<div class="hub-label">Peso por categoria (padrão 1)</div>' + cats.map(c => `<div class="bonus-row"><span class="w-cat">${esc(c)}</span><input type="number" step="0.1" min="0" data-bind="cd.weights.${esc(catKey(c))}" value="${esc(d.weights[catKey(c)] != null ? d.weights[catKey(c)] : 1)}"></div>`).join('')) : ''}
      <div class="hub-label">Itens por busca de saque (mínimo e máximo, 0 a 8)</div>
      <div class="expr-row"><input type="number" min="0" max="8" data-bind="cd.lootMin" value="${esc(d.lootMin)}" aria-label="Mínimo de itens por saque"><input type="number" min="1" max="8" data-bind="cd.lootMax" value="${esc(d.lootMax)}" aria-label="Máximo de itens por saque"></div>
      <label class="hub-label">Casas decimais das coordenadas do saque (0 a 6)</label><input type="number" min="0" max="6" data-bind="cd.decimals" value="${esc(d.decimals)}">
      <button type="button" class="inv-mini-btn primary" data-act="cfg-save">Salvar configuração</button></div>` : '<p class="hub-hint">Só o mestre cria campanhas e altera a configuração.</p>'}`;
  }

  // --- mundo ---
  function renderMundo(){
    const mods = cfg().modules, master = isMaster();
    let html = weatherBox();
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
    return html + `<div class="hub-sec"><button type="button" class="inv-mini-btn primary" data-act="close-hub">${ic('map', 14)} Voltar ao mapa</button></div>`;
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
        const ing = (r.ingredients || []).map(i => { const miss = chk.missing.find(m => m.itemId === i.itemId); return `<li class="${miss ? 'bad' : 'good'}">${ic(miss ? 'close' : 'check', 13)} ${i.qty}× ${iconHtml(ITEMS_BY_ID[i.itemId])}${esc(nm(i.itemId))}${miss ? ` (tem ${miss.have})` : ''}</li>`; }).join('');
        return `<div class="inv-item"><div class="inv-item-name">${esc(r.name)}</div>
          <div class="inv-item-util">Resultado: ${r.result.qty}× ${iconHtml(ITEMS_BY_ID[r.result.itemId])}${esc(nm(r.result.itemId))}</div><ul class="craft-ing">${ing}${r.tool ? `<li class="${chk.toolOk ? 'good' : 'bad'}">${ic(chk.toolOk ? 'check' : 'close', 13)} Ferramenta: ${esc(nm(r.tool))}</li>` : ''}</ul>
          <div class="inv-item-util">${[r.station && 'Estação: ' + r.station, r.skill && 'Perícia: ' + r.skill, r.time && 'Tempo: ' + r.time, r.noise && 'Ruído: ' + r.noise, r.risk && 'Risco: ' + r.risk].filter(Boolean).map(esc).join(' · ')}</div>
          ${r.resolution ? `<div class="inv-item-util"><i>${esc(r.resolution)}</i></div>` : ''}
          <div class="inv-item-actions"><button type="button" class="inv-mini-btn primary" data-act="craft" data-id="${esc(r.id)}" data-o="sucesso" ${chk.canCraft ? '' : 'disabled'}>Deu certo</button>
          <button type="button" class="inv-mini-btn danger" data-act="craft" data-id="${esc(r.id)}" data-o="falha" ${chk.canCraft ? '' : 'disabled'}>Deu errado${r.wasteOnFail ? ' (perde materiais)' : ''}</button>
          <button type="button" class="inv-mini-btn" data-act="craft-roll" data-id="${esc(r.id)}">${ic('dice', 14)} Rolar</button>
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

  // ---------- diário, grupo, mundo e área do mestre ----------
  const DJ_TYPES = [['resumo','Resumo'],['pista','Pista'],['decisao','Decisão'],['objetivo','Objetivo'],['nota','Nota'],['evento','Evento']];
  const OBJ_STATES = [['aberto','Aberto'],['cumprido','Cumprido'],['falhou','Falhou']];
  const TIMELINE_ACTIONS = new Set(['vasculhar','pegar','depositar','troca','craft','inv_removido','reparar','ajuste']);
  function syncGm(){
    if(gmOff){ gmOff(); gmOff = null; }
    gmJournal = {};
    if(isMaster() && (!firebaseReady || currentUser)) gmOff = DB.on(scopedKey(KEY_GMJ), v => { gmJournal = v || {}; hubChanged(); hudFeedChanged(); }, 300);
    if(tacGmOff){ tacGmOff(); tacGmOff = null; }
    gmTac = {};
    if(isMaster() && (!firebaseReady || currentUser)) tacGmOff = DB.on(scopedKey(KEY_GMTAC), v => { gmTac = v || {}; tacChanged(); });
  }
  async function addJournal(e){
    const gm = e.vis === 'mestre';
    if(gm && !isMaster()){ toast('Só o mestre escreve no diário privado.', true); return false; }
    const path = scopedKey(gm ? KEY_GMJ : KEY_JOURNAL), id = DB.newId(path), a = actorFields();
    const rec = JSON.parse(JSON.stringify(Object.assign({ id, author:a.actorName, authorId:a.actorId, sessionId:(campaignMeta && campaignMeta.activeSessionId) || null, vis:gm ? 'mestre' : 'grupo' }, e)));
    rec.ts = DB.ts();
    const ok = await DB.set(path + '/' + id, rec);
    if(!ok) toast('Não foi possível salvar no diário (as regras do Firebase talvez ainda não liberem este caminho).', true);
    return ok;
  }
  // acontecimento automático do mestre (clima, sessão...) para a linha do tempo
  function logEvent(text, kind, extra){ if(isMaster()) addJournal(Object.assign({ type:'evento', text, auto:true, vis:'grupo' }, kind ? { evKind:kind } : {}, extra || {})); }
  function canEditEntry(e){ return isMaster() || (!!currentUser && e.authorId === currentUser.uid) || (!firebaseReady); }
  async function removeJournal(e){
    if(!canEditEntry(e)){ toast('Só o autor ou o mestre apaga.', true); return; }
    if(!window.confirm('Apagar esta entrada do diário?')) return;
    await DB.set(scopedKey(e.vis === 'mestre' ? KEY_GMJ : KEY_JOURNAL) + '/' + e.id, null);
  }
  function journalAll(){
    const pub = Object.keys(journal).map(k => journal[k]).filter(Boolean);
    const gm = isMaster() ? Object.keys(gmJournal).map(k => gmJournal[k]).filter(Boolean) : [];
    return pub.concat(gm).sort((a, b) => (b.ts || 0) - (a.ts || 0));
  }
  function timelineItems(){
    const out = [];
    journalAll().forEach(e => out.push({ ts:e.ts || 0, tag:(DJ_TYPES.find(t => t[0] === e.type) || ['', e.type])[1], priv:e.vis === 'mestre', html:`<b>${esc(e.title || '')}</b> ${esc(e.text || '')}`.trim(), by:e.author }));
    Object.keys(sessions).map(k => sessions[k]).forEach(s => out.push({ ts:s.createdAt || 0, tag:'Sessão', html:`<b>${esc(s.title)}</b> aberta${s.date ? ' (' + esc(s.date) + ')' : ''}` }));
    lootLog.filter(e => TIMELINE_ACTIONS.has(e.action)).forEach(e => out.push({ ts:e.ts || 0, tag:ACTION_LABELS[e.action] || e.action, html:logText(e), by:e.actorName }));
    Object.keys(rolls).map(k => rolls[k]).filter(r => r && r.important).forEach(r => out.push({ ts:r.ts || 0, tag:'Rolagem', html:esc(rollText(r)), by:r.actorName }));
    return out.sort((a, b) => b.ts - a.ts).slice(0, 80);
  }
  function renderDiario(){
    const f = hub.jf, master = isMaster();
    const list = journalAll().filter(e => !hub.djFilter || e.type === hub.djFilter);
    const row = e => {
      const t = (DJ_TYPES.find(x => x[0] === e.type) || ['', e.type])[1];
      return `<div class="log-row"><div class="log-meta"><span class="log-badge ${e.vis === 'mestre' ? 'ajuste' : 'saque'}">${esc(t)}${e.vis === 'mestre' ? ' · privado' : ''}</span><span>${esc(fmtTs(e.ts))}</span><span>por ${esc(e.author || '?')}</span></div>
        ${e.title ? `<b>${esc(e.title)}</b>` : ''}<div>${esc(e.text || '').replace(/\n/g, '<br>')}</div>
        ${e.type === 'objetivo' ? `<div class="inv-item-actions">${OBJ_STATES.map(s => `<button type="button" class="inv-mini-btn ${(e.status || 'aberto') === s[0] ? 'primary' : ''}" data-act="obj-set" data-id="${esc(e.id)}" data-vis="${e.vis}" data-s="${s[0]}" ${canEditEntry(e) ? '' : 'disabled'}>${s[1]}</button>`).join('')}</div>` : ''}
        ${canEditEntry(e) && !e.auto ? `<div class="inv-item-actions"><button type="button" class="inv-mini-btn danger" data-act="dj-del" data-id="${esc(e.id)}" data-vis="${e.vis}">Apagar</button></div>` : ''}</div>`;
    };
    const tl = hub.djTimeline ? timelineItems() : [];
    return `<div class="hub-sec"><div class="hub-label">Nova entrada</div>
      <select data-bind="jf.type" data-rerender>${DJ_TYPES.filter(t => t[0] !== 'evento').map(t => opt(t[0], t[1], f.type)).join('')}</select>
      <input type="text" data-bind="jf.title" value="${esc(f.title)}" placeholder="Título (opcional)" maxlength="80">
      <textarea data-bind="jf.text" rows="4" placeholder="${f.type === 'objetivo' ? 'O que o grupo quer ou precisa fazer' : 'Escreva o que importa para a continuidade'}">${esc(f.text)}</textarea>
      ${master ? `<select data-bind="jf.vis"><option value="grupo" ${f.vis === 'grupo' ? 'selected' : ''}>Público (todo o grupo vê)</option><option value="mestre" ${f.vis === 'mestre' ? 'selected' : ''}>Privado do mestre</option></select>` : '<p class="hub-hint">Entradas aparecem para todo o grupo.</p>'}
      <button type="button" class="inv-mini-btn primary" data-act="dj-add">Salvar no diário</button></div>
    <div class="hub-sec"><div class="hub-label">Registros</div>
      <select data-bind="hub.djFilter" data-rerender>${opt('', 'Todos os tipos', hub.djFilter)}${DJ_TYPES.map(t => opt(t[0], t[1], hub.djFilter)).join('')}</select>
      <label class="check-row"><input type="checkbox" data-bind="hub.djTimeline" data-rerender ${hub.djTimeline ? 'checked' : ''}> Mostrar linha do tempo (inclui saques, trocas, fabricações e eventos)</label>
      ${hub.djTimeline ? (tl.map(t => `<div class="log-row"><div class="log-meta"><span class="log-badge ${t.priv ? 'ajuste' : 'saque'}">${esc(t.tag)}${t.priv ? ' · privado' : ''}</span><span>${esc(fmtTs(t.ts))}</span>${t.by ? `<span>por ${esc(t.by)}</span>` : ''}</div><div>${t.html}</div></div>`).join('') || '<div class="inv-empty">Nada na linha do tempo ainda.</div>')
        : (list.map(row).join('') || '<div class="inv-empty">Nenhuma entrada ainda.</div>')}</div>`;
  }
  function renderGrupo(){
    const s = activeSession(), members = (campaignMeta && campaignMeta.members) || {};
    const toks = holderList().filter(h => h.type === 'token');
    const res = cfg().resources;
    const chars = toks.map(h => {
      const c = characters[h.id] || {}, t = tokens.find(x => x.id === h.id) || {}, eq = equippedItems(h.id);
      return `<div class="inv-item"><div class="inv-item-name">${esc(c.name || h.name)}</div>
        <div class="inv-item-util">${t.ownerName ? 'Jogador: ' + esc(t.ownerName) + ' · ' : ''}Inventário ${esc(capTxt(h.id))}</div>
        ${c.systemId === 'ordem' ? `<div class="inv-item-util">NEX ${esc(String(c.nex == null ? 5 : c.nex))}% · PV <b>${opRes(c, 'pv').cur}/${opRes(c, 'pv').max}</b> · PD <b>${opRes(c, 'pd').cur}/${opRes(c, 'pd').max}</b>${(c.conditions || []).length ? '<br>Condições: ' + c.conditions.map(x => esc(opCondName(x))).join(', ') : ''}</div>`
          : (res.length ? `<div class="inv-item-util">${res.map(r => `${esc(r.label)} <b>${resVal(c, r)}${r.max ? '/' + r.max : ''}</b>`).join(' · ')}</div>` : '')}
        ${eq.length ? `<div class="inv-item-util">Equipado: ${eq.map(i => esc(i.name) + (i.cond != null ? ' (' + COND_LEVELS[i.cond] + ')' : '')).join(', ')}</div>` : ''}
        <div class="inv-item-actions"><button type="button" class="inv-mini-btn" data-act="grp-sheet" data-id="${esc(h.id)}">Ficha</button><button type="button" class="inv-mini-btn" data-act="open-inv" data-id="${esc(h.id)}">Inventário</button></div></div>`;
    }).join('');
    return `<div class="hub-sec"><div class="hub-label">Sessão</div>${s ? `<div class="inv-item-util"><b>${esc(s.title)}</b> · ${esc(s.date || '')} · ${s.closed ? 'encerrada' : 'em andamento'}<br>Presentes: ${esc((s.present || []).join(', ') || '—')}</div>` : '<div class="inv-empty">Sem sessão ativa.</div>'}
      ${s && s.summary ? `<div class="hub-label">Resumo da última sessão</div><div class="inv-item-util">${esc(s.summary).replace(/\n/g, '<br>')}</div>` : ''}</div>
    <div class="hub-sec"><div class="hub-label">Participantes</div>${Object.keys(members).map(u => `<div class="inv-item-util">${esc(members[u].name || u)} · ${members[u].role === 'master' ? 'mestre' : 'jogador'}</div>`).join('') || '<div class="inv-item-util">Sem lista de participantes (campanha original, aberta a todos).</div>'}</div>
    <div class="hub-sec"><div class="hub-label">Personagens</div>${chars || '<div class="inv-empty">Nenhum token no mapa.</div>'}
      <p class="hub-hint">Jogadores conectados e recursos compartilhados do grupo dependem de caminhos novos no Firebase e ainda não existem.</p></div>`;
  }
  function resVal(card, r){ const v = card && card.res && card.res[r.key]; return typeof v === 'number' ? v : (r.max || 0); }
  function weatherBox(){
    const w = WEATHER_STATES[weather.state] || WEATHER_STATES.calmo;
    return `<div class="hub-sec"><div class="hub-label">Clima</div><div class="inv-item-util">${ic(w.icon, 16)} <b>${esc(w.label)}</b> — ${esc(w.desc)}${w.eff.length ? '<ul class="craft-ing wx-eff">' + w.eff.map(x => '<li>' + esc(x) + '</li>').join('') + '</ul>' : ''}${weather.updatedBy ? '<br>Definido por ' + esc(weather.updatedBy) : ''}</div>
      <button type="button" class="inv-mini-btn" data-act="weather-open">Ver / mudar clima</button>
      <p class="hub-hint">O clima é um estado compartilhado. Os modificadores aparecem na conta das rolagens de Percepção e de ataques à distância (Pontaria) enquanto este clima estiver ativo; o mestre decide o resto.</p></div>`;
  }
  function renderMestre(){
    if(!isMaster()) return '<div class="inv-empty">Área restrita ao mestre desta campanha.</div>';
    const c = cfg(), g = hub.give, pins2 = pins.filter(p => p.type !== 'npc');
    if(!g.to || !holderById(g.to)) g.to = (allHolders()[0] || {}).id || '';
    if(!hub.resDraft) hub.resDraft = c.resources.map(r => Object.assign({}, r));
    if(!hub.slotDraft) hub.slotDraft = Object.assign({}, c.equipSlots);
    const locOpts = cc => opt('', '— abastecer à mão —', cc.locKey || '') + LOC_ORDER.map(k => opt(k, LOC_NAMES[k], cc.locKey || '')).join('');
    const cont = pins2.map(p => {
      const eff = pinCC(p), cc = eff || p.container || {}, on = !!eff;
      return `<div class="inv-item"><div class="inv-item-name">${esc(p.title || 'Pin')}</div>
        <label class="check-row"><input type="checkbox" data-ctn="${esc(p.id)}" data-f="enabled" ${on ? 'checked' : ''}> É um contêiner (tem conteúdo persistente)${eff && eff.auto ? ' · automático pelo tipo do pin' : ''}</label>
        ${on ? `<label class="hub-label">Tabela de saque (sorteada uma única vez)</label><select data-ctn="${esc(p.id)}" data-f="locKey">${locOpts(cc)}</select>
        <div class="expr-row"><input type="number" min="0" max="8" data-ctn="${esc(p.id)}" data-f="min" value="${cc.min != null ? esc(cc.min) : 1}" aria-label="Mínimo de itens"><input type="number" min="1" max="8" data-ctn="${esc(p.id)}" data-f="max" value="${cc.max != null ? esc(cc.max) : 3}" aria-label="Máximo de itens"></div>
        <input type="number" min="1" data-ctn="${esc(p.id)}" data-f="cap" value="${cc.cap || ''}" placeholder="Capacidade em espaços (vazio = sem limite)">
        <select data-ctn="${esc(p.id)}" data-f="access">${opt('aberto', 'Aberto', cc.access || 'aberto')}${opt('bloqueado', 'Bloqueado (só o mestre abre)', cc.access || 'aberto')}</select>
        <div class="inv-item-util">Estado: ${esc(CONT_STATE_LABELS[containerState(p.id)] || '—')} · ${invCount(p.id)} item(ns)</div>
        <div class="inv-item-actions"><button type="button" class="inv-mini-btn" data-act="open-inv" data-id="${esc(p.id)}">Abrir</button><button type="button" class="inv-mini-btn" data-act="pin-go" data-id="${esc(p.id)}">Ver no mapa</button></div>` : ''}</div>`;
    }).join('');
    const toks = holderList().filter(h => h.type === 'token');
    return `<div class="hub-sec"><div class="hub-label">Contêineres e saque persistente</div>
      <p class="hub-hint">Um contêiner guarda o que foi sorteado: abrir de novo mostra o que sobrou. Não há reposição automática; use "Reabastecer" quando quiser.</p>${cont || '<div class="inv-empty">Nenhum pin no mapa.</div>'}</div>
    <div class="hub-sec"><div class="hub-label">Dar item (ajuste do mestre)</div>
      <datalist id="item-names">${ITEMS.map(i => `<option value="${esc(i.name)}">`).join('')}</datalist>
      <input type="text" list="item-names" data-bind="gv.name" value="${esc(g.name)}" placeholder="Nome do item do catálogo">
      <div class="expr-row"><input type="number" min="1" class="qty-in" data-bind="gv.qty" data-num value="${esc(g.qty)}" aria-label="Quantidade"><select data-bind="gv.to">${allHolders().map(h => opt(h.id, (h.type === 'container' ? 'Contêiner · ' : h.type === 'npc' ? 'NPC · ' : '') + h.name, g.to)).join('')}</select></div>
      <button type="button" class="inv-mini-btn primary" data-act="give">Entregar</button></div>
    <div class="hub-sec"><div class="hub-label">Recursos do formato antigo da ficha (PV, PD...)</div>
      <p class="hub-hint">Vale só para fichas no formato antigo. As fichas de Ordem Paranormal já têm PV e PD próprios. O app guarda e mostra os valores; nenhuma regra é aplicada sozinha.</p>
      ${hub.resDraft.map((r, i) => `<div class="bonus-row"><input type="text" data-bind="rs.${i}.label" value="${esc(r.label)}" placeholder="Nome (ex.: PV)" maxlength="20"><input type="number" min="0" data-bind="rs.${i}.max" data-num value="${esc(r.max || '')}" placeholder="Máx."><button type="button" class="inv-mini-btn danger" data-act="res-del" data-i="${i}" aria-label="Remover recurso">✕</button></div>`).join('')}
      <div class="inv-item-actions"><button type="button" class="inv-mini-btn" data-act="res-add">＋ Recurso</button><button type="button" class="inv-mini-btn" data-act="res-seed">Sugerir PV / PD</button><button type="button" class="inv-mini-btn primary" data-act="res-save">Salvar recursos</button></div></div>
    <div class="hub-sec"><div class="hub-label">Espaços de equipamento (quantos itens cabem em cada)</div>
      ${EQUIP_SLOTS.map(s => `<div class="bonus-row"><span class="w-cat">${esc(s[1])}</span><input type="number" min="0" max="9" data-bind="sl.${s[0]}" data-num value="${esc(hub.slotDraft[s[0]])}"></div>`).join('')}
      <button type="button" class="inv-mini-btn primary" data-act="slots-save">Salvar espaços</button></div>
    ${c.modules.needs ? `<div class="hub-sec"><div class="hub-label">Ajuste de necessidades em grupo</div>
      <p class="hub-hint">Você decide quando aplicar: escolha a necessidade, o ajuste e quem é afetado. Fica registrado na linha do tempo.</p>
      <select data-bind="hub.bulkNeed">${NEED_LIST.map(n => opt(n[0], n[1], hub.bulkNeed)).join('')}</select>
      <select data-bind="hub.bulkDelta" data-num>${opt(1, '+1 nível (piora)', hub.bulkDelta)}${opt(-1, '−1 nível (melhora)', hub.bulkDelta)}</select>
      ${toks.map(h => `<label class="check-row"><input type="checkbox" data-act="bulk-pick" data-id="${esc(h.id)}" ${hub.bulkPick.includes(h.id) ? 'checked' : ''}> ${esc(h.name)}</label>`).join('') || '<div class="inv-item-util">Sem tokens.</div>'}
      <button type="button" class="inv-mini-btn primary" data-act="bulk-apply">Aplicar</button></div>` : ''}
    <div class="hub-sec"><div class="hub-label">Backup e restauração desta campanha</div>
      <button type="button" class="inv-mini-btn primary" data-act="backup-export">${ic('download', 14)} Exportar backup (arquivo .json)</button>
      <label class="hub-label">Restaurar de um backup</label>
      <input type="file" accept="application/json,.json" id="backup-file">
      <p class="hub-hint">Restaurar sobrescreve mapa, inventários, fichas, diário e registros desta campanha com o conteúdo do arquivo. Um backup do estado atual é baixado automaticamente antes.</p>
      <button type="button" class="inv-mini-btn danger" data-act="backup-import">Restaurar do arquivo escolhido</button>${hub.backupMsg ? `<p class="hub-hint" role="status">${esc(hub.backupMsg)}</p>` : ''}</div>`;
  }
  function slugKey(s){ return normName(s).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 20) || 'r' + Date.now().toString(36); }
  async function saveResources(){
    const seen = {}, list = [];
    hub.resDraft.forEach(r => {
      const label = String(r.label || '').trim(); if(!label) return;
      let key = r.key || slugKey(label); while(seen[key]) key += '2'; seen[key] = 1;
      list.push({ key, label, max:Math.max(0, parseInt(r.max, 10) || 0) });
    });
    await DB.set(`campaign-meta/${activeCampaignId}/config/resources`, list.length ? list : null);
    hub.resDraft = null; toast('Recursos salvos.'); renderHub();
  }
  async function saveSlots(){
    const o = {}; EQUIP_SLOTS.forEach(s => { const n = parseInt(hub.slotDraft[s[0]], 10); o[s[0]] = isNaN(n) ? DEFAULT_SLOT_CAP[s[0]] : Math.min(9, Math.max(0, n)); });
    await DB.set(`campaign-meta/${activeCampaignId}/config/equipSlots`, o);
    hub.slotDraft = null; toast('Espaços salvos.'); renderHub();
  }
  async function giveItem(){
    const g = hub.give, item = itemByName(g.name);
    if(!item){ toast('Escolha um item pelo nome do catálogo.', true); return; }
    if(!g.to || !holderById(g.to)){ toast('Escolha o destino.', true); return; }
    const qty = Math.max(1, parseInt(g.qty, 10) || 1);
    const ok = await addItemTo(g.to, item, 'mestre', 'ajuste', { note:'item concedido pelo mestre' }, null, qty);
    if(ok){ g.name = ''; renderHub(); }
  }
  async function bulkNeeds(){
    if(!hub.bulkPick.length){ toast('Escolha ao menos um personagem.', true); return; }
    const nd = NEED_LIST.find(n => n[0] === hub.bulkNeed), d = Number(hub.bulkDelta) || 1;
    if(!window.confirm(`Aplicar ${d > 0 ? '+1' : '−1'} em "${nd[1]}" a ${hub.bulkPick.length} personagem(ns)?`)) return;
    const names = [];
    for(const id of hub.bulkPick){
      const h = holderById(id); if(!h) continue;
      const card = JSON.parse(JSON.stringify(ensureCard(id)));
      card.needs = card.needs || {};
      card.needs[nd[0]] = Math.min(4, Math.max(0, (card.needs[nd[0]] || 0) + d));
      await DB.set(`${scopedKey(KEY_CHARS)}/${id}`, card);
      names.push(h.name);
    }
    logEvent(`${nd[1]} ${d > 0 ? '+1' : '−1'}: ${names.join(', ')}`);
    hub.bulkPick = []; toast('Ajuste aplicado.'); renderHub();
  }
  // ---------- backup e restauração ----------
  const BACKUP_KEYS = [KEY_PINS, KEY_TOKENS, KEY_SHAPES, KEY_ROUTES, KEY_WEATHER, KEY_INV, KEY_LOG, KEY_CHARS, KEY_ROLLS, KEY_RECIPES, KEY_CLOCK, KEY_SHORTCUTS, KEY_JOURNAL, KEY_GMJ, KEY_TAC, KEY_TACIMG, KEY_GMTAC];
  async function buildBackup(){
    const data = {};
    for(const k of BACKUP_KEYS){ try{ const v = await readScoped(activeCampaignId, k); if(v != null) data[k] = v; }catch(e){ /* sem permissão: segue */ } }
    return { format:'tau-volantis-backup', formatVersion:1, dataSchema:DATA_SCHEMA, exportedAt:new Date().toISOString(),
      campaign:{ id:activeCampaignId, name:campaignMeta ? campaignMeta.name : '', system:campaignMeta ? campaignMeta.system || '' : '', config:(campaignMeta && campaignMeta.config) || null },
      sessions, data };
  }
  function downloadJson(obj, name){
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([JSON.stringify(obj, null, 1)], { type:'application/json' }));
    a.download = name; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1500);
  }
  function backupName(){ return 'tau-volantis-' + String((campaignMeta && campaignMeta.name) || 'campanha').replace(/[^a-z0-9]+/gi, '-').toLowerCase() + '-' + todayStr() + '.json'; }
  async function exportBackup(){ if(!isMaster()) return; downloadJson(await buildBackup(), backupName()); hub.backupMsg = 'Backup gerado e baixado.'; renderHub(); }
  // confere o arquivo e conta problemas ANTES de gravar qualquer coisa
  function checkBackup(b){
    const issues = [];
    if(!b || b.format !== 'tau-volantis-backup') return { fatal:'O arquivo não é um backup do Tau Volantis.' };
    if(!b.formatVersion || b.formatVersion > 1) return { fatal:'Versão de backup desconhecida (mais nova que este app).' };
    if(!b.data || typeof b.data !== 'object') return { fatal:'Backup sem dados.' };
    Object.keys(b.data).forEach(k => { if(!BACKUP_KEYS.includes(k)) issues.push('Chave ignorada: ' + k); });
    const inv = b.data[KEY_INV] || {};
    let bad = 0, total = 0;
    Object.keys(inv).forEach(h => Object.keys(inv[h] || {}).filter(isItemKey).forEach(u => { total++; const i = inv[h][u]; if(!i || !i.uid || i.itemId == null || !i.name) bad++; }));
    if(bad) issues.push(`${bad} de ${total} item(ns) de inventário estão malformados e serão restaurados como estão.`);
    return { issues, fatal:null, total };
  }
  async function importBackup(){
    if(!isMaster()) return;
    const fi = document.getElementById('backup-file'), file = fi && fi.files && fi.files[0];
    if(!file){ toast('Escolha o arquivo de backup primeiro.', true); return; }
    let b; try{ b = JSON.parse(await file.text()); }catch(e){ toast('Arquivo ilegível (JSON inválido).', true); return; }
    const chk = checkBackup(b);
    if(chk.fatal){ toast(chk.fatal, true); return; }
    const typed = window.prompt(`Restaurar "${(b.campaign && b.campaign.name) || 'backup'}" (${b.exportedAt || '?'}) sobre a campanha ATUAL "${campaignMeta ? campaignMeta.name : ''}"?\n${chk.issues.join('\n')}\nUm backup do estado atual será baixado antes.\nDigite RESTAURAR para confirmar:`);
    if(typed == null || typed.trim() !== 'RESTAURAR'){ if(typed != null) toast('Nada foi alterado.', true); return; }
    downloadJson(await buildBackup(), 'ANTES-DA-RESTAURACAO-' + backupName());
    const failed = [];
    for(const k of Object.keys(b.data)){
      if(!BACKUP_KEYS.includes(k)) continue;
      try{ await writeScoped(activeCampaignId, k, b.data[k]); }catch(e){ console.error('Falha ao restaurar', k, e); failed.push(k); }
    }
    if(b.sessions){ try{ await DB.set('campaign-sessions/' + activeCampaignId, b.sessions); }catch(e){ failed.push('sessões'); } }
    if(b.campaign && b.campaign.config){ try{ await DB.set(`campaign-meta/${activeCampaignId}/config`, b.campaign.config); }catch(e){ failed.push('configuração'); } }
    hub.backupMsg = failed.length ? 'Restauração parcial. Falharam: ' + failed.join(', ') + '.' : 'Restauração concluída.';
    toast(hub.backupMsg, !!failed.length);
    if(!firebaseReady) activateCampaign(activeCampaignId);
    renderHub();
  }
  function renderFichaExtras(h, card, dis){
    const res = cfg().resources;
    let html = '';
    if(res.length) html += `<div class="hub-label">Recursos</div>` + res.map(r => `<div class="need-row"><span>${esc(r.label)}</span>
      <button type="button" class="die-btn" data-act="res" data-k="${esc(r.key)}" data-d="-1" ${dis} aria-label="Reduzir ${esc(r.label)}">−</button><b class="need-v">${resVal(card, r)}${r.max ? ' / ' + r.max : ''}</b>
      <button type="button" class="die-btn" data-act="res" data-k="${esc(r.key)}" data-d="1" ${dis} aria-label="Aumentar ${esc(r.label)}">+</button></div>`).join('');
    return html;
  }

  // ================= FICHA DE ORDEM PARANORMAL =================
  // As tabelas abaixo (perícias, treinamento, condições com modificador, margens) vêm do plano da mesa
  // e NÃO foram conferidas contra o livro. Para ajustar uma regra, edite só estas tabelas.
  // Segundo recurso: PD (Pontos de Determinação). DET e PD são a mesma coisa, então existe uma única barra.
  const OP_ATTRS = [['agi','AGI','Agilidade'], ['for','FOR','Força'], ['int','INT','Intelecto'], ['pre','PRE','Presença'], ['vig','VIG','Vigor']];
  const OP_SKILLS = [
    ['acrobacia','Acrobacia','agi'], ['adestramento','Adestramento','pre'], ['artes','Artes','pre'], ['atletismo','Atletismo','for'],
    ['atualidades','Atualidades','int'], ['ciencias','Ciências','int'], ['crime','Crime','agi'], ['diplomacia','Diplomacia','pre'],
    ['enganacao','Enganação','pre'], ['fortitude','Fortitude','vig'], ['furtividade','Furtividade','agi'], ['iniciativa','Iniciativa','agi'],
    ['intimidacao','Intimidação','pre'], ['intuicao','Intuição','pre'], ['investigacao','Investigação','int'], ['luta','Luta','for'],
    ['medicina','Medicina','int'], ['ocultismo','Ocultismo','int'], ['percepcao','Percepção','pre'], ['pilotagem','Pilotagem','agi'],
    ['pontaria','Pontaria','agi'], ['profissao','Profissão','int'], ['reflexos','Reflexos','agi'], ['religiao','Religião','pre'],
    ['sobrevivencia','Sobrevivência','int'], ['tatica','Tática','int'], ['tecnologia','Tecnologia','int'], ['vontade','Vontade','pre']
  ];
  const OP_TRAIN = { none:['Destreinado', 0], trained:['Treinado', 5], veteran:['Veterano', 10], expert:['Expert', 15] };
  const OP_NEX = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 99];   // 99% = estágio 20
  const OP_RES = { pv:['PV', 'Pontos de Vida', '#c9433f'], pd:['PD', 'Pontos de Determinação', '#3f8fd1'] };
  // Condições. mods = modificadores automáticos em testes: g = grupo (dentro do mesmo grupo vale só a pior penalidade,
  // porque condições com o mesmo efeito não se acumulam), v = valor, when(ctx) = quando se aplica
  // (ctx: kind 'skill' | 'attack', attr, skill). Condições sem "mods" ficam só como marcação.
  const OP_PHYS = a => a === 'agi' || a === 'for' || a === 'vig', OP_MENT = a => a === 'int' || a === 'pre';
  const OP_COND = {
    abalado:    { n:'Abalado',    t:'−2 em testes.',                              mods:[{ g:'medo', v:-2, when:() => true }] },
    apavorado:  { n:'Apavorado',  t:'−5 em testes de perícia.',                   mods:[{ g:'medo', v:-5, when:c => !!c.skill }] },
    debilitado: { n:'Debilitado', t:'−5 em testes de Agilidade, Força e Vigor.',  mods:[{ g:'fisico', v:-5, when:c => OP_PHYS(c.attr) }] },
    esmorecido: { n:'Esmorecido', t:'−5 em testes de Intelecto e Presença.',      mods:[{ g:'mental', v:-5, when:c => OP_MENT(c.attr) }] },
    fraco:      { n:'Fraco',      t:'−2 em testes de Agilidade, Força e Vigor.',  mods:[{ g:'fisico', v:-2, when:c => OP_PHYS(c.attr) }] },
    ofuscado:   { n:'Ofuscado',   t:'−2 em ataques e Percepção.', i:'eye',        mods:[{ g:'visao', v:-2, when:c => c.kind === 'attack' || c.skill === 'percepcao' }] },
    vulneravel: { n:'Vulnerável', t:'−2 na Defesa (não entra em testes de perícia).' },
    sangrando:{ n:'Sangrando', i:'drop' }, morrendo:{ n:'Morrendo', i:'skull' }, cego:{ n:'Cego', i:'eye' },
    agarrado:{ n:'Agarrado' }, alquebrado:{ n:'Alquebrado' }, atordoado:{ n:'Atordoado' }, caido:{ n:'Caído' }, confuso:{ n:'Confuso' },
    desprevenido:{ n:'Desprevenido' }, doente:{ n:'Doente' }, em_chamas:{ n:'Em chamas' }, enjoado:{ n:'Enjoado' }, enredado:{ n:'Enredado' },
    envenenado:{ n:'Envenenado' }, exausto:{ n:'Exausto' }, fascinado:{ n:'Fascinado' }, fatigado:{ n:'Fatigado' }, frustrado:{ n:'Frustrado' },
    imovel:{ n:'Imóvel' }, indefeso:{ n:'Indefeso' }, inconsciente:{ n:'Inconsciente' }, lento:{ n:'Lento' }, machucado:{ n:'Machucado' },
    paralisado:{ n:'Paralisado' }, pasmo:{ n:'Pasmo' }, petrificado:{ n:'Petrificado' }, surdo:{ n:'Surdo' }, surpreendido:{ n:'Surpreendido' },
    outra:{ n:'Outra (nome livre)' }
  };
  const OP_COND_ORDER = ['abalado','apavorado','debilitado','esmorecido','fraco','ofuscado','vulneravel','sangrando'];
  const opSgn = n => (n < 0 ? '−' : '+') + Math.abs(n);
  const opNum = v => { const n = Number(v); return isNaN(n) ? 0 : n; };
  const opSlug = s => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
  const opAttrOf = (card, a) => a ? opNum(card.attributes && card.attributes[a]) : 0;
  const opAttrLabel = a => (OP_ATTRS.find(x => x[0] === a) || ['', ''])[1];
  function opSkillDef(card, key){
    const d = OP_SKILLS.find(x => x[0] === key), s = (card.skillsV2 && card.skillsV2[key]) || {};
    // atributo da perícia: o padrão do sistema, ou o que o jogador escolheu (skillsV2.<chave>.attr, campo opcional)
    const own = OP_ATTRS.some(a => a[0] === s.attr) ? s.attr : '';
    return { key, name:d ? d[1] : (s.name || key), attr:own || (d ? d[2] : ''), defAttr:d ? d[2] : '', s, free:!d };
  }
  function opCondName(c){ const d = OP_COND[c.key]; return c.key === 'outra' ? (c.note || 'Condição') : (d ? d.n : (c.note || c.key)); }
  // penalidades de condição que valem para este teste (uma por grupo: a pior)
  function opCondMods(card, ctx){
    const best = {};
    (card.conditions || []).forEach(c => {
      const d = OP_COND[c.key]; if(!d || !d.mods) return;
      d.mods.forEach(m => { if(m.when(ctx) && (!best[m.g] || m.v < best[m.g].value)) best[m.g] = { label:d.n, value:m.v }; });
    });
    // grupos diferentes se somam (ex.: Abalado −2 e Debilitado −5 num teste de Força); o mesmo grupo não
    return Object.keys(best).map(g => best[g]);
  }
  // Regra de teste de Ordem Paranormal: o VALOR DO ATRIBUTO define quantos d20 são rolados (fica o MAIOR);
  // com atributo 0 rola 2d20 e fica o MENOR. O atributo não soma no resultado: somam só treinamento, bônus avulso,
  // condições e clima. Sem atributo (perícia livre sem atributo): 1d20.
  const OP_MAXD20 = 20;
  function opPool(card, attr){
    if(!attr) return { n:1, keep:null, attr:'', val:null, label:'1d20', low:false };
    const v = Math.trunc(opAttrOf(card, attr)) || 0;
    if(v >= 1){ const n = Math.min(OP_MAXD20, v); return { n, keep:n > 1 ? 'kh' : null, attr, val:v, label:n + 'd20', low:false }; }
    return { n:2, keep:'kl', attr, val:v, label:'2d20↓', low:true };      // ↓ = fica o menor
  }
  const opPoolHelp = p => p.n === 1 && !p.attr ? '1d20' : (p.low ? '2d20, fica o menor (atributo 0)' : (p.n === 1 ? '1d20' : p.n + 'd20, fica o maior'));
  function opD20(pool){ const t = { sign:1, n:pool.n, sides:20 }; if(pool.keep) t[pool.keep] = 1; return rollTerm(t, makeSource(null)); }
  // partes do teste de uma perícia ou ataque: (dados pelo atributo) + treinamento + bônus avulso + condições + clima
  function opParts(card, skillKey, attrKey, kind){
    const sd = skillKey ? opSkillDef(card, skillKey) : null;
    const attr = attrKey || (sd ? sd.attr : '');
    const tr = OP_TRAIN[(sd && sd.s.training)] || OP_TRAIN.none;
    const parts = [];
    parts.push({ label:tr[0], value:tr[1] });
    if(sd && opNum(sd.s.bonus)) parts.push({ label:'Outros', value:opNum(sd.s.bonus) });
    const conds = opCondMods(card, { kind:kind || 'skill', attr, skill:skillKey || '' }).map(m => ({ label:m.label, value:m.value, cond:true }))
      .concat(weatherMods(kind || 'skill', skillKey || ''));      // clima ativo: Percepção / ataques à distância
    return { parts, conds, attr, train:tr, pool:opPool(card, attr) };
  }
  const opSum = p => p.parts.concat(p.conds).reduce((a, x) => a + x.value, 0);
  function opRes(card, k){ const r = (card.resources2 && card.resources2[k]) || {}; return { cur:opNum(r.cur), max:opNum(r.max) }; }
  // texto da composição. 1 dado: "d20 (AGI 1): 14 + Treinado 5 − 2 (Abalado) = 17";  vários: "3d20 maior (AGI 3) [14, (9), (6)] → 14 + Treinado 5 = 19"
  function opBonusTxt(b){ return `${b.value < 0 ? '−' : '+'} ${b.cond ? Math.abs(b.value) + ' (' + b.label + ')' : b.label + ' ' + Math.abs(b.value)}`; }
  function opCompText(r){
    const sh = r.sheet || {}, t0 = r.terms && r.terms[0];
    let base;
    if((sh.kind === 'skill' || sh.kind === 'attack') && t0 && t0.dice && t0.dice.length){
      const n = t0.dice.length, at = sh.attr ? ' (' + opAttrLabel(sh.attr) + (sh.val != null ? ' ' + sh.val : '') + ')' : '';
      base = n === 1 ? 'd20' + at + ': ' + t0.value
        : n + 'd20 ' + (sh.keep === 'kl' ? 'menor' : 'maior') + at + ' [' + t0.dice.map(fmtDie).join(', ') + '] → ' + t0.value;
    } else base = fmtTerms(r.terms || []);
    return base + (r.bonuses || []).map(b => ' ' + opBonusTxt(b)).join('') + ' = ' + r.total + (sh.kind === 'attack' && sh.crit ? ' · CRÍTICO!' : '');
  }
  // cartão que fica 7 s no topo da tela com o resultado (o histórico fica na aba Dados)
  function opToast(r){
    const old = document.getElementById('op-toast'); if(old) old.remove();
    if(hudReady){ const q = hudEl('qr-sheet'); if(q.classList.contains('open') && q.scrollTop < 40) return; }   // a folha Rolar já mostra o resultado no topo
    const crit = !!(r.sheet && r.sheet.kind === 'attack' && r.sheet.crit);
    const el = document.createElement('div');
    el.id = 'op-toast'; el.className = 'op-toast' + (crit ? ' crit' : ''); el.setAttribute('role', 'status');
    el.innerHTML = `<div class="op-toast-total">${r.total}</div><div class="op-toast-body"><b>${esc(r.whoName || '')} · ${esc(r.skill)}${crit ? ' <span class="op-crit">CRÍTICO!</span>' : ''}</b><span>${esc(opCompText(r))}</span></div>`;
    el.addEventListener('click', () => el.remove());
    document.body.appendChild(el);
    setTimeout(() => { if(el.isConnected) el.remove(); }, 7000);
  }
  // registra uma rolagem da ficha (mesmo formato da aba Dados, então cai no histórico e no feed)
  async function opRecord(tokenId, title, termResults, bonuses, extra){
    const h = holderById(tokenId), a = actorFields();
    const bs = bonuses.filter(b => b.value !== 0).map(b => b.cond ? Object.assign({ label:b.label, value:b.value, cond:true }, b.weather ? { weather:true } : {}) : { label:b.label, value:b.value });
    const diceSum = termResults.reduce((s, t) => s + t.value, 0), bonusSum = bs.reduce((s, b) => s + b.value, 0);
    const rec = { important:false, skill:title, terms:termResults, diceSum, bonuses:bs, bonusSum, total:diceSum + bonusSum, note:'', physical:false,
      tokenId:h ? h.id : null, whoName:h ? h.name : a.actorName, actorId:a.actorId, actorName:a.actorName,
      sessionId:(campaignMeta && campaignMeta.activeSessionId) || null, sheet:extra || {} };
    rollUI.last = Object.assign({ ts:Date.now() }, rec);
    const path = scopedKey(KEY_ROLLS), id = DB.newId(path);
    const ok = await DB.set(path + '/' + id, Object.assign({ id, ts:DB.ts() }, JSON.parse(JSON.stringify(rec))));
    if(!ok) toast(dbFailMsg('A rolagem'), true);
    opToast(rollUI.last);
    if(hubIsOpen()) renderHub();
    hudQRChanged();
    return rec;
  }
  function opCanEdit(tokenId, msg){
    if(!canEditHolder(holderById(tokenId))){ toast(msg || 'Só o dono do personagem (ou o mestre) altera esta ficha.', true); return false; }
    return true;
  }
  const opAttrOk = a => OP_ATTRS.some(x => x[0] === a) ? a : null;
  // attrOv = atributo escolhido só para esta rolagem (folha Rolar); sem ele vale o atributo da perícia na ficha
  async function opRollSkill(key, tokenId, attrOv){
    const id = tokenId || hub.charToken; if(!opCanEdit(id, 'Só o dono do personagem (ou o mestre) rola por ele.')) return;
    const card = ensureCard(id), sd = opSkillDef(card, key), ov = opAttrOk(attrOv), p = opParts(card, key, ov, 'skill');
    const t = opD20(p.pool);
    await opRecord(id, sd.name + (ov && ov !== sd.attr ? ' (' + opAttrLabel(ov) + ')' : ''), [t], p.parts.concat(p.conds), { kind:'skill', key, attr:p.pool.attr, val:p.pool.val, pool:p.pool.n, keep:p.pool.keep });
  }
  async function opRollAttack(atkId, tokenId, attrOv){
    const id = tokenId || hub.charToken; if(!opCanEdit(id, 'Só o dono do personagem (ou o mestre) rola por ele.')) return;
    const card = ensureCard(id), atk = (card.attacks || []).find(x => x.id === atkId); if(!atk) return;
    const ov = opAttrOk(attrOv), p = opParts(card, atk.skill || '', ov || atk.attribute || '', 'attack');
    const t = opD20(p.pool);
    const nat = t.value, margin = Math.min(20, Math.max(2, parseInt(atk.critMargin, 10) || 20));
    const crit = nat >= margin;      // crítico: o d20 que ficou (o maior, ou o menor com atributo 0) caiu dentro da margem
    hub.opCrit = hub.opCrit || {}; hub.opCrit[atkId] = crit;
    await opRecord(id, (atk.name || 'Ataque') + ' · ataque', [t], p.parts.concat(p.conds), { kind:'attack', atk:atkId, crit, nat, attr:p.pool.attr, val:p.pool.val, pool:p.pool.n, keep:p.pool.keep });
  }
  async function opRollDamage(atkId, tokenId){
    const id = tokenId || hub.charToken; if(!opCanEdit(id, 'Só o dono do personagem (ou o mestre) rola por ele.')) return;
    const card = ensureCard(id), atk = (card.attacks || []).find(x => x.id === atkId); if(!atk) return;
    const pe = parseExpr(atk.damage || '');
    if(pe.error || !pe.terms.length){ toast(pe.error || 'Escreva o dano do ataque (ex.: 1d10+2).', true); return; }
    const crit = !!(hub.opCrit && hub.opCrit[atkId]), mult = Math.min(10, Math.max(1, parseInt(atk.critMult, 10) || 2));
    // no crítico só os DADOS são multiplicados; bônus fixos não
    const terms = pe.terms.map(t => crit ? Object.assign({}, t, { n:Math.min(50, t.n * mult) }) : t);
    const results = terms.map(t => rollTerm(t, makeSource(null)));
    const bonuses = [];
    if(pe.bonus) bonuses.push({ label:'Fixo', value:pe.bonus });
    if(atk.addAttrToDamage && atk.attribute) bonuses.push({ label:opAttrLabel(atk.attribute), value:opAttrOf(card, atk.attribute) });
    if(atk.addTrainingToDamage && atk.skill){ const tr = OP_TRAIN[opSkillDef(card, atk.skill).s.training] || OP_TRAIN.none; bonuses.push({ label:tr[0], value:tr[1] }); }
    if(hub.opCrit) hub.opCrit[atkId] = false;
    await opRecord(id, (atk.name || 'Ataque') + ' · dano' + (crit ? ' (crítico ×' + mult + ')' : ''), results, bonuses, { kind:'damage', atk:atkId, crit });
  }
  // ---- formato antigo → Ordem Paranormal (aditivo e reversível) ----
  function opSkipped(id){
    if(hub.opSkip && hub.opSkip[id]) return true;
    try{ return !!JSON.parse(localStorage.getItem('tv-op-skip:' + activeCampaignId) || '{}')[id]; }catch(e){ return false; }
  }
  function opSkip(id){
    hub.opSkip = hub.opSkip || {}; hub.opSkip[id] = 1;     // só neste aparelho; nada é gravado na ficha
    try{ const k = 'tv-op-skip:' + activeCampaignId, o = JSON.parse(localStorage.getItem(k) || '{}'); o[id] = 1; localStorage.setItem(k, JSON.stringify(o)); }catch(e){}
    renderHub();
  }
  function opMigrate(){
    const id = hub.charToken; if(!opCanEdit(id, 'Só o dono do personagem (ou o mestre) migra a ficha.')) return;
    const card = ensureCard(id);
    card.skillsLegacy = JSON.parse(JSON.stringify(card.skills || []));       // cópias: dá para voltar
    card.resLegacy = JSON.parse(JSON.stringify(card.res || {}));
    card.systemId = 'ordem';
    if(!card.attributes) card.attributes = { agi:1, for:1, int:1, pre:1, vig:1 };
    if(!card.meta) card.meta = { class:'', origin:'' };
    if(card.nex == null) card.nex = 5;
    if(card.level == null) card.level = 1;
    if(!card.skillsV2) card.skillsV2 = {};
    (card.skills || []).forEach(s => {
      const nm = opSlug(s.name); if(!nm) return;
      const def = OP_SKILLS.find(x => opSlug(x[1]) === nm);
      const key = def ? def[0] : 'x_' + nm;
      if(!card.skillsV2[key]) card.skillsV2[key] = def ? { training:'none', bonus:opNum(s.bonus) } : { training:'none', bonus:opNum(s.bonus), name:s.name, attr:'' };
    });
    if(!card.resources2){
      const old = cfg().resources.find(x => x.key === 'pv' || String(x.label).trim().toLowerCase() === 'pv');
      card.resources2 = { pv:old ? { cur:resVal(card, old), max:old.max || 0 } : { cur:0, max:0 }, pd:{ cur:0, max:0 } };
    }
    if(!card.attacks) card.attacks = [];
    if(!card.conditions) card.conditions = [];
    scheduleSaveCard(); renderHub();
    toast('Ficha migrada. Confira os atributos e os bônus das perícias. Os dados antigos ficaram guardados.');
  }
  function opRevert(){
    const id = hub.charToken; if(!opCanEdit(id)) return;
    if(!window.confirm('Voltar esta ficha para o formato antigo? Os dados novos (atributos, ataques, condições) ficam guardados e voltam se você migrar de novo.')) return;
    delete ensureCard(id).systemId;
    scheduleSaveCard(); renderHub();
  }
  function opAddSkill(raw, attr, all){
    const id = hub.charToken; if(!opCanEdit(id)) return;
    const card = ensureCard(id); card.skillsV2 = card.skillsV2 || {};
    if(all){
      OP_SKILLS.forEach(d => { if(!card.skillsV2[d[0]]) card.skillsV2[d[0]] = { training:'none', bonus:0 }; });
    } else {
      const txt = String(raw || '').trim(); if(!txt){ toast('Digite ou escolha o nome da perícia.', true); return; }
      const def = OP_SKILLS.find(x => opSlug(x[1]) === opSlug(txt));
      const key = def ? def[0] : 'x_' + opSlug(txt);
      if(card.skillsV2[key]){ toast('Essa perícia já está na ficha.', true); return; }
      card.skillsV2[key] = def ? { training:'none', bonus:0 } : { training:'none', bonus:0, name:txt, attr:attr || '' };
    }
    scheduleSaveCard(); renderHub();
  }
  function opDelSkill(key){
    const id = hub.charToken; if(!opCanEdit(id)) return;
    const card = ensureCard(id), s = (card.skillsV2 || {})[key]; if(!s) return;
    if((s.training && s.training !== 'none') || opNum(s.bonus)){ if(!window.confirm('Remover "' + opSkillDef(card, key).name + '" da ficha? O treinamento e o bônus dela serão perdidos.')) return; }
    delete card.skillsV2[key];
    scheduleSaveCard(); renderHub();
  }
  function opNewAttack(){
    const id = hub.charToken; if(!opCanEdit(id)) return;
    const card = ensureCard(id), atk = { id:newUid('atk_'), name:'Novo ataque', attribute:'for', skill:'luta', damage:'1d6', critMargin:20, critMult:2, addAttrToDamage:false, addTrainingToDamage:false };
    card.attacks = (card.attacks || []).concat([atk]); hub.opEdit = atk.id;
    scheduleSaveCard(); renderHub();
  }
  function opDelAttack(atkId){
    const id = hub.charToken; if(!opCanEdit(id)) return;
    if(!window.confirm('Remover este ataque?')) return;
    const card = ensureCard(id); card.attacks = (card.attacks || []).filter(a => a.id !== atkId);
    if(hub.opEdit === atkId) hub.opEdit = null;
    scheduleSaveCard(); renderHub();
  }
  function opAddCondition(){
    const id = hub.charToken; if(!opCanEdit(id)) return;
    const key = (hubBody.querySelector('#op-cond-key') || {}).value, note = ((hubBody.querySelector('#op-cond-note') || {}).value || '').trim();
    if(!key) return;
    if(key === 'outra' && !note){ toast('Escreva o nome da condição.', true); return; }
    const card = ensureCard(id), h = holderById(id);
    if(key !== 'outra' && (card.conditions || []).some(c => c.key === key)){ toast('Essa condição já está ativa.', true); return; }
    const c = { id:newUid('cd_'), key, note };
    card.conditions = (card.conditions || []).concat([c]);
    scheduleSaveCard(); renderHub();
    // aparece no feed e na linha do tempo da mesa
    addJournal({ type:'evento', evKind:'condicao', text:`${h ? h.name : card.name} recebeu [${opCondName(c)}]`, auto:true, vis:'grupo' });
  }
  function opDelCondition(cid){
    const id = hub.charToken; if(!opCanEdit(id)) return;
    const card = ensureCard(id); card.conditions = (card.conditions || []).filter(c => c.id !== cid);
    scheduleSaveCard(); renderHub();
  }
  function opAdjustRes(k, d, tokenId){
    const id = tokenId || hub.charToken; if(!opCanEdit(id)) return;
    const card = ensureCard(id); card.resources2 = card.resources2 || {};
    const r = card.resources2[k] = card.resources2[k] || { cur:0, max:0 };
    let v = opNum(r.cur) + d; v = Math.max(0, opNum(r.max) > 0 ? Math.min(opNum(r.max), v) : v);
    r.cur = v; scheduleSaveCard(id); if(hubIsOpen() && hub.charToken === id) renderHub(); hudMiniChanged();
  }
  // ---- desenho da ficha ----
  function opBar(card, k, dis){
    const r = opRes(card, k), pct = r.max > 0 ? Math.max(0, Math.min(100, Math.round(r.cur / r.max * 100))) : 0, low = r.max > 0 && r.cur / r.max < 0.3, nm = OP_RES[k];
    return `<div class="op-res"><div class="op-res-head"><b title="${esc(nm[1])}">${nm[0]}<small>${esc(nm[1])}</small></b><span class="op-val">${low ? ic('alert', 14) : ''}${r.cur} / ${r.max}</span></div>
      <div class="op-res-top"><button type="button" class="die-btn" data-act="op-res" data-k="${k}" data-d="-1" aria-label="Reduzir ${esc(nm[1])}" ${dis}>${ic('minus', 16)}</button>
      <div class="op-bar${low ? ' low' : ''}" style="--c:${nm[2]}" role="meter" aria-valuemin="0" aria-valuemax="${r.max}" aria-valuenow="${r.cur}" aria-label="${esc(nm[1])}: ${r.cur} de ${r.max}"><i style="width:${pct}%"></i></div>
      <button type="button" class="die-btn" data-act="op-res" data-k="${k}" data-d="1" aria-label="Aumentar ${esc(nm[1])}" ${dis}>${ic('plus', 16)}</button></div>
      <div class="op-res-edit"><label>atual<input type="number" min="0" data-bind="card.resources2.${k}.cur" data-num data-sheet value="${esc(String(r.cur))}" ${dis}></label><label>máximo<input type="number" min="0" data-bind="card.resources2.${k}.max" data-num data-sheet value="${esc(String(r.max))}" ${dis}></label></div></div>`;
  }
  function opBanner(card, edit){
    const id = hub.charToken;
    if(!edit || opSkipped(id)) return '';
    const empty = !(card.skills || []).length && !Object.keys(card.res || {}).length;
    return `<div class="op-banner" role="region" aria-label="Formato da ficha"><p>${empty ? 'Esta ficha ainda está vazia. Quer começar já no formato de Ordem Paranormal?' : 'Este personagem está no formato antigo. Quer migrar para Ordem Paranormal?'}</p>
      <div class="inv-item-actions"><button type="button" class="inv-mini-btn primary" data-act="op-migrate">Migrar</button><button type="button" class="inv-mini-btn" data-act="op-keep">Continuar no formato antigo</button></div>
      ${empty ? '' : '<p class="hub-hint">Nada é apagado: as perícias e os recursos antigos ficam guardados e dá para voltar ao formato antigo.</p>'}</div>`;
  }
  function renderReminders(card, dis){
    return `<div class="hub-label">Lembretes da mesa (patente, o que o grupo quiser)</div>
      ${(card.reminders || []).map((r, i) => `<div class="bonus-row"><input type="text" data-bind="card.reminders.${i}.label" value="${esc(r.label)}" placeholder="Campo" ${dis}>
        <input type="text" data-bind="card.reminders.${i}.value" value="${esc(r.value)}" placeholder="Valor" ${dis}>
        <button type="button" class="inv-mini-btn danger" data-act="rem-del" data-i="${i}" ${dis} aria-label="Remover lembrete">${ic('close', 16)}</button></div>`).join('')}
      <button type="button" class="inv-mini-btn" data-act="rem-add" ${dis}>${ic('plus', 16)} Lembrete</button>`;
  }
  function renderFichaOrdem(h, card, dis){
    const c = cfg(), nexLevel = c.progressionMode !== 'nex_only';
    const A = card.attributes || {}, meta = card.meta || {}, nex = card.nex == null ? 5 : card.nex, lvl = card.level == null ? 1 : card.level;
    let html = `<div class="hub-label">Personagem</div>
      <input type="text" data-bind="card.name" value="${esc(card.name)}" placeholder="Nome do personagem" ${dis}>
      <div class="bonus-row"><input type="text" data-bind="card.meta.class" data-sheet value="${esc(meta.class || '')}" placeholder="Classe" ${dis}><input type="text" data-bind="card.meta.origin" data-sheet value="${esc(meta.origin || '')}" placeholder="Origem" ${dis}></div>
      <div class="bonus-row"><label class="op-fld">NEX<select data-bind="card.nex" data-num data-rerender ${dis}>${OP_NEX.map(n => opt(n, n + '%', nex)).join('')}</select></label>
        ${nexLevel ? `<label class="op-fld">Nível (1 a 20)<input type="number" min="1" max="20" data-bind="card.level" data-num data-sheet value="${esc(String(lvl))}" ${dis}></label>` : ''}</div>
      <input type="text" data-bind="card.player" value="${esc(card.player)}" placeholder="Jogador" ${dis}>
      <div class="op-sum">${esc([meta.class, meta.origin].filter(Boolean).join(' · '))}${(meta.class || meta.origin) ? ' · ' : ''}NEX ${nex}%${nexLevel ? ' · Nível ' + esc(String(lvl)) : ''}</div>`;
    html += `<div class="hub-label">Atributos</div><p class="hub-hint">O valor do atributo é a quantidade de d20 do teste: rola todos e fica o maior. Com atributo 0 rola 2d20 e fica o menor. Treinamento e bônus avulso somam no resultado.</p><div class="op-attrs">${OP_ATTRS.map(a => `<label class="op-attr"><span>${a[1]}</span><input type="number" min="0" max="20" data-bind="card.attributes.${a[0]}" data-num data-sheet value="${esc(String(opNum(A[a[0]])))}" aria-label="${a[2]}" ${dis}></label>`).join('')}</div>`;
    html += `<div class="hub-label">Recursos</div>${opBar(card, 'pv', dis)}${opBar(card, 'pd', dis)}`;
    // perícias
    const rows = Object.keys(card.skillsV2 || {}).map(k => opSkillDef(card, k)).sort((x, y) => x.name.localeCompare(y.name, 'pt-BR'));
    html += `<div class="hub-label">Perícias</div>${rows.map(sd => {
      const p = opParts(card, sd.key, null, 'skill'), tot = opSum(p), pen = p.conds.reduce((a, x) => a + x.value, 0), custom = !!sd.defAttr && sd.attr !== sd.defAttr;
      return `<div class="op-skill"><div class="op-sk-name"><b>${esc(sd.name)}</b><small>${sd.attr ? opAttrLabel(sd.attr) + ' ' + opNum(A[sd.attr]) : 'livre'}${custom ? ' · padrão ' + opAttrLabel(sd.defAttr) : ''}</small></div>
        <span class="op-total" title="${esc(opPoolHelp(p.pool))} + treinamento + bônus${pen ? ' + condições/clima' : ''}"><span class="op-pool${p.pool.low ? ' low' : ''}">${p.pool.label}</span> ${opSgn(tot)}${pen ? '<small>' + opSgn(pen) + (p.conds.some(x => x.weather) ? (p.conds.some(x => !x.weather) ? ' cond.+clima' : ' clima') : ' cond.') + '</small>' : ''}</span>
        <button type="button" class="inv-mini-btn primary op-roll" data-act="op-skill-roll" data-k="${esc(sd.key)}" aria-label="Rolar ${esc(sd.name)} (${p.pool.label})" ${dis}>${ic('dice', 18)}</button>
        <button type="button" class="inv-mini-btn danger op-del" data-act="op-skill-del" data-k="${esc(sd.key)}" aria-label="Remover ${esc(sd.name)}" ${dis}>${ic('close', 16)}</button>
        <div class="op-sk-ctl"><select data-bind="card.skillsV2.${esc(sd.key)}.training" data-rerender aria-label="Treinamento de ${esc(sd.name)}" ${dis}>${Object.keys(OP_TRAIN).map(t => opt(t, OP_TRAIN[t][0], sd.s.training || 'none')).join('')}</select>
        <select class="op-attr-sel${custom ? ' custom' : ''}" data-bind="card.skillsV2.${esc(sd.key)}.attr" data-rerender aria-label="Atributo usado em ${esc(sd.name)}" title="Atributo usado nesta perícia" ${dis}>${sd.attr ? '' : '<option value="" selected>—</option>'}${OP_ATTRS.map(x => opt(x[0], x[1], sd.attr)).join('')}</select>
        <input type="number" class="op-n" data-bind="card.skillsV2.${esc(sd.key)}.bonus" data-num data-sheet value="${esc(String(opNum(sd.s.bonus)))}" aria-label="Bônus avulso de ${esc(sd.name)}" placeholder="Outros" ${dis}></div></div>`;
    }).join('') || '<p class="hub-hint">Nenhuma perícia ainda. Escolha uma da lista, escreva uma livre ou adicione todas.</p>'}
      <datalist id="op-skill-list">${OP_SKILLS.map(s => `<option value="${esc(s[1])}">`).join('')}</datalist>
      <div class="op-add"><input type="text" id="op-skill-new" list="op-skill-list" placeholder="Nova perícia (ex.: Furtividade)" ${dis}><select id="op-skill-attr" aria-label="Atributo da perícia livre" ${dis}><option value="">atributo (se livre)</option>${OP_ATTRS.map(a => `<option value="${a[0]}">${a[1]}</option>`).join('')}</select>
      <button type="button" class="inv-mini-btn" data-act="op-skill-add" ${dis}>${ic('plus', 16)} Nova</button>
      <button type="button" class="inv-mini-btn" data-act="op-skill-all" ${dis}>Adicionar todas as 28</button></div>`;
    // ataques
    const skillOpts = a => OP_SKILLS.map(x => opt(x[0], x[1], a.skill)).join('') + Object.keys(card.skillsV2 || {}).filter(k => k.indexOf('x_') === 0).map(k => opt(k, opSkillDef(card, k).name, a.skill)).join('');
    html += `<div class="hub-label">Ataques</div>${(card.attacks || []).map((a, i) => {
      const p = opParts(card, a.skill || '', a.attribute || '', 'attack'), open = hub.opEdit === a.id, sk = a.skill ? opSkillDef(card, a.skill).name : '';
      const crit = !!(hub.opCrit && hub.opCrit[a.id]);
      return `<div class="op-atk"><div class="op-atk-top"><div><b>${esc(a.name || 'Ataque')}</b><small>${esc(a.damage || '—')} · ${esc(String(a.critMargin || 20))}/×${esc(String(a.critMult || 2))} · ${esc([a.attribute ? opAttrLabel(a.attribute) : '', sk].filter(Boolean).join(' + ') || 'sem perícia')}</small></div>
        <span class="op-total" title="${esc(opPoolHelp(p.pool))} + bônus do ataque"><span class="op-pool${p.pool.low ? ' low' : ''}">${p.pool.label}</span> ${opSgn(opSum(p))}</span></div>
        <div class="inv-item-actions"><button type="button" class="inv-mini-btn primary" data-act="op-atk-roll" data-id="${esc(a.id)}" ${dis}>${ic('dice', 16)} Rolar ataque</button>
          <button type="button" class="inv-mini-btn ${crit ? 'op-crit-btn' : 'primary'}" data-act="op-dmg-roll" data-id="${esc(a.id)}" ${dis}>${ic('dice', 16)} Rolar dano${crit ? ' (crítico ×' + esc(String(a.critMult || 2)) + ')' : ''}</button>
          <button type="button" class="inv-mini-btn" data-act="op-atk-edit" data-id="${esc(a.id)}" aria-expanded="${open}">${open ? 'Fechar' : 'Editar'}</button></div>
        ${open ? `<div class="op-atk-form"><input type="text" data-bind="card.attacks.${i}.name" value="${esc(a.name || '')}" placeholder="Nome" ${dis}>
          <div class="bonus-row"><select data-bind="card.attacks.${i}.attribute" data-rerender aria-label="Atributo" ${dis}><option value="">— atributo —</option>${OP_ATTRS.map(x => opt(x[0], x[1], a.attribute)).join('')}</select>
          <select data-bind="card.attacks.${i}.skill" data-rerender aria-label="Perícia" ${dis}><option value="">— perícia —</option>${skillOpts(a)}</select></div>
          <input type="text" data-bind="card.attacks.${i}.damage" data-sheet value="${esc(a.damage || '')}" placeholder="Dano (ex.: 1d10+2)" ${dis}>
          <div class="bonus-row"><label class="op-fld">Margem de crítico<input type="number" min="2" max="20" data-bind="card.attacks.${i}.critMargin" data-num data-sheet value="${esc(String(a.critMargin || 20))}" ${dis}></label>
          <label class="op-fld">Multiplicador<input type="number" min="2" max="10" data-bind="card.attacks.${i}.critMult" data-num data-sheet value="${esc(String(a.critMult || 2))}" ${dis}></label></div>
          <label class="check-row"><input type="checkbox" data-bind="card.attacks.${i}.addAttrToDamage" ${a.addAttrToDamage ? 'checked' : ''} ${dis}> Somar o atributo ao dano</label>
          <label class="check-row"><input type="checkbox" data-bind="card.attacks.${i}.addTrainingToDamage" ${a.addTrainingToDamage ? 'checked' : ''} ${dis}> Somar o bônus de treinamento ao dano</label>
          <button type="button" class="inv-mini-btn danger" data-act="op-atk-del" data-id="${esc(a.id)}" ${dis}>${ic('close', 16)} Remover ataque</button></div>` : ''}</div>`;
    }).join('') || '<p class="hub-hint">Nenhum ataque ainda.</p>'}
      <button type="button" class="inv-mini-btn" data-act="op-atk-new" ${dis}>${ic('plus', 16)} Novo ataque</button>`;
    // condições
    html += `<div class="hub-label">Condições ativas</div><div class="op-conds">${(card.conditions || []).map(cd => {
      const d = OP_COND[cd.key] || {};
      return `<span class="op-cond">${ic(d.i || 'alert', 14)}<span>${esc(opCondName(cd))}${cd.note && cd.key !== 'outra' ? ' · ' + esc(cd.note) : ''}</span><button type="button" data-act="op-cond-del" data-id="${esc(cd.id)}" aria-label="Remover ${esc(opCondName(cd))}" ${dis}>${ic('close', 14)}</button></span>`;
    }).join('') || '<span class="hub-hint">Nenhuma.</span>'}</div>
      ${(card.conditions || []).filter(cd => OP_COND[cd.key] && OP_COND[cd.key].t).map(cd => `<div class="hub-hint"><b>${esc(OP_COND[cd.key].n)}:</b> ${esc(OP_COND[cd.key].t)}</div>`).join('')}
      <div class="op-add"><select id="op-cond-key" aria-label="Condição" ${dis}>${OP_COND_ORDER.concat(Object.keys(OP_COND).filter(k => !OP_COND_ORDER.includes(k))).map(k => `<option value="${k}">${esc(OP_COND[k].n)}</option>`).join('')}</select>
      <input type="text" id="op-cond-note" placeholder="Observação ou nome" ${dis}><button type="button" class="inv-mini-btn" data-act="op-cond-add" ${dis}>${ic('plus', 16)} Adicionar</button></div>
      <p class="hub-hint">Os modificadores das condições entram sozinhos nas rolagens desta ficha. Condições com o mesmo efeito não se somam: vale a pior. As demais ficam só como marcação.</p>`;
    return html;
  }

  // ---------- eventos do painel ----------
  function bindRoot(name){
    return { rollUI, hub, sf:hub.sessionForm, nc:hub.newCampaign, cd:hub.cfgDraft, rf:hub.recipeForm, card:characters[hub.charToken] || null,
      jf:hub.jf, gv:hub.give, rs:hub.resDraft, sl:hub.slotDraft }[name] || null;
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
    if(t.hasAttribute('data-sheet')) hubDirty = true;      // totais da ficha se refazem quando o campo perde o foco
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
    if(t.dataset && t.dataset.ctn){
      let v = t.type === 'checkbox' ? t.checked : t.value;
      if(['min', 'max', 'cap'].includes(t.dataset.f)) v = v === '' ? (t.dataset.f === 'cap' ? null : 0) : Math.max(0, parseInt(v, 10) || 0);
      setContainerCfg(t.dataset.ctn, { [t.dataset.f]: v });
      return;
    }
    if(t.dataset && t.dataset.act === 'bulk-pick'){ hubAction('bulk-pick', t); return; }
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
      case 'die+': padAdd(D.s === 'F' ? 'F' : Number(D.s), 1); renderHub(); break;
      case 'die-': padAdd(D.s === 'F' ? 'F' : Number(D.s), -1); renderHub(); break;
      case 'term-del': rollUI.terms.splice(+D.i, 1); renderHub(); break;
      case 'mod-add': addModifier(); renderHub(); break;
      case 'mod-del': { const t = rollUI.terms[+D.i]; if(t){ delete t[D.k]; } renderHub(); break; }
      case 'preset-adv': rollUI.terms = [{ sign:1, n:2, sides:20, kh:1 }]; rollUI.modTerm = 0; renderHub(); break;
      case 'preset-dis': rollUI.terms = [{ sign:1, n:2, sides:20, kl:1 }]; rollUI.modTerm = 0; renderHub(); break;
      case 'roll-clear': rollUI.terms = []; rollUI.bonuses = []; rollUI.expr = ''; rollUI.modTerm = 0; renderHub(); break;
      case 'bonus-add': rollUI.bonuses.push({ label:'', value:0 }); renderHub(); break;
      case 'bonus-del': rollUI.bonuses.splice(+D.i, 1); renderHub(); break;
      case 'expr-apply': if(applyExpr()) renderHub(); break;
      case 'roll': doRoll(); break;
      case 'roll-copy': if(rollUI.last) copyText(rollText(rollUI.last)); break;
      case 'sc-save': saveShortcut(); break;
      case 'sc-use': { const sc = findShortcut(el); if(sc){ useShortcut(sc); renderHub(); } break; }
      case 'sc-roll': { const sc = findShortcut(el); if(sc){ useShortcut(sc); doRoll(); } break; }
      case 'sc-move': { const sc = findShortcut(el); if(sc) moveShortcut(sc); break; }
      case 'sc-del': { const sc = findShortcut(el); if(sc){ DB.set(scPath(sc), null); } break; }
      case 'rem-add': ensureCard(hub.charToken).reminders = (characters[hub.charToken].reminders || []).concat([{ label:'', value:'' }]); scheduleSaveCard(); renderHub(); break;
      case 'rem-del': characters[hub.charToken].reminders.splice(+D.i, 1); scheduleSaveCard(); renderHub(); break;
      case 'skill-add': ensureCard(hub.charToken).skills = (characters[hub.charToken].skills || []).concat([{ name:'', bonus:0 }]); scheduleSaveCard(); renderHub(); break;
      case 'skill-del': characters[hub.charToken].skills.splice(+D.i, 1); scheduleSaveCard(); renderHub(); break;
      case 'skill-use': { const s = characters[hub.charToken].skills[+D.i]; rollUI.skill = s.name; rollUI.bonuses = Number(s.bonus) ? [{ label:s.name, value:Number(s.bonus) }] : []; rollUI.who = hub.charToken; hub.tab = 'dados'; renderHub(); break; }
      case 'op-migrate': opMigrate(); break;
      case 'op-keep': opSkip(hub.charToken); break;
      case 'op-revert': opRevert(); break;
      case 'op-skill-roll': opRollSkill(D.k); break;
      case 'op-skill-del': opDelSkill(D.k); break;
      case 'op-skill-add': opAddSkill((hubBody.querySelector('#op-skill-new') || {}).value, (hubBody.querySelector('#op-skill-attr') || {}).value, false); break;
      case 'op-skill-all': opAddSkill('', '', true); break;
      case 'op-atk-new': opNewAttack(); break;
      case 'op-atk-edit': hub.opEdit = hub.opEdit === D.id ? null : D.id; renderHub(); break;
      case 'op-atk-del': opDelAttack(D.id); break;
      case 'op-atk-roll': opRollAttack(D.id); break;
      case 'op-dmg-roll': opRollDamage(D.id); break;
      case 'op-cond-add': opAddCondition(); break;
      case 'op-cond-del': opDelCondition(D.id); break;
      case 'op-res': opAdjustRes(D.k, +D.d); break;
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
      case 'camp-code-gen': setJoinCode(D.id, false); break;
      case 'camp-code-new': setJoinCode(D.id, true); break;
      case 'camp-code-copy': copyJoinCode(D.id); break;
      case 'claim': claimMaster(); break;
      case 'cfg-save': saveConfig(); break;
      case 'pl-test': plTest(); break;
      case 'clock': advanceClock(+D.m); break;
      case 'pin-go': { const p = pins.find(x => x.id === D.id); if(p){ map.flyTo([p.lat, p.lng], Math.max(map.getZoom(), 16)); closeHub(); } break; }
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
      case 'close-hub': closeHub(); break;
      case 'weather-open': closeHub(); openWeatherPopover(); break;
      case 'grp-sheet': hub.charToken = D.id; hub.tab = 'ficha'; renderHub(); break;
      case 'dj-add': {
        const f = hub.jf;
        if(!(f.text || '').trim() && !(f.title || '').trim()){ toast('Escreva algo para salvar.', true); break; }
        addJournal({ type:f.type, title:(f.title || '').trim(), text:(f.text || '').trim(), vis:isMaster() ? f.vis : 'grupo', status:f.type === 'objetivo' ? 'aberto' : undefined })
          .then(ok => { if(ok){ hub.jf.title = ''; hub.jf.text = ''; toast('Salvo no diário.'); renderHub(); } });
        break;
      }
      case 'dj-del': { const e = (D.vis === 'mestre' ? gmJournal : journal)[D.id]; if(e) removeJournal(e); break; }
      case 'obj-set': { const e = (D.vis === 'mestre' ? gmJournal : journal)[D.id]; if(e && canEditEntry(e)) DB.set(scopedKey(D.vis === 'mestre' ? KEY_GMJ : KEY_JOURNAL) + '/' + D.id + '/status', D.s); break; }
      case 'res': { const r = cfg().resources.find(x => x.key === D.k); if(!r) break; const c = ensureCard(hub.charToken); c.res = c.res || {};
        let v = resVal(c, r) + (+D.d); v = Math.max(0, r.max ? Math.min(r.max, v) : v); c.res[r.key] = v; scheduleSaveCard(); renderHub(); break; }
      case 'res-add': hub.resDraft.push({ key:'', label:'', max:0 }); renderHub(); break;
      case 'res-del': hub.resDraft.splice(+D.i, 1); renderHub(); break;
      case 'res-seed': [['pv', 'PV'], ['pd', 'PD']].forEach(x => { if(!hub.resDraft.some(r => r.key === x[0])) hub.resDraft.push({ key:x[0], label:x[1], max:0 }); }); renderHub(); break;
      case 'res-save': saveResources(); break;
      case 'slots-save': saveSlots(); break;
      case 'give': giveItem(); break;
      case 'bulk-apply': bulkNeeds(); break;
      case 'bulk-pick': { const i = hub.bulkPick.indexOf(D.id); if(el.checked && i < 0) hub.bulkPick.push(D.id); if(!el.checked && i >= 0) hub.bulkPick.splice(i, 1); break; }
      case 'backup-export': exportBackup(); break;
      case 'backup-import': importBackup(); break;
    }
  }

  // ---------- mapa tático ----------
  // Uma cena é uma imagem (ou uma grade em branco) com tokens que andam de casa em casa.
  // Dados: KEY_TAC (cenas + tokens públicos), KEY_TACIMG (imagens enviadas do celular, lidas só
  // ao abrir a cena) e KEY_GMTAC (tokens ocultos: só o mestre recebe, se as regras v3 estiverem publicadas).
  // Valores de regra (metros por casa, deslocamento, diagonal) são padrões PROVISÓRIOS e configuráveis:
  // nada aqui afirma uma regra oficial; confirme com a sua mesa.
  const TAC_KINDS = { pc:['Personagem', '#8fd7e8'], npc:['Aliado / NPC', '#7fb98a'], enemy:['Inimigo', '#d3572a'], obj:['Objeto', '#c9a15a'] };
  const TAC_DIAG = [['cheb', 'Diagonal custa 1 casa'], ['alt', 'Diagonal alterna 1 e 2 casas'], ['eucl', 'Linha reta (arredonda para cima)']];
  const TAC_LIMIT = [['warn', 'Só avisar ao passar do limite'], ['block', 'Bloquear jogadores além do limite'], ['off', 'Sem limite']];
  const TAC_DEF = { size:64, mpc:1.5, diag:'cheb', limit:'warn', speed:6, cols:14, rows:10 };
  const tacUI = { open:false, sid:null, sel:null, panel:'', ruler:false, pts:[], gd:null, drag:false, dirty:false, seen:false, nfSrc:'blank', imgCache:{}, last:null, focusTok:null, markers:{}, bannerOff:null };
  let tacMap = null, tacBase = null, tacGridLayer = null, tacTokLayer = null, tacRulerLayer = null, tacBuiltKey = '';
  const tacEl = id => document.getElementById(id);
  // escapa também aspas (usado dentro de atributos) e preserva o número 0
  function tacX(v){ return String(v == null ? '' : v).replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c])); }
  function tacPath(){ return scopedKey(KEY_TAC); }
  function tacReset(){
    tac = { active:null, scenes:{} }; gmTac = {};
    tacUI.sid = null; tacUI.sel = null; tacUI.panel = ''; tacUI.ruler = false; tacUI.pts = []; tacUI.gd = null; tacUI.seen = false; tacUI.imgCache = {}; tacUI.last = null; tacBuiltKey = ''; tacUI.bannerOff = null;
    tacRenderArea();
    if(tacUI.open){ tacRender(); tacBuild(true); }
  }
  function tacNum(v, d){ const n = parseFloat(v); return isFinite(n) ? n : d; }
  // cena com padrões aplicados (não grava nada)
  function tacScene(sid){
    const s = sid && tac.scenes ? tac.scenes[sid] : null;
    if(!s) return null;
    const g = Object.assign({ size:TAC_DEF.size, mpc:TAC_DEF.mpc, ox:0, oy:0, diag:TAC_DEF.diag, show:true }, s.grid || {});
    g.size = Math.max(4, tacNum(g.size, TAC_DEF.size)); g.mpc = tacNum(g.mpc, TAC_DEF.mpc); g.ox = tacNum(g.ox, 0); g.oy = tacNum(g.oy, 0);
    const r = Object.assign({ limit:TAC_DEF.limit, speed:TAC_DEF.speed, lock:false }, s.rule || {});
    r.speed = Math.max(0, tacNum(r.speed, TAC_DEF.speed));
    const t = s.turn || {};
    const order = Array.isArray(t.order) ? t.order : (t.order && typeof t.order === 'object' ? Object.keys(t.order).map(k => t.order[k]) : []);
    return Object.assign({}, s, { id:sid, w:tacNum(s.w, 1000), h:tacNum(s.h, 800), grid:g, rule:r, turn:{ on:!!t.on, order:order.filter(Boolean), i:Math.max(0, parseInt(t.i, 10) || 0), round:Math.max(1, parseInt(t.round, 10) || 1) } });
  }
  function tacCurId(){
    if(isMaster() && tacUI.sid && tac.scenes[tacUI.sid]) return tacUI.sid;
    if(tac.active && tac.scenes[tac.active]) return tac.active;
    return isMaster() ? (Object.keys(tac.scenes)[0] || null) : null;
  }
  function tacTokensOf(sid){
    const s = tac.scenes[sid] || {}, out = [];
    const pub = s.tokens || {};
    Object.keys(pub).forEach(k => { if(pub[k] && pub[k].c != null) out.push(Object.assign({}, pub[k], { id:k, hidden:false })); });
    if(isMaster()){ const h = gmTac[sid] || {}; Object.keys(h).forEach(k => { if(h[k] && h[k].c != null) out.push(Object.assign({}, h[k], { id:k, hidden:true })); }); }
    return out;
  }
  function tacTokPath(sid, t){ return (t.hidden ? scopedKey(KEY_GMTAC) + '/' + sid : tacPath() + '/scenes/' + sid + '/tokens') + '/' + t.id; }
  function tacCanMove(t){ return isMaster() || (!!currentUser && t.owner === currentUser.uid); }
  function tacSpeed(sc, t){ return (t && t.speed != null && t.speed !== '' && isFinite(+t.speed)) ? +t.speed : sc.rule.speed; }
  function tacTurnId(sc){ return sc && sc.turn.on && sc.turn.order.length ? sc.turn.order[sc.turn.i % sc.turn.order.length] : null; }
  function tacMoveTxt(sc, t){ return (+t.mv || 0) + '/' + tacSpeed(sc, t) + ' casas'; }
  function tacDist(c1, r1, c2, r2, mode){
    const dx = Math.abs(c2 - c1), dy = Math.abs(r2 - r1), mx = Math.max(dx, dy), mn = Math.min(dx, dy);
    if(mode === 'alt') return mx + Math.floor(mn / 2);
    if(mode === 'eucl') return Math.ceil(Math.sqrt(dx * dx + dy * dy));
    return mx;
  }
  // geometria: a cena usa pixels da imagem (x → direita, y → baixo); o Leaflet usa [lat=h−y, lng=x]
  function tacCenter(sc, c, r){ const g = sc.grid; return L.latLng(sc.h - (g.oy + (r + 0.5) * g.size), g.ox + (c + 0.5) * g.size); }
  function tacClampCell(sc, c, r, g){
    g = g || sc.grid;
    const cMin = Math.ceil(-g.ox / g.size - 0.5), cMax = Math.floor((sc.w - g.ox) / g.size - 0.5);
    const rMin = Math.ceil(-g.oy / g.size - 0.5), rMax = Math.floor((sc.h - g.oy) / g.size - 0.5);
    return { c:Math.min(Math.max(cMin, cMax), Math.max(cMin, c)), r:Math.min(Math.max(rMin, rMax), Math.max(rMin, r)) };
  }
  function tacCellAt(sc, ll, g){
    g = g || sc.grid;
    return tacClampCell(sc, Math.floor((ll.lng - g.ox) / g.size), Math.floor((sc.h - ll.lat - g.oy) / g.size), g);
  }
  function tacFreeCell(sid, sc, used){
    let c0 = 0, r0 = 0;
    if(tacMap){ const cc = tacCellAt(sc, tacMap.getCenter()); c0 = cc.c; r0 = cc.r; }
    for(let d = 0; d < 14; d++) for(let dc = -d; dc <= d; dc++) for(let dr = -d; dr <= d; dr++){
      if(Math.max(Math.abs(dc), Math.abs(dr)) !== d) continue;
      const cell = tacClampCell(sc, c0 + dc, r0 + dr);
      if(!used.has(cell.c + ',' + cell.r)) return cell;
    }
    return tacClampCell(sc, c0, r0);
  }

  // ---------- imagens ----------
  function tacLoadImg(url){
    return new Promise((res, rej) => { const i = new Image(); i.onload = () => res({ w:i.naturalWidth, h:i.naturalHeight }); i.onerror = () => rej(new Error('Não consegui abrir a imagem desse endereço.')); i.src = url; });
  }
  // reduz a foto do celular (lado maior ≤ 1600 px, JPEG) para caber no banco sem pesar
  function tacFileToData(file){
    return new Promise((resolve, reject) => {
      const fr = new FileReader();
      fr.onerror = () => reject(new Error('Não consegui ler o arquivo.'));
      fr.onload = () => {
        const img = new Image();
        img.onerror = () => reject(new Error('Esse arquivo não parece ser uma imagem.'));
        img.onload = () => {
          let max = 1600, q = 0.78, out = '', w = 0, h = 0;
          for(let n = 0; n < 6; n++){
            const k = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight));
            w = Math.max(1, Math.round(img.naturalWidth * k)); h = Math.max(1, Math.round(img.naturalHeight * k));
            const cv = document.createElement('canvas'); cv.width = w; cv.height = h;
            const cx = cv.getContext('2d'); cx.fillStyle = '#0f1a22'; cx.fillRect(0, 0, w, h); cx.drawImage(img, 0, 0, w, h);
            out = cv.toDataURL('image/jpeg', q);
            if(out.length < 1100000) break;
            max = Math.round(max * 0.8); q = Math.max(0.5, q - 0.06);
          }
          resolve({ data:out, w, h });
        };
        img.src = fr.result;
      };
      fr.readAsDataURL(file);
    });
  }
  async function tacImageUrl(sid, sc){
    if(!sc.src || sc.src.kind === 'blank' || !sc.src.kind) return null;
    if(sc.src.kind === 'url') return sc.src.url || null;
    if(tacUI.imgCache[sid]) return tacUI.imgCache[sid];
    const d = await DB.get(scopedKey(KEY_TACIMG) + '/' + sid + '/d');
    if(d) tacUI.imgCache[sid] = d;
    return d || null;
  }

  // ---------- mapa (Leaflet em coordenadas simples) ----------
  function tacInitMap(){
    if(tacMap) return;
    tacMap = L.map('tac-map', { crs:L.CRS.Simple, zoomSnap:0.25, zoomDelta:0.5, minZoom:-4, maxZoom:3, attributionControl:false, zoomControl:false, doubleClickZoom:false });
    tacMap.createPane('tacBase').style.zIndex = 200;
    L.control.zoom({ position:'topright', zoomInText:'+', zoomOutText:'−' }).addTo(tacMap);
    tacGridLayer = L.layerGroup().addTo(tacMap);
    tacRulerLayer = L.layerGroup().addTo(tacMap);
    tacTokLayer = L.layerGroup().addTo(tacMap);
    tacMap.on('zoomend', () => tacDrawTokens());
    tacMap.on('click', e => {
      if(tacUI.ruler){ tacRulerPoint(e.latlng); return; }
      if(tacUI.sel){ tacUI.sel = null; if(tacUI.panel === 'token') tacUI.panel = ''; tacDrawTokens(); tacRenderSheet(); }
    });
  }
  function tacClearBase(){
    if(tacBase && tacMap){ tacMap.removeLayer(tacBase); }
    tacBase = null;
  }
  async function tacBuild(force){
    if(!tacUI.open || !tacMap) return;
    const sid = tacCurId(), sc = tacScene(sid), empty = tacEl('tac-empty');
    if(!sc){
      tacClearBase(); tacBuiltKey = '';
      tacGridLayer.clearLayers(); tacTokLayer.clearLayers(); tacRulerLayer.clearLayers();
      empty.hidden = false;
      empty.textContent = isMaster() ? 'Nenhuma cena ainda. Toque em “Cenas” para criar a primeira.' : 'O mestre ainda não ativou uma cena tática.';
      return;
    }
    empty.hidden = true;
    const key = sid + '|' + JSON.stringify(sc.src || {}) + '|' + sc.w + 'x' + sc.h;
    if(force || key !== tacBuiltKey){
      tacBuiltKey = key;
      tacClearBase();
      if(sc.src && sc.src.kind && sc.src.kind !== 'blank'){ empty.hidden = false; empty.textContent = 'Carregando a cena…'; }
      const bounds = L.latLngBounds([[0, 0], [sc.h, sc.w]]);
      let url = null;
      try{ url = await tacImageUrl(sid, sc); }catch(e){ url = null; }
      if(tacBuiltKey !== key || !tacUI.open) return;      // a cena mudou enquanto a imagem carregava
      empty.hidden = true;
      if(url) tacBase = L.imageOverlay(url, bounds, { pane:'tacBase', interactive:false }).addTo(tacMap);
      else {
        tacBase = L.rectangle(bounds, { pane:'tacBase', color:'#26333d', weight:2, fillColor:'#0f1a22', fillOpacity:1, interactive:false }).addTo(tacMap);
        if(sc.src && sc.src.kind && sc.src.kind !== 'blank') toast('Não foi possível carregar a imagem da cena. Mostrando só a grade.', true);
      }
      tacMap.invalidateSize();
      tacMap.setMaxBounds(bounds.pad(0.6));
      tacMap.fitBounds(bounds, { animate:false });
      tacMap.setMinZoom(tacMap.getZoom() - 1.5);
      tacUI.pts = []; tacRulerLayer.clearLayers();
    }
    tacDrawGrid(); tacDrawTokens(); tacRenderTurn(); tacRenderTitle();
  }
  function tacDrawGrid(){
    if(!tacGridLayer) return;
    tacGridLayer.clearLayers();
    const sc = tacScene(tacCurId());
    if(!sc) return;
    const editing = tacUI.panel === 'grid' && tacUI.gd;
    const g = editing ? Object.assign({}, sc.grid, tacUI.gd) : sc.grid;
    if(g.show === false && !editing) return;
    const sz = Math.max(4, tacNum(g.size, 64)), ox = ((tacNum(g.ox, 0) % sz) + sz) % sz, oy = ((tacNum(g.oy, 0) % sz) + sz) % sz;
    if(sc.w / sz > 400 || sc.h / sz > 400) return;
    const lines = [];
    for(let x = ox; x <= sc.w + 0.01; x += sz) lines.push([[0, x], [sc.h, x]]);
    for(let y = oy; y <= sc.h + 0.01; y += sz) lines.push([[sc.h - y, 0], [sc.h - y, sc.w]]);
    L.polyline(lines, { color:'#8fd7e8', weight:1, opacity:editing ? 0.75 : 0.32, interactive:false, noClip:true }).addTo(tacGridLayer);
  }
  // imagem do token do mapa geográfico (ou NPC) ligado a este token tático; acompanha o original
  function tacImgOf(t){
    if(!t || !t.mapTokenId) return '';
    const o = tokens.find(x => x.id === t.mapTokenId) || pins.find(x => x.id === t.mapTokenId && x.type === 'npc');
    const im = o && o.image;
    return (typeof im === 'string' && /^(data:image\/|https?:|\.?\/?[\w\-./]+\.(png|jpe?g|gif|webp|svg)$)/i.test(im)) ? im : '';
  }
  let tacImgSig = '';
  function tacImgSigNow(){
    const sc = tacScene(tacCurId()); if(!sc) return '';
    return tacTokensOf(tacCurId()).map(t => { const im = tacImgOf(t); return t.id + ':' + im.length + ':' + im.slice(-24); }).join('|');
  }
  mapEntitiesHook = () => { if(typeof tacUI === 'undefined' || !tacUI.open) return; const s = tacImgSigNow(); if(s !== tacImgSig){ tacImgSig = s; tacDrawTokens(); } };
  function tacDrawTokens(){
    if(!tacTokLayer) return;
    tacImgSig = tacImgSigNow();
    if(tacUI.drag){ tacUI.dirty = true; return; }
    // o redesenho recria os marcadores: devolve o foco ao token que o tinha (teclado e leitor de tela)
    const fe0 = document.activeElement;
    if(fe0 && !tacUI.focusTok){ const fid = Object.keys(tacUI.markers).find(k => tacUI.markers[k].getElement() === fe0); if(fid) tacUI.focusTok = fid; }
    tacTokLayer.clearLayers();
    tacUI.markers = {};
    tacUI.dirty = false;
    const sid = tacCurId(), sc = tacScene(sid);
    if(!sc) return;
    const px = Math.max(30, Math.round(sc.grid.size * Math.pow(2, tacMap.getZoom()) * 0.92));
    const cur = tacTurnId(sc), seen = {};
    tacTokensOf(sid).forEach(t => {
      const c = Math.round(+t.c), r = Math.round(+t.r), k = c + ',' + r, n = (seen[k] = (seen[k] || 0) + 1), off = (n - 1) * 9;
      const col = t.color || (TAC_KINDS[t.kind] || TAC_KINDS.obj)[1];
      const over = sc.rule.limit !== 'off' && (+t.mv || 0) > tacSpeed(sc, t);
      const label = tacX(String(t.em || t.name || '?').slice(0, 2).toUpperCase());
      const img = tacImgOf(t);
      const cls = 'tac-tok' + (img ? ' has-img' : '') + (t.hidden ? ' hid' : '') + (tacUI.sel === t.id ? ' sel' : '') + (cur === t.id ? ' turn' : '') + (over ? ' over' : '');
      const icon = L.divIcon({ className:'', iconSize:[px, px], iconAnchor:[px / 2 - off, px / 2 - off],
        html:`<div class="${cls}" style="width:${px}px;height:${px}px;--tc:${tacX(col)};font-size:${Math.round(px * 0.36)}px">${img ? `<img src="${tacX(img)}" alt="">` : `<span>${label}</span>`}</div><span class="tac-nm">${tacX(String(t.name || '').split(/\s+/)[0])}${t.hidden ? ' · oculto' : ''}</span>` });
      const kname = (TAC_KINDS[t.kind] || TAC_KINDS.obj)[0], aria = `${t.name || 'Token'}, ${kname}${t.hidden ? ', oculto' : ''}${cur === t.id ? ', vez atual' : ''}, coluna ${c + 1}, linha ${r + 1}`;
      const m = L.marker(tacCenter(sc, c, r), { icon, draggable:tacCanMove(t), keyboard:true, title:aria, zIndexOffset:cur === t.id ? 500 : (tacUI.sel === t.id ? 300 : 0) });
      m.on('click', ev => { L.DomEvent.stopPropagation(ev); if(tacUI.ruler){ tacRulerPoint(m.getLatLng()); return; } tacSelect(t.id); });
      m.on('dragstart', () => { tacUI.drag = true; });
      m.on('dragend', ev => { tacUI.drag = false; tacDrop(sid, t, ev.target.getLatLng()); });
      m.addTo(tacTokLayer);
      tacUI.markers[t.id] = m;
      const el = m.getElement();
      if(el){
        el.setAttribute('aria-label', aria);
        el.addEventListener('keydown', ev => {
          if(ev.key === 'Enter' || ev.key === ' '){ ev.preventDefault(); ev.stopPropagation(); tacSelect(t.id); return; }
          const dir = { ArrowLeft:[-1, 0], ArrowRight:[1, 0], ArrowUp:[0, -1], ArrowDown:[0, 1] }[ev.key];
          if(!dir) return;
          ev.preventDefault(); ev.stopPropagation();
          if(tacCanMove(t)){ tacUI.focusTok = t.id; tacMoveTo(sid, t, { c:Math.round(+t.c) + dir[0], r:Math.round(+t.r) + dir[1] }).then(ok => { if(!ok) tacUI.focusTok = null; }); }
        });
      }
    });
    if(tacUI.focusTok && tacUI.markers[tacUI.focusTok]){ const fe = tacUI.markers[tacUI.focusTok].getElement(); if(fe) fe.focus({ preventScroll:true }); }
    tacUI.focusTok = null;
  }
  // move um token para uma célula, aplicando as regras de deslocamento; devolve true se gravou
  async function tacMoveTo(sid, t, cell){
    const sc = tacScene(sid);
    if(!sc) return false;
    cell = tacClampCell(sc, cell.c, cell.r);
    const c0 = Math.round(+t.c), r0 = Math.round(+t.r);
    const d = tacDist(c0, r0, cell.c, cell.r, sc.grid.diag);
    if(!d) return false;
    const f = weatherTerrainFactor(), master = isMaster(), used = (+t.mv || 0) + d * f, sp = tacSpeed(sc, t);   // clima com terreno difícil: cada casa custa 2
    if(!master && sc.turn.on && sc.rule.lock && tacTurnId(sc) !== t.id){ toast('Ainda não é a vez deste token.', true); return false; }
    if(!master && sc.rule.limit === 'block' && used > sp){ toast(`Passa do deslocamento: ${used} de ${sp} casas.`, true); return false; }
    if(sc.rule.limit !== 'off' && used > sp) toast(`Deslocamento acima do limite: ${used} de ${sp} casas.`, true);
    const p = tacTokPath(sid, t);
    tacUI.last = { sid, id:t.id, c:c0, r:r0, mv:+t.mv || 0 };
    const ok = await DB.update({ [p + '/c']:cell.c, [p + '/r']:cell.r, [p + '/mv']:used });
    if(!ok){ tacUI.last = null; toast(master ? 'Não foi possível mover (as regras do Firebase v3 já foram publicadas?).' : 'Não foi possível mover. Avise o mestre.', true); }
    tacRenderBar();
    return ok;
  }
  async function tacDrop(sid, t, ll){
    const sc = tacScene(sid);
    if(sc) await tacMoveTo(sid, t, tacCellAt(sc, ll));
    tacDrawTokens();
  }
  async function tacUndo(){
    const l = tacUI.last, t = l && tacTokensOf(l.sid).find(x => x.id === l.id);
    if(!l || !t || !tacCanMove(t)){ tacUI.last = null; tacRenderBar(); return; }
    const p = tacTokPath(l.sid, t);
    tacUI.last = null;
    const ok = await DB.update({ [p + '/c']:l.c, [p + '/r']:l.r, [p + '/mv']:l.mv });
    toast(ok ? 'Movimento desfeito.' : 'Não foi possível desfazer.', !ok);
    tacRenderBar(); tacDrawTokens();
  }
  function tacSelect(id){ tacUI.sel = id; tacUI.panel = 'token'; tacDrawTokens(); tacRenderSheet(); }

  // ---------- régua (só local: não é gravada) ----------
  function tacRulerPoint(ll){
    const sc = tacScene(tacCurId());
    if(!sc) return;
    if(tacUI.pts.length >= 2) tacUI.pts = [];
    tacUI.pts.push(tacCellAt(sc, ll));
    tacDrawRuler();
  }
  function tacRulerText(){
    const sc = tacScene(tacCurId());
    if(!sc || !tacUI.ruler) return '';
    const p = tacUI.pts;
    if(p.length < 2) return p.length ? 'Régua: toque no ponto final' : 'Régua: toque no ponto inicial';
    const d = tacDist(p[0].c, p[0].r, p[1].c, p[1].r, sc.grid.diag);
    return `Régua: ${d} casa${d === 1 ? '' : 's'} · ${fmtNum(d * sc.grid.mpc)} m`;
  }
  function tacDrawRuler(){
    if(!tacRulerLayer) return;
    tacRulerLayer.clearLayers();
    const sc = tacScene(tacCurId());
    if(sc && tacUI.ruler){
      const ll = tacUI.pts.map(p => tacCenter(sc, p.c, p.r));
      ll.forEach(x => L.circleMarker(x, { radius:6, color:'#e0c23c', weight:2, fillOpacity:0.7, interactive:false }).addTo(tacRulerLayer));
      if(ll.length === 2) L.polyline(ll, { color:'#e0c23c', weight:3, dashArray:'6 6', interactive:false }).addTo(tacRulerLayer);
    }
    const chip = tacEl('tac-chip'), txt = tacRulerText();
    chip.hidden = !txt; chip.textContent = txt;
  }

  // ---------- telas ----------
  function tacRender(){ tacRenderTitle(); tacRenderBar(); tacRenderTurn(); tacRenderSheet(); }
  function tacRenderTitle(){
    const sid = tacCurId(), sc = tacScene(sid);
    tacEl('tac-title').textContent = sc ? (sc.name || 'Cena') : 'Mapa tático';
    const wx = weatherTerrainFactor() > 1 ? ' · ' + weatherDef().label + ': terreno difícil (casa custa 2)' : '';
    tacEl('tac-sub').textContent = !sc ? '' : (tac.active === sid ? 'Cena ativa para o grupo' : 'Prévia: o grupo não está vendo esta cena') + wx;
  }
  const tacSvg = p => `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>`;
  const TAC_IC = {
    ruler:'<path d="M3 17L17 3l4 4L7 21z"/><path d="M7 13l2 2M10 10l2 2M13 7l2 2"/>',
    center:'<circle cx="12" cy="12" r="3"/><path d="M12 2v5M12 17v5M2 12h5M17 12h5"/>',
    add:'<path d="M12 5v14M5 12h14"/>',
    combat:'<path d="M4 20L16 8M14 4h6v6M20 20L8 8M10 4H4v6"/>',
    scene:'<path d="M12 3l9 5-9 5-9-5z"/><path d="M3 13l9 5 9-5"/>',
    dice:'<rect x="4" y="4" width="16" height="16" rx="3"/><circle cx="9" cy="9" r="1"/><circle cx="15" cy="9" r="1"/><circle cx="9" cy="15" r="1"/><circle cx="15" cy="15" r="1"/>',
    arrow:'<path d="M12 19V5M5 12l7-7 7 7"/>'
  };
  function tacRenderBar(){
    const m = isMaster(), pn = tacUI.panel;
    const b = (a, ic, lb, on, pressed) => `<button type="button" class="tac-b${on ? ' on' : ''}" data-tac="${a}"${pressed ? ` aria-pressed="${!!on}"` : ''}>${tacSvg(TAC_IC[ic])}${lb}</button>`;
    let h = b('ruler', 'ruler', 'Régua', tacUI.ruler, true) + b('center', 'center', 'Centro') + b('panel-add', 'add', m ? 'Token' : 'Meu token', pn === 'add');
    if(m) h += b('panel-combat', 'combat', 'Combate', pn === 'combat') + b('panel-scenes', 'scene', 'Cena', pn === 'scenes' || pn === 'new' || pn === 'grid');
    h += b('dice', 'dice', 'Dados');
    tacEl('tac-bar').innerHTML = h;
    const u = tacEl('tac-undo');
    if(u) u.hidden = !(tacUI.last && tacCurId() === tacUI.last.sid);
  }
  // atalho do menu Áreas e aviso de cena ativa na tela do mapa
  function tacRenderArea(){
    const sc = tac.active && tac.scenes[tac.active] ? tac.scenes[tac.active] : null;
    if(typeof hudTacLive === 'function') hudTacLive(sc);
    if(typeof hudDockSync === 'function') hudDockSync();
    const bn = tacEl('tac-banner');
    if(!bn) return;
    const show = !!sc && !tacUI.open && tacUI.bannerOff !== tac.active;
    bn.hidden = !show;
    if(show) tacEl('tac-banner-name').textContent = sc.name || 'Cena';
  }
  function tacRenderTurn(){
    const el = tacEl('tac-turn'), sid = tacCurId(), sc = tacScene(sid);
    if(!sc || !sc.turn.on){ el.hidden = true; return; }
    const id = tacTurnId(sc), t = tacTokensOf(sid).find(x => x.id === id);
    el.hidden = false;
    el.innerHTML = `<span>${ic('swords', 14)} Rodada <b>${sc.turn.round}</b> · Vez de <b>${tacX(t ? t.name : '—')}</b>${t ? ' · ' + tacX(tacMoveTxt(sc, t)) : ''}</span>` + (isMaster() ? '<button type="button" class="inv-mini-btn primary" data-tac="next">Próximo ▶</button>' : '');
  }
  function tacSh(title, sub){ return `<div class="tac-sh"><div><b>${tacX(title)}</b>${sub ? `<small>${tacX(sub)}</small>` : ''}</div><button type="button" class="tac-x" data-tac="close-sheet" aria-label="Fechar painel">×</button></div>`; }
  function tacStep(label, k, v, ds){
    return `<div class="tac-step"><span>${label}</span><div>${ds.slice().reverse().map(d => `<button type="button" class="inv-mini-btn" data-tac="g-step" data-k="${k}" data-d="${-d}">−${d}</button>`).join('')}<input type="number" id="tg-${k}" data-tac-ch="g" value="${tacX(v)}">${ds.map(d => `<button type="button" class="inv-mini-btn" data-tac="g-step" data-k="${k}" data-d="${d}">+${d}</button>`).join('')}</div></div>`;
  }
  function tacSel(id, list, cur, ch){ return `<select id="${id}"${ch ? ` data-tac-ch="${ch}"` : ''}>${list.map(x => opt(x[0], x[1], cur)).join('')}</select>`; }
  function tacRenderSheet(){
    const sh = tacEl('tac-sheet');
    if(!sh) return;
    const sid = tacCurId(), sc = tacScene(sid), m = isMaster();
    let p = tacUI.panel;
    if(['scenes', 'new', 'grid', 'combat'].includes(p) && !m) p = tacUI.panel = '';
    if(p === 'token' && !(sc && tacTokensOf(sid).some(t => t.id === tacUI.sel))) p = tacUI.panel = '';
    if(!p){ sh.hidden = true; sh.innerHTML = ''; return; }
    let h = '';
    if(p === 'scenes') h = tacPanelScenes();
    else if(p === 'new') h = tacPanelNew();
    else if(!sc) h = tacSh('Mapa tático') + '<div class="inv-empty">Crie ou ative uma cena primeiro.</div>';
    else if(p === 'token') h = tacPanelToken(sid, sc);
    else if(p === 'add') h = tacPanelAdd(sid, sc);
    else if(p === 'grid') h = tacPanelGrid(sid, sc);
    else if(p === 'combat') h = tacPanelCombat(sid, sc);
    const ae = document.activeElement;
    let fk = null;
    if(ae && sh.contains(ae) && ae.dataset && ae.dataset.tac) fk = { a:ae.dataset.tac, dc:ae.dataset.dc, dr:ae.dataset.dr, id:ae.dataset.id };
    sh.innerHTML = h; sh.hidden = false; sh.dataset.p = p;
    if(fk){ const nb = Array.from(sh.querySelectorAll('[data-tac]')).find(x => x.dataset.tac === fk.a && x.dataset.dc === fk.dc && x.dataset.dr === fk.dr && x.dataset.id === fk.id); if(nb) nb.focus({ preventScroll:true }); }
  }
  function tacPanelToken(sid, sc){
    const t = tacTokensOf(sid).find(x => x.id === tacUI.sel), m = isMaster(), mine = tacCanMove(t);
    const kinfo = TAC_KINDS[t.kind] || TAC_KINDS.obj;
    let h = tacSh(t.name || 'Token', `${kinfo[0]} · coluna ${Math.round(+t.c) + 1}, linha ${Math.round(+t.r) + 1}` + (t.hidden ? ' · oculto (só você vê)' : ''));
    const sp = tacSpeed(sc, t), used = +t.mv || 0, over = sc.rule.limit !== 'off' && used > sp;
    const pips = (sp > 0 && sp <= 12) ? `<div class="tac-pips" aria-hidden="true">${Array.from({ length:sp }, (_, i) => `<span class="${i < used ? 'on' : ''}"></span>`).join('')}</div>` : '';
    const info = `<div class="tac-moveinfo"><div class="tac-lbl">Movimento neste turno</div><div class="tac-big${over ? ' over' : ''}">${tacX(tacMoveTxt(sc, t))}</div>${pips}
      <div class="tac-sub">${fmtNum(used * sc.grid.mpc)} m de ${fmtNum(sp * sc.grid.mpc)} m${over ? ' · acima do limite' : ''}${t.ini != null && t.ini !== '' ? ' · iniciativa ' + tacX(t.ini) : ''}</div>
      ${mine ? '<p class="hub-hint">Arraste o token ou toque numa seta para andar 1 casa.</p>' : ''}</div>`;
    if(mine){
      const dp = [[-1, -1], [0, -1], [1, -1], [-1, 0], null, [1, 0], [-1, 1], [0, 1], [1, 1]];
      const names = { '-1,-1':'noroeste', '0,-1':'norte', '1,-1':'nordeste', '-1,0':'oeste', '1,0':'leste', '-1,1':'sudoeste', '0,1':'sul', '1,1':'sudeste' };
      const rot = { '-1,-1':315, '0,-1':0, '1,-1':45, '-1,0':270, '1,0':90, '-1,1':225, '0,1':180, '1,1':135 };
      h += `<div class="tac-move">${info}<div class="tac-dpad" role="group" aria-label="Mover uma casa">${dp.map(x => { if(!x) return '<span class="tac-dc" aria-hidden="true"></span>'; const k = x[0] + ',' + x[1]; return `<button type="button" class="tac-dp" data-tac="tok-step" data-dc="${x[0]}" data-dr="${x[1]}" aria-label="Mover 1 casa para ${names[k]}"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="transform:rotate(${rot[k]}deg)">${TAC_IC.arrow}</svg></button>`; }).join('')}</div></div>`;
    } else h += info;
    if(m){
      h += `<div class="tac-form"><label>Nome<input type="text" id="tt-name" value="${tacX(t.name || '')}" maxlength="40"></label>
        <label>Tipo${tacSel('tt-kind', Object.keys(TAC_KINDS).map(k => [k, TAC_KINDS[k][0]]), t.kind || 'obj')}</label>
        <label>Deslocamento (casas)<input type="number" id="tt-speed" min="0" max="99" value="${t.speed != null ? tacX(t.speed) : ''}" placeholder="padrão ${sc.rule.speed}"></label>
        <label>Iniciativa<input type="number" id="tt-ini" value="${t.ini != null ? tacX(t.ini) : ''}" placeholder="—"></label>
        <label>Cor<input type="color" id="tt-color" value="${tacX(/^#[0-9a-f]{6}$/i.test(t.color || '') ? t.color : kinfo[1])}"></label></div>
        <div class="inv-item-actions"><button type="button" class="inv-mini-btn primary" data-tac="tok-save">Salvar</button>
        <button type="button" class="inv-mini-btn" data-tac="tok-mv0">Zerar movimento</button>
        <button type="button" class="inv-mini-btn" data-tac="tok-hide">${t.hidden ? 'Revelar ao grupo' : 'Ocultar do grupo'}</button>
        <button type="button" class="inv-mini-btn danger" data-tac="tok-del">Remover</button></div>`;
    } else {
      h += `<div class="inv-item-actions"><button type="button" class="inv-mini-btn" data-tac="tok-center">Centralizar</button>${mine ? '<button type="button" class="inv-mini-btn danger" data-tac="tok-del">Tirar do mapa</button>' : ''}</div>`;
      if(mine) h += '<p class="hub-hint">O limite de deslocamento e a ordem de turnos são um apoio de mesa definido pelo mestre.</p>';
    }
    return h;
  }
  function tacPanelAdd(sid, sc){
    const m = isMaster(), inScene = new Set(tacTokensOf(sid).map(t => t.mapTokenId).filter(Boolean));
    const cand = tokens.filter(t => !inScene.has(t.id) && (m || (currentUser && t.ownerId === currentUser.uid)));
    let h = tacSh(m ? 'Adicionar à cena' : 'Colocar meu token');
    h += cand.length ? `<div class="hub-label">${m ? 'Personagens do mapa' : 'Seus personagens'}</div>` + cand.map(t => `<div class="tac-item"><div><b>${tacX(t.label || 'Token')}</b></div><div class="tac-acts"><button type="button" class="inv-mini-btn primary" data-tac="add-pc" data-id="${tacX(t.id)}">Colocar</button></div></div>`).join('')
      + (m && cand.length > 1 ? '<div class="inv-item-actions"><button type="button" class="inv-mini-btn" data-tac="add-all">Colocar todos</button></div>' : '')
      : `<div class="inv-empty">${m ? 'Todos os personagens do mapa já estão na cena.' : 'Você não tem personagem livre para colocar nesta cena.'}</div>`;
    if(m){
      h += `<div class="hub-label">Criar inimigo, aliado ou objeto</div><div class="tac-form">
        <label>Nome<input type="text" id="ta-name" maxlength="40" placeholder="Ex.: Lobo-de-gelo"></label>
        <label>Tipo${tacSel('ta-kind', Object.keys(TAC_KINDS).filter(k => k !== 'pc').map(k => [k, TAC_KINDS[k][0]]), 'enemy')}</label>
        <label>Quantidade<input type="number" id="ta-qty" min="1" max="12" value="1"></label>
        <label>Deslocamento (casas)<input type="number" id="ta-speed" min="0" max="99" placeholder="padrão ${sc.rule.speed}"></label>
        <label class="check-row"><input type="checkbox" id="ta-hid"> Começa oculto (só o mestre vê)</label></div>
        <div class="inv-item-actions"><button type="button" class="inv-mini-btn primary" data-tac="add-custom">Criar</button></div>`;
    }
    return h;
  }
  function tacPanelScenes(){
    const ids = Object.keys(tac.scenes).sort((a, b) => (tac.scenes[a].createdAt || 0) - (tac.scenes[b].createdAt || 0));
    let h = tacSh('Cena', 'Só o mestre vê este painel');
    const cur = tacScene(tacCurId());
    if(cur) h += `<div class="tac-item"><div><b>Em exibição: ${tacX(cur.name || 'Cena')}</b><small>Casa de ${tacX(cur.grid.size)} px · ${tacX(fmtNum(cur.grid.mpc))} m por casa</small></div><div class="tac-acts"><button type="button" class="inv-mini-btn" data-tac="panel-grid">Ajustar grade</button></div></div>`;
    h += ids.length ? ids.map(id => {
      const s = tac.scenes[id], n = Object.keys(s.tokens || {}).length + Object.keys(gmTac[id] || {}).length, isCur = tacCurId() === id;
      return `<div class="tac-item"><div><b>${tacX(s.name || 'Cena')}</b><small>${tac.active === id ? '● ativa para o grupo · ' : ''}${isCur ? 'em exibição · ' : ''}${n} token${n === 1 ? '' : 's'}</small></div>
        <div class="tac-acts"><button type="button" class="inv-mini-btn primary" data-tac="sc-activate" data-id="${tacX(id)}"${tac.active === id ? ' disabled' : ''}>Ativar</button>
        <button type="button" class="inv-mini-btn" data-tac="sc-view" data-id="${tacX(id)}">Ver</button>
        <button type="button" class="inv-mini-btn danger" data-tac="sc-del" data-id="${tacX(id)}">Excluir</button></div></div>`;
    }).join('') : '<div class="inv-empty">Nenhuma cena ainda.</div>';
    h += '<div class="inv-item-actions"><button type="button" class="inv-mini-btn primary" data-tac="panel-new">＋ Nova cena</button></div>';
    h += '<p class="hub-hint">“Ativar” faz o grupo inteiro passar a ver essa cena. “Ver” é só uma prévia para você.</p>';
    return h;
  }
  function tacPanelNew(){
    const s = tacUI.nfSrc, chip = (v, l) => `<button type="button" class="tac-chip-b${s === v ? ' on' : ''}" data-tac="nf-src" data-v="${v}">${l}</button>`;
    let h = tacSh('Nova cena');
    h += `<div class="tac-form"><label>Nome<input type="text" id="tn-name" maxlength="60" placeholder="Ex.: Posto de combustível"></label></div>
      <div class="hub-label">Fundo da cena</div><div class="tac-chips">${chip('blank', 'Grade em branco')}${chip('file', 'Foto do celular')}${chip('url', 'Endereço da imagem')}</div>`;
    if(s === 'blank') h += `<div class="tac-form"><label>Colunas<input type="number" id="tn-cols" min="5" max="60" value="${TAC_DEF.cols}"></label><label>Linhas<input type="number" id="tn-rows" min="5" max="60" value="${TAC_DEF.rows}"></label></div>`;
    if(s === 'file') h += '<div class="tac-form"><label>Imagem<input type="file" id="tn-file" accept="image/*"></label></div><p class="hub-hint">A imagem é reduzida (até 1600 px) e guardada no banco da campanha. Ela não é secreta: quem abrir a cena a vê inteira.</p>';
    if(s === 'url') h += '<div class="tac-form"><label>Endereço<input type="text" id="tn-url" placeholder="https://… ou cenas/posto.jpg"></label></div><p class="hub-hint">Dica: suba a imagem na pasta <b>cenas</b> do seu repositório do GitHub e use <b>cenas/nome.jpg</b>.</p>';
    h += '<p class="hub-hint">Depois de criar, use “Grade” para alinhar as casas com a imagem.</p>';
    h += '<div class="inv-item-actions"><button type="button" class="inv-mini-btn primary" data-tac="sc-create">Criar cena</button><button type="button" class="inv-mini-btn" data-tac="panel-scenes">Voltar</button></div>';
    return h;
  }
  function tacPanelGrid(sid, sc){
    if(!tacUI.gd) tacUI.gd = { size:sc.grid.size, ox:sc.grid.ox, oy:sc.grid.oy, mpc:sc.grid.mpc, diag:sc.grid.diag, show:sc.grid.show !== false };
    const g = tacUI.gd;
    let h = tacSh('Grade da cena', 'Ajuste até as linhas casarem com a imagem');
    h += tacStep('Tamanho da casa (px)', 'size', g.size, [1, 5]) + tacStep('Deslocar na horizontal (px)', 'ox', g.ox, [1, 5]) + tacStep('Deslocar na vertical (px)', 'oy', g.oy, [1, 5]);
    h += `<div class="tac-form"><label>Metros por casa<input type="number" id="tg-mpc" data-tac-ch="g" step="0.1" min="0.1" value="${tacX(g.mpc)}"></label>
      <label>Contagem na diagonal${tacSel('tg-diag', TAC_DIAG, g.diag, 'g')}</label>
      <label class="check-row"><input type="checkbox" id="tg-show" data-tac-ch="g" ${g.show ? 'checked' : ''}> Mostrar a grade para o grupo</label></div>`;
    h += '<p class="hub-hint">Padrões provisórios: 1,5 m por casa e diagonal = 1 casa. Troque pelo que a sua mesa usar.</p>';
    h += '<div class="inv-item-actions"><button type="button" class="inv-mini-btn primary" data-tac="g-save">Salvar grade</button><button type="button" class="inv-mini-btn" data-tac="g-cancel">Cancelar</button></div>';
    return h;
  }
  function tacPanelCombat(sid, sc){
    const tk = tacTokensOf(sid), byId = {}; tk.forEach(t => { byId[t.id] = t; });
    let h = tacSh('Combate e deslocamento', sc.turn.on ? `Rodada ${sc.turn.round}` : 'Sem combate em andamento');
    h += '<div class="inv-item-actions">' + (sc.turn.on
      ? '<button type="button" class="inv-mini-btn primary" data-tac="next">Próximo turno ▶</button><button type="button" class="inv-mini-btn" data-tac="c-rebuild">Refazer ordem</button><button type="button" class="inv-mini-btn danger" data-tac="c-end">Encerrar combate</button>'
      : '<button type="button" class="inv-mini-btn primary" data-tac="c-start">Iniciar combate</button>') + '<button type="button" class="inv-mini-btn" data-tac="c-reset-mv">Zerar movimento de todos</button></div>';
    const pubIds = tk.filter(t => !t.hidden);
    h += `<div class="hub-label">Iniciativa (maior age primeiro)</div>` + (pubIds.length ? pubIds.slice().sort((a, b) => {
      const ia = sc.turn.order.indexOf(a.id), ib = sc.turn.order.indexOf(b.id);
      return sc.turn.on ? ((ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib)) : (tacNum(b.ini, -999) - tacNum(a.ini, -999));
    }).map(t => `<div class="tac-item"><div><b>${sc.turn.on && tacTurnId(sc) === t.id ? '▶ ' : ''}${tacX(t.name)}</b><small>${tacX(tacMoveTxt(sc, t))}</small></div><div class="tac-acts"><input type="number" class="tac-ini" data-tac-ch="ini" data-id="${tacX(t.id)}" value="${t.ini != null ? tacX(t.ini) : ''}" placeholder="ini" aria-label="Iniciativa de ${tacX(t.name)}"></div></div>`).join('') : '<div class="inv-empty">Sem tokens visíveis na cena.</div>');
    h += '<p class="hub-hint">Tokens ocultos ficam fora da ordem; revele-os para entrarem. Role a iniciativa em “Dados” e anote o valor aqui.</p>';
    h += `<div class="hub-label">Regras de deslocamento desta cena</div><div class="tac-form">
      <label>Limite${tacSel('tc-limit', TAC_LIMIT, sc.rule.limit)}</label>
      <label>Deslocamento padrão (casas)<input type="number" id="tc-speed" min="0" max="99" value="${tacX(sc.rule.speed)}"></label>
      <label class="check-row"><input type="checkbox" id="tc-lock" ${sc.rule.lock ? 'checked' : ''}> Jogadores só movem na vez do próprio token</label></div>
      <div class="inv-item-actions"><button type="button" class="inv-mini-btn primary" data-tac="r-save">Salvar regras</button></div>
      <p class="hub-hint">Padrão provisório de 6 casas por turno: confirme com a sua mesa. O app só avisa ou bloqueia o deslocamento; não aplica nenhuma outra regra sozinho. O limite é um apoio de mesa (não impede quem editar o banco por fora).</p>`;
    return h;
  }

  // ---------- ações ----------
  function tacF(id){ const e = document.getElementById(id); return e ? e.value : ''; }
  function tacOrderFrom(sid, sc){
    const tk = tacTokensOf(sid).filter(t => !t.hidden);
    return tk.slice().sort((a, b) => (tacNum(b.ini, -999) - tacNum(a.ini, -999)) || String(a.name).localeCompare(String(b.name))).map(t => t.id);
  }
  function tacWithoutFromOrder(sc, id){
    const o = sc.turn.order, ix = o.indexOf(id);
    if(ix < 0) return null;
    const order = o.filter(x => x !== id);
    let i = sc.turn.i % Math.max(1, o.length);
    if(ix < i) i--; if(i >= order.length) i = 0;
    return { order, i:Math.max(0, i) };
  }
  async function tacSetTurn(sid, patch, extra){
    const base = tacPath() + '/scenes/' + sid + '/turn', upd = Object.assign({}, extra || {});
    Object.keys(patch).forEach(k => { upd[base + '/' + k] = patch[k]; });
    const ok = await DB.update(upd);
    if(!ok) toast('Não foi possível gravar o combate (regras v3 publicadas?).', true);
    return ok;
  }
  async function tacMakeTokens(sid, sc, list, hidden){
    const used = new Set(tacTokensOf(sid).map(t => t.c + ',' + t.r)), upd = {};
    const base = hidden ? scopedKey(KEY_GMTAC) + '/' + sid : tacPath() + '/scenes/' + sid + '/tokens';
    list.forEach(d => {
      const cell = tacFreeCell(sid, sc, used); used.add(cell.c + ',' + cell.r);
      upd[base + '/' + DB.newId(base)] = JSON.parse(JSON.stringify(Object.assign({ mv:0, v:1 }, d, { c:cell.c, r:cell.r })));
    });
    const ok = await DB.update(upd);
    if(!ok) toast('Não foi possível gravar (as regras do Firebase v3 já foram publicadas?).', true);
    return ok;
  }
  function tacPcRec(t){ return { name:t.label || 'Token', kind:'pc', owner:t.ownerId || null, mapTokenId:t.id, color:/^#[0-9a-f]{6}$/i.test(t.color || '') ? t.color : undefined }; }
  async function tacCreateScene(){
    if(!isMaster()) return;
    const name = tacF('tn-name').trim() || 'Nova cena', src = tacUI.nfSrc, sid = DB.newId(tacPath() + '/scenes');
    const sc = { id:sid, name, v:1, createdAt:DB.ts(), grid:{ size:TAC_DEF.size, mpc:TAC_DEF.mpc, ox:0, oy:0, diag:TAC_DEF.diag, show:true }, rule:{ limit:TAC_DEF.limit, speed:TAC_DEF.speed, lock:false } };
    try{
      if(src === 'blank'){
        const cols = Math.min(60, Math.max(5, parseInt(tacF('tn-cols'), 10) || TAC_DEF.cols)), rows = Math.min(60, Math.max(5, parseInt(tacF('tn-rows'), 10) || TAC_DEF.rows));
        sc.src = { kind:'blank' }; sc.w = cols * TAC_DEF.size; sc.h = rows * TAC_DEF.size;
      } else if(src === 'url'){
        const url = tacF('tn-url').trim();
        if(!url){ toast('Cole o endereço da imagem.', true); return; }
        const im = await tacLoadImg(url);
        sc.src = { kind:'url', url }; sc.w = im.w; sc.h = im.h;
      } else {
        const f = (tacEl('tn-file') || {}).files && tacEl('tn-file').files[0];
        if(!f){ toast('Escolha uma imagem.', true); return; }
        const r = await tacFileToData(f);
        const okImg = await DB.set(scopedKey(KEY_TACIMG) + '/' + sid, { d:r.data });
        if(!okImg){ toast('Não consegui guardar a imagem (regras do Firebase v3 publicadas? Imagem muito grande?).', true); return; }
        tacUI.imgCache[sid] = r.data;
        sc.src = { kind:'data' }; sc.w = r.w; sc.h = r.h;
      }
    }catch(e){ toast(e && e.message ? e.message : 'Não foi possível criar a cena.', true); return; }
    const upd = { [tacPath() + '/scenes/' + sid]:sc };
    if(!tac.active) upd[tacPath() + '/active'] = sid;
    const ok = await DB.update(upd);
    if(!ok){ toast('Não foi possível gravar a cena (regras do Firebase v3 publicadas?).', true); return; }
    tacUI.sid = sid; tacUI.gd = null; tacUI.panel = (src === 'blank') ? 'scenes' : 'grid';
    toast('Cena criada.');
    tacRender(); tacBuild(true);
  }
  async function tacAction(a, el){
    const sid = tacCurId(), sc = tacScene(sid), D = el ? el.dataset : {}, m = isMaster();
    const tk = sid ? tacTokensOf(sid) : [], sel = tk.find(t => t.id === tacUI.sel);
    switch(a){
      case 'back': tacClose(); return;
      case 'close-sheet': tacUI.panel = ''; tacUI.gd = null; tacDrawGrid(); tacRenderBar(); tacRenderSheet(); return;
      case 'ruler': tacUI.ruler = !tacUI.ruler; tacUI.pts = []; tacDrawRuler(); tacRenderBar(); return;
      case 'center': if(tacMap && sc) tacMap.fitBounds(L.latLngBounds([[0, 0], [sc.h, sc.w]]), { animate:false }); return;
      case 'dice': openHub('dados'); return;
      case 'undo': tacUndo(); return;
      case 'tok-step': if(sel && tacCanMove(sel)){ tacUI.focusTok = null; tacMoveTo(sid, sel, { c:Math.round(+sel.c) + (+D.dc), r:Math.round(+sel.r) + (+D.dr) }).then(() => tacDrawTokens()); } return;
      case 'panel-add': case 'panel-scenes': case 'panel-grid': case 'panel-combat': case 'panel-new': {
        const p = a.slice(6);
        tacUI.panel = tacUI.panel === p && p !== 'new' ? '' : p;
        tacUI.gd = null; tacDrawGrid(); tacRenderBar(); tacRenderSheet(); return;
      }
      case 'nf-src': { const nm = tacF('tn-name'); tacUI.nfSrc = D.v; tacRenderSheet(); if(tacEl('tn-name')) tacEl('tn-name').value = nm; return; }
      case 'sc-create': tacCreateScene(); return;
      case 'sc-activate': if(m && tac.scenes[D.id]){ await DB.set(tacPath() + '/active', D.id); tacUI.sid = null; toast('Cena ativada para o grupo.'); } return;
      case 'sc-view': tacUI.sid = D.id; tacUI.sel = null; tacUI.gd = null; tacRender(); tacBuild(true); return;
      case 'sc-del': {
        if(!m || !tac.scenes[D.id]) return;
        if(!window.confirm('Excluir a cena “' + (tac.scenes[D.id].name || 'Cena') + '” e todos os tokens dela?')) return;
        const upd = { [tacPath() + '/scenes/' + D.id]:null, [scopedKey(KEY_GMTAC) + '/' + D.id]:null, [scopedKey(KEY_TACIMG) + '/' + D.id]:null };
        if(tac.active === D.id) upd[tacPath() + '/active'] = null;
        delete tacUI.imgCache[D.id]; if(tacUI.sid === D.id) tacUI.sid = null;
        await DB.update(upd); tacRender(); tacBuild(true); return;
      }
      case 'g-step': {
        if(!tacUI.gd) return;
        const k = D.k, v = tacNum(tacF('tg-' + k), tacUI.gd[k]) + (+D.d);
        tacUI.gd[k] = k === 'size' ? Math.max(4, Math.min(400, v)) : v;
        if(tacEl('tg-' + k)) tacEl('tg-' + k).value = tacUI.gd[k];
        tacDrawGrid(); return;
      }
      case 'g-save': {
        if(!m || !sc || !tacUI.gd) return;
        const g = tacUI.gd;
        const ok = await DB.set(tacPath() + '/scenes/' + sid + '/grid', { size:Math.max(4, tacNum(g.size, 64)), ox:tacNum(g.ox, 0), oy:tacNum(g.oy, 0), mpc:Math.max(0.1, tacNum(g.mpc, 1.5)), diag:g.diag || 'cheb', show:g.show !== false });
        if(ok){ toast('Grade salva.'); tacUI.gd = null; tacUI.panel = ''; tacRender(); tacDrawGrid(); tacDrawTokens(); }
        else toast('Não foi possível salvar a grade.', true);
        return;
      }
      case 'g-cancel': tacUI.gd = null; tacUI.panel = ''; tacDrawGrid(); tacRender(); return;
      case 'add-pc': {
        if(!sc) return;
        const t = tokens.find(x => x.id === D.id); if(!t) return;
        if(!m && !(currentUser && t.ownerId === currentUser.uid)) { toast('Esse personagem não é seu.', true); return; }
        await tacMakeTokens(sid, sc, [tacPcRec(t)], false); tacRenderSheet(); return;
      }
      case 'add-all': {
        if(!sc || !m) return;
        const inScene = new Set(tk.map(t => t.mapTokenId).filter(Boolean));
        await tacMakeTokens(sid, sc, tokens.filter(t => !inScene.has(t.id)).map(tacPcRec), false); tacRenderSheet(); return;
      }
      case 'add-custom': {
        if(!sc || !m) return;
        const name = tacF('ta-name').trim() || 'Token', kind = tacF('ta-kind') || 'enemy', qty = Math.min(12, Math.max(1, parseInt(tacF('ta-qty'), 10) || 1));
        const sp = tacF('ta-speed') === '' ? undefined : Math.max(0, Math.min(99, parseInt(tacF('ta-speed'), 10) || 0));
        const hid = !!(tacEl('ta-hid') && tacEl('ta-hid').checked);
        const list = Array.from({ length:qty }, (_, i) => ({ name:qty > 1 ? name + ' ' + (i + 1) : name, kind, speed:sp }));
        if(await tacMakeTokens(sid, sc, list, hid)){ toast(qty > 1 ? qty + ' tokens criados.' : 'Token criado.'); tacUI.panel = ''; tacRender(); }
        return;
      }
      case 'tok-center': if(sel && sc && tacMap) tacMap.setView(tacCenter(sc, sel.c, sel.r), Math.max(tacMap.getZoom(), 0), { animate:false }); return;
      case 'tok-save': {
        if(!m || !sel) return;
        const p = tacTokPath(sid, sel), sp = tacF('tt-speed'), ini = tacF('tt-ini');
        const ok = await DB.update({ [p + '/name']:tacF('tt-name').trim() || 'Token', [p + '/kind']:tacF('tt-kind') || 'obj', [p + '/color']:tacF('tt-color') || null,
          [p + '/speed']:sp === '' ? null : Math.max(0, Math.min(99, parseInt(sp, 10) || 0)), [p + '/ini']:ini === '' ? null : tacNum(ini, null) });
        if(ok) toast('Token salvo.'); else toast('Não foi possível salvar o token.', true);
        return;
      }
      case 'tok-mv0': if(m && sel) await DB.set(tacTokPath(sid, sel) + '/mv', 0); return;
      case 'tok-hide': {
        if(!m || !sel || !sc) return;
        const rec = JSON.parse(JSON.stringify(sel)); delete rec.hidden; delete rec.id;
        const from = tacTokPath(sid, sel), to = tacTokPath(sid, Object.assign({}, sel, { hidden:!sel.hidden })), upd = { [from]:null, [to]:rec };
        if(!sel.hidden && sc.turn.on){ const w = tacWithoutFromOrder(sc, sel.id); if(w){ upd[tacPath() + '/scenes/' + sid + '/turn/order'] = w.order; upd[tacPath() + '/scenes/' + sid + '/turn/i'] = w.i; } }
        const ok = await DB.update(upd);
        toast(!ok ? 'Não foi possível alterar a visibilidade (regras v3 publicadas?).' : (sel.hidden ? 'Token revelado ao grupo.' : 'Token oculto: só você o vê.'), !ok);
        return;
      }
      case 'tok-del': {
        if(!sel || !sc || !tacCanMove(sel)) return;
        if(!window.confirm('Remover “' + (sel.name || 'token') + '” da cena?')) return;
        const upd = { [tacTokPath(sid, sel)]:null };
        if(sc.turn.on){ const w = tacWithoutFromOrder(sc, sel.id); if(w){ upd[tacPath() + '/scenes/' + sid + '/turn/order'] = w.order; upd[tacPath() + '/scenes/' + sid + '/turn/i'] = w.i; } }
        tacUI.sel = null; tacUI.panel = '';
        await DB.update(upd); tacRender(); tacDrawTokens(); return;
      }
      case 'c-start': {
        if(!m || !sc) return;
        const order = tacOrderFrom(sid, sc), upd = {};
        if(!order.length){ toast('Coloque tokens visíveis na cena antes de iniciar.', true); return; }
        tk.filter(t => !t.hidden).forEach(t => { upd[tacTokPath(sid, t) + '/mv'] = 0; });
        await tacSetTurn(sid, { on:true, order, i:0, round:1 }, upd); return;
      }
      case 'c-rebuild': {
        if(!m || !sc) return;
        const cur = tacTurnId(sc), order = tacOrderFrom(sid, sc), i = Math.max(0, order.indexOf(cur));
        await tacSetTurn(sid, { order, i }); return;
      }
      case 'c-end': if(m && window.confirm('Encerrar o combate? A ordem e a rodada atuais serão perdidas.')) await tacSetTurn(sid, { on:false }); return;
      case 'c-reset-mv': { if(!m || !sc) return; const upd = {}; tk.forEach(t => { upd[tacTokPath(sid, t) + '/mv'] = 0; }); await DB.update(upd); toast('Movimento zerado.'); return; }
      case 'next': {
        if(!m || !sc || !sc.turn.on) return;
        const ids = new Set(tk.filter(t => !t.hidden).map(t => t.id)), order = sc.turn.order.filter(x => ids.has(x));
        if(!order.length) return;
        let i = sc.turn.i % sc.turn.order.length + 1, round = sc.turn.round;
        // avança até o próximo token que ainda existe
        const full = sc.turn.order; let guard = 0;
        while(guard++ <= full.length){ if(i >= full.length){ i = 0; round++; } if(ids.has(full[i % full.length])) break; i++; }
        const nid = full[i % full.length], t = tk.find(x => x.id === nid), upd = {};
        if(t) upd[tacTokPath(sid, t) + '/mv'] = 0;
        await tacSetTurn(sid, { i, round }, upd); return;
      }
      case 'r-save': {
        if(!m || !sc) return;
        const ok = await DB.set(tacPath() + '/scenes/' + sid + '/rule', { limit:tacF('tc-limit') || 'warn', speed:Math.max(0, Math.min(99, parseInt(tacF('tc-speed'), 10) || TAC_DEF.speed)), lock:!!(tacEl('tc-lock') && tacEl('tc-lock').checked) });
        toast(ok ? 'Regras salvas.' : 'Não foi possível salvar as regras.', !ok); return;
      }
    }
  }
  function tacChange(el){
    const k = el.dataset.tacCh;
    if(k === 'g' && tacUI.gd){
      const g = tacUI.gd;
      g.size = Math.max(4, Math.min(400, tacNum(tacF('tg-size'), g.size))); g.ox = tacNum(tacF('tg-ox'), g.ox); g.oy = tacNum(tacF('tg-oy'), g.oy);
      g.mpc = tacNum(tacF('tg-mpc'), g.mpc); g.diag = tacF('tg-diag') || g.diag; g.show = !!(tacEl('tg-show') && tacEl('tg-show').checked);
      tacDrawGrid();
    } else if(k === 'ini' && isMaster()){
      const sid = tacCurId(), t = sid && tacTokensOf(sid).find(x => x.id === el.dataset.id);
      if(t) DB.set(tacTokPath(sid, t) + '/ini', el.value === '' ? null : tacNum(el.value, null));
    }
  }
  function tacOnData(v){
    const prev = tac.active;
    tac = { active:(v && v.active) || null, scenes:(v && v.scenes) || {} };
    if(tacUI.seen && tac.active && tac.active !== prev && !tacUI.open && !isMaster() && tac.scenes[tac.active]) toast('Cena tática ativa: ' + (tac.scenes[tac.active].name || 'Cena') + ' (botão Tático)');
    tacUI.seen = true;
    tacRenderArea();
    tacChanged();
  }
  function tacChanged(){
    if(!tacUI.open) return;
    tacRenderBar(); tacRenderTurn(); tacRenderTitle();
    tacBuild(false);
    const ae = document.activeElement, sh = tacEl('tac-sheet');
    if(ae && sh && sh.contains(ae) && /^(INPUT|TEXTAREA|SELECT)$/.test(ae.tagName)) return;
    tacRenderSheet();
  }
  function tacOpen(){
    closeHub(); closeDrawer(); closeNavDrawer(); closeInventory(); hudCloseSheets();
    tacUI.open = true;
    tacEl('tac').hidden = false;
    tacRenderArea();
    tacInitMap();
    tacRender();
    requestAnimationFrame(() => { tacMap.invalidateSize(); tacBuild(true); const bk = root0(); if(bk) bk.focus({ preventScroll:true }); });
  }
  function root0(){ return document.querySelector('#tac .tac-back'); }
  function tacClose(){ tacUI.open = false; tacUI.ruler = false; tacUI.pts = []; tacEl('tac').hidden = true; tacRenderArea(); const f = document.getElementById('dock-tac'); if(f) f.focus({ preventScroll:true }); }
  (function tacWire(){
    const root = tacEl('tac');
    if(!root) return;
    root.addEventListener('click', e => { const b = e.target.closest('[data-tac]'); if(b && root.contains(b)) tacAction(b.dataset.tac, b); });
    root.addEventListener('change', e => { if(e.target && e.target.dataset && e.target.dataset.tacCh) tacChange(e.target); });
    root.addEventListener('input', e => { if(e.target && e.target.dataset && e.target.dataset.tacCh === 'g') tacChange(e.target); });
    window.addEventListener('resize', () => { if(tacUI.open && tacMap) tacMap.invalidateSize(); });
    if(window.ResizeObserver) new ResizeObserver(() => { if(tacUI.open && tacMap) tacMap.invalidateSize({ animate:false }); }).observe(tacEl('tac-mapwrap'));
    document.addEventListener('keydown', e => { if(e.key === 'Escape' && tacUI.open && !hubIsOpen()) tacClose(); });
    const bo = tacEl('tac-banner-open'), bx = tacEl('tac-banner-x');
    if(bo) bo.addEventListener('click', tacOpen);
    if(bx) bx.addEventListener('click', () => { tacUI.bannerOff = tac.active; tacRenderArea(); });
  })();

  function closeAllPanels(){ closeHub(); closeDrawer(); closeNavDrawer(); closeInventory(); if(typeof hudCloseSheets === 'function') hudCloseSheets(); }
  document.getElementById('hub-drawer-close-btn').addEventListener('click', closeHub);
  hubBackdrop.addEventListener('click', closeHub);
  document.getElementById('campaign-chip').addEventListener('click', () => openHub('campanhas'));
  document.addEventListener('keydown', e => {
    if(e.key === 'Escape' && hubIsOpen()) closeHub();
    const tag = (document.activeElement && document.activeElement.tagName) || '';
    if(/^(INPUT|TEXTAREA|SELECT)$/.test(tag) || e.ctrlKey || e.metaKey || e.altKey) return;
    if(e.key === 'd' || e.key === 'D') hudOpenQuickRoll();
    else if(e.key === 'c' || e.key === 'C') openHub('campanhas');
  });

  // ================= HUD: DOCK, ÍNDICE, ROLAGEM RÁPIDA, FEED VIVO E MINI-FICHA =================
  // Tudo aqui é camada de interface por cima do que já existia: os dados (rolagens, registro de itens,
  // diário, fichas) continuam nos mesmos lugares. O feed só LÊ lootLog + rolls + journal.
  const hudEl = id => document.getElementById(id);
  const hudNorm = s => String(s == null ? '' : s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  const hudPlain = html => { const d = document.createElement('div'); d.innerHTML = html; return (d.textContent || '').replace(/\s+/g, ' ').trim(); };
  const hudCol = () => !!(window.matchMedia && window.matchMedia('(min-width:1100px)').matches);
  const hud = { who:null, idxAdd:false, idxQ:'', mapf:new Set(), feed:{ f:'all', m:'all', seen:0, collapsed:false, sheet:false, tall:false, open:null, more:false } };

  // ---- personagem ativo (o que o dock usa por padrão) ----
  function hudWho(){
    const hl = holderList();
    if(hud.who && hl.some(h => h.id === hud.who)) return hud.who;
    const cs = charSelect && charSelect.value;
    if(cs && hl.some(h => h.id === cs)) return cs;
    const mine = tokens.find(t => currentUser && t.ownerId === currentUser.uid);
    if(mine) return mine.id;
    const own = hl.filter(h => h.type === 'token' && canEditHolder(h));
    return own.length === 1 ? own[0].id : null;
  }
  function hudSetWho(id){
    hud.who = id || null;
    if(id){
      if(tokens.some(t => t.id === id) && charSelect.value !== id){ charSelect.value = id; charSelect.dispatchEvent(new Event('change')); }
      hub.charToken = id; rollUI.who = id;
    }
    hudMiniChanged(); if(hudEl('qr-sheet').classList.contains('open')) hudRenderQR();
  }
  // deixa o personagem escolhido já selecionado nas folhas de saque e inventário
  function hudEnsureWho(){ const w = hudWho(); if(w && tokens.some(t => t.id === w) && !charSelect.value){ charSelect.value = w; charSelect.dispatchEvent(new Event('change')); } if(w && !hub.charToken) hub.charToken = w; }

  // ---- folhas (índice, rolar, feed no celular) ----
  const hudSheetIds = [['idx-sheet', 'idx-backdrop'], ['qr-sheet', 'qr-backdrop'], ['lay-sheet', 'lay-backdrop']];
  function hudCloseSheets(except){
    if(!hudReady) return;
    hudSheetIds.forEach(p => { if(p[0] !== except){ hudEl(p[0]).classList.remove('open'); hudEl(p[1]).classList.remove('open'); } });
    if(except !== 'qr-sheet') hud.qrAttr = '';      // o atributo escolhido na folha Rolar vale só enquanto ela está aberta
    if(except !== 'feed' && !hudCol()){ hud.feed.sheet = false; hud.feed.tall = false; hudFeedLayout(); }
    hudDockSync();
  }
  function hudOpenSheet(id){
    closeHub(); closeDrawer(); closeNavDrawer(); closeInventory();
    hudCloseSheets(id);
    const pair = hudSheetIds.find(p => p[0] === id);
    hudEl(pair[0]).classList.add('open'); hudEl(pair[1]).classList.add('open');
    hudDockSync();
  }
  const hudIsOpen = id => hudEl(id).classList.contains('open');
  function hudToggleSheet(id, render){
    if(hudIsOpen(id)){ hudCloseSheets(); return; }
    if(render) render();
    hudOpenSheet(id);
  }
  // arrastar a alça: para baixo fecha; para cima expande (só o feed expande)
  function hudDrag(sheet, onClose, onTall, isTall){
    let y0 = null, dy = 0, cap = null;
    sheet.addEventListener('pointerdown', e => {
      const g = e.target.closest('.sheet-grab'); if(!g) return;
      y0 = e.clientY; dy = 0; cap = g; sheet.style.transition = 'none';
      try{ g.setPointerCapture(e.pointerId); }catch(err){}
    });
    sheet.addEventListener('pointermove', e => { if(y0 == null) return; dy = e.clientY - y0; if(dy > 0) sheet.style.transform = `translateY(${dy}px)`; });
    const end = () => {
      if(y0 == null) return; y0 = null; cap = null; sheet.style.transition = ''; sheet.style.transform = '';
      if(onTall && isTall() && dy > 30) onTall(false); else if(dy > 90) onClose(); else if(dy < -50 && onTall) onTall(true);
    };
    sheet.addEventListener('pointerup', end); sheet.addEventListener('pointercancel', end);
  }

  // ---- dock ----
  const HUD_DOCK = [['dock-roll', 'dice', 'Rolar'], ['dock-loot', 'compass', 'Saque'], ['dock-inv', 'bag', 'Inventário'], ['dock-tac', 'swords', 'Tático'], ['dock-more', 'more', 'Mais']];
  function hudDockBuild(){
    hudEl('dock').innerHTML = HUD_DOCK.map(d => `<button type="button" class="dock-btn" id="${d[0]}" aria-pressed="false">${ic(d[1], 22)}<span>${d[2]}</span><i class="dock-live" hidden></i></button>`).join('');
  }
  function hudDockSync(){
    if(!hudReady) return;
    const st = { 'dock-roll':hudIsOpen('qr-sheet'), 'dock-loot':saqueDrawer.classList.contains('open'), 'dock-inv':invDrawer.classList.contains('open'), 'dock-tac':tacUI.open, 'dock-more':hudIsOpen('idx-sheet') };
    Object.keys(st).forEach(k => { const b = hudEl(k); if(b){ b.classList.toggle('active', !!st[k]); b.setAttribute('aria-pressed', String(!!st[k])); } });
    hudEl('dock-more').setAttribute('aria-expanded', String(hudIsOpen('idx-sheet')));
    const lc = hudEl('mchip-layers'); if(lc){ lc.classList.toggle('active', hudIsOpen('lay-sheet')); lc.setAttribute('aria-expanded', String(hudIsOpen('lay-sheet'))); }
    document.body.classList.toggle('tac-on', !!tacUI.open);
    document.body.classList.toggle('panel-open', [saqueDrawer, invDrawer, hubDrawer, navDrawer].some(el => el.classList.contains('open')));
  }
  function hudTacLive(sc){
    if(!hudReady) return;
    const b = hudEl('dock-tac'); if(!b) return;
    const dot = b.querySelector('.dock-live'); if(dot) dot.hidden = !sc;
    b.title = sc ? 'Cena tática ativa: ' + (sc.name || 'Cena') : 'Mapa tático';
  }
  function hudTactical(){
    if(tacUI.open){ tacClose(); return; }
    const sc = tac.active && tac.scenes[tac.active];
    if(!sc && !isMaster()){ toast('Nenhuma cena tática ativa no momento. O mestre precisa ativar uma.', true); return; }
    hudCloseSheets(); tacOpen();
  }
  function hudWireDock(){
    hudEl('dock-roll').addEventListener('click', () => hudToggleSheet('qr-sheet', () => { hud.qrAttr = ''; hudRenderQR(); }));
    hudEl('dock-loot').addEventListener('click', () => { if(saqueDrawer.classList.contains('open')){ closeDrawer(); return; } hudCloseSheets(); hudEnsureWho(); openDrawer(); });
    hudEl('dock-inv').addEventListener('click', () => { if(invDrawer.classList.contains('open')){ closeInventory(); return; } hudCloseSheets(); hudEnsureWho(); openInventory(null); });
    hudEl('dock-tac').addEventListener('click', hudTactical);
    hudEl('dock-more').addEventListener('click', () => hudToggleSheet('idx-sheet', hudRenderIndex));
    // o dock reflete o que está aberto, mesmo quando outra parte do app abre/fecha as folhas
    const mo = new MutationObserver(hudDockSync);
    [saqueDrawer, invDrawer, hubDrawer, navDrawer, hudEl('qr-sheet'), hudEl('idx-sheet')].forEach(el => mo.observe(el, { attributes:true, attributeFilter:['class'] }));
    document.addEventListener('keydown', e => { if(e.key === 'Escape' && (hudIsOpen('idx-sheet') || hudIsOpen('qr-sheet') || hudIsOpen('lay-sheet') || (hud.feed.sheet && !hudCol()))) hudCloseSheets(); });
    ['idx', 'qr', 'lay'].forEach(k => {
      hudEl(k + '-backdrop').addEventListener('click', () => hudCloseSheets());
      hudDrag(hudEl(k + '-sheet'), () => hudCloseSheets());
    });
    hudEl('idx-close').addEventListener('click', () => hudCloseSheets());
    hudEl('lay-close').addEventListener('click', () => hudCloseSheets());
  }

  // ---- índice ----
  function hudIndexItems(){
    const m = isMaster(), mods = cfg().modules;
    const tab = (t, extra) => () => { hudCloseSheets(); const w = hudWho(); if(w && t === 'ficha') hub.charToken = w; openHub(t); if(extra) extra(); };
    const pinWords = PIN_TYPES.map(t => t.label).join(' ');
    const L = [
      { id:'add', ic:'plus', t:'Adicionar ao mapa', d:'Pins, token, áreas e rotas', kw:'pin token area rota medir selecionar ' + pinWords, toggle:true, run:() => { hud.idxAdd = !hud.idxAdd; hudRenderIndex(); } },
      { id:'list', ic:'list', t:'Camadas e lista do mapa', d:'Mapa-base e ir até pins, tokens, áreas e rotas', kw:'lista navegar viagem rapida buscar mapa camadas base satelite relevo ruas filtros', run:() => { hudCloseSheets(); openNavDrawer(); } },
      { id:'char', ic:'user', t:'Personagem', d:'Ficha, perícias, ataques e condições', kw:'ficha personagem pericia ataque condicao atributo', run:tab('ficha') },
      { id:'diary', ic:'book', t:'Diário', d:'Pistas, objetivos e linha do tempo', kw:'diario pista objetivo nota linha tempo', run:tab('diario') },
      { id:'group', ic:'users', t:'Grupo', d:'Personagens e participantes da mesa', kw:'grupo jogadores participantes', run:tab('grupo') },
      { id:'session', ic:'list', t:'Sessão', d:'Abrir, encerrar e resumir sessões', kw:'sessao resumo encerrar', run:tab('sessao') },
      { id:'world', ic:'map', t:'Mundo', d:'Relógio, locais e exploração', kw:'mundo relogio locais exploracao hora dia', run:tab('mundo') },
      mods.crafting ? { id:'craft', ic:'tool', t:'Ofício', d:'Receitas e fabricação', kw:'oficio receita fabricar craft', run:tab('oficio') } : null,
      { id:'dice', ic:'dice', t:'Dados completos', d:'Construtor de rolagens, atalhos e histórico', kw:'dados rolagem atalho historico expressao', run:tab('dados') },
      { id:'loot', ic:'compass', t:'Saque e pesca', d:'Locais, pesca e tabela completa de itens', kw:'saque pesca expedicao tabela itens discord webhook', run:() => { hudCloseSheets(); hudEnsureWho(); openDrawer(); } },
      { id:'weather', ic:'snow', t:'Clima', d:'Ver e mudar o clima da mesa', kw:'clima tempo neblina vento tempestade nevasca', run:() => { hudCloseSheets(); openWeatherPopover(); } },
      { id:'camp', ic:'layers', t:'Campanhas', d:'Trocar, criar e convidar com código', kw:'campanha convite codigo trocar nova arquivar excluir', run:tab('campanhas') },
      m ? { id:'cfg', ic:'sliders', t:'Configuração da campanha', d:'Nome, sistema, módulos e progressão', kw:'configuracao config nome sistema modulos nex nivel inventario', run:tab('campanhas', () => setTimeout(() => { const a = hudEl('cfg-anchor'); if(a) a.scrollIntoView({ block:'start' }); }, 60)) } : null,
      m ? { id:'master', ic:'lock', t:'Mestre', d:'Contêineres, recursos e backup', kw:'mestre conteiner backup restaurar recursos espacos necessidades', run:tab('mestre') } : null,
      { id:'csv', ic:'copy', t:'Registro de itens (CSV)', d:'Baixar o histórico de transações do inventário', kw:'registro csv exportar historico log baixar', run:() => { hudCloseSheets(); exportLogCsv(); } }
    ];
    return L.filter(Boolean);
  }
  function hudRenderIndex(){
    const list = hudEl('idx-list'), body = hudEl('idx-add-body'), sheet = hudEl('idx-sheet');
    sheet.appendChild(body); body.hidden = true;                    // guarda o conteúdo de "Adicionar" antes de redesenhar
    const q = hudNorm(hud.idxQ).split(/\s+/).filter(Boolean);
    const items = hudIndexItems().filter(it => { const hay = hudNorm(it.t + ' ' + it.d + ' ' + it.kw); return q.every(w => hay.includes(w)); });
    list.innerHTML = items.map(it => `<button type="button" class="idx-item" data-idx="${it.id}"${it.toggle ? ` aria-expanded="${hud.idxAdd}"` : ''}>
        <span class="idx-ic">${ic(it.ic, 20)}</span><span class="idx-tx"><b>${esc(it.t)}</b><small>${esc(it.d)}</small></span><span class="idx-go">${ic(it.toggle ? (hud.idxAdd ? 'minus' : 'plus') : 'chev', 16)}</span></button>${it.toggle ? '<div id="idx-add-slot"></div>' : ''}`).join('')
      || '<div class="inv-empty">Nada encontrado. Tente outra palavra.</div>';
    const slot = hudEl('idx-add-slot');
    if(slot && hud.idxAdd){ slot.appendChild(body); body.hidden = false; }
  }
  function hudWireIndex(){
    hudEl('idx-list').addEventListener('click', e => {
      const b = e.target.closest('[data-idx]'); if(!b) return;
      const it = hudIndexItems().find(x => x.id === b.dataset.idx); if(it) it.run();
    });
    hudEl('idx-search').addEventListener('input', e => { hud.idxQ = e.target.value; hudRenderIndex(); });
    hudEl('idx-search').addEventListener('keydown', e => { if(e.key === 'Enter'){ const b = hudEl('idx-list').querySelector('[data-idx]'); if(b) b.click(); } });
    // ao escolher uma ferramenta do mapa o índice se fecha para você tocar no mapa
    hudEl('idx-add-body').addEventListener('click', e => { if(e.target.closest('.tool-btn')) setTimeout(() => hudCloseSheets(), 120); });
  }

  // ---- rolar (rápido) ----
  function hudRollLine(r){
    if(r.sheet && r.sheet.kind) return opCompText(r);
    return fmtRoll(r) + (r.bonuses && r.bonuses.length ? ' ' + fmtBonuses(r.bonuses) : '') + ' = ' + r.total;
  }
  async function hudRoll(terms, bonuses, title){
    const w = hudWho(), who = (w && canEditHolder(holderById(w))) ? w : null;
    let res; try{ res = terms.map(t => rollTerm(t, makeSource(null))); }catch(e){ toast('Não foi possível rolar.', true); return; }
    await opRecord(who, title, res, bonuses, { kind:'quick' });
  }
  function hudRenderQR(){
    const sh = hudEl('qr-sheet'), w = hudWho(), h = holderById(w), card = w ? characters[w] : null, ordem = !!(card && card.systemId === 'ordem');
    const editable = holderList().filter(canEditHolder), can = !!(h && canEditHolder(h));
    const last = rollUI.last;
    let html = `<div class="sheet-grab" aria-hidden="true"></div><div class="sheet-head"><b>Rolar</b><button type="button" class="sheet-x" data-hud="close" aria-label="Fechar">${ic('close', 18)}</button></div>
      ${last ? `<div class="qr-last${last.sheet && last.sheet.crit ? ' crit' : ''}" role="status"><div class="qr-last-total">${last.total}</div><div><b>${esc(last.whoName || '')} · ${esc(last.skill || 'Rolagem')}</b><span>${esc(hudRollLine(last))}</span></div></div>` : ''}
      <label class="hub-label" for="qr-who">Rolando como</label>
      <select id="qr-who" data-hud-who><option value="">Sem personagem (só o seu nome)</option>${editable.map(x => opt(x.id, (x.type === 'npc' ? 'NPC · ' : '') + x.name, w)).join('')}</select>
      <div class="hub-label">Dado único</div><div class="qr-dice">${DIE_SIDES.map(s => `<button type="button" class="qr-die" data-hud="die" data-s="${s}">d${s}</button>`).join('')}</div>
      <div class="bonus-row"><button type="button" class="inv-mini-btn" data-hud="adv">Vantagem (2d20, maior)</button><button type="button" class="inv-mini-btn" data-hud="dis">Desvantagem (2d20, menor)</button></div>
      <div class="expr-row"><input type="text" id="qr-expr" placeholder="Expressão (ex.: 2d6+3, 4d6kh3)" autocomplete="off" value="${esc(hud.qrExpr || '')}"><button type="button" class="inv-mini-btn primary" data-hud="expr">${ic('dice', 16)} Rolar</button></div>`;
    if(ordem && can){
      const rows = Object.keys(card.skillsV2 || {}).map(k => opSkillDef(card, k)).sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
      const ov = opAttrOk(hud.qrAttr), pp = k => opParts(card, k, ov, 'skill');
      html += `<label class="hub-label" for="qr-attr">Atributo desta rolagem</label>
        <select id="qr-attr" data-hud-attr aria-label="Atributo desta rolagem"><option value="">Padrão de cada perícia / ataque</option>${OP_ATTRS.map(x => opt(x[0], x[1] + ' · ' + x[2] + ' (' + opAttrOf(card, x[0]) + ')', ov || '')).join('')}</select>
        <p class="hub-hint">${ov ? 'Perícias e ataques abaixo rolam com ' + esc(opAttrLabel(ov)) + ' só enquanto esta folha estiver aberta.' : 'O valor do atributo é a quantidade de d20 (fica o maior; atributo 0 = 2d20, fica o menor).'}</p>
        <div class="hub-label">Perícias de ${esc(h.name)}</div><div class="qr-chips">${rows.map(sd => { const q = pp(sd.key); return `<button type="button" class="qr-chip" data-hud="skill" data-k="${esc(sd.key)}" title="${esc(opPoolHelp(q.pool))}"><span>${esc(sd.name)}</span><b>${q.pool.label}${opSgn(opSum(q))}</b></button>`; }).join('') || '<span class="hub-hint">Adicione perícias na ficha.</span>'}</div>`;
      if((card.attacks || []).length) html += `<div class="hub-label">Ataques</div>${card.attacks.map(a => { const crit = !!(hub.opCrit && hub.opCrit[a.id]); return `<div class="qr-atk"><span><b>${esc(a.name || 'Ataque')}</b><small>${esc(a.damage || '—')}</small></span>
        <button type="button" class="inv-mini-btn primary" data-hud="atk" data-id="${esc(a.id)}">${ic('dice', 16)} Ataque ${(() => { const q = opParts(card, a.skill || '', ov || a.attribute || '', 'attack'); return q.pool.label + opSgn(opSum(q)); })()}</button>
        <button type="button" class="inv-mini-btn ${crit ? 'op-crit-btn' : ''}" data-hud="dmg" data-id="${esc(a.id)}">Dano${crit ? ' crítico' : ''}</button></div>`; }).join('')}`;
    } else if(card && can && (card.skills || []).length){
      html += `<div class="hub-label">Perícias salvas de ${esc(h.name)} (1d20 + bônus)</div><div class="qr-chips">${card.skills.map((s, i) => `<button type="button" class="qr-chip" data-hud="lskill" data-i="${i}"><span>${esc(s.name || 'Perícia')}</span><b>${opSgn(opNum(s.bonus))}</b></button>`).join('')}</div>`;
    }
    html += `<button type="button" class="inv-mini-btn qr-full" data-hud="full">Abrir dados completos (atalhos, dados físicos, histórico)</button>`;
    sh.innerHTML = html;
  }
  function hudWireQR(){
    const sh = hudEl('qr-sheet');
    sh.addEventListener('change', e => {
      if(e.target.hasAttribute('data-hud-who')){ hudSetWho(e.target.value || null); hud.who = e.target.value || null; hud.qrAttr = ''; hudRenderQR(); }
      else if(e.target.hasAttribute('data-hud-attr')){ hud.qrAttr = e.target.value || ''; hudRenderQR(); }      // atributo só desta rolagem (some ao fechar a folha)
    });
    sh.addEventListener('input', e => { if(e.target.id === 'qr-expr') hud.qrExpr = e.target.value; });
    sh.addEventListener('keydown', e => { if(e.target.id === 'qr-expr' && e.key === 'Enter'){ e.preventDefault(); sh.querySelector('[data-hud="expr"]').click(); } });
    sh.addEventListener('click', async e => {
      const b = e.target.closest('[data-hud]'); if(!b || b.hasAttribute('data-hud-who')) return;
      const D = b.dataset, w = hudWho();
      switch(D.hud){
        case 'close': hudCloseSheets(); break;
        case 'die': await hudRoll([{ sign:1, n:1, sides:+D.s }], [], 'd' + D.s); break;
        case 'adv': await hudRoll([{ sign:1, n:2, sides:20, kh:1 }], [], 'Vantagem (2d20, maior)'); break;
        case 'dis': await hudRoll([{ sign:1, n:2, sides:20, kl:1 }], [], 'Desvantagem (2d20, menor)'); break;
        case 'expr': { const pe = parseExpr(hud.qrExpr || ''); if(pe.error){ toast(pe.error, true); break; } await hudRoll(pe.terms, pe.bonus ? [{ label:'Fixo', value:pe.bonus }] : [], String(hud.qrExpr).trim()); break; }
        case 'skill': await opRollSkill(D.k, w, hud.qrAttr); break;
        case 'atk': await opRollAttack(D.id, w, hud.qrAttr); break;
        case 'dmg': await opRollDamage(D.id, w); break;
        case 'lskill': { const s = ((characters[w] || {}).skills || [])[+D.i]; if(s) await hudRoll([{ sign:1, n:1, sides:20 }], Number(s.bonus) ? [{ label:s.name || 'Bônus', value:Number(s.bonus) }] : [], s.name || 'Perícia'); break; }
        case 'full': hudCloseSheets(); openHub('dados'); break;
      }
    });
  }
  function hudOpenQuickRoll(){ if(!hudReady) return; if(!hudIsOpen('qr-sheet')){ hud.qrAttr = ''; hudRenderQR(); hudOpenSheet('qr-sheet'); } }
  function hudQRChanged(){
    if(!hudReady || !hudIsOpen('qr-sheet')) return;
    const sh = hudEl('qr-sheet'), ae = document.activeElement;
    if(ae && sh.contains(ae) && /^(INPUT|SELECT)$/.test(ae.tagName)) return;      // não atrapalha quem está digitando
    const sel = ae && sh.contains(ae) && ae.dataset && ae.dataset.hud ? '[data-hud="' + ae.dataset.hud + '"]' + ['k', 'id', 's', 'i'].filter(k => ae.dataset[k] != null).map(k => `[data-${k}="${ae.dataset[k]}"]`).join('') : null;
    const st = sh.scrollTop;
    hudRenderQR();
    sh.scrollTop = st;
    if(sel){ const el = sh.querySelector(sel); if(el) el.focus({ preventScroll:true }); }
  }

  // ---- feed vivo ----
  const HUD_FEED_FILTERS = [['all', 'Tudo'], ['dados', 'Dados'], ['itens', 'Itens'], ['diario', 'Diário']];
  const HUD_FEED_M = [['all', 'Todos'], ['jogadores', 'Só jogadores'], ['mestre', 'Só mestre']];
  const HUD_LOOT_IC = { saque:'compass', guardar:'bag', adicionar:'bag', pegar:'bag', depositar:'bag', troca:'users', craft:'tool', usar:'heart', descartar:'close', vasculhar:'box', ajuste:'sliders', recusar:'close', condicao:'alert', reparar:'tool', inv_removido:'skull' };
  const HUD_J_IC = { resumo:'book', pista:'eye', decisao:'check', objetivo:'target', nota:'note', evento:'alert' };
  function hudPrefKey(){ return 'tv-feed:' + activeCampaignId; }
  function hudLoadPrefs(){
    const f = hud.feed; f.f = 'all'; f.m = 'all'; f.collapsed = false; hud.miniOff = false; f.seen = Date.now(); f.open = null; f.more = false; f.sheet = false; f.tall = false;
    try{
      const o = JSON.parse(localStorage.getItem(hudPrefKey()) || 'null');
      if(o){ if(HUD_FEED_FILTERS.some(x => x[0] === o.f)) f.f = o.f; if(HUD_FEED_M.some(x => x[0] === o.m)) f.m = o.m; f.collapsed = !!o.collapsed; hud.miniOff = !!o.mo; if(o.seen) f.seen = o.seen; }
    }catch(e){}
  }
  function hudSavePrefs(){ try{ const f = hud.feed; localStorage.setItem(hudPrefKey(), JSON.stringify({ f:f.f, m:f.m, collapsed:f.collapsed, mo:!!hud.miniOff, seen:f.seen })); }catch(e){} }
  function hudFeedItems(){
    const out = [];
    Object.keys(rolls).forEach(k => { const r = rolls[k]; if(r) out.push({ key:'r:' + k, kind:'dados', ts:r.ts || 0, by:r.actorName || r.whoName || '?', byId:r.actorId, data:r }); });
    lootLog.forEach(e => { if(e) out.push({ key:'l:' + (e.id || e.ts), kind:'itens', ts:e.ts || 0, by:e.actorName || '?', byId:e.actorId, data:e }); });
    journalAll().forEach(e => out.push({ key:'j:' + e.id, kind:'diario', ts:e.ts || 0, by:e.author || '?', byId:e.authorId, priv:e.vis === 'mestre', data:e }));
    return out.filter(it => !(it.kind === 'itens' && it.data.action === 'guardar' && (it.data.source === 'saque' || it.data.source === 'pesca')))   // o "encontrou" já conta essa história
      .sort((a, b) => (b.ts - a.ts) || String(b.key).localeCompare(String(a.key)));
  }
  function hudByMaster(it){ const mid = campaignMeta && campaignMeta.masterId; return !!(it.priv || (mid && it.byId === mid)); }
  function hudFeedVisible(){
    const f = hud.feed, master = isMaster();
    return hudFeedItems().filter(it => (f.f === 'all' || it.kind === f.f) && (!master || f.m === 'all' || (f.m === 'mestre' ? hudByMaster(it) : !hudByMaster(it))));
  }
  function hudRel(ts){
    if(!ts) return '';
    const d = Date.now() - ts;
    if(d < 45000) return 'agora';
    if(d < 3600000) return Math.max(1, Math.round(d / 60000)) + ' min';
    const t = new Date(ts), n = new Date(), p = v => String(v).padStart(2, '0');
    return (t.toDateString() === n.toDateString() ? '' : p(t.getDate()) + '/' + p(t.getMonth() + 1) + ' ') + p(t.getHours()) + ':' + p(t.getMinutes());
  }
  function hudIconOf(it){
    if(it.kind === 'dados') return it.data.sheet && it.data.sheet.kind === 'attack' ? 'swords' : 'dice';
    if(it.kind === 'itens') return HUD_LOOT_IC[it.data.action] || 'bag';
    if(it.data.type === 'evento') return it.data.evKind === 'clima' ? ((WEATHER_STATES[it.data.wx] || {}).icon || 'snow') : 'alert';
    return HUD_J_IC[it.data.type] || 'note';
  }
  function hudShort(it){
    const d = it.data;
    if(it.kind === 'dados') return `${d.total} — ${d.skill || 'Rolagem'}`;
    if(it.kind === 'itens') return hudPlain(logText(d)).replace(/\s*\(item \d+ de \d+\)/, '');
    return (d.title || d.text || (DJ_TYPES.find(t => t[0] === d.type) || ['', 'Diário'])[1]).slice(0, 80);
  }
  function hudUnseen(){
    const me = actorFields().actorId, seen = hud.feed.seen;
    return hudFeedItems().filter(it => it.ts > seen && it.byId !== me && (isMaster() || !it.priv)).length;
  }
  function hudRow(it){
    const d = it.data, open = hud.feed.open === it.key, ic0 = hudIconOf(it);
    let head, line, side = '', detail = '', cls = it.kind;
    if(it.kind === 'dados'){
      const crit = d.sheet && d.sheet.kind === 'attack' && d.sheet.crit;
      head = `${esc(d.whoName || it.by)} <span>· ${esc(d.skill || 'Rolagem')}</span>${crit ? ' <em class="fd-crit">CRÍTICO!</em>' : ''}`;
      line = esc(hudRollLine(d)); side = `<span class="fd-total">${d.total}</span>`;
      detail = `<div class="fd-full">${esc(hudRollLine(d))}</div>${d.note ? `<div class="fd-note">“${esc(d.note)}”</div>` : ''}<div class="fd-meta">${esc(it.by)} · ${esc(fmtTs(it.ts))}${d.physical ? ' · dados físicos' : ''}</div>`;
    } else if(it.kind === 'itens'){
      head = `${esc(ACTION_LABELS[d.action] || d.action)} <span>· ${esc(d.holderName || '')}</span>`;
      line = logText(d);
      detail = `<div class="fd-full">${line}</div>${d.note ? `<div class="fd-note">“${esc(d.note)}”</div>` : ''}<div class="fd-meta">${esc(it.by)} · ${esc(fmtTs(it.ts))}</div>${d.holderId && holderById(d.holderId) ? `<button type="button" class="inv-mini-btn" data-fd="inv" data-id="${esc(d.holderId)}">${ic('bag', 16)} Abrir inventário</button>` : ''}`;
    } else {
      const tl = (DJ_TYPES.find(t => t[0] === d.type) || ['', d.type])[1];
      head = `${esc(tl)}${it.priv ? ' <span>· privado</span>' : ''}${d.title ? ' <span>· ' + esc(d.title) + '</span>' : ''}`;
      line = esc(d.text || ''); cls += d.type === 'evento' ? ' ev' : '';
      detail = `<div class="fd-full fd-pre">${esc(d.text || d.title || '')}</div><div class="fd-meta">${esc(it.by)} · ${esc(fmtTs(it.ts))}</div><button type="button" class="inv-mini-btn" data-fd="diary">${ic('book', 16)} Abrir diário</button>`;
    }
    return `<div class="fd-row ${cls}${open ? ' open' : ''}"><button type="button" class="fd-main" data-fd="toggle" data-key="${esc(it.key)}" aria-expanded="${open}">
      <span class="fd-ic">${ic(ic0, 18)}</span><span class="fd-body"><b>${head}</b><span class="fd-line">${line}</span></span><span class="fd-side">${side}<time>${esc(hudRel(it.ts))}</time></span></button>${open ? `<div class="fd-detail">${detail}</div>` : ''}</div>`;
  }
  function hudRenderFeed(){
    const f = hud.feed, items = hudFeedVisible(), master = isMaster();
    hudEl('feed-filters').innerHTML = HUD_FEED_FILTERS.map(x => `<button type="button" class="fd-chip${f.f === x[0] ? ' on' : ''}" data-fd="filter" data-v="${x[0]}" aria-pressed="${f.f === x[0]}">${x[1]}</button>`).join('');
    const mf = hudEl('feed-mfilters'); mf.hidden = !master;
    if(master) mf.innerHTML = HUD_FEED_M.map(x => `<button type="button" class="fd-chip${f.m === x[0] ? ' on' : ''}" data-fd="mfilter" data-v="${x[0]}" aria-pressed="${f.m === x[0]}">${x[1]}</button>`).join('');
    const cap = hudCol() && !f.more ? 20 : 100;
    hudEl('feed-list').innerHTML = items.length ? items.slice(0, cap).map(hudRow).join('') + (items.length > cap ? '<button type="button" class="inv-mini-btn fd-more" data-fd="more">Ver mais</button>' : '')
      : '<div class="inv-empty">Nada por aqui ainda. Rolagens, itens e o diário da mesa aparecem neste feed.</div>';
    hudFeedChip();
  }
  function hudFeedChip(){
    const chip = hudEl('feed-chip'), f = hud.feed, col = hudCol();
    const all = hudFeedItems().filter(it => isMaster() || !it.priv), last = all[0], n = hudUnseen();
    const visibleNow = col ? !f.collapsed : f.sheet;
    chip.hidden = col && !f.collapsed;
    chip.setAttribute('aria-expanded', String(visibleNow));
    chip.innerHTML = `<span class="fc-ic">${ic(last ? hudIconOf(last) : 'list', 16)}</span><span class="fc-tx">${last ? esc(hudShort(last)) : 'Feed da mesa'}</span>${n && !visibleNow ? `<span class="fc-badge" aria-label="${n} novas">${n > 99 ? '99+' : n}</span>` : ''}`;
    chip.setAttribute('aria-label', 'Abrir o feed da mesa' + (n && !visibleNow ? ', ' + n + ' novas' : ''));
  }
  function hudMarkSeen(){ const f = hud.feed; if(!(hudCol() ? !f.collapsed : f.sheet)) return; const top = hudFeedItems()[0]; const t = Math.max(f.seen, top ? top.ts : 0, Date.now() - 2000); if(t !== f.seen){ f.seen = t; hudSavePrefs(); } }
  function hudFeedLayout(){
    const f = hud.feed, col = hudCol(), feed = hudEl('feed');
    document.body.classList.toggle('feed-col', col && !f.collapsed);
    document.body.classList.toggle('mini-col', col && !hud.miniOff);
    const open = col ? !f.collapsed : f.sheet;
    feed.classList.toggle('open', open); feed.classList.toggle('tall', !col && f.tall);
    hudEl('feed-backdrop').classList.toggle('open', !col && f.sheet);
    hudEl('feed-close').setAttribute('aria-label', col ? 'Recolher o feed' : 'Fechar o feed');
    if(open) hudMarkSeen();
    hudRenderFeed(); hudRenderMini();
    hudDockSync();
  }
  function hudFeedOpen(v){
    const f = hud.feed;
    if(hudCol()){ f.collapsed = !v; hudSavePrefs(); }
    else { if(v){ closeHub(); closeDrawer(); closeNavDrawer(); closeInventory(); hudCloseSheets('feed'); } f.sheet = !!v; if(!v) f.tall = false; }
    hudFeedLayout();
  }
  function hudFeedChanged(){
    if(!hudReady) return;
    const f = hud.feed;
    if(hudCol() ? !f.collapsed : f.sheet) hudMarkSeen();
    hudRenderFeed();
  }
  function hudWireFeed(){
    const feed = hudEl('feed');
    hudEl('feed-chip').addEventListener('click', () => hudFeedOpen(true));
    hudEl('feed-close').addEventListener('click', () => hudFeedOpen(false));
    hudEl('feed-backdrop').addEventListener('click', () => hudFeedOpen(false));
    hudDrag(feed, () => hudFeedOpen(false), v => { hud.feed.tall = v; hudFeedLayout(); }, () => hud.feed.tall);
    feed.addEventListener('click', e => {
      const b = e.target.closest('[data-fd]'); if(!b) return;
      const D = b.dataset, f = hud.feed;
      if(D.fd === 'toggle'){ f.open = f.open === D.key ? null : D.key; hudRenderFeed(); }
      else if(D.fd === 'filter'){ f.f = D.v; hudSavePrefs(); hudRenderFeed(); }
      else if(D.fd === 'mfilter'){ f.m = D.v; hudSavePrefs(); hudRenderFeed(); }
      else if(D.fd === 'more'){ f.more = true; hudRenderFeed(); }
      else if(D.fd === 'inv'){ if(!hudCol()) hud.feed.sheet = false; hudFeedLayout(); openInventory(D.id); }
      else if(D.fd === 'diary'){ if(!hudCol()) hud.feed.sheet = false; hudFeedLayout(); openHub('diario'); }
    });
    const mq = window.matchMedia ? window.matchMedia('(min-width:1100px)') : null;
    if(mq){ const onMq = () => { hud.feed.sheet = false; hud.feed.tall = false; hudFeedLayout(); }; if(mq.addEventListener) mq.addEventListener('change', onMq); else if(mq.addListener) mq.addListener(onMq); }
    setInterval(() => { if(document.visibilityState === 'visible') hudFeedChip(); }, 30000);   // "2 min" → "3 min"
  }

  // ---- mini-ficha (coluna esquerda no desktop largo) ----
  function hudMiniBar(card, k, can){
    const r = opRes(card, k), pct = r.max > 0 ? Math.max(0, Math.min(100, Math.round(r.cur / r.max * 100))) : 0, low = r.max > 0 && r.cur / r.max < 0.3, nm = OP_RES[k], dis = can ? '' : 'disabled';
    return `<div class="mn-bar"><div class="mn-bar-top"><b>${nm[0]}</b><span>${low ? ic('alert', 13) : ''}${r.cur} / ${r.max}</span></div>
      <div class="mn-bar-row"><button type="button" class="die-btn" data-hud="mres" data-k="${k}" data-d="-1" aria-label="Reduzir ${esc(nm[1])}" ${dis}>${ic('minus', 14)}</button>
      <div class="op-bar${low ? ' low' : ''}" style="--c:${nm[2]}" role="meter" aria-valuemin="0" aria-valuemax="${r.max}" aria-valuenow="${r.cur}" aria-label="${esc(nm[1])}"><i style="width:${pct}%"></i></div>
      <button type="button" class="die-btn" data-hud="mres" data-k="${k}" data-d="1" aria-label="Aumentar ${esc(nm[1])}" ${dis}>${ic('plus', 14)}</button></div></div>`;
  }
  function hudRenderMini(){
    const el = hudEl('mini'); if(!el) return;
    const tab = hudEl('mini-tab');
    if(!hudCol()){ el.hidden = true; if(tab) tab.hidden = true; return; }
    el.hidden = !!hud.miniOff;
    if(tab){ tab.hidden = !hud.miniOff; tab.innerHTML = ic('user', 20); tab.setAttribute('aria-expanded', 'false'); }
    if(hud.miniOff) return;
    const ae = document.activeElement; if(ae && el.contains(ae) && ae.tagName === 'SELECT') return;
    const w = hudWho(), h = holderById(w), card = w ? characters[w] : null, can = !!(h && canEditHolder(h));
    const opts = holderList().filter(canEditHolder);
    let html = `<div class="mn-head"><span class="mn-tag">Personagem</span><button type="button" class="mn-hide" data-hud="mhide" aria-label="Recolher o painel do personagem" title="Recolher">${ic('close', 18)}</button><select data-hud-mini aria-label="Personagem ativo"><option value="">— escolher —</option>${opts.map(x => opt(x.id, x.name, w)).join('')}</select></div>`;
    if(!h){ html += '<p class="hub-hint">Escolha um personagem para ver a ficha resumida aqui. Crie um token no mapa se ainda não tiver um.</p>'; el.innerHTML = html; return; }
    const ordem = !!(card && card.systemId === 'ordem');
    const nm = (card && card.name) || h.name;
    html += `<div class="mn-name">${esc(nm)}</div>`;
    if(ordem){
      const meta = card.meta || {}, nex = card.nex == null ? 5 : card.nex, lvl = card.level == null ? 1 : card.level;
      html += `<div class="mn-sub">${esc([meta.class, meta.origin].filter(Boolean).join(' · '))}${(meta.class || meta.origin) ? ' · ' : ''}NEX ${nex}%${cfg().progressionMode !== 'nex_only' ? ' · Nível ' + esc(String(lvl)) : ''}</div>
        ${hudMiniBar(card, 'pv', can)}${hudMiniBar(card, 'pd', can)}
        <div class="mn-attrs">${OP_ATTRS.map(a => `<div><small>${a[1]}</small><b>${opNum(card.attributes && card.attributes[a[0]])}</b></div>`).join('')}</div>
        <div class="op-conds">${(card.conditions || []).map(cd => `<span class="op-cond mn-cond">${ic((OP_COND[cd.key] || {}).i || 'alert', 13)}<span>${esc(opCondName(cd))}</span></span>`).join('') || '<span class="hub-hint">Sem condições.</span>'}</div>`;
    } else if(card){
      html += `<div class="mn-sub">Formato antigo da ficha. Abra a ficha completa para migrar para Ordem Paranormal.</div>${cfg().resources.map(r => `<div class="mn-res"><span>${esc(r.label)}</span><b>${resVal(card, r)}${r.max ? ' / ' + r.max : ''}</b></div>`).join('')}`;
    } else html += '<div class="mn-sub">Ficha ainda vazia. Abra a ficha completa para começar.</div>';
    html += `<div class="inv-item-actions"><button type="button" class="inv-mini-btn primary" data-hud="mrollq">${ic('dice', 16)} Rolar</button><button type="button" class="inv-mini-btn" data-hud="msheet">${ic('user', 16)} Ficha completa</button><button type="button" class="inv-mini-btn" data-hud="minv">${ic('bag', 16)} Inventário</button></div>`;
    el.innerHTML = html;
  }
  function hudMiniChanged(){ if(hudReady) hudRenderMini(); }
  function hudWireMini(){
    const el = hudEl('mini');
    el.addEventListener('change', e => { if(e.target.hasAttribute('data-hud-mini')) hudSetWho(e.target.value || null); });
    hudEl('mini-tab').addEventListener('click', () => { hud.miniOff = false; hudSavePrefs(); hudFeedLayout(); });
    el.addEventListener('click', e => {
      const b = e.target.closest('[data-hud]'); if(!b) return;
      const w = hudWho();
      if(b.dataset.hud === 'mhide'){ hud.miniOff = true; hudSavePrefs(); hudFeedLayout(); setTimeout(() => { const t = hudEl('mini-tab'); if(t) t.focus(); }, 0); }
      else if(b.dataset.hud === 'mres') opAdjustRes(b.dataset.k, +b.dataset.d, w);
      else if(b.dataset.hud === 'mrollq') hudOpenQuickRoll();
      else if(b.dataset.hud === 'msheet'){ if(w) hub.charToken = w; openHub('ficha'); }
      else if(b.dataset.hud === 'minv'){ hudEnsureWho(); openInventory(w); }
    });
  }

  // ---- filtros do mapa (chips no topo) ----
  // Cada chip liga/desliga uma categoria. Pins e tokens são escondidos por CSS (classe hf-<cat> no #map + classe mk-<cat> no
  // marcador, definida em pinIcon/tokenIcon); áreas e rotas saem do mapa junto com a camada. Nada é apagado: só deixa de aparecer.
  // A escolha fica salva neste aparelho, por campanha (tv-mapf:<campanha>).
  const MAPF = [['pins', 'Pins'], ['tokens', 'Tokens'], ['perigos', 'Perigos'], ['rotas', 'Rotas'], ['notas', 'Notas'], ['lugares', 'Lugares']];
  const mapfKey = () => 'tv-mapf:' + activeCampaignId;
  function mapfLoad(){
    hud.mapf = new Set();
    try{ const a = JSON.parse(localStorage.getItem(mapfKey()) || '[]'); if(Array.isArray(a)) a.forEach(k => { if(MAPF.some(x => x[0] === k)) hud.mapf.add(k); }); }catch(e){}
  }
  function mapfSave(){
    try{ if(hud.mapf.size) localStorage.setItem(mapfKey(), JSON.stringify(Array.from(hud.mapf))); else localStorage.removeItem(mapfKey()); }catch(e){}
  }
  function mapfCounts(){
    const c = { pins:0, tokens:tokens.length, perigos:shapes.length, rotas:routes.length, notas:0, lugares:pl.total };
    pins.forEach(p => { c[mapfCat(p.type)]++; });
    return c;
  }
  function mapfApply(){
    if(!hudReady) return;
    const m = document.getElementById('map');
    MAPF.forEach(x => m.classList.toggle('hf-' + x[0], hud.mapf.has(x[0])));
    [[shapesLayer, 'perigos'], [routesLayer, 'rotas']].forEach(x => {
      const off = hud.mapf.has(x[1]), on = map.hasLayer(x[0]);
      if(off && on) map.removeLayer(x[0]); else if(!off && !on) map.addLayer(x[0]);
    });
    mapfRender(); clusterUpdate();
  }
  function mapfRender(){
    if(!hudReady) return;
    const nav = hudEl('map-chips'); if(!nav) return;
    const cnt = mapfCounts();
    nav.querySelectorAll('[data-mf]').forEach(b => {
      const k = b.dataset.mf, off = hud.mapf.has(k), label = MAPF.find(x => x[0] === k)[1];
      b.classList.toggle('off', off); b.setAttribute('aria-pressed', String(!off));
      b.setAttribute('aria-label', label + ' (' + cnt[k] + '): ' + (off ? 'ocultos. Toque para mostrar' : 'visíveis. Toque para ocultar'));
      const n = b.querySelector('.mc-n'); if(n) n.textContent = cnt[k] ? String(cnt[k]) : '';
    });
    const dot = nav.querySelector('.mc-dot'); if(dot) dot.hidden = !hud.mapf.size;
    const box = hudEl('lay-hidden'); if(box){
      box.hidden = !hud.mapf.size;
      if(hud.mapf.size) hudEl('lay-hidden-txt').textContent = 'Ocultos no mapa: ' + MAPF.filter(x => hud.mapf.has(x[0])).map(x => x[1]).join(', ') + '.';
    }
  }
  function mapfToggle(k){
    if(hud.mapf.has(k)) hud.mapf.delete(k); else { hud.mapf.add(k); map.closePopup(); }
    mapfApply(); mapfSave();
  }
  // categoria oculta que o usuário passa a usar (ferramenta de criação, "ir até") volta a aparecer
  function mapfReveal(k, say){
    if(!hudReady || !hud.mapf.has(k)) return false;
    hud.mapf.delete(k); mapfApply(); mapfSave();
    if(say) toast(MAPF.find(x => x[0] === k)[1] + ' voltaram a aparecer no mapa.');
    return true;
  }
  function mapfWire(){
    hudEl('map-chips').addEventListener('click', e => {
      const b = e.target.closest('button'); if(!b) return;
      if(b.dataset.mf) mapfToggle(b.dataset.mf);
      else if(b.id === 'mchip-layers') hudToggleSheet('lay-sheet', renderNavList);
    });
    // a barra rola na horizontal: um esmaecido na ponta direita avisa que há mais chips
    const bar = hudEl('map-chips'), edge = () => bar.classList.toggle('more', bar.scrollWidth - bar.scrollLeft - bar.clientWidth > 4);
    bar.addEventListener('scroll', edge, { passive:true }); window.addEventListener('resize', edge);
    if(window.ResizeObserver) new ResizeObserver(edge).observe(bar);
    setTimeout(edge, 0);
    hudEl('lay-showall').addEventListener('click', () => { hud.mapf.clear(); mapfApply(); mapfSave(); });
    document.addEventListener('click', e => {
      const b = e.target.closest && e.target.closest('#tool-token, #token-select-toggle-btn, #tool-area-polygon, #tool-area-rect, #tool-area-circle, #tool-route, #pin-buttons .tool-btn');
      if(!b || b.classList.contains('active')) return;
      mapfReveal(b.id === 'tool-route' ? 'rotas' : (/^tool-area/.test(b.id) ? 'perigos' : (b.dataset.pinType ? mapfCat(b.dataset.pinType) : 'tokens')), true);
    }, true);
  }


  // ---- lugares reais (OpenStreetMap) ----
  // Pontos de interesse reais (hospital, farmácia, hotel, posto…) aparecem no mapa e viram locais de saque.
  // Nada é gravado até alguém tocar em "Vasculhar": aí o lugar vira um pin comum (id osm_<tipo><id>) e o saque usa
  // o sistema de contêineres que já existe, então o estado vale para a mesa toda. Consulta pela API Overpass,
  // em blocos de mapa (zoom 14), guardados no aparelho por 14 dias para não repetir pedidos.
  function placeCatOf(tags){
    for(const k of ['amenity', 'shop', 'tourism']){ const m = tags[k] && PLACE_TAGS[k][tags[k]]; if(m) return { cat:m, tag:k + '=' + tags[k] }; }
    return null;
  }
  const pl = { tiles:{}, markers:{}, fail:{}, busy:false, cur:null, timer:null, warmTimer:null, retryTimer:null, retries:0, t0:null, tick:null, err:null, good:null, status:'', total:0 };
  const PLACE_LS = 'tv-poi2:';
  const plTileOf = (lat, lng) => { const n = 1 << PLACE_ZOOM, r = lat * Math.PI / 180; return { x:Math.floor((lng + 180) / 360 * n), y:Math.floor((1 - Math.log(Math.tan(r) + 1 / Math.cos(r)) / Math.PI) / 2 * n) }; };
  const plTileBox = (x, y) => { const n = 1 << PLACE_ZOOM, lng = k => k / n * 360 - 180, lat = k => Math.atan(Math.sinh(Math.PI * (1 - 2 * k / n))) * 180 / Math.PI; return { w:lng(x), e:lng(x + 1), n:lat(y), s:lat(y + 1) }; };
  const plKey = (x, y) => PLACE_ZOOM + '/' + x + '/' + y;
  const plCool = k => !!pl.fail[k] && Date.now() - pl.fail[k] < PLACE_COOL;

  // ---- guardados no aparelho (por bloco) ----
  function plGet(key){
    let t = pl.tiles[key];
    if(!t){ try{ t = JSON.parse(localStorage.getItem(PLACE_LS + key) || 'null'); }catch(e){ t = null; } if(t && t.exp > Date.now()) pl.tiles[key] = t; else t = null; }
    else if(!(t.exp > Date.now())){ delete pl.tiles[key]; t = null; }
    return t;
  }
  // apaga o que venceu e o guardado da versão antiga (que podia ter gravado "área vazia" por engano); com mais=true, também o mais velho
  function plPurge(mais){
    try{
      const ks = [], rows = [];
      for(let i = 0; i < localStorage.length; i++){ const k = localStorage.key(i); if(k && k.indexOf('tv-poi') === 0) ks.push(k); }
      ks.forEach(k => {
        if(k.indexOf(PLACE_LS) !== 0){ localStorage.removeItem(k); return; }
        let t = null; try{ t = JSON.parse(localStorage.getItem(k)); }catch(e){}
        if(!t || !(t.exp > Date.now())) localStorage.removeItem(k); else rows.push({ k, exp:t.exp });
      });
      if(mais) rows.sort((a, b) => a.exp - b.exp).slice(0, Math.max(10, Math.ceil(rows.length / 3))).forEach(r => { localStorage.removeItem(r.k); delete pl.tiles[r.k.slice(PLACE_LS.length)]; });
    }catch(e){}
  }
  function plPut(key, list){
    const rec = { exp:Date.now() + (list.length ? PLACE_TTL : PLACE_TTL_EMPTY), list };   // "nenhum lugar" vale só 1 dia: pode ter sido um servidor incompleto
    pl.tiles[key] = rec; delete pl.fail[key];
    const s = JSON.stringify(rec);
    try{ localStorage.setItem(PLACE_LS + key, s); }
    catch(e){ plPurge(true); try{ localStorage.setItem(PLACE_LS + key, s); }catch(e2){} }
  }

  // ---- aviso na tela ----
  function plSay(txt, retry){
    pl.status = txt; const el = hudEl('pl-status'); if(!el) return;
    el.textContent = txt; el.hidden = !txt;
    const r = !!retry && !!txt;
    el.classList.toggle('pl-retry', r);
    if(r){ el.setAttribute('role', 'button'); el.tabIndex = 0; } else { el.setAttribute('role', 'status'); el.removeAttribute('tabindex'); }
  }
  function plLoadingText(){ const s = pl.t0 ? Math.round((Date.now() - pl.t0) / 1000) : 0; return 'Carregando lugares…' + (s >= 3 ? ' ' + s + ' s' : ''); }
  function plWhy(){
    const d = (pl.err || []).filter(x => x.why);
    if(!d.length) return 'Sem resposta do OpenStreetMap.';
    const http = d.find(x => /^HTTP/.test(x.why));
    if(http) return 'OpenStreetMap ocupado (' + http.why + ').';
    if(d.every(x => x.why === 'sem rede')) return 'Sem conexão com o OpenStreetMap.';
    if(d.every(x => x.why === 'tempo esgotado')) return 'OpenStreetMap demorou demais.';
    return 'Sem resposta do OpenStreetMap.';
  }

  // ---- consulta (Overpass) ----
  function plQuery(b){
    const f = Object.keys(PLACE_TAGS).map(k => '["' + k + '"~"^(' + Object.keys(PLACE_TAGS[k]).join('|') + ')$"]');
    const bb = '(' + [b.s, b.w, b.n, b.e].map(v => v.toFixed(5)).join(',') + ')';
    return '[out:json][timeout:15][maxsize:104857600];(' + f.map(x => 'node' + x + bb + ';way' + x + bb + ';').join('') + ');out center;';   // forma mais simples e documentada do "out": nós com lat/lon, vias com centro
  }
  // o servidor que respondeu bem da última vez vai primeiro
  function plOrder(){
    let g = pl.good; if(!g){ try{ g = localStorage.getItem('tv-op-mirror'); }catch(e){} }
    const a = PLACE_API.slice(), i = a.findIndex(m => m.name === g);
    if(i > 0) a.unshift(a.splice(i, 1)[0]);
    return a;
  }
  // Pergunta ao primeiro servidor; se ele falhar ou demorar PLACE_HEDGE_MS, já pergunta ao próximo SEM cancelar o anterior.
  // Vale a primeira resposta com dados. Uma resposta vazia espera a confirmação de um segundo servidor. Cada tentativa tem prazo.
  function plRace(q, outer){
    return new Promise((resolve, reject) => {
      const order = plOrder(), diag = [], ctls = [], timers = [];
      let done = false, started = 0, open = 0, empty = null, hedge = null;
      const stop = () => { done = true; timers.forEach(clearTimeout); ctls.forEach(c => { try{ c.abort(); }catch(e){} }); };
      const win = (els, m) => { if(done) return; stop(); pl.good = m.name; try{ localStorage.setItem('tv-op-mirror', m.name); }catch(e){} resolve(els); };
      const lose = () => { if(done) return; stop(); const e = new Error('sem resposta'); e.diag = diag; reject(e); };
      const next = () => {
        if(done || started >= order.length) return false;
        clearTimeout(hedge);
        const m = order[started++]; open++; attempt(m);
        hedge = setTimeout(next, PLACE_HEDGE_MS); timers.push(hedge);
        return true;
      };
      const attempt = async m => {
        const ctl = new AbortController(), t0 = Date.now(); ctls.push(ctl);
        const tm = setTimeout(() => ctl.abort(), PLACE_TRY_MS); timers.push(tm);
        let els = null, why = '';
        try{
          const r = await fetch(m.url, { method:'POST', body:'data=' + encodeURIComponent(q), headers:{ 'Content-Type':'application/x-www-form-urlencoded' }, signal:ctl.signal });
          if(!r.ok) why = 'HTTP ' + r.status;
          else{
            let j = null; try{ j = await r.json(); }catch(e2){ if(ctl.signal.aborted) throw e2; }
            if(!j || !Array.isArray(j.elements)) why = 'resposta inválida';
            else if(j.remark && /error|timed out|too many|rate/i.test(String(j.remark))) why = 'servidor ocupado';   // o Overpass responde 200 com "remark" quando estoura tempo ou memória
            else els = j.elements;
          }
        }catch(e){ why = done ? '' : (ctl.signal.aborted ? 'tempo esgotado' : 'sem rede'); }
        clearTimeout(tm); open--;
        if(done) return;
        const ms = Date.now() - t0;
        if(els){
          diag.push({ m:m.name, ms, n:els.length });
          if(els.length || empty) return win(els, m);
          empty = m;
          if(!next() && !open) win(els, m);
          return;
        }
        diag.push({ m:m.name, ms, why });
        if(!next() && !open){ if(empty) win([], empty); else lose(); }
      };
      timers.push(setTimeout(() => { if(done) return; if(empty) win([], empty); else { diag.push({ m:'', why:'tempo esgotado' }); lose(); } }, PLACE_TOTAL_MS));
      if(outer){
        const cancel = () => { if(done) return; stop(); const e = new Error('cancelado'); e.cancelled = true; reject(e); };
        if(outer.aborted) return cancel();
        outer.addEventListener('abort', cancel);
      }
      if(!next()) lose();
    });
  }
  function plParse(els){
    const out = [], seen = new Set();
    els.forEach(e => {
      const tg = e.tags || {}, c = placeCatOf(tg); if(!c) return;
      const lat = e.lat != null ? e.lat : (e.center && e.center.lat), lng = e.lon != null ? e.lon : (e.center && e.center.lon);
      if(lat == null || lng == null) return;
      const key = String(e.type || 'n').charAt(0) + e.id; if(seen.has(key)) return; seen.add(key);
      const addr = [tg['addr:street'], tg['addr:housenumber']].filter(Boolean).join(', ');
      out.push({ k:key, lat, lng, name:String(tg.name || '').slice(0, 80), cat:c.cat, tag:c.tag, addr:addr.slice(0, 90) });
    });
    return out;
  }
  // UMA consulta para vários blocos: pega o retângulo que cobre todos e distribui o resultado por bloco (cada um fica guardado)
  async function plFetchTiles(tiles, outer){
    const xs = tiles.map(t => t.x), ys = tiles.map(t => t.y), x0 = Math.min.apply(null, xs), x1 = Math.max.apply(null, xs), y0 = Math.min.apply(null, ys), y1 = Math.max.apply(null, ys);
    const a = plTileBox(x0, y0), z = plTileBox(x1, y1);
    const list = plParse(await plRace(plQuery({ w:a.w, n:a.n, e:z.e, s:z.s }), outer)), by = {};
    list.forEach(p => { const t = plTileOf(p.lat, p.lng), k = plKey(t.x, t.y); (by[k] = by[k] || []).push(p); });
    for(let x = x0; x <= x1; x++) for(let y = y0; y <= y1; y++){ const k = plKey(x, y); plPut(k, by[k] || []); }
  }
  function plViewTiles(){
    const b = map.getBounds(), a = plTileOf(b.getNorth(), b.getWest()), z = plTileOf(b.getSouth(), b.getEast()), out = [];
    for(let x = a.x; x <= z.x; x++) for(let y = a.y; y <= z.y; y++) out.push({ x, y, key:plKey(x, y) });
    return out;
  }
  // o que buscar agora: 1) a tela (os blocos mais perto do centro primeiro); 2) em segundo plano, o entorno dos tokens e do centro,
  // para o ícone já estar pronto quando alguém aproximar
  function plNextJob(){
    const z = map.getZoom(), c = map.getCenter(), ct = plTileOf(c.lat, c.lng), dist = t => Math.hypot(t.x - ct.x, t.y - ct.y);
    if(z >= PLACE_ZOOM){
      const v = plViewTiles();
      if(v.length <= PLACE_MAX_TILES){
        const m = v.filter(t => !plGet(t.key) && !plCool(t.key)).sort((a, b) => dist(a) - dist(b)).slice(0, PLACE_CHUNK);
        if(m.length) return { fg:true, tiles:m };
      }
    }
    const foci = [], add = k => { if(!foci.some(f => f.x === k.x && f.y === k.y)) foci.push(k); };
    tokens.forEach(t => { if(!t.containerId && isFinite(t.lat) && isFinite(t.lng)) add(plTileOf(t.lat, t.lng)); });
    if(z === PLACE_ZOOM - 1) add(ct);   // um nível antes do zoom de cidade: o centro também já fica pronto
    for(const f of foci.slice(0, 4)){
      const m = [];
      for(let dx = -1; dx <= 1; dx++) for(let dy = -1; dy <= 1; dy++){ const t = { x:f.x + dx, y:f.y + dy, key:plKey(f.x + dx, f.y + dy) }; if(!plGet(t.key) && !plCool(t.key)) m.push(t); }
      if(m.length) return { fg:false, tiles:m };
    }
    return null;
  }
  async function plPump(){
    if(pl.busy) return; pl.busy = true;
    try{
      for(let n = 0; n < 10; n++){
        if(!placesEnabled()) break;
        const job = plNextJob(); if(!job) break;
        const ctl = new AbortController(); pl.cur = { fg:job.fg, ctl, tiles:job.tiles };
        if(job.fg){
          pl.t0 = Date.now(); clearInterval(pl.tick);
          pl.tick = setInterval(() => { if(pl.t0 && map.getZoom() >= PLACE_ZOOM && pl.status.indexOf('Carregando') === 0) plSay(plLoadingText()); }, 1000);
          plSay(plLoadingText());
        }
        try{
          await plFetchTiles(job.tiles, ctl.signal);
          pl.retries = 0; pl.err = null; pl.cur = null; pl.t0 = null; clearInterval(pl.tick);
          plDraw();
        }catch(e){
          pl.cur = null; pl.t0 = null; clearInterval(pl.tick);
          if(e && e.cancelled) continue;   // mudou de área no meio do caminho: recalcula o que falta
          job.tiles.forEach(t => { pl.fail[t.key] = Date.now(); });
          pl.err = e && e.diag ? e.diag : [{ m:'', why:String((e && e.message) || e) }];
          console.warn('Lugares reais: falha na consulta', JSON.stringify(pl.err));
          if(job.fg) plRetryLater();
          plDraw();
        }
      }
    } finally { pl.busy = false; pl.cur = null; pl.t0 = null; clearInterval(pl.tick); }
    plDraw();
  }
  // tenta sozinho de novo (8 s, 20 s, 45 s) quando a tela atual ficou sem dados; depois disso, toque no aviso
  function plRetryLater(){
    clearTimeout(pl.retryTimer);
    if(pl.retries >= 3) return;
    const wait = [8000, 20000, 45000][pl.retries++];
    pl.retryTimer = setTimeout(() => { pl.fail = {}; placesRefresh(); }, wait);
  }
  function plRetryNow(){ clearTimeout(pl.retryTimer); pl.retries = 0; pl.fail = {}; pl.err = null; placesRefresh(); }
  function plWarmSoon(){ if(!hudReady || !placesEnabled()) return; clearTimeout(pl.warmTimer); pl.warmTimer = setTimeout(plPump, 1200); }
  // teste de conexão (mestre, na configuração): mostra qual servidor responde e em quanto tempo
  async function plTest(){
    const out = document.getElementById('pl-test-out'); if(!out) return;
    const c = map.getCenter(), q = '[out:json][timeout:10];node["amenity"](around:1500,' + c.lat.toFixed(4) + ',' + c.lng.toFixed(4) + ');out count;';
    out.textContent = 'Testando…';
    const lines = await Promise.all(PLACE_API.map(async m => {
      const ctl = new AbortController(), t0 = Date.now(), tm = setTimeout(() => ctl.abort(), 12000);
      let res;
      try{
        const r = await fetch(m.url, { method:'POST', body:'data=' + encodeURIComponent(q), headers:{ 'Content-Type':'application/x-www-form-urlencoded' }, signal:ctl.signal });
        if(!r.ok) res = 'erro HTTP ' + r.status;
        else{ const j = await r.json(); res = j && j.remark && /error|timed out/i.test(String(j.remark)) ? 'servidor ocupado' : 'ok'; }
      }catch(e){ res = ctl.signal.aborted ? 'sem resposta em 12 s' : 'sem rede ou bloqueado'; }
      clearTimeout(tm);
      return m.name + ': ' + res + ' (' + ((Date.now() - t0) / 1000).toFixed(1).replace('.', ',') + ' s)';
    }));
    let blocos = 0; try{ for(let i = 0; i < localStorage.length; i++){ const k = localStorage.key(i); if(k && k.indexOf(PLACE_LS) === 0) blocos++; } }catch(e){}
    out.textContent = lines.join('\n') + '\nBlocos de mapa guardados neste aparelho: ' + blocos;
  }

  // ---- desenho ----
  function placesEnabled(){ return !!cfg().modules.places; }
  function plClear(){ Object.keys(pl.markers).forEach(k => { placesLayer.removeLayer(pl.markers[k]); delete pl.markers[k]; }); pl.total = 0; }
  function plIcon(p){
    const c = PLACE_CATS.find(x => x.id === p.cat), t = PIN_TYPES.find(x => x.id === c.type) || {}, col = t.color || 'var(--frost)';
    return L.divIcon({ className:'pl-mk mk-lugares', iconSize:[28, 28], iconAnchor:[14, 14],
      html:`<div class="pl-badge" style="border-color:${col};color:${col}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${PIN_ICONS[c.type] || ''}</svg></div>` });
  }
  function plPopup(p){
    const c = PLACE_CATS.find(x => x.id === p.cat), el = document.createElement('div');
    el.className = 'pl-pop';
    el.innerHTML = `<div class="popup-kicker">${escapeHtml(c.label)} · lugar real</div>
      <div class="pl-name">${escapeHtml(p.name || (c.label + ' sem nome'))}</div>
      <div class="pl-meta">OpenStreetMap · ${escapeHtml(p.tag)}${p.addr ? '<br>' + escapeHtml(p.addr) : ''}</div>
      <div class="pl-meta">Estado: <b>Inexplorado</b></div>
      <button type="button" class="inv-open-btn pl-go">${ic('search', 16)} Vasculhar</button>`;
    el.querySelector('.pl-go').addEventListener('click', e => { e.currentTarget.disabled = true; map.closePopup(); placeExplore(p); });
    return el;
  }
  // visíveis agora: dentro da tela, categoria ligada, sem pin ainda, e (modo "perto") junto de algum token; os mais perto do centro primeiro
  function plVisible(view){
    const c = cfg().places, b = map.getBounds(), ct = map.getCenter(), have = new Set(pins.filter(x => x.osm).map(x => x.osm)), out = [], seen = new Set();
    view.forEach(t => {
      const rec = plGet(t.key); if(!rec) return;
      rec.list.forEach(p => {
        if(seen.has(p.k) || have.has(p.k) || c.cats[p.cat] === false || !b.contains([p.lat, p.lng])) return;
        if(c.reveal === 'near' && !tokens.some(tk => map.distance([tk.lat, tk.lng], [p.lat, p.lng]) <= PLACE_NEAR_M)) return;
        seen.add(p.k); out.push(p);
      });
    });
    if(out.length > 300){ const d = p => (p.lat - ct.lat) * (p.lat - ct.lat) + (p.lng - ct.lng) * (p.lng - ct.lng); out.sort((a, b2) => d(a) - d(b2)); }
    return out.slice(0, 300);
  }
  function plDraw(){
    if(!hudReady) return;
    const on = placesEnabled() && map.getZoom() >= PLACE_ZOOM;
    if(!on){ plClear(); mapfRender(); return; }
    const view = plViewTiles();
    if(view.length > PLACE_MAX_TILES){ plClear(); plSay('Área grande demais. Aproxime o mapa.'); mapfRender(); return; }
    const vis = plVisible(view), want = new Set(vis.map(p => p.k));
    Object.keys(pl.markers).forEach(k => { if(!want.has(k)){ placesLayer.removeLayer(pl.markers[k]); delete pl.markers[k]; } });
    vis.forEach(p => {
      if(pl.markers[p.k]) return;
      const m = L.marker([p.lat, p.lng], { icon:plIcon(p), keyboard:true, title:(p.name || 'Lugar sem nome') });
      m.bindPopup(() => plPopup(p), { minWidth:190 });
      m.addTo(placesLayer); pl.markers[p.k] = m;
    });
    pl.total = vis.length;
    const missing = view.filter(t => !plGet(t.key));
    const loading = pl.t0 != null || missing.some(t => !pl.fail[t.key]);
    const cnt = vis.length ? vis.length + (vis.length === 1 ? ' lugar para explorar nesta área' : ' lugares para explorar nesta área') : 'Nenhum lugar encontrado nesta área.';
    if(loading) plSay(plLoadingText());
    else if(missing.length) plSay((vis.length ? vis.length + (vis.length === 1 ? ' lugar' : ' lugares') + ' (parte da área sem dados). ' : '') + plWhy() + ' Toque para tentar de novo.', true);
    else plSay(cnt);
    mapfRender();
  }
  function placesRefresh(){
    if(!hudReady) return;
    const on = placesEnabled(), chip = document.querySelector('[data-mf="lugares"]');
    if(chip) chip.hidden = !on;
    if(!on){ plClear(); plSay(''); clearTimeout(pl.retryTimer); if(pl.cur) pl.cur.ctl.abort(); return; }
    const z = map.getZoom(), big = z >= PLACE_ZOOM && plViewTiles().length > PLACE_MAX_TILES;
    if(z < PLACE_ZOOM){ plClear(); plSay('Aproxime o mapa para ver lugares reais (zoom ' + PLACE_ZOOM + ' ou mais).'); }
    else if(big){ plClear(); plSay('Área grande demais. Aproxime o mapa.'); }
    else plDraw();
    // a tela atual passa na frente: cancela a busca antecipada, ou a de uma área que já saiu da tela
    if(pl.cur){
      const v = new Set(plViewTiles().map(t => t.key)), nj = (z >= PLACE_ZOOM && !big) ? plNextJob() : null;
      if(pl.cur.fg ? !pl.cur.tiles.some(t => v.has(t.key)) : !!(nj && nj.fg)) pl.cur.ctl.abort();
    }
    plPump();
  }
  function placesLater(){ clearTimeout(pl.timer); pl.timer = setTimeout(placesRefresh, 250); }
  // O lugar vira um pin comum no primeiro "Vasculhar": a partir daí tudo (contêiner, estado, histórico) é o do app.
  async function placeExplore(p){
    const c = PLACE_CATS.find(x => x.id === p.cat), id = 'osm_' + p.k;
    let pin = pins.find(x => x.id === id || x.osm === p.k);
    if(!pin){
      pin = { id, lat:p.lat, lng:p.lng, type:c.type, title:p.name || (c.label + ' (sem nome)'), note:p.addr ? p.addr : '', osm:p.k, osmTag:p.tag, ...ownerFields() };
      pins.push(pin); await saveKey(KEY_PINS, pins); renderPins();
    }
    plDraw();
    if(!isContainerPin(pin)){ openPinPopupById(pin.id); return; }
    const meta = containerMeta(pin.id);
    if(meta && meta.generatedAt){ toast('Este lugar já foi vasculhado.'); openPinPopupById(pin.id); return; }
    await generateContainer(pin.id);
    openPinPopupById(pin.id);
  }

  function hudCampaignChanged(){
    if(!hudReady) return;
    hud.who = null; hudLoadPrefs(); hudFeedLayout(); mapfLoad(); mapfApply();
    plClear(); placesRefresh();
  }
  function hudInit(){
    hudDockBuild(); hudWireDock(); hudWireIndex(); hudWireQR(); hudWireFeed(); hudWireMini(); mapfWire();
    hudEl('idx-close').innerHTML = ic('close', 18); hudEl('feed-close').innerHTML = ic('close', 18); hudEl('lay-close').innerHTML = ic('close', 18);
    document.querySelectorAll('[data-ic]').forEach(e => { e.innerHTML = ic(e.dataset.ic, +e.dataset.icSize || 16); });   // ícones das partes estáticas do HTML
    hudLoadPrefs(); mapfLoad();
    hudReady = true;
    plPurge();
    mapfApply();
    map.on('moveend', placesLater); placesRefresh();
    { const ps = hudEl('pl-status'); if(ps){ ps.addEventListener('click', () => { if(ps.classList.contains('pl-retry')) plRetryNow(); }); ps.addEventListener('keydown', e => { if((e.key === 'Enter' || e.key === ' ') && ps.classList.contains('pl-retry')){ e.preventDefault(); plRetryNow(); } }); } }
    map.on('zoomend', clusterUpdate); clusterSync();
    const ctg = document.getElementById('cluster-toggle'); if(ctg) ctg.addEventListener('click', () => clusterSetOn(!cl.on));
    clusterUpdate();
    map.on('click', () => { hudCloseSheets(); if(!hudCol() && hud.feed.sheet) hudFeedOpen(false); });
    hudRenderIndex(); hudFeedLayout(); hudDockSync();
    // o mapa recalcula o tamanho quando as colunas do desktop abrem ou fecham
    if(window.ResizeObserver) new ResizeObserver(() => { if(map) map.invalidateSize({ animate:false }); }).observe(document.getElementById('map'));
  }

  hudInit();

  renderLootResults();
  renderFishResults();
  refreshCharacterOptions();
  invReady = true;
  refreshAddDest();
  updateSaqueInvCount();
  initInventorySync();
  attachModuleSync();
  startMetaSync();
  if(auditQueue.length) pumpAudit();
  applyConfig();
  updateHud();

})();
