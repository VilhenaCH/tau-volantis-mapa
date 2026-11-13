(function(){
  // ================= SOM (efeitos sonoros) =================
  // Todos os sons vêm de UM arquivo (tv-sons.mp3: 27 efeitos dos pacotes CC0 da Kenney, cortados por tempo no MAP).
  // Desligar tudo pelo código: window.TV_SOUND = false no index.html. O jogador liga/desliga e escolhe o volume em Menu → Som.
  // Regras: só toca depois do primeiro toque na tela (política dos navegadores), nunca com a aba escondida; eventos de outros
  // jogadores ficam mudos nos primeiros segundos e têm limite de um por segundo. Se o arquivo não carregar, usa bips simples.
  const TVSound = (() => {
    const MAP = {"tick1":[0.05,0.011],"tick2":[0.181,0.02],"tick3":[0.322,0.055],"land":[0.497,0.205],"found1":[0.822,0.287],"found2":[1.229,0.317],"found3":[1.666,0.528],"glass":[2.314,0.655],"anom":[3.089,0.761],"empty":[3.97,0.229],"erro":[4.319,0.104],"dado1":[4.543,0.534],"dado2":[5.197,0.645],"dado3":[5.961,0.572],"guardar":[6.654,0.231],"descarta":[7.004,0.306],"troca":[7.431,0.7],"craftok":[8.251,0.848],"craftno":[9.219,0.296],"pesca":[9.635,0.495],"trovao":[10.251,1.998],"vez":[12.368,0.484],"passo1":[12.972,0.219],"passo2":[13.311,0.222]};
    const KEY = 'tv-map:sound', GAIN = [0, 0.4, 0.7, 1];
    const FB = { tick1:[1800,'square',.025,.35], tick2:[2200,'square',.02,.35], tick3:[1500,'square',.03,.35], land:[260,'triangle',.09,.8],
      found1:[660,'sine',.18,.8], found2:[880,'sine',.22,.8], found3:[1175,'sine',.3,.8], anom:[130,'sawtooth',.5,.4], empty:[240,'triangle',.25,.7,120],
      erro:[190,'square',.1,.35], dado1:[420,'triangle',.07,.8], dado2:[380,'triangle',.07,.8], dado3:[460,'triangle',.07,.8], vez:[784,'sine',.25,.8] };
    const st = { on:true, vol:1 };
    try{ const s = JSON.parse(localStorage.getItem(KEY) || 'null'); if(s){ st.on = s.on !== false; if(s.vol === 1 || s.vol === 2 || s.vol === 3) st.vol = s.vol; } }catch(e){}
    let ctx = null, master = null, buf = null, loading = false, failed = false, quietUntil = Date.now() + 6000, lastRemote = 0;
    const live = new Set(), last = {}, stats = { n:0, last:[] };
    const enabled = () => window.TV_SOUND !== false;
    const save = () => { try{ localStorage.setItem(KEY, JSON.stringify(st)); }catch(e){} };
    const rnd = a => a[Math.floor(Math.random() * a.length)];
    function setupCtx(){
      if(ctx) return true;
      const AC = window.AudioContext || window.webkitAudioContext;
      if(!AC){ failed = true; return false; }
      try{
        ctx = new AC();
        master = ctx.createGain(); master.gain.value = st.on ? GAIN[st.vol] : 0; master.connect(ctx.destination);
        const b = ctx.createBuffer(1, 1, 22050), s = ctx.createBufferSource(); s.buffer = b; s.connect(ctx.destination); s.start(0);   // iOS: som mudo dentro do primeiro toque destrava o áudio
      }catch(e){ ctx = null; failed = true; return false; }
      return true;
    }
    function load(){
      if(buf || loading || failed || !ctx) return;
      if(location.protocol === 'file:'){ failed = true; return; }   // aberto direto do arquivo: o navegador não deixa buscar o MP3; usa os bips
      loading = true;
      fetch('tv-sons.mp3').then(r => { if(!r.ok) throw new Error('http ' + r.status); return r.arrayBuffer(); })
        .then(ab => new Promise((ok, no) => { const p = ctx.decodeAudioData(ab, ok, no); if(p && p.catch) p.catch(no); }))
        .then(b => { buf = b; loading = false; })
        .catch(() => { failed = true; loading = false; });
    }
    function unlock(){
      if(!enabled()) return;
      if(setupCtx()){ try{ if(ctx.state !== 'running') ctx.resume(); }catch(e){} load(); }
    }
    ['pointerdown', 'touchend', 'click', 'keydown'].forEach(ev => document.addEventListener(ev, unlock, { capture:true, passive:true }));
    function synth(name, t0, o){
      const f = FB[name]; if(!f) return null;
      const osc = ctx.createOscillator(), g = ctx.createGain(), v = f[3] * (o.v == null ? 1 : o.v) * 0.5;
      osc.type = f[1]; osc.frequency.setValueAtTime(f[0], t0);
      if(f[4]) osc.frequency.exponentialRampToValueAtTime(f[4], t0 + f[2]);
      g.gain.setValueAtTime(v, t0); g.gain.exponentialRampToValueAtTime(0.0001, t0 + f[2]);
      osc.connect(g); g.connect(master); osc.start(t0); osc.stop(t0 + f[2] + 0.02);
      return { src:osc, g };
    }
    function start(name, o){
      const t0 = ctx.currentTime + (o.delay || 0), m = MAP[name];
      let node = null;
      if(buf && m){
        const src = ctx.createBufferSource(), g = ctx.createGain();
        src.buffer = buf; src.playbackRate.value = o.rate || 1; g.gain.value = o.v == null ? 1 : o.v;
        src.connect(g); g.connect(master);
        src.start(t0, m[0], m[1] + 0.06);
        node = { src, g };
      } else if(failed){ node = synth(name, t0, o); }
      if(!node) return null;
      live.add(node);
      node.src.onended = () => { live.delete(node); try{ node.g.disconnect(); }catch(e){} };
      stats.n++; stats.last.push(name); if(stats.last.length > 150) stats.last.shift();
      return node;
    }
    // o: v = volume 0..1, rate = velocidade, delay = segundos de espera, gap = intervalo mínimo (ms) entre dois iguais, remote = evento de outra pessoa
    function play(name, o){
      o = o || {};
      if(!enabled() || !st.on || !ctx || document.hidden) return null;
      const now = Date.now();
      if(o.remote){ if(now < quietUntil || now - lastRemote < 1000) return null; lastRemote = now; }
      if(now - (last[name] || 0) < (o.gap == null ? 35 : o.gap)) return null;
      last[name] = now;
      if(live.size > 14) return null;
      if(ctx.state !== 'running'){
        try{ ctx.resume().then(() => { if(ctx.state === 'running' && Date.now() - now < 400) start(name, o); }); }catch(e){}
        return null;
      }
      return start(name, o);
    }
    function stop(){
      if(!ctx) return;
      live.forEach(n => { try{ n.g.gain.cancelScheduledValues(0); n.g.gain.setTargetAtTime(0, ctx.currentTime, 0.015); n.src.stop(ctx.currentTime + 0.08); }catch(e){} });
      live.clear();
    }
    function buzz(p){ try{ if(st.on && enabled() && !document.hidden && navigator.vibrate) navigator.vibrate(p); }catch(e){} }
    function found(kind, delay){
      delay = delay || 0;
      if(kind === 'anomalo'){ play('anom', { v:0.9, delay }); return; }
      if(kind === 'raro'){ play('found3', { delay }); play('glass', { delay:delay + 0.04, v:0.8 }); buzz(40); return; }
      play(kind === 'incomum' ? 'found2' : 'found1', { delay });
    }
    function dice(n){
      n = Math.max(1, Math.min(6, n | 0));
      const names = ['dado1', 'dado2', 'dado3'], a = rnd(names);
      play(a, {});
      if(n > 1) play(rnd(names.filter(x => x !== a)), { delay:0.09, v:0.8 });
      if(n > 3) play(rnd(names), { delay:0.19, v:0.7, gap:0 });
    }
    function setOn(v){
      st.on = !!v; save();
      if(master) master.gain.setTargetAtTime(st.on ? GAIN[st.vol] : 0, ctx.currentTime, 0.02);
      if(!st.on) stop();
    }
    function setVol(v){
      st.vol = (v === 1 || v === 2 || v === 3) ? v : 1; save();
      if(master && st.on) master.gain.setTargetAtTime(GAIN[st.vol], ctx.currentTime, 0.02);
    }
    function bindUI(){
      const sec = document.getElementById('sound-section'), b = document.getElementById('sound-toggle'), v = document.getElementById('sound-vol');
      if(!sec || !b || !v) return;
      if(!enabled()){ sec.hidden = true; return; }
      const paint = () => {
        b.classList.toggle('active', st.on); b.setAttribute('aria-pressed', String(st.on)); b.textContent = st.on ? 'Som ligado' : 'Som desligado';
        v.querySelectorAll('button').forEach(x => { const on = +x.dataset.v === st.vol; x.classList.toggle('active', on); x.setAttribute('aria-pressed', String(on)); x.disabled = !st.on; });
      };
      b.addEventListener('click', () => { setOn(!st.on); paint(); if(st.on) play('found1', { v:0.8, gap:0 }); });
      v.addEventListener('click', e => { const x = e.target.closest('button[data-v]'); if(!x) return; setVol(+x.dataset.v); paint(); play('found1', { v:0.8, gap:0 }); });
      paint();
    }
    bindUI();
    return {
      play, stop, found, dice, setOn, setVol, stats,
      quiet(ms){ quietUntil = Math.max(quietUntil, Date.now() + ms); },
      tick(){ play(rnd(['tick1', 'tick2', 'tick3']), { rate:0.95 + Math.random() * 0.12, v:0.9, gap:30 }); },
      lootKind(it, rar){
        if(it && it.category === 'Itens Anômalos e Paranormais') return 'anomalo';
        if(rar && rar.cls === 'rarity-raro') return 'raro';
        if(rar && rar.cls === 'rarity-incomum') return 'incomum';
        return 'comum';
      },
      rolled(rs, crit){
        dice((rs || []).reduce((a, t) => a + ((t && t.dice && t.dice.length) || 1), 0));
        if(crit) found('raro', 0.3);
      },
      get state(){ return { on:st.on, vol:st.vol, ctx:ctx ? ctx.state : null, loaded:!!buf, failed }; }
    };
  })();
  window.__TVSound = TVSound;   // gancho de teste (só leitura do que tocou)
  let rollsSeen = null, lastWx = null;
  // som do resultado quando a animação do rolo está desligada ("reduzir movimento"): toca só o melhor item achado
  function soundLootResult(its, locKey){
    if(!its.length){ TVSound.play('empty'); return; }
    const rank = { comum:0, incomum:1, raro:2, anomalo:3 }; let best = 'comum';
    its.forEach(it => { const k = TVSound.lootKind(it, locKey ? rarityInfo(it, locKey) : null); if(rank[k] > rank[best]) best = k; });
    TVSound.found(best);
  }
  // rolagens de OUTRAS pessoas (a primeira carga do histórico não conta; no máximo um som por segundo)
  function soundRolls(nv){
    if(rollsSeen === null){ rollsSeen = new Set(Object.keys(nv)); return; }
    const me = currentUser ? currentUser.uid : null;
    let fresh = 0;
    Object.keys(nv).forEach(k => {
      if(rollsSeen.has(k)) return;
      rollsSeen.add(k);
      const r = nv[k];
      if(r && me && r.actorId !== me) fresh++;
    });
    if(fresh) TVSound.play('dado2', { remote:true, v:0.6 });
  }
  function tacTurnKey(sid){
    const sc = tacScene(sid), id = tacTurnId(sc);
    return sc && id ? sid + ':' + id + ':' + sc.turn.round : null;
  }

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
    pin:          '<path d="M12 21s-7-7.2-7-12a7 7 0 0 1 14 0c0 4.8-7 12-7 12Z"/><circle cx="12" cy="9" r="2.4"/>',
    lugar:        '<path d="M3 21h18"/><path d="M5 21V10l7-6 7 6v11"/><path d="M9.5 21v-6h5v6"/><path d="M12 4V2"/>'
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
    edit:'<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="M13.5 6.5l4 4"/>',
    image:'<rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="9" cy="10" r="1.6"/><path d="M4 18l5-5 4 3 3-3 4 4"/>',
    lock:'<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
    unlock:'<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 7.5-2"/>',
    shield:'<path d="M12 3l7 2.6v5.6c0 4.6-3 8.3-7 10-4-1.7-7-5.4-7-10V5.6z"/>'
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
    { id:'pin',          label:'Pino',         color:'var(--neutral)' },
    { id:'lugar',        label:'Lugar',        color:'var(--frost)' }
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
  const KEY_SCENE = 'tv-map:scene';           // cena da mesa (Exploração, Combate, Descanso): só o mestre muda (f23)
  const KEY_ROSTER = 'tv-map:roster';         // gaveta de personagens dos jogadores (membros da campanha)
  const KEY_GMROSTER = 'tv-map:gm-roster';    // gaveta de NPCs do mestre (só o mestre lê e grava)
  const DB_KEYS = new Set([KEY_CHARS, KEY_ROLLS, KEY_RECIPES, KEY_CLOCK, KEY_SHORTCUTS, KEY_JOURNAL, KEY_GMJ, KEY_TAC, KEY_TACIMG, KEY_GMTAC, KEY_SCENE, KEY_ROSTER, KEY_GMROSTER]);
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
  // ---------- ÁREAS (f14): estilo, predefinições e ícones ----------
  // Cada área guarda o estilo em shape.st = { c:cor, ic:ícone, mv:movimento, ef:efeito, op:intensidade, dn:densidade, bd:borda, lb:rótulo }.
  // Área sem "st" (criada antes) usa AREA_DEF, que é exatamente o visual antigo (laranja, tracejada, sem ícone).
  const AREA_DEF = { c:'#d3572a', ic:'', mv:'', ef:'', op:0.1, dn:'media', bd:'tracejado', lb:'auto' };
  const AREA_ICON = {
    skull:  { t:'Caveira',   p: UI_IC.skull },
    claw:   { t:'Garras',    p: '<path d="M5 4c1 6 1 10 4 16M10 3c1 6 1 11 4 17M15 4c1.2 5 1.4 9.5 4 15"/>' },
    drop:   { t:'Gota',      p: UI_IC.drop },
    rain:   { t:'Chuva',     p: UI_IC.rain },
    storm:  { t:'Tempestade',p: UI_IC.storm },
    bolt:   { t:'Raio',      p: UI_IC.bolt },
    snow:   { t:'Neve',      p: UI_IC.snow },
    fog:    { t:'Neblina',   p: UI_IC.fog },
    wind:   { t:'Vento',     p: UI_IC.wind },
    flame:  { t:'Fogo',      p: '<path d="M12 2.5c.6 3.2 4.8 5 4.8 10a4.8 4.8 0 0 1-9.6 0c0-2 .9-3.4 2-4.4.2 1.4.9 2.2 1.8 2.6C11 8.2 10.6 5.4 12 2.5Z"/>' },
    bubble: { t:'Bolhas',    p: '<circle cx="12" cy="13" r="6"/><path d="M9 11.5a3.2 3.2 0 0 1 2.2-1.9"/>' },
    wave:   { t:'Ondas',     p: '<path d="M2 9c2.5-3 5-3 7.5 0s5 3 7.5 0 3-2 5-1"/><path d="M2 16c2.5-3 5-3 7.5 0s5 3 7.5 0 3-2 5-1"/>' },
    rad:    { t:'Radiação',  p: PIN_ICONS.radiacao },
    eye:    { t:'Olho',      p: UI_IC.eye },
    spiral: { t:'Espiral',   p: '<path d="M12 12a1 1 0 0 1 2 0a2 2 0 0 1-4 0a3 3 0 0 1 6 0a4 4 0 0 1-8 0a5 5 0 0 1 10 0a6 6 0 0 1-12 0"/>' },
    shield: { t:'Escudo',    p: '<path d="M12 3 4.5 6v6c0 4.5 3.2 7.8 7.5 9 4.3-1.2 7.5-4.5 7.5-9V6L12 3Z"/>' },
    flag:   { t:'Bandeira',  p: PIN_ICONS.extracao },
    heart:  { t:'Cura',      p: UI_IC.heart },
    alert:  { t:'Alerta',    p: UI_IC.alert },
    star:   { t:'Estrela',   p: '<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9L12 3Z"/>' }
  };
  const AREA_MV = [['', 'Parado'], ['cair', 'Cair'], ['subir', 'Subir'], ['deriva', 'Deslizar']];
  const AREA_EF = [['', 'Nenhum'], ['pulso', 'Pulso'], ['raios', 'Raios'], ['borda', 'Borda']];
  const AREA_DN = [['baixa', 'Pouca'], ['media', 'Média'], ['alta', 'Muita']];
  const AREA_BD = [['solido', 'Lisa'], ['tracejado', 'Tracejada'], ['pontilhado', 'Pontilhada'], ['nenhum', 'Sem borda']];
  const AREA_LB = [['auto', 'Automático'], ['sempre', 'Sempre'], ['oculto', 'Oculto']];
  const AREA_COLORS = ['#e5484d', '#f2752c', '#f5b53d', '#c9d94a', '#3ecf8e', '#38bdf8', '#5b8def', '#8b5cf6', '#d946ef', '#ffffff', '#a3a3a3', '#6b6b6b'];
  const AREA_PRESETS = [
    { id:'perigo',     t:'Zona perigosa', c:'#e5484d', ic:'skull',  mv:'',       ef:'pulso', op:0.16, dn:'media', bd:'tracejado' },
    { id:'criaturas',  t:'Criaturas',     c:'#c2410c', ic:'claw',   mv:'',       ef:'borda', op:0.14, dn:'media', bd:'tracejado' },
    { id:'chuva',      t:'Chuva',         c:'#5b8def', ic:'drop',   mv:'cair',   ef:'',      op:0.14, dn:'alta',  bd:'pontilhado' },
    { id:'tempestade', t:'Tempestade',    c:'#8b5cf6', ic:'drop',   mv:'cair',   ef:'raios', op:0.2,  dn:'alta',  bd:'solido' },
    { id:'nevasca',    t:'Nevasca',       c:'#9fd8ef', ic:'snow',   mv:'cair',   ef:'',      op:0.16, dn:'media', bd:'pontilhado' },
    { id:'neblina',    t:'Neblina',       c:'#b8c4cc', ic:'fog',    mv:'deriva', ef:'pulso', op:0.18, dn:'baixa', bd:'nenhum' },
    { id:'radiacao',   t:'Radiação',      c:'#c9d94a', ic:'rad',    mv:'',       ef:'pulso', op:0.16, dn:'media', bd:'tracejado' },
    { id:'fogo',       t:'Fogo',          c:'#ff7a1a', ic:'flame',  mv:'subir',  ef:'pulso', op:0.18, dn:'media', bd:'solido' },
    { id:'gas',        t:'Gás tóxico',    c:'#6fd16f', ic:'bubble', mv:'subir',  ef:'',      op:0.16, dn:'media', bd:'pontilhado' },
    { id:'anomalia',   t:'Anomalia',      c:'#d946ef', ic:'eye',    mv:'deriva', ef:'pulso', op:0.16, dn:'baixa', bd:'tracejado' },
    { id:'agua',       t:'Água',          c:'#38bdf8', ic:'wave',   mv:'deriva', ef:'',      op:0.18, dn:'media', bd:'solido' },
    { id:'segura',     t:'Zona segura',   c:'#3ecf8e', ic:'shield', mv:'',       ef:'pulso', op:0.12, dn:'baixa', bd:'solido' },
    { id:'territorio', t:'Território',    c:'#f5b53d', ic:'flag',   mv:'',       ef:'borda', op:0.12, dn:'baixa', bd:'tracejado' },
    { id:'livre',      t:'Livre',         c:'#ffffff', ic:'',       mv:'',       ef:'',      op:0.12, dn:'media', bd:'solido' }
  ];
  const areaPreset = id => AREA_PRESETS.find(p => p.id === id) || null;
  const areaHex = c => /^#[0-9a-f]{6}$/i.test(c || '');
  // estilo completo de uma área (valores que faltam ou estão fora do catálogo caem no padrão)
  function areaSt(shape){
    const raw = (shape && shape.st) || {}, st = Object.assign({}, AREA_DEF);
    if(areaHex(raw.c)) st.c = raw.c;
    if(raw.ic === '' || AREA_ICON[raw.ic]) st.ic = raw.ic;
    if(AREA_MV.some(x => x[0] === raw.mv)) st.mv = raw.mv;
    if(AREA_EF.some(x => x[0] === raw.ef)) st.ef = raw.ef;
    if(typeof raw.op === 'number' && isFinite(raw.op)) st.op = Math.min(0.6, Math.max(0.03, raw.op));
    if(AREA_DN.some(x => x[0] === raw.dn)) st.dn = raw.dn;
    if(AREA_BD.some(x => x[0] === raw.bd)) st.bd = raw.bd;
    if(AREA_LB.some(x => x[0] === raw.lb)) st.lb = raw.lb;
    return st;
  }
  const areaStFromPreset = p => ({ c:p.c, ic:p.ic, mv:p.mv, ef:p.ef, op:p.op, dn:p.dn, bd:p.bd, lb:'auto' });
  // animações das áreas: ligadas por padrão; desligam com "reduzir movimento" do aparelho ou pelo botão em Camadas (vale só neste aparelho)
  function areaAnimOn(){
    try{ if(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false; }catch(e){}
    try{ return localStorage.getItem('tv-map:area-anim') !== 'off'; }catch(e){ return true; }
  }
  // ================= ROTAS (f19) =================
  // Cada rota guarda o estilo em route.st = { c:cor, w:espessura, ds:traço, ic:ícone repetido, ev:movimento, dir:sentido, lb:nome no mapa }.
  // Rota sem "st" (criada antes) usa ROUTE_DEF, que é o visual antigo (azul-gelo, fina, pontilhada, sem ícone).
  const ROUTE_DEF = { c:'#ffffff', w:'fina', ds:'pontilhado', ic:'', ev:'', dir:'', lb:'auto' };
  const ROUTE_W = { fina:3, media:4.5, grossa:7 };
  const ROUTE_WL = [['fina', 'Fina'], ['media', 'Média'], ['grossa', 'Grossa']];
  const ROUTE_DS = [['solido', 'Lisa'], ['tracejado', 'Tracejada'], ['pontilhado', 'Pontilhada'], ['traco', 'Traço e ponto']];
  const ROUTE_EV = [['', 'Parada'], ['fluxo', 'Fluxo'], ['pulso', 'Pulso']];
  const ROUTE_DIR = [['', 'Nenhum'], ['setas', 'Setas'], ['pontas', 'Início e fim'], ['ambos', 'Setas e pontas']];
  const ROUTE_ICON = Object.assign({}, AREA_ICON, {
    foot: { t:'Pegadas',     p:'<path d="M8 4c1.6 0 2.4 1.6 2.4 3.4S9.6 11 8 11 5.6 9.2 5.6 7.4 6.4 4 8 4Z"/><path d="M16 11c1.6 0 2.4 1.6 2.4 3.4S17.6 18 16 18s-2.4-1.8-2.4-3.6S14.4 11 16 11Z"/>' },
    car:  { t:'Carro',       p:PIN_ICONS.veiculo },
    tent: { t:'Abrigo',      p:PIN_ICONS.abrigo },
    box:  { t:'Suprimentos', p:PIN_ICONS.suprimentos },
    fuel: { t:'Combustível', p:PIN_ICONS.combustivel },
    med:  { t:'Médico',      p:PIN_ICONS.medico }
  });
  const ROUTE_PRESETS = [
    { id:'trilha',   t:'Trilha',       c:'#c9d94a', w:'fina',  ds:'pontilhado', ic:'foot',   ev:'',      dir:'setas' },
    { id:'estrada',  t:'Estrada',      c:'#f5b53d', w:'media', ds:'solido',     ic:'',       ev:'',      dir:'' },
    { id:'fuga',     t:'Rota de fuga', c:'#3ecf8e', w:'media', ds:'tracejado',  ic:'',       ev:'fluxo', dir:'ambos' },
    { id:'patrulha', t:'Patrulha',     c:'#5b8def', w:'media', ds:'tracejado',  ic:'shield', ev:'',      dir:'setas' },
    { id:'comercio', t:'Comércio',     c:'#f2752c', w:'media', ds:'traco',      ic:'box',    ev:'',      dir:'pontas' },
    { id:'perigosa', t:'Perigosa',     c:'#e5484d', w:'media', ds:'tracejado',  ic:'skull',  ev:'pulso', dir:'' },
    { id:'rio',      t:'Rio / água',   c:'#38bdf8', w:'grossa', ds:'solido',    ic:'wave',   ev:'fluxo', dir:'' },
    { id:'comboio',  t:'Comboio',      c:'#8b5cf6', w:'media', ds:'solido',     ic:'car',    ev:'fluxo', dir:'setas' },
    { id:'livre',    t:'Livre',        c:'#ffffff', w:'fina',  ds:'solido',     ic:'',       ev:'',      dir:'' }
  ];
  const routePreset = id => ROUTE_PRESETS.find(p => p.id === id) || null;
  function routeSt(route){
    const raw = (route && route.st) || {}, st = Object.assign({}, ROUTE_DEF);
    if(areaHex(raw.c)) st.c = raw.c;
    if(ROUTE_W[raw.w]) st.w = raw.w;
    if(ROUTE_DS.some(x => x[0] === raw.ds)) st.ds = raw.ds;
    if(raw.ic === '' || ROUTE_ICON[raw.ic]) st.ic = raw.ic;
    if(ROUTE_EV.some(x => x[0] === raw.ev)) st.ev = raw.ev;
    if(ROUTE_DIR.some(x => x[0] === raw.dir)) st.dir = raw.dir;
    if(AREA_LB.some(x => x[0] === raw.lb)) st.lb = raw.lb;
    return st;
  }
  const routeStFromPreset = p => ({ c:p.c, w:p.w, ds:p.ds, ic:p.ic, ev:p.ev, dir:p.dir, lb:'auto', pre:p.id });
  function routeDash(st){
    const w = ROUTE_W[st.w];
    if(st.ds === 'tracejado') return Math.round(w * 3.2) + ' ' + Math.round(w * 2.4);
    if(st.ds === 'pontilhado') return '1 ' + Math.round(w * 2.6);
    if(st.ds === 'traco') return Math.round(w * 3) + ' ' + Math.round(w * 2) + ' 1 ' + Math.round(w * 2);
    return null;
  }
  const rt = { sheetId:null, built:false, saveT:null, renderT:null, rafD:0, paths:{}, items:[], deco:null, decoSrc:[], lastPreset:(function(){ try{ const v = localStorage.getItem('tv-map:route-preset'); return v && ROUTE_PRESETS.some(p => p.id === v) ? v : 'trilha'; }catch(e){ return 'trilha'; } })() };
  // ================= MOLDURAS (f15) =================
  // Moldura = anel decorativo ao redor do avatar de personagem, NPC e token tático.
  // Modelo: entidade.fr = { s:'metal', c:'#aabbcc' } (c vazio = usa a cor do token). Sem fr = visual de sempre.
  // No mapa tático, tokens ligados a um personagem/NPC do mapa herdam a moldura dele; os criados ali (inimigo, aliado, objeto) guardam a própria em t.fr.
  const FRAMES = [
    ['', 'Padrão', ''], ['fino', 'Anel', ''], ['duplo', 'Duplo', ''], ['grosso', 'Aro grosso', ''], ['tracejado', 'Tracejado', ''],
    ['pontos', 'Pontilhado', ''], ['metal', 'Metálica', ''], ['dentes', 'Dentada', ''], ['alerta', 'Alerta', ''], ['brilho', 'Brilho', ''],
    ['pulso', 'Pulso', ''], ['orbita', 'Órbita', ''], ['hex', 'Hexágono', 'hex'], ['octo', 'Octógono', 'octo'], ['escudo', 'Escudo', 'escudo']
  ];
  const FRAME_NAME = {}, FRAME_SHAPE = {};
  FRAMES.forEach(f => { FRAME_NAME[f[0]] = f[1]; if(f[2]) FRAME_SHAPE[f[0]] = f[2]; });
  const frHex = v => /^#[0-9a-f]{6}$/i.test(v || '');
  // normaliza o que vier do banco: devolve { s, c } ou null (sem moldura)
  function frSt(fr){
    if(!fr || typeof fr !== 'object' || !fr.s || !Object.prototype.hasOwnProperty.call(FRAME_NAME, fr.s)) return null;
    return { s:fr.s, c:frHex(fr.c) ? fr.c : '' };
  }
  const frSig = st => st ? st.s + '.' + st.c : '';
  // pedaços de HTML de uma moldura: o anel (vai como irmão ANTES do avatar), o atributo de forma (vai no avatar) e a classe do contêiner
  function frParts(fr, base, o){
    const st = frSt(fr);
    if(!st) return { ring:'', sh:'', wrap:'' };
    o = o || {};
    const sh = FRAME_SHAPE[st.s] || '', col = st.c || base || '#ffffff';
    return {
      ring:`<i class="fr-ring${o.cls || ''}" data-fr="${st.s}" style="--fc:${escapeHtml(col)};--fd:${o.fd || 5}px${o.style || ''}"></i>`,
      sh: sh ? ` data-sh="${sh}"` : '',
      wrap:' has-fr' + (sh ? ' fr-sh' : '')
    };
  }
  // seletor de moldura (popups e painel tático): HTML + ligação. O estado fica no próprio elemento (data-s, caixa de cor).
  function frPickerHtml(fr, base, id){
    const st = frSt(fr) || { s:'', c:'' }, col = st.c || (frHex(base) ? base : '#ffffff');
    return `<details class="fr-pick"${id ? ` id="${id}"` : ''} data-s="${st.s}" style="--fr-pc:${col}">
      <summary class="fr-sum"><span class="token-field-label">Moldura</span><span class="fr-nm">${FRAME_NAME[st.s]}</span></summary>
      <div class="fr-grid" role="radiogroup" aria-label="Moldura">${FRAMES.map(f => {
        const on = f[0] === st.s;
        return `<button type="button" class="fr-chip${on ? ' on' : ''}" role="radio" aria-checked="${on}" data-v="${f[0]}" title="${f[1]}" aria-label="${f[1]}"><span class="fr-demo">${f[0] ? `<i class="fr-ring" data-fr="${f[0]}" style="--fd:4px;--fc:var(--fr-pc)"></i>` : ''}<b${f[2] ? ` data-sh="${f[2]}"` : ''}></b></span></button>`;
      }).join('')}</div>
      <div class="fr-meta">
        <label class="fr-cc"><input type="checkbox" class="fr-same"${st.c ? '' : ' checked'}> usar a cor do token</label>
        <input type="color" class="fr-color" value="${col}"${st.c ? '' : ' disabled'} aria-label="Cor da moldura"></div></details>`;
  }
  function frPickerGet(root){
    if(!root || !root.dataset.s) return null;
    const same = root.querySelector('.fr-same'), c = root.querySelector('.fr-color');
    return frSt({ s:root.dataset.s, c:same && same.checked ? '' : (c ? c.value : '') });
  }
  // getBase() devolve a cor atual do token (hex); onChange(fr, cor) é chamado a cada mudança (prévia ao vivo)
  function frPickerWire(root, getBase, onChange){
    if(!root) return;
    const same = root.querySelector('.fr-same'), colorIn = root.querySelector('.fr-color'), nm = root.querySelector('.fr-nm');
    const base = () => { const b = getBase ? getBase() : ''; return frHex(b) ? b : '#ffffff'; };
    const paint = () => {
      const s = root.dataset.s || '', col = same.checked ? base() : colorIn.value;
      root.style.setProperty('--fr-pc', col);
      colorIn.disabled = same.checked;
      nm.textContent = FRAME_NAME[s] || '';
      root.querySelectorAll('.fr-chip').forEach(b => { const on = b.dataset.v === s; b.classList.toggle('on', on); b.setAttribute('aria-checked', String(on)); });
      if(onChange) onChange(frPickerGet(root), col);
    };
    root.addEventListener('click', ev => { const b = ev.target.closest && ev.target.closest('.fr-chip'); if(!b || !root.contains(b)) return; root.dataset.s = b.dataset.v; paint(); });
    same.addEventListener('change', () => { if(!same.checked) colorIn.value = base(); paint(); });
    colorIn.addEventListener('input', paint);
    // abrir o seletor aumenta o popup: reajusta a posição para ele não ficar por trás do cabeçalho
    root.addEventListener('toggle', () => { try{ const pp = map._popup; if(pp && pp.isOpen() && pp._container && pp._container.contains(root)){ pp._updateLayout(); pp._updatePosition(); pp._adjustPan(); } }catch(e){} });
    root.__paint = paint;
    paint();
  }
  // prévia (64px) no popup: anel + forma aplicados ao quadrado de exemplo
  function frPreview(wrap, prev, fr, base){
    if(!wrap || !prev) return;
    const old = wrap.querySelector('.fr-ring'); if(old) old.remove();
    const fp = frParts(fr, base, { fd:6 });
    if(fp.ring) wrap.insertAdjacentHTML('afterbegin', fp.ring);
    const st = frSt(fr), sh = st && FRAME_SHAPE[st.s];
    if(sh) prev.setAttribute('data-sh', sh); else prev.removeAttribute('data-sh');
  }
  // animações das molduras seguem o mesmo botão das áreas (Camadas) e o "reduzir movimento" do aparelho
  function frAnimSync(){ document.documentElement.classList.toggle('tv-still', !areaAnimOn()); }
  frAnimSync();

  // ================= LUGAR (f16) =================
  // Lugar = pin do tipo 'lugar' com o bloco pin.lg = { cat, img, tags[], src[], risk, npcs[{id,c}], scene, min, max, note }.
  //  cat   um dos tipos de pin (define cor e ícone) · src  fontes de saque (chaves de LOC_ORDER): a busca sorteia de TODAS ao mesmo tempo
  //  npcs  NPCs ligados ao lugar, com grau de certeza · scene  id de cena do mapa tático · área = shape com placeId (círculo "raio" ou polígono "ocupação")
  const LG_CATS = ['saque', 'medico', 'suprimentos', 'combustivel', 'municao', 'agua', 'abrigo', 'veiculo', 'comunicacao', 'extracao', 'perigo', 'ameaca', 'radiacao', 'armadilha', 'nota', 'pin'];
  const LG_SRC = ['casas', 'farmacias', 'bases', 'veiculos', 'oficinas', 'mercados', 'acampamentos', 'fazendas', 'florestas', 'rios', 'convergencia'];   // mesma lista de LOC_ORDER (as tabelas só existem mais abaixo)
  const LG_RISK = ['Desconhecido', 'Baixo', 'Médio', 'Alto'];
  const LG_CERT = [['certo', 'Certo'], ['provavel', 'Provável'], ['rumor', 'Boato'], ['oculto', 'Oculto (só o mestre vê)']];
  const LG_AREA_PRE = { perigo:'perigo', ameaca:'criaturas', radiacao:'radiacao', armadilha:'perigo', agua:'agua', abrigo:'segura' };
  const lg = { id:null, saveT:null, renderT:null, built:false, reloc:null, edit:false };
  function lgOf(p){
    const g = (p && p.lg && typeof p.lg === 'object') ? p.lg : {};
    const n = v => { const x = parseInt(v, 10); return isFinite(x) ? x : null; };
    const min = Math.max(0, n(g.min) == null ? 1 : n(g.min)), max = Math.max(min, n(g.max) == null ? 3 : n(g.max));
    return {
      cat: LG_CATS.indexOf(g.cat) >= 0 ? g.cat : 'saque',
      img: typeof g.img === 'string' && /^(data:image\/|https?:|\.?\/?[\w\-./]+\.(png|jpe?g|gif|webp|svg)$)/i.test(g.img) ? g.img : '',
      tags: Array.isArray(g.tags) ? g.tags.filter(t => typeof t === 'string' && t.trim()).map(t => t.trim().slice(0, 24)).slice(0, 12) : [],
      src: Array.isArray(g.src) ? g.src.filter((k, i, a) => LG_SRC.indexOf(k) >= 0 && a.indexOf(k) === i) : [],
      risk: Math.min(3, Math.max(0, n(g.risk) || 0)),
      npcs: Array.isArray(g.npcs) ? g.npcs.filter(x => x && typeof x.id === 'string').map(x => ({ id:x.id, c:LG_CERT.some(c => c[0] === x.c) ? x.c : 'provavel' })).slice(0, 20) : [],
      scene: typeof g.scene === 'string' ? g.scene : '',
      min, max
    };
  }
  const isLugar = p => !!p && p.type === 'lugar';

  // compatibilidade: antes havia um estilo único para todas as áreas
  const SHAPE_STYLE = { color: AREA_DEF.c, weight: 2, fillColor: AREA_DEF.c, fillOpacity: AREA_DEF.op, dashArray: '6 4' };
  const area = { draw:null, edit:null, sheetId:null, paths:{}, items:[], pv:null, saveT:null, renderT:null, rafL:0, lastPreset:'perigo' };
  try{ const lp = localStorage.getItem('tv-map:area-preset'); if(areaPreset(lp)) area.lastPreset = lp; }catch(e){}

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
  window.__tvMap = map;   // só para os testes automáticos (posicionar o mapa sem depender de gestos)
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
  // ===== LUGARES REAIS (OpenStreetMap): INTERRUPTOR GERAL =====
  // O index.html define window.TV_PLACES. Só "true" liga. Desligado: nenhuma consulta de rede, nenhum aviso na tela, nenhuma camada,
  // nenhum botão ou categoria na configuração, e o guardado dos blocos de mapa é apagado do aparelho. Pins que já nasceram de um
  // lugar (campo "osm") continuam sendo pins comuns. Para tirar o módulo de vez, veja o "mapa de remoção" no começo do módulo (mais abaixo).
  const PLACES_ON = window.TV_PLACES === true;
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
  const cl = { on:(function(){ try{ return localStorage.getItem('tv-cluster') !== '0'; }catch(e){ return true; } })(), hidden:[], hiddenEls:[] };
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
  // popups altos (ficha, moldura…) não podem abrir por trás do cabeçalho nem do dock: o auto-ajuste do Leaflet
  // passa a respeitar a faixa ocupada por eles (lida na hora de abrir, então acompanha rotação e redimensionamento)
  (function popupPadding(){
    const pad = (top) => {
      try{
        const mr = document.getElementById('map').getBoundingClientRect(), ch = document.getElementById('map-chips'), dk = document.getElementById('dock');
        if(top){
          const b = ch ? Math.ceil(ch.getBoundingClientRect().bottom - mr.top) : 0;
          return [8, b > 0 && b < mr.height * 0.4 ? b + 8 : 8];
        }
        const h = dk && dk.offsetParent ? Math.ceil(mr.bottom - dk.getBoundingClientRect().top) : 0;
        return [8, h > 0 && h < mr.height * 0.25 ? h + 8 : 8];
      }catch(e){ return [5, 5]; }
    };
    Object.defineProperty(L.Popup.prototype.options, 'autoPanPaddingTopLeft', { get(){ return pad(true); }, set(){}, configurable:true });
    Object.defineProperty(L.Popup.prototype.options, 'autoPanPaddingBottomRight', { get(){ return pad(false); }, set(){}, configurable:true });
  })();
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
    // marcador que já saiu do mapa: o popup fecha DENTRO do clearLayers() de um redesenho em andamento;
    // redesenhar de novo aqui (reentrância) deixava o token duplicado depois de salvar no popup
    if(tokensLayer.hasLayer(src)){ tokenPopupActive = false; if(map.hasLayer(src)) renderTokens(); }
    if(shapesLayer.hasLayer(src)){ shapePopupActive = false; if(map.hasLayer(src)) renderShapes(); }
    if(routesLayer.hasLayer(src)){ routePopupActive = false; if(map.hasLayer(src)) renderRoutes(); }
  });

  document.getElementById('layer-streets').addEventListener('click', () => setLayer('streets'));
  document.getElementById('layer-topo').addEventListener('click', () => setLayer('topo'));
  document.getElementById('layer-sat').addEventListener('click', () => setLayer('sat'));
  document.getElementById('layer-snow').addEventListener('click', () => setLayer('snow'));

  try{ localStorage.removeItem('tv-map:hud-layer-collapsed'); }catch(e){}   // o antigo painel recolhível de camadas virou a folha "Camadas"

  const ALL_BASE_LAYERS = [streetsLayer, topoLayer, satLayer, satLabelsLayer];
  function activeLayerBtnId(){
    if(map.hasLayer(topoLayer)) return 'layer-topo';
    if(map.hasLayer(satLayer)) return 'layer-sat';
    if(mapEl.classList.contains('snow-map')) return 'layer-snow';
    return 'layer-streets';
  }

  function setLayer(which){
    document.querySelectorAll('#layer-streets, #layer-topo, #layer-sat, #layer-snow').forEach(b => b.classList.remove('active'));
    ALL_BASE_LAYERS.forEach(l => { if(map.hasLayer(l)) map.removeLayer(l); });
    mapEl.classList.remove('dark-streets', 'snow-map');
    if(which === 'streets'){
      streetsLayer.addTo(map);
      mapEl.classList.add('dark-streets');
      document.getElementById('layer-streets').classList.add('active');
      document.getElementById('stat-layer').textContent = 'Ruas';
    } else if(which === 'snow'){
      // Nevado: os mesmos blocos de rua, só que com o filtro de neve do CSS (#map.snow-map). Não baixa nada novo.
      streetsLayer.addTo(map);
      mapEl.classList.add('snow-map');
      document.getElementById('layer-snow').classList.add('active');
      document.getElementById('stat-layer').textContent = 'Nevado';
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
  const TOOLBAR_PIN_IDS = ['lugar', 'saque', 'perigo', 'abrigo', 'npc', 'veiculo', 'nota', 'pin'];


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
    if(lg.reloc){ lg.reloc = null; hideDrawHint(); }
    if(rosterUI && rosterUI.placing) rosterSetPlacing(null);
    areaDrawStop(); areaEditStop(false);
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
      // celular: o popover vira folha inferior e ficaria escondido atrás das gavetas (mochila, ficha, mesa)
      if(p.popover.classList.contains('open') && window.innerWidth < 721){ try{ hudCloseSheets(); closeHub(); closeDrawer(); closeNavDrawer(); closeInventory(); }catch(e){} }
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
  // f25: setIcon() recria o DOM do marcador (e reinicia pinDrop/ping). Só troca quando o HTML realmente mudou.
  function iconSig(icon){ const o = icon.options; return (o.className || '') + '|' + (o.html || '') + '|' + (o.iconSize || ''); }
  function setIconIfChanged(marker, icon){
    const sig = iconSig(icon);
    if(marker._sig === sig) return;
    marker._sig = sig; marker.setIcon(icon);
  }
  function pinIcon(pin){
    if(pin.type === 'lugar') return lgIcon(pin);
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
    const fp = isNpc ? frParts(pin.fr, color) : { ring:'', sh:'', wrap:'' };
    return L.divIcon({
      className: 'mk-' + mapfCat(typeId),
      html: `<div class="pin-wrap${lockCls}${sizeCls}${fp.wrap}">${ping}${fp.ring}${occupancyBadge}<div class="pin-badge${hasPhoto ? ' pin-badge-photo' : ''}"${fp.sh} style="${badgeStyle}">${badgeInner}</div>${npcNameTag}</div>`,
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
    const fp = frParts(pin.fr, color);
    return L.divIcon({
      className: 'mk-tokens',
      html: `<div class="pin-wrap pin-wrap-npc${fp.wrap}">${fp.ring}${stackBadge}<div class="pin-badge${hasPhoto ? ' pin-badge-photo' : ''}"${fp.sh} style="${badgeStyle}">${badgeInner}</div>${npcNameTag}</div>`,
      iconSize: [36,36],
      iconAnchor: [18,31],
      popupAnchor: [0,-29]
    });
  }
  function tokenIcon(token, stackCount){
    const borderColor = token.color || '#ffffff';
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
    const fp = frParts(token.fr, borderColor, { cls: isSelected ? ' sel' : '' });
    return L.divIcon({
      className: 'mk-tokens',
      html: `<div class="token-wrap${fp.wrap}">${fp.ring}
               <div class="token-icon${isSelected ? ' selected' : ''}${isStack ? ' is-stack' : ''}"${fp.sh}${stackAttrs} style="border-color:${escapeHtml(borderColor)}; color:${escapeHtml(borderColor)}">${inner}</div>
               <span class="token-name-tag">${nameLabel}</span>
             </div>`,
      iconSize: [36,56],
      iconAnchor: [18,18]
    });
  }

  // ---------- pin popup (create/edit) ----------
  // card de token/pin (f24): avatar e nome, ações grandes, edição recolhida
  const PC_COLORS = ['#ffffff', '#d3572a', '#e0c23c', '#7fb98a', '#4fb3d9', '#3f8fd1', '#a06be0', '#e0524a', '#9aa0a6'];
  function pcSwatches(cur, inputCls){
    const c = String(cur || '#ffffff').toLowerCase();
    return `<div class="pc-sws" role="radiogroup" aria-label="Cor">${PC_COLORS.map(x => `<button type="button" class="pc-sw${x === c ? ' on' : ''}" role="radio" aria-checked="${x === c}" data-c="${x}" style="--sw:${x}" aria-label="Cor ${x}"></button>`).join('')}
      <label class="pc-sw custom" title="Outra cor">${ic('plus', 14)}<input type="color" class="${inputCls}" value="${escapeHtml(c)}" aria-label="Outra cor"></label></div>`;
  }
  function pcWireSwatches(root, input){
    const mark = () => root.querySelectorAll('.pc-sw[data-c]').forEach(b => { const on = b.dataset.c === input.value.toLowerCase(); b.classList.toggle('on', on); b.setAttribute('aria-checked', on); });
    root.querySelectorAll('.pc-sw[data-c]').forEach(b => b.addEventListener('click', () => { input.value = b.dataset.c; input.dispatchEvent(new Event('input', { bubbles:true })); }));
    input.addEventListener('input', mark);
  }
  function pcVitals(id){
    const card = characters[id];
    if(!card || !card.resources2 || !card.resources2.pv) return '';
    return `<div class="pc-vit">${['pv', 'pd'].map(k => { const r = opRes(card, k), pct = r.max > 0 ? Math.round(Math.max(0, Math.min(1, r.cur / r.max)) * 100) : 0;
      return `<span class="pc-bar ${k}" style="--p:${pct}%"><b>${OP_RES[k][0]}</b><em>${r.cur}/${r.max}</em></span>`; }).join('')}</div>`;
  }
  function pcToggleEdit(container, force){
    const ed = container.querySelector('.pc-edit'), tg = container.querySelector('.pc-edit-toggle');
    ed.hidden = force != null ? !force : !ed.hidden;
    if(tg) tg.setAttribute('aria-expanded', String(!ed.hidden));
    // update() recriaria o conteúdo (a função do popup roda de novo); só refazemos tamanho e posição
    const pp = map._popup;
    if(pp && container.isConnected) setTimeout(() => { try{ pp._updateLayout(); pp._updatePosition(); pp._adjustPan(); }catch(e){} }, 0);
  }
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
    const cantSearch = canSearchPin(pin), isCont = isContainerPin(pin), fresh = !pin.title && !pin.note;
    const pt = PIN_TYPES.find(t => t.id === pin.type) || { color:'var(--ice-100)' }, bcol = isNpc ? npcColor : pt.color;
    const badge = isNpc
      ? `<div class="token-preview-wrap"><div class="token-preview" style="border-color:${escapeHtml(npcColor)}">${pin.image ? `<img src="${pin.image}" alt="">` : ''}</div></div>`
      : `<div class="pc-badge" style="--pc:${bcol}"><svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${PIN_ICONS[pin.type] || PIN_ICONS.nota}</svg></div>`;
    container.innerHTML = `<div class="pc">
      <div class="pc-head">${badge}
        <div class="pc-id"><b class="pc-name">${escapeHtml(pin.title || typeLabel)}</b>
          <span class="pc-sub">${escapeHtml(typeLabel)}${pin.ownerName ? ' · de ' + escapeHtml(pin.ownerName) : ''}</span>
          ${pin.osm ? `<span class="pc-src">Lugar real · OpenStreetMap${pin.osmTag ? ' · ' + escapeHtml(pin.osmTag) : ''}</span>` : ''}
          ${isNpc ? pcVitals(pin.id) : ''}</div></div>
      ${pin.note ? `<p class="pc-note">${escapeHtml(pin.note)}</p>` : ''}
      ${isContainer ? `<div class="pc-occ"><span class="pc-occ-t">Ocupantes${occupants.length ? ' · ' + occupants.length : ''}</span><div class="occupant-list-pin"></div></div>` : ''}
      <div class="pc-actions">
        ${isNpc ? `<button type="button" class="pc-act inv-open-btn">${ic('bag', 20)}<span>Mochila</span><i>${capTxt(pin.id)}</i></button>
        <button type="button" class="pc-act ficha-open-btn">${ic('user', 20)}<span>Ficha</span></button>` : ''}
        ${isCont ? `<button type="button" class="pc-act inv-open-btn">${ic('box', 20)}<span>Abrir</span><i>${escapeHtml(CONT_STATE_LABELS[containerState(pin.id)] || '')}</i></button>` : ''}
        ${cantSearch ? `<button type="button" class="pc-act pin-search-btn">${ic('search', 20)}<span>Vasculhar</span></button>` : ''}
        <button type="button" class="pc-act lock" aria-pressed="${!!pin.locked}">${ic(pin.locked ? 'unlock' : 'lock', 20)}<span>${pin.locked ? 'Soltar' : 'Travar'}</span></button>
        <button type="button" class="pc-act pc-edit-toggle" aria-expanded="false">${ic('edit', 20)}<span>Editar</span></button>
      </div>
      <div class="pc-edit" hidden>
        <input type="text" class="pin-title" aria-label="Título" placeholder="Título" value="${escapeHtml(pin.title || '')}">
        <textarea class="pin-note" rows="3" aria-label="Anotação" placeholder="Anotação">${escapeHtml(pin.note || '')}</textarea>
        ${isNpc ? `${pcSwatches(npcColor, 'pin-color-input')}
        <div class="pc-photo"><label class="pc-chip">${ic('image', 14)} Foto<input type="file" accept="image/*" class="pin-image-input" hidden></label>
          <button type="button" class="pc-chip img-adjust-btn pin-image-adjust"${pin.image && !/^data:image\/gif/i.test(pin.image) ? '' : ' hidden'}>Ajustar</button>
          ${pin.image ? '<button type="button" class="pc-chip pin-image-clear">Tirar foto</button>' : ''}</div>
        ${frPickerHtml(pin.fr, npcColor)}` : ''}
        <div class="popup-actions"><button type="button" class="save">Salvar</button><button type="button" class="del">Excluir</button></div>
      </div>
    </div>`;
    container.querySelector('.pc-edit-toggle').addEventListener('click', () => pcToggleEdit(container));
    if(fresh) pcToggleEdit(container, true);
    if(isContainer){
      const list = container.querySelector('.occupant-list-pin');
      if(occupants.length === 0){
        list.innerHTML = '<div class="occupant-empty">Vazio. Arraste um token até aqui.</div>';
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
          const got = await window.__tvPickImage(file, { title:'Ajustar foto do NPC', ratio:1, shape:'circle', out:160 }, resizeImageDataUrl);
          if(got == null){ imgInput.value = ''; return; }          // cancelou o ajuste
          pendingPinImage = got;
          preview.innerHTML = `<img src="${pendingPinImage}" alt="">`;
          adjBtn.hidden = /^data:image\/gif/i.test(pendingPinImage);
        }catch(e){
          console.error('Falha ao processar imagem do NPC', e);
          alert(e && e.message ? e.message : 'Não foi possível usar essa imagem.');
          imgInput.value = '';
        }
      });
      const adjBtn = container.querySelector('.pin-image-adjust');
      adjBtn.addEventListener('click', async () => {
        if(!pendingPinImage) return;
        const r = await window.tvAdjustImage(pendingPinImage, { title:'Ajustar foto do NPC', ratio:1, shape:'circle', out:160 }).catch(() => null);
        if(r){ pendingPinImage = r.data; preview.innerHTML = `<img src="${pendingPinImage}" alt="">`; }
      });
      const clearBtn = container.querySelector('.pin-image-clear');
      if(clearBtn){
        clearBtn.addEventListener('click', () => {
          pendingPinImage = null;
          imgInput.value = '';
          preview.innerHTML = '';
          adjBtn.hidden = true;
        });
      }
      const colorInput = container.querySelector('.pin-color-input');
      pcWireSwatches(container, colorInput);
      const fichaBtn = container.querySelector('.ficha-open-btn');
      if(fichaBtn) fichaBtn.addEventListener('click', () => { map.closePopup(); hub.charToken = pin.id; rollUI.who = pin.id; openHub('ficha'); });
      const frRoot = container.querySelector('.fr-pick'), prevWrap = container.querySelector('.token-preview-wrap');
      frPickerWire(frRoot, () => colorInput.value, (fr, col) => frPreview(prevWrap, preview, fr, col));
      colorInput.addEventListener('input', () => {
        preview.style.borderColor = colorInput.value;
        if(frRoot.__paint) frRoot.__paint();
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
        setIconIfChanged(marker, pinIcon(pin));
        if(marker.dragging){ if(pin.locked) marker.dragging.disable(); else marker.dragging.enable(); }
      }
      renderPins();
      openPinPopupById(pin.id);
    });
    container.querySelector('.save').addEventListener('click', () => {
      pin.title = container.querySelector('.pin-title').value.trim() || typeLabel;
      pin.note = container.querySelector('.pin-note').value.trim();
      if(isNpc){
        pin.color = container.querySelector('.pin-color-input').value;
        pin.image = pendingPinImage;
        const fr = frPickerGet(container.querySelector('.fr-pick'));
        if(fr) pin.fr = fr; else delete pin.fr;
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
    const currentColor = token.color || '#ffffff';
    const initials = escapeHtml((token.label || 'TK').slice(0,2).toUpperCase());

    container.innerHTML = `<div class="pc">
      <div class="pc-head"><div class="token-preview-wrap"><div class="token-preview" style="border-color:${escapeHtml(currentColor)}">${token.image ? `<img src="${token.image}" alt="">` : `<span>${initials}</span>`}</div></div>
        <div class="pc-id"><b class="pc-name">${escapeHtml(token.label || 'Token')}</b>
          <span class="pc-sub">Token${token.ownerName ? ' · de ' + escapeHtml(token.ownerName) : ''}</span>${pcVitals(token.id)}</div></div>
      <div class="pc-actions">
        <button type="button" class="pc-act inv-open-btn">${ic('bag', 20)}<span>Mochila</span><i>${capTxt(token.id)}</i></button>
        <button type="button" class="pc-act ficha-open-btn">${ic('user', 20)}<span>Ficha</span></button>
        <button type="button" class="pc-act pc-edit-toggle" aria-expanded="false">${ic('edit', 20)}<span>Editar</span></button>
      </div>
      <div class="pc-edit" hidden>
        <input type="text" class="token-label" aria-label="Nome" placeholder="Nome" value="${escapeHtml(token.label || '')}">
        ${pcSwatches(currentColor, 'token-color-input')}
        <div class="pc-photo"><label class="pc-chip">${ic('image', 14)} Foto<input type="file" accept="image/*" class="token-image-input" hidden></label>
          <button type="button" class="pc-chip img-adjust-btn token-image-adjust"${token.image && !/^data:image\/gif/i.test(token.image) ? '' : ' hidden'}>Ajustar</button>
          ${token.image ? '<button type="button" class="pc-chip token-image-clear">Tirar foto</button>' : ''}</div>
        ${frPickerHtml(token.fr, currentColor)}
        <div class="popup-actions"><button type="button" class="save">Salvar</button><button type="button" class="del">Remover</button></div>
      </div>
    </div>`;
    container.querySelector('.pc-edit-toggle').addEventListener('click', () => pcToggleEdit(container));
    if(!token.label || token.label === 'Token') pcToggleEdit(container, true);
    pcWireSwatches(container, container.querySelector('.token-color-input'));
    container.querySelector('.inv-open-btn').addEventListener('click', () => { map.closePopup(); openInventory(token.id); });
    container.querySelector('.ficha-open-btn').addEventListener('click', () => { map.closePopup(); hub.charToken = token.id; rollUI.who = token.id; openHub('ficha'); });
    const preview = container.querySelector('.token-preview');
    const colorInput = container.querySelector('.token-color-input');
    const frRoot = container.querySelector('.fr-pick'), prevWrap = container.querySelector('.token-preview-wrap');
    frPickerWire(frRoot, () => colorInput.value, (fr, col) => frPreview(prevWrap, preview, fr, col));
    colorInput.addEventListener('input', () => { preview.style.borderColor = colorInput.value; if(frRoot.__paint) frRoot.__paint(); });

    let pendingImage = token.image || null;
    const fileInput = container.querySelector('.token-image-input');
    fileInput.addEventListener('change', async () => {
      const file = fileInput.files && fileInput.files[0];
      if(!file) return;
      try{
        const got = await window.__tvPickImage(file, { title:'Ajustar imagem do token', ratio:1, shape:'circle', out:160 }, resizeImageDataUrl);
        if(got == null){ fileInput.value = ''; return; }              // cancelou o ajuste
        pendingImage = got;
        preview.innerHTML = `<img src="${pendingImage}" alt="">`;
        tkAdj.hidden = /^data:image\/gif/i.test(pendingImage);
      }catch(e){
        console.error('Falha ao processar imagem do token', e);
        alert(e && e.message ? e.message : 'Não foi possível usar essa imagem.');
        fileInput.value = '';
      }
    });
    const tkAdj = container.querySelector('.token-image-adjust');
    tkAdj.addEventListener('click', async () => {
      if(!pendingImage) return;
      const r = await window.tvAdjustImage(pendingImage, { title:'Ajustar imagem do token', ratio:1, shape:'circle', out:160 }).catch(() => null);
      if(r){ pendingImage = r.data; preview.innerHTML = `<img src="${pendingImage}" alt="">`; }
    });
    const clearBtn = container.querySelector('.token-image-clear');
    if(clearBtn){
      clearBtn.addEventListener('click', () => {
        pendingImage = null;
        fileInput.value = '';
        preview.innerHTML = `<span>${initials}</span>`;
        tkAdj.hidden = true;
      });
    }

    container.querySelector('.save').addEventListener('click', () => {
      token.label = container.querySelector('.token-label').value.trim() || 'Token';
      token.color = colorInput.value;
      token.image = pendingImage;
      const fr = frPickerGet(frRoot);
      if(fr) token.fr = fr; else delete token.fr;
      renderTokens();
      map.closePopup();
      saveKey(KEY_TOKENS, tokens);
    });
    container.querySelector('.del').addEventListener('click', () => { deleteTokenById(token.id); });
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
    if(lastWx !== null && lastWx !== weather.state){
      if(weather.state === 'tempestade') TVSound.play('trovao', { remote:true, v:0.9 });
      else if(weather.state === 'espectral') TVSound.play('anom', { remote:true });
    }
    lastWx = weather.state;
    wxMotionHintOnce();
    if(hudReady){ hubChanged(); hudMiniChanged(); hudQRChanged(); if(tacUI.open) tacChanged(); }   // totais da ficha e terreno do tático acompanham o clima
  }

  function renderWeatherOptions(){
    const wrap = document.getElementById('weather-options');
    if(!wrap) return;
    renderWxMotion();
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
    if(hit) TVSound.play('trovao', { v:0.9 });
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

  // Animação do clima (f22). O CSS congela a neve/chuva/névoa quando o navegador pede "reduzir movimento" (no Windows: Configurações > Acessibilidade >
  // Efeitos visuais > Efeitos de animação desligado; Brave e Opera GX seguem isso). Aqui cada aparelho escolhe: Automática (segue o aparelho), Ligada ou Desligada.
  const KEY_WXM = 'tv-map:wx-motion', KEY_WXM_HINT = 'tv-map:wx-hint';
  const osReducesMotion = () => { try{ return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches); }catch(e){ return false; } };
  function wxMotionPref(){ try{ const v = localStorage.getItem(KEY_WXM); return v === 'on' || v === 'off' ? v : 'auto'; }catch(e){ return 'auto'; } }
  function applyWxMotion(){
    const p = wxMotionPref(), el = document.documentElement;
    if(p === 'auto') el.removeAttribute('data-wx-motion'); else el.setAttribute('data-wx-motion', p);
  }
  function renderWxMotion(){
    const wrap = document.getElementById('wx-motion'); if(!wrap) return;
    const p = wxMotionPref(), os = osReducesMotion();
    const note = p === 'on' ? 'Sempre animada neste aparelho.'
      : p === 'off' ? 'Parada neste aparelho (poupa bateria e desempenho).'
      : os ? 'Seu navegador ou o Windows pede menos movimento, então a animação está parada. Toque em “Ligada” para ver a neve e a chuva mesmo assim.'
      : 'Segue a configuração do seu aparelho.';
    wrap.innerHTML = `<div class="wx-motion-label">Animação do clima · só neste aparelho</div>
      <div class="wx-seg" role="group" aria-label="Animação do clima">${[['auto', 'Automática'], ['on', 'Ligada'], ['off', 'Desligada']].map(m =>
        `<button type="button" data-wxm="${m[0]}" aria-pressed="${p === m[0]}">${m[1]}</button>`).join('')}</div>
      <p class="wx-motion-note" id="wx-motion-note">${note}</p>`;
    wrap.querySelectorAll('[data-wxm]').forEach(b => b.addEventListener('click', () => {
      try{ if(b.dataset.wxm === 'auto') localStorage.removeItem(KEY_WXM); else localStorage.setItem(KEY_WXM, b.dataset.wxm); }catch(e){}
      applyWxMotion(); renderWxMotion();
    }));
  }
  // avisa uma única vez por aparelho que a animação está parada pelo navegador (senão parece defeito)
  function wxMotionHintOnce(){
    if(!osReducesMotion() || wxMotionPref() !== 'auto' || weather.state === 'calmo') return;
    try{ if(localStorage.getItem(KEY_WXM_HINT)) return; localStorage.setItem(KEY_WXM_HINT, '1'); }catch(e){ return; }
    toast('A animação do clima está parada porque o navegador pede menos movimento. Em Clima, toque em “Ligada” para ver.');
  }
  applyWxMotion();

  function openWeatherPopover(){
    // celular: gavetas (ficha, mochila, mesa) ficariam por cima do popover do clima
    if(window.innerWidth < 721){ try{ hudCloseSheets(); closeHub(); closeDrawer(); closeNavDrawer(); closeInventory(); }catch(e){} }
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
  function renderPins(){ renderPinsCore(); if(mapEntitiesHook) mapEntitiesHook(); plDraw(); clusterUpdate(); rosterChanged(); }
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
        const ic0 = pinIcon(pin);
        marker = L.marker([pin.lat, pin.lng], { icon: ic0, draggable: !pin.locked });
        marker._sig = iconSig(ic0);
        marker._pinId = pin.id;
        marker.on('click', (e) => { L.DomEvent.stopPropagation(e); if(pin.type === 'lugar') lgOpen(pin.id); });
        marker.on('dragstart', () => { pinDraggingId = pin.id; });
        marker.on('dragend', async (e) => {
          pinDraggingId = null;
          const p = pins.find(pp => pp.id === pin.id);
          if(!p) return;
          const pos = e.target.getLatLng();
          p.lat = pos.lat; p.lng = pos.lng;
          if(p.type === 'npc') tryDockPinNpc(p, pos);
          if(p.type === 'lugar') lgFollow(p);
          await saveKey(KEY_PINS, pins);
          renderPins();
          renderTokens();
          if(typeof renderNavList === 'function') renderNavList();
        });
        // busca o pin atual na hora de abrir o popup (nunca o objeto "congelado"
        // no momento da criação do marker), pra sempre mostrar dado fresco
        if(pin.type !== 'lugar') marker.bindPopup(() => buildPinPopupContent(pins.find(pp => pp.id === pin.id) || pin));
        marker.addTo(pinsLayer);
        pinMarkers[pin.id] = marker;
      } else if(pin.id !== pinDraggingId && pin.id !== editingPinId){
        // protegido: enquanto está sendo arrastado ou com o popup de edição
        // aberto localmente, este marcador específico não é tocado
        const ll = marker.getLatLng();
        if(ll.lat !== pin.lat || ll.lng !== pin.lng) marker.setLatLng([pin.lat, pin.lng]);
        setIconIfChanged(marker, pinIcon(pin));
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
    if(pin.type === 'lugar'){ lgClose(true); if(shapes.some(s => s.placeId === pin.id)){ shapes = shapes.filter(s => s.placeId !== pin.id); renderShapes(); saveKey(KEY_SHAPES, shapes); } }
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
    if(area.sheetId === id) areaClose();
    shapes = shapes.filter(s => s.id !== id);
    renderShapes();
    map.closePopup();
    saveKey(KEY_SHAPES, shapes);
  }
  function deleteRouteById(id){
    if(rt.sheetId === id) routeClose();
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
    const lp = pins.find(p => p.id === id);
    if(lp && lp.type === 'lugar'){ lgOpen(id); return; }
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
      if(p.type !== 'npc' && p.type !== 'veiculo' && p.type !== 'abrigo' && p.type !== 'lugar') return;
      const m = pinMarkers[p.id]; if(!m || !m._icon || !pinsLayer.hasLayer(m) || off(mapfCat(p.type))) return;
      out.push({ m, n:1, ll:m.getLatLng(), kind:p.type, pid:p.id });
    });
    return out;
  }
  function clearClusters(){
    clusterLayer.clearLayers();
    cl.hidden.forEach(m => { if(m._icon) m._icon.classList.remove('cl-hide'); });
    cl.hidden = [];
    (cl.hiddenEls || []).forEach(el => { if(el && el.classList) el.classList.remove('cl-hide-ar'); });
    cl.hiddenEls = [];
  }
  // esconde (sem apagar) o desenho e o nome das áreas ligadas a um lugar que entrou num grupo
  function clHideAreasOf(pid){
    shapes.forEach(sh => {
      if(sh.placeId !== pid) return;
      const lay = area.paths[sh.id];
      const el = lay && (lay._path || (lay.eachLayer ? null : null));
      if(el){ el.classList.add('cl-hide-ar'); cl.hiddenEls.push(el); }
      else if(lay && lay.eachLayer) lay.eachLayer(l => { if(l._path){ l._path.classList.add('cl-hide-ar'); cl.hiddenEls.push(l._path); } });
      (area.items || []).forEach(it => { if(it.id === sh.id && it.marker && it.marker._icon){ it.marker._icon.classList.add('cl-hide-ar'); cl.hiddenEls.push(it.marker._icon); } });
    });
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
      g.items.forEach(e => {
        e.m._icon.classList.add('cl-hide'); cl.hidden.push(e.m);
        if(e.kind === 'lugar') clHideAreasOf(e.pid);   // a área do lugar entra no grupo junto com o marcador
      });
      const cnt = { token:0, npc:0, veiculo:0, abrigo:0, lugar:0 };
      g.items.forEach(e => { if(e.kind === 'pilha') cnt.token += e.n; else cnt[e.kind] += e.n; });
      const parts = [];
      if(cnt.token) parts.push(cnt.token + (cnt.token === 1 ? ' token' : ' tokens'));
      if(cnt.npc) parts.push(cnt.npc + (cnt.npc === 1 ? ' NPC' : ' NPCs'));
      if(cnt.veiculo) parts.push(cnt.veiculo + (cnt.veiculo === 1 ? ' veículo' : ' veículos'));
      if(cnt.abrigo) parts.push(cnt.abrigo + (cnt.abrigo === 1 ? ' abrigo' : ' abrigos'));
      if(cnt.lugar) parts.push(cnt.lugar + (cnt.lugar === 1 ? ' lugar' : ' lugares'));
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

  function renderTokens(){ renderTokensCore(); if(mapEntitiesHook) mapEntitiesHook(); hudMiniChanged(); mapfRender(); plDraw(); plWarmSoon(); clusterUpdate(); rosterChanged(); }
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
  window.__tvOpen = { token: id => openTokenPopupById(id), pin: id => openPinPopupById(id) };   // só para os testes automáticos

  // ---------- ÁREAS (f14): desenho no mapa ----------
  const areaEl = id => document.getElementById(id);
  const areaHash = s => { let h = 2166136261; for(let i = 0; i < s.length; i++){ h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; };
  // mistura a cor com branco: o ícone fica mais claro que o preenchimento e continua legível no mapa escuro
  const areaLight = c => { const n = parseInt(c.slice(1), 16), m = v => Math.round(v + (255 - v) * 0.35).toString(16).padStart(2, '0'); return '#' + m(n >> 16 & 255) + m(n >> 8 & 255) + m(n & 255); };
  function areaDefs(){
    const svg = map.getRenderer({ options:{} })._container;
    let d = svg.querySelector('#tv-ar-defs');
    if(!d){ d = document.createElementNS('http://www.w3.org/2000/svg', 'defs'); d.setAttribute('id', 'tv-ar-defs'); svg.insertBefore(d, svg.firstChild); }
    return d;
  }
  // padrão de preenchimento: fundo colorido + 2 ícones por bloco; o movimento e os raios são animações SMIL dentro do próprio padrão
  function areaPatternHtml(pid, st, seed, anim){
    const T = { baixa:64, media:46, alta:34 }[st.dn] || 46;
    let body = `<rect width="${T}" height="${T}" fill="${st.c}" fill-opacity="${st.op}"/>`;
    const ico = AREA_ICON[st.ic];
    if(ico){
      const k = T * 0.34 / 24, col = areaLight(st.c), c = (12 * k).toFixed(1);
      const put = (x, y, rot) => `<g transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${rot} ${c} ${c}) scale(${k.toFixed(3)})" fill="none" stroke="${col}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" opacity="0.82">${ico.p}</g>`;
      body += put(T * 0.10, T * 0.08, -10) + put(T * 0.56, T * 0.56, 12);
    }
    let motion = '';
    if(anim && st.ef === 'raios'){
      const dur = (4.5 + (seed % 30) / 10).toFixed(1), off = ((seed >> 5) % 47 / 10).toFixed(1);
      body += `<rect width="${T}" height="${T}" fill="#f4eeff" fill-opacity="0"><animate attributeName="fill-opacity" values="0;0;0.55;0.05;0.4;0;0" keyTimes="0;0.6;0.62;0.66;0.68;0.76;1" dur="${dur}s" begin="-${off}s" repeatCount="indefinite"/></rect>`;
    }
    if(anim && st.mv){
      const fast = st.ic === 'drop' || st.ic === 'rain', dur = st.mv === 'cair' ? (fast ? 1.1 : 3) : (st.mv === 'subir' ? 2.8 : 9);
      const to = st.mv === 'cair' ? `0 ${T}` : (st.mv === 'subir' ? `0 -${T}` : `${T} 0`);
      motion = `<animateTransform attributeName="patternTransform" type="translate" from="0 0" to="${to}" dur="${dur}s" repeatCount="indefinite"/>`;
    }
    return `<pattern id="${pid}" width="${T}" height="${T}" patternUnits="userSpaceOnUse">${motion}${body}</pattern>`;
  }
  function areaPathStyle(st, pid, usePat, anim){
    const noLine = st.bd === 'nenhum' && st.ef !== 'borda';
    const dash = st.ef === 'borda' ? '10 8' : ({ tracejado:'6 4', pontilhado:'2 6' }[st.bd] || null);
    const cls = 'tv-ar' + (anim && st.ef === 'pulso' ? ' tv-ar-pulso' : '') + (anim && st.ef === 'borda' ? ' tv-ar-borda' : '');
    return { color:st.c, weight:noLine ? 0 : 2, stroke:!noLine, opacity:0.9, lineCap:'round', dashArray:dash, className:cls,
      fillColor: usePat ? 'url(#' + pid + ')' : st.c, fillOpacity: usePat ? 1 : st.op };
  }
  // anéis do polígono em [lat,lng], sem o ponto final repetido; null se o dado não presta
  function areaRings(shape){
    const gj = shape && shape.geojson, g = gj && (gj.geometry || gj);
    if(!g || g.type !== 'Polygon' || !Array.isArray(g.coordinates) || !g.coordinates.length) return null;
    const rings = g.coordinates.map(r => Array.isArray(r) ? r.map(c => [c[1], c[0]]) : []);
    const out = rings.map(r => (r.length > 1 && r[0][0] === r[r.length - 1][0] && r[0][1] === r[r.length - 1][1]) ? r.slice(0, -1) : r);
    return out.every(r => r.length >= 3 && r.every(p => isFinite(p[0]) && isFinite(p[1]))) ? out : null;
  }
  function areaCircleBounds(c, r){
    const dLat = r / 111320, dLng = r / (111320 * Math.max(0.05, Math.cos(c[0] * Math.PI / 180)));
    return L.latLngBounds([c[0] - dLat, c[1] - dLng], [c[0] + dLat, c[1] + dLng]);
  }
  function areaCentroid(ring){
    let a = 0, cx = 0, cy = 0;
    for(let i = 0, n = ring.length; i < n; i++){
      const p = ring[i], q = ring[(i + 1) % n], f = p[1] * q[0] - q[1] * p[0];
      a += f; cx += (p[1] + q[1]) * f; cy += (p[0] + q[0]) * f;
    }
    if(Math.abs(a) < 1e-14) return null;
    return L.latLng(cy / (3 * a), cx / (3 * a));
  }
  // tamanho aproximado, em texto: círculo = π·r²; polígono = fórmula do cadarço depois de projetar em metros
  function areaSizeText(shape){
    let m2 = null;
    if(shape.type === 'circle' && shape.radius > 0) m2 = Math.PI * shape.radius * shape.radius;
    else { const r = areaRings(shape); if(r){ const ring = r[0], lat0 = ring[0][0] * Math.PI / 180, kx = 111320 * Math.cos(lat0), ky = 111320; let a = 0;
      for(let i = 0; i < ring.length; i++){ const p = ring[i], q = ring[(i + 1) % ring.length]; a += (p[1] * kx) * (q[0] * ky) - (q[1] * kx) * (p[0] * ky); } m2 = Math.abs(a) / 2; } }
    if(m2 == null) return '';
    return m2 >= 10000 ? '≈ ' + (m2 / 10000).toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + ' ha' : '≈ ' + Math.round(m2).toLocaleString('pt-BR') + ' m²';
  }

  function renderShapes(){
    shapesLayer.clearLayers();
    renderedShapeIds.clear();
    area.paths = {}; area.items = [];
    const anim = areaAnimOn();
    let pats = '';
    // cada forma é desenhada isoladamente: uma forma com dado quebrado não pode mais impedir o desenho das outras
    shapes.forEach(shape => {
      try{
        const st = areaSt(shape), usePat = !!st.ic || st.ef === 'raios';
        const pid = 'tv-ar-p-' + String(shape.id).replace(/[^A-Za-z0-9_-]/g, '');
        if(usePat) pats += areaPatternHtml(pid, st, areaHash(String(shape.id)), anim);
        const style = areaPathStyle(st, pid, usePat, anim);
        let layer, bounds, center;
        if(shape.type === 'circle' && shape.center && typeof shape.radius === 'number'){
          const c = shape.center;
          if(!Array.isArray(c) || !isFinite(c[0]) || !isFinite(c[1]) || !isFinite(shape.radius) || shape.radius <= 0) throw new Error('círculo inválido');
          layer = L.circle(c, Object.assign({ radius: shape.radius }, style));
          bounds = areaCircleBounds(c, shape.radius); center = L.latLng(c);
        } else {
          const rings = areaRings(shape);
          if(rings){ layer = L.polygon(rings, style); bounds = L.latLngBounds(rings[0]); center = areaCentroid(rings[0]) || bounds.getCenter(); }
          else { layer = L.geoJSON(shape.geojson, { style: () => style }); bounds = layer.getBounds(); if(!bounds.isValid()) throw new Error('forma sem geometria'); center = bounds.getCenter(); }
        }
        layer._shapeId = shape.id;
        layer.on('click', () => { if(area.draw || area.edit || selectedPinType || tokenModeOn || routeModeOn) return; areaOpen(shape.id); });
        layer.addTo(shapesLayer);
        area.paths[shape.id] = layer;
        if(shape.label && st.lb !== 'oculto'){
          const lm = L.marker(center, { keyboard:false, zIndexOffset:-600,
            icon: L.divIcon({ className:'ar-lbw', iconSize:[0, 0], html:`<div class="ar-lb" style="--c:${st.c}"><i></i><span class="ar-lb-t">${escapeHtml(shape.label)}</span></div>` }) });
          lm.on('click', ev => { L.DomEvent.stopPropagation(ev); areaLabelClick(lm); });
          lm.addTo(shapesLayer);
          area.items.push({ id:shape.id, mode:st.lb, name:shape.label, bounds, center, marker:lm });
        }
        renderedShapeIds.add(shape.id);
      }catch(err){
        console.warn('Área não pôde ser desenhada:', shape && shape.id, err && err.message);
      }
    });
    try{ areaDefs().innerHTML = pats; }catch(err){ console.warn('Padrões das áreas:', err && err.message); }
    areaLabelsSoon();
    mapfRender();
    if(typeof renderNavList === 'function') renderNavList();
    if(typeof clusterUpdate === 'function') clusterUpdate();
  }

  // rótulos das áreas: etiqueta pequena; quando se encostam viram "N áreas" (toque para aproximar); áreas minúsculas viram um ponto
  function areaLabelsLayout(){
    area.rafL = 0;
    const all = (area.items || []).concat(rt.items || []).filter(it => it.marker && it.marker._icon);   // só o que está no mapa (camada ligada)
    if(!all.length) return;
    const sz = map.getSize(), rect = (x, y, w, h) => ({ x:x - w / 2, y:y - h / 2, w, h });
    const hit = (a, b, g) => a.x < b.x + b.w + g && b.x < a.x + a.w + g && a.y < b.y + b.h + g && b.y < a.y + a.h + g;
    const its = all.map(it => {
      const sw = map.latLngToContainerPoint(it.bounds.getSouthWest()), ne = map.latLngToContainerPoint(it.bounds.getNorthEast());
      it.w = Math.abs(ne.x - sw.x); it.h = Math.abs(ne.y - sw.y); it.pt = map.latLngToContainerPoint(it.center); it.state = 'chip'; it.group = null; return it;
    });
    its.sort((a, b) => b.w * b.h - a.w * a.h);
    const groups = [];
    its.forEach(it => {
      const off = it.pt.x < -120 || it.pt.y < -60 || it.pt.x > sz.x + 120 || it.pt.y > sz.y + 60;
      if(off){ it.state = 'hide'; return; }
      if(it.mode === 'sempre') return;
      const tiny = it.w < 28 && it.h < 28;
      it.box = tiny ? rect(it.pt.x, it.pt.y, 12, 12) : rect(it.pt.x, it.pt.y, Math.min(130, 16 + 5.6 * it.name.length), 18);
      const g = groups.find(x => hit(x.rep.box, it.box, 3));
      if(g){ g.members.push(it); it.state = 'hide'; }
      else { groups.push({ rep:it, members:[it] }); it.state = tiny ? 'dot' : 'chip'; }
    });
    groups.forEach(g => { if(g.members.length > 1){ g.rep.state = 'count'; g.rep.group = g.members; } });
    its.forEach(it => {
      const el = it.marker._icon; if(!el) return;
      el.dataset.ar = it.state;
      const kinds = new Set((it.group || []).map(m => m.kind || 'area'));
      const t = el.querySelector('.ar-lb-t'), txt = it.state === 'count' ? it.group.length + (kinds.size > 1 ? ' itens' : (kinds.has('rota') ? ' rotas' : ' áreas')) : it.name;
      if(t && t.textContent !== txt) t.textContent = txt;
      it.marker._arGroup = it.state === 'count' ? it.group : null;
      it.marker._arId = it.id; it.marker._arKind = it.kind || 'area';
    });
  }
  function areaLabelsSoon(){ if(area.rafL) return; area.rafL = requestAnimationFrame(areaLabelsLayout); }
  function areaLabelClick(lm){
    if(area.draw || area.edit) return;
    const g = lm._arGroup;
    if(g && g.length > 1){
      let b = null; g.forEach(it => { b = b ? b.extend(it.bounds) : L.latLngBounds(it.bounds.getSouthWest(), it.bounds.getNorthEast()); });
      map.fitBounds(b, { padding:[50, 50], maxZoom:17 });
    } else if(lm._arId){ if(lm._arKind === 'rota') routeOpen(lm._arId); else areaOpen(lm._arId); }
  }
  map.on('zoomend moveend resize', areaLabelsSoon);
  shapesLayer.on('add', areaLabelsSoon);

  function openShapePopupById(id){ areaOpen(id); }

  // ---------- ROTAS (f19): desenho no mapa, ícones/setas ao longo da linha, etiqueta que agrupa ----------
  const routeValid = r => !!r && Array.isArray(r.points) && r.points.length >= 2 && r.points.every(p => Array.isArray(p) && isFinite(p[0]) && isFinite(p[1]));
  // ponto no meio do caminho (pela distância, não pelo número de pontos)
  function routeMid(pts){
    const tot = totalDistanceOf(pts); let acc = 0;
    for(let i = 1; i < pts.length; i++){
      const d = pts[i - 1].distanceTo(pts[i]);
      if(acc + d >= tot / 2 && d > 0){ const t = (tot / 2 - acc) / d; return L.latLng(pts[i - 1].lat + (pts[i].lat - pts[i - 1].lat) * t, pts[i - 1].lng + (pts[i].lng - pts[i - 1].lng) * t); }
      acc += d;
    }
    return pts[Math.floor(pts.length / 2)];
  }
  function renderRoutes(){
    routesLayer.clearLayers();
    rt.paths = {}; rt.items = []; rt.decoSrc = [];
    rt.deco = L.layerGroup().addTo(routesLayer);
    const anim = areaAnimOn();
    routes.forEach(route => {
      try{
        if(!routeValid(route)) return;
        const st = routeSt(route), w = ROUTE_W[st.w], pts = route.points.map(p => L.latLng(p)), set = [];
        const mk = (o, cls) => { const l = L.polyline(pts, Object.assign({ lineJoin:'round', className:cls }, o)).addTo(routesLayer); set.push(l); return l; };
        mk({ color:'#0b1014', weight:w + 3, opacity:0.5, interactive:false }, 'rt-halo');
        mk({ color:st.c, weight:w, opacity:0.95, dashArray:routeDash(st), lineCap:st.ds === 'pontilhado' ? 'round' : 'butt', interactive:false }, 'rt-line' + (anim && st.ev === 'pulso' ? ' rt-pulse' : ''));
        if(anim && st.ev === 'fluxo') mk({ color:'#ffffff', weight:Math.max(1.6, w * 0.5), opacity:0.85, dashArray:'6 18', lineCap:'round', interactive:false }, 'rt-flow');
        const hit = mk({ color:'#000000', weight:26, opacity:0, interactive:true }, 'rt-hit');   // faixa larga e invisível: fácil de tocar no celular
        hit._routeId = route.id;
        hit.on('click', ev => {
          if(area.draw || area.edit || selectedPinType || tokenModeOn || lg.reloc) return;   // em modo de criação o toque segue para o mapa
          L.DomEvent.stopPropagation(ev); routeOpen(route.id);
        });
        rt.paths[route.id] = set;
        if(st.lb !== 'oculto'){
          const d = route.distance != null && isFinite(route.distance) ? route.distance : totalDistanceOf(pts);
          const txt = (route.label || 'Rota') + ' · ' + formatDistance(d), center = routeMid(pts);
          const lm = L.marker(center, { keyboard:false, zIndexOffset:-600,
            icon: L.divIcon({ className:'ar-lbw', iconSize:[0, 0], html:`<div class="ar-lb rt-lb" style="--c:${st.c}"><i></i><span class="ar-lb-t">${escapeHtml(txt)}</span></div>` }) });
          lm.on('click', ev => { L.DomEvent.stopPropagation(ev); areaLabelClick(lm); });
          lm.addTo(routesLayer);
          rt.items.push({ id:route.id, kind:'rota', mode:st.lb, name:txt, bounds:L.latLngBounds(pts), center, marker:lm });
        }
        rt.decoSrc.push({ id:route.id, st, pts });
      }catch(err){
        console.warn('Rota não pôde ser desenhada:', route && route.id, err && err.message);
      }
    });
    const sr = document.getElementById('stat-routes'); if(sr) sr.textContent = routes.length;
    routeDecoSoon(); areaLabelsSoon();
    mapfRender();
    if(typeof renderNavList === 'function') renderNavList();
  }
  // ícones repetidos, setas de sentido e pontas: marcadores leves ao longo da linha, só os que estão na tela, refeitos a cada zoom/arraste
  function routeDecoSoon(){ if(rt.rafD) return; rt.rafD = requestAnimationFrame(routeDecoDraw); }
  function routeDecoDraw(){
    rt.rafD = 0;
    if(!rt.deco) return;
    rt.deco.clearLayers();
    if(!map.hasLayer(routesLayer)) return;
    const sz = map.getSize(), pad = 60, inView = p => p.x > -pad && p.y > -pad && p.x < sz.x + pad && p.y < sz.y + pad;
    const svgOf = (p, sw) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>`;
    const add = (pt, html, cls, size) => L.marker(map.containerPointToLatLng(pt), { interactive:false, keyboard:false, zIndexOffset:-700,
      icon:L.divIcon({ className:'rt-dc', iconSize:[size, size], iconAnchor:[size / 2, size / 2], html }) }).addTo(rt.deco);
    (rt.decoSrc || []).forEach(src => {
      const st = src.st, pp = src.pts.map(l => map.latLngToContainerPoint(l));
      const seg = []; let tot = 0;
      for(let i = 0; i < pp.length - 1; i++){ const d = pp[i].distanceTo(pp[i + 1]); seg.push(d); tot += d; }
      if(tot < 10) return;
      // percorre a linha em passos fixos a partir do início (as posições não "andam" ao arrastar o mapa)
      const walk = (step, first, cap, fn) => {
        let n = 0, acc = 0, next = first;
        for(let i = 0; i < seg.length && n < cap; i++){
          while(next <= acc + seg[i] && n < cap){
            const t = seg[i] ? (next - acc) / seg[i] : 0, x = pp[i].x + (pp[i + 1].x - pp[i].x) * t, y = pp[i].y + (pp[i + 1].y - pp[i].y) * t;
            if(inView({ x, y })){ fn(L.point(x, y), Math.atan2(pp[i + 1].x - pp[i].x, -(pp[i + 1].y - pp[i].y)) * 180 / Math.PI); n++; }
            next += step;
          }
          acc += seg[i];
        }
      };
      const ico = ROUTE_ICON[st.ic];
      if(ico) walk(64, 32, 120, pt => add(pt, `<span class="rt-ic" style="--c:${st.c}">${svgOf(ico.p, 2.2)}</span>`, '', 22));
      if(st.dir === 'setas' || st.dir === 'ambos') walk(120, 90, 120, (pt, deg) => add(pt, `<span class="rt-ar" style="--c:${st.c};transform:rotate(${Math.round(deg)}deg)">${svgOf('<path d="M5 16l7-9 7 9"/>', 3.2)}</span>`, '', 20));
      if(st.dir === 'pontas' || st.dir === 'ambos'){
        const a = pp[0], b = pp[pp.length - 1];
        if(inView(a)) add(a, `<span class="rt-pt" style="--c:${st.c}"></span>`, '', 16);
        if(inView(b)) add(b, `<span class="rt-end" style="--c:${st.c}">${svgOf(AREA_ICON.flag.p, 2.4)}</span>`, '', 24);
      }
    });
  }
  map.on('zoomend moveend resize', routeDecoSoon);
  routesLayer.on('add', routeDecoSoon);

  function openRoutePopupById(id){ routeOpen(id); }

  // --- desenhar: toque marca pontos; as alças dos pontos se arrastam; tocar no último ponto (ou "Concluir") termina
  function routePvStyle(){
    const p = (area.draw && routePreset(area.draw.preset)) || ROUTE_PRESETS[0], st = Object.assign({}, ROUTE_DEF, p), w = ROUTE_W[st.w];
    return { color:st.c, weight:w, opacity:0.95, dashArray:routeDash(st), lineCap:st.ds === 'pontilhado' ? 'round' : 'butt', lineJoin:'round', interactive:false };
  }
  function routePvRedraw(){
    const d = area.draw; if(!d || d.kind !== 'route') return;
    areaPvClear();
    const pv = areaPv();
    d.poly = d.pts.length > 1 ? L.polyline(d.pts, routePvStyle()).addTo(pv) : null;
    d.pts.forEach((p, i) => {
      const last = i === d.pts.length - 1;
      const mk = L.marker(p, { draggable:true, icon:areaHd('ar-hd-v' + (last ? ' sel' : '')), zIndexOffset:900 + i }).addTo(pv);
      mk.on('drag', ev => { d.pts[i] = ev.latlng; if(d.poly) d.poly.setLatLngs(d.pts); areaBarRender(); });
      mk.on('dragend', () => { d.pts[i] = mk.getLatLng(); areaBarRender(); });
      mk.on('click', ev => { L.DomEvent.stopPropagation(ev); if(last && d.pts.length >= 2) areaDrawFinish(); });
    });
  }
  function routeDrawTap(ll){
    const d = area.draw; if(!d || d.kind !== 'route') return;
    if(d.pts.length >= 2){                                   // toque colado no último ponto = concluir
      const a = map.latLngToContainerPoint(d.pts[d.pts.length - 1]), b = map.latLngToContainerPoint(ll);
      if(a.distanceTo(b) < 20){ areaDrawFinish(); return; }
    }
    d.pts.push(ll); routePvRedraw(); areaBarRender();
  }
  async function routeCreate(){
    const d = area.draw; if(!d || d.pts.length < 2) return;
    const p = routePreset(d.preset) || ROUTE_PRESETS[0], pts = d.pts.slice();
    const route = Object.assign({ id:newId(), points:pts.map(x => [x.lat, x.lng]), distance:totalDistanceOf(pts), label:p.t, note:'', st:routeStFromPreset(p) }, ownerFields());
    clearModes();
    routes.push(route);
    renderRoutes();
    setTimeout(() => routeOpen(route.id), 0);                // depois do clique: o ouvinte do HUD fecha as folhas no mesmo evento
    await saveKey(KEY_ROUTES, routes);
  }
  function abPresets(kind){
    const box = areaEl('ab-presets'); if(!box || box.dataset.k === kind) return;
    box.dataset.k = kind;
    box.innerHTML = kind === 'route'
      ? ROUTE_PRESETS.map(p => `<button type="button" class="ar-chip" data-rp="${p.id}" style="--c:${p.c}"><i></i>${p.t}</button>`).join('')
      : AREA_PRESETS.map(p => `<button type="button" class="ar-chip" data-ap="${p.id}" style="--c:${p.c}"><i></i>${p.t}</button>`).join('');
  }

  // --- folha da rota (mesmo desenho da folha de áreas)
  const routeEl = id => document.getElementById(id);
  const routeQ = sel => Array.from(routeEl('route-body').querySelectorAll(sel));
  const routeSeg = (key, label, list) => `<div class="ar-g">${label}</div><div class="ar-seg" data-rseg="${key}">${list.map(x => `<button type="button" data-v="${x[0]}">${x[1]}</button>`).join('')}</div>`;
  function routeSheetBuild(){
    routeEl('route-close').innerHTML = ic('close', 20);
    routeEl('route-body').innerHTML = `
      <label class="ar-f"><span>Nome</span><input type="text" id="route-name" maxlength="60" autocomplete="off" placeholder="Nome da rota"></label>
      <div class="ar-g">Predefinição</div>
      <div class="ar-chips" id="route-presets">${ROUTE_PRESETS.map(p => `<button type="button" class="ar-chip" data-rp="${p.id}" style="--c:${p.c}"><i></i>${p.t}</button>`).join('')}</div>
      <div class="ar-g">Cor</div>
      <div class="ar-sw" id="route-colors">${AREA_COLORS.map(c => `<button type="button" class="ar-swb" data-rc="${c}" style="--c:${c}" aria-label="Cor ${c}"></button>`).join('')}<label class="ar-swb ar-swc" title="Outra cor"><input type="color" id="route-color-in" value="#ffffff" aria-label="Outra cor"></label></div>
      ${routeSeg('ds', 'Traço', ROUTE_DS)}
      ${routeSeg('w', 'Espessura', ROUTE_WL)}
      <div class="ar-g">Ícone repetido ao longo da rota</div>
      <div class="ar-ics" id="route-icons"><button type="button" class="ar-ic" data-ri="" title="Sem ícone" aria-label="Sem ícone"><span>—</span></button>${Object.keys(ROUTE_ICON).map(k => `<button type="button" class="ar-ic" data-ri="${k}" title="${ROUTE_ICON[k].t}" aria-label="${ROUTE_ICON[k].t}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${ROUTE_ICON[k].p}</svg></button>`).join('')}</div>
      ${routeSeg('ev', 'Movimento da linha', ROUTE_EV)}
      ${routeSeg('dir', 'Sentido e pontas', ROUTE_DIR)}
      ${routeSeg('lb', 'Nome no mapa', AREA_LB)}
      <label class="ar-f"><span>Anotação</span><textarea id="route-note" rows="3" maxlength="600" placeholder="Anotação..."></textarea></label>
      <div class="ar-meta" id="route-meta"></div>
      <div class="route-times" id="route-times"></div>
      <div class="ar-btns"><button type="button" id="route-edit">Editar pontos</button><button type="button" id="route-rev">Inverter sentido</button></div>
      <div class="ar-btns"><button type="button" id="route-dup">Duplicar</button><button type="button" id="route-del" class="danger">Excluir</button></div>`;
    routeWire();
  }
  function routeSheetSync(r){
    const st = routeSt(r), pre = r.st && r.st.pre;
    routeQ('[data-rp]').forEach(b => b.classList.toggle('on', b.dataset.rp === pre));
    routeQ('[data-rc]').forEach(b => b.classList.toggle('on', b.dataset.rc === st.c.toLowerCase()));
    const ci = routeEl('route-color-in'); ci.value = st.c; ci.parentNode.classList.toggle('on', !AREA_COLORS.includes(st.c.toLowerCase()));
    routeQ('[data-ri]').forEach(b => b.classList.toggle('on', b.dataset.ri === st.ic));
    ['ds', 'w', 'ev', 'dir', 'lb'].forEach(k => routeQ(`[data-rseg="${k}"] button`).forEach(b => { b.classList.toggle('on', b.dataset.v === st[k]); b.setAttribute('aria-pressed', String(b.dataset.v === st[k])); }));
    const dist = r.distance != null && isFinite(r.distance) ? r.distance : totalDistanceOf((r.points || []).map(p => L.latLng(p)));
    routeEl('route-meta').textContent = [formatDistance(dist), (r.points || []).length + ' pontos', r.ownerName ? 'Criada por ' + r.ownerName : '', 'Salva sozinha'].filter(Boolean).join(' · ');
    routeEl('route-times').innerHTML = '<div class="route-times-label">Tempo estimado (linha reta)</div>' + SPEED_PROFILES.map(sp => `<div class="route-time-row"><span>${sp.label}</span><span>${formatDuration(estimateHours(dist, sp.kmh))}</span></div>`).join('');
    routeEl('route-edit').hidden = !routeValid(r);
  }
  function routeSheetFill(r){
    routeEl('route-title').textContent = 'Rota';
    routeEl('route-name').value = r.label || '';
    routeEl('route-note').value = r.note || '';
    routeSheetSync(r);
  }
  function routeSaveSoon(){ clearTimeout(rt.saveT); rt.saveT = setTimeout(() => { rt.saveT = null; saveKey(KEY_ROUTES, routes); }, 450); }
  // aplica uma mudança na rota aberta: atualiza o mapa na hora e salva sozinho. soft = redesenha daqui a pouco (digitação); 'none' = não precisa redesenhar
  function routePatch(fn, soft){
    const r = routes.find(x => x.id === rt.sheetId); if(!r) return;
    fn(r);
    routeSaveSoon();
    routeSheetSync(r);
    if(soft === 'none') return;
    if(soft){ clearTimeout(rt.renderT); rt.renderT = setTimeout(() => { rt.renderT = null; renderRoutes(); }, 220); }
    else renderRoutes();
  }
  const routeStPatch = (r, o) => { r.st = Object.assign(routeSt(r), o, { pre:null }); };
  function routeWire(){
    const body = routeEl('route-body');
    body.addEventListener('click', e => {
      const b = e.target.closest('button'); if(!b || b.disabled) return;
      if(b.dataset.rp){ const p = routePreset(b.dataset.rp); if(p) routePatch(r => { r.st = Object.assign(routeStFromPreset(p), { lb:routeSt(r).lb }); }); return; }
      if(b.dataset.rc){ routePatch(r => routeStPatch(r, { c:b.dataset.rc })); return; }
      if(b.dataset.ri !== undefined){ routePatch(r => routeStPatch(r, { ic:b.dataset.ri })); return; }
      const seg = b.closest('[data-rseg]');
      if(seg){ const k = seg.dataset.rseg, v = b.dataset.v; routePatch(r => routeStPatch(r, { [k]:v })); return; }
      if(b.id === 'route-edit') routeEditStart(rt.sheetId);
      else if(b.id === 'route-rev') routePatch(r => { r.points = r.points.slice().reverse(); });
      else if(b.id === 'route-dup') routeDuplicate(rt.sheetId);
      else if(b.id === 'route-del') routeDelete(rt.sheetId);
    });
    routeEl('route-color-in').addEventListener('input', e => { const v = e.target.value.toLowerCase(); if(areaHex(v)) routePatch(r => routeStPatch(r, { c:v })); });
    routeEl('route-name').addEventListener('input', e => routePatch(r => { r.label = e.target.value.slice(0, 60); }, 'soft'));
    routeEl('route-name').addEventListener('change', e => routePatch(r => { r.label = e.target.value.trim().slice(0, 60) || 'Rota sem nome'; e.target.value = r.label; }, 'soft'));
    routeEl('route-note').addEventListener('input', e => routePatch(r => { r.note = e.target.value.slice(0, 600); }, 'none'));
    routeEl('route-close').addEventListener('click', () => routeClose());
  }
  function routeBounds(r){ try{ return L.latLngBounds(r.points.map(p => L.latLng(p))); }catch(e){ return null; } }
  // a folha cobre a parte de baixo: se a rota ficou escondida atrás dela, empurra o mapa para ela aparecer em cima
  function routeFocus(r){
    const b = routeBounds(r); if(!b || !b.isValid()) return;
    const sz = map.getSize(), p = map.latLngToContainerPoint(b.getCenter());
    if(p.y > sz.y * 0.45 || p.y < 110 || p.x < 0 || p.x > sz.x) map.panBy([p.x - sz.x / 2, p.y - sz.y * 0.3], { animate:true });
  }
  function routeOpen(id){
    const r = routes.find(x => x.id === id); if(!r || area.draw) return;
    areaEditStop(false); areaClose();
    if(!rt.built){ routeSheetBuild(); rt.built = true; }
    closeHub(); closeDrawer(); closeNavDrawer(); closeInventory(); hudCloseSheets();
    rt.sheetId = id;
    routeSheetFill(r);
    routeEl('route-sheet').classList.add('open');
    routeFocus(r);
  }
  function routeClose(){
    const sheet = routeEl('route-sheet'); if(!sheet || !rt.built) return;
    if(rt.renderT){ clearTimeout(rt.renderT); rt.renderT = null; renderRoutes(); }
    if(rt.saveT){ clearTimeout(rt.saveT); rt.saveT = null; saveKey(KEY_ROUTES, routes); }
    rt.sheetId = null;
    sheet.classList.remove('open');
  }
  // troca de campanha: descarta o que estava aberto/pendente (sem salvar: os dados são da campanha antiga)
  function routeReset(){
    clearTimeout(rt.saveT); rt.saveT = null; clearTimeout(rt.renderT); rt.renderT = null;
    rt.sheetId = null;
    const sh = document.getElementById('route-sheet'); if(sh) sh.classList.remove('open');
  }
  // atualização que veio de outro aparelho: a folha aberta acompanha (ou fecha, se a rota foi apagada lá)
  function routeRemoteSync(){
    if(!rt.sheetId || !rt.built) return;
    const r = routes.find(x => x.id === rt.sheetId);
    if(!r){ routeClose(); return; }
    if(!rt.saveT) routeSheetSync(r);
  }
  function routeDuplicate(id){
    const r = routes.find(x => x.id === id); if(!r) return;
    const cp = JSON.parse(JSON.stringify(r)), d = 0.0004;
    cp.id = newId(); cp.label = ((r.label || 'Rota') + ' (cópia)').slice(0, 60);
    cp.points = cp.points.map(p => [p[0] + d, p[1] + d]);
    Object.assign(cp, ownerFields());
    routeClose();
    routes.push(cp); renderRoutes(); saveKey(KEY_ROUTES, routes);
    routeOpen(cp.id);
  }
  function routeDelete(id){
    const r = routes.find(x => x.id === id); if(!r) return;
    if(!window.confirm(`Excluir a rota "${r.label || 'sem nome'}"?`)) return;
    routeClose(); deleteRouteById(id);
  }

  // --- editar os pontos: arrastar alças, "+" no meio de um trecho cria ponto, "Remover ponto" tira o escolhido
  function routeEditStart(id){
    const r = routes.find(x => x.id === id); if(!r || !routeValid(r)) return;
    const keep = rt.sheetId;
    clearModes();
    rt.sheetId = keep;
    area.edit = { route:true, id, circ:false, sel:-1, ring:r.points.map(p => L.latLng(p)) };
    routeEl('route-sheet').classList.remove('open');
    areaBusy(true);
    areaEditHandles();
    areaBarRender();
    routeFocus(r);
  }
  function routeLiveSet(id, ring){ (rt.paths[id] || []).forEach(l => l.setLatLngs(ring)); }
  function routeEditHandles(){
    const e = area.edit; if(!e || !e.route) return;
    areaPvClear();
    const pv = areaPv(), n = e.ring.length;
    for(let i = 0; i < n - 1; i++){
      const a = e.ring[i], b = e.ring[i + 1];
      const mid = L.marker(L.latLng((a.lat + b.lat) / 2, (a.lng + b.lng) / 2), { icon:areaHd('ar-hd-m'), zIndexOffset:700 }).addTo(pv);
      mid.on('click', ev => { L.DomEvent.stopPropagation(ev); e.ring.splice(i + 1, 0, mid.getLatLng()); e.sel = i + 1; areaEditCommit(); });
    }
    e.ring.forEach((p, i) => {
      const mk = L.marker(p, { draggable:true, icon:areaHd('ar-hd-v' + (i === e.sel ? ' sel' : '')), zIndexOffset:900 }).addTo(pv);
      mk.on('drag', ev => { e.ring[i] = ev.latlng; routeLiveSet(e.id, e.ring); areaBarRender(); });
      mk.on('dragend', () => { e.sel = i; areaEditCommit(); });
      mk.on('click', ev => { L.DomEvent.stopPropagation(ev); e.sel = i; routeEditHandles(); areaBarRender(); });
    });
  }
  function routeEditCommit(){
    const e = area.edit; if(!e) return;
    const r = routes.find(x => x.id === e.id); if(!r){ areaEditStop(false); return; }
    r.points = e.ring.map(p => [p.lat, p.lng]); r.distance = totalDistanceOf(e.ring);
    routeSaveSoon();
    renderRoutes();
    routeEditHandles();
    areaBarRender();
  }

  // ---------- nav drawer: lists every pin/token/área/rota for fast travel ----------
  // (antes era uma gaveta lateral; agora é a folha "Camadas": mapa-base + filtros + esta lista)
  const navDrawer = document.getElementById('lay-sheet');
  const navDrawerBackdrop = document.getElementById('lay-backdrop');
  const navSearchInput = document.getElementById('nav-search-input');
  function closeNavDrawer(){
    navDrawer.classList.remove('open');
    navDrawerBackdrop.classList.remove('open');
  }
  navSearchInput.addEventListener('input', () => renderNavList(true));

  document.getElementById('token-select-toggle-btn').addEventListener('click', () => {
    setTokenSelectMode(!tokenSelectMode);
  });

  // f25: a lista de Camadas só é montada com a folha aberta (antes eram ~3.300 elementos sempre presentes e re-criados a cada mudança de pin)
  function renderNavList(force){
    if(typeof invHoldersChanged === 'function') invHoldersChanged();
    if(force !== true && !navDrawer.classList.contains('open')) return;
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
        color: t.color || '#ffffff',
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
        color: areaSt(s).c,
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
        color: routeSt(r).c,
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

  // ---------- ferramenta de rota (f19): usa a mesma barra de desenho das áreas ----------
  function stopRouteMode(){ routeModeOn = false; }
  document.getElementById('tool-route').addEventListener('click', () => {
    const btn = document.getElementById('tool-route');
    const isActive = btn.classList.contains('active');
    clearModes();
    if(!isActive){
      btn.classList.add('active');
      areaDrawStart('route');
    }
  });

  // ---------- map click: circle/route steps, or place pin/token ----------
  map.on('click', async (e) => {
    if(rosterUI && rosterUI.placing){ rosterMapTap(e.latlng); return; }
    if(lg.reloc){ lgRelocTo(e.latlng); return; }
    if(area.draw){ areaDrawTap(e.latlng); return; }
    if(area.edit) return;

    if(selectedPinType && !isMaster() && selectedPinType !== 'nota'){ clearModes(); toast('Só o mestre cria esse tipo de pin. Você pode marcar notas e tokens.', true); return; }
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
      if(pin.type === 'lugar'){ pin.title = 'Novo lugar'; pin.lg = { cat:'saque', tags:[], src:[], risk:0, npcs:[], scene:'' }; }
      pins.push(pin);
      await saveKey(KEY_PINS, pins);
      renderPins();
      clearModes(); // um pin por clique — não fica no modo de colocar até o usuário escolher de novo
      // open the new pin's popup for immediate editing
      if(pin.type === 'lugar') lgOpen(pin.id, true); else openPinPopupById(pin.id);
    } else if(tokenModeOn){
      const token = { id:newId(), lat:e.latlng.lat, lng:e.latlng.lng, label:'Token', ...ownerFields() };
      tokens.push(token);
      await saveKey(KEY_TOKENS, tokens);
      renderTokens();
      clearModes(); // idem pro token
    }
  });

  // ---------- aviso de desenho (usado pela medição de rota) ----------
  const drawHint = document.getElementById('draw-hint');
  function showDrawHint(text){
    drawHint.innerHTML = `<span class="dot"></span>${text}`;
    drawHint.style.display = 'flex';
  }
  function hideDrawHint(){ drawHint.style.display = 'none'; }

  // ---------- ÁREAS (f14): folha de edição ----------
  let areaSheetBuilt = false;
  const areaQ = sel => Array.from(areaEl('area-body').querySelectorAll(sel));
  function areaSeg(key, label, list){
    return `<div class="ar-g">${label}</div><div class="ar-seg" data-seg="${key}">${list.map(x => `<button type="button" data-v="${x[0]}">${x[1]}</button>`).join('')}</div>`;
  }
  function areaSheetBuild(){
    areaEl('area-close').innerHTML = ic('close', 20);
    areaEl('area-body').innerHTML = `
      <label class="ar-f"><span>Nome</span><input type="text" id="area-name" maxlength="60" autocomplete="off" placeholder="Nome da área"></label>
      <div class="ar-g">Predefinição</div>
      <div class="ar-chips" id="area-presets">${AREA_PRESETS.map(p => `<button type="button" class="ar-chip" data-ap="${p.id}" style="--c:${p.c}"><i></i>${p.t}</button>`).join('')}</div>
      <div class="ar-g">Cor</div>
      <div class="ar-sw" id="area-colors">${AREA_COLORS.map(c => `<button type="button" class="ar-swb" data-ac="${c}" style="--c:${c}" aria-label="Cor ${c}"></button>`).join('')}<label class="ar-swb ar-swc" title="Outra cor"><input type="color" id="area-color-in" value="#ffffff" aria-label="Outra cor"></label></div>
      <div class="ar-g">Ícone</div>
      <div class="ar-ics" id="area-icons"><button type="button" class="ar-ic" data-ai="" title="Sem ícone" aria-label="Sem ícone"><span>—</span></button>${Object.keys(AREA_ICON).map(k => `<button type="button" class="ar-ic" data-ai="${k}" title="${AREA_ICON[k].t}" aria-label="${AREA_ICON[k].t}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${AREA_ICON[k].p}</svg></button>`).join('')}</div>
      ${areaSeg('mv', 'Movimento dos ícones', AREA_MV)}
      ${areaSeg('ef', 'Efeito da área', AREA_EF)}
      <label class="ar-f"><span>Intensidade <b id="area-op-val"></b></span><input type="range" id="area-op" min="3" max="60" step="1"></label>
      ${areaSeg('dn', 'Quantidade de ícones', AREA_DN)}
      ${areaSeg('bd', 'Borda', AREA_BD)}
      ${areaSeg('lb', 'Nome no mapa', AREA_LB)}
      <label class="ar-f" id="area-rad-row"><span>Raio (metros)</span><input type="number" id="area-radius" min="5" max="50000" step="5" inputmode="numeric"></label>
      <label class="ar-f"><span>Anotação</span><textarea id="area-note" rows="3" maxlength="600" placeholder="Anotação..."></textarea></label>
      <div class="ar-meta" id="area-meta"></div>
      <div class="ar-btns"><button type="button" id="area-edit">Editar contorno</button><button type="button" id="area-dup">Duplicar</button><button type="button" id="area-del" class="danger">Excluir</button></div>`;
    areaWire();
  }
  function areaSheetSync(sh){
    const st = areaSt(sh), pre = sh.st && sh.st.pre;
    areaQ('[data-ap]').forEach(b => b.classList.toggle('on', b.dataset.ap === pre));
    areaQ('[data-ac]').forEach(b => b.classList.toggle('on', b.dataset.ac === st.c.toLowerCase()));
    const ci = areaEl('area-color-in'); ci.value = st.c; ci.parentNode.classList.toggle('on', !AREA_COLORS.includes(st.c.toLowerCase()));
    areaQ('[data-ai]').forEach(b => b.classList.toggle('on', b.dataset.ai === st.ic));
    ['mv', 'ef', 'dn', 'bd', 'lb'].forEach(k => areaQ(`[data-seg="${k}"] button`).forEach(b => { b.classList.toggle('on', b.dataset.v === st[k]); }));
    areaQ('[data-seg="mv"] button').forEach(b => { b.disabled = !st.ic; });
    areaQ('[data-seg="dn"] button').forEach(b => { b.disabled = !st.ic; });
    const op = areaEl('area-op'); op.value = Math.round(st.op * 100); areaEl('area-op-val').textContent = Math.round(st.op * 100) + '%';
    const circ = sh.type === 'circle', rr = areaEl('area-rad-row'); rr.hidden = !circ;
    if(circ && document.activeElement !== areaEl('area-radius')) areaEl('area-radius').value = Math.round(sh.radius);
    areaEl('area-edit').hidden = !(circ || areaRings(sh));
    areaEl('area-meta').textContent = [areaSizeText(sh), sh.ownerName ? 'Criada por ' + sh.ownerName : '', 'Salva sozinha'].filter(Boolean).join(' · ');
  }
  function areaSheetFill(sh){
    areaEl('area-title').textContent = 'Área';
    areaEl('area-name').value = sh.label || '';
    areaEl('area-note').value = sh.note || '';
    areaSheetSync(sh);
  }
  function areaSaveSoon(){
    clearTimeout(area.saveT);
    area.saveT = setTimeout(() => { area.saveT = null; saveKey(KEY_SHAPES, shapes); }, 450);
  }
  // aplica uma mudança na área aberta: atualiza o mapa na hora e salva sozinho. soft = só desenha de novo daqui a pouco (digitação); 'none' = não precisa redesenhar
  function areaPatch(fn, soft){
    const sh = shapes.find(s => s.id === area.sheetId); if(!sh) return;
    fn(sh);
    areaSaveSoon();
    areaSheetSync(sh);
    if(soft === 'none') return;
    if(soft){ clearTimeout(area.renderT); area.renderT = setTimeout(() => { area.renderT = null; renderShapes(); }, 220); }
    else renderShapes();
  }
  const areaStPatch = (sh, o) => { sh.st = Object.assign(areaSt(sh), o, { pre:null }); };
  function areaWire(){
    const body = areaEl('area-body');
    body.addEventListener('click', e => {
      const b = e.target.closest('button'); if(!b || b.disabled) return;
      if(b.dataset.ap){ const p = areaPreset(b.dataset.ap); if(p) areaPatch(sh => { sh.st = Object.assign(areaStFromPreset(p), { pre:p.id, lb:areaSt(sh).lb }); }); return; }
      if(b.dataset.ac){ areaPatch(sh => areaStPatch(sh, { c:b.dataset.ac })); return; }
      if(b.dataset.ai !== undefined){ areaPatch(sh => areaStPatch(sh, { ic:b.dataset.ai })); return; }
      const seg = b.closest('[data-seg]');
      if(seg){ const k = seg.dataset.seg, v = b.dataset.v; areaPatch(sh => areaStPatch(sh, { [k]:v })); return; }
      if(b.id === 'area-edit') areaEditStart(area.sheetId);
      else if(b.id === 'area-dup') areaDuplicate(area.sheetId);
      else if(b.id === 'area-del') areaDelete(area.sheetId);
    });
    areaEl('area-color-in').addEventListener('input', e => { const v = e.target.value.toLowerCase(); if(areaHex(v)) areaPatch(sh => areaStPatch(sh, { c:v })); });
    areaEl('area-op').addEventListener('input', e => { const v = Math.min(60, Math.max(3, +e.target.value || 10)) / 100; areaPatch(sh => areaStPatch(sh, { op:v }), 'soft'); });
    areaEl('area-name').addEventListener('input', e => areaPatch(sh => { sh.label = e.target.value.slice(0, 60); }, 'soft'));
    areaEl('area-name').addEventListener('change', e => areaPatch(sh => { sh.label = e.target.value.trim().slice(0, 60) || 'Área sem nome'; e.target.value = sh.label; }, 'soft'));
    areaEl('area-note').addEventListener('input', e => areaPatch(sh => { sh.note = e.target.value.slice(0, 600); }, 'none'));
    areaEl('area-radius').addEventListener('change', e => areaPatch(sh => { const v = +e.target.value; if(sh.type === 'circle' && isFinite(v)) sh.radius = Math.min(50000, Math.max(5, v)); }));
    areaEl('area-close').addEventListener('click', () => areaClose());
  }
  function areaBounds(sh){
    if(sh.type === 'circle' && sh.center && sh.radius > 0) return areaCircleBounds(sh.center, sh.radius);
    const r = areaRings(sh); if(r) return L.latLngBounds(r[0]);
    try{ const b = L.geoJSON(sh.geojson).getBounds(); return b.isValid() ? b : null; }catch(e){ return null; }
  }
  // a folha cobre a parte de baixo: se a área ficou escondida atrás dela, empurra o mapa para ela aparecer em cima
  function areaFocus(sh){
    const b = areaBounds(sh); if(!b) return;
    const sz = map.getSize(), p = map.latLngToContainerPoint(b.getCenter());
    if(p.y > sz.y * 0.45 || p.y < 110 || p.x < 0 || p.x > sz.x) map.panBy([p.x - sz.x / 2, p.y - sz.y * 0.3], { animate:true });
  }
  function areaOpen(id){
    const sh = shapes.find(s => s.id === id); if(!sh || area.draw) return;
    areaEditStop(false);
    if(!areaSheetBuilt){ areaSheetBuild(); areaSheetBuilt = true; }
    closeHub(); closeDrawer(); closeNavDrawer(); closeInventory(); hudCloseSheets();
    area.sheetId = id;
    areaSheetFill(sh);
    areaEl('area-sheet').classList.add('open');
    areaFocus(sh);
  }
  // troca de campanha: descarta o que estava aberto/pendente (sem salvar: os dados são da campanha antiga)
  function areaReset(){
    clearTimeout(area.saveT); area.saveT = null; clearTimeout(area.renderT); area.renderT = null;
    areaDrawStop(); areaEditStop(false);
    area.sheetId = null;
    const sh = document.getElementById('area-sheet'); if(sh) sh.classList.remove('open');
  }
  function areaClose(){
    const sheet = areaEl('area-sheet'); if(!sheet) return;
    areaEditStop(false);
    if(area.renderT){ clearTimeout(area.renderT); area.renderT = null; renderShapes(); }
    if(area.saveT){ clearTimeout(area.saveT); area.saveT = null; saveKey(KEY_SHAPES, shapes); }
    area.sheetId = null;
    sheet.classList.remove('open');
  }
  function areaDelete(id){
    const sh = shapes.find(s => s.id === id); if(!sh) return;
    if(!window.confirm(`Excluir a área "${sh.label || 'sem nome'}"?`)) return;
    areaClose(); deleteShapeById(id);
  }
  function areaDuplicate(id){
    const sh = shapes.find(s => s.id === id); if(!sh) return;
    const cp = JSON.parse(JSON.stringify(sh)), d = 0.0004;
    cp.id = newId(); cp.label = ((sh.label || 'Área') + ' (cópia)').slice(0, 60);
    if(cp.type === 'circle' && cp.center) cp.center = [cp.center[0] + d, cp.center[1] + d];
    else { const g = cp.geojson && (cp.geojson.geometry || cp.geojson); if(g && g.type === 'Polygon') g.coordinates = g.coordinates.map(r => r.map(c => [c[0] + d, c[1] + d])); }
    Object.assign(cp, ownerFields());
    areaClose();
    shapes.push(cp); renderShapes(); saveKey(KEY_SHAPES, shapes);
    areaOpen(cp.id);
  }

  // ---------- ÁREAS (f14): desenhar (círculo, retângulo, polígono) e editar o contorno ----------
  const areaPv = () => area.pv || (area.pv = L.layerGroup().addTo(map));
  const areaPvClear = () => { if(area.pv) area.pv.clearLayers(); };
  const areaEast = (c, r) => L.latLng(c.lat, c.lng + r / (111320 * Math.max(0.05, Math.cos(c.lat * Math.PI / 180))));
  const areaHd = cls => L.divIcon({ className:'ar-hd ' + cls, html:'<i></i>', iconSize:[34, 34], iconAnchor:[17, 17] });
  const areaRingGeo = pts => { const r = pts.map(p => [p.lng, p.lat]); r.push([pts[0].lng, pts[0].lat]); return { type:'Feature', properties:{}, geometry:{ type:'Polygon', coordinates:[r] } }; };
  const ROUTE_HINTS = ['Toque no mapa para marcar o começo da rota.', 'Toque para marcar o próximo ponto. Arraste um ponto para ajustar.', 'Toque para continuar. Toque no último ponto (ou em Concluir) para terminar.'];
  const AREA_HINTS = {
    circle0: 'Toque no centro do círculo.',
    circle1: 'Arraste a alça (ou toque no mapa) para ajustar o raio.',
    rect0: 'Toque em um canto do retângulo.',
    rect1: 'Toque no canto oposto.',
    poly: 'Toque para marcar os pontos. Toque no primeiro ponto (ou em Concluir) para fechar.',
    edit: 'Arraste os pontos. Toque num ponto + para criar outro.'
  };
  function areaPvStyle(){
    const p = (area.draw && areaPreset(area.draw.preset)) || AREA_PRESETS[0];
    return { color:p.c, weight:2, dashArray:'6 4', fillColor:p.c, fillOpacity:Math.max(0.15, p.op), interactive:false };
  }
  function areaBarRender(){
    const bar = areaEl('area-bar'), d = area.draw, e = area.edit;
    if(!d && !e){ bar.hidden = true; return; }
    bar.hidden = false;
    areaEl('ab-presets').hidden = !d;
    let hint = '', val = '', undo = false, ok = false, rm = false, okTxt = 'Concluir';
    if(d){
      abPresets(d.kind === 'route' ? 'route' : 'area');
      areaEl('ab-presets').querySelectorAll('[data-ap],[data-rp]').forEach(b => b.classList.toggle('on', (b.dataset.ap || b.dataset.rp) === d.preset));
      if(d.kind === 'route'){ hint = ROUTE_HINTS[d.pts.length >= 2 ? 2 : d.pts.length]; val = d.pts.length ? formatDistance(totalDistanceOf(d.pts)) + ' · ' + d.pts.length + (d.pts.length === 1 ? ' ponto' : ' pontos') : ''; undo = d.pts.length > 0; ok = d.pts.length >= 2; }
      else if(d.kind === 'circle'){ hint = d.center ? AREA_HINTS.circle1 : AREA_HINTS.circle0; val = d.center ? 'Raio ' + Math.round(d.r) + ' m' : ''; undo = !!d.center; ok = !!d.center; }
      else if(d.kind === 'rect'){ hint = d.pts.length ? AREA_HINTS.rect1 : AREA_HINTS.rect0; undo = d.pts.length > 0; }
      else { hint = AREA_HINTS.poly; val = d.pts.length ? d.pts.length + ' ponto' + (d.pts.length > 1 ? 's' : '') : ''; undo = d.pts.length > 0; ok = d.pts.length >= 3; }
    } else {
      hint = AREA_HINTS.edit; okTxt = 'Pronto'; ok = true;
      rm = e.route ? (e.ring.length > 2 && e.sel >= 0) : (!e.circ && e.ring.length > 3 && e.sel >= 0);
      if(e.route) val = formatDistance(totalDistanceOf(e.ring));
    }
    areaEl('ab-hint').textContent = hint; areaEl('ab-val').textContent = val;
    areaEl('ab-undo').hidden = !undo; areaEl('ab-rm').hidden = !rm; areaEl('ab-ok').hidden = !ok; areaEl('ab-ok').textContent = okTxt;
  }
  function areaBusy(on){
    areaEl('map').classList.toggle('ar-busy', !!on);
    if(on) map.doubleClickZoom.disable(); else map.doubleClickZoom.enable();
  }
  function areaDrawStart(kind){
    areaClose();
    area.draw = { kind, pts:[], preset:kind === 'route' ? rt.lastPreset : area.lastPreset, center:null, r:0 };
    routeModeOn = kind === 'route';
    areaBusy(true);
    if(kind === 'rect') map.on('mousemove', areaRectMove);
    areaBarRender();
  }
  function areaDrawStop(){
    if(!area.draw) return;
    map.off('mousemove', areaRectMove);
    area.draw = null; area.link = null; routeModeOn = false;
    if(!area.edit){ areaPvClear(); areaBusy(false); }
    areaBarRender();
  }
  function areaRectMove(ev){
    const d = area.draw; if(!d || d.kind !== 'rect' || d.pts.length !== 1) return;
    if(!d.rect) d.rect = L.rectangle(L.latLngBounds(d.pts[0], ev.latlng), areaPvStyle()).addTo(areaPv()); else d.rect.setBounds(L.latLngBounds(d.pts[0], ev.latlng));
  }
  function areaDefaultRadius(ll){
    const sz = map.getSize(), p = map.latLngToContainerPoint(ll), q = map.containerPointToLatLng([p.x + sz.x * 0.16, p.y]);
    const m = ll.distanceTo(q), step = m >= 500 ? 100 : (m >= 100 ? 10 : 5);
    return Math.max(10, Math.round(m / step) * step);
  }
  function areaCircleSet(r){
    const d = area.draw; if(!d || !d.center) return;
    d.r = Math.min(50000, Math.max(5, r));
    d.circle.setRadius(d.r); d.hr.setLatLng(areaEast(d.center, d.r)); areaBarRender();
  }
  function areaDrawTap(ll){
    const d = area.draw; if(!d) return;
    if(d.kind === 'route'){ routeDrawTap(ll); return; }
    if(d.kind === 'circle'){
      if(d.center){ areaCircleSet(d.center.distanceTo(ll)); return; }
      d.center = ll; d.r = areaDefaultRadius(ll);
      d.circle = L.circle(ll, Object.assign({ radius:d.r }, areaPvStyle())).addTo(areaPv());
      d.hr = L.marker(areaEast(ll, d.r), { draggable:true, icon:areaHd('ar-hd-r'), zIndexOffset:900 }).addTo(areaPv());
      d.hc = L.marker(ll, { draggable:true, icon:areaHd('ar-hd-c'), zIndexOffset:900 }).addTo(areaPv());
      d.hr.on('drag', ev => { d.r = Math.min(50000, Math.max(5, d.center.distanceTo(ev.latlng))); d.circle.setRadius(d.r); areaBarRender(); });
      d.hr.on('dragend', () => d.hr.setLatLng(areaEast(d.center, d.r)));
      d.hc.on('drag', ev => { d.center = ev.latlng; d.circle.setLatLng(ev.latlng); d.hr.setLatLng(areaEast(ev.latlng, d.r)); });
      areaBarRender();
    } else if(d.kind === 'rect'){
      if(!d.pts.length){ d.pts = [ll]; L.circleMarker(ll, { radius:6, color:'#fff', weight:2, fillColor:areaPvStyle().color, fillOpacity:1, interactive:false }).addTo(areaPv()); areaBarRender(); return; }
      const b = L.latLngBounds(d.pts[0], ll), n = b.getNorth(), s = b.getSouth(), w = b.getWest(), e = b.getEast();
      if(map.distance([n, w], [s, w]) < 3 || map.distance([n, w], [n, e]) < 3){ toast('Retângulo pequeno demais. Toque mais longe do primeiro canto.', true); return; }
      areaCreate({ geojson: areaRingGeo([L.latLng(n, w), L.latLng(n, e), L.latLng(s, e), L.latLng(s, w)]) });
    } else {
      if(d.pts.length >= 3){
        const a = map.latLngToContainerPoint(d.pts[0]), b = map.latLngToContainerPoint(ll);
        if(a.distanceTo(b) < 18){ areaDrawFinish(); return; }
      }
      d.pts.push(ll);
      if(!d.poly) d.poly = L.polygon(d.pts, areaPvStyle()).addTo(areaPv()); else d.poly.setLatLngs(d.pts);
      L.circleMarker(ll, { radius:d.pts.length === 1 ? 8 : 5, color:'#fff', weight:2, fillColor:areaPvStyle().color, fillOpacity:1, interactive:false }).addTo(areaPv());
      areaBarRender();
    }
  }
  function areaDrawUndo(){
    const d = area.draw; if(!d) return;
    if(d.kind === 'route'){ if(d.pts.length){ d.pts.pop(); routePvRedraw(); areaBarRender(); } return; }
    if(d.kind === 'circle' && d.center){ areaPvClear(); d.center = null; d.circle = d.hr = d.hc = null; }
    else if(d.kind === 'rect' && d.pts.length){ areaPvClear(); d.pts = []; d.rect = null; }
    else if(d.kind === 'poly' && d.pts.length){
      d.pts.pop(); areaPvClear(); d.poly = null;
      if(d.pts.length){ d.poly = L.polygon(d.pts, areaPvStyle()).addTo(areaPv()); d.pts.forEach((p, i) => L.circleMarker(p, { radius:i === 0 ? 8 : 5, color:'#fff', weight:2, fillColor:areaPvStyle().color, fillOpacity:1, interactive:false }).addTo(areaPv())); }
    }
    areaBarRender();
  }
  function areaDrawFinish(){
    const d = area.draw; if(!d) return;
    if(d.kind === 'circle' && d.center) areaCreate({ type:'circle', center:[d.center.lat, d.center.lng], radius:Math.round(d.r * 10) / 10 });
    else if(d.kind === 'poly' && d.pts.length >= 3) areaCreate({ geojson: areaRingGeo(d.pts) });
    else if(d.kind === 'route' && d.pts.length >= 2) routeCreate();
  }
  async function areaCreate(geom){
    const d = area.draw; if(!d) return;
    const p = areaPreset(d.preset) || AREA_PRESETS[0];
    const shape = Object.assign({ id:newId(), label:p.t, note:'', st:Object.assign(areaStFromPreset(p), { pre:p.id }) }, geom, ownerFields());
    const lp = area.link ? pins.find(x => x.id === area.link) : null;      // ocupação desenhada a partir de um Lugar
    if(lp){ shape.placeId = lp.id; shape.label = lp.title || 'Lugar'; shape.st = lgAreaStyle(lp); }
    clearModes();
    shapes.push(shape);
    renderShapes();
    if(lp) setTimeout(() => lgOpen(lp.id, true), 0); else areaOpen(shape.id);
    await saveKey(KEY_SHAPES, shapes);
  }

  function areaEditPath(){ return area.edit ? area.paths[area.edit.id] : null; }
  function areaEditStart(id){
    const sh = shapes.find(s => s.id === id); if(!sh || !area.paths[id]) return;
    const rings = areaRings(sh), circ = sh.type === 'circle' && sh.center && sh.radius > 0;
    if(!rings && !circ){ toast('Esta área não aceita edição do contorno.', true); return; }
    const keep = area.sheetId;
    clearModes();
    area.sheetId = keep;
    area.edit = { id, circ:!!circ, sel:-1, ring: rings ? rings[0].map(p => L.latLng(p)) : null, rest: rings ? rings.slice(1) : null, c: circ ? L.latLng(sh.center) : null, r: circ ? sh.radius : 0 };
    areaEl('area-sheet').classList.remove('open');
    areaBusy(true);
    areaEditHandles();
    areaBarRender();
    areaFocus(sh);
  }
  function areaEditHandles(){
    const e = area.edit; if(!e) return;
    if(e.route){ routeEditHandles(); return; }
    areaPvClear();
    const pv = areaPv();
    if(e.circ){
      e.hr = L.marker(areaEast(e.c, e.r), { draggable:true, icon:areaHd('ar-hd-r'), zIndexOffset:900 }).addTo(pv);
      e.hc = L.marker(e.c, { draggable:true, icon:areaHd('ar-hd-c'), zIndexOffset:900 }).addTo(pv);
      e.hr.on('drag', ev => { e.r = Math.min(50000, Math.max(5, e.c.distanceTo(ev.latlng))); const p = areaEditPath(); if(p) p.setRadius(e.r); areaBarRender(); });
      e.hc.on('drag', ev => { e.c = ev.latlng; const p = areaEditPath(); if(p) p.setLatLng(ev.latlng); e.hr.setLatLng(areaEast(ev.latlng, e.r)); });
      e.hr.on('dragend', () => areaEditCommit());
      e.hc.on('dragend', () => areaEditCommit());
      return;
    }
    const n = e.ring.length;
    e.ring.forEach((p, i) => {
      const nx = e.ring[(i + 1) % n];
      const mid = L.marker(L.latLng((p.lat + nx.lat) / 2, (p.lng + nx.lng) / 2), { icon:areaHd('ar-hd-m'), zIndexOffset:700 }).addTo(pv);
      mid.on('click', () => { e.ring.splice(i + 1, 0, mid.getLatLng()); e.sel = i + 1; areaEditCommit(); });
    });
    e.ring.forEach((p, i) => {
      const mk = L.marker(p, { draggable:true, icon:areaHd('ar-hd-v' + (i === e.sel ? ' sel' : '')), zIndexOffset:900 }).addTo(pv);
      mk.on('drag', ev => { e.ring[i] = ev.latlng; const pa = areaEditPath(); if(pa) pa.setLatLngs([e.ring].concat(e.rest || [])); });
      mk.on('dragend', () => { e.sel = i; areaEditCommit(); });
      mk.on('click', () => { e.sel = i; areaEditHandles(); areaBarRender(); });
    });
  }
  // grava o contorno novo e redesenha (a alça que acabou de ser solta é refeita)
  function areaEditCommit(){
    const e = area.edit; if(!e) return;
    if(e.route){ routeEditCommit(); return; }
    const sh = shapes.find(s => s.id === e.id); if(!sh){ areaEditStop(false); return; }
    if(e.circ){ sh.center = [e.c.lat, e.c.lng]; sh.radius = Math.round(e.r * 10) / 10; }
    else {
      const g = areaRingGeo(e.ring).geometry.coordinates[0];
      sh.geojson = { type:'Feature', properties:{}, geometry:{ type:'Polygon', coordinates:[g].concat((e.rest || []).map(r => r.map(p => [p[1], p[0]]).concat([[r[0][1], r[0][0]]]))) } };
    }
    areaSaveSoon();
    renderShapes();
    areaEditHandles();
    areaBarRender();
  }
  function areaEditRemove(){
    const e = area.edit; if(!e || e.circ || e.sel < 0 || e.ring.length <= (e.route ? 2 : 3)) return;
    e.ring.splice(e.sel, 1); e.sel = -1; areaEditCommit();
  }
  function areaEditStop(reopen){
    if(!area.edit) return;
    const was = area.edit;
    area.edit = null;
    if(!area.draw){ areaPvClear(); areaBusy(false); }
    areaBarRender();
    if(was.route){ if(reopen) routeOpen(was.id); return; }
    const sh = reopen && shapes.find(s => s.id === area.sheetId);
    if(sh){ areaSheetFill(sh); areaEl('area-sheet').classList.add('open'); }
  }

  // barra de desenho: predefinições + Desfazer / Concluir / Cancelar
  function areaBarWire(){
    abPresets('area');
    areaEl('ab-presets').addEventListener('click', ev => {
      const rb = ev.target.closest('[data-rp]');
      if(rb && area.draw && area.draw.kind === 'route'){
        area.draw.preset = rb.dataset.rp; rt.lastPreset = rb.dataset.rp;
        try{ localStorage.setItem('tv-map:route-preset', rb.dataset.rp); }catch(e){}
        routePvRedraw(); areaBarRender(); return;
      }
      const b = ev.target.closest('[data-ap]'); if(!b || !area.draw) return;
      area.draw.preset = b.dataset.ap; area.lastPreset = b.dataset.ap;
      try{ localStorage.setItem('tv-map:area-preset', b.dataset.ap); }catch(e){}
      const st = areaPvStyle(), d = area.draw;
      [d.circle, d.rect, d.poly].forEach(l => { if(l) l.setStyle(st); });
      areaBarRender();
    });
    areaEl('ab-undo').addEventListener('click', areaDrawUndo);
    areaEl('ab-cancel').addEventListener('click', () => { if(area.edit){ const id = area.edit.id; areaEditStop(true); } else clearModes(); });
    areaEl('ab-rm').addEventListener('click', areaEditRemove);
    areaEl('ab-ok').addEventListener('click', () => { if(area.edit) areaEditStop(true); else areaDrawFinish(); });
    [['tool-area-circle', 'circle'], ['tool-area-rect', 'rect'], ['tool-area-polygon', 'poly']].forEach(x => {
      areaEl(x[0]).addEventListener('click', () => {
        const btn = areaEl(x[0]), isActive = btn.classList.contains('active');
        clearModes();
        if(!isActive){ btn.classList.add('active'); areaDrawStart(x[1]); }
      });
    });
    const tg = areaEl('area-anim-toggle');
    if(tg){
      const sync = () => { const on = areaAnimOn(); tg.classList.toggle('active', on); tg.setAttribute('aria-pressed', String(on)); tg.textContent = 'Animar áreas, rotas e molduras: ' + (on ? 'ligado' : 'desligado'); frAnimSync(); };
      sync();
      tg.addEventListener('click', () => { try{ localStorage.setItem('tv-map:area-anim', areaAnimOn() ? 'off' : 'on'); }catch(e){} sync(); renderShapes(); renderRoutes(); });
    }
  }
  areaBarWire();

  // ================= LUGAR (f16): marcador, folha (cartão + edição), área, reposicionar =================
  const lgEl = id => document.getElementById(id);
  const LG_IMG_OPTS = { title:'Ajustar imagem do lugar', ratio:2.5, out:600, noUpscale:true };   // 2,5:1 = a faixa do cartão: o que você enquadra é o que aparece
  const lgCatOf = g => PIN_TYPES.find(t => t.id === g.cat) || {};
  function lgCanEdit(pin){ return isMaster() || !pin.ownerId || (!!currentUser && pin.ownerId === currentUser.uid); }
  // estado de exploração (mesmo do contêiner); lugar sem fonte de saque e sem itens não mostra estado
  function lgState(pin){
    try{
      const cc = pinCC(pin);
      if(cc && !cc.locKey && !invCount(pin.id)) return '';
      return containerState(pin.id) || '';
    }catch(e){ return ''; }
  }
  function lgIcon(pin){
    const g = lgOf(pin), col = lgCatOf(g).color || 'var(--frost)', st = lgState(pin);
    const nm = escapeHtml((pin.title || 'Lugar').trim().split(/\s+/).slice(0, 2).join(' ').slice(0, 18));
    return L.divIcon({
      className:'mk-pins mk-lugar', iconSize:[34, 34], iconAnchor:[17, 29], popupAnchor:[0, -27],
      html:`<div class="pin-wrap pin-wrap-lugar${pin.locked ? ' locked' : ''}" data-st="${st}"><div class="pin-badge lg-badge" style="--lgc:${col}"><svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${PIN_ICONS[g.cat] || PIN_ICONS.pin}</svg></div><span class="pin-name-tag lg-tag">${nm}</span></div>`
    });
  }
  // distância até o personagem do jogador (o mais perto entre os dele), ou o escolhido no saque
  function lgDistText(pin){
    try{
      let mine = currentUser ? tokens.filter(t => t.ownerId === currentUser.uid && !t.containerId) : [];
      if(!mine.length){ const t = selectedToken(); if(t) mine = [t]; }
      if(!mine.length) return '';
      let best = null;
      mine.forEach(t => { const d = map.distance([t.lat, t.lng], [pin.lat, pin.lng]); if(!best || d < best.d) best = { d, t }; });
      return best ? 'a ' + formatDistance(best.d) + ' de ' + (best.t.label || 'Token') : '';
    }catch(e){ return ''; }
  }
  // miniatura do NPC (foto dele no mapa, ou a bolinha da cor dele com o ícone)
  function lgAvatar(n){
    const img = typeof n.image === 'string' && /^(data:image\/|https?:|\.?\/?[\w\-./]+\.(png|jpe?g|gif|webp|svg)$)/i.test(n.image) ? n.image : '';
    const col = escapeHtml(n.color || 'var(--ice-300)');
    return img ? `<span class="lg-av" style="border-color:${col}"><img src="${escapeHtml(img)}" alt=""></span>`
      : `<span class="lg-av lg-av-ic" style="background:${col}">${lgIcSvg('npc', 14)}</span>`;
  }
  const lgIcSvg = (cat, size) => `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${PIN_ICONS[cat] || PIN_ICONS.pin}</svg>`;

  function lgCardHtml(pin){
    const g = lgOf(pin), t = lgCatOf(g), col = t.color || 'var(--frost)', st = lgState(pin), master = isMaster();
    const dist = lgDistText(pin), cc = pinCC(pin);
    const npcs = g.npcs.map(x => { const n = pins.find(p => p.id === x.id && p.type === 'npc'); return n ? { n, c:x.c } : null; }).filter(x => x && (x.c !== 'oculto' || master));
    const meta = containerMeta(pin.id), items = invCount(pin.id);
    const areas = shapes.filter(s => s.placeId === pin.id);
    return `<div class="lg-card" style="--lgc:${col}">
      ${g.img ? `<div class="lg-img"><img src="${escapeHtml(g.img)}" alt=""></div>` : `<div class="lg-img lg-noimg" aria-hidden="true">${lgIcSvg(g.cat, 44)}</div>`}
      <div class="lg-top"><span class="lg-kick">${escapeHtml(t.label || 'Lugar')} · lugar</span>${st ? `<span class="lg-chip st-${st}">${escapeHtml(CONT_STATE_LABELS[st] || st)}</span>` : ''}</div>
      <div class="lg-name">${escapeHtml(pin.title || 'Lugar')}</div>
      <div class="lg-meta"><span class="lg-risk" data-r="${g.risk}" title="Risco: ${LG_RISK[g.risk]}"><i></i><i></i><i></i></span><span>Risco ${g.risk ? LG_RISK[g.risk].toLowerCase() : 'desconhecido'}</span>${dist ? `<span class="lg-dist">${escapeHtml(dist)}</span>` : ''}${areas.length ? `<span>${areas.some(a => a.type === 'circle') ? 'Área de raio' : 'Área ocupada'}</span>` : ''}${pin.locked ? '<span>Fixado</span>' : ''}</div>
      ${g.tags.length ? `<div class="lg-tags">${g.tags.map(x => `<span class="lg-tag">#${escapeHtml(x)}</span>`).join('')}</div>` : ''}
      ${pin.note ? `<p class="lg-note">${escapeHtml(pin.note)}</p>` : ''}
      ${npcs.length ? `<div class="lg-sec">Quem está aqui</div><div class="lg-npcs">${npcs.map(x => `<button type="button" class="lg-npc" data-lg-act="npc" data-id="${escapeHtml(x.n.id)}">${lgAvatar(x.n)}<b>${escapeHtml(x.n.title || 'NPC')}</b><span class="lg-cert c-${x.c}">${escapeHtml((LG_CERT.find(c => c[0] === x.c) || [])[1] || '')}</span></button>`).join('')}</div>` : ''}
      ${master && g.src.length ? `<div class="lg-sec">Saque (só o mestre vê)</div><div class="lg-srcs">${g.src.map(k => `<span class="lg-tag">${escapeHtml(LOC_NAMES[k] || k)}</span>`).join('')}</div>` : ''}
      <div class="lg-acts">
        ${canSearchPin(pin) ? `<button type="button" class="lg-go" data-lg-act="search">${ic('search', 16)} Vasculhar</button>` : ''}
        ${cc && (items > 0 || (meta && meta.generatedAt)) ? `<button type="button" data-lg-act="inv">${ic('box', 16)} Conteúdo (${items})</button>` : ''}
        ${g.scene && typeof tac !== 'undefined' && tac.scenes[g.scene] ? `<button type="button" data-lg-act="tac">${ic('swords', 16)} Mapa tático</button>` : ''}
        ${lgCanEdit(pin) ? `<button type="button" class="lg-lockb${pin.locked ? ' on' : ''}" data-lg-act="lock" aria-pressed="${!!pin.locked}">${ic(pin.locked ? 'lock' : 'unlock', 16)} ${pin.locked ? 'Fixado' : 'Fixar'}</button>` : ''}
      </div></div>`;
  }
  function lgFillCard(pin){
    const el = lgEl('lg-card'); if(!el) return;
    pin = pin || pins.find(p => p.id === lg.id); if(!pin) return;
    el.innerHTML = lgCardHtml(pin);
    lgEl('lugar-title').textContent = pin.title || 'Lugar';
  }

  // ----- formulário de edição -----
  function lgFormHtml(pin){
    const g = lgOf(pin), master = isMaster(), esc = escapeHtml;
    const npcAll = pins.filter(p => p.type === 'npc'), used = new Set(g.npcs.map(x => x.id));
    const scenes = (typeof tac !== 'undefined' && tac.scenes) ? Object.keys(tac.scenes) : [];
    const areas = shapes.filter(s => s.placeId === pin.id), circ = areas.find(s => s.type === 'circle'), cc = pinCC(pin) || {};
    const opt = (v, l, cur) => `<option value="${esc(v)}"${String(v) === String(cur) ? ' selected' : ''}>${esc(l)}</option>`;
    let h = `<label class="ar-f"><span>Nome</span><input type="text" id="lg-name" maxlength="60" autocomplete="off" value="${esc(pin.title || '')}" placeholder="Nome do lugar"></label>
      <div class="ar-g">Categoria</div>
      <div class="lg-cats" role="radiogroup" aria-label="Categoria">${LG_CATS.map(id => { const t = PIN_TYPES.find(x => x.id === id) || {}; return `<button type="button" class="lg-cat${id === g.cat ? ' on' : ''}" role="radio" aria-checked="${id === g.cat}" data-lg="cat" data-v="${id}" style="--c:${t.color}">${lgIcSvg(id, 18)}<span>${esc(t.label || id)}</span></button>`; }).join('')}</div>
      <div class="ar-g">Imagem de representação</div>
      <div class="lg-imgrow"><input type="file" id="lg-file" accept="image/*" aria-label="Escolher imagem">${/^data:image\/(?!gif)/i.test(g.img) ? '<button type="button" data-lg="img-adjust">Ajustar</button>' : ''}${g.img ? '<button type="button" data-lg="img-clear">Remover</button>' : ''}</div>
      <label class="ar-f"><span>ou endereço da imagem</span><input type="text" id="lg-url" autocomplete="off" placeholder="https://… ou lugares/hospital.jpg" value="${g.img && !/^data:/.test(g.img) ? esc(g.img) : ''}"></label>
      <div class="ar-g">Tags</div>
      <div class="lg-tags">${g.tags.map((x, i) => `<span class="lg-tag">#${esc(x)}<button type="button" data-lg="tag-del" data-i="${i}" aria-label="Tirar a tag ${esc(x)}">×</button></span>`).join('') || '<span class="ar-meta">Nenhuma tag.</span>'}</div>
      <div class="lg-addrow"><input type="text" id="lg-tag" maxlength="24" autocomplete="off" placeholder="nova tag (ex.: hospital)"><button type="button" data-lg="tag-add">Adicionar</button></div>
      <div class="ar-g">Risco</div>
      <div class="ar-seg" role="radiogroup" aria-label="Risco">${LG_RISK.map((l, i) => `<button type="button" class="${i === g.risk ? 'on' : ''}" role="radio" aria-checked="${i === g.risk}" data-lg="risk" data-v="${i}">${l}</button>`).join('')}</div>`;
    if(master){
      h += `<div class="ar-g">Fontes de saque (a busca sorteia de todas as marcadas)</div>
      <div class="ar-chips lg-src">${LG_SRC.map(k => `<button type="button" class="ar-chip${g.src.indexOf(k) >= 0 ? ' on' : ''}" aria-pressed="${g.src.indexOf(k) >= 0}" data-lg="src" data-v="${k}"><i></i>${esc(LOC_NAMES[k] || k)}</button>`).join('')}</div>
      <div class="lg-addrow"><label class="lg-num">Itens por busca: de <input type="number" id="lg-min" min="0" max="8" value="${g.min}" inputmode="numeric"></label><label class="lg-num">até <input type="number" id="lg-max" min="1" max="8" value="${g.max}" inputmode="numeric"></label></div>
      <div class="lg-addrow"><label class="lg-num">Capacidade <input type="number" id="lg-cap" min="1" value="${cc.cap || ''}" placeholder="sem limite" inputmode="numeric"></label>
        <select id="lg-access" aria-label="Acesso">${opt('aberto', 'Aberto', cc.access || 'aberto')}${opt('bloqueado', 'Bloqueado (só o mestre)', cc.access || 'aberto')}</select></div>
      <div class="ar-g">NPCs no lugar</div>
      ${g.npcs.map((x, i) => { const n = npcAll.find(p => p.id === x.id); return `<div class="lg-npcrow">${n ? lgAvatar(n) : ''}<b>${esc(n ? (n.title || 'NPC') : 'NPC removido')}</b><select data-lg="npc-c" data-i="${i}" aria-label="Certeza">${LG_CERT.map(c => opt(c[0], c[1], x.c)).join('')}</select><button type="button" data-lg="npc-del" data-i="${i}" aria-label="Tirar o NPC">×</button></div>`; }).join('')}
      <div class="lg-addrow"><select id="lg-npc-sel" aria-label="NPC">${opt('', npcAll.length ? '— escolher NPC —' : 'Nenhum NPC no mapa', '')}${npcAll.filter(p => !used.has(p.id)).map(p => opt(p.id, p.title || 'NPC', '')).join('')}</select>
        <select id="lg-npc-cn" aria-label="Certeza do novo NPC">${LG_CERT.map(c => opt(c[0], c[1], 'certo')).join('')}</select><button type="button" data-lg="npc-add">Ligar</button></div>
      <div class="ar-g">Mapa tático deste lugar</div>
      <div class="lg-addrow"><select id="lg-scene" aria-label="Mapa tático">${opt('', scenes.length ? '— nenhum —' : 'Crie uma cena no Tático', g.scene)}${scenes.map(id => opt(id, tac.scenes[id].name || 'Cena', g.scene)).join('')}</select>${g.scene && tac.scenes[g.scene] ? '<button type="button" data-lg="tac-on">Ativar p/ o grupo</button>' : ''}</div>`;
    }
    h += `<div class="ar-g">Área do lugar (raio ou ocupação)</div>
      <div class="ar-meta">${areas.length ? (circ ? 'Área de raio ligada a este lugar (acompanha o lugar ao mover).' : 'Área de ocupação desenhada para este lugar.') : 'Sem área. Use o raio para um círculo em volta do lugar, ou desenhe a ocupação.'}</div>
      <div class="lg-addrow"><label class="lg-num">Raio (m) <input type="number" id="lg-rad" min="5" max="50000" step="5" value="${circ ? Math.round(circ.radius) : ''}" placeholder="ex.: 120" inputmode="numeric"></label><button type="button" data-lg="rad-set">${circ ? 'Mudar raio' : 'Criar raio'}</button></div>
      <div class="ar-btns"><button type="button" data-lg="occ">Desenhar ocupação</button>${areas.length ? '<button type="button" data-lg="area-style">Estilo da área</button><button type="button" data-lg="area-del" class="danger">Tirar área</button>' : ''}</div>
      <label class="ar-f"><span>Anotação</span><textarea id="lg-note" rows="3" maxlength="600" placeholder="Anotação...">${esc(pin.note || '')}</textarea></label>
      <div class="ar-btns"><button type="button" data-lg-act="lock" aria-pressed="${!!pin.locked}">${ic(pin.locked ? 'lock' : 'unlock', 16)} ${pin.locked ? 'Soltar do mapa' : 'Fixar no mapa'}</button><button type="button" data-lg="reloc">Reposicionar no mapa</button><button type="button" data-lg="del" class="danger">Excluir lugar</button></div>`;
    return h;
  }
  function lgFillForm(pin){
    const wrap = lgEl('lg-edit-wrap'), form = lgEl('lg-form'); if(!wrap || !form) return;
    const can = lgCanEdit(pin);
    wrap.hidden = !can;
    if(!can){ form.innerHTML = ''; return; }
    form.innerHTML = lgFormHtml(pin);
  }
  function lgFill(pin){
    lgFillCard(pin); lgFillForm(pin);
    const wrap = lgEl('lg-edit-wrap'); if(wrap && !wrap.hidden) wrap.open = !!lg.edit;
  }
  function lgBuild(){
    lgEl('lugar-close').innerHTML = ic('close', 20);
    lgEl('lugar-body').innerHTML = '<div id="lg-card"></div><details id="lg-edit-wrap" class="lg-edit"><summary>Editar lugar</summary><div id="lg-form"></div></details>';
    lgEl('lugar-close').addEventListener('click', () => lgClose());
    const body = lgEl('lugar-body');
    body.addEventListener('click', ev => {
      const a = ev.target.closest && ev.target.closest('[data-lg-act]');
      if(a && body.contains(a)){ lgAct(a.dataset.lgAct, a); return; }
      const f = ev.target.closest && ev.target.closest('[data-lg]');
      if(f && body.contains(f) && f.tagName !== 'SELECT') lgForm(f.dataset.lg, f);
    });
    body.addEventListener('change', ev => {
      const t = ev.target;
      if(t.id === 'lg-file') lgFile(t);
      else if(t.id === 'lg-url') lgUrl(t.value.trim());
      else if(t.id === 'lg-min' || t.id === 'lg-max') lgLimits();
      else if(t.id === 'lg-cap' || t.id === 'lg-access') lgCap();
      else if(t.id === 'lg-scene') lgPatch(g => { g.scene = t.value; }, true);
      else if(t.dataset && t.dataset.lg === 'npc-c') lgPatch(g => { const l = lgOf(pins.find(p => p.id === lg.id)).npcs; if(l[+t.dataset.i]) l[+t.dataset.i].c = t.value; g.npcs = l; });
    });
    body.addEventListener('input', ev => {
      const t = ev.target, pin = pins.find(p => p.id === lg.id); if(!pin) return;
      if(t.id === 'lg-name'){ pin.title = t.value.slice(0, 60); lgSaveSoon(); lgRenderSoon(); lgFillCard(pin); }
      else if(t.id === 'lg-note'){ pin.note = t.value.slice(0, 600); lgSaveSoon(); lgFillCard(pin); }
    });
    body.addEventListener('keydown', ev => { if(ev.key === 'Enter' && ev.target.id === 'lg-tag'){ ev.preventDefault(); lgForm('tag-add'); } });
    lgEl('lg-edit-wrap').addEventListener('toggle', () => { lg.edit = lgEl('lg-edit-wrap').open; });
  }

  // ----- gravação -----
  function lgSaveSoon(){ clearTimeout(lg.saveT); lg.saveT = setTimeout(() => { lg.saveT = null; saveKey(KEY_PINS, pins); }, 450); }
  function lgRenderSoon(){ clearTimeout(lg.renderT); lg.renderT = setTimeout(() => { lg.renderT = null; renderPins(); }, 220); }
  // aplica uma mudança em pin.lg; refaz = true recria o formulário (listas que mudam de tamanho)
  function lgPatch(fn, refaz){
    const pin = pins.find(p => p.id === lg.id); if(!pin) return;
    const g = (pin.lg && typeof pin.lg === 'object') ? pin.lg : (pin.lg = {});
    fn(g, pin);
    lgSaveSoon(); lgRenderSoon(); lgFillCard(pin);
    if(refaz) lgFillForm(pin);
  }
  async function lgFile(inp){
    const f = inp.files && inp.files[0]; if(!f) return;
    try{
      const d = await window.__tvPickImage(f, LG_IMG_OPTS, resizeImageDataUrl);
      if(d == null){ inp.value = ''; return; }                        // cancelou o ajuste
      if(d.length > 220000){ toast('Imagem pesada demais. Use uma menor ou um endereço.', true); inp.value = ''; return; }
      lgPatch(g => { g.img = d; }, true);
    }catch(e){ toast(e && e.message ? e.message : 'Não foi possível usar essa imagem.', true); inp.value = ''; }
  }
  function lgUrl(v){
    if(!v){ lgPatch(g => { if(g.img && !/^data:/.test(g.img)) g.img = ''; }, true); return; }
    if(!lgOf({ lg:{ img:v } }).img){ toast('Endereço de imagem inválido.', true); return; }
    lgPatch(g => { g.img = v; }, true);
  }
  function lgLimits(){
    const mn = Math.max(0, Math.min(8, parseInt(lgEl('lg-min').value, 10) || 0)), mx = Math.max(mn, Math.min(8, parseInt(lgEl('lg-max').value, 10) || 0));
    lgPatch(g => { g.min = mn; g.max = mx; });
    lgEl('lg-min').value = mn; lgEl('lg-max').value = mx;
  }
  function lgCap(){
    const pin = pins.find(p => p.id === lg.id); if(!pin) return;
    const cap = parseInt(lgEl('lg-cap').value, 10), acc = lgEl('lg-access').value;
    pin.container = { enabled:true, cap:cap > 0 ? cap : null, access:acc === 'bloqueado' ? 'bloqueado' : 'aberto', updatedBy:actorFields().actorName };
    lgSaveSoon(); lgRenderSoon(); lgFillCard(pin);
  }
  function lgForm(a, el){
    const pin = pins.find(p => p.id === lg.id); if(!pin) return;
    const g0 = lgOf(pin), v = el && el.dataset ? el.dataset.v : '', i = el && el.dataset ? +el.dataset.i : -1;
    switch(a){
      case 'cat': lgPatch(g => { g.cat = v; }, true); break;
      case 'img-clear': lgPatch(g => { g.img = ''; }, true); break;
      case 'img-adjust': window.tvAdjustImage(g0.img, LG_IMG_OPTS).then(r => { if(r && r.data.length <= 220000) lgPatch(g => { g.img = r.data; }, true); else if(r) toast('Imagem pesada demais. Use uma menor.', true); }).catch(() => toast('Não foi possível ajustar essa imagem.', true)); break;
      case 'risk': lgPatch(g => { g.risk = +v; }, true); break;
      case 'tag-add': {
        const inp = lgEl('lg-tag'), t = (inp.value || '').replace(/^#+/, '').trim().slice(0, 24);
        if(!t){ inp.focus(); return; }
        if(g0.tags.some(x => x.toLowerCase() === t.toLowerCase()) || g0.tags.length >= 12){ inp.value = ''; return; }
        lgPatch(g => { g.tags = g0.tags.concat([t]); }, true); lgEl('lg-tag').focus(); break;
      }
      case 'tag-del': lgPatch(g => { g.tags = g0.tags.filter((x, k) => k !== i); }, true); break;
      case 'src': lgPatch(g => { g.src = g0.src.indexOf(v) >= 0 ? g0.src.filter(k => k !== v) : g0.src.concat([v]).sort((a1, b1) => LG_SRC.indexOf(a1) - LG_SRC.indexOf(b1)); }, true); break;
      case 'npc-add': {
        const id = lgEl('lg-npc-sel').value; if(!id){ toast('Escolha um NPC para ligar.', true); return; }
        lgPatch(g => { g.npcs = g0.npcs.concat([{ id, c:lgEl('lg-npc-cn').value }]); }, true); break;
      }
      case 'npc-del': lgPatch(g => { g.npcs = g0.npcs.filter((x, k) => k !== i); }, true); break;
      case 'tac-on': if(g0.scene && tac.scenes[g0.scene]){ DB.set(tacPath() + '/active', g0.scene); toast('Mapa tático ativado para o grupo.'); } break;
      case 'rad-set': {
        const r = Math.min(50000, Math.max(5, parseInt(lgEl('lg-rad').value, 10) || 0));
        if(!(parseInt(lgEl('lg-rad').value, 10) > 0)){ toast('Informe o raio em metros.', true); return; }
        lgApplyRadius(pin, r); lgFillCard(pin); lgFillForm(pin); break;
      }
      case 'occ': lgDrawOcc(pin); break;
      case 'area-style': { const sh = shapes.find(s => s.placeId === pin.id); if(sh) areaOpen(sh.id); break; }
      case 'area-del': lgDropAreas(pin); lgFillCard(pin); lgFillForm(pin); break;
      case 'reloc': lgRelocStart(pin); break;
      case 'del': if(window.confirm('Excluir o lugar "' + (pin.title || 'Lugar') + '"? A área ligada a ele também sai.')) deletePinById(pin.id); break;
    }
  }
  async function lgAct(a, el){
    const pin = pins.find(p => p.id === lg.id); if(!pin) return;
    if(a === 'search'){ el.disabled = true; const ok = await generateContainer(pin.id, false); lgFillCard(); lgRenderSoon(); if(ok) openInventory(pin.id); }
    else if(a === 'inv') openInventory(pin.id);
    else if(a === 'lock') lgToggleLock(pin);
    else if(a === 'tac') lgOpenTac(pin);
    else if(a === 'npc'){ const n = pins.find(p => p.id === el.dataset.id); if(n){ lgClose(); map.setView([n.lat, n.lng], Math.max(map.getZoom(), 17)); } }
  }
  // fixar: o marcador não é mais arrastado por engano (reposicionar continua funcionando)
  function lgToggleLock(pin){
    if(!lgCanEdit(pin)) return;
    pin.locked = !pin.locked;
    const mk = pinMarkers[pin.id];
    if(mk){ setIconIfChanged(mk, pinIcon(pin)); if(mk.dragging){ if(pin.locked) mk.dragging.disable(); else mk.dragging.enable(); } }
    saveKey(KEY_PINS, pins); renderPins();
    lgFill(pin);
    toast(pin.locked ? 'Lugar fixado no mapa.' : 'Lugar solto: dá para arrastar.');
  }
  function lgOpenTac(pin){
    const sid = lgOf(pin).scene;
    if(!sid || !tac.scenes[sid]){ toast('Este lugar ainda não tem mapa tático.', true); return; }
    if(isMaster()){ tacUI.sid = sid; tacUI.sel = null; tacUI.gd = null; tacOpen(); }
    else if(tac.active === sid) tacOpen();
    else toast('O mestre ainda não liberou o mapa tático deste lugar.', true);
  }

  // ----- abrir / fechar -----
  function lgOpen(id, edit){
    const pin = pins.find(p => p.id === id); if(!isLugar(pin)) return;
    if(!lg.built){ lgBuild(); lg.built = true; }
    areaClose(); closeHub(); closeDrawer(); closeNavDrawer(); closeInventory(); hudCloseSheets();
    lg.id = id; lg.edit = !!edit;
    lgFill(pin);
    lgEl('lugar-sheet').classList.add('open');
    lgFocus(pin);
  }
  // a folha cobre a parte de baixo: empurra o mapa para o marcador aparecer em cima dela
  function lgFocus(pin){
    const sz = map.getSize(), p = map.latLngToContainerPoint([pin.lat, pin.lng]);
    if(p.y > sz.y * 0.4 || p.y < 120 || p.x < 20 || p.x > sz.x - 20) map.panBy([p.x - sz.x / 2, p.y - sz.y * 0.25], { animate:true });
  }
  function lgClose(noSave){
    if(!lg.id) return;
    const sh = lgEl('lugar-sheet');
    if(lg.renderT){ clearTimeout(lg.renderT); lg.renderT = null; renderPins(); }
    if(lg.saveT){ clearTimeout(lg.saveT); lg.saveT = null; if(!noSave) saveKey(KEY_PINS, pins); }
    lg.id = null;
    if(sh) sh.classList.remove('open');
  }
  function lgReset(){ clearTimeout(lg.saveT); clearTimeout(lg.renderT); lg.saveT = lg.renderT = null; lg.id = null; lg.reloc = null; const sh = lgEl('lugar-sheet'); if(sh) sh.classList.remove('open'); }

  // ----- área ligada ao lugar -----
  function lgAreaStyle(pin){
    const pre = areaPreset(LG_AREA_PRE[lgOf(pin).cat] || 'territorio') || AREA_PRESETS[0];
    return Object.assign(areaStFromPreset(pre), { pre:pre.id, lb:'oculto' });
  }
  function lgApplyRadius(pin, r){
    let sh = shapes.find(s => s.placeId === pin.id && s.type === 'circle');
    if(sh){ sh.radius = r; sh.center = [pin.lat, pin.lng]; }
    else{ sh = Object.assign({ id:newId(), type:'circle', center:[pin.lat, pin.lng], radius:r, label:pin.title || 'Lugar', note:'', follow:true, placeId:pin.id, st:lgAreaStyle(pin) }, ownerFields()); shapes.push(sh); }
    renderShapes(); saveKey(KEY_SHAPES, shapes);
  }
  function lgDropAreas(pin){
    shapes = shapes.filter(s => s.placeId !== pin.id);
    renderShapes(); saveKey(KEY_SHAPES, shapes);
  }
  // o círculo de raio acompanha o lugar quando ele é movido
  function lgFollow(pin){
    let ch = false;
    shapes.forEach(s => { if(s.placeId === pin.id && s.follow && s.type === 'circle'){ s.center = [pin.lat, pin.lng]; ch = true; } });
    if(ch){ renderShapes(); saveKey(KEY_SHAPES, shapes); }
  }
  function lgDrawOcc(pin){
    lgClose(); clearModes();
    areaDrawStart('poly'); area.link = pin.id;
    toast('Toque nos pontos que cercam o lugar e confirme em Concluir.');
  }
  // ----- reposicionar: um toque no mapa leva o lugar para lá -----
  function lgRelocStart(pin){
    lgClose(); clearModes();
    lg.reloc = pin.id;
    showDrawHint('Toque no mapa para colocar o lugar (Esc cancela)');
  }
  function lgRelocTo(ll){
    const pin = pins.find(p => p.id === lg.reloc); lg.reloc = null; hideDrawHint();
    if(!pin) return;
    pin.lat = ll.lat; pin.lng = ll.lng;
    lgFollow(pin);
    renderPins(); saveKey(KEY_PINS, pins);
    setTimeout(() => lgOpen(pin.id, true), 0);   // depois do clique: o ouvinte do HUD fecha as folhas no mesmo evento
  }
  function lgRelocCancel(){ const id = lg.reloc; lg.reloc = null; hideDrawHint(); if(id && pins.some(p => p.id === id)) setTimeout(() => lgOpen(id, true), 0); }

  // ESC cancels any active drawing/measuring mode
  document.addEventListener('keydown', (e) => {
    if(e.key === 'Escape' && lg.reloc){ lgRelocCancel(); return; }
    if(e.key === 'Escape' && (area.draw || area.edit || routeModeOn)) clearModes();
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
    if(typeof f23RenderSearchFns === 'function') f23RenderSearchFns(q);
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
      const first = document.querySelector('#search-fn .search-fn-item') || searchResultsEl.querySelector('.search-result');
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
      if(!shapePopupActive && !area.edit) renderShapes();
      markLoaded(4);
      setSyncStatus('live');
    }, err => { console.error('Erro de sincronização (áreas)', err); setSyncStatus('offline'); markLoaded(4); });

    listen(fbRefOf(KEY_ROUTES), snap => {
      routes = snap.val() || [];
      saveLocal(KEY_ROUTES, routes);
      if(!routePopupActive) renderRoutes();
      routeRemoteSync();
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
  window.__tvLoot = byLoc;   // só para os testes automáticos (conferir de qual tabela saiu cada item)

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

  const LOC_SHORT = { casas:'Casas', farmacias:'Farmácias', bases:'Bases militares', veiculos:'Veículos', oficinas:'Oficinas', mercados:'Mercados',
    acampamentos:'Acampamentos', fazendas:'Fazendas', florestas:'Florestas', rios:'Rios', convergencia:'Convergência' };
  const LOC_ICON = { casas:'key', farmacias:'medical-pack', bases:'ammo-box', veiculos:'car-wheel', oficinas:'toolbox', mercados:'canned-fish',
    acampamentos:'camping-tent', fazendas:'cow', florestas:'mushroom', rios:'water-flask', convergencia:'crystal-ball' };
  function buildSaqueLocGrid(container, keys, extraClass){
    keys.forEach(key => {
      const card = document.createElement('button');
      card.type = 'button';
      card.className = 'loc-card' + (extraClass ? ' ' + extraClass : '') + (key === 'convergencia' ? ' convergencia' : '');
      card.dataset.loc = key;
      card.setAttribute('aria-label', 'Vasculhar ' + LOC_NAMES[key]);
      card.title = LOC_NAMES[key];
      card.innerHTML = `<span class="lc-ic">${svgIcon(LOC_ICON[key] || 'wooden-crate')}</span><span class="lc-nm">${LOC_SHORT[key] || LOC_NAMES[key]}</span><span class="lc-ct">${key === 'convergencia' ? 'Evento raro' : byLoc[key].length + ' itens'}</span>`;
      card.addEventListener('click', () => rollLoot(key));
      container.appendChild(card);
    });
  }
  buildSaqueLocGrid(document.getElementById('loc-grid'), URBAN_LOCS.concat(['convergencia']));
  buildSaqueLocGrid(document.getElementById('loc-grid-rural'), RURAL_LOCS, 'rural-card');
  (function(){ const f = document.querySelector('[data-fish-ic]'); if(f) f.innerHTML = svgIcon('fishing'); const fb = document.getElementById('fish-btn'); if(fb) document.getElementById('loc-grid-rural').appendChild(fb); })();

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
  // f25: a roleta agora é UMA tira de linhas deslizando com transform (Web Animations, roda no compositor).
  // Antes cada passo reescrevia o HTML, forçava reflow e esperava até 220 ms, então uma busca de 3 itens levava ~4,5 s
  // e engasgava sempre que o resto da página estava ocupado. Agora: ~0,9 s no primeiro item e ~0,55 s nos seguintes.
  function playSearch(opts){
    const stage = opts.stage, pool = (opts.pool && opts.pool.length) ? opts.pool : null, found = opts.found;
    return new Promise(resolve => {
      let skipped = false, finished = false, anim = null;
      const timers = [];
      const wait = ms => new Promise(r => { timers.push(setTimeout(r, ms)); });
      stage.hidden = false;
      stage.innerHTML = `<div class="ss-card">
        <div class="ss-head"><span class="ss-title"></span><button type="button" class="ss-skip">Pular</button></div>
        <div class="ss-win" aria-hidden="true"><div class="ss-strip"></div><div class="ss-sel"></div></div>
        <div class="ss-found"></div></div>`;
      const titleEl = stage.querySelector('.ss-title'), strip = stage.querySelector('.ss-strip'), sel = stage.querySelector('.ss-sel');
      const foundBox = stage.querySelector('.ss-found');
      titleEl.textContent = opts.title;
      const rowHtml = it => `<div class="ss-row"><span class="item-icon" aria-hidden="true">${svgIcon(it._icon || itemIconName(it))}</span><span class="ss-name">${escapeHtml(it.name)}</span></div>`;
      const rand = prev => {
        if(!pool) return { name:'…', _icon:'hole', category:'' };
        let it, g = 0;
        do{ it = pool[Math.floor(Math.random() * pool.length)]; }while(it === prev && pool.length > 1 && g++ < 6);
        return it;
      };
      let last = rand(null);   // item que está no centro da janela agora
      const finish = () => {
        if(finished) return;
        finished = true;
        timers.forEach(clearTimeout);
        if(anim){ try{ anim.cancel(); }catch(e){} anim = null; }
        stage.hidden = true; stage.innerHTML = '';
        resolve();
      };
      stage.querySelector('.ss-skip').addEventListener('click', () => { skipped = true; TVSound.stop(); finish(); });
      async function spinTo(target, rows, ms){
        // tira: [anterior, atual, ...sorteados..., alvo, seguinte]; a janela mostra 3 linhas e o centro é a segunda
        const list = [rand(last), last];
        for(let i = 0; i < rows - 1; i++) list.push(rand(list[list.length - 1]));
        list.push(target); list.push(rand(target));
        strip.innerHTML = list.map(rowHtml).join('');
        sel.classList.remove('landed');
        const rowPx = strip.firstElementChild.offsetHeight || 42, dist = rows * rowPx;
        strip.style.transform = 'translateY(0)';
        if(!strip.animate){ strip.style.transform = `translateY(${-dist}px)`; await wait(140); }
        else {
          anim = strip.animate([{ transform:'translateY(0)' }, { transform:`translateY(${-dist}px)` }], { duration:ms, easing:'cubic-bezier(.215,.61,.355,1)', fill:'forwards' });
          // um "tique" por linha que passa pelo centro (curva ease-out-cubic), sem rajada de sons no começo
          let lastTick = -99;
          for(let i = 1; i <= rows; i++){
            const t = (1 - Math.pow(1 - i / rows, 1 / 3)) * ms;
            if(t - lastTick < 42 && i < rows - 3) continue;
            lastTick = t; timers.push(setTimeout(() => { if(!skipped) TVSound.tick(); }, t));
          }
          await new Promise(r => { anim.onfinish = r; anim.oncancel = r; });
        }
        if(skipped) return;
        strip.style.transform = `translateY(${-dist}px)`;
        if(anim){ anim.cancel(); anim = null; }
        strip.children[rows + 1].classList.add('ss-landed'); sel.classList.add('landed'); TVSound.play('land');
        last = target;
      }
      (async () => {
        for(let k = 0; k < found.length && !skipped; k++){
          titleEl.textContent = found.length > 1 ? `${opts.title} (${k + 1}/${found.length})` : opts.title;
          await spinTo(found[k], k === 0 ? 14 : 8, k === 0 ? 800 : 420);
          if(skipped) return;
          const it = found[k], rar = opts.rarity ? opts.rarity(it) : null;
          const chip = document.createElement('div');
          chip.className = 'ss-chip' + (it.category === 'Itens Anômalos e Paranormais' ? ' ss-anom' : '');
          chip.innerHTML = `${iconHtml(it)}<span class="ss-chip-name">${escapeHtml(it.name)}</span>${rar ? `<span class="rarity-tag ${rar.cls}">${rar.label}</span>` : ''}`;
          foundBox.appendChild(chip);
          TVSound.found(TVSound.lootKind(it, rar));
          await wait(120);
        }
        if(!found.length && !skipped){
          await spinTo({ name: opts.emptyText || 'Nada de útil aqui', _icon: 'hole', category: '' }, 12, 800);
          if(skipped) return;
          TVSound.play('empty');
          await wait(180);
        }
        if(skipped) return;
        await wait(250);
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
    const show = () => { lootHistory.unshift(entry); renderLootResults(); saqueReveal(resultZone); };
    if(!animEnabled()){ soundLootResult(items.map(x => x.item), locKey); show(); return; }
    setSearchBusy(true);
    playSearch({ stage:lootStage, title:`Vasculhando ${LOC_NAMES[locKey]}…`, pool:byLoc[locKey], found:items.map(x => x.item),
      rarity:it => rarityInfo(it, locKey), emptyText:'Nada de útil aqui' }).then(() => { setSearchBusy(false); show(); });
  }

  // leva o resultado novo para a tela (no celular ele aparece abaixo dos locais)
  function saqueReveal(el){
    try{
      const d = document.getElementById('saque-drawer'), c = el && el.firstElementChild;
      if(!c || !d.classList.contains('open')) return;
      const r = c.getBoundingClientRect(), dr = d.getBoundingClientRect();
      if(r.top < dr.top + 56 || r.top > dr.bottom - 140) c.scrollIntoView({ block:'start', behavior:(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) ? 'auto' : 'smooth' });
    }catch(e){}
  }
  function renderLootResults(){
    if(lootHistory.length === 0){ resultZone.innerHTML = ''; return; }
    resultZone.innerHTML = '';
    const clearBtn = document.createElement('button');
    clearBtn.type = 'button';
    clearBtn.className = 'clear-btn';
    clearBtn.textContent = 'Limpar histórico';
    clearBtn.addEventListener('click', () => { flushPending(lootHistory); lootHistory = []; renderLootResults(); });

    lootHistory.slice(0, 25).forEach((entry, ei) => {
      const {locKey, foundBy} = entry;
      const its = entry.items || [];
      const anomalo = its.some(x => x.item.category === 'Itens Anômalos e Paranormais');
      const pend = pendingIdx(entry).length;
      const old = ei > 0 && !entry.open;
      const card = document.createElement('div');
      card.className = 'result-card' + (anomalo ? ' anomalo' : '') + (ei > 0 ? ' old' : '') + (old ? '' : ' open');
      card.dataset.uid = entry.uid;
      card.innerHTML = `
        <div class="result-top"${ei > 0 ? ' role="button" tabindex="0" aria-expanded="' + !old + '"' : ''}>
          <span class="result-loc" title="${escapeHtml(LOC_NAMES[locKey])}">${escapeHtml(LOC_SHORT[locKey] || LOC_NAMES[locKey])}</span>
          <span class="found-by">${escapeHtml(foundBy)}</span>
          ${ei > 0 ? `<span class="rt-count">${its.length ? its.length + (its.length === 1 ? ' item' : ' itens') : 'nada'}${pend ? ' · ' + pend + ' sem decisão' : ''}</span>` : ''}
        </div>
        ${its.length ? '' : '<div class="result-empty">Nada de útil por aqui.</div>'}
        <div class="loot-items"></div>
        ${coordHtml(entry)}
        <div class="send-row">
          <button type="button" class="send-btn" data-action="send">Enviar ao Discord</button>
          <span class="send-status" data-role="status">${lootStatusText(entry)}</span>
        </div>
      `;
      if(ei > 0){
        const top = card.querySelector('.result-top');
        const flip = () => { entry.open = !entry.open; card.classList.toggle('open', !!entry.open); card.classList.toggle('old', !entry.open); top.setAttribute('aria-expanded', String(!!entry.open)); };
        top.addEventListener('click', flip);
        top.addEventListener('keydown', e => { if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); flip(); } });
      }
      const box = card.querySelector('.loot-items');
      const bulk = buildBulkBar(entry);
      if(bulk) box.appendChild(bulk);
      its.forEach((it, i) => {
        const item = it.item;
        const rarity = rarityInfo(item, locKey);
        const row = document.createElement('div');
        row.className = 'loot-item ' + rarity.cls + (item.category === 'Itens Anômalos e Paranormais' ? ' anomalo' : '') + (it.decision === 'declined' ? ' declined' : '');
        row.innerHTML = `${iconHtml(item)}
          <div class="li-body">
            <div class="li-top"><b class="result-name">${item.name}</b><span class="rarity-tag ${rarity.cls}">${rarity.label}</span></div>
            <div class="result-cat">${item.category}</div>
            <div class="result-utility">${item.utility}</div>
            ${itemFactsHtml(item)}
            ${compatLine(item)}</div>`;
        row.querySelector('.li-body').appendChild(buildItemDecision(entry, i, its.length === 1));
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
          color: isNothing ? 0x4a4a4a : 0x1f8890,
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
          description: "A busca não rendeu nada desta vez.", color: 0x4a4a4a, fields: base,
          footer: { text: "Tau Volantis: Ano 0" }, timestamp: new Date().toISOString() }] };
      } else if(its.length === 1){
        const item = its[0], rarity = rarityInfo(item, locKey);
        payload = { username: "Tau Volantis — Registro de Saque", embeds: [{ title: item.name, description: item.utility,
          color: anyAnom ? 0xd3572a : 0xb4b4b4,
          fields: [base[0], { name: "Categoria", value: item.category, inline: true }, { name: "Raridade", value: rarity.label, inline: true }].concat(base.slice(1)).concat(itemFactsText(item) ? [{ name: "Ficha", value: itemFactsText(item).slice(0, 1024) }] : []),
          footer: { text: "Tau Volantis: Ano 0" }, timestamp: new Date().toISOString() }] };
      } else {
        payload = { username: "Tau Volantis — Registro de Saque", embeds: [{
          title: `Saque: ${its.length} itens`,
          description: `Buscado em ${LOC_NAMES[locKey]}`,
          color: anyAnom ? 0xd3572a : 0xb4b4b4,
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
    const showFish = () => { fishHistory.unshift(entry); renderFishResults(); saqueReveal(fishResultEl); };
    if(!animEnabled()){ if(caught) TVSound.found('comum'); else TVSound.play('empty'); showFish(); return; }
    setSearchBusy(true);
    TVSound.play('pesca');
    playSearch({ stage:fishStage, title:'Lançando a linha…', pool:FISH_POOL, found:caught ? [caught] : [],
      rarity:null, emptyText:'Nada fisgou' }).then(() => { setSearchBusy(false); showFish(); });
  }
  fishBtn.addEventListener('click', rollFish);

  function renderFishResults(){
    if (fishHistory.length === 0){
      fishResultEl.innerHTML = '';
      return;
    }
    fishResultEl.innerHTML = '';
    const clearFishBtn = document.createElement('button');
    clearFishBtn.type = 'button';
    clearFishBtn.className = 'clear-btn';
    clearFishBtn.textContent = 'Limpar pescaria';
    clearFishBtn.addEventListener('click', () => { flushPending(fishHistory); fishHistory = []; renderFishResults(); });

    fishHistory.slice(0, 10).forEach(entry => {
      const card = document.createElement('div');
      const isNothing = !entry.item;
      card.className = 'fish-card' + (isNothing ? ' nocatch' : '');
      card.dataset.uid = entry.uid;
      card.innerHTML = `
        <div class="result-top">
          <span class="result-loc">Pescaria</span>
          <span class="found-by">${escapeHtml(entry.foundBy)}</span>
        </div>
        <div class="fish-name">${isNothing ? '<span class="item-icon" aria-hidden="true">' + svgIcon('hole') + '</span>Nada fisgou' : iconHtml(entry.item) + entry.item.name}</div>
        <div class="fish-desc">${isNothing ? 'A linha voltou vazia.' : entry.item.utility}</div>
        ${isNothing ? '' : itemFactsHtml(entry.item)}
        ${coordHtml(entry)}
        <div class="send-row">
          <button type="button" class="send-btn" data-action="send">Enviar ao Discord</button>
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
  saqueBrowseToggle.innerHTML = `Catálogo de itens <small>${ITEMS.length}</small>`;
  saqueBrowseToggle.addEventListener('click', () => {
    saqueBrowsePanel.classList.toggle('open');
    saqueBrowseToggle.setAttribute('aria-expanded', String(saqueBrowsePanel.classList.contains('open')));
    saqueBrowseToggle.classList.toggle('open', saqueBrowsePanel.classList.contains('open'));
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
    stagger(saqueDrawer.querySelector('.drawer-body'));
    guiaOferecer('saque');
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
    condicao:'Condição', reparar:'Reparo', ajuste:'Ajuste do mestre', recarga:'Recarregou', descarga:'Descarregou'
  };
  const SOURCE_LABELS = { saque:'saque', pesca:'pesca', tabela:'tabela de itens', inventario:'inventário', 'contêiner':'contêiner', mestre:'concedido pelo mestre', craft:'fabricação', troca:'troca' };

  const invDrawer = document.getElementById('inv-drawer');
  const invBackdrop = document.getElementById('inv-drawer-backdrop');
  const rosterDrawer = document.getElementById('roster-drawer');
  const rosterBackdrop = document.getElementById('roster-drawer-backdrop');

  // ================= f26 · kit de movimento: só transform/opacity, curto, desligado com prefers-reduced-motion =================
  var f26Reduced = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : { matches:false };
  var pulseMem = {};
  const STAG_MAX_H = 260, STAG_MAX_N = 3;   // medido: cada bloco animado custa ~25 ms ao abrir o Saque a CPU x4; 3 blocos ficam dentro dos +10%
  // entrada escalonada: os 3 primeiros blocos pequenos e visíveis do painel entram em 160 ms, 40 ms um depois do outro; só na abertura
  function stagger(panel){
    if(!panel || f26Reduced.matches) return;
    cancelAnimationFrame(panel._stagR);
    // no próximo quadro: o DOM já está final e a leitura de estilo não força um cálculo a mais
    panel._stagR = requestAnimationFrame(() => {
      let n = 0;
      Array.prototype.forEach.call(panel.children, c => {
        // blocos grandes (listas, grades) não animam: virar camada própria custa mais do que o efeito vale
        if(c.hidden || n >= STAG_MAX_N || getComputedStyle(c).display === 'none' || c.getBoundingClientRect().height > STAG_MAX_H){ c.classList.remove('f26-s'); return; }
        c.style.setProperty('--i', n++); c.classList.add('f26-s');
      });
      panel.classList.add('f26-stag');
      clearTimeout(panel._stagT);
      panel._stagT = setTimeout(() => panel.classList.remove('f26-stag'), 160 + (STAG_MAX_N - 1) * 40 + 80);
    });
  }
  // painéis que desenham o conteúdo logo depois de abrir (hub): vale a entrada do último desenho dentro de 250 ms
  function stagWant(panel){ if(panel){ panel._stagWant = performance.now() + 250; stagger(panel); } }
  function stagIfWanted(panel){ if(panel && panel._stagWant && performance.now() < panel._stagWant) stagger(panel); }
  // pulso de 140 ms (escala 1 → 1,08 → 1 e cor de destaque) num número que acabou de mudar
  function pulse(el){
    if(!el || f26Reduced.matches) return;
    if(el.classList.contains('f26-pulse')){ el.classList.remove('f26-pulse'); requestAnimationFrame(() => el.classList.add('f26-pulse')); }
    else el.classList.add('f26-pulse');
  }
  document.addEventListener('animationend', e => { if(e.animationName === 'f26Pulse') e.target.classList.remove('f26-pulse'); });
  // números marcados com data-pulse="chave" pulsam quando o texto muda entre um desenho e o seguinte
  function pulseScan(root){
    if(!root || f26Reduced.matches) return;
    root.querySelectorAll('[data-pulse]').forEach(el => { const k = el.dataset.pulse, t = el.textContent; if(k in pulseMem && pulseMem[k] !== t) pulse(el); pulseMem[k] = t; });
  }
  // abas com um único indicador que desliza (translateX/scaleX); o elemento é recriado a cada desenho, então nasce no lugar anterior
  function tabInd(box, inset){
    if(!box || box.hidden) return;
    const a = box.querySelector('[aria-selected="true"]');
    let ind = box.querySelector(':scope > .tab-ind');
    if(!a){ if(ind) ind.remove(); return; }
    if(!ind){
      ind = document.createElement('i'); ind.className = 'tab-ind'; ind.setAttribute('aria-hidden', 'true');
      if(box._tabInd) ind.style.transform = box._tabInd;
      box.appendChild(ind);
    }
    // a medida é lida no próximo quadro (layout já pronto, sem forçar um layout no meio do desenho)
    requestAnimationFrame(() => {
      if(!a.isConnected || !ind.isConnected) return;
      const pad = inset || 0, tr = 'translateX(' + (a.offsetLeft + pad) + 'px) scaleX(' + (Math.max(0, a.offsetWidth - pad * 2) / 100) + ')';
      box._tabInd = tr; ind.style.transform = tr;
    });
  }
  const itemAddDest = document.getElementById('item-add-dest');
  const invUI = { sel:null, holderId:null, tab:'inv', trade:null, panel:null, logHolder:'', logAction:'', takeTo:null, depositOpen:false, filter:'', cat:'' };
  let lastHolderSig = '';

  function toast(msg, isErr){
    if(isErr) TVSound.play('erro', { gap:250 });
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
    if(p.type === 'lugar'){                              // Lugar: sempre guarda itens; as fontes de saque são as marcadas na folha dele
      const g = lgOf(p), c0 = p.container;
      if(c0 && c0.enabled === false) return null;
      const base = { enabled:true, auto:true, locKey:g.src[0] || '', locKeys:g.src, min:g.min, max:g.max, cap:null, access:'aberto' };
      return c0 && c0.enabled ? Object.assign({}, base, { cap:c0.cap, access:c0.access || 'aberto', locKey:g.src[0] || '', locKeys:g.src }) : base;
    }
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
  const EQUIP_SLOTS = [['arma1','Arma principal'],['arma2','Arma secundária'],['cabeca','Cabeça'],['tronco','Tronco'],['maos','Mãos'],['pernas','Pernas'],['botas','Botas'],['mochila','Mochila'],['acessorio','Acessório']];
  const DEFAULT_SLOT_CAP = { arma1:1, arma2:1, cabeca:1, tronco:1, maos:2, pernas:1, botas:1, mochila:1, acessorio:3 };
  function slotLabel(k){ const s = EQUIP_SLOTS.find(x => x[0] === k); return s ? s[1] : k; }
  // Sugestão de espaço pelo nome do item. É só um palpite para pré-selecionar:
  // quem equipa pode escolher qualquer espaço, e nenhum bônus é aplicado.
  function suggestSlot(i, hid){
    const n = normName(i.name);
    if(TVArmas.ehArma(i.category)) return (hid && equippedItems(hid).some(x => x.slot === 'arma1' && x.uid !== i.uid)) ? 'arma2' : 'arma1';
    if(/\b(bota|botina)/.test(n)) return 'botas';
    if(/gorro|balaclava|capuz|chapeu|bandana|protetor de ouvido|oculos|mascara|headlamp|lanterna de cabeca/.test(n)) return 'cabeca';
    if(i.category === 'Mochilas e Contêineres' && /mochila|sacola|saco de estopa|bolsa/.test(n) && !/cinto|coldre/.test(n)) return 'mochila';
    if(/mochila de escoteiro/.test(n)) return 'mochila';
    if(/cinto|coldre|luva|cachecol|relogio|fones|suspensorio/.test(n)) return 'acessorio';
    if(/calca|perneira|meia|meiao/.test(n)) return 'pernas';
    if(/jaqueta|casaco|parka|colete|sobretudo|macacao|poncho|capa de|uniforme|jaleco|blusao|camisa|avental|roupa|traje/.test(n)) return 'tronco';
    if(i.category === 'Ferramentas' || i.category === 'Ferramentas Agrícolas' || i.category === 'Iluminação') return 'maos';
    return null;
  }
  function canEquip(i){ return !!i && !consumableByDefault(i) && i.category !== 'Documentos e Itens de Lore'; }
  function equippedItems(hid){ return invItems(hid).filter(i => i.slot); }
  // armas empunhadas: espaços de arma e, em dados antigos, "Mãos"
  const WEAPON_SLOTS = ['arma1', 'arma2', 'maos'];
  function weaponsOf(hid){
    return equippedItems(hid).filter(i => WEAPON_SLOTS.indexOf(i.slot) !== -1 && TVArmas.ehArma(i.category))
      .sort((a, b) => WEAPON_SLOTS.indexOf(a.slot) - WEAPON_SLOTS.indexOf(b.slot));
  }
  function magOf(inst){ return Math.max(0, parseInt(inst && inst.mag, 10) || 0); }   // item antigo sem `mag` = descarregada
  function magCap(inst){ return TVArmas.capacidade(ITEMS_BY_ID[inst.itemId], inst); }

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
    saque:['🔎 Saque', 0xb4b4b4], guardar:['🎒 Guardou', 0x4f9a63], recusar:['🗑 Não manteve', 0x8a5a4a],
    adicionar:['➕ Adicionou pela tabela', 0x4f9a63], usar:['🧪 Usou', 0xd9a441], descartar:['🗑 Descartou', 0xb04a32],
    troca:['⇄ Troca', 0x7a64c8], craft:['🛠 Fabricação', 0xc9923a], inv_removido:['⚠ Inventário removido', 0xb04a32],
    vasculhar:['📦 Contêiner vasculhado', 0xb4b4b4], pegar:['📤 Pegou de contêiner', 0x4f9a63], depositar:['📥 Guardou em contêiner', 0x4f9a63],
    condicao:['🔧 Condição alterada', 0xd9a441], reparar:['🔧 Reparo', 0xc9923a], ajuste:['🧰 Ajuste do mestre', 0x7a64c8],
    recarga:['🔫 Recarregou', 0x4f9a63], descarga:['🔫 Descarregou', 0xb4b4b4]
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
      case 'recarga': case 'descarga': return `${who} ${e.action === 'recarga' ? '**recarregou**' : '**descarregou**'} ${it} · ${e.qty || 0} tiro(s) · carregador ${e.magAfter != null ? e.magAfter : '?'}/${e.magMax != null ? e.magMax : '?'}`;
      default: return who;
    }
  }
  function queueAudit(entries){
    if(typeof fetch !== 'function' || !entries || !entries.length) return;
    const ses = (campaignMeta && campaignMeta.activeSessionId && sessions[campaignMeta.activeSessionId]) || null;
    for(let i = 0; i < entries.length; i += 15){
      const chunk = entries.slice(i, i + 15);
      const same = chunk.every(e => e.action === chunk[0].action);
      const st = AUDIT_STYLE[chunk[0].action] || ['Registro', 0xb4b4b4];
      auditQueue.push({ tries:0, payload:{
        username:'Tau Volantis — Auditoria',
        allowed_mentions:{ parse:[] },
        embeds:[{
          title: same ? st[0] + (chunk.length > 1 ? ' ×' + chunk.length : '') : 'Registro de transações',
          description: chunk.map(auditLine).join('\n').slice(0, 4000),
          color: same ? st[1] : 0xb4b4b4,
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
      TVSound.play('guardar');
      if(take.length < idxs.length) toast(`Inventário cheio: guardei ${take.length}, sobraram ${idxs.length - take.length}.`, true);
      else toast(take.length > 1 ? `${take.length} itens → inventário de ${holder.name}` : `${insts[0].name} → inventário de ${holder.name}`);
    }
    rerenderLoot();
  }
  async function declineLootItems(entry, idxs, reason){
    idxs = idxs.filter(i => entry.items[i] && entry.items[i].decision === 'pending');
    if(!idxs.length) return;
    idxs.forEach(i => { entry.items[i].decision = 'declined'; });
    TVSound.play('descarta');
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
      <div class="loot-decision-q">${pend.length} ${pend.length === 1 ? 'item sem decisão' : 'itens sem decisão'}${holder ? ' · mochila ' + escapeHtml(capTxt(holder.id)) : ''}</div>
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
  // Recarregar: tira 1 unidade de munição do mesmo calibre por tiro que falta (pilhas menores primeiro).
  async function doRecarregar(hid, uid){
    const holder = holderById(hid), inst = inventories[hid] && inventories[hid][uid], ref = inst && ITEMS_BY_ID[inst.itemId];
    if(!holder || !inst){ toast('Item não encontrado.', true); return; }
    if(!TVArmas.usaMunicao(ref)){ toast(`${inst.name} não usa munição.`, true); return; }
    const cap = magCap(inst);
    if(magOf(inst) >= cap){ toast(`${inst.name} já está carregada (${cap}/${cap}).`); return; }
    const plan = TVArmas.planoRecarga(invItems(hid), inst, ref, i => ITEMS_BY_ID[i.itemId]);
    if(!plan.carregados){
      toast(ref.calibre === 'festim' ? 'Festim não carrega arma de verdade.' : `Sem munição ${TVArmas.rotuloCalibre(ref.calibre)} na mochila de ${holder.name}.`, true); return;
    }
    const ops = {};
    Object.keys(plan.ops).forEach(u => { ops[hid + '/' + u] = plan.ops[u] === null ? null : Object.assign({}, plan.ops[u], { v:DATA_SCHEMA }); });
    const after = plan.ops[uid].mag;
    const ok = await commitInv(ops, [mkLog('recarga', holder, { item:itemRef(inst, 1), qty:plan.carregados, magAfter:after, magMax:cap, source:'inventario' })]);
    if(ok){ invUI.panel = null; toast(`${inst.name}: ${after}/${cap}${plan.faltou ? ` (faltou munição para ${plan.faltou})` : ''}.`); renderInvDrawer(); }
  }
  // Descarregar: devolve os tiros à mochila como munição; se não couber, recusa e nada muda.
  async function doDescarregar(hid, uid){
    const holder = holderById(hid), inst = inventories[hid] && inventories[hid][uid], ref = inst && ITEMS_BY_ID[inst.itemId];
    if(!holder || !inst){ toast('Item não encontrado.', true); return; }
    const d = TVArmas.planoDescarga(inst);
    if(!d.tiros){ toast(`${inst.name} já está descarregada.`); return; }
    const ammo = TVArmas.municaoDoCalibre(ref && ref.calibre, ITEMS);
    const ops = {};
    if(ammo){
      const p = planAdds(hid, [{ item:ammo, qty:d.tiros }], ops);
      if(!p.res[0].ok){ toast(`Mochila de ${holder.name} cheia (${capTxt(hid)}). Libere espaço para guardar os ${d.tiros} tiro(s).`, true); return; }
    }   // sem munição de fábrica para o calibre (ex.: festim): os tiros somem no descarregar, como a arma tinha
    ops[hid + '/' + uid] = Object.assign({}, d.armaDepois, { v:DATA_SCHEMA });
    const ok = await commitInv(ops, [mkLog('descarga', holder, { item:itemRef(inst, 1), qty:d.tiros, magAfter:0, magMax:magCap(inst), source:'inventario' })]);
    if(ok){ invUI.panel = null; toast(`${inst.name} descarregada: ${d.tiros} tiro(s) na mochila.`); renderInvDrawer(); }
  }
  window.__tvArmas = { weaponsOf, doRecarregar, doDescarregar, spendMag, atacar:opWeaponAttack };   // só para os testes automáticos
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
    if(ok){ invUI.trade = null; TVSound.play('troca'); toast('Troca concluída.'); renderInvDrawer(); }
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
    const keys = (cc.locKeys && cc.locKeys.length ? cc.locKeys : [cc.locKey]).filter(k => byLoc[k]);
    if(keys.length > 1){
      // várias fontes: cada item sai de uma fonte por vez, em rodízio embaralhado, para o resultado trazer um pouco de CADA fonte
      const all = new Set(); keys.forEach(k => byLoc[k].forEach(it => all.add(it)));
      const lo2 = Math.max(0, cc.min != null ? parseInt(cc.min, 10) || 0 : 1), hi2 = Math.max(lo2, cc.max != null ? parseInt(cc.max, 10) || 0 : 3);
      const count2 = Math.min(lo2 + Math.floor(Math.random() * (hi2 - lo2 + 1)), all.size, free);
      const order = keys.slice().sort(() => Math.random() - 0.5), used = new Set(), out2 = [];
      for(let i = 0; out2.length < count2 && i < count2 * 6 + 12; i++){
        const k = order[i % order.length], pool2 = byLoc[k].filter(it => !used.has(it));
        if(!pool2.length) continue;
        const it = weightedPick(pool2, k); used.add(it); out2.push(it);
      }
      return out2;
    }
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
    await commitInv({}, [mkLog('vasculhar', holder, { made:added.map(i => itemRef(i, 1)), locName:(cc.locKeys && cc.locKeys.length > 1 ? cc.locKeys.map(k => LOC_NAMES[k]).join(' + ') : LOC_NAMES[cc.locKey]), source:'contêiner', refill:!!force })]);
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
    closeRoster();
    if(hid) invUI.holderId = hid;
    else if(!invUI.holderId || !holderById(invUI.holderId)) invUI.holderId = charSelect.value || (holderList()[0] || {}).id || null;
    invUI.trade = null; invUI.panel = null;
    renderInvDrawer();
    invDrawer.classList.add('open');
    invBackdrop.classList.add('open');
    stagger(invDrawer.querySelector('.drawer-body'));
    guiaOferecer('mochila');
  }
  function closeInventory(){
    invDrawer.classList.remove('open');
    invBackdrop.classList.remove('open');
    closeRoster();     // abrir qualquer outro painel fecha a gaveta de personagens (e cancela o "Colocar")
  }

  function containerHeaderHtml(h){
    const pin = containerPin(h.id), st = containerState(h.id), cc = pinCC(pin), master = isMaster(), locked = cc.access === 'bloqueado';
    const chars = holderList().filter(x => x.type === 'token' && canEditHolder(x));
    if(!chars.some(x => x.id === invUI.takeTo)) invUI.takeTo = (charSelect.value && chars.some(x => x.id === charSelect.value)) ? charSelect.value : (chars[0] ? chars[0].id : null);
    const meta = containerMeta(h.id);
    let html = `<div class="cont-head"><div class="cont-state st-${st}">${escapeHtml(CONT_STATE_LABELS[st] || st)}</div>
      <div class="inv-item-util">${cc.locKey ? 'Tabela: ' + escapeHtml(cc.locKeys && cc.locKeys.length > 1 ? cc.locKeys.map(k => LOC_NAMES[k]).join(' + ') : (LOC_NAMES[cc.locKey] || cc.locKey)) : 'Abastecido à mão pelo mestre'}${meta && meta.generatedBy ? ' · vasculhado por ' + escapeHtml(meta.generatedBy) : ''}</div>`;
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
    fill.style.transform = 'scaleX(' + Math.max(0, Math.min(1, pct || 0)) + ')';
    fill.className = pct >= 1 ? 'full' : (pct >= 0.8 ? 'warn' : '');
    const capEl = document.getElementById('inv-cap-text');
    const capKey = 'cap:' + hid, capPrev = capEl.dataset.pulse === capKey ? capEl.textContent : null;
    capEl.dataset.pulse = capKey; capEl.textContent = capTxt(hid);
    if(capPrev !== null && capPrev !== capEl.textContent) pulse(capEl);       // carga mudou: pulso curto
    document.getElementById('inv-trade-open').disabled = !hid;
    document.getElementById('inv-trade-open').style.display = isCont ? 'none' : '';
    document.getElementById('inv-merge').style.display = isCont ? 'none' : '';

    renderTradePanel();

    // categorias presentes, para o filtro
    const catSel = document.getElementById('inv-cat');
    const cats = Array.from(new Set(invItems(hid).map(i => i.category))).sort();
    if(invUI.cat && !cats.includes(invUI.cat)) invUI.cat = '';
    catSel.innerHTML = '<option value="">Todas as categorias</option>' + cats.map(c => `<option value="${escapeHtml(c)}" ${c === invUI.cat ? 'selected' : ''}>${escapeHtml(c)}</option>`).join('');
    document.getElementById('inv-extra').innerHTML = !hid ? '' : (isCont ? containerHeaderHtml(hobj) : eqStripHtml(hid));

    const list = document.getElementById('inv-list');
    list.innerHTML = '';
    list.classList.add('inv-grid');
    if(!hid){
      list.innerHTML = '<div class="inv-empty">Nenhum personagem no mapa ainda.</div>';
      return;
    }
    const q = (invUI.filter || '').trim().toLowerCase();
    const items = invItems(hid).filter(i => (!invUI.cat || i.category === invUI.cat) && (!q || normName(i.name).includes(normName(q))));
    if(!invItems(hid).length){
      list.innerHTML = isCont ? '<div class="inv-empty">Vazio.</div>' : '<div class="inv-empty">Mochila vazia. Procure itens no Saque.</div>';
      return;
    }
    if(!items.length){ list.innerHTML = '<div class="inv-empty">Nenhum item com esse filtro.</div>'; return; }
    const mkRow = inv => invRowEl(inv, hid, isCont);
    invGridFill(list, items, mkRow);
  }

  // carregador: pontos (até 12) + número + calibre
  function magLineHtml(inv, ref){
    const m = magOf(inv), cap = magCap(inv);
    const pips = cap <= 12 ? `<span class="mag-pips" aria-hidden="true">${Array.from({ length:cap }, (_, k) => `<i${k < m ? ' class="on"' : ''}></i>`).join('')}</span>` : '';
    return `<div class="mag-line">${pips}<b data-pulse="mag:${esc(String(inv.uid))}">Carregador ${m}/${cap}</b><span class="mag-cal">${escapeHtml(TVArmas.rotuloCalibre(ref.calibre))}</span></div>`;
  }
  // detalhe do item aberto: nome, utilidade e ações
  function invRowEl(inv, hid, isCont){
      const ref = ITEMS_BY_ID[inv.itemId];
      const gun = !isCont && TVArmas.usaMunicao(ref);
      const row = document.createElement('div');
      row.className = 'inv-item' + (inv.category === 'Itens Anômalos e Paranormais' ? ' anomalo' : '') + (inv.cond === 0 ? ' broken' : '');
      row.innerHTML = `
        <div class="inv-item-name">${iconHtml({ id:inv.itemId, name:inv.name, category:inv.category })}${escapeHtml(inv.name)}${instQty(inv) > 1 ? ` <span class="qty-chip">×${instQty(inv)}</span>` : ''}${inv.slot ? ` <span class="eq-chip">${escapeHtml(slotLabel(inv.slot))}</span>` : ''}</div>
        <span class="inv-item-cat">${escapeHtml(inv.category)}</span>${inv.cond != null ? `<span class="inv-item-cat cond-${inv.cond}">${escapeHtml(COND_LEVELS[inv.cond])}</span>` : ''}
        ${ref ? `<div class="inv-item-util">${escapeHtml(ref.utility)}</div>${itemFactsHtml(ref)}${compatLine(ref)}` : ''}
        ${inv.foundAt ? `<div class="inv-item-util inv-found">${ic('pin', 13)} ${escapeHtml(inv.foundAt)}</div>` : ''}
        ${gun ? magLineHtml(inv, ref) : ''}
        <div class="inv-item-actions">
          ${isCont ? `<button type="button" class="inv-mini-btn primary" data-act="cont-take" ${containerOpenFor(hid) ? '' : 'disabled'}>Pegar</button>` : `
          ${gun ? `<button type="button" class="inv-mini-btn primary" data-act="reload" ${magOf(inv) >= magCap(inv) ? 'disabled' : ''}>Recarregar</button><button type="button" class="inv-mini-btn" data-act="unload" ${magOf(inv) ? '' : 'disabled'}>Descarregar</button>` : ''}
          <button type="button" class="inv-mini-btn" data-act="use">Usar</button>
          ${canEquip(inv) ? `<button type="button" class="inv-mini-btn" data-act="${inv.slot ? 'unequip' : 'equip'}">${inv.slot ? 'Desequipar' : 'Equipar'}</button>` : ''}
          <button type="button" class="inv-mini-btn" data-act="trade">Trocar</button>`}
          <button type="button" class="inv-mini-btn" data-act="more" aria-label="Mais ações" aria-expanded="${!!(invUI.panel && invUI.panel.uid === inv.uid && invUI.panel.type === 'more')}">Mais</button>
        </div>`;
      const act = (a, fn) => { const b = row.querySelector(`[data-act="${a}"]`); if(b) b.addEventListener('click', fn); };
      const setPanel = p => { invUI.panel = Object.assign({ uid:inv.uid, note:'' }, p); renderInvDrawer(); };
      act('use', () => setPanel({ type:'use', consume:consumableByDefault(inv) }));
      act('equip', () => setPanel({ type:'equip', slot:suggestSlot(inv, hid) || 'acessorio' }));
      act('reload', () => doRecarregar(hid, inv.uid));
      act('unload', () => doDescarregar(hid, inv.uid));
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
      return row;
  }

  // ---- mochila em grade: cada item é um quadro; tocar abre os detalhes logo abaixo da linha ----
  function eqStripHtml(hid){
    const eq = equippedItems(hid), caps = cfg().equipSlots;
    return `<div class="eq-strip" role="group" aria-label="Equipamento">${EQUIP_SLOTS.map(s => {
      const list = eq.filter(i => i.slot === s[0]), cap = caps[s[0]] != null ? caps[s[0]] : 1;
      const wide = s[0] === 'arma1' || s[0] === 'arma2' ? ' wide' : '';
      if(!list.length) return `<div class="eq-tile${wide}"><span class="eq-tile-name">${escapeHtml(s[1])}</span><span class="eq-tile-empty">vazio</span></div>`;
      const gun0 = wide && TVArmas.usaMunicao(ITEMS_BY_ID[list[0].itemId]) ? `<span class="eq-tile-mag">${magOf(list[0])}/${magCap(list[0])}</span>` : '';
      return `<button type="button" class="eq-tile on${wide}" data-act="eq-pick" data-uid="${escapeHtml(list[0].uid)}" aria-label="${escapeHtml(s[1])}: ${escapeHtml(list.map(i => i.name).join(', '))}. Tocar para ver o item"><span class="eq-tile-name">${escapeHtml(s[1])}${cap > 1 ? ` <small>${list.length}/${cap}</small>` : ''}</span>${iconHtml({ id:list[0].itemId, name:list[0].name, category:list[0].category })}<span class="eq-tile-item">${escapeHtml(list[0].name)}${list.length > 1 ? ' +' + (list.length - 1) : ''}</span>${gun0}</button>`;
    }).join('')}</div>`;
  }
  function invGridFill(list, items, mkRow){
    if(invUI.panel && items.some(i => i.uid === invUI.panel.uid)) invUI.sel = invUI.panel.uid;
    if(invUI.sel && !items.some(i => i.uid === invUI.sel)) invUI.sel = null;
    items.forEach(inv => {
      const on = invUI.sel === inv.uid, q = instQty(inv);
      const b = document.createElement('button');
      b.type = 'button'; b.dataset.uid = inv.uid; b.setAttribute('aria-pressed', String(on));
      b.className = 'inv-tile' + (on ? ' sel' : '') + (inv.slot ? ' eq' : '') + (inv.category === 'Itens Anômalos e Paranormais' ? ' anomalo' : '') + (inv.cond === 0 ? ' broken' : '');
      b.setAttribute('aria-label', inv.name + (q > 1 ? ', quantidade ' + q : '') + (inv.slot ? ', equipado em ' + slotLabel(inv.slot) : '') + (inv.cond != null ? ', ' + COND_LEVELS[inv.cond] : ''));
      b.innerHTML = `${iconHtml({ id:inv.itemId, name:inv.name, category:inv.category })}<span class="it-name">${escapeHtml(inv.name)}</span>${q > 1 ? `<span class="it-qty">×${q}</span>` : ''}${inv.slot ? '<i class="it-eq" title="Equipado"></i>' : ''}${TVArmas.usaMunicao(ITEMS_BY_ID[inv.itemId]) ? `<span class="it-mag" title="Tiros no carregador">${magOf(inv)}/${magCap(inv)}</span>` : ''}${inv.cond != null && inv.cond < 2 ? `<i class="it-cond c${inv.cond}" title="${escapeHtml(COND_LEVELS[inv.cond])}"></i>` : ''}`;
      b.addEventListener('click', () => { invUI.sel = on ? null : inv.uid; if(on) invUI.panel = null; invUI.focus = inv.uid; invUI.reveal = !on; renderInvDrawer(); });
      list.appendChild(b);
      if(on){ const d = document.createElement('div'); d.className = 'inv-detail'; d.id = 'inv-detail'; d.appendChild(mkRow(inv)); list.appendChild(d); }
    });
    if(invUI.focus){ const t = list.querySelector('.inv-tile[data-uid="' + invUI.focus.replace(/"/g, '') + '"]'); invUI.focus = null; if(t) t.focus({ preventScroll:true }); }
    if(invUI.reveal){ invUI.reveal = false; const d = list.querySelector('#inv-detail'); if(d && d.scrollIntoView) d.scrollIntoView({ block:'nearest' }); }
  }
  // setas movem entre os quadros (para cima e para baixo respeitam a coluna)
  document.getElementById('inv-list').addEventListener('keydown', e => {
    const t = e.target.closest && e.target.closest('.inv-tile'); if(!t || !/^Arrow/.test(e.key)) return;
    const tiles = Array.from(document.querySelectorAll('#inv-list .inv-tile')), i = tiles.indexOf(t); if(i < 0) return;
    const r = t.getBoundingClientRect(); let n = null;
    if(e.key === 'ArrowRight') n = tiles[i + 1]; else if(e.key === 'ArrowLeft') n = tiles[i - 1];
    else {
      const dir = e.key === 'ArrowDown' ? 1 : -1, cx = r.left + r.width / 2;
      const cand = tiles.filter(x => { const b = x.getBoundingClientRect(); return dir > 0 ? b.top > r.bottom - 4 : b.bottom < r.top + 4; });
      if(dir < 0) cand.reverse();
      if(cand.length){ const row = cand[0].getBoundingClientRect().top; n = cand.filter(x => Math.abs(x.getBoundingClientRect().top - row) < 6).sort((a, b) => Math.abs(a.getBoundingClientRect().left + a.offsetWidth / 2 - cx) - Math.abs(b.getBoundingClientRect().left + b.offsetWidth / 2 - cx))[0]; }
    }
    if(n){ e.preventDefault(); n.focus(); }
  });

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
      box.innerHTML = `<p>Remove ${q > 1 ? 'as unidades' : 'o item'} da mochila. Fica no registro.</p>
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
        ${actions('Registrar')}`;
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
      case 'recarga': case 'descarga': return `${who} ${e.action === 'recarga' ? 'recarregou' : 'descarregou'} ${it} · ${e.qty || 0} tiro(s) · carregador ${e.magAfter != null ? e.magAfter : '?'}/${e.magMax != null ? e.magMax : '?'}`;
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
    document.getElementById('saque-inv-count').textContent = t ? capTxt(t.id) : '—';
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
    if(hubIsOpen()) renderHub();       // seção Armas da ficha
    rosterChanged();
    hudQRChanged();                    // lista de armas da folha Rolar
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
  { const f = document.getElementById('inv-find'); if(f) f.addEventListener('click', () => { closeInventory(); hudOpenSaque(); }); }
  // contêineres e equipamento: um único ouvinte no painel que é redesenhado
  document.getElementById('inv-extra').addEventListener('click', e => {
    const b = e.target.closest('[data-act]');
    if(!b) return;
    const hid = invUI.holderId, a = b.dataset.act;
    if(a === 'unequip') doEquip(hid, b.dataset.uid, null);
    else if(a === 'eq-pick'){ invUI.sel = b.dataset.uid; invUI.focus = null; invUI.reveal = true; invUI.panel = null; renderInvDrawer(); }
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
  let roster = {};            // gaveta compartilhada (personagens dos jogadores)
  let gmRoster = {};          // gaveta do mestre (NPCs): só existe para o mestre
  let gmRosterOff = null;
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
    f23Refresh();
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
    return what + ' não foi salvo.' + (/permission|denied/i.test(e) ? ' O Firebase recusou a gravação: confira se as regras publicadas são as de firebase-rules.SUGESTAO-v4.json (a v4 inclui tudo da v3 e a gaveta).' : (e ? ' (' + e + ')' : ''));
  }
  function todayStr(){ const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }

  // ---------- ligar/desligar tudo de uma campanha ----------
  function resetCampaignState(){
    areaReset();   // fecha a folha/desenho de áreas sem gravar nada na campanha nova
    lgReset(); routeReset();
    pins = []; tokens = []; shapes = []; routes = [];
    weather = { state:'calmo', updatedAt:null, updatedBy:null };
    inventories = {}; lootLog = []; characters = {}; rolls = {}; recipes = {}; clock = null; campShortcuts = {}; sessions = {}; journal = {}; gmJournal = {}; roster = {}; gmRoster = {};
    hub.resDraft = null; hub.slotDraft = null; hub.cfgDraft = null;
    tacReset(); f23SceneReset();
    rollsSeen = null;
    lootHistory = []; fishHistory = [];
    renderPins(); renderTokens(); renderShapes(); renderRoutes(); applyWeatherVisual();
    renderLootResults(); renderFishResults();
  }
  function attachModuleSync(){
    const on = (key, cb, limit) => syncOff.push(DB.on(scopedKey(key), cb, limit));
    on(KEY_CHARS, v => {
      // eco do banco: ficha com edição ainda não salva (PV digitado há instantes, por exemplo) fica como está, senão a 2ª edição seguida se perde
      const nv = v || {}; Object.keys(cardTimers).forEach(id => { if(cardTimers[id] && characters[id]) nv[id] = characters[id]; });
      characters = nv; hubChanged(); hudMiniChanged(); hudQRChanged();
    });
    on(KEY_ROLLS, v => { soundRolls(v || {}); rolls = v || {}; hubChanged(); hudFeedChanged(); }, 300);
    on(KEY_RECIPES, v => { recipes = v || {}; hubChanged(); });
    on(KEY_CLOCK, v => { clock = v; updateHud(); hubChanged(); });
    on(KEY_SHORTCUTS, v => { campShortcuts = v || {}; hubChanged(); });
    syncOff.push(DB.on('campaign-sessions/' + activeCampaignId, v => { sessions = v || {}; updateHud(); hubChanged(); }));
    on(KEY_JOURNAL, v => { journal = v || {}; hubChanged(); hudFeedChanged(); }, 300);
    on(KEY_ROSTER, v => { roster = v || {}; rosterChanged(); });
    on(KEY_TAC, v => tacOnData(v));
    on(KEY_SCENE, v => f23SceneData(v));
    syncOff.push(() => { if(gmOff){ gmOff(); gmOff = null; } if(tacGmOff){ tacGmOff(); tacGmOff = null; } if(gmRosterOff){ gmRosterOff(); gmRosterOff = null; } });
    syncGm();
  }
  function activateCampaign(id){
    detachSync();
    activeCampaignId = id;
    try{ localStorage.setItem('tv-map:active-campaign', id); }catch(e){}
    document.getElementById('map-loading').style.display = '';
    resetCampaignState();
    TVSound.quiet(6000);
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
    // f25: nome da campanha em destaque; sessão e hora ficam como texto secundário (somem no celular), sem "·" colando tudo numa linha
    chip.innerHTML = ic('book', 14) + '<span class="cc-name">' + esc(parts[0]) + '</span>' + parts.slice(1).map(x => '<span class="cc-sub">' + esc(x) + '</span>').join('');
    chip.setAttribute('aria-label', 'Campanha ativa: ' + parts.join(', ') + '. Abrir campanhas e sessões.');
    hudMiniChanged(); hudFeedChanged(); f23Refresh();
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
    TVSound.rolled(results, false);
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
        const sel = hubQ('[data-bind="rollUI.who"]'); if(sel) sel.focus();
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
      cardTimers[id] = 0;
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
    return `<div class="result-coord">${ic('pin', 13)} <span class="rc-xy">${escapeHtml(e.coord)}</span>
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
    if(ok) TVSound.play(outcome === 'sucesso' ? 'craftok' : 'craftno');
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
  // Grupos de abas (f23): a antiga "Mesa de jogo" de 8 abas foi repartida.
  //  ficha  → coluna da esquerda (computador) ou gaveta (celular)
  //  mesa   → painel Mesa (Feed, Grupo, Diário, Mundo, Ofício): coluna da direita ou folha
  //  cfg    → gaveta de Ajustes e mestre (Campanhas, Sessão, Mestre, Dados completos)
  const HUB_MESA_TABS = ['feed', 'grupo', 'diario', 'mundo', 'oficio'];
  function hubGroupOf(tab){ return tab === 'ficha' ? 'ficha' : (HUB_MESA_TABS.includes(tab) ? 'mesa' : 'cfg'); }
  function hubTabsFor(group){
    const c = cfg().modules, m = isMaster();
    if(group === 'ficha') return [['ficha', ic('user', 14) + ' Ficha']];
    if(group === 'mesa'){
      const t = [['feed', ic('list', 14) + ' Feed'], ['grupo', ic('users', 14) + ' Grupo'], ['diario', ic('book', 14) + ' Diário'], ['mundo', ic('map', 14) + ' Mundo']];
      if(c.crafting) t.push(['oficio', ic('tool', 14) + ' Ofício']);
      return t;
    }
    const t = [['campanhas', ic('layers', 14) + ' Campanhas']];
    if(m) t.push(['sessao', ic('list', 14) + ' Sessão'], ['mestre', ic('lock', 14) + ' Mestre']);
    t.push(['dados', ic('dice', 14) + ' Dados']);
    return t;
  }
  const fichapBody = document.getElementById('fichap-body'), fpHead = document.getElementById('fp-head'), mesaBody = document.getElementById('mesa-body');
  let fichaDocked = false;
  // o primeiro campo que casar entre as telas abertas (ids dos formulários são únicos entre elas)
  function hubQ(sel){ return [hubBody, fpHead, fichapBody, mesaBody].map(r => r && r.querySelector(sel)).find(Boolean) || null; }
  function hubViewDefs(){
    return [
      { id:'drawer', roots:[hubBody], body:hubBody, on:() => hubDrawer.classList.contains('open'), tab:() => hub.tab },
      { id:'ficha', roots:[fpHead, fichapBody], body:fichapBody, on:() => hudCol() && !hud.miniOff, tab:() => 'ficha' },
      { id:'mesa', roots:[mesaBody], body:mesaBody, on:() => f23MesaVisible() && F23.mesaTab !== 'feed', tab:() => F23.mesaTab }
    ];
  }
  function openHub(tab){
    tab = tab || hub.tab;
    const g = hubGroupOf(tab);
    if(g === 'mesa'){ f23OpenMesa(tab); return; }
    if(g === 'ficha' && hudCol()){ f23ShowFicha(); return; }
    closeDrawer(); closeNavDrawer(); closeInventory(); hudCloseSheets();
    hub.tab = hubTabsFor(g).some(t => t[0] === tab) ? tab : hubTabsFor(g)[0][0];
    ensurePersonalSub();
    hubTitleSync();
    hubDrawer.classList.add('open'); hubBackdrop.classList.add('open');   // antes do render: a visão da gaveta só renderiza quando está aberta
    renderHub();
    stagWant(document.getElementById('hub-body'));
    if(g === 'ficha') guiaOferecer('ficha');
  }
  function hubTitleSync(){
    const g = hubGroupOf(hub.tab), t = document.getElementById('hub-title');
    if(t) t.textContent = g === 'ficha' ? 'Ficha' : (isMaster() ? 'Mestre e ajustes' : 'Ajustes');
    const q = document.getElementById('hub-guia'); if(q) q.hidden = g !== 'ficha';
  }
  function closeHub(){ hubDrawer.classList.remove('open'); hubBackdrop.classList.remove('open'); }
  function hubIsOpen(){ return hubDrawer.classList.contains('open'); }
  function hubChanged(){
    if(!invReady) return;
    rosterChanged();
    const vs = hubViewDefs().filter(v => v.body && v.on());
    if(!vs.length) return;
    const ae = document.activeElement;
    if(ae && vs.some(v => v.roots.some(r => r && r.contains(ae))) && /^(INPUT|TEXTAREA|SELECT)$/.test(ae.tagName)){ hubDirty = true; return; }
    renderHub();
  }
  function opt(v, label, sel){ return `<option value="${esc(v)}" ${String(sel) === String(v) ? 'selected' : ''}>${esc(label)}</option>`; }
  function holderSelect(bind, value, withNone, list){
    const hl = list || holderList();
    return `<select data-bind="${bind}" data-rerender>${withNone ? '<option value="">— sem personagem —</option>' : ''}${
      hl.map(h => opt(h.id, (h.type === 'npc' ? 'NPC · ' : '') + h.name, value)).join('')}</select>`;
  }
  // um campo focado que sai do DOM dispara blur/change no meio da troca do innerHTML; se isso pedir outro desenho, ele espera a troca terminar
  let hubBusy = false;
  function renderHub(){
    if(hubBusy){ setTimeout(renderHub, 0); return; }
    hubBusy = true;
    try{ renderHubNow(); } finally { hubBusy = false; }
  }
  function renderHubNow(){
    hubViewDefs().forEach(v => { if(v.body && v.on()){ renderHubView(v); pulseScan(v.body); } });
    hubDirty = false;
  }
  function renderHubView(v){
    const group = v.id === 'ficha' ? 'ficha' : hubGroupOf(v.tab()), tabs = hubTabsFor(group);
    let cur = v.tab(); if(!tabs.some(t => t[0] === cur)) cur = tabs[0][0];
    if(v.id === 'drawer') hub.tab = cur;
    const fn = { dados:renderDados, ficha:renderFicha, sessao:renderSessao, campanhas:renderCampanhas, mundo:renderMundo, oficio:renderOficio, diario:renderDiario, grupo:renderGrupo, mestre:renderMestre }[cur];
    const ae = document.activeElement;
    const inRoot = ae && v.roots.some(r => r && r.contains(ae));
    const keep = (inRoot && ae.dataset && ae.dataset.bind) ? { bind:ae.dataset.bind, s:ae.selectionStart, e:ae.selectionEnd } : null;
    if(v.id === 'ficha'){ f23RenderFicha(fn); }
    else {
      let html = '';
      if(v.id === 'drawer'){
        const ses = activeSession();
        if(group !== 'ficha') html += `<div class="hub-context" role="status"><b>${esc(campaignMeta ? campaignMeta.name : 'Campanha')}</b> · ${esc(ses ? ses.title : 'sem sessão')}${isMaster() ? ' · mestre' : ''}</div>`;
        if(tabs.length > 1) html += '<div class="hub-tabs" role="tablist">' + tabs.map(t => `<button type="button" role="tab" aria-selected="${cur === t[0]}" class="hub-tab${cur === t[0] ? ' active' : ''}" data-act="tab" data-tab="${t[0]}">${t[1]}</button>`).join('') + '</div>';
      }
      html += fn ? fn() : '';
      v.body.innerHTML = html;
      stagIfWanted(v.body);
    }
    if(keep){
      const el = v.roots.map(r => r && Array.from(r.querySelectorAll('[data-bind]')).find(x => x.dataset.bind === keep.bind)).find(Boolean);
      if(el){ el.focus(); try{ if(keep.s != null) el.setSelectionRange(keep.s, keep.e); }catch(e){} }
    }
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
    return chips.map(c => `<button type="button" class="mod-chip" data-act="mod-del" data-i="${i}" data-k="${c[0]}" aria-label="Remover: ${esc(c[1])}">${esc(c[1])}</button>`).join('');
  }
  function trayHtml(){
    if(!rollUI.terms.length) return '<div class="inv-empty tray-empty">Toque nos dados para montar a rolagem.</div>';
    return rollUI.terms.map((t, i) => `<div class="tray-term"><b class="tray-lb">${esc(termDefLabel(t))}</b><span class="tray-mods">${modChips(t, i)}</span>
        <button type="button" class="mod-chip tray-x" data-act="term-del" data-i="${i}" aria-label="Remover ${esc(termDefLabel(t))}">${ic('close', 16)}</button></div>`).join('');
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
      <button type="button" class="inv-mini-btn" data-act="roll-copy" aria-label="Copiar resultado">${ic('copy', 16)}</button></div>`;
  }
  function scRow(sc){
    return `<div class="sc-row"><span class="sc-name" dir="ltr">${esc(sc.name)}</span>
      <button type="button" class="inv-mini-btn" data-act="sc-use" data-id="${esc(sc.id)}" data-scope="${sc.scope}">Usar</button>
      <button type="button" class="inv-mini-btn primary" data-act="sc-roll" data-id="${esc(sc.id)}" data-scope="${sc.scope}">Rolar</button>
      ${sc.scope === 'personal' && rollUI.who ? `<button type="button" class="inv-mini-btn" data-act="sc-move" data-id="${esc(sc.id)}" data-scope="personal">Mover</button>` : ''}
      <button type="button" class="inv-mini-btn danger" data-act="sc-del" data-id="${esc(sc.id)}" data-scope="${sc.scope}" aria-label="Excluir atalho ${esc(sc.name)}">${ic('close', 16)}</button></div>`;
  }
  function renderDados(){
    const who = holderById(rollUI.who) ? rollUI.who : '';
    rollUI.who = who;
    const whoName = who ? holderById(who).name : '';
    if((rollUI.modTerm | 0) >= rollUI.terms.length) rollUI.modTerm = 0;
    const pad = PAD_DICE.map(s => {
      const n = padCount(s), name = s === 'F' ? 'dF' : 'd' + s;
      return `<div class="pad-cell"><button type="button" class="pad-die${n ? ' has-count' : ''}" data-act="die+" data-s="${s}" aria-label="Adicionar um ${name} (agora ${n})">${dieSvg(s, name, '', name)}${n ? `<span class="pad-count">${n}</span>` : ''}</button>
        ${n ? `<button type="button" class="die-btn pad-minus" data-act="die-" data-s="${s}" aria-label="Remover um ${name}">−</button>` : ''}</div>`;
    }).join('');
    const bon = rollUI.bonuses.map((b, i) => `<div class="bonus-row">
      <input type="text" data-bind="rollUI.bonuses.${i}.label" value="${esc(b.label)}" placeholder="Bônus de…" aria-label="Rótulo do bônus">
      <input type="number" data-bind="rollUI.bonuses.${i}.value" data-num value="${esc(b.value)}" aria-label="Valor do bônus">
      <button type="button" class="inv-mini-btn danger" data-act="bonus-del" data-i="${i}" aria-label="Remover bônus">${ic('close', 16)}</button></div>`).join('');
    const mine = allShortcuts();
    const grp = (title, arr) => arr.length ? `<div class="hub-label">${title}</div>${arr.map(scRow).join('')}` : '';
    const scs = grp(whoName ? 'Atalhos de ' + esc(whoName) : '', mine.filter(s => s.scope === 'character'))
      + grp('Atalhos da campanha', mine.filter(s => s.scope === 'campaign'))
      + grp('Atalhos antigos', mine.filter(s => s.scope === 'personal'));
    const modOpts = [['kh', 'Manter os maiores'], ['kl', 'Manter os menores'], ['dh', 'Descartar os maiores'], ['dl', 'Descartar os menores'], ['ex', 'Explodir'], ['rr', 'Rerrolar até N'], ['sc', 'Contar sucessos ≥ N']];
    const sw = (path, on, label, extra) => `<label class="check-row"><input type="checkbox" data-bind="${path}" ${extra || ''} ${on ? 'checked' : ''}> ${label}</label>`;
    const more = !!hub.diceMore;
    return `<div class="hub-sec dx">
      ${holderSelect('rollUI.who', who, true)}
      <div class="dice-pad">${pad}</div>
      <div class="tray">${trayHtml()}</div>
      <div class="dx-go"><button type="button" class="inv-mini-btn primary roll-go" data-act="roll">${ic('dice', 18)} ${rollUI.physical ? 'Registrar resultado' : 'Rolar'}</button>
        <button type="button" class="inv-mini-btn" data-act="roll-clear" ${rollUI.terms.length ? '' : 'disabled'}>Limpar</button></div>
      ${resultHtml(rollUI.last)}
      ${scs ? `<div class="dx-sc">${scs}</div>` : ''}
      <div class="ox-more"><button type="button" class="ox-more-btn" data-act="flag" data-f="diceMore" aria-expanded="${more}">${ic(more ? 'minus' : 'plus', 16)} ${more ? 'Menos opções' : 'Mais opções'}</button>
      ${more ? `<div class="dx-adv">
        <div class="inv-item-actions"><button type="button" class="inv-mini-btn" data-act="preset-adv" title="2d20, fica o maior">Vantagem</button><button type="button" class="inv-mini-btn" data-act="preset-dis" title="2d20, fica o menor">Desvantagem</button></div>
        <div class="expr-row"><input type="text" data-bind="rollUI.expr" dir="ltr" autocomplete="off" spellcheck="false" value="${esc(rollUI.expr)}" placeholder="Fórmula: 4d6kh3+2" aria-label="Fórmula de dados">
          <button type="button" class="inv-mini-btn" data-act="expr-apply">Aplicar</button></div>
        ${rollUI.terms.length ? `<div class="mod-row">
          <select data-bind="rollUI.modTerm" data-num aria-label="Grupo de dados">${rollUI.terms.map((t, i) => opt(i, termDefLabel(t), rollUI.modTerm)).join('')}</select>
          <select data-bind="rollUI.modType" aria-label="Modificador">${modOpts.map(m => opt(m[0], m[1], rollUI.modType)).join('')}</select>
          <input type="number" min="1" data-bind="rollUI.modVal" data-num value="${esc(rollUI.modVal)}" placeholder="N" aria-label="Valor N do modificador">
          <button type="button" class="inv-mini-btn" data-act="mod-add">Aplicar</button></div>` : ''}
        <input type="text" data-bind="rollUI.skill" value="${esc(rollUI.skill)}" placeholder="Nome da rolagem (perícia, ação)" aria-label="Nome da rolagem" maxlength="60">
        ${bon}
        <button type="button" class="inv-mini-btn" data-act="bonus-add">${ic('plus', 16)} Bônus</button>
        ${sw('rollUI.physical', rollUI.physical, 'Dados físicos (digitar resultados)', 'data-rerender')}
        ${rollUI.physical ? `<input type="text" data-bind="rollUI.phys" value="${esc(rollUI.phys)}" placeholder="Resultados em ordem: 14 3 5" aria-label="Resultados dos dados físicos">` : ''}
        <input type="text" data-bind="rollUI.note" value="${esc(rollUI.note)}" placeholder="Observação" aria-label="Observação" maxlength="140">
        ${sw('rollUI.record', rollUI.record, 'Registrar na campanha')}
        ${sw('rollUI.important', rollUI.important, 'Marcar como relevante')}
        ${sw('rollUI.discord', rollUI.discord, 'Enviar ao Discord')}
        <div class="hub-label">Salvar como atalho</div>
        <div class="sc-save">
          <input type="text" class="sc-name-input" dir="ltr" autocomplete="off" autocapitalize="sentences" spellcheck="false" maxlength="40" data-bind="rollUI.scName" value="${esc(rollUI.scName)}" placeholder="Nome do atalho" aria-label="Nome do atalho">
          ${isMaster() ? `<select data-bind="rollUI.scScope" aria-label="Onde salvar">${opt('character', 'Neste personagem', rollUI.scScope)}${opt('campaign', 'Na campanha toda', rollUI.scScope)}</select>` : ''}
          <button type="button" class="inv-mini-btn primary" data-act="sc-save">Salvar atalho</button></div>
      </div>` : ''}</div>
    </div>`;
  }

  // --- ficha ---
  const opTabNow = () => OP_TABS.some(t => t[0] === hub.opTab) ? hub.opTab : 'agente';
  function renderFicha(){
    const hl = holderList();
    if(!hl.length) return '<div class="inv-empty">Crie um token ou NPC no mapa para ter uma ficha.</div>';
    if(!hl.some(h => h.id === hub.charToken)) hub.charToken = (charSelect.value && hl.some(h => h.id === charSelect.value)) ? charSelect.value : hl[0].id;
    const h = holderById(hub.charToken), card = ensureCard(hub.charToken);
    const edit = canEditHolder(h), dis = edit ? '' : 'disabled';
    const cm = cfg().cardModules, mods = cfg().modules;
    let html = `<div class="hub-sec">${fichaDocked ? '' : holderSelect('hub.charToken', hub.charToken, false)}
      ${edit ? '' : '<p class="hub-hint">Somente leitura: esta ficha pertence a outra pessoa.</p>'}`;
    const ordem = card.systemId === 'ordem';
    if(ordem){
      // ficha nova (Ordem Paranormal); os campos antigos (anotações, lembretes, necessidades, atalhos) continuam existindo
      html += renderFichaOrdem(h, card, dis);
      if(cm.identity && opTabNow() === 'agente') html += renderReminders(card, dis);
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
    const xs = !ordem || opTabNow() === 'agente';       // na ficha de Ordem, notas, equipamento e necessidades ficam na aba Agente
    if(cm.notes && xs) html += `<div class="hub-label">Anotações</div><textarea data-bind="card.notes" rows="4" ${dis}>${esc(card.notes)}</textarea>`;
    if(!ordem) html += renderFichaExtras(h, card, dis);
    if(cm.equip && xs){
      const eq = equippedItems(h.id);
      html += `<div class="hub-label">Equipamento</div>${eq.length ? '<ul class="craft-ing">' + eq.map(i => `<li>${esc(slotLabel(i.slot))}: ${esc(i.name)}${i.cond != null ? ' · ' + esc(COND_LEVELS[i.cond]) : ''}</li>`).join('') + '</ul>' : '<p class="hub-hint">Nada equipado.</p>'}
        <p class="hub-hint">Inventário ${esc(capTxt(h.id))}</p><button type="button" class="inv-mini-btn" data-act="open-inv" data-id="${esc(h.id)}">${ic('bag', 16)} Abrir inventário</button>`;
    }
    if(mods.needs && xs){
      const w = WEATHER_STATES[weather.state] || WEATHER_STATES.calmo;
      html += `<div class="hub-label">Necessidades (registro; o mestre decide os efeitos)</div><p class="hub-hint">${ic(w.icon, 14)} Clima agora: <b>${esc(w.label)}</b>. ${esc(w.desc)}${w.eff.length ? ' Efeitos: ' + esc(w.eff.join('; ')) + '.' : ''}</p>` + NEED_LIST.map(n => {
        const v = (card.needs && card.needs[n[0]]) || 0;
        return `<div class="need-row"><span>${n[1]}</span><button type="button" class="die-btn" data-act="need" data-n="${n[0]}" data-d="-1" ${dis} aria-label="Reduzir ${n[1]}">−</button><b class="need-v">${NEED_LEVELS[v]}</b><button type="button" class="die-btn" data-act="need" data-n="${n[0]}" data-d="1" ${dis} aria-label="Aumentar ${n[1]}">+</button></div>`;
      }).join('');
    }
    if(ordem && edit && xs) html += `<div class="hub-label">Formato da ficha</div><button type="button" class="inv-mini-btn" data-act="op-revert">Voltar ao formato antigo</button><p class="hub-hint">Os dados antigos (perícias e recursos) foram guardados na migração e voltam como estavam.</p>`;
    return html + '</div>';
  }

  // --- sessão ---
  // ---- painéis do mestre (f24): blocos recolhíveis, rótulos curtos, nada de tutorial ----
  function mxOpen(k, def){ return hub.mx && k in hub.mx ? !!hub.mx[k] : !!def; }
  function mxSec(k, title, meta, body, def){
    const on = mxOpen(k, def);
    return `<section class="mx-sec${on ? ' open' : ''}"><button type="button" class="mx-head" data-act="mx" data-k="${esc(k)}" data-d="${def ? 1 : 0}" aria-expanded="${on}"><span class="mx-t">${title}</span>${meta !== '' && meta != null ? `<span class="mx-meta">${meta}</span>` : ''}<span class="mx-chev">${ic('chev', 16)}</span></button>${on ? `<div class="mx-body">${body}</div>` : ''}</section>`;
  }
  function mxF(label, inner, cls, tag){ const t = tag || 'label'; return `<${t} class="mx-f${cls ? ' ' + cls : ''}"><span class="mx-fl">${label}</span>${inner}</${t}>`; }
  function mxTog(label, sub, attrs, on){ return `<label class="mx-tog"><span class="mx-tog-t"><b>${label}</b>${sub ? `<small>${sub}</small>` : ''}</span><input type="checkbox" class="mx-sw" role="switch" ${attrs} ${on ? 'checked' : ''}></label>`; }
  function mxPick(label, attrs, on){ return `<label class="mx-pick"><input type="checkbox" ${attrs} ${on ? 'checked' : ''}><span>${label}</span></label>`; }

  function renderSessao(){
    const s = activeSession(), master = isMaster(), f = hub.sessionForm;
    if(!f.date) f.date = todayStr();
    const names = candidateNames();
    const past = Object.keys(sessions).map(k => sessions[k]).filter(p => !s || p.id !== s.id).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    const live = s ? `<div class="mx-card mx-live">
        <div class="mx-top"><h3 class="mx-h">${esc(s.title)}</h3><span class="mx-pill${s.closed ? '' : ' on'}">${s.closed ? 'Encerrada' : 'Em andamento'}</span></div>
        <div class="mx-sub">${esc(s.date || '')}</div>
        ${(s.present || []).length ? `<div class="mx-chips" aria-label="Presentes">${s.present.map(n => `<span class="mx-chip">${esc(n)}</span>`).join('')}</div>` : ''}
        ${master ? `<textarea data-bind="hub.summary" rows="4" placeholder="O que aconteceu hoje" aria-label="Resumo da sessão">${esc(s.summary || '')}</textarea>
        <div class="mx-acts"><button type="button" class="mx-go" data-act="sess-summary">Salvar resumo</button>${s.closed ? '' : '<button type="button" class="mx-ghost" data-act="sess-close">Encerrar</button>'}</div>`
        : (s.summary ? `<p class="mx-note">${esc(s.summary).replace(/\n/g, '<br>')}</p>` : '')}</div>`
      : `<div class="mx-empty">${ic('list', 22)}<b>Nenhuma sessão aberta</b><span>${master ? 'Abra uma para registrar quem veio e o que aconteceu.' : 'O mestre ainda não abriu a sessão.'}</span></div>`;
    const novaBody = `<div class="mx-grid">${mxF('Título', `<input type="text" data-bind="sf.title" value="${esc(f.title)}" placeholder="Sessão ${Object.keys(sessions).length + 1}" maxlength="60">`)}${mxF('Data', `<input type="date" data-bind="sf.date" value="${esc(f.date)}">`)}</div>
      <div class="mx-fl">Quem veio</div>
      <div class="mx-picks">${names.map(n => mxPick(esc(n), `data-act="present" data-name="${esc(n)}"`, f.present.includes(n))).join('') || '<span class="mx-sub">Ninguém na mesa ainda.</span>'}</div>
      <input type="text" data-bind="sf.extra" value="${esc(f.extra)}" placeholder="Outros nomes, separados por vírgula" aria-label="Outros presentes" maxlength="120">
      <button type="button" class="mx-go" data-act="sess-new">Abrir sessão</button>`;
    const pastBody = past.slice(0, 20).map(p => `<div class="mx-log"><div class="mx-top"><b>${esc(p.title)}</b><span class="mx-sub">${esc(p.date || '')}</span></div>${p.summary ? `<p class="mx-note">${esc(p.summary)}</p>` : ''}</div>`).join('');
    return `<div class="mx">${live}
      ${master ? mxSec('sess-new', 'Nova sessão', '', novaBody, !s) : ''}
      ${past.length ? mxSec('sess-past', 'Anteriores', past.length, pastBody, false) : ''}</div>`;
  }

  // --- campanhas ---
  function renderCampanhas(){
    const list = visibleCampaigns(), master = isMaster();
    const act = list.filter(m => !m.archived), arch = list.filter(m => m.archived);
    const row = m => {
      const mine = isMasterOf(m), cur = m.id === activeCampaignId, more = mxOpen('c:' + m.id, false), id = esc(m.id);
      const canArch = mine && m.id !== 'legacy' && (m.archived || !cur), canDel = mine && m.id !== 'legacy';
      const extra = (mine && m.joinCode ? `<button type="button" class="mx-ghost" data-act="camp-code-new" data-id="${id}">Trocar código</button>` : '')
        + (canArch ? (m.archived ? `<button type="button" class="mx-ghost" data-act="camp-reopen" data-id="${id}">Reabrir</button>` : `<button type="button" class="mx-ghost" data-act="camp-archive" data-id="${id}">Arquivar</button>`) : '')
        + (canDel ? `<button type="button" class="mx-ghost danger" data-act="camp-delete" data-id="${id}">Excluir</button>` : '');
      return `<div class="mx-card mx-camp${cur ? ' cur' : ''}">
        <div class="mx-top"><div class="mx-grow"><h3 class="mx-h">${esc(m.name)}</h3><div class="mx-sub">${esc(m.system || 'Sistema livre')}${m.masterName ? ' · mestre ' + esc(m.masterName) : ''}</div></div>
          ${cur ? '<span class="mx-pill on">Ativa</span>' : `<button type="button" class="mx-go sm" data-act="camp-open" data-id="${id}">Abrir</button>`}</div>
        ${mine ? (m.joinCode ? `<button type="button" class="mx-code" data-act="camp-code-copy" data-id="${id}" aria-label="Copiar o código de convite ${esc(m.joinCode)}"><span>Convite</span><b>${esc(m.joinCode)}</b>${ic('copy', 16)}</button>` : `<button type="button" class="mx-ghost" data-act="camp-code-gen" data-id="${id}">Gerar código de convite</button>`) : ''}
        ${extra ? `<button type="button" class="mx-more" data-act="mx" data-k="c:${id}" data-d="0" aria-expanded="${more}">${ic('more', 16)} ${more ? 'Menos' : 'Mais'}</button>${more ? `<div class="mx-acts">${extra}</div>` : ''}` : ''}</div>`;
    };
    const nc = hub.newCampaign;
    if(!hub.cfgDraft){
      const c = cfg();
      hub.cfgDraft = { name:campaignMeta ? campaignMeta.name : '', system:campaignMeta ? campaignMeta.system || '' : '', invMode:c.invMode, invLimit:c.invLimit, decimals:c.decimals, lootMin:c.lootMin, lootMax:c.lootMax,
        weights:Object.assign({}, c.weights), espMode:c.espMode, modules:Object.assign({}, c.modules), cardModules:Object.assign({}, c.cardModules), progressionMode:c.progressionMode,
        placeCats:Object.assign({}, c.places.cats), placeReveal:c.places.reveal };
    }
    const d = hub.cfgDraft;
    const cats = Array.from(new Set(ITEMS.map(i => i.category))).sort();
    const modLabels = { card:['Ficha leve', 'Ficha de cada personagem'], clock:['Relógio da campanha', 'Hora e data do mundo'], needs:['Necessidades', 'Fome, sede, frio, sono'], explore:['Exploração dos locais', 'Reserva de saque por pin'], crafting:['Ofício', 'Receitas e produção'], places:['Lugares reais', 'Pontos do OpenStreetMap'] };
    if(!PLACES_ON) delete modLabels.places;   // interruptor geral desligado: a opção nem aparece (o valor salvo na campanha não é mexido)
    const joinRow = `<div class="mx-join"><input type="text" data-bind="hub.joinCode" value="${esc(hub.joinCode)}" placeholder="Código de convite" aria-label="Código de convite" maxlength="6" autocapitalize="characters"><button type="button" class="mx-go" data-act="camp-join">Entrar</button></div>`;
    const novaBody = `<div class="mx-grid">${mxF('Nome', `<input type="text" data-bind="nc.name" value="${esc(nc.name)}" placeholder="Nome" maxlength="60">`)}${mxF('Sistema', `<input type="text" data-bind="nc.system" value="${esc(nc.system)}" placeholder="Opcional" maxlength="80">`)}</div>
      ${mxF('Começar com', `<select data-bind="nc.mode" data-rerender>${opt('vazia', 'Vazia', nc.mode)}${opt('modelo', 'Modelo', nc.mode)}${opt('duplicar', 'Duplicar', nc.mode)}</select>`, '', 'div')}
      ${nc.mode !== 'vazia' ? mxF('Copiar de', `<select data-bind="nc.source" data-nochips>${list.map(m => opt(m.id, m.name, nc.source)).join('')}</select>`, '', 'div') : ''}
      ${nc.mode === 'duplicar' ? `<div class="mx-picks">${['copyTokens:Tokens', 'copyInv:Inventários', 'copyChars:Fichas', 'copyRecipes:Receitas', 'copyWeather:Clima'].map(x => { const [k, l] = x.split(':'); return mxPick(l, `data-bind="nc.${k}"`, nc[k]); }).join('')}</div>` : ''}
      <button type="button" class="mx-go" data-act="camp-create">Criar campanha</button>`;
    const cfgBody = `<div class="mx-grid">${mxF('Nome', `<input type="text" data-bind="cd.name" value="${esc(d.name)}" placeholder="Nome" maxlength="60">`)}${mxF('Sistema', `<input type="text" data-bind="cd.system" value="${esc(d.system)}" placeholder="Opcional" maxlength="80">`)}</div>
      ${mxF('Progressão', `<select data-bind="cd.progressionMode" aria-label="Progressão do personagem">${opt('nex_level', 'NEX + Nível', d.progressionMode)}${opt('nex_only', 'Só NEX', d.progressionMode)}</select>`, '', 'div')}
      <div class="mx-gt">Módulos</div>
      <div class="mx-list">${Object.keys(modLabels).map(k => mxTog(modLabels[k][0], modLabels[k][1], `data-bind="cd.modules.${k}"${k === 'places' ? ' data-rerender' : ''}`, d.modules[k])).join('')}</div>
      ${PLACES_ON && d.modules.places ? `<div class="mx-gt">Lugares reais</div>
        <div class="mx-picks">${PLACE_CATS.map(pc => mxPick(esc(pc.label), `data-bind="cd.placeCats.${pc.id}"`, d.placeCats[pc.id] !== false)).join('')}</div>
        ${mxF('Quando aparecem', `<select id="cd-place-reveal" data-bind="cd.placeReveal">${opt('all', 'Sempre', d.placeReveal)}${opt('near', 'Perto de um token', d.placeReveal)}</select>`, '', 'div')}
        <button type="button" class="mx-ghost" data-act="pl-test">Testar conexão com o OpenStreetMap</button>
        <div id="pl-test-out" class="mx-note pl-test-out" role="status" aria-live="polite"></div>` : ''}
      <div class="mx-gt">Partes da ficha</div>
      <div class="mx-picks">${[['identity', 'Identidade'], ['skills', 'Perícias'], ['notes', 'Anotações'], ['equip', 'Equipamento']].map(x => mxPick(x[1], `data-bind="cd.cardModules.${x[0]}"`, d.cardModules[x[0]])).join('')}</div>
      <div class="mx-gt">Inventário</div>
      ${mxF('Limite', `<select data-bind="cd.invMode" data-rerender>${opt('slots', 'Por itens', d.invMode)}${opt('carga', 'Por peso', d.invMode)}${opt('livre', 'Sem limite', d.invMode)}</select>`, '', 'div')}
      ${d.invMode !== 'livre' ? mxF(d.invMode === 'slots' ? 'Máximo de itens' : 'Capacidade de carga', `<input type="number" min="1" data-bind="cd.invLimit" value="${esc(d.invLimit)}">`) : ''}
      ${d.invMode === 'carga' ? mxTog('Usar o volume de cada item', d.espMode ? 'Volume 0 conta 0,25; os demais contam o próprio número.' : '', 'data-bind="cd.espMode" data-rerender', d.espMode) + (d.espMode ? '' : `<div class="mx-fl">Peso por categoria</div><div class="mx-grid">${cats.map(c => mxF(esc(c), `<input type="number" step="0.1" min="0" data-bind="cd.weights.${esc(catKey(c))}" value="${esc(d.weights[catKey(c)] != null ? d.weights[catKey(c)] : 1)}">`)).join('')}</div>`) : ''}
      <div class="mx-gt">Saque</div>
      <div class="mx-grid">${mxF('Mín. por busca', `<input type="number" min="0" max="8" data-bind="cd.lootMin" value="${esc(d.lootMin)}">`)}${mxF('Máx. por busca', `<input type="number" min="1" max="8" data-bind="cd.lootMax" value="${esc(d.lootMax)}">`)}${mxF('Casas decimais', `<input type="number" min="0" max="6" data-bind="cd.decimals" value="${esc(d.decimals)}">`)}</div>
      <div class="mx-save"><button type="button" class="mx-go" data-act="cfg-save">Salvar configuração</button></div>`;
    return `<div class="mx">${act.map(row).join('') || '<div class="mx-empty"><b>Nenhuma campanha</b></div>'}
      ${isUnclaimed() && firebaseReady ? '<button type="button" class="mx-go" data-act="claim">Assumir como mestre</button>' : ''}
      ${joinRow}
      ${arch.length ? mxSec('c-arch', 'Arquivadas', arch.length, arch.map(row).join(''), false) : ''}
      ${master ? mxSec('c-new', 'Nova campanha', '', novaBody, false) + mxSec('c-cfg', 'Configurar esta campanha', '', cfgBody, false).replace('<section ', '<section id="cfg-anchor" ') : '<p class="mx-note">Só o mestre cria campanhas e altera a configuração.</p>'}</div>`;
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

  // ---------- gaveta de personagens: gravação (a lógica dos planos está em tv-gaveta.js) ----------
  const rosterCol = e => (e.kind === 'npc' ? KEY_GMROSTER : KEY_ROSTER);
  const rosterAll = () => Object.keys(roster).map(k => roster[k]).concat(Object.keys(gmRoster).map(k => gmRoster[k])).filter(Boolean);
  function rosterCanEdit(e){
    return isMaster() || (e.kind === 'pc' && (!e.ownerId || (!!currentUser && e.ownerId === currentUser.uid)));
  }
  async function rosterSave(e){
    if(!e || !e.id) return false;
    if(e.kind === 'npc' && !isMaster()){ toast('Só o mestre guarda NPCs na gaveta.', true); return false; }
    if(!rosterCanEdit(e)){ toast('Só o dono do personagem (ou o mestre) altera esta entrada.', true); return false; }
    const col = rosterCol(e);
    (col === KEY_GMROSTER ? gmRoster : roster)[e.id] = e;
    const ok = await DB.set(scopedKey(col) + '/' + e.id, JSON.parse(JSON.stringify(e)));
    if(!ok) toast(dbFailMsg('A gaveta'), true);
    rosterChanged();
    return ok;
  }
  async function rosterDelete(id){
    const e = roster[id] || gmRoster[id]; if(!e) return false;
    if(!rosterCanEdit(e)){ toast('Só o dono do personagem (ou o mestre) apaga esta entrada.', true); return false; }
    const col = rosterCol(e);
    delete (col === KEY_GMROSTER ? gmRoster : roster)[id];
    const ok = await DB.set(scopedKey(col) + '/' + id, null);
    if(!ok) toast(dbFailMsg('A gaveta'), true);
    rosterChanged();
    return ok;
  }
  // Aplica os "writes" de TVGaveta (caminhos lógicos). tokens e pins são vetores salvos inteiros; ficha e mochila são nós.
  // Com Firebase vai tudo em uma única gravação multi-caminho (colocar ou guardar nunca fica pela metade).
  async function rosterApply(writes, entrada){
    let tk = tokens, pn = pins, tkCh = false, pnCh = false;
    const chars = {}, invs = {};
    Object.keys(writes).forEach(path => {
      const i = path.indexOf('/'), col = path.slice(0, i), id = path.slice(i + 1), v = writes[path];
      if(col === 'tokens'){ tk = tk.filter(x => x.id !== id).concat(v ? [v] : []); tkCh = true; }
      else if(col === 'pins'){ pn = pn.filter(x => x.id !== id).concat(v ? [v] : []); pnCh = true; }
      else if(col === 'characters') chars[id] = v;
      else if(col === 'inventories') invs[id] = v;
    });
    if(tkCh) tokens = tk;
    if(pnCh) pins = pn;
    Object.keys(chars).forEach(id => { if(chars[id] === null) delete characters[id]; else characters[id] = chars[id]; });
    Object.keys(invs).forEach(id => { if(invs[id] === null) delete inventories[id]; else inventories[id] = invs[id]; });
    const upd = {};
    Object.keys(chars).forEach(id => { upd[scopedKey(KEY_CHARS) + '/' + id] = chars[id]; });
    if(entrada){ (entrada.kind === 'npc' ? gmRoster : roster)[entrada.id] = entrada; upd[scopedKey(rosterCol(entrada)) + '/' + entrada.id] = entrada; }
    let ok = true;
    if(firebaseReady){
      if(tkCh) upd[scopedKey(KEY_TOKENS)] = tokens;
      if(pnCh) upd[scopedKey(KEY_PINS)] = pins;
      Object.keys(invs).forEach(id => { upd[scopedKey(KEY_INV) + '/' + id] = invs[id]; });
      ok = await DB.update(JSON.parse(JSON.stringify(upd)));
    } else {
      const jobs = [DB.update(JSON.parse(JSON.stringify(upd)))];
      if(tkCh) jobs.push(saveKey(KEY_TOKENS, tokens));
      if(pnCh) jobs.push(saveKey(KEY_PINS, pins));
      if(Object.keys(invs).length) jobs.push(saveKey(KEY_INV, inventories));
      ok = (await Promise.all(jobs)).every(r => r !== false);
    }
    if(!ok) toast(dbFailMsg('A gaveta'), true);
    if(tkCh) renderTokens();
    if(pnCh) renderPins();
    if(Object.keys(invs).length) onInvChanged();
    hubChanged(); rosterChanged();
    return ok;
  }
  window.__tvRoster = { get roster(){ return roster; }, get gmRoster(){ return gmRoster; }, save:rosterSave, del:rosterDelete, apply:rosterApply, syncGmFor, backup:buildBackup };   // só para os testes automáticos

  // ---------- gaveta de personagens: tela ----------
  var rosterUI = { ready:false, open:false, aba:'todos', filtro:'', form:null, placing:null, t:0 };   // var: lido antes de este módulo existir
  const ROSTER_COLORS = ['', '#e5484d', '#f5a524', '#f2d03b', '#46c25f', '#2fb6c7', '#4c8dff', '#a566ff', '#ff6fb1'];
  const rsEl = id => document.getElementById(id);
  const rosterUid = () => (currentUser ? currentUser.uid : null);
  const rosterNamesOnMap = () => tokens.map(t => t.label || 'Token').concat(pins.filter(p => p.type === 'npc').map(p => p.title || 'NPC'));
  // ficha inicial de quem nasce na gaveta (Ordem Paranormal, igual à de uma ficha migrada)
  function rosterStarterCard(name){
    return { tokenId:'', name, player:'', notes:'', reminders:[], skills:[], needs:{}, systemId:'ordem',
      attributes:{ agi:1, for:1, int:1, pre:1, vig:1 }, meta:{ class:'', origin:'' }, nex:5, level:1, skillsV2:{},
      resources2:{ pv:{ cur:0, max:0 }, pd:{ cur:0, max:0 } }, attacks:[], conditions:[] };
  }
  // quem já está no mapa sem passar pela gaveta aparece como "No mapa" (virtual: só vira entrada quando você guarda)
  function rosterDerived(){
    const ref = {}; rosterAll().forEach(e => { if(e.onMap) ref[e.onMap] = 1; });
    const master = isMaster(), uid = rosterUid(), out = [];
    tokens.forEach(t => {
      if(ref[t.id] || (!master && !(uid && t.ownerId === uid))) return;
      out.push({ id:t.id, kind:'pc', name:String(t.label || 'Token'), color:t.color || '', ownerId:t.ownerId || null, ownerName:t.ownerName || null, tpl:false, card:{}, inv:{}, onMap:t.id, derived:true, createdAt:0, updatedAt:0 });
    });
    if(master) pins.forEach(p => {
      if(p.type !== 'npc' || ref[p.id]) return;
      out.push({ id:p.id, kind:'npc', name:String(p.title || 'NPC'), ownerId:null, ownerName:null, tpl:false, card:{}, inv:{}, onMap:p.id, derived:true, createdAt:0, updatedAt:0 });
    });
    return out;
  }
  const rosterFind = id => roster[id] || gmRoster[id] || rosterDerived().find(e => e.id === id) || null;
  // o que vale agora: no mapa, a ficha e a mochila ao vivo; guardado, o que a entrada tem
  function rosterLive(e){
    const id = e.onMap, real = !!id && (e.kind === 'pc' ? tokens.some(t => t.id === id) : pins.some(p => p.id === id));
    return { onMap:real, card:(id && characters[id]) || e.card || {}, inv:(id && inventories[id]) || e.inv || {} };
  }
  function rosterWeaponTxt(inv){
    const w = Object.keys(inv || {}).filter(isItemKey).map(k => inv[k])
      .filter(i => i && typeof i === 'object' && WEAPON_SLOTS.indexOf(i.slot) !== -1 && TVArmas.ehArma(i.category))
      .sort((a, b) => WEAPON_SLOTS.indexOf(a.slot) - WEAPON_SLOTS.indexOf(b.slot))[0];
    if(!w) return '';
    return w.name + (TVArmas.usaMunicao(ITEMS_BY_ID[w.itemId]) ? ' ' + magOf(w) + '/' + magCap(w) : '');
  }
  function rosterCardHtml(e){
    const lv = rosterLive(e), onMap = lv.onMap, canEd = e.derived ? (isMaster() || (e.kind === 'pc' && !!rosterUid() && e.ownerId === rosterUid())) : rosterCanEdit(e);
    const pv = opRes(lv.card, 'pv'), wtxt = rosterWeaponTxt(lv.inv), n = Object.keys(lv.inv || {}).filter(isItemKey).length;
    const meta = [pv.max > 0 ? `PV <b data-pulse="rs-pv:${esc(e.id)}">${pv.cur}/${pv.max}</b>` : '', wtxt ? `<span data-pulse="rs-w:${esc(e.id)}">${esc(wtxt)}</span>` : '', n ? n + (n === 1 ? ' item' : ' itens') : ''].filter(Boolean).join('<span class="rs-sep">·</span>');
    const tags = (onMap ? '<span class="rs-tag on">No mapa</span>' : '<span class="rs-tag">Na gaveta</span>') + (e.tpl ? '<span class="rs-tag tpl" title="Cada vez que vai ao mapa, vira uma cópia nova">Modelo</span>' : '');
    const dis = !canEd ? ' disabled' : '';
    const prim = onMap
      ? `<button type="button" class="inv-mini-btn" data-roster="ir">${ic('map', 16)} Ir</button><button type="button" class="inv-mini-btn primary" data-roster="guardar"${dis}>Guardar</button>`
      : `<button type="button" class="inv-mini-btn primary" data-roster="colocar"${dis}>${ic('map', 16)} Colocar</button><button type="button" class="inv-mini-btn" data-roster="centro"${dis}>No centro</button>`;
    const sec = e.derived
      ? `<button type="button" class="inv-mini-btn" data-roster="ficha">Ficha</button><button type="button" class="inv-mini-btn" data-roster="mochila">Mochila</button>`
      : `<button type="button" class="inv-mini-btn" data-roster="ficha"${onMap ? '' : ' disabled'}>Ficha</button><button type="button" class="inv-mini-btn" data-roster="mochila"${onMap ? '' : ' disabled'}>Mochila</button>
         <button type="button" class="inv-mini-btn rs-sw${e.tpl ? ' on' : ''}" role="switch" aria-checked="${!!e.tpl}" data-roster="modelo" title="Ligado: cada vez que vai ao mapa, vira uma cópia nova. Desligado: é o mesmo personagem que sai e volta."${onMap || !canEd ? ' disabled' : ''}>Modelo</button>
         <button type="button" class="inv-mini-btn" data-roster="duplicar"${onMap || !canEd ? ' disabled' : ''}>Duplicar</button>
         <button type="button" class="inv-mini-btn" data-roster="editar"${onMap || !canEd ? ' disabled' : ''}>Editar</button>
         <button type="button" class="inv-mini-btn danger" data-roster="excluir"${canEd ? '' : ' disabled'}>Excluir</button>`;
    return `<article class="rs-card${onMap ? ' on-map' : ''}" data-id="${esc(e.id)}"><div class="rs-main"><span class="rs-dot" style="--c:${esc(e.color || (e.kind === 'npc' ? 'var(--hazard)' : '#ffffff'))}"></span>
      <div class="rs-info"><b class="rs-name">${esc(e.name)}</b>${meta ? `<div class="rs-meta">${meta}</div>` : ''}<div class="rs-tags">${tags}</div></div></div>
      <div class="rs-acts">${prim}</div><div class="rs-sub">${sec}</div></article>`;
  }
  function rosterFormHtml(f){
    const master = isMaster();
    const colors = f.kind === 'pc' ? `<div class="rs-colors" role="radiogroup" aria-label="Cor do token">${ROSTER_COLORS.map(c => `<button type="button" class="rs-sw-color${(f.color || '') === c ? ' on' : ''}" role="radio" aria-checked="${(f.color || '') === c}" data-roster="cor" data-c="${c}" style="--c:${c || '#ffffff'}" aria-label="${c ? 'Cor ' + c : 'Cor padrão'}"></button>`).join('')}</div>` : '';
    return `<div class="rs-form-box"><b class="rs-form-title">${f.mode === 'edit' ? 'Editar' : 'Novo personagem'}</b>
      <label class="rs-lab">Nome<input type="text" id="rs-name" maxlength="40" autocomplete="off" value="${esc(f.name || '')}" placeholder="${f.kind === 'npc' ? 'Ex.: Zumbi, Cultista' : 'Nome do personagem'}"></label>
      ${master && f.mode !== 'edit' ? `<label class="rs-lab">Tipo<select id="rs-kind"><option value="pc"${f.kind === 'pc' ? ' selected' : ''}>Personagem de jogador</option><option value="npc"${f.kind === 'npc' ? ' selected' : ''}>NPC do mestre</option></select></label>` : ''}
      ${colors}
      ${f.mode === 'edit' ? '' : `<label class="check-row"><input type="checkbox" id="rs-tpl"${f.tpl ? ' checked' : ''}> Modelo: cada vez que for ao mapa, vira uma cópia nova (bom para vários zumbis)</label>`}
      <div class="inv-item-actions"><button type="button" class="inv-mini-btn primary" data-roster="${f.mode === 'edit' ? 'salvar' : 'criar'}">${f.mode === 'edit' ? 'Salvar' : 'Criar na gaveta'}</button><button type="button" class="inv-mini-btn" data-roster="cancelar">Cancelar</button></div></div>`;
  }
  function rosterRender(){
    if(!rosterUI || !rosterUI.ready || !rosterUI.open) return;
    const master = isMaster(), abas = TVGaveta.abas(master);
    if(!abas.some(a => a[0] === rosterUI.aba)) rosterUI.aba = abas[0][0];
    const tabsEl = rsEl('rs-tabs');
    tabsEl.hidden = abas.length < 2;
    tabsEl.innerHTML = abas.map(a => `<button type="button" role="tab" class="rs-tab${a[0] === rosterUI.aba ? ' on' : ''}" aria-selected="${a[0] === rosterUI.aba}" data-roster-tab="${a[0]}">${a[1]}</button>`).join('');
    tabInd(tabsEl);
    const q = String(rosterUI.filtro || '').trim().toLowerCase(), ok = e => !q || String(e.name).toLowerCase().indexOf(q) !== -1;
    const stored = TVGaveta.visiveis({ master, uid:rosterUid(), aba:rosterUI.aba }, roster, gmRoster).filter(ok);
    const der = rosterDerived().filter(e => ok(e) && (rosterUI.aba !== 'npcs' || e.kind === 'npc')).sort((a, b) => String(a.name).localeCompare(String(b.name), 'pt-BR', { sensitivity:'base' }));
    const CAP = 60, shown = der.slice(0, CAP);
    let html = stored.map(rosterCardHtml).join('');
    if(shown.length) html += `<div class="rs-label">Já no mapa (${der.length})</div>` + shown.map(rosterCardHtml).join('') + (der.length > CAP ? `<p class="hub-hint">Mostrando ${CAP} de ${der.length}. Use a busca para achar os outros.</p>` : '');
    if(!html) html = `<div class="inv-empty">${q ? 'Nenhum personagem com esse nome.' : (master ? 'A gaveta está vazia. Toque em Novo para criar um personagem ou NPC e deixá-lo guardado.' : 'Você ainda não guardou nenhum personagem. Toque em Novo para criar o seu.')}</div>`;
    const list = rsEl('rs-list'), st = list.scrollTop;
    list.innerHTML = html; list.scrollTop = st;
    pulseScan(list);
  }
  function rosterChanged(){
    if(!rosterUI || !rosterUI.ready || !rosterUI.open || rosterUI.t) return;
    rosterUI.t = setTimeout(() => { rosterUI.t = 0; rosterRender(); }, 60);   // junta várias mudanças seguidas num só desenho
  }
  function rosterFormShow(f){
    rosterUI.form = f;
    const box = rsEl('rs-form');
    if(!f){ box.hidden = true; box.innerHTML = ''; return; }
    box.innerHTML = rosterFormHtml(f); box.hidden = false;
    const nm = rsEl('rs-name'); if(nm){ nm.focus(); nm.select(); }
  }
  function openRoster(){
    hudCloseSheets(); closeHub(); closeDrawer(); closeNavDrawer(); closeInventory();
    clearModes();
    rosterUI.open = true; rosterUI.form = null; rosterUI.filtro = ''; rsEl('rs-filter').value = ''; rosterFormShow(null);
    rosterRender();
    rosterDrawer.classList.add('open'); rosterBackdrop.classList.add('open');
    stagger(rosterDrawer.querySelector('.drawer-body'));
    guiaOferecer('gaveta');
  }
  function closeRoster(keepPlacing){
    if(!rosterUI) return;
    if(!keepPlacing && rosterUI.placing){ rosterSetPlacing(null); hideDrawHint(); }
    if(!rosterUI.open) return;
    rosterUI.open = false;
    rosterDrawer.classList.remove('open'); rosterBackdrop.classList.remove('open');
  }
  async function rosterPlace(e0, pos){
    let e = e0;
    if(!e || e.derived) return false;
    const lv = rosterLive(e);
    if(e.onMap && !lv.onMap) e = Object.assign({}, e, { onMap:null, card:lv.card, inv:lv.inv });   // o objeto sumiu do mapa: vale o que sobrou dele
    if(!e.tpl && e.onMap){ toast(e.name + ' já está no mapa.', true); return false; }
    let plano;
    try{ plano = TVGaveta.planoColocar(e, { pos:{ lat:pos.lat, lng:pos.lng }, novoId:newId, nomesNoMapa:rosterNamesOnMap(), agora:Date.now() }); }
    catch(err){ toast(err.message, true); return false; }
    const ok = await rosterApply(plano.writes, e.tpl ? null : plano.entradaDepois);
    if(ok){ const o = plano.writes[(e.kind === 'pc' ? 'tokens/' : 'pins/') + plano.idNoMapa]; toast((o.label || o.title) + ' foi para o mapa.'); }
    return ok;
  }
  async function rosterStore(e){
    if(!e || !e.onMap) return false;
    if(e.tpl){ toast('Modelo não volta para a gaveta: cada cópia no mapa é independente.', true); return false; }
    const lv = rosterLive(e), obj = e.kind === 'pc' ? tokens.find(t => t.id === e.onMap) : pins.find(p => p.id === e.onMap);
    const holder = obj ? { name:(e.kind === 'pc' ? obj.label : obj.title) || e.name, color:obj.color || '' } : {};
    let plano;
    try{ plano = TVGaveta.planoGuardar(e, { holder, card:lv.card, inv:lv.inv, agora:Date.now() }); }
    catch(err){ toast(err.message, true); return false; }
    const depois = plano.entradaDepois; delete depois.derived; if(!depois.createdAt) depois.createdAt = depois.updatedAt;
    const ok = await rosterApply(plano.writes, depois);
    if(ok) toast(depois.name + ' foi para a gaveta com a ficha e a mochila.');
    return ok;
  }
  async function rosterCreate(){
    const f = rosterUI.form, master = isMaster();
    if(!f) return;
    if(!master && firebaseReady && !rosterUid()){ toast('Entre na sua conta para guardar personagens na gaveta.', true); return; }
    const kind = master && rsEl('rs-kind') ? rsEl('rs-kind').value : 'pc';
    const e = TVGaveta.nova({ kind, name:rsEl('rs-name').value, tpl:rsEl('rs-tpl').checked, color:kind === 'pc' ? f.color : '', ownerId:rosterUid() }, { novoId:newId, agora:Date.now() });
    e.ownerName = ownerFields().ownerName || null;
    e.card = rosterStarterCard(e.name);
    if(await rosterSave(e)){ rosterFormShow(null); rosterRender(); toast(e.name + ' está na gaveta.'); }
  }
  // enquanto "Colocar" espera o toque, marcadores e formas ficam transparentes ao toque: qualquer ponto do mapa serve
  function rosterSetPlacing(id){ rosterUI.placing = id || null; document.body.classList.toggle('roster-placing', !!id); }
  function rosterPlaceMode(e){
    clearModes();
    rosterSetPlacing(e.id); closeRoster(true);
    showDrawHint('Toque no mapa para colocar <b>' + esc(e.name) + '</b>. Esc cancela.');
  }
  rsEl('roster-drawer').addEventListener('click', async ev => {
    const tb = ev.target.closest('[data-roster-tab]');
    if(tb){ rosterUI.aba = tb.dataset.rosterTab; rosterRender(); return; }
    const b = ev.target.closest('[data-roster]'); if(!b || b.disabled) return;
    const act = b.dataset.roster, cardEl = b.closest('.rs-card'), id = cardEl ? cardEl.dataset.id : null, e = id ? rosterFind(id) : null;
    if(act === 'novo'){ const m = isMaster(); rosterFormShow({ mode:'new', kind:'pc', name:'', color:'', tpl:false }); if(!m) rsEl('rs-name').focus(); }
    else if(act === 'cancelar') rosterFormShow(null);
    else if(act === 'criar') await rosterCreate();
    else if(act === 'cor'){ const f = rosterUI.form; if(f){ f.color = b.dataset.c || ''; rsEl('rs-form').querySelectorAll('.rs-sw-color').forEach(x => { const on = x === b; x.classList.toggle('on', on); x.setAttribute('aria-checked', String(on)); }); } }
    else if(act === 'salvar'){
      const f = rosterUI.form, cur = f && rosterFind(f.id); if(!cur) return;
      const nome = rsEl('rs-name').value.trim() || cur.name;
      const upd = Object.assign({}, cur, { name:nome, updatedAt:Date.now() }); if(cur.kind === 'pc') upd.color = f.color || '';
      if(!upd.color) delete upd.color;
      if(await rosterSave(upd)){ rosterFormShow(null); rosterRender(); }
    }
    else if(!e) return;
    else if(act === 'colocar') rosterPlaceMode(e);
    else if(act === 'centro') await rosterPlace(e, map.getCenter());
    else if(act === 'guardar') await rosterStore(e);
    else if(act === 'ir'){ const o = e.kind === 'pc' ? tokens.find(t => t.id === e.onMap) : pins.find(p => p.id === e.onMap); if(!o){ toast('Não achei este personagem no mapa.', true); return; } closeRoster(); map.flyTo([o.lat, o.lng], Math.max(map.getZoom(), 16)); }
    else if(act === 'ficha'){ if(!rosterLive(e).onMap){ toast('Coloque o personagem no mapa para abrir a ficha.', true); return; } closeRoster(); hudSetWho(e.onMap); f23ShowFicha(); }
    else if(act === 'mochila'){ if(!rosterLive(e).onMap){ toast('Coloque o personagem no mapa para abrir a mochila.', true); return; } openInventory(e.onMap); }
    else if(act === 'modelo') await rosterSave(Object.assign({}, e, { tpl:!e.tpl, updatedAt:Date.now() }));
    else if(act === 'duplicar'){
      const nomes = rosterAll().map(x => x.name), cp = TVGaveta.duplicar(e, { novoId:newId, nomes, agora:Date.now() });
      if(await rosterSave(cp)) toast(cp.name + ' criado na gaveta.');
    }
    else if(act === 'editar') rosterFormShow({ mode:'edit', id:e.id, kind:e.kind, name:e.name, color:e.color || '' });
    else if(act === 'excluir'){
      const onMap = rosterLive(e).onMap;
      if(!window.confirm(`Excluir "${e.name}" da gaveta?` + (onMap ? ' O token que está no mapa continua lá.' : ' A ficha e a mochila guardadas serão apagadas.'))) return;
      if(await rosterDelete(e.id)) rosterRender();
    }
  });
  rsEl('rs-filter').addEventListener('input', ev => { rosterUI.filtro = ev.target.value; rosterRender(); });
  rsEl('roster-drawer').addEventListener('change', ev => {
    if(ev.target.id !== 'rs-kind') return;
    const f = rosterUI.form; if(!f) return;
    f.kind = ev.target.value; f.tpl = f.kind === 'npc'; f.name = rsEl('rs-name').value;
    rosterFormShow(f);
    rsEl('rs-kind').value = f.kind; rsEl('rs-tpl').checked = f.tpl;
  });
  rsEl('roster-drawer').addEventListener('keydown', ev => { if(ev.key === 'Enter' && ev.target.id === 'rs-name'){ ev.preventDefault(); const b = rsEl('roster-drawer').querySelector('[data-roster="criar"], [data-roster="salvar"]'); if(b) b.click(); } });
  rsEl('roster-drawer-close-btn').addEventListener('click', () => closeRoster());
  rosterBackdrop.addEventListener('click', () => closeRoster());
  document.addEventListener('keydown', ev => {
    if(ev.key !== 'Escape') return;
    if(rosterUI.placing){ clearModes(); return; }
    if(rosterUI.open) closeRoster();
  });
  // toque no mapa enquanto "Colocar" está ativo
  function rosterMapTap(latlng){
    const id = rosterUI.placing; rosterSetPlacing(null); hideDrawHint();
    const e = rosterFind(id); if(e) rosterPlace(e, latlng);
  }
  window.__tvRoster = Object.assign(window.__tvRoster || {}, {
    view:(master, uid, aba) => TVGaveta.visiveis({ master, uid, aba:aba || 'todos' }, roster, gmRoster),
    tabs:master => TVGaveta.abas(master) });
  rosterUI.ready = true;

  // ---------- diário, grupo, mundo e área do mestre ----------
  const DJ_TYPES = [['resumo','Resumo'],['pista','Pista'],['decisao','Decisão'],['objetivo','Objetivo'],['nota','Nota'],['evento','Evento']];
  const OBJ_STATES = [['aberto','Aberto'],['cumprido','Cumprido'],['falhou','Falhou']];
  const TIMELINE_ACTIONS = new Set(['vasculhar','pegar','depositar','troca','craft','inv_removido','reparar','ajuste']);
  function syncGm(){ syncGmFor(isMaster() && (!firebaseReady || !!currentUser)); }
  // coleções privadas do mestre (diário, tokens ocultos, NPCs da gaveta): para quem não é mestre nem existe ouvinte
  function syncGmFor(master){
    if(gmOff){ gmOff(); gmOff = null; }
    gmJournal = {};
    if(master) gmOff = DB.on(scopedKey(KEY_GMJ), v => { gmJournal = v || {}; hubChanged(); hudFeedChanged(); }, 300);
    if(tacGmOff){ tacGmOff(); tacGmOff = null; }
    gmTac = {};
    if(master) tacGmOff = DB.on(scopedKey(KEY_GMTAC), v => { gmTac = v || {}; tacChanged(); });
    if(gmRosterOff){ gmRosterOff(); gmRosterOff = null; }
    gmRoster = {};
    if(master) gmRosterOff = DB.on(scopedKey(KEY_GMROSTER), v => { gmRoster = v || {}; rosterChanged(); });
    rosterChanged();
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
    const c = cfg(), g = hub.give, pins2 = pins.filter(p => p.type !== 'npc' && p.type !== 'lugar');
    if(!g.to || !holderById(g.to)) g.to = (allHolders()[0] || {}).id || '';
    if(!hub.resDraft) hub.resDraft = c.resources.map(r => Object.assign({}, r));
    if(!hub.slotDraft) hub.slotDraft = Object.assign({}, c.equipSlots);
    const locOpts = cc => opt('', 'Abastecer à mão', cc.locKey || '') + LOC_ORDER.map(k => opt(k, LOC_NAMES[k], cc.locKey || '')).join('');
    let nCont = 0;
    const cont = pins2.map(p => {
      const eff = pinCC(p), cc = eff || p.container || {}, on = !!eff; if(on) nCont++;
      const ttl = esc(p.title || 'Pin');
      return `<div class="mx-ct${on ? ' on' : ''}">
        ${mxTog(ttl, on ? esc(CONT_STATE_LABELS[containerState(p.id)] || '—') + ' · ' + invCount(p.id) + ' item(ns)' + (eff && eff.auto ? ' · pelo tipo do pin' : '') : 'Não é contêiner', `data-ctn="${esc(p.id)}" data-f="enabled" aria-label="Contêiner: ${ttl}"`, on)}
        ${on ? `<div class="mx-grid">${mxF('Tabela de saque', `<select data-ctn="${esc(p.id)}" data-f="locKey" data-nochips>${locOpts(cc)}</select>`, 'full', 'div')}
          ${mxF('Mín. de itens', `<input type="number" min="0" max="8" data-ctn="${esc(p.id)}" data-f="min" value="${cc.min != null ? esc(cc.min) : 1}">`)}${mxF('Máx. de itens', `<input type="number" min="1" max="8" data-ctn="${esc(p.id)}" data-f="max" value="${cc.max != null ? esc(cc.max) : 3}">`)}
          ${mxF('Capacidade', `<input type="number" min="1" data-ctn="${esc(p.id)}" data-f="cap" value="${cc.cap || ''}" placeholder="Sem limite">`)}${mxF('Acesso', `<select data-ctn="${esc(p.id)}" data-f="access">${opt('aberto', 'Aberto', cc.access || 'aberto')}${opt('bloqueado', 'Só o mestre', cc.access || 'aberto')}</select>`, '', 'div')}</div>
          <div class="mx-acts"><button type="button" class="mx-ghost" data-act="open-inv" data-id="${esc(p.id)}">Abrir</button><button type="button" class="mx-ghost" data-act="pin-go" data-id="${esc(p.id)}">Ver no mapa</button></div>` : ''}</div>`;
    }).join('');
    const toks = holderList().filter(h => h.type === 'token');
    const giveCard = `<div class="mx-card mx-give"><h3 class="mx-h">Entregar item</h3>
      <datalist id="item-names">${ITEMS.map(i => `<option value="${esc(i.name)}">`).join('')}</datalist>
      <input type="text" list="item-names" data-bind="gv.name" value="${esc(g.name)}" placeholder="Nome do item" aria-label="Item do catálogo" autocomplete="off">
      <div class="mx-row"><input type="number" min="1" class="qty-in" data-bind="gv.qty" data-num value="${esc(g.qty)}" aria-label="Quantidade"><select data-bind="gv.to" data-nochips aria-label="Destino">${allHolders().map(h => opt(h.id, (h.type === 'container' ? 'Contêiner · ' : h.type === 'npc' ? 'NPC · ' : '') + h.name, g.to)).join('')}</select></div>
      <button type="button" class="mx-go" data-act="give">Entregar</button></div>`;
    const resBody = hub.resDraft.map((r, i) => `<div class="mx-row"><input type="text" data-bind="rs.${i}.label" value="${esc(r.label)}" placeholder="Nome" aria-label="Nome do recurso" maxlength="20"><input type="number" min="0" class="qty-in" data-bind="rs.${i}.max" data-num value="${esc(r.max || '')}" placeholder="Máx." aria-label="Máximo"><button type="button" class="mx-ico" data-act="res-del" data-i="${i}" aria-label="Remover recurso">${ic('close', 16)}</button></div>`).join('')
      + `<div class="mx-acts"><button type="button" class="mx-ghost" data-act="res-add">${ic('plus', 16)} Recurso</button><button type="button" class="mx-go" data-act="res-save">Salvar</button></div>`;
    const slotsBody = `<div class="mx-grid">${EQUIP_SLOTS.map(s => mxF(esc(s[1]), `<input type="number" min="0" max="9" data-bind="sl.${s[0]}" data-num value="${esc(hub.slotDraft[s[0]])}">`)).join('')}</div>
      <button type="button" class="mx-go" data-act="slots-save">Salvar espaços</button>`;
    const needsBody = `${mxF('Necessidade', `<select data-bind="hub.bulkNeed">${NEED_LIST.map(n => opt(n[0], n[1], hub.bulkNeed)).join('')}</select>`, '', 'div')}
      ${mxF('Ajuste', `<select data-bind="hub.bulkDelta" data-num>${opt(1, '+1 · piora', hub.bulkDelta)}${opt(-1, '−1 · melhora', hub.bulkDelta)}</select>`, '', 'div')}
      <div class="mx-fl">Quem é afetado</div>
      <div class="mx-picks">${toks.map(h => mxPick(esc(h.name), `data-act="bulk-pick" data-id="${esc(h.id)}"`, hub.bulkPick.includes(h.id))).join('') || '<span class="mx-sub">Sem tokens.</span>'}</div>
      <button type="button" class="mx-go" data-act="bulk-apply">Aplicar</button>`;
    const backupBody = `<button type="button" class="mx-go" data-act="backup-export">${ic('download', 16)} Exportar backup</button>
      <div class="mx-fl">Restaurar de um arquivo</div>
      <input type="file" accept="application/json,.json" id="backup-file" aria-label="Arquivo de backup">
      <button type="button" class="mx-ghost danger" data-act="backup-import">Restaurar</button>
      <p class="mx-note">Restaurar substitui mapa, inventários, fichas e diário desta campanha. Um backup do estado atual é baixado antes.</p>${hub.backupMsg ? `<p class="mx-note" role="status">${esc(hub.backupMsg)}</p>` : ''}`;
    return `<div class="mx">${giveCard}
      ${mxSec('cont', 'Contêineres', pins2.length ? nCont + ' de ' + pins2.length : '', cont || '<div class="mx-sub">Nenhum pin no mapa.</div>', false)}
      ${mxSec('slots', 'Espaços de equipamento', '', slotsBody, false)}
      ${c.modules.needs ? mxSec('needs', 'Necessidades em grupo', '', needsBody, false) : ''}
      ${c.resources.length ? mxSec('res', 'Recursos extras', c.resources.length, resBody, false) : ''}
      ${mxSec('backup', 'Backup', '', backupBody, false)}</div>`;
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
  const BACKUP_KEYS = [KEY_PINS, KEY_TOKENS, KEY_SHAPES, KEY_ROUTES, KEY_WEATHER, KEY_INV, KEY_LOG, KEY_CHARS, KEY_ROLLS, KEY_RECIPES, KEY_CLOCK, KEY_SHORTCUTS, KEY_JOURNAL, KEY_GMJ, KEY_TAC, KEY_TACIMG, KEY_GMTAC, KEY_SCENE, KEY_ROSTER, KEY_GMROSTER];
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
    if((sh.kind === 'skill' || sh.kind === 'attack' || sh.kind === 'attr') && t0 && t0.dice && t0.dice.length){
      const n = t0.dice.length, at = sh.attr ? ' (' + opAttrLabel(sh.attr) + (sh.val != null ? ' ' + sh.val : '') + ')' : '';
      base = n === 1 ? 'd20' + at + ': ' + t0.value
        : n + 'd20 ' + (sh.keep === 'kl' ? 'menor' : 'maior') + at + ' [' + t0.dice.map(fmtDie).join(', ') + '] → ' + t0.value;
    } else base = fmtTerms(r.terms || []);
    return base + (r.bonuses || []).map(b => ' ' + opBonusTxt(b)).join('') + ' = ' + r.total + (sh.kind === 'attack' && sh.crit ? ' · CRÍTICO!' : '') + (sh.tiros ? ' · Tiros ' + sh.tiros : '');
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
    if(!(extra && extra.kind === 'weather')) TVSound.rolled(termResults, !!(extra && extra.crit));
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
  async function opRollAttack(atkId, tokenId, attrOv, extra){
    const id = tokenId || hub.charToken; if(!opCanEdit(id, 'Só o dono do personagem (ou o mestre) rola por ele.')) return;
    const card = ensureCard(id), atk = opAtk(card, id, atkId); if(!atk) return;
    const ov = opAttrOk(attrOv), p = opParts(card, atk.skill || '', ov || atk.attribute || '', 'attack');
    const t = opD20(p.pool);
    const nat = t.value, margin = Math.min(20, Math.max(2, parseInt(atk.critMargin, 10) || 20));
    const crit = nat >= margin;      // crítico: o d20 que ficou (o maior, ou o menor com atributo 0) caiu dentro da margem
    hub.opCrit = hub.opCrit || {}; hub.opCrit[atkId] = crit;
    await opRecord(id, (atk.name || 'Ataque') + ' · ataque', [t], p.parts.concat(p.conds), Object.assign({ kind:'attack', atk:atkId, crit, nat, attr:p.pool.attr, val:p.pool.val, pool:p.pool.n, keep:p.pool.keep }, extra || {}));
  }
  async function opRollDamage(atkId, tokenId){
    const id = tokenId || hub.charToken; if(!opCanEdit(id, 'Só o dono do personagem (ou o mestre) rola por ele.')) return;
    const card = ensureCard(id), atk = opAtk(card, id, atkId); if(!atk) return;
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
  // ---- armas empunhadas: o ataque é "virtual" (id "w:{uid}"), nada é copiado para card.attacks ----
  function opAtk(card, tokenId, atkId){
    if(String(atkId).indexOf('w:') === 0){
      const uid = String(atkId).slice(2), w = weaponsOf(tokenId).find(x => x.uid === uid);
      return w ? TVArmas.ataque(w, ITEMS_BY_ID[w.itemId]) : undefined;
    }
    return (card.attacks || []).find(x => x.id === atkId);
  }
  // gasta 1 tiro; devolve quantos sobraram ou -1 se não havia. Com Firebase é uma transação (dois toques no último tiro = um ataque);
  // sem Firebase a checagem e a escrita acontecem na mesma tacada síncrona, pelo mesmo efeito.
  async function spendMagN(hid, uid){
    const inst = inventories[hid] && inventories[hid][uid]; if(!inst) return -1;
    if(firebaseReady){
      try{
        const r = await firebaseDb.ref('tau-volantis/' + scopedKey(KEY_INV) + '/' + hid + '/' + uid + '/mag')
          .transaction(cur => cur === null ? null : ((typeof cur === 'number' && cur > 0) ? cur - 1 : undefined));
        const v = r.snapshot.val();
        return (r.committed && typeof v === 'number') ? v : -1;
      }catch(e){ console.error('Falha ao gastar tiro', e); toast('Não foi possível salvar (confira as regras do Firebase).', true); return -1; }
    }
    const cur = magOf(inst); if(cur <= 0) return -1;
    inst.mag = cur - 1;
    await saveKey(KEY_INV, inventories); onInvChanged();
    return inst.mag;
  }
  async function spendMag(hid, uid){ return (await spendMagN(hid, uid)) >= 0; }
  // Atacar = checagens → gasta 1 tiro (arma de fogo) → rola ataque → rola dano (com o crítico do ataque)
  async function opWeaponAttack(uid, tokenId, attrOv){
    const id = tokenId || hub.charToken; if(!opCanEdit(id, 'Só o dono do personagem (ou o mestre) rola por ele.')) return;
    const w = weaponsOf(id).find(x => x.uid === uid);
    if(!w){ toast('Essa arma não está empunhada.', true); return; }
    if(w.cond === 0){ toast(`Arma quebrada: ${w.name}. Conserte antes de atacar.`, true); return; }
    let extra = null;
    if(TVArmas.usaMunicao(ITEMS_BY_ID[w.itemId])){
      const left = await spendMagN(id, uid);
      if(left < 0){ toast('Sem tiros. Recarregue.', true); return; }
      extra = { tiros:left + '/' + magCap(w) };
    }
    await opRollAttack('w:' + uid, id, attrOv, extra);
    await opRollDamage('w:' + uid, id);
  }
  async function doMagMax(hid, uid, n){
    const inst = inventories[hid] && inventories[hid][uid]; if(!inst) return;
    n = Math.trunc(Number(n));
    if(!(n >= 1 && n <= 99)){ toast('A capacidade vai de 1 a 99 tiros.', true); return; }
    if(await commitInv({ [hid + '/' + uid]: Object.assign({}, inst, { magMax:n, mag:Math.min(magOf(inst), n), v:DATA_SCHEMA }) }, [])) toast(`${inst.name}: carregador de ${n} tiros.`);
  }
  // linha de uma arma empunhada (ficha, aba Combate)
  function opWeaponRow(card, hid, w, dis){
    const ref = ITEMS_BY_ID[w.itemId], a = TVArmas.ataque(w, ref), gun = TVArmas.usaMunicao(ref);
    const p = opParts(card, a.skill, a.attribute, 'attack'), crit = !!(hub.opCrit && hub.opCrit['w:' + w.uid]), open = hub.opWMore === w.uid;
    const meta = [a.damage || '—', a.critMargin + '/×' + a.critMult, ref && ref.alc, gun ? TVArmas.rotuloCalibre(ref.calibre) : '', slotLabel(w.slot)].filter(Boolean).join(' · ');
    const uid = esc(w.uid);
    return `<div class="op-atk op-w" data-id="${uid}"><div class="op-atk-top"><div><b>${esc(w.name)}</b><small>${esc(meta)}</small></div>
      <span class="op-total" title="${esc(opPoolHelp(p.pool))} + bônus do ataque"><span class="op-pool${p.pool.low ? ' low' : ''}">${p.pool.label}</span> ${opSgn(opSum(p))}</span></div>
      ${gun ? magLineHtml(w, ref) : ''}
      <div class="inv-item-actions">${gun && !magOf(w)
        ? `<button type="button" class="inv-mini-btn primary" data-act="op-w-reload" data-id="${uid}" ${dis}>Recarregar</button>`
        : `<button type="button" class="inv-mini-btn primary" data-act="op-w-atk" data-id="${uid}" ${dis}>${ic('swords', 16)} Atacar</button>`}
        <button type="button" class="inv-mini-btn ${crit ? 'op-crit-btn' : ''}" data-act="op-w-dmg" data-id="${uid}" ${dis}>Só dano${crit ? ' (crítico ×' + esc(String(a.critMult)) + ')' : ''}</button>
        <button type="button" class="inv-mini-btn" data-act="op-w-more" data-id="${uid}" aria-expanded="${open}">${open ? 'Fechar' : 'Mais'}</button></div>
      ${open ? `<div class="op-atk-form">${gun ? `<button type="button" class="inv-mini-btn" data-act="op-w-unload" data-id="${uid}" ${dis}>Descarregar</button>
        <div class="bonus-row"><label class="op-fld">Capacidade do carregador<input type="number" min="1" max="99" data-w-cap="${uid}" value="${magCap(w)}" ${dis}></label><button type="button" class="inv-mini-btn" data-act="op-w-cap" data-id="${uid}" ${dis}>Salvar</button></div>`
        : '<p class="hub-hint">Esta arma não usa munição.</p>'}</div>` : ''}</div>`;
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
      hub.opSkNew = ''; hub.opSkNewAttr = '';
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
  function opAddCond(key, note){
    const id = hub.charToken; if(!opCanEdit(id)) return;
    note = String(note || '').trim();
    if(!OP_COND[key]) return;
    if(key === 'outra' && !note){ toast('Escreva o nome da condição.', true); return; }
    const card = ensureCard(id), h = holderById(id);
    if(key !== 'outra' && (card.conditions || []).some(c => c.key === key)) return;
    const c = { id:newUid('cd_'), key, note };
    hub.opCondNote = '';
    card.conditions = (card.conditions || []).concat([c]);
    scheduleSaveCard(); renderHub();
    // aparece no feed e na linha do tempo da mesa
    addJournal({ type:'evento', evKind:'condicao', text:`${h ? h.name : card.name} recebeu [${opCondName(c)}]`, auto:true, vis:'grupo' });
  }
  const opAddCondition = () => opAddCond('outra', (hubQ('#op-cond-note') || {}).value);       // campo "outra condição"
  function opToggleCond(key){
    const id = hub.charToken; if(!opCanEdit(id)) return;
    const cur = (ensureCard(id).conditions || []).find(c => c.key === key);
    if(cur) opDelCondition(cur.id); else opAddCond(key, '');
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
  // ---- f20: cartão do agente, abas e poderes ----
  // Símbolo e cor de cada elemento (o desenho vem de op-sym-<chave>.png; a cor é do CSS). Troca de símbolo = trocar o arquivo.
  const OP_ELEM = {
    sangue:{ n:'Sangue', c:'#ff5a5f' }, morte:{ n:'Morte', c:'#d6d6de' }, conhecimento:{ n:'Conhecimento', c:'#f2c14e' },
    energia:{ n:'Energia', c:'#b86cf0' }, medo:{ n:'Medo', c:'#ffffff' }
  };
  const OP_ELEM_KEYS = ['sangue', 'morte', 'conhecimento', 'energia', 'medo'];
  const OP_CIRCLE_COST = { 1:1, 2:3, 3:6, 4:10 };       // custo padrão (PD) por círculo; vem de memória, não foi conferido no livro. Editável em cada ritual
  const OP_ROMAN = ['', 'I', 'II', 'III', 'IV'];
  const OP_FORMS = [['n', 'Normal'], ['d', 'Discente'], ['v', 'Verdadeiro']];
  // centro de cada círculo do pentágono original (704 × 681), em %
  const OP_PENT = { agi:[49.72, 18.72], int:[81.82, 42.22], vig:[70.24, 81.06], pre:[28.27, 81.13], for:[18.25, 42.15] };
  const OP_TABS = [['agente', 'Agente', 'user'], ['pericias', 'Perícias', 'list'], ['combate', 'Combate', 'swords'], ['poderes', 'Poderes', 'bolt']];
  const opElemOk = k => OP_ELEM[k] ? k : '';
  const opSym = (k, s) => OP_ELEM[k] ? `<i class="ox-sym ox-e-${k}" style="--s:${s || 26}px" aria-hidden="true"></i>` : '';
  // bônus de uma perícia sem os dados: treinamento + "outros" (as condições não entram em Esquiva e Bloqueio)
  function opSkillBonus(card, key){
    const s = (card.skillsV2 && card.skillsV2[key]) || {};
    return (OP_TRAIN[s.training] || OP_TRAIN.none)[1] + opNum(s.bonus);
  }
  // Defesa = 10 + AGI + equipamento + outros (Vulnerável −2).  Esquiva = Defesa + bônus de Reflexos.  Bloqueio = bônus de Fortitude.
  function opDefense(card){
    const d = card.defense || {}, agi = opAttrOf(card, 'agi'), vul = (card.conditions || []).some(c => c.key === 'vulneravel') ? -2 : 0;
    const refl = opSkillBonus(card, 'reflexos'), fort = opSkillBonus(card, 'fortitude');
    const def = 10 + agi + opNum(d.equip) + opNum(d.other) + vul;
    return { def, dodge:def + refl + opNum(d.dodge), block:fort + opNum(d.block), agi, refl, fort, vul, equip:opNum(d.equip), other:opNum(d.other), xd:opNum(d.dodge), xb:opNum(d.block) };
  }
  // teste de atributo puro (toque no círculo do pentágono)
  async function opRollAttr(a, tokenId){
    const id = tokenId || hub.charToken; if(!opCanEdit(id, 'Só o dono do personagem (ou o mestre) rola por ele.')) return;
    const at = opAttrOk(a); if(!at) return;
    const card = ensureCard(id), p = opParts(card, null, at, 'attr'), t = opD20(p.pool), nm = (OP_ATTRS.find(x => x[0] === at) || [])[2] || at;
    await opRecord(id, nm + ' · teste', [t], p.parts.concat(p.conds), { kind:'attr', attr:at, val:p.pool.val, pool:p.pool.n, keep:p.pool.keep });
  }
  async function opRollExpr(id, title, expr, extra){
    const pe = parseExpr(expr);
    if(pe.error || !pe.terms.length){ toast(pe.error || 'Escreva os dados (ex.: 3d6).', true); return false; }
    const results = pe.terms.map(t => rollTerm(t, makeSource(null)));
    await opRecord(id, title, results, pe.bonus ? [{ label:'Fixo', value:pe.bonus }] : [], extra);
    return true;
  }
  function opSetField(f, raw){
    const id = hub.charToken; if(!opCanEdit(id)){ renderHub(); return; }
    const card = ensureCard(id), n = Math.round(opNum(raw));
    if(f === 'nex'){ let best = OP_NEX[0]; OP_NEX.forEach(x => { if(Math.abs(x - n) < Math.abs(best - n)) best = x; }); card.nex = best; }
    else if(f === 'level') card.level = Math.max(1, Math.min(20, n || 1));
    else return;
    scheduleSaveCard(); renderHub(); hudMiniChanged();
  }
  // toca na bolinha n: define o nível n; tocar de novo na última acesa tira um nível
  function opSetTrain(key, lvl){
    const id = hub.charToken; if(!opCanEdit(id)) return;
    const card = ensureCard(id), s = (card.skillsV2 || {})[key]; if(!s) return;
    const ks = Object.keys(OP_TRAIN), cur = Math.max(0, ks.indexOf(s.training || 'none')), n = Math.max(0, Math.min(ks.length - 1, Math.round(opNum(lvl))));
    s.training = ks[n === cur ? n - 1 : n];
    scheduleSaveCard(); renderHub();
  }
  // ---- rituais e habilidades ----
  const opFormOn = (r, f) => { const x = (r.forms && r.forms[f]) || {}; return f === 'n' || (x.cost !== '' && x.cost != null) || !!String(x.dice || '').trim(); };
  function opFormCost(r, f){
    const x = (r.forms && r.forms[f]) || {};
    if(x.cost !== '' && x.cost != null) return Math.max(0, Math.trunc(opNum(x.cost)));
    const n = (r.forms && r.forms.n) || {};
    return n.cost !== '' && n.cost != null ? Math.max(0, Math.trunc(opNum(n.cost))) : (OP_CIRCLE_COST[r.circle] || 0);
  }
  const opRitDT = (card, r) => r.dt === '' || r.dt == null ? 10 + opAttrOf(card, 'pre') : opNum(r.dt);
  function opNewPower(kind){
    const id = hub.charToken; if(!opCanEdit(id)) return;
    const card = ensureCard(id), el = opElemOk((card.meta || {}).element) || 'sangue';
    if(kind === 'rit'){
      const r = { id:newUid('rt_'), name:'Novo ritual', element:hub.opPEl || el, circle:1, dt:'', note:'', forms:{ n:{ cost:'', dice:'' }, d:{ cost:'', dice:'' }, v:{ cost:'', dice:'' } } };
      card.rituals = (card.rituals || []).concat([r]); hub.opPOpen = r.id;
    } else {
      const a = { id:newUid('hb_'), name:'Nova habilidade', element:hub.opPEl || '', tag:'', cost:'', dice:'', note:'' };
      card.abilities = (card.abilities || []).concat([a]); hub.opPOpen = a.id;
    }
    scheduleSaveCard(); renderHub();
  }
  function opDelPower(kind, pid){
    const id = hub.charToken; if(!opCanEdit(id)) return;
    if(!window.confirm(kind === 'rit' ? 'Remover este ritual?' : 'Remover esta habilidade?')) return;
    const card = ensureCard(id), key = kind === 'rit' ? 'rituals' : 'abilities';
    card[key] = (card[key] || []).filter(x => x.id !== pid);
    if(hub.opPOpen === pid) hub.opPOpen = null;
    scheduleSaveCard(); renderHub();
  }
  // Conjurar / usar: desconta o custo da barra de PD (se tiver o bastante) e rola os dados, se houver. onlyDice = só rola.
  async function opCast(kind, pid, onlyDice){
    const id = hub.charToken; if(!opCanEdit(id, 'Só o dono do personagem (ou o mestre) usa os poderes dele.')) return;
    const card = ensureCard(id), it = ((kind === 'rit' ? card.rituals : card.abilities) || []).find(x => x.id === pid); if(!it) return;
    const f = kind === 'rit' ? (((hub.opForm || {})[pid] && opFormOn(it, hub.opForm[pid])) ? hub.opForm[pid] : 'n') : 'n';
    const cost = kind === 'rit' ? opFormCost(it, f) : Math.max(0, Math.trunc(opNum(it.cost)));
    const dice = String(kind === 'rit' ? (((it.forms || {})[f] || {}).dice || '') : (it.dice || '')).trim();
    const fl = kind === 'rit' && f !== 'n' ? ' · ' + (OP_FORMS.find(x => x[0] === f) || [])[1] : '';
    const title = (it.name || (kind === 'rit' ? 'Ritual' : 'Habilidade')) + fl;
    if(dice){ const pe = parseExpr(dice); if(pe.error || !pe.terms.length){ toast('Os dados de "' + title + '" estão inválidos (ex.: 3d6).', true); return; } }
    if(!onlyDice && cost > 0){
      const pd = opRes(card, 'pd');
      if(pd.cur < cost){ toast('PD insuficiente para ' + title + ': faltam ' + (cost - pd.cur) + '.', true); return; }
      opAdjustRes('pd', -cost, id);
    }
    if(dice) await opRollExpr(id, title + (onlyDice || !cost ? '' : ' (−' + cost + ' PD)'), dice, { kind:'power', pid, form:f });
    else toast(title + (cost ? ': −' + cost + ' PD' : ': usado') + '.');
  }

  function opBanner(card, edit){
    const id = hub.charToken;
    if(!edit || opSkipped(id)) return '';
    const empty = !(card.skills || []).length && !Object.keys(card.res || {}).length;
    return `<div class="op-banner" role="region" aria-label="Formato da ficha"><p>${empty ? 'Ficha vazia. Começar no formato de Ordem Paranormal?' : 'Formato antigo. Migrar para Ordem Paranormal?'}</p>
      <div class="inv-item-actions"><button type="button" class="inv-mini-btn primary" data-act="op-migrate">Migrar</button><button type="button" class="inv-mini-btn" data-act="op-keep">Manter antigo</button></div></div>`;
  }
  function renderReminders(card, dis){
    return `<div class="hub-label">Lembretes da mesa</div>
      ${(card.reminders || []).map((r, i) => `<div class="bonus-row"><input type="text" data-bind="card.reminders.${i}.label" value="${esc(r.label)}" placeholder="Campo" ${dis}>
        <input type="text" data-bind="card.reminders.${i}.value" value="${esc(r.value)}" placeholder="Valor" ${dis}>
        <button type="button" class="inv-mini-btn danger" data-act="rem-del" data-i="${i}" ${dis} aria-label="Remover lembrete">${ic('close', 16)}</button></div>`).join('')}
      <button type="button" class="inv-mini-btn" data-act="rem-add" ${dis}>${ic('plus', 16)} Lembrete</button>`;
  }
  // ---- desenho da ficha (f20) ----
  function opPortraitData(h){
    const t = tokens.find(x => x.id === h.id), p = t ? null : pins.find(x => x.id === h.id);
    return { img:(t && t.image) || (p && p.image) || '' };
  }
  function opMeter(card, k, dis){
    const r = opRes(card, k), pct = r.max > 0 ? Math.max(0, Math.min(100, Math.round(r.cur / r.max * 100))) : 0, low = r.max > 0 && r.cur / r.max < 0.3, nm = OP_RES[k];
    const inp = (f, v, lab) => `<input class="ox-vit-in ox-vit-${f}" type="number" inputmode="numeric" min="0" data-res="${k}" data-f="${f}" value="${v}" aria-label="${esc(nm[1])}: ${lab}" ${dis}>`;
    return `<div class="ox-vit ox-vit-${k}${low ? ' low' : ''}" style="--c:${nm[2]};--p:${pct}%;--pn:${pct / 100}" role="group" aria-label="${esc(nm[1])}"><i class="ox-vit-fill" aria-hidden="true"></i>
      <span class="ox-vit-k">${low ? ic('alert', 14) : ''}${nm[0]}</span>${inp('cur', r.cur, 'atual')}<span class="ox-vit-sep" aria-hidden="true">/</span>${inp('max', r.max, 'máximo')}</div>`;
  }
  // PV/PD digitados direto: atualiza a barra no lugar, sem refazer a ficha (o foco continua no campo seguinte)
  function opSetRes(k, f, raw, root){
    const id = hub.charToken;
    if(!OP_RES[k] || (f !== 'cur' && f !== 'max')) return;
    if(!opCanEdit(id)){ renderHub(); return; }
    const card = ensureCard(id); card.resources2 = card.resources2 || {};
    const r = card.resources2[k] = card.resources2[k] || { cur:0, max:0 };
    const v = Math.max(0, Math.round(opNum(raw)));
    if(f === 'max'){ r.max = v; if(v > 0 && opNum(r.cur) > v) r.cur = v; }
    else r.cur = opNum(r.max) > 0 ? Math.min(opNum(r.max), v) : v;
    scheduleSaveCard(id); hudMiniChanged();
    const box = root && root.closest ? root.closest('.ox-vit') : null;
    if(box && hub.opTab !== 'poderes'){
      const mx = opNum(r.max), cu = opNum(r.cur);
      const pp = mx > 0 ? Math.max(0, Math.min(100, Math.round(cu / mx * 100))) : 0;
      box.style.setProperty('--p', pp + '%'); box.style.setProperty('--pn', pp / 100);
      box.classList.toggle('low', mx > 0 && cu / mx < 0.3);
      box.querySelector('.ox-vit-cur').value = r.cur; box.querySelector('.ox-vit-max').value = r.max;
    } else setTimeout(hubChanged, 0);
  }
  function opCardHead(h, card, dis){
    const meta = card.meta || {}, nex = card.nex == null ? 5 : card.nex, lvl = card.level == null ? 1 : card.level, nexLevel = cfg().progressionMode !== 'nex_only';
    const el = opElemOk(meta.element), d = opDefense(card), pt = opPortraitData(h), nm = card.name || h.name || '';
    const sub = [meta.class, meta.origin].filter(Boolean).join(' · ');
    const sh = (k, lab, icn, val, how, main) => `<button type="button" class="ox-sh${main ? ' main' : ''}" data-act="op-tab" data-t="combate" title="${esc(how)}" aria-label="${lab}: ${val}. ${esc(how)}. Abrir defesas"><small>${ic(icn, 12)}${k}</small><b>${val}</b></button>`;
    return `<div class="ox-card${el ? ' ox-e-' + el : ''}">
      <div class="ox-top"><div class="ox-portrait"><div class="ox-ph">${pt.img ? `<img src="${esc(pt.img)}" alt="Foto de ${esc(nm)}">` : esc(nm.trim().slice(0, 2).toUpperCase() || '?')}</div><span class="ox-nex">NEX ${nex}%</span></div>
        <div class="ox-id"><b class="ox-name">${esc(nm || 'Sem nome')}</b>${sub ? `<span class="ox-sub">${esc(sub)}</span>` : ''}
          <span class="ox-sub2">${el ? opSym(el, 14) + esc(OP_ELEM[el].n) + ' · ' : ''}${nexLevel ? 'Nível ' + esc(String(lvl)) : ''}${card.player ? (nexLevel ? ' · ' : '') + esc(card.player) : ''}</span></div>
        <img class="ox-logo" src="op-logo.png" alt="Ordem Paranormal"></div>
      ${opMeter(card, 'pv', dis)}${opMeter(card, 'pd', dis)}
      <div class="ox-def">${sh('DEF', 'Defesa', 'shield', d.def, '10 + AGI ' + d.agi + (d.equip + d.other + d.vul ? ' ' + opSgn(d.equip + d.other + d.vul) : ''), true)}${sh('ESQ', 'Esquiva', 'wind', d.dodge, 'DEF + Reflexos ' + opSgn(d.refl + d.xd))}${sh('BLO', 'Bloqueio', 'layers', d.block, 'Fortitude ' + opSgn(d.fort + d.xb))}</div>
      <div class="ox-chips">${(card.conditions || []).map(cd => `<button type="button" class="ox-cchip" data-act="op-tab" data-t="combate" aria-label="Condição ${esc(opCondName(cd))}. Abrir condições">${ic((OP_COND[cd.key] || {}).i || 'alert', 13)}${esc(opCondName(cd))}</button>`).join('')}
        <button type="button" class="ox-cchip add" data-act="op-tab" data-t="combate" aria-label="Adicionar condição">+ condição</button></div></div>`;
  }
  function opPentagon(card, edit, dis){
    const A = card.attributes || {};
    const nodes = OP_ATTRS.map(a => {
      const v = opNum(A[a[0]]), pos = OP_PENT[a[0]], pool = opPool(card, a[0]), st = `left:${pos[0]}%;top:${pos[1]}%`;
      if(edit) return `<label class="ox-node" style="${st}"><input type="number" inputmode="numeric" min="0" max="20" data-bind="card.attributes.${a[0]}" data-num data-sheet value="${esc(String(v))}" aria-label="${a[2]}" ${dis}></label>`;
      return `<button type="button" class="ox-node${v < 1 ? ' zero' : ''}" style="${st}" data-act="op-attr-roll" data-a="${a[0]}" aria-label="Rolar ${a[2]}, ${esc(pool.label)}" ${dis}><b>${v}</b></button>`;
    }).join('');
    return `<div class="ox-pent" role="group" aria-label="Atributos: ${OP_ATTRS.map(a => a[2] + ' ' + opNum(A[a[0]])).join(', ')}"><div class="ox-pent-art" aria-hidden="true"></div>${nodes}</div>`;
  }
  const opNumFld = (lab, path, val, dis) => `<label class="ox-lb">${lab}<input type="number" inputmode="numeric" data-bind="${path}" data-num data-sheet value="${esc(String(val))}" ${dis}></label>`;
  const opTopFld = (lab, f, val, suf, dis) => `<label class="ox-lb">${lab}<span class="ox-sfx"><input type="number" inputmode="numeric" data-opf="${f}" value="${esc(String(val))}" ${dis}>${suf ? `<em>${suf}</em>` : ''}</span></label>`;
  function renderOpAgente(card, dis){
    const nexLevel = cfg().progressionMode !== 'nex_only', meta = card.meta || {}, nex = card.nex == null ? 5 : card.nex, lvl = card.level == null ? 1 : card.level;
    const edit = !!hub.opAttrEdit && !dis;
    return `<div class="ox-pwrap"><div class="ox-ptop"><b>Atributos</b>
      <div class="ox-seg" role="group" aria-label="Modo dos atributos"><button type="button" data-act="op-attr-mode" data-m="roll" aria-pressed="${!edit}">Rolar</button><button type="button" data-act="op-attr-mode" data-m="edit" aria-pressed="${edit}" ${dis}>Editar</button></div></div>
      ${opPentagon(card, edit, dis)}</div>
      <div class="ox-two">${opTopFld('NEX', 'nex', nex, '%', dis)}${nexLevel ? opTopFld('Nível', 'level', lvl, '', dis) : ''}</div>
      <div class="hub-label">Personagem</div>
      <input type="text" data-bind="card.name" data-sheet value="${esc(card.name)}" placeholder="Nome" aria-label="Nome" ${dis}>
      <div class="ox-two"><input type="text" data-bind="card.meta.class" data-sheet value="${esc(meta.class || '')}" placeholder="Classe" aria-label="Classe" ${dis}><input type="text" data-bind="card.meta.origin" data-sheet value="${esc(meta.origin || '')}" placeholder="Origem" aria-label="Origem" ${dis}></div>
      <input type="text" data-bind="card.player" data-sheet value="${esc(card.player)}" placeholder="Jogador" aria-label="Jogador" ${dis}>
      <label class="ox-lb">Afinidade<select data-bind="card.meta.element" data-rerender ${dis}><option value="">Nenhuma</option>${OP_ELEM_KEYS.map(k => opt(k, OP_ELEM[k].n, meta.element || '')).join('')}</select></label>`;
  }
  function opSkillRow(card, sd, dis){
    const A = card.attributes || {}, p = opParts(card, sd.key, null, 'skill'), tot = opSum(p), pen = p.conds.reduce((a, x) => a + x.value, 0), custom = !!sd.defAttr && sd.attr !== sd.defAttr;
    const tk = Object.keys(OP_TRAIN), ti = Math.max(0, tk.indexOf(sd.s.training || 'none')), tr = OP_TRAIN[tk[ti]], open = hub.opSkOpen === sd.key, k = esc(sd.key);
    const pips = [1, 2, 3].map(n => `<button type="button" class="ox-pip${ti >= n ? ' on' : ''}" data-act="op-train-set" data-k="${k}" data-l="${n}" aria-pressed="${ti >= n}" aria-label="${esc(OP_TRAIN[tk[n]][0])}, +${OP_TRAIN[tk[n]][1]}, em ${esc(sd.name)}" ${dis}></button>`).join('');
    return `<div class="ox-sk${ti ? ' tr' : ''}"><div class="ox-sk-row">
      <button type="button" class="ox-sk-main" data-act="op-sk-open" data-k="${k}" aria-expanded="${open}"><b>${esc(sd.name)}</b><small>${sd.attr ? opAttrLabel(sd.attr) + ' ' + opNum(A[sd.attr]) : 'livre'}${custom ? ' · padrão ' + opAttrLabel(sd.defAttr) : ''}</small></button>
      <span class="ox-pips t${ti}" role="group" aria-label="Treinamento de ${esc(sd.name)}: ${esc(tr[0])}">${pips}</span>
      <button type="button" class="ox-roll op-roll${p.pool.low ? ' low' : ''}" data-act="op-skill-roll" data-k="${k}" aria-label="Rolar ${esc(sd.name)}: ${esc(p.pool.label)} ${opSgn(tot)}" title="${esc(opPoolHelp(p.pool))}${pen ? ' · condições ' + opSgn(pen) : ''}" ${dis}><small>${p.pool.label}</small><b>${opSgn(tot)}</b></button></div>
      ${open ? `<div class="ox-sk-edit"><select data-bind="card.skillsV2.${k}.attr" data-rerender aria-label="Atributo usado em ${esc(sd.name)}" ${dis}>${sd.attr ? '' : '<option value="" selected>—</option>'}${OP_ATTRS.map(x => opt(x[0], x[1], sd.attr)).join('')}</select>
        <input type="number" inputmode="numeric" data-bind="card.skillsV2.${k}.bonus" data-num data-sheet value="${esc(String(opNum(sd.s.bonus)))}" aria-label="Bônus avulso de ${esc(sd.name)}" placeholder="Bônus" ${dis}>
        <button type="button" class="ox-del" data-act="op-skill-del" data-k="${k}" aria-label="Remover ${esc(sd.name)}" ${dis}>${ic('close', 16)}</button></div>` : ''}</div>`;
  }
  function renderOpPericias(card, dis){
    const all = Object.keys(card.skillsV2 || {}).map(k => opSkillDef(card, k)).sort((x, y) => x.name.localeCompare(y.name, 'pt-BR'));
    const f = hub.opSkF || 'all', q = opSlug(hub.opSkQ || '');
    const rows = all.filter(sd => (f === 'all' || (f === 'trained' ? (sd.s.training && sd.s.training !== 'none') : sd.attr === f)) && (!q || opSlug(sd.name).indexOf(q) >= 0));
    const chip = (v, lab) => `<button type="button" class="ox-chip" data-act="op-sk-filter" data-f="${v}" aria-pressed="${f === v}">${lab}</button>`;
    let html = `<input type="text" inputmode="search" data-bind="hub.opSkQ" data-rerender value="${esc(hub.opSkQ || '')}" placeholder="Buscar perícia" aria-label="Buscar perícia" enterkeyhint="search">
      <div class="ox-filters" role="group" aria-label="Filtrar perícias">${chip('all', 'Todas')}${chip('trained', 'Treinadas')}${OP_ATTRS.map(a => chip(a[0], a[1])).join('')}</div>`;
    if(!all.length) html += `<p class="hub-hint">Nenhuma perícia ainda.</p><button type="button" class="inv-mini-btn primary" data-act="op-skill-all" ${dis}>${ic('plus', 16)} Adicionar as 28 perícias</button>`;
    else html += rows.map(sd => opSkillRow(card, sd, dis)).join('') || '<p class="hub-hint">Nenhuma perícia com esse filtro.</p>';
    html += `<div class="ox-more"><button type="button" class="ox-more-btn" data-act="op-sk-more" aria-expanded="${!!hub.opSkMore}">${ic(hub.opSkMore ? 'minus' : 'plus', 16)} Adicionar perícia</button>${hub.opSkMore ? `<datalist id="op-skill-list">${OP_SKILLS.map(s => `<option value="${esc(s[1])}">`).join('')}</datalist>
      <div class="op-add"><input type="text" id="op-skill-new" data-bind="hub.opSkNew" value="${esc(hub.opSkNew || '')}" list="op-skill-list" placeholder="Nova perícia (ex.: Furtividade)" ${dis}><select id="op-skill-attr" data-bind="hub.opSkNewAttr" aria-label="Atributo da perícia livre" ${dis}><option value="">atributo (se livre)</option>${OP_ATTRS.map(a => `<option value="${a[0]}"${hub.opSkNewAttr === a[0] ? ' selected' : ''}>${a[1]}</option>`).join('')}</select>
      <button type="button" class="inv-mini-btn" data-act="op-skill-add" ${dis}>${ic('plus', 16)} Nova</button><button type="button" class="inv-mini-btn" data-act="op-skill-all" ${dis}>Adicionar todas as 28</button></div>` : ''}</div>`;
    return html;
  }
  function renderOpCombate(card, dis){
    const d = opDefense(card);
    const sgn = n => (n < 0 ? '−' : '+') + ' ' + Math.abs(n);
    const how = [
      'Defesa = 10 ' + sgn(d.agi) + ' (AGI) ' + sgn(d.equip) + ' (equipamento) ' + sgn(d.other) + ' (outros)' + (d.vul ? ' ' + sgn(d.vul) + ' (Vulnerável)' : ''),
      'Esquiva = Defesa ' + sgn(d.refl) + ' (Reflexos) ' + sgn(d.xd) + ' (extra)',
      'Bloqueio = Fortitude ' + sgn(d.fort) + ' ' + sgn(d.xb) + ' (extra)'];
    let html = `<div class="ox-def">${[['DEF', 'Defesa', 'shield', d.def, true], ['ESQ', 'Esquiva', 'wind', d.dodge], ['BLO', 'Bloqueio', 'layers', d.block]].map((x, i) => `<div class="ox-sh${x[4] ? ' main' : ''}" title="${esc(how[i])}"><small>${ic(x[2], 12)}${x[0]}</small><b>${x[3]}</b></div>`).join('')}</div>${d.vul ? '<p class="hub-hint ox-bd">Vulnerável: −2 na Defesa (e na Esquiva).</p>' : ''}
      <div class="ox-more"><button type="button" class="ox-more-btn" data-act="flag" data-f="opDefMore" aria-expanded="${!!hub.opDefMore}">${ic(hub.opDefMore ? 'minus' : 'plus', 16)} Ajustar defesas</button>${hub.opDefMore ? `<div class="ox-defed">${opNumFld('Equipamento', 'card.defense.equip', d.equip, dis)}${opNumFld('Outros (DEF)', 'card.defense.other', d.other, dis)}${opNumFld('Esquiva extra', 'card.defense.dodge', d.xd, dis)}${opNumFld('Bloqueio extra', 'card.defense.block', d.xb, dis)}</div>` : ''}</div>`;
    // ataques
    const A = card.attributes || {};
    const skillOpts = a => OP_SKILLS.map(x => opt(x[0], x[1], a.skill)).join('') + Object.keys(card.skillsV2 || {}).filter(k => k.indexOf('x_') === 0).map(k => opt(k, opSkillDef(card, k).name, a.skill)).join('');
    const wl = weaponsOf(hub.charToken);
    html += `<div class="ox-hd"><h3>Armas</h3></div>${wl.map(w => opWeaponRow(card, hub.charToken, w, dis)).join('') || '<p class="hub-hint">Nenhuma arma empunhada. Na Mochila, equipe uma arma como Arma principal ou secundária.</p>'}`;
    html += `<div class="ox-hd"><h3>Ataques</h3></div>${(card.attacks || []).map((a, i) => {
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
    // condições: cada uma é um botão liga/desliga com bolinha
    const have = card.conditions || [], on = k => have.some(c => c.key === k);
    const chip = k => `<button type="button" class="ox-cond${on(k) ? ' on' : ''}" data-act="op-cond-toggle" data-k="${k}" aria-pressed="${on(k)}" ${dis}><i class="ox-dot" aria-hidden="true"></i>${esc(OP_COND[k].n)}</button>`;
    const extraOn = have.filter(c => !OP_COND_ORDER.includes(c.key) && (hub.opCondMore ? c.key === 'outra' : true));
    const rest = Object.keys(OP_COND).filter(k => k !== 'outra' && !OP_COND_ORDER.includes(k));
    html += `<div class="ox-hd"><h3>Condições</h3></div><div class="ox-conds">${OP_COND_ORDER.map(chip).join('')}${extraOn.map(c => c.key === 'outra'
        ? `<button type="button" class="ox-cond on" data-act="op-cond-del" data-id="${esc(c.id)}" aria-label="Remover ${esc(opCondName(c))}" ${dis}><i class="ox-dot" aria-hidden="true"></i>${esc(opCondName(c))}</button>` : chip(c.key)).join('')}</div>
      ${hub.opCondMore ? `<div class="ox-conds">${rest.map(chip).join('')}</div>
        <div class="ox-add"><input type="text" id="op-cond-note" data-bind="hub.opCondNote" value="${esc(hub.opCondNote || '')}" placeholder="Outra condição" aria-label="Nome de outra condição" ${dis}><button type="button" class="inv-mini-btn" data-act="op-cond-add" ${dis}>${ic('plus', 16)} Adicionar</button></div>` : ''}
      <div class="ox-more"><button type="button" class="ox-more-btn" data-act="flag" data-f="opCondMore" aria-expanded="${!!hub.opCondMore}">${ic(hub.opCondMore ? 'minus' : 'plus', 16)} ${hub.opCondMore ? 'Menos condições' : 'Mais condições'}</button></div>
      ${have.filter(cd => OP_COND[cd.key] && OP_COND[cd.key].t).map(cd => `<p class="ox-fx"><b>${esc(OP_COND[cd.key].n)}</b> ${esc(OP_COND[cd.key].t)}</p>`).join('')}`;
    return html;
  }
  // ---- poderes ----
  function opRitualCard(card, r, i, dis){
    const el = opElemOk(r.element), open = hub.opPOpen === r.id, req = (hub.opForm || {})[r.id];
    const avail = OP_FORMS.filter(x => opFormOn(r, x[0])), f = avail.some(x => x[0] === req) ? req : 'n';
    const cost = opFormCost(r, f), dice = String(((r.forms || {})[f] || {}).dice || '').trim(), auto = r.dt === '' || r.dt == null;
    const id = esc(r.id), nmF = n => (OP_FORMS.find(x => x[0] === n) || [])[1];
    return `<div class="ox-pw${el ? ' ox-e-' + el : ''}"><div class="ox-pw-top">${opSym(el, 32)}<div class="ox-pw-id"><b>${esc(r.name || 'Ritual')}</b><small>${esc((el ? OP_ELEM[el].n + ' · ' : '') + (r.circle || 1) + 'º círculo')} · DT ${opRitDT(card, r)}${auto ? ' (auto)' : ''}</small></div><span class="ox-circ" title="${esc((r.circle || 1) + 'º círculo')}">${OP_ROMAN[r.circle] || '?'}</span></div>
      ${avail.length > 1 ? `<div class="ox-forms" role="group" aria-label="Forma do ritual">${avail.map(x => `<button type="button" data-act="op-p-form" data-id="${id}" data-f="${x[0]}" aria-pressed="${x[0] === f}">${x[1]}</button>`).join('')}</div>` : ''}
      <div class="ox-meta"><span><small>CUSTO</small>${cost} PD</span>${dice ? `<span><small>DADOS</small>${esc(dice)}</span>` : ''}</div>
      ${r.note ? `<p class="ox-note">${esc(r.note)}</p>` : ''}
      <div class="inv-item-actions"><button type="button" class="inv-mini-btn primary" data-act="op-p-cast" data-k="rit" data-id="${id}" ${dis}>${ic('bolt', 16)} Conjurar${cost ? ' · −' + cost + ' PD' : ''}</button>
        ${dice ? `<button type="button" class="inv-mini-btn" data-act="op-p-roll" data-k="rit" data-id="${id}" ${dis}>${ic('dice', 16)} Só rolar</button>` : ''}
        <button type="button" class="inv-mini-btn" data-act="op-p-edit" data-id="${id}" aria-expanded="${open}">${open ? 'Fechar' : 'Editar'}</button></div>
      ${open ? `<div class="ox-pw-form"><input type="text" data-bind="card.rituals.${i}.name" data-sheet value="${esc(r.name || '')}" placeholder="Nome do ritual" ${dis}>
        <div class="ox-two"><label class="ox-lb">Elemento<select data-bind="card.rituals.${i}.element" data-rerender ${dis}>${OP_ELEM_KEYS.map(k => opt(k, OP_ELEM[k].n, r.element)).join('')}</select></label>
          <label class="ox-lb">Círculo<select data-bind="card.rituals.${i}.circle" data-num data-rerender ${dis}>${[1, 2, 3, 4].map(n => opt(n, n + 'º círculo', r.circle || 1)).join('')}</select></label></div>
        <label class="ox-lb">DT (em branco = 10 + PRE)<input type="number" data-bind="card.rituals.${i}.dt" data-num data-sheet value="${esc(r.dt == null ? '' : String(r.dt))}" placeholder="${10 + opAttrOf(card, 'pre')}" ${dis}></label>
        ${OP_FORMS.map(x => `<div class="ox-frm"><span>${x[1]}</span><input type="number" min="0" data-bind="card.rituals.${i}.forms.${x[0]}.cost" data-num data-sheet value="${esc(String(((r.forms || {})[x[0]] || {}).cost == null ? '' : r.forms[x[0]].cost))}" placeholder="${x[0] === 'n' ? (OP_CIRCLE_COST[r.circle] || 0) + ' PD' : 'custo'}" aria-label="Custo em PD, forma ${nmF(x[0])}" ${dis}><input type="text" data-bind="card.rituals.${i}.forms.${x[0]}.dice" data-sheet value="${esc(String(((r.forms || {})[x[0]] || {}).dice || ''))}" placeholder="dados (3d6)" aria-label="Dados, forma ${nmF(x[0])}" ${dis}></div>`).join('')}
        <textarea data-bind="card.rituals.${i}.note" data-sheet rows="3" placeholder="Efeito, alcance, duração" ${dis}>${esc(r.note || '')}</textarea>
        <button type="button" class="inv-mini-btn danger" data-act="op-p-del" data-k="rit" data-id="${id}" ${dis}>${ic('close', 16)} Remover ritual</button></div>` : ''}</div>`;
  }
  function opAbilityCard(card, a, i, dis){
    const el = opElemOk(a.element), open = hub.opPOpen === a.id, cost = Math.max(0, Math.trunc(opNum(a.cost))), dice = String(a.dice || '').trim(), id = esc(a.id);
    return `<div class="ox-pw${el ? ' ox-e-' + el : ''}"><div class="ox-pw-top">${opSym(el, 28)}<div class="ox-pw-id"><b>${esc(a.name || 'Habilidade')}</b>${(a.tag || el) ? `<small>${esc([a.tag, el ? OP_ELEM[el].n : ''].filter(Boolean).join(' · '))}</small>` : ''}</div></div>
      ${(cost || dice) ? `<div class="ox-meta">${cost ? `<span><small>CUSTO</small>${cost} PD</span>` : ''}${dice ? `<span><small>DADOS</small>${esc(dice)}</span>` : ''}</div>` : ''}
      ${a.note ? `<p class="ox-note">${esc(a.note)}</p>` : ''}
      <div class="inv-item-actions">${(cost || dice) ? `<button type="button" class="inv-mini-btn primary" data-act="op-p-cast" data-k="hab" data-id="${id}" ${dis}>${ic('bolt', 16)} Usar${cost ? ' · −' + cost + ' PD' : ''}</button>` : ''}
        <button type="button" class="inv-mini-btn" data-act="op-p-edit" data-id="${id}" aria-expanded="${open}">${open ? 'Fechar' : 'Editar'}</button></div>
      ${open ? `<div class="ox-pw-form"><input type="text" data-bind="card.abilities.${i}.name" data-sheet value="${esc(a.name || '')}" placeholder="Nome da habilidade" ${dis}>
        <div class="ox-two"><input type="text" data-bind="card.abilities.${i}.tag" data-sheet value="${esc(a.tag || '')}" placeholder="Tipo (classe, trilha, poder…)" ${dis}>
          <select data-bind="card.abilities.${i}.element" data-rerender aria-label="Elemento" ${dis}><option value="">— sem elemento —</option>${OP_ELEM_KEYS.map(k => opt(k, OP_ELEM[k].n, a.element || '')).join('')}</select></div>
        <div class="ox-two">${opNumFld('Custo em PD', 'card.abilities.' + i + '.cost', a.cost == null ? '' : a.cost, dis)}<label class="ox-lb">Dados (opcional)<input type="text" data-bind="card.abilities.${i}.dice" data-sheet value="${esc(a.dice || '')}" placeholder="3d6" ${dis}></label></div>
        <textarea data-bind="card.abilities.${i}.note" data-sheet rows="3" placeholder="O que a habilidade faz" ${dis}>${esc(a.note || '')}</textarea>
        <button type="button" class="inv-mini-btn danger" data-act="op-p-del" data-k="hab" data-id="${id}" ${dis}>${ic('close', 16)} Remover habilidade</button></div>` : ''}</div>`;
  }
  function renderOpPoderes(card, dis){
    const fe = opElemOk(hub.opPEl), fc = hub.opPC || 0;
    const rits = (card.rituals || []).map((r, i) => [r, i]).filter(x => (!fe || x[0].element === fe) && (!fc || (x[0].circle || 1) === fc));
    const habs = (card.abilities || []).map((a, i) => [a, i]).filter(x => !fe || x[0].element === fe);
    const eChip = (k, lab) => `<button type="button" class="ox-chip${k ? ' ox-e-' + k : ''}" data-act="op-p-el" data-e="${k}" aria-pressed="${fe === k}">${k ? opSym(k, 16) : ''}${lab}</button>`;
    const cChip = n => `<button type="button" class="ox-chip" data-act="op-p-circ" data-c="${n}" aria-pressed="${fc === n}">${n ? OP_ROMAN[n] + 'º' : 'Todos'}</button>`;
    return `<div class="ox-filters" role="group" aria-label="Filtrar por elemento">${eChip('', 'Todos')}${OP_ELEM_KEYS.map(k => eChip(k, OP_ELEM[k].n)).join('')}</div>
      <div class="ox-hd"><h3>Rituais</h3><small>PD ${opRes(card, 'pd').cur} / ${opRes(card, 'pd').max}</small></div>
      <div class="ox-filters" role="group" aria-label="Filtrar por círculo">${[0, 1, 2, 3, 4].map(cChip).join('')}</div>
      ${rits.map(x => opRitualCard(card, x[0], x[1], dis)).join('') || `<p class="hub-hint">${(card.rituals || []).length ? 'Nenhum ritual com esse filtro.' : 'Nenhum ritual ainda. Nomes e efeitos ficam em branco para a sua mesa preencher.'}</p>`}
      <button type="button" class="inv-mini-btn" data-act="op-p-new" data-k="rit" ${dis}>${ic('plus', 16)} Novo ritual</button>
      <div class="ox-hd"><h3>Habilidades</h3></div>
      ${habs.map(x => opAbilityCard(card, x[0], x[1], dis)).join('') || `<p class="hub-hint">${(card.abilities || []).length ? 'Nenhuma habilidade com esse filtro.' : 'Nenhuma habilidade ainda (classe, trilha, poderes paranormais…).'}</p>`}
      <button type="button" class="inv-mini-btn" data-act="op-p-new" data-k="hab" ${dis}>${ic('plus', 16)} Nova habilidade</button>`;
  }
  function renderFichaOrdem(h, card, dis){
    const tab = OP_TABS.some(t => t[0] === hub.opTab) ? hub.opTab : 'agente';
    const body = tab === 'pericias' ? renderOpPericias(card, dis) : tab === 'combate' ? renderOpCombate(card, dis) : tab === 'poderes' ? renderOpPoderes(card, dis) : renderOpAgente(card, dis);
    return `<div class="ox" data-optab="${tab}">${opCardHead(h, card, dis)}
      <div class="ox-tabs" role="tablist" aria-label="Seções da ficha">${OP_TABS.map(t => `<button type="button" class="ox-tab" role="tab" id="ox-t-${t[0]}" aria-selected="${t[0] === tab}" aria-controls="ox-panel" data-act="op-tab" data-t="${t[0]}">${ic(t[2], 20)}<span>${t[1]}</span></button>`).join('')}</div>
      <div id="ox-panel" role="tabpanel" aria-labelledby="ox-t-${tab}">${body}</div></div>`;
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
  function wireHubRoot(root){
  if(!root) return;
  root.addEventListener('input', e => {
    const t = e.target;
    if(t.dataset && t.dataset.bind && t.type !== 'checkbox' && t.tagName !== 'SELECT') onBind(t);
  });
  root.addEventListener('change', e => {
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
    if(t.dataset && t.dataset.res){ opSetRes(t.dataset.res, t.dataset.f, t.value, t); return; }
    if(t.dataset && t.dataset.opf){ opSetField(t.dataset.opf, t.value); return; }
    if(t.dataset && t.dataset.act === 'bulk-pick'){ hubAction('bulk-pick', t); return; }
    if(t.dataset && t.dataset.act === 'present'){
      const arr = hub.sessionForm.present, n = t.dataset.name, i = arr.indexOf(n);
      if(t.checked && i < 0) arr.push(n);
      if(!t.checked && i >= 0) arr.splice(i, 1);
      return;
    }
    if(t.dataset && t.dataset.bind && (t.type === 'checkbox' || t.tagName === 'SELECT')) onBind(t);
  });
  root.addEventListener('focusout', () => { setTimeout(() => { if(hubDirty && !(document.activeElement && [hubBody, fpHead, fichapBody, mesaBody].some(r => r && r.contains(document.activeElement)))) renderHub(); }, 50); });
  root.addEventListener('click', e => {
    const b = e.target.closest('[data-act]');
    if(!b || b.tagName === 'INPUT') return;
    hubAction(b.dataset.act, b);
  });
  }
  [hubBody, fpHead, fichapBody, mesaBody].forEach(wireHubRoot);
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
      case 'skill-use': { const s = characters[hub.charToken].skills[+D.i]; rollUI.skill = s.name; rollUI.bonuses = Number(s.bonus) ? [{ label:s.name, value:Number(s.bonus) }] : []; rollUI.who = hub.charToken; openHub('dados'); break; }
      case 'op-migrate': opMigrate(); break;
      case 'op-keep': opSkip(hub.charToken); break;
      case 'op-revert': opRevert(); break;
      case 'op-skill-roll': opRollSkill(D.k); break;
      case 'op-skill-del': opDelSkill(D.k); break;
      case 'op-skill-add': opAddSkill((hubQ('#op-skill-new') || {}).value, (hubQ('#op-skill-attr') || {}).value, false); break;
      case 'op-skill-all': opAddSkill('', '', true); break;
      case 'op-w-atk': opWeaponAttack(D.id); break;
      case 'op-w-dmg': opRollDamage('w:' + D.id); break;
      case 'op-w-reload': doRecarregar(hub.charToken, D.id); break;
      case 'op-w-unload': doDescarregar(hub.charToken, D.id); break;
      case 'op-w-more': hub.opWMore = hub.opWMore === D.id ? null : D.id; renderHub(); break;
      case 'op-w-cap': doMagMax(hub.charToken, D.id, (hubQ('[data-w-cap="' + D.id + '"]') || {}).value); break;
      case 'op-atk-new': opNewAttack(); break;
      case 'op-atk-edit': hub.opEdit = hub.opEdit === D.id ? null : D.id; renderHub(); break;
      case 'op-atk-del': opDelAttack(D.id); break;
      case 'op-atk-roll': opRollAttack(D.id); break;
      case 'op-dmg-roll': opRollDamage(D.id); break;
      case 'op-cond-add': opAddCondition(); break;
      case 'op-cond-del': opDelCondition(D.id); break;
      case 'op-tab': hub.opTab = D.t; renderHub(); break;
      case 'op-attr-mode': hub.opAttrEdit = D.m === 'edit'; renderHub(); break;
      case 'op-attr-roll': opRollAttr(D.a); break;
      case 'mx': { hub.mx = hub.mx || {}; hub.mx[D.k] = !mxOpen(D.k, D.d === '1'); renderHub(); break; }
      case 'flag': if(['opDefMore', 'opCondMore', 'diceMore'].includes(D.f)){ hub[D.f] = !hub[D.f]; renderHub(); } break;
      case 'op-cond-toggle': opToggleCond(D.k); break;
      case 'op-sk-filter': hub.opSkF = D.f; renderHub(); break;
      case 'op-sk-more': hub.opSkMore = !hub.opSkMore; renderHub(); break;
      case 'op-sk-open': hub.opSkOpen = hub.opSkOpen === D.k ? null : D.k; renderHub(); break;
      case 'op-train-set': opSetTrain(D.k, D.l); break;
      case 'op-p-el': hub.opPEl = D.e; renderHub(); break;
      case 'op-p-circ': hub.opPC = +D.c; renderHub(); break;
      case 'op-p-new': opNewPower(D.k); break;
      case 'op-p-edit': hub.opPOpen = hub.opPOpen === D.id ? null : D.id; renderHub(); break;
      case 'op-p-del': opDelPower(D.k, D.id); break;
      case 'op-p-form': hub.opForm = hub.opForm || {}; hub.opForm[D.id] = D.f; renderHub(); break;
      case 'op-p-cast': opCast(D.k, D.id, false); break;
      case 'op-p-roll': opCast(D.k, D.id, true); break;
      case 'need': { const c = ensureCard(hub.charToken); c.needs = c.needs || {}; c.needs[D.n] = Math.min(4, Math.max(0, (c.needs[D.n] || 0) + (+D.d))); scheduleSaveCard(); renderHub(); break; }
      case 'open-inv': openInventory(D.id); break;
      case 'sess-new': newSession(); break;
      case 'sess-summary': { const ta = hubQ('[data-bind="hub.summary"]'); saveSummary(ta ? ta.value : ''); break; }
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
      case 'craft-roll': { const r = recipes[D.id]; if(r){ rollUI.skill = r.skill || r.name; rollUI.who = hub.craftHolder || ''; openHub('dados'); } break; }
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
      case 'grp-sheet': hub.charToken = D.id; hudSetWho(D.id); openHub('ficha'); break;
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
  const TAC_KINDS = { pc:['Personagem', '#ffffff'], npc:['Aliado / NPC', '#7fb98a'], enemy:['Inimigo', '#d3572a'], obj:['Objeto', '#c9a15a'] };
  const TAC_DIAG = [['cheb', 'Diagonal custa 1 casa'], ['alt', 'Diagonal alterna 1 e 2 casas'], ['eucl', 'Linha reta (arredonda para cima)']];
  const TAC_LIMIT = [['warn', 'Só avisar ao passar do limite'], ['block', 'Bloquear jogadores além do limite'], ['off', 'Sem limite']];
  const TAC_DEF = { size:64, mpc:1.5, diag:'cheb', limit:'warn', speed:6, cols:14, rows:10 };
  const tacUI = { open:false, sid:null, sel:null, panel:'', ruler:false, pts:[], gd:null, drag:false, dirty:false, seen:false, nfSrc:'blank', imgCache:{}, last:null, focusTok:null, markers:{}, bannerOff:null };
  let tacMap = null, tacBase = null, tacGridLayer = null, tacTokLayer = null, tacRulerLayer = null, tacBuiltKey = '';
  const tacEl = id => document.getElementById(id);
  // f25: no desktop a gaveta de ferramentas cobre o lado direito do mapa. Largura reservada (0 no celular, onde ela sobe de baixo).
  function tacSheetW(){
    const sh = tacEl('tac-sheet');
    if(!sh || sh.hidden || window.innerWidth < 1025) return 0;
    return sh.offsetWidth || 0;
  }
  // mantém o centro da área visível no mesmo ponto do mapa quando a gaveta abre/fecha (sem mexer no zoom)
  function tacSheetShift(){
    if(!tacMap || !tacUI.open || !tacMap._loaded) return;     // antes do primeiro setView o Leaflet não sabe o centro
    const want = tacSheetW() / 2, d = want - (tacUI.shift || 0);
    tacUI.shift = want;
    if(Math.abs(d) > 0.5) tacMap.panBy([d, 0], { animate:false });
  }
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
    L.control.zoom({ position:'topleft', zoomInText:'+', zoomOutText:'−' }).addTo(tacMap);
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
      empty.innerHTML = isMaster()
        ? '<div class="te-box"><b>Nenhuma cena ainda</b><p>Crie uma cena para posicionar tokens e medir distâncias.</p><button type="button" class="te-btn" data-tac="panel-scenes">Criar cena</button></div>'
        : '<div class="te-box"><b>Sem cena ativa</b><p>O mestre ainda não ativou uma cena tática.</p></div>';
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
        tacBase = L.rectangle(bounds, { pane:'tacBase', color:'#4a4a4a', weight:2, fillColor:'#0a0a0a', fillOpacity:1, interactive:false }).addTo(tacMap);
        if(sc.src && sc.src.kind && sc.src.kind !== 'blank') toast('Não foi possível carregar a imagem da cena. Mostrando só a grade.', true);
      }
      tacMap.invalidateSize();
      tacMap.setMaxBounds(bounds.pad(0.6));
      const rw = tacSheetW();
      tacMap.fitBounds(bounds, { animate:false, paddingBottomRight:[rw, window.innerWidth >= 1025 ? 96 : 0], paddingTopLeft:[0, 0] });
      tacUI.shift = rw / 2;
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
    L.polyline(lines, { color:'#ffffff', weight:1, opacity:editing ? 0.75 : 0.32, interactive:false, noClip:true }).addTo(tacGridLayer);
  }
  // imagem do token do mapa geográfico (ou NPC) ligado a este token tático; acompanha o original
  function tacImgOf(t){
    if(!t || !t.mapTokenId) return '';
    const o = tokens.find(x => x.id === t.mapTokenId) || pins.find(x => x.id === t.mapTokenId && x.type === 'npc');
    const im = o && o.image;
    return (typeof im === 'string' && /^(data:image\/|https?:|\.?\/?[\w\-./]+\.(png|jpe?g|gif|webp|svg)$)/i.test(im)) ? im : '';
  }
  // moldura do token tático: se está ligado a um personagem/NPC do mapa, acompanha a dele; senão usa a própria (t.fr)
  function tacFrOf(t){
    if(!t) return null;
    const o = t.mapTokenId ? (tokens.find(x => x.id === t.mapTokenId) || pins.find(x => x.id === t.mapTokenId && x.type === 'npc')) : null;
    return frSt(o ? o.fr : t.fr);
  }
  let tacImgSig = '';
  function tacImgSigNow(){
    const sc = tacScene(tacCurId()); if(!sc) return '';
    return tacTokensOf(tacCurId()).map(t => { const im = tacImgOf(t); return t.id + ':' + im.length + ':' + im.slice(-24) + ':' + frSig(tacFrOf(t)); }).join('|');
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
      const fp = frParts(tacFrOf(t), col, { fd:Math.max(4, Math.round(px * 0.12)), style:';--tc:' + tacX(col), cls:(t.hidden ? ' hid' : '') + (tacUI.sel === t.id ? ' sel' : '') + (cur === t.id ? ' turn' : '') });
      const icon = L.divIcon({ className:'', iconSize:[px, px], iconAnchor:[px / 2 - off, px / 2 - off],
        html:`${fp.ring}<div class="${cls}"${fp.sh} style="width:${px}px;height:${px}px;--tc:${tacX(col)};font-size:${Math.round(px * 0.36)}px">${img ? `<img src="${tacX(img)}" alt="">` : `<span>${label}</span>`}</div><span class="tac-nm">${tacX(String(t.name || '').split(/\s+/)[0])}${t.hidden ? ' · oculto' : ''}</span>` });
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
    if(ok) TVSound.play(Math.random() < 0.5 ? 'passo1' : 'passo2', { v:0.8, gap:120 });
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
    const fab = tacEl('tac-fab');
    if(!fab) return;
    const show = !!sc && !tacUI.open && tacUI.bannerOff !== tac.active;
    fab.hidden = !show;
    if(show){
      const nm = sc.name || 'Cena';
      fab.setAttribute('aria-label', 'Cena tática ativa: ' + nm + '. Abrir');
      fab.querySelector('.tf-label').textContent = nm;
      if(tacUI.fresh === tac.active) fab.classList.add('fresh');
    }
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
    if(!p){ sh.hidden = true; sh.innerHTML = ''; tacEl('tac').classList.remove('sheet-on'); tacSheetShift(); return; }
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
    const wasHidden = sh.hidden;
    sh.innerHTML = h; sh.hidden = false; sh.dataset.p = p;
    if(wasHidden) stagger(sh);
    tacEl('tac').classList.add('sheet-on'); tacSheetShift();
    if(p === 'token'){
      const fr = sh.querySelector('.fr-pick'), tc = tacEl('tt-color');
      if(fr){ frPickerWire(fr, () => tc ? tc.value : ''); if(tc) tc.addEventListener('input', () => fr.__paint()); }
    }
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
        ${t.mapTokenId ? '<p class="hub-hint">A moldura deste token vem do personagem no mapa de campo (edite lá).</p>' : frPickerHtml(t.fr, /^#[0-9a-f]{6}$/i.test(t.color || '') ? t.color : kinfo[1], 'tt-fr')}
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
        let f = (tacEl('tn-file') || {}).files && tacEl('tn-file').files[0];
        if(!f){ toast('Escolha uma imagem.', true); return; }
        if(!/^image\/gif$/i.test(f.type)){
          const adj = await window.tvAdjustImage(f, { title:'Ajustar o mapa da cena', ratios:[{ id:'orig', label:'Original', ratio:0 }, { id:'169', label:'16:9', ratio:16 / 9 }, { id:'43', label:'4:3', ratio:4 / 3 }, { id:'11', label:'1:1', ratio:1 }], out:1600, q:0.92, fill:'#0f1a22', noUpscale:true });
          if(!adj) return;                                           // cancelou: nada é criado
          f = await (await fetch(adj.data)).blob();
        }
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
      case 'center': if(tacMap && sc){ const rw = tacSheetW(); tacMap.fitBounds(L.latLngBounds([[0, 0], [sc.h, sc.w]]), { animate:false, paddingBottomRight:[rw, window.innerWidth >= 1025 ? 96 : 0] }); tacUI.shift = rw / 2; } return;
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
        const upd = { [p + '/name']:tacF('tt-name').trim() || 'Token', [p + '/kind']:tacF('tt-kind') || 'obj', [p + '/color']:tacF('tt-color') || null,
          [p + '/speed']:sp === '' ? null : Math.max(0, Math.min(99, parseInt(sp, 10) || 0)), [p + '/ini']:ini === '' ? null : tacNum(ini, null) };
        if(tacEl('tt-fr')) upd[p + '/fr'] = frPickerGet(tacEl('tt-fr'));   // null apaga a moldura
        const ok = await DB.update(upd);
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
    const prev = tac.active, turnBefore = tacTurnKey(prev);
    tac = { active:(v && v.active) || null, scenes:(v && v.scenes) || {} };
    if(tacUI.seen && tac.active && tac.active !== prev && !tacUI.open && !isMaster() && tac.scenes[tac.active]) toast('Cena tática ativa: ' + (tac.scenes[tac.active].name || 'Cena') + ' (botão Tático)');
    if(tac.active && tac.active !== prev && tac.scenes[tac.active]){
      tacUI.fresh = tac.active; tacUI.bannerOff = null;              // cena nova: o botão volta e o anel pulsa 3 vezes
      const lv = tacEl('tac-fab-live'); if(lv) lv.textContent = 'Cena tática ativa: ' + (tac.scenes[tac.active].name || 'Cena');
    }
    tacUI.seen = true;
    const turnAfter = tacTurnKey(tac.active);
    if(turnAfter && turnAfter !== turnBefore && !isMaster()){
      const tid = tacTurnId(tacScene(tac.active)), tk = tacTokensOf(tac.active).find(x => x.id === tid);
      if(tk && tacCanMove(tk)) TVSound.play('vez', { remote:true });
    }
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
    areaClose();
    closeHub(); closeDrawer(); closeNavDrawer(); closeInventory(); hudCloseSheets();
    tacUI.open = true; tacUI.shift = 0;
    tacEl('tac').hidden = false;
    stagger(tacEl('tac-bar'));
    { const tg = tacEl('tac-guia'), tid = guiaPapel() === 'mestre' ? 'tatico-mestre' : 'tatico-jogador'; if(tg) tg.dataset.guia = tid; guiaOferecer(tid); }
    tacRenderArea();
    tacInitMap();
    tacRender();
    requestAnimationFrame(() => { tacMap.invalidateSize(); tacBuild(true); const bk = root0(); if(bk) bk.focus({ preventScroll:true }); });
  }
  function root0(){ return document.querySelector('#tac .tac-back'); }
  function tacClose(){ tacUI.open = false; tacUI.ruler = false; tacUI.pts = []; tacEl('tac').hidden = true; tacRenderArea(); const f = document.querySelector('[data-verb="tac"]') || document.getElementById('mchip-master'); if(f && f.offsetParent) f.focus({ preventScroll:true }); }
  (function tacWire(){
    const root = tacEl('tac');
    if(!root) return;
    root.addEventListener('click', e => { const b = e.target.closest('[data-tac]'); if(b && root.contains(b)) tacAction(b.dataset.tac, b); });
    root.addEventListener('change', e => { if(e.target && e.target.dataset && e.target.dataset.tacCh) tacChange(e.target); });
    root.addEventListener('input', e => { if(e.target && e.target.dataset && e.target.dataset.tacCh === 'g') tacChange(e.target); });
    // f25: invalidateSize no máximo 1x por frame (redimensionar a janela disparava dezenas por segundo)
    let tacRz = 0;
    const tacFit = () => { if(tacRz) return; tacRz = requestAnimationFrame(() => { tacRz = 0; if(tacUI.open && tacMap) tacMap.invalidateSize({ animate:false }); }); };
    window.addEventListener('resize', tacFit);
    if(window.ResizeObserver) new ResizeObserver(tacFit).observe(tacEl('tac-mapwrap'));
    document.addEventListener('keydown', e => { if(e.key === 'Escape' && tacUI.open && !hubIsOpen()) tacClose(); });
    // f26: botão flutuante — toque abre; segurar 500 ms (ou botão direito, ou Shift+clique) esconde até a próxima cena
    const fab = tacEl('tac-fab');
    if(fab){
      let hold = 0, held = false;
      const dismiss = () => { held = true; tacUI.bannerOff = tac.active; tacRenderArea(); toast('Botão escondido. Reabra por Tático.'); };
      fab.addEventListener('pointerdown', () => { held = false; clearTimeout(hold); hold = setTimeout(dismiss, 500); });
      ['pointerup', 'pointerleave', 'pointercancel'].forEach(ev => fab.addEventListener(ev, () => clearTimeout(hold)));
      fab.addEventListener('contextmenu', e => { e.preventDefault(); clearTimeout(hold); dismiss(); });
      fab.addEventListener('click', e => { if(held){ held = false; return; } if(e.shiftKey){ dismiss(); return; } fab.classList.remove('fresh'); tacUI.fresh = null; tacOpen(); });
      fab.addEventListener('animationend', e => { if(e.animationName === 'f26Ping'){ fab.classList.remove('fresh'); tacUI.fresh = null; } });
    }
  })();

  document.getElementById('hub-drawer-close-btn').addEventListener('click', closeHub);
  hubBackdrop.addEventListener('click', closeHub);
  document.getElementById('campaign-chip').addEventListener('click', () => openHub('campanhas'));
  document.addEventListener('keydown', e => {
    if(e.key === 'Escape' && hubIsOpen()) closeHub();
    const tag = (document.activeElement && document.activeElement.tagName) || '';
    if(/^(INPUT|TEXTAREA|SELECT)$/.test(tag) || e.ctrlKey || e.metaKey || e.altKey) return;
    if(e.key === 'd' || e.key === 'D') hudOpenQuickRoll();
    else if(e.key === 'c' || e.key === 'C') openHub('campanhas');
    else if(typeof f23Key === 'function' && hudReady) f23Key(e);
  });

  // ================= HUD: DOCK, ÍNDICE, ROLAGEM RÁPIDA, FEED VIVO E MINI-FICHA =================
  // Tudo aqui é camada de interface por cima do que já existia: os dados (rolagens, registro de itens,
  // diário, fichas) continuam nos mesmos lugares. O feed só LÊ lootLog + rolls + journal.
  const hudEl = id => document.getElementById(id);
  const hudNorm = s => String(s == null ? '' : s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  const hudPlain = html => { const d = document.createElement('div'); d.innerHTML = html; return (d.textContent || '').replace(/\s+/g, ' ').trim(); };
  const hudCol = () => !!(window.matchMedia && window.matchMedia('(min-width:1100px)').matches);
  const hud = { who:null, idxAdd:false, idxQ:'', mapf:new Set(), feed:{ f:'all', m:'all', seen:0, collapsed:false, sheet:false, tall:false, open:null, more:false } };
  // f23: estado dos painéis, da cena e dos ajustes (por aparelho: tv-map:adv, tv-map:guia:*, tv-map:mesa-tab)
  const LS_ADV = 'tv-map:adv', LS_MESAT = 'tv-map:mesa-tab';
  const F23 = { mesaTab:'feed', tacLive:false, scene:'explorar', sceneBy:'', sceneAt:0, sceneSeen:false, mstrip:false, filt:false, sig:'', verbs:[], fnItems:[], modalClose:null, modalPrev:null };
  const lsGet = k => { try{ return localStorage.getItem(k); }catch(e){ return null; } };
  const lsSet = (k, v) => { try{ if(v == null) localStorage.removeItem(k); else localStorage.setItem(k, v); }catch(e){} };

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
  const hudSheetIds = [['add-sheet', 'add-backdrop'], ['qr-sheet', 'qr-backdrop'], ['lay-sheet', 'lay-backdrop']];
  function hudCloseSheets(except){
    lgClose(); routeClose();
    if(!hudReady) return;
    hudSheetIds.forEach(p => { if(p[0] !== except){ hudEl(p[0]).classList.remove('open'); hudEl(p[1]).classList.remove('open'); } });
    if(except !== 'qr-sheet') hud.qrAttr = '';      // o atributo escolhido na folha Rolar vale só enquanto ela está aberta
    if(except !== 'feed' && !hudCol()){ hud.feed.sheet = false; hud.feed.tall = false; hudFeedLayout(); }
    hudDockSync();
  }
  function hudOpenSheet(id){
    areaClose();
    closeHub(); closeDrawer(); closeNavDrawer(); closeInventory();
    hudCloseSheets(id);
    const pair = hudSheetIds.find(p => p[0] === id);
    hudEl(pair[0]).classList.add('open'); hudEl(pair[1]).classList.add('open');
    if(id === 'qr-sheet') guiaOferecer('rolagem');
    hudDockSync();
    stagger(hudEl(id));
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

  // ---- dock (f23): Mapa, Ficha, Mochila, Mesa. O dado fica à parte, sempre à mão ----
  const HUD_DOCK = [['dock-map', 'map', 'Mapa'], ['dock-ficha', 'user', 'Ficha'], ['dock-inv', 'bag', 'Mochila'], ['dock-mesa', 'users', 'Mesa']];
  function hudDockBuild(){
    hudEl('dock').innerHTML = HUD_DOCK.map(d => `<button type="button" class="dock-btn" id="${d[0]}" aria-pressed="false">${ic(d[1], 22)}<span>${d[2]}</span><i class="dock-live" hidden></i></button>`).join('');
    hudEl('dock-roll').innerHTML = ic('dice', 28);
  }
  function hudDockSync(){
    if(!hudReady) return;
    const inv = invDrawer.classList.contains('open'), mesa = f23MesaVisible(), saque = saqueDrawer.classList.contains('open'), hubOpen = hubDrawer.classList.contains('open');
    const ficha = hudCol() ? !hud.miniOff : (hubOpen && hubGroupOf(hub.tab) === 'ficha');
    const sheets = hudIsOpen('qr-sheet') || hudIsOpen('add-sheet') || hudIsOpen('lay-sheet');
    const st = { 'dock-roll':hudIsOpen('qr-sheet'), 'dock-ficha':ficha, 'dock-inv':inv, 'dock-mesa':mesa };
    st['dock-map'] = !(sheets || inv || saque || hubOpen || rosterDrawer.classList.contains('open') || tacUI.open || (!hudCol() && (mesa || ficha)));
    Object.keys(st).forEach(k => { const b = hudEl(k); if(b){ b.classList.toggle('active', !!st[k]); b.setAttribute('aria-pressed', String(!!st[k])); } });
    const lc = hudEl('mchip-layers'); if(lc){ lc.classList.toggle('active', hudIsOpen('lay-sheet')); lc.setAttribute('aria-expanded', String(hudIsOpen('lay-sheet'))); }
    const ac = hudEl('mchip-add'); if(ac){ ac.classList.toggle('active', hudIsOpen('add-sheet')); ac.setAttribute('aria-expanded', String(hudIsOpen('add-sheet'))); }
    document.body.classList.toggle('tac-on', !!tacUI.open);
    document.body.classList.toggle('sheet-open', sheets);
    document.body.classList.toggle('mesa-open', mesa && !hudCol());
    document.body.classList.toggle('panel-open', [saqueDrawer, invDrawer, hubDrawer, navDrawer, rosterDrawer].some(el => el.classList.contains('open')));
  }
  function hudTacLive(sc){
    F23.tacLive = !!sc;
    if(!hudReady) return;
    f23RenderMstrip(); f23RenderVerbs();
  }
  function hudTactical(){
    if(tacUI.open){ tacClose(); return; }
    const sc = tac.active && tac.scenes[tac.active];
    if(!sc && !isMaster()){ toast('Nenhuma cena tática ativa no momento. O mestre precisa ativar uma.', true); return; }
    hudCloseSheets(); tacOpen();
  }
  // fecha tudo e deixa só o mapa
  function hudShowMap(){
    hudCloseSheets(); closeHub(); closeDrawer(); closeNavDrawer(); closeInventory();
    if(!hudCol() && hud.feed.sheet) hudFeedOpen(false);
    if(tacUI.open) tacClose();
    f23CloseMstrip(); f23CloseFilters();
    hudDockSync();
  }
  function hudOpenSaque(){ hudCloseSheets(); hudEnsureWho(); openDrawer(); }
  function hudWireDock(){
    hudEl('dock-roll').addEventListener('click', () => hudToggleSheet('qr-sheet', () => { hud.qrAttr = ''; hudRenderQR(); }));
    hudEl('dock-map').addEventListener('click', hudShowMap);
    hudEl('dock-ficha').addEventListener('click', f23ToggleFicha);
    hudEl('dock-inv').addEventListener('click', () => { if(invDrawer.classList.contains('open')){ closeInventory(); return; } hudCloseSheets(); hudEnsureWho(); openInventory(null); });
    hudEl('dock-mesa').addEventListener('click', f23ToggleMesa);
    // o dock reflete o que está aberto, mesmo quando outra parte do app abre/fecha as folhas
    const mo = new MutationObserver(hudDockSync);
    [saqueDrawer, invDrawer, hubDrawer, navDrawer, rosterDrawer, hudEl('qr-sheet'), hudEl('add-sheet')].forEach(el => mo.observe(el, { attributes:true, attributeFilter:['class'] }));
    document.addEventListener('keydown', e => { if(e.key === 'Escape' && (hudIsOpen('add-sheet') || hudIsOpen('qr-sheet') || hudIsOpen('lay-sheet') || (hud.feed.sheet && !hudCol()))) hudCloseSheets(); });
    ['add', 'qr', 'lay'].forEach(k => {
      hudEl(k + '-backdrop').addEventListener('click', () => hudCloseSheets());
      hudDrag(hudEl(k + '-sheet'), () => hudCloseSheets());
    });
    hudEl('add-close').addEventListener('click', () => hudCloseSheets());
    hudEl('lay-close').addEventListener('click', () => hudCloseSheets());
    // ao escolher uma ferramenta do mapa a folha se fecha para você tocar no mapa
    hudEl('idx-add-body').addEventListener('click', e => { if(e.target.closest('.tool-btn')) setTimeout(() => hudCloseSheets(), 120); });
    hudEl('tool-roster').addEventListener('click', () => openRoster());
  }

  // ---- funções do app (alimentam a busca única; o antigo Índice foi removido) ----
  function hudIndexItems(){
    const m = isMaster(), mods = cfg().modules, adv = f23Adv();
    const tab = (t, extra) => () => { hudCloseSheets(); const w = hudWho(); if(w && t === 'ficha') hub.charToken = w; openHub(t); if(extra) extra(); };
    const pinWords = PIN_TYPES.map(t => t.label).join(' ');
    const L = [
      { id:'add', ic:'plus', t:'Marcar no mapa', d:m ? 'Pins, token, nota, áreas e rotas' : 'Nota e token', kw:'marcar adicionar nota token pin ' + (m ? 'area rota medir selecionar ' + pinWords : ''), run:() => { hudCloseSheets(); hudToggleSheet('add-sheet'); } },
      { id:'list', ic:'layers', t:'Camadas e lista do mapa', d:'Mapa-base e ir até pins, tokens, áreas e rotas', kw:'lista navegar viagem rapida buscar mapa camadas base satelite ruas filtros', run:() => { hudCloseSheets(); hudToggleSheet('lay-sheet', () => renderNavList(true)); } },
      { id:'char', ic:'user', t:'Ficha', d:'Perícias, ataques, poderes e condições', kw:'ficha personagem pericia ataque condicao atributo poder', run:tab('ficha') },
      { id:'inv', ic:'bag', t:'Mochila', d:'Itens, equipamento e trocas', kw:'mochila inventario item equipar trocar', run:() => { hudCloseSheets(); hudEnsureWho(); openInventory(null); } },
      { id:'roll', ic:'dice', t:'Rolar dados', d:'d20, perícias e ataques', kw:'rolar dado dados d20 teste', run:() => hudOpenQuickRoll() },
      { id:'diary', ic:'book', t:'Diário', d:'Pistas, objetivos e linha do tempo', kw:'diario pista objetivo nota linha tempo', run:tab('diario') },
      { id:'roster', ic:'users', t:'Personagens (gaveta)', d:'Criar e guardar personagens; colocar no mapa quando quiser', kw:'gaveta personagem personagens npc guardar colocar criar modelo copia', run:() => { hudCloseSheets(); openRoster(); } },
      { id:'group', ic:'users', t:'Grupo', d:'Personagens e participantes da mesa', kw:'grupo jogadores participantes', run:tab('grupo') },
      m ? { id:'session', ic:'list', t:'Sessão', d:'Abrir, encerrar e resumir sessões', kw:'sessao resumo encerrar', run:tab('sessao') } : null,
      { id:'world', ic:'map', t:'Mundo', d:'Relógio, locais e exploração', kw:'mundo relogio locais exploracao hora dia', run:tab('mundo') },
      mods.crafting ? { id:'craft', ic:'tool', t:'Ofício', d:'Receitas e fabricação', kw:'oficio receita fabricar craft', run:tab('oficio') } : null,
      { id:'dice', ic:'dice', t:'Dados completos', d:'Construtor de rolagens, atalhos e histórico', kw:'dados completos rolagem atalho historico expressao construtor', run:tab('dados') },
      { id:'loot', ic:'compass', t:'Saque e pesca', d:'Locais, pesca e tabela completa de itens', kw:'saque pesca procurar expedicao tabela itens discord webhook', run:() => hudOpenSaque() },
      { id:'tac', ic:'swords', t:'Mapa tático', d:'Cena de combate, grade e turnos', kw:'tatico combate grade turno iniciativa cena', run:() => hudTactical() },
      { id:'weather', ic:'snow', t:'Clima', d:m ? 'Ver e mudar o clima da mesa' : 'Ver o clima da mesa', kw:'clima tempo neblina vento tempestade nevasca animacao', run:() => { hudCloseSheets(); openWeatherPopover(); } },
      m ? { id:'scene', ic:'swords', t:'Cena da mesa', d:'Exploração, Combate ou Descanso', kw:'cena exploracao combate descanso verbos', run:() => { f23OpenMstrip(); } } : null,
      { id:'camp', ic:'layers', t:'Campanhas', d:'Trocar, criar e convidar com código', kw:'campanha convite codigo trocar nova arquivar excluir entrar', run:tab('campanhas') },
      m ? { id:'cfg', ic:'sliders', t:'Configuração da campanha', d:'Nome, sistema, módulos e progressão', kw:'configuracao config nome sistema modulos nex nivel inventario', run:tab('campanhas', () => { hub.mx = hub.mx || {}; hub.mx['c-cfg'] = true; renderHub(); setTimeout(() => { const a = hudEl('cfg-anchor'); if(a) a.scrollIntoView({ block:'start' }); }, 60); }) } : null,
      m ? { id:'master', ic:'lock', t:'Mestre', d:'Contêineres, recursos e backup', kw:'mestre conteiner backup restaurar recursos espacos necessidades', run:tab('mestre') } : null,
      m && adv ? { id:'csv', ic:'copy', t:'Registro de itens (CSV)', d:'Baixar o histórico de transações do inventário', kw:'registro csv exportar historico log baixar', run:() => { hudCloseSheets(); exportLogCsv(); } } : null,
      { id:'cfgapp', ic:'sliders', t:'Ajustes do app', d:'Ferramentas avançadas, mochila, atalhos e introdução', kw:'ajustes configuracoes avancadas ferramentas som instalar atalhos introducao tour lista grade', run:() => { hudCloseSheets(); f23OpenSettings(); } }
    ];
    return L.filter(Boolean);
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
    let html = `<div class="sheet-grab" aria-hidden="true"></div><div class="sheet-head"><b>Rolar</b><button type="button" class="guia-q" data-guia="rolagem" title="Dica rápida" aria-label="Dica rápida: rolagem">?</button><button type="button" class="sheet-x" data-hud="close" aria-label="Fechar">${ic('close', 18)}</button></div>
      ${last ? `<div class="qr-last${last.sheet && last.sheet.crit ? ' crit' : ''}" role="status"><div class="qr-last-total">${last.total}</div><div><b>${esc(last.whoName || '')} · ${esc(last.skill || 'Rolagem')}</b><span>${esc(hudRollLine(last))}</span></div></div>` : ''}
      <select id="qr-who" class="qr-who" data-hud-who data-native aria-label="Rolando como"><option value="">Sem personagem</option>${editable.map(x => opt(x.id, (x.type === 'npc' ? 'NPC · ' : '') + x.name, w)).join('')}</select>
      <div class="qr-dice">${DIE_SIDES.map(s => `<button type="button" class="qr-die" data-hud="die" data-s="${s}" aria-label="Rolar d${s}">${dieSvg(s, 'd' + s, '', 'd' + s)}</button>`).join('')}<button type="button" class="qr-die qr-more" data-hud="full" aria-label="Mais dados">${ic('more', 22)}<span>Mais</span></button></div>
      <div class="qr-advs"><button type="button" class="inv-mini-btn" data-hud="adv" title="2d20, fica o maior">Vantagem</button><button type="button" class="inv-mini-btn" data-hud="dis" title="2d20, fica o menor">Desvantagem</button></div>
      <div class="expr-row"><input type="text" id="qr-expr" placeholder="Fórmula: 2d6+3" aria-label="Fórmula de dados" autocomplete="off" value="${esc(hud.qrExpr || '')}"><button type="button" class="inv-mini-btn primary" data-hud="expr">${ic('dice', 16)} Rolar</button></div>`;
    if(ordem && can){
      const rows = Object.keys(card.skillsV2 || {}).map(k => opSkillDef(card, k)).sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
      const ov = opAttrOk(hud.qrAttr), pp = k => opParts(card, k, ov, 'skill');
      html += `<div class="hub-label">Atributo</div>
        <select id="qr-attr" data-hud-attr aria-label="Atributo desta rolagem"><option value="">Automático</option>${OP_ATTRS.map(x => opt(x[0], x[1] + ' ' + opAttrOf(card, x[0]), ov || '')).join('')}</select>
        <div class="hub-label">Perícias</div><div class="qr-chips">${rows.map(sd => { const q = pp(sd.key); return `<button type="button" class="qr-chip" data-hud="skill" data-k="${esc(sd.key)}" title="${esc(opPoolHelp(q.pool))}"><span>${esc(sd.name)}</span><b>${q.pool.label}${opSgn(opSum(q))}</b></button>`; }).join('') || '<span class="hub-hint">Adicione perícias na ficha.</span>'}</div>`;
      const wl = weaponsOf(w);
      if(wl.length) html += `<div class="hub-label">Armas</div>${wl.map(x => {
        const ref = ITEMS_BY_ID[x.itemId], a = TVArmas.ataque(x, ref), gun = TVArmas.usaMunicao(ref), q = opParts(card, a.skill, ov || a.attribute, 'attack'), crit = !!(hub.opCrit && hub.opCrit['w:' + x.uid]);
        return `<div class="qr-atk"><span><b>${esc(x.name)}</b><small>${esc(a.damage || '—')}${gun ? ' · ' + magOf(x) + '/' + magCap(x) : ''}</small></span>
        ${gun && !magOf(x) ? `<button type="button" class="inv-mini-btn primary" data-hud="wreload" data-id="${esc(x.uid)}">Recarregar</button>`
          : `<button type="button" class="inv-mini-btn primary" data-hud="watk" data-id="${esc(x.uid)}">${ic('swords', 16)} Atacar ${q.pool.label}${opSgn(opSum(q))}</button>`}
        <button type="button" class="inv-mini-btn ${crit ? 'op-crit-btn' : ''}" data-hud="wdmg" data-id="${esc(x.uid)}">Só dano${crit ? ' crítico' : ''}</button></div>`; }).join('')}`;
      if((card.attacks || []).length) html += `<div class="hub-label">Ataques</div>${card.attacks.map(a => { const crit = !!(hub.opCrit && hub.opCrit[a.id]); return `<div class="qr-atk"><span><b>${esc(a.name || 'Ataque')}</b><small>${esc(a.damage || '—')}</small></span>
        <button type="button" class="inv-mini-btn primary" data-hud="atk" data-id="${esc(a.id)}">${ic('dice', 16)} Ataque ${(() => { const q = opParts(card, a.skill || '', ov || a.attribute || '', 'attack'); return q.pool.label + opSgn(opSum(q)); })()}</button>
        <button type="button" class="inv-mini-btn ${crit ? 'op-crit-btn' : ''}" data-hud="dmg" data-id="${esc(a.id)}">Dano${crit ? ' crítico' : ''}</button></div>`; }).join('')}`;
    } else if(card && can && (card.skills || []).length){
      html += `<div class="hub-label">Perícias salvas</div><div class="qr-chips">${card.skills.map((s, i) => `<button type="button" class="qr-chip" data-hud="lskill" data-i="${i}"><span>${esc(s.name || 'Perícia')}</span><b>${opSgn(opNum(s.bonus))}</b></button>`).join('')}</div>`;
    }
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
        case 'adv': await hudRoll([{ sign:1, n:2, sides:20, kh:1 }], [], 'Vantagem'); break;
        case 'dis': await hudRoll([{ sign:1, n:2, sides:20, kl:1 }], [], 'Desvantagem'); break;
        case 'expr': { const pe = parseExpr(hud.qrExpr || ''); if(pe.error){ toast(pe.error, true); break; } await hudRoll(pe.terms, pe.bonus ? [{ label:'Fixo', value:pe.bonus }] : [], String(hud.qrExpr).trim()); break; }
        case 'skill': await opRollSkill(D.k, w, hud.qrAttr); break;
        case 'atk': await opRollAttack(D.id, w, hud.qrAttr); break;
        case 'dmg': await opRollDamage(D.id, w); break;
        case 'watk': await opWeaponAttack(D.id, w, hud.qrAttr); break;
        case 'wdmg': await opRollDamage('w:' + D.id, w); break;
        case 'wreload': await doRecarregar(w, D.id); break;
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
    const f = hud.feed; f.f = 'all'; f.m = 'all'; f.collapsed = (window.innerWidth || 1400) < 1360; hud.miniOff = false; f.seen = Date.now(); f.open = null; f.more = false; f.sheet = false; f.tall = false;
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
  var feedPrev = null;
  function hudRenderFeed(){
    const f = hud.feed, items = hudFeedVisible(), master = isMaster();
    hudEl('feed-filters').innerHTML = HUD_FEED_FILTERS.map(x => `<button type="button" class="fd-chip${f.f === x[0] ? ' on' : ''}" data-fd="filter" data-v="${x[0]}" aria-pressed="${f.f === x[0]}">${x[1]}</button>`).join('');
    const mf = hudEl('feed-mfilters'); mf.hidden = !master;
    if(master) mf.innerHTML = HUD_FEED_M.map(x => `<button type="button" class="fd-chip${f.m === x[0] ? ' on' : ''}" data-fd="mfilter" data-v="${x[0]}" aria-pressed="${f.m === x[0]}">${x[1]}</button>`).join('');
    const shown = items.slice(0, HUD_FEED_MAX), list = hudEl('feed-list');
    list.innerHTML = shown.length ? shown.map(hudRow).join('')
      : '<div class="inv-empty">Nada por aqui ainda.</div>';
    // só o item novo entra deslizando; os antigos não se mexem
    if(feedPrev && !f26Reduced.matches && list.children.length === shown.length) shown.forEach((it, i) => { if(!feedPrev.has(it.key)) list.children[i].classList.add('f26-new'); });
    feedPrev = new Set(shown.map(it => it.key));
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
    f23DockBadge(n && !visibleNow ? n : 0);
  }
  function hudMarkSeen(){ const f = hud.feed; if(!(hudCol() ? !f.collapsed : f.sheet) || F23.mesaTab !== 'feed') return; const top = hudFeedItems()[0]; const t = Math.max(f.seen, top ? top.ts : 0, Date.now() - 2000); if(t !== f.seen){ f.seen = t; hudSavePrefs(); } }
  // f25: scope 'feed' | 'mini' redesenha só o painel que mudou. Fechar a ficha não refaz o feed nem a mesa (e vice-versa),
  // e um painel fechado não é redesenhado.
  function hudFeedLayout(scope){
    const f = hud.feed, col = hudCol(), feed = hudEl('feed');
    document.body.classList.toggle('feed-col', col && !f.collapsed);
    document.body.classList.toggle('mini-col', col && !hud.miniOff);
    const open = col ? !f.collapsed : f.sheet;
    feed.classList.toggle('open', open); feed.classList.toggle('tall', !col && (f.tall || F23.mesaTab !== 'feed'));
    if(open && !feed._f26Open){ feedPrev = null; stagger(feed); }   // só na abertura
    feed._f26Open = open;
    hudEl('feed-backdrop').classList.toggle('open', !col && f.sheet);
    hudEl('feed-close').setAttribute('aria-label', col ? 'Recolher o feed' : 'Fechar o feed');
    if(open) hudMarkSeen();
    if(!scope || scope === 'feed'){ if(open){ f23RenderMesa(); hudRenderFeed(); } else hudFeedChip(); }
    if(!scope || scope === 'mini') hudRenderMini();
    hudDockSync();
  }
  function hudFeedOpen(v){
    const f = hud.feed;
    if(hudCol()){ f.collapsed = !v; hudSavePrefs(); }
    else { if(v){ closeHub(); closeDrawer(); closeNavDrawer(); closeInventory(); hudCloseSheets('feed'); } f.sheet = !!v; if(!v) f.tall = false; }
    hudFeedLayout('feed');
  }
  // o feed mostra só os 40 mais recentes; o histórico de rolagens guardado no banco é podado acima de 60 (o registro de itens e o diário não são tocados)
  const HUD_FEED_MAX = 40, HUD_ROLLS_KEEP = 60;
  function hudPruneRolls(){
    if(!(isMaster() || !(campaignMeta && campaignMeta.masterId))) return;
    const ks = Object.keys(rolls).filter(k => rolls[k]).sort((a, b) => (rolls[b].ts || 0) - (rolls[a].ts || 0));
    ks.slice(HUD_ROLLS_KEEP).forEach(k => { delete rolls[k]; DB.set(scopedKey(KEY_ROLLS) + '/' + k, null); });
  }
  function hudFeedChanged(){
    if(!hudReady) return;
    hudPruneRolls();
    const f = hud.feed;
    if(hudCol() ? !f.collapsed : f.sheet){ hudMarkSeen(); hudRenderFeed(); }
    else hudFeedChip();   // feed fechado: só atualiza o chip/contador
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

  // ---- ficha na coluna da esquerda (f23): a ficha COMPLETA, no mesmo desenho da gaveta ----
  // Cabeçalho (retrato, PV, PD, defesas) e abas ficam fixos; só o conteúdo da aba rola.
  function hudRenderMini(){
    const el = hudEl('mini'); if(!el) return;
    const tab = hudEl('mini-tab');
    if(!hudCol()){ el.hidden = true; if(tab) tab.hidden = true; return; }
    el.hidden = !!hud.miniOff;
    if(tab){ tab.hidden = !hud.miniOff; tab.innerHTML = ic('user', 20); tab.setAttribute('aria-expanded', 'false'); }
    if(hud.miniOff) return;
    const ae = document.activeElement;
    if(ae && el.contains(ae) && /^(INPUT|TEXTAREA|SELECT)$/.test(ae.tagName)){ hubDirty = true; return; }
    renderHubView(hubViewDefs()[1]);
  }
  function f23RenderFicha(fn){
    const hl = holderList().filter(canEditHolder);   // como no mini antigo: jogador só vê os próprios; o mestre vê todos
    if(!hl.some(h => h.id === hub.charToken)){ const w = hudWho(); if(w) hub.charToken = w; }
    fichaDocked = true;
    let inner = '';
    try{ inner = fn ? fn() : ''; }catch(err){ console.error(err); inner = '<div class="inv-empty">Não foi possível desenhar a ficha.</div>'; }
    finally{ fichaDocked = false; }
    const tmp = document.createElement('div'); tmp.innerHTML = inner;
    const card = tmp.querySelector('.ox-card'), tabs = tmp.querySelector('.ox-tabs'), ox = tmp.querySelector('.ox');
    let fixed = '';
    if(card){ fixed += card.outerHTML; card.remove(); }
    if(tabs){ fixed += tabs.outerHTML; tabs.remove(); }
    const hCur = holderById(hub.charToken);
    const who = hl.length > 1 ? holderSelect('hub.charToken', hub.charToken, false, hl) : (!card && hCur ? `<b class="fp-name">${esc(hCur.name)}</b>` : '');
    const st = fichapBody.scrollTop;
    fpHead.innerHTML = `<div class="fp-top"><span class="fp-tag">Ficha</span><div class="fp-who">${who}</div>
      <button type="button" class="fp-btn" data-hud="mroster" aria-label="Abrir a gaveta de personagens" title="Personagens (gaveta)">${ic('users', 18)}</button>
      <button type="button" class="fp-btn" data-hud="minv" aria-label="Abrir a mochila" title="Mochila">${ic('bag', 18)}</button>
      <button type="button" class="fp-btn guia-q" data-guia="ficha" aria-label="Dica rápida: ficha e armas" title="Dica rápida">?</button>
      <button type="button" class="fp-btn" data-hud="mhide" aria-label="Recolher o painel da ficha" title="Recolher">${ic('close', 18)}</button></div>${fixed ? `<div class="ox" data-optab="${esc(ox ? ox.dataset.optab || '' : '')}">${fixed}</div>` : ''}`;
    fichapBody.innerHTML = tmp.innerHTML;
    fichapBody.scrollTop = st;
  }
  // adiado para o próximo ciclo: um campo que perde o foco dispara "change" ANTES de o foco chegar ao campo seguinte, e redesenhar nesse instante derrubava o toque no PD logo depois do PV
  let miniT = 0;
  function hudMiniChanged(){ if(!hudReady || miniT) return; miniT = setTimeout(() => { miniT = 0; hudRenderMini(); }, 0); }
  function hudWireMini(){
    const el = hudEl('mini');
    hudEl('mini-tab').addEventListener('click', () => { hud.miniOff = false; hudSavePrefs(); hudFeedLayout('mini'); guiaOferecer('ficha'); });
    el.addEventListener('click', e => {
      const b = e.target.closest('[data-hud]'); if(!b) return;
      const w = hudWho();
      if(b.dataset.hud === 'mhide'){ hud.miniOff = true; hudSavePrefs(); hudFeedLayout('mini'); setTimeout(() => { const t = hudEl('mini-tab'); if(t) t.focus(); }, 0); }
      else if(b.dataset.hud === 'minv'){ hudEnsureWho(); openInventory(w); }
      else if(b.dataset.hud === 'mroster') openRoster();
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
    const nav = hudEl('filt-pop'); if(!nav) return;
    const cnt = mapfCounts();
    nav.querySelectorAll('[data-mf]').forEach(b => {
      const k = b.dataset.mf, off = hud.mapf.has(k), label = MAPF.find(x => x[0] === k)[1];
      b.classList.toggle('off', off); b.setAttribute('aria-pressed', String(!off));
      b.setAttribute('aria-label', label + ' (' + cnt[k] + '): ' + (off ? 'ocultos. Toque para mostrar' : 'visíveis. Toque para ocultar'));
      const n = b.querySelector('.mc-n'); if(n) n.textContent = cnt[k] ? String(cnt[k]) : '';
    });
    const fb = hudEl('mchip-filters'), fn = hudEl('mchip-filters-n');
    if(fb){ fb.classList.toggle('has-off', !!hud.mapf.size); fb.setAttribute('aria-label', hud.mapf.size ? 'Filtros do mapa: ' + hud.mapf.size + ' categoria(s) oculta(s)' : 'Filtros do mapa: tudo visível'); }
    if(fn){ fn.textContent = hud.mapf.size ? String(hud.mapf.size) : ''; fn.hidden = !hud.mapf.size; }
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
    hudEl('filt-pop').addEventListener('click', e => { const b = e.target.closest('[data-mf]'); if(b) mapfToggle(b.dataset.mf); });
    hudEl('map-chips').addEventListener('click', e => {
      const b = e.target.closest('button'); if(!b) return;
      if(b.id === 'mchip-layers'){ f23CloseFilters(); f23CloseMstrip(); hudToggleSheet('lay-sheet', () => renderNavList(true)); }
      else if(b.id === 'mchip-filters') f23ToggleFilters();
      else if(b.id === 'mchip-add'){ f23CloseFilters(); f23CloseMstrip(); hudToggleSheet('add-sheet', f23PrepAdd); }
      else if(b.id === 'mchip-master') f23ToggleMstrip();
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
  // MAPA DE REMOÇÃO (para tirar o módulo de vez: apagar do app.js, do index.html e do style.css; nada mais depende dele):
  //  app.js    1) constantes PLACES_ON, PLACE_* e placesLayer (perto do pinsLayer)
  //            2) este módulo inteiro, de "lugares reais (OpenStreetMap)" até placeExplore() (a função hudCampaignChanged() vem logo depois)
  //            3) chamadas soltas: plDraw() em renderPins/renderTokens, plWarmSoon() em renderTokens, placesRefresh() em applyConfig,
  //               plClear()/placesRefresh() em hudCampaignChanged, plPurge()/plDropAll()/moveend/pl-status em hudInit
  //            4) filtro do mapa: ['lugares', 'Lugares'] em MAPF e lugares:pl.total em mapfCounts
  //            5) configuração: DEFAULT_MODULES.places, "places" em cfg(), em saveConfig() e em hub.cfgDraft (placeCats/placeReveal),
  //               modLabels.places, o bloco "Lugares reais: categorias" e o case 'pl-test'
  //  index.html  o chip data-mf="lugares", o <div id="pl-status"> e o <script> do window.TV_PLACES
  //  style.css   .pl-mk, .pl-badge, .pl-pop, .pl-name, .pl-meta, #pl-status, .pl-test-out e .mk-lugares/.hf-lugares
  //  Fica de propósito: o texto "Lugar real · OpenStreetMap" no popup de pins antigos (campo pin.osm) e os pins já criados.
  // FONTE DE DADOS: só plQuery, plOrder, plRace, plParse, plFetchTiles, plTest e PLACE_API falam com o OpenStreetMap (Overpass).
  // O resto (guardado por bloco, desenho, filtro, aviso, criação do pin no Vasculhar) não sabe de onde vêm os lugares: para trocar de fonte,
  // basta plFetchTiles(tiles, outer) continuar chamando plPut(bloco, lista) com itens { k, lat, lng, name, cat, tag, addr }.
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
  // interruptor desligado: libera o espaço do aparelho (blocos de mapa e servidor lembrado). É só guardado, nada da mesa.
  function plDropAll(){
    try{
      const ks = [];
      for(let i = 0; i < localStorage.length; i++){ const k = localStorage.key(i); if(k && (k.indexOf('tv-poi') === 0 || k === 'tv-op-mirror')) ks.push(k); }
      ks.forEach(k => localStorage.removeItem(k));
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
    const out = document.getElementById('pl-test-out'); if(!PLACES_ON || !out) return;
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
  function placesEnabled(){ return PLACES_ON && !!cfg().modules.places; }
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

  // ================= f23: PAINÉIS, PAPÉIS, CENAS E AJUSTES =================
  // Papéis: o jogador cria só notas e tokens. Pins de tipo, áreas, rotas, a faixa do mestre e a troca de cena são do mestre.
  // Painéis: no desktop a tela vira Ficha | Mapa | Mesa; no celular o dock abre Ficha, Mochila e Mesa como folhas.
  // Cenas: o mestre escolhe Exploração, Combate ou Descanso; a barra de verbos e a aba da ficha acompanham a cena (todos veem).
  const SCENES = [
    { id:'explorar', name:'Exploração', ic:'compass', hint:'Procurar itens, marcar o mapa e testar perícias.' },
    { id:'combate', name:'Combate', ic:'swords', hint:'Ataques, defesas, poderes e a ordem dos turnos.' },
    { id:'descanso', name:'Descanso', ic:'heart', hint:'Recuperar, anotar no diário e fabricar.' }
  ];
  const sceneById = id => SCENES.find(s => s.id === id) || SCENES[0];
  const f23Adv = () => lsGet(LS_ADV) === '1';
  const f23Typing = () => { const a = document.activeElement; return !!(a && (/^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName) || a.isContentEditable)); };

  // ---- sinais: papel, avançado, módulos. Só redesenha o que mudou ----
  function f23Refresh(force){
    if(!hudReady) return;
    const m = isMaster(), adv = f23Adv(), sig = [m, adv, activeCampaignId, !!cfg().modules.crafting, !!cfg().modules.explore, F23.tacLive].join('|');
    if(!force && sig === F23.sig) return;
    F23.sig = sig;
    document.body.classList.toggle('role-master', m); document.body.classList.toggle('role-player', !m);
    document.body.classList.toggle('adv-on', adv);
    if(!m && selectedPinType && selectedPinType !== 'nota') clearModes();
    const l = hudEl('add-pins-label'); if(l) l.textContent = m ? 'Pins' : 'Nota';
    f23RenderMstrip(); f23RenderVerbs(); f23RenderCfg(); f23RenderMesa(); hubTitleSync();
    if(hudEl('hud-search').classList.contains('open')) f23RenderSearchFns(hudEl('search-input').value.trim());
  }

  // ---- Mesa: Feed | Grupo | Diário | Mundo | Ofício, no mesmo painel ----
  function f23MesaVisible(){ return hudCol() ? !hud.feed.collapsed : !!hud.feed.sheet; }
  function f23OpenMesa(tab){
    F23.mesaTab = hubTabsFor('mesa').some(t => t[0] === tab) ? tab : 'feed';
    lsSet(LS_MESAT, F23.mesaTab);
    if(!f23MesaVisible()){ hudFeedOpen(true); guiaOferecer('mesa'); return; }
    hudFeedLayout();
    guiaOferecer('mesa');
  }
  function f23ToggleMesa(){
    if(f23MesaVisible()){ hudFeedOpen(false); return; }
    f23OpenMesa(F23.mesaTab);
  }
  function f23RenderMesa(){
    const box = hudEl('mesa-tabs'); if(!box) return;
    const tabs = hubTabsFor('mesa');
    if(!tabs.some(t => t[0] === F23.mesaTab)) F23.mesaTab = 'feed';
    const ae = document.activeElement, keepTab = ae && box.contains(ae) ? ae.dataset.mesa : null;
    box.innerHTML = tabs.map(t => `<button type="button" role="tab" class="mesa-tab${F23.mesaTab === t[0] ? ' active' : ''}" id="mesa-tab-${t[0]}" data-mesa="${t[0]}" aria-selected="${F23.mesaTab === t[0]}" tabindex="${F23.mesaTab === t[0] ? 0 : -1}">${t[1]}</button>`).join('');
    if(keepTab){ const n = box.querySelector('[data-mesa="' + keepTab + '"]'); if(n) n.focus({ preventScroll:true }); }
    tabInd(box, 8);
    const feedOn = F23.mesaTab === 'feed';
    hudEl('mesa-feed').hidden = !feedOn; mesaBody.hidden = feedOn;
    if(feedOn || !f23MesaVisible()) return;
    if(ae && mesaBody.contains(ae) && /^(INPUT|TEXTAREA|SELECT)$/.test(ae.tagName)){ hubDirty = true; return; }
    const st = mesaBody.scrollTop; renderHubView(hubViewDefs()[2]); mesaBody.scrollTop = st;
  }
  function f23DockBadge(n){
    const b = document.querySelector('#dock-mesa .dock-live'), btn = hudEl('dock-mesa'); if(!b || !btn) return;
    b.hidden = !n; b.textContent = n > 9 ? '9+' : (n ? String(n) : '');
    btn.setAttribute('aria-label', 'Mesa' + (n ? ', ' + n + ' novas' : ''));
  }

  // ---- Ficha: painel da esquerda no desktop, folha no celular ----
  function f23ShowFicha(){
    if(hudCol()){ hud.miniOff = false; hudSavePrefs(); hudFeedLayout('mini'); guiaOferecer('ficha'); return; }
    hudCloseSheets(); hudEnsureWho(); const w = hudWho(); if(w) hub.charToken = w;
    openHub('ficha');
  }
  function f23ToggleFicha(){
    if(hudCol()){ hud.miniOff = !hud.miniOff; hudSavePrefs(); hudFeedLayout('mini'); if(!hud.miniOff) guiaOferecer('ficha'); return; }
    if(hubDrawer.classList.contains('open') && hubGroupOf(hub.tab) === 'ficha'){ closeHub(); return; }
    f23ShowFicha();
  }
  function f23FichaTab(tab){
    const w = hudWho(); if(w) hub.charToken = w;
    if(OP_TABS.some(t => t[0] === tab)) hub.opTab = tab;
    hudCloseSheets(); f23CloseMstrip();
    if(hudCol()){ hud.miniOff = false; hudSavePrefs(); hudFeedLayout('mini'); }
    else { hudEnsureWho(); openHub('ficha'); }
  }
  async function f23RollDef(key){
    const w = hudWho(), h = holderById(w);
    if(!w || !h || !canEditHolder(h)){ toast('Escolha um personagem seu na ficha para rolar.', true); f23ShowFicha(); return; }
    await opRollSkill(key, w, '');
  }

  // ---- filtros em painel único ("Filtros · n") ----
  function f23FiltSync(){
    const p = hudEl('filt-pop'), b = hudEl('mchip-filters'); if(!p || !b) return;
    p.hidden = !F23.filt; b.setAttribute('aria-expanded', String(F23.filt)); b.classList.toggle('active', F23.filt);
  }
  function f23ToggleFilters(){ if(F23.filt){ f23CloseFilters(); return; } f23CloseMstrip(); F23.filt = true; f23FiltSync(); }
  function f23CloseFilters(){ if(!F23.filt) return; F23.filt = false; f23FiltSync(); }

  // ---- faixa do mestre: cena, clima, sessão, tático, saque, mestre, campanha ----
  function f23RenderMstrip(){
    const el = hudEl('mstrip'), chip = hudEl('mchip-master'); if(!el || !chip) return;
    const m = isMaster(), sc = sceneById(F23.scene);
    chip.hidden = !m;
    if(!m){ el.hidden = true; F23.mstrip = false; return; }
    const t = chip.querySelector('.mc-t'); if(t) t.textContent = 'Mestre · ' + sc.name;
    const fa = document.activeElement && el.contains(document.activeElement) ? document.activeElement.dataset : null;
    el.innerHTML = `<div class="ms-label">Cena da mesa <span>todos veem</span><button type="button" class="guia-q" data-guia="mestre" title="Dica rápida" aria-label="Dica rápida: ferramentas do mestre">?</button></div>
      <div class="ms-scene" role="group" aria-label="Cena da mesa">${SCENES.map(s => `<button type="button" class="ms-seg${s.id === F23.scene ? ' on' : ''}" data-ms="scene" data-id="${s.id}" aria-pressed="${s.id === F23.scene}">${ic(s.ic, 16)}<span>${s.name}</span></button>`).join('')}</div>
      <div class="ms-hint">${esc(sc.hint)}</div>
      <div class="ms-tools">
        <button type="button" role="menuitem" data-ms="weather">${ic('snow', 16)}<span>Clima</span></button>
        <button type="button" role="menuitem" data-ms="tac">${ic('swords', 16)}<span>Tático${F23.tacLive ? ' · ao vivo' : ''}</span></button>
        <button type="button" role="menuitem" data-ms="session">${ic('list', 16)}<span>Sessão</span></button>
        <button type="button" role="menuitem" data-ms="saque">${ic('compass', 16)}<span>Saque</span></button>
        <button type="button" role="menuitem" data-ms="mestre">${ic('lock', 16)}<span>Mestre</span></button>
        <button type="button" role="menuitem" data-ms="camp">${ic('layers', 16)}<span>Campanha</span></button>
      </div>`;
    if(fa && fa.ms){ const n = el.querySelector('[data-ms="' + fa.ms + '"]' + (fa.id ? '[data-id="' + fa.id + '"]' : '')); if(n) n.focus({ preventScroll:true }); }
    el.hidden = !F23.mstrip;
    chip.setAttribute('aria-expanded', String(F23.mstrip)); chip.classList.toggle('active', F23.mstrip);
    chip.classList.toggle('live', F23.tacLive);
  }
  function f23OpenMstrip(){
    if(!isMaster()) return;
    const sp = appPopovers.find(p => p.popover.id === 'hud-search'); if(sp) sp.close();
    hudCloseSheets(); f23CloseFilters(); F23.mstrip = true; f23RenderMstrip();
    guiaOferecer('mestre');
  }
  function f23CloseMstrip(){ if(!F23.mstrip) return; F23.mstrip = false; f23RenderMstrip(); }
  function f23ToggleMstrip(){ if(F23.mstrip){ f23CloseMstrip(); return; } hudEl('mchip-master') && f23OpenMstrip(); }

  // ---- cenas ----
  function f23SceneData(v){
    const id = v && SCENES.some(s => s.id === v.id) ? v.id : 'explorar', prev = F23.scene, first = !F23.sceneSeen;
    F23.scene = id; F23.sceneBy = (v && v.by) || ''; F23.sceneAt = (v && v.at) || 0; F23.sceneSeen = true;
    if(!hudReady) return;
    f23RenderMstrip(); f23RenderVerbs();
    if(first){ if(id !== 'explorar') f23SceneEffects(id); return; }
    if(prev !== id){ toast('Cena: ' + sceneById(id).name + '.'); f23SceneEffects(id); }
  }
  function f23SceneReset(){
    F23.scene = 'explorar'; F23.sceneBy = ''; F23.sceneAt = 0; F23.sceneSeen = false;
    if(hudReady){ f23RenderMstrip(); f23RenderVerbs(); }
  }
  // a ficha abre na aba que combina com a cena (para todos)
  function f23SceneEffects(id){
    const t = { explorar:'pericias', combate:'combate', descanso:'agente' }[id];
    if(t){ hub.opTab = t; if(hudReady) hubChanged(); }
  }
  async function f23SetScene(id){
    if(!isMaster()){ toast('Só o mestre muda a cena.', true); return; }
    if(!SCENES.some(s => s.id === id) || id === F23.scene) return;
    const v = { id, by:actorFields().actorName || 'Mestre', at:Date.now() };
    f23SceneData(v);
    try{ await saveKey(KEY_SCENE, v); }catch(e){ toast('Não foi possível salvar a cena.', true); }
  }

  // ---- barra de verbos: muda com a cena ----
  function f23TurnText(){
    const sid = tac.active, sc = sid && tac.scenes[sid] ? tacScene(sid) : null;
    if(!sc || !sc.turn.on) return '';
    const id = tacTurnId(sc), t = tacTokensOf(sid).find(x => x.id === id);
    return 'Rodada ' + sc.turn.round + ' · Vez de ' + (t ? t.name : '—');
  }
  function f23Verbs(){
    const sc = F23.scene, m = isMaster(), mods = cfg().modules, w = hudWho(), card = w ? characters[w] : null, ordem = !!(card && card.systemId === 'ordem');
    const v = [];
    if(sc === 'explorar'){
      if(mods.explore) v.push({ id:'procurar', ic:'compass', t:'Procurar', run:hudOpenSaque });
      v.push({ id:'marcar', ic:'plus', t:'Marcar', run:() => { f23CloseMstrip(); hudToggleSheet('add-sheet', f23PrepAdd); } });
      v.push({ id:'pericia', ic:'list', t:'Perícia', run:() => f23FichaTab('pericias') });
    } else if(sc === 'combate'){
      v.push({ id:'atacar', ic:'swords', t:'Atacar', run:() => f23FichaTab('combate') });
      if(ordem){
        v.push({ id:'esquivar', ic:'wind', t:'Esquivar', run:() => f23RollDef('reflexos') });
        v.push({ id:'bloquear', ic:'shield', t:'Bloquear', run:() => f23RollDef('fortitude') });
        v.push({ id:'poder', ic:'bolt', t:'Poder', run:() => f23FichaTab('poderes') });
      }
      if(F23.tacLive || m) v.push({ id:'tac', ic:'target', t:'Tático', run:() => { f23CloseMstrip(); hudTactical(); } });
    } else {
      v.push({ id:'curar', ic:'heart', t:'Curar', run:() => f23FichaTab('agente') });
      v.push({ id:'diario', ic:'book', t:'Diário', run:() => openHub('diario') });
      if(mods.crafting) v.push({ id:'fazer', ic:'tool', t:'Fazer item', run:() => openHub('oficio') });
      v.push({ id:'mochila', ic:'bag', t:'Mochila', run:() => { hudCloseSheets(); hudEnsureWho(); openInventory(null); } });
    }
    return v;
  }
  function f23RenderVerbs(){
    const el = hudEl('verbs'); if(!el) return;
    const list = f23Verbs(), turn = F23.scene === 'combate' ? f23TurnText() : '', sc = sceneById(F23.scene);
    F23.verbs = list;
    const fa = document.activeElement && el.contains(document.activeElement) ? document.activeElement.dataset.verb : null;
    el.hidden = !list.length;
    el.dataset.scene = F23.scene;
    el.innerHTML = `<span class="vb-scene" title="${esc(sc.hint)}">${ic(sc.ic, 14)}<b>${sc.name}</b></span>` + (turn ? `<span class="vb-turn" role="status">${esc(turn)}</span>` : '')
      + list.map((x, i) => `<button type="button" class="vb" data-verb="${x.id}" data-i="${i}">${ic(x.ic, 18)}<span>${esc(x.t)}</span></button>`).join('');
    if(fa){ const n = el.querySelector('[data-verb="' + fa + '"]'); if(n) n.focus({ preventScroll:true }); }
  }

  // ---- marcar no mapa: o jogador só vê Nota e Token ----
  function f23PrepAdd(){ f23Refresh(true); }

  // ---- busca única: funções do app + lugares, pins e perícias ----
  function f23RenderSearchFns(q){
    const box = hudEl('search-fn'); if(!box) return;
    const words = hudNorm(q || '').trim().split(/\s+/).filter(Boolean);
    let list = hudIndexItems();
    if(words.length) list = list.filter(it => { const hay = hudNorm(it.t + ' ' + it.d + ' ' + it.kw); return words.every(w => hay.includes(w)); });
    F23.fnItems = list;
    if(!list.length){ box.innerHTML = ''; box.style.display = 'none'; return; }
    box.innerHTML = list.map((it, i) => `<button type="button" class="search-result search-fn-item" role="option" data-fn="${i}"><span class="search-result-kicker">Função</span><span class="search-result-label">${ic(it.ic, 15)}<b>${esc(it.t)}</b><small>${esc(it.d)}</small></span></button>`).join('');
    box.style.display = 'block';
  }
  function f23CloseSearch(){ const en = appPopovers.find(p => p.popover.id === 'hud-search'); if(en) en.close(); }

  // ---- ajustes numa tela só ----
  function f23RenderCfg(){
    const el = hudEl('cfg-body'); if(!el) return;
    const adv = f23Adv(), fa = document.activeElement && el.contains(document.activeElement) ? document.activeElement.dataset.cfg + '|' + (document.activeElement.dataset.v || '') : null;
    el.innerHTML = `<div class="cfg-row"><div class="cfg-t"><b>Ferramentas avançadas</b><span>Mapas Relevo e Nevado${isMaster() ? ' e registro de itens' : ''}</span></div>
        <button type="button" class="sw${adv ? ' on' : ''}" role="switch" aria-checked="${adv}" data-cfg="adv" aria-label="Ferramentas avançadas"><i></i></button></div>
      <div class="cfg-row cfg-btns"><button type="button" class="inv-mini-btn" data-cfg="keys">${ic('sliders', 15)} Atalhos de teclado</button></div>
      <div class="cfg-guia" role="group" aria-label="Tutoriais"><div class="cfg-t"><b>Tutoriais</b><span>Dicas rápidas de cada parte do app</span></div>${TVGuia.tours.filter(t => t.papel === 'todos' || t.papel === guiaPapel()).map(t => { const v = TVGuia.visto(t.id, guiaStore); return `<div class="guia-row${v ? ' ok' : ''}" data-guia-tour="${t.id}"><span class="guia-ck" aria-hidden="true">${v ? '✓' : ''}</span><span class="guia-n">${esc(t.titulo)}</span><button type="button" class="inv-mini-btn" data-guia-rever="${t.id}" aria-label="${v ? 'Rever' : 'Ver'} o tutorial: ${esc(t.titulo)}">${v ? 'Rever' : 'Ver'}</button></div>`; }).join('')}</div>`;
    if(fa){ const p = fa.split('|'); const n = el.querySelector('[data-cfg="' + p[0] + '"]' + (p[1] ? '[data-v="' + p[1] + '"]' : '')); if(n) n.focus({ preventScroll:true }); }
  }
  function f23OpenSettings(){
    if(!hudEl('menu-popover').classList.contains('open')) hudEl('menu-toggle-btn').click();
    f23RenderCfg();
    setTimeout(() => { const s = hudEl('cfg-section'); if(s && s.scrollIntoView) s.scrollIntoView({ block:'nearest' }); }, 60);
  }
  function f23SetAdv(on){
    lsSet(LS_ADV, on ? '1' : null);
    f23Refresh(true);
    if(typeof layerAdvSync === 'function') layerAdvSync();
  }
  // ---- janelinha própria (introdução e atalhos) ----
  function f23Modal(html, onClose){
    let m = hudEl('f23-modal');
    if(!m){
      m = document.createElement('div'); m.id = 'f23-modal'; m.className = 'f23-modal'; m.setAttribute('role', 'dialog'); m.setAttribute('aria-modal', 'true'); m.hidden = true;
      document.body.appendChild(m);
      m.addEventListener('click', e => { if(e.target === m && F23.modalClose) F23.modalClose(); });
    }
    F23.modalPrev = document.activeElement;
    F23.modalClose = () => { m.hidden = true; m.innerHTML = ''; document.querySelectorAll('.tour-hl').forEach(x => x.classList.remove('tour-hl')); F23.modalClose = null; if(onClose) onClose(); if(F23.modalPrev && F23.modalPrev.focus && document.contains(F23.modalPrev)){ try{ F23.modalPrev.focus({ preventScroll:true }); }catch(e){} } };
    m.className = 'f23-modal'; m.innerHTML = html; m.hidden = false;
    return m;
  }
  const F23_KEYS = [['D', 'Rolar dados'], ['F', 'Abrir ou recolher a ficha'], ['M', 'Abrir ou fechar a mochila'], ['E', 'Abrir ou recolher a mesa (feed, grupo, diário)'], ['/', 'Buscar função, lugar, pin ou perícia'], ['C', 'Campanhas'], ['Esc', 'Fechar o que estiver aberto'], ['?', 'Esta lista']];
  function f23Help(){
    const m = f23Modal(`<div class="f23-card" tabindex="-1"><h3 id="f23-mt">Atalhos de teclado</h3>
      <dl class="f23-keys">${F23_KEYS.map(k => `<dt><kbd>${esc(k[0])}</kbd></dt><dd>${esc(k[1])}</dd>`).join('')}</dl>
      <div class="f23-actions"><button type="button" class="inv-mini-btn primary" data-f23="close">Fechar</button></div></div>`);
    m.setAttribute('aria-labelledby', 'f23-mt');
    m.querySelector('[data-f23="close"]').addEventListener('click', () => F23.modalClose());
    m.querySelector('[data-f23="close"]').focus();
  }
  // ---- tutoriais por parte (tv-guia.js): aviso "Ver dica rápida?", botões ?, lista em Ajustes ----
  const guiaStore = { get:k => lsGet(k), set:(k, v) => lsSet(k, v), del:k => lsSet(k, null) };
  const guiaUI = { papel:null, timer:0, poll:0, conv:null, autoMs:12000, ate:0 };
  const guiaPapel = () => guiaUI.papel || (isMaster() ? 'mestre' : 'jogador');
  // primeiro elemento do seletor que está de fato na tela (existe, não está escondido e tem tamanho)
  function guiaAlvo(sel){
    let list; try{ list = document.querySelectorAll(sel); }catch(e){ return null; }
    for(let k = 0; k < list.length; k++){
      const n = list[k]; if(n.hidden || n.closest('[hidden]')) continue;
      const r = n.getBoundingClientRect(); if(r.width > 0 && r.height > 0) return n;
    }
    return null;
  }
  const guiaExiste = sel => !!guiaAlvo(sel);
  // como abrir cada parte (para "Ver" em Ajustes) e como saber que ela continua aberta (para o aviso sumir quando fecha)
  const guiaFichaOn = () => hudCol() ? !hud.miniOff : (hubIsOpen() && hubGroupOf(hub.tab) === 'ficha');
  const GUIA_PAINEL = {
    'visao-geral':{ aberto:() => true, abrir:() => {} },
    ficha:{ aberto:guiaFichaOn, abrir:() => f23ShowFicha(), prepara:() => { if(!guiaFichaOn() || hub.opTab === 'combate') return false; f23FichaTab('combate'); return true; } },   // as armas ficam na aba Combate: o tour leva para lá
    mochila:{ aberto:() => invDrawer.classList.contains('open'), abrir:() => { hudCloseSheets(); hudEnsureWho(); openInventory(null); } },
    saque:{ aberto:() => saqueDrawer.classList.contains('open'), abrir:() => hudOpenSaque() },
    mesa:{ aberto:() => f23MesaVisible(), abrir:() => f23OpenMesa(F23.mesaTab) },
    rolagem:{ aberto:() => hudIsOpen('qr-sheet'), abrir:() => hudToggleSheet('qr-sheet', () => { hud.qrAttr = ''; hudRenderQR(); }) },
    'tatico-mestre':{ aberto:() => tacUI.open, abrir:() => tacOpen() },
    'tatico-jogador':{ aberto:() => tacUI.open, abrir:() => { if(tac.active && tac.scenes[tac.active]) tacOpen(); else toast('Quando o mestre ativar uma cena tática, abra-a para ver esta dica.'); } },
    gaveta:{ aberto:() => !!(rosterUI && rosterUI.open), abrir:() => openRoster() },
    mestre:{ aberto:() => !!F23.mstrip, abrir:() => { if(!F23.mstrip) f23ToggleMstrip(); } }
  };
  const guiaAberto = id => { const p = GUIA_PAINEL[id]; try{ return !p || p.aberto(); }catch(e){ return false; } };
  function guiaRefreshCfg(){ if(hudEl('cfg-body')) f23RenderCfg(); }
  function guiaFecharConvite(marcar){
    clearTimeout(guiaUI.timer); clearInterval(guiaUI.poll); guiaUI.poll = 0;
    const c = guiaUI.conv; if(!c || c.hidden) return;
    c.hidden = true; c.classList.remove('anc');
    document.querySelectorAll('.guia-chama').forEach(x => x.classList.remove('guia-chama'));
    if(marcar){ TVGuia.marcar(c.dataset.guiaId, guiaStore); guiaRefreshCfg(); }
  }
  // aviso discreto, sem bloquear nada: só aparece se o tour existe e a pessoa ainda não viu nem dispensou
  function guiaMostrarConvite(id){
    const tour = TVGuia.porId(id); if(!tour) return;
    if(!guiaUI.conv){
      const c = document.createElement('div'); c.id = 'guia-convite'; c.className = 'guia-convite'; c.setAttribute('role', 'region'); c.setAttribute('aria-label', 'Dica rápida'); c.hidden = true;
      document.body.appendChild(c); guiaUI.conv = c;
      c.addEventListener('click', e => {
        const b = e.target.closest('[data-guia-conv]'); if(!b) return;
        const id2 = c.dataset.guiaId;
        if(b.dataset.guiaConv === 'sim'){ guiaFecharConvite(false); guiaIniciar(id2); }
        else guiaFecharConvite(true);
      });
    }
    const c = guiaUI.conv;
    if(!c.hidden && c.dataset.guiaId !== id) guiaFecharConvite(true);    // pediu outra parte: a anterior vale como "agora não"
    c.dataset.guiaId = id;
    c.innerHTML = `<span class="gc-t"><b>Ver dica rápida?</b><small>${esc(tour.titulo)}</small></span><button type="button" class="inv-mini-btn primary" data-guia-conv="sim">Sim</button><button type="button" class="inv-mini-btn" data-guia-conv="nao">Agora não</button>`;
    c.hidden = false;
    guiaAncorar();
    clearInterval(guiaUI.poll);
    guiaUI.ate = Date.now() + guiaUI.autoMs;
    // fechou a parte sem responder, ou deixou passar o tempo = "agora não" (o botão ? continua à mão)
    guiaUI.poll = setInterval(() => { if(!guiaAberto(id) || Date.now() >= guiaUI.ate){ guiaFecharConvite(true); return; } guiaAncorar(); }, 500);
  }
  // o aviso fica logo abaixo do botão "?" do painel (longe dos botões de ação); sem "?" à vista, fica embaixo, acima das ações da cena
  function guiaAncorar(){
    const c = guiaUI.conv; if(!c || c.hidden) return;
    document.querySelectorAll('.guia-chama').forEach(x => x.classList.remove('guia-chama'));
    const id = c.dataset.guiaId, q = (id === 'visao-geral' || id === 'mestre') ? null : guiaAlvo('[data-guia="' + id + '"]');
    if(!q){ c.classList.remove('anc'); return; }
    const r = q.getBoundingClientRect();
    c.style.setProperty('--gc-top', Math.round(r.bottom + 8) + 'px');
    c.style.setProperty('--gc-right', Math.max(8, Math.round(innerWidth - r.right)) + 'px');
    c.classList.add('anc'); q.classList.add('guia-chama');
  }
  function guiaOferecer(id){
    if(!TVGuia.convite(id, guiaStore)) return;
    clearTimeout(guiaUI.timer);
    guiaUI.timer = setTimeout(() => {
      if(!TVGuia.convite(id, guiaStore) || F23.modalClose || !guiaAberto(id)) return;
      if(!TVGuia.passosVisiveis(TVGuia.porId(id), guiaPapel(), guiaExiste).length) return;      // nada para mostrar agora (ex.: ficha sem personagem): não oferece
      guiaMostrarConvite(id);
    }, 450);   // depois da animação de abrir, para não competir com ela
  }
  function guiaIniciar(id, abrir){
    const tour = TVGuia.porId(id); if(!tour) return false;
    guiaFecharConvite(false);
    if(F23.modalClose) F23.modalClose();
    if(tour.papel !== 'todos' && tour.papel !== guiaPapel()){ toast('Esta dica é só para ' + (tour.papel === 'mestre' ? 'o mestre' : 'jogadores') + '.'); return false; }
    TVGuia.marcar(id, guiaStore); guiaRefreshCfg();      // iniciar já conta como visto (o aviso não volta)
    const pn = GUIA_PAINEL[id];
    const go = () => {
      guiaFecharConvite(false);
      const passos = TVGuia.passosVisiveis(tour, guiaPapel(), guiaExiste);
      if(!passos.length){ toast('Não há dica para mostrar aqui agora.'); return; }
      guiaPassos(tour, passos);
    };
    let espera = 0;
    if(abrir && pn && !guiaAberto(id)){ pn.abrir(); espera = 700; }
    if(pn && pn.prepara && pn.prepara()) espera = Math.max(espera, 300);
    if(espera) setTimeout(go, espera); else go();
    return true;
  }
  function guiaPassos(tour, passos){
    let i = 0;
    const draw = () => {
      const s = passos[i], last = i === passos.length - 1;
      document.querySelectorAll('.tour-hl').forEach(x => x.classList.remove('tour-hl'));
      const alvo = guiaAlvo(s.alvo);      // pode ter sumido entre um passo e o outro
      if(alvo){ alvo.classList.add('tour-hl'); try{ alvo.scrollIntoView({ block:'nearest', inline:'nearest' }); }catch(e){} }
      const m = f23Modal(`<div class="f23-card f23-tour" data-guia-id="${esc(tour.id)}" tabindex="-1"><div class="f23-step">Passo ${i + 1} de ${passos.length}</div><h3 id="f23-mt">${esc(s.titulo)}</h3><p>${esc(s.texto)}</p>
        <div class="f23-actions"><button type="button" class="inv-mini-btn" data-f23="skip">${last ? 'Fechar' : 'Pular'}</button>${i ? '<button type="button" class="inv-mini-btn" data-f23="back">Voltar</button>' : ''}<button type="button" class="inv-mini-btn primary" data-f23="next">${last ? 'Entendi' : 'Próximo'}</button></div></div>`);
      m.setAttribute('aria-labelledby', 'f23-mt'); m.classList.add('tour');
      const r = alvo ? alvo.getBoundingClientRect() : null;
      m.classList.toggle('top', !!r && r.top + r.height / 2 > innerHeight / 2);    // alvo na metade de baixo: o cartão vai para o alto
      m.querySelector('[data-f23="skip"]').addEventListener('click', () => F23.modalClose());
      const back = m.querySelector('[data-f23="back"]'); if(back) back.addEventListener('click', () => { i--; draw(); });
      m.querySelector('[data-f23="next"]').addEventListener('click', () => { if(last){ F23.modalClose(); return; } i++; draw(); });
      m.querySelector('[data-f23="next"]').focus({ preventScroll:true });
    };
    draw();
  }
  function guiaWire(){
    document.addEventListener('click', e => {
      const t = e.target; if(!t || !t.closest) return;
      const q = t.closest('[data-guia]'); if(q){ e.preventDefault(); guiaIniciar(q.dataset.guia); return; }
      const r = t.closest('[data-guia-rever]');
      if(r){
        const p = appPopovers.find(x => x.popover.id === 'menu-popover'); if(p) p.close();
        guiaIniciar(r.dataset.guiaRever, true);
      }
    });
    // primeiro uso: em vez de abrir o passeio sozinho, só oferece a dica (some se a pessoa já viu o passeio antigo)
    let tries = 0;
    const go = () => {
      if(!TVGuia.convite('visao-geral', guiaStore) || F23.modalClose) return;
      if(document.querySelector('.icon-popover.open, .app-popover.open, .hud-sheet.open') && tries++ < 4){ setTimeout(go, 3000); return; }
      if(TVGuia.passosVisiveis(TVGuia.porId('visao-geral'), guiaPapel(), guiaExiste).length) guiaMostrarConvite('visao-geral');
    };
    setTimeout(go, 1800);
  }
  window.__tvGuia = { iniciar:guiaIniciar, forcarPapel:p => { guiaUI.papel = p || null; }, autoMs:ms => { guiaUI.autoMs = ms; }, refresh:guiaRefreshCfg, papel:guiaPapel };   // só para os testes automáticos

  // ---- teclado ----
  function f23Key(e){
    if(e.key === '/'){ e.preventDefault(); const b = hudEl('search-toggle-btn'); if(!hudEl('hud-search').classList.contains('open')) b.click(); else hudEl('search-input').focus(); return true; }
    if(e.key === '?'){ e.preventDefault(); f23Help(); return true; }
    const k = e.key.toLowerCase();
    if(k === 'f'){ f23ToggleFicha(); return true; }
    if(k === 'm'){ hudEl('dock-inv').click(); return true; }
    if(k === 'e'){ f23ToggleMesa(); return true; }
    return false;
  }

  function f23Init(){
    const mt = lsGet(LS_MESAT); if(mt && HUB_MESA_TABS.includes(mt)) F23.mesaTab = mt;
    // jogador: pins de tipo, áreas e rotas são do mestre (nota e token ficam livres)
    document.addEventListener('click', e => {
      if(isMaster()) return;
      const b = e.target.closest && e.target.closest('#pin-buttons .tool-btn, #tool-area-polygon, #tool-area-rect, #tool-area-circle, #tool-route');
      if(!b || b.dataset.pinType === 'nota') return;
      e.stopImmediatePropagation(); e.preventDefault();
      toast('Só o mestre cria isso. Você pode marcar notas e tokens.', true);
    }, true);
    hudEl('mstrip').addEventListener('click', e => {
      const b = e.target.closest('[data-ms]'); if(!b) return;
      const k = b.dataset.ms;
      if(k === 'scene'){ f23SetScene(b.dataset.id); return; }
      f23CloseMstrip();
      if(k === 'weather') openWeatherPopover();
      else if(k === 'tac') hudTactical();
      else if(k === 'session') openHub('sessao');
      else if(k === 'saque') hudOpenSaque();
      else if(k === 'mestre') openHub('mestre');
      else if(k === 'camp') openHub('campanhas');
    });
    const tabs = hudEl('mesa-tabs');
    tabs.addEventListener('click', e => { const b = e.target.closest('[data-mesa]'); if(b) f23OpenMesa(b.dataset.mesa); });
    tabs.addEventListener('keydown', e => {
      if(!/^(ArrowLeft|ArrowRight|Home|End)$/.test(e.key)) return;
      const ids = hubTabsFor('mesa').map(t => t[0]); let i = ids.indexOf(F23.mesaTab);
      i = e.key === 'Home' ? 0 : e.key === 'End' ? ids.length - 1 : (i + (e.key === 'ArrowRight' ? 1 : -1) + ids.length) % ids.length;
      e.preventDefault(); f23OpenMesa(ids[i]);
      const n = hudEl('mesa-tab-' + ids[i]); if(n) n.focus();
    });
    hudEl('verbs').addEventListener('click', e => { const b = e.target.closest('[data-verb]'); if(!b) return; const v = (F23.verbs || [])[+b.dataset.i]; if(v) v.run(); });
    hudEl('cfg-body').addEventListener('click', e => {
      const b = e.target.closest('[data-cfg]'); if(!b) return;
      const k = b.dataset.cfg;
      if(k === 'adv') f23SetAdv(!f23Adv());
      else if(k === 'keys'){ const p = appPopovers.find(x => x.popover.id === 'menu-popover'); if(p) p.close(); f23Help(); }
    });
    hudEl('search-fn').addEventListener('click', e => {
      const b = e.target.closest('[data-fn]'); if(!b) return;
      const it = (F23.fnItems || [])[+b.dataset.fn]; if(!it) return;
      f23CloseSearch(); it.run();
    });
    hudEl('search-toggle-btn').addEventListener('click', () => setTimeout(() => { if(hudEl('hud-search').classList.contains('open')) f23RenderSearchFns(hudEl('search-input').value.trim()); }, 0));
    document.addEventListener('click', e => {
      const t = e.target; if(!t || !t.closest) return;
      // composedPath: o botão clicado pode ter sido recriado pelo próprio clique (cena, filtro) e já estar fora do DOM
      const path = e.composedPath ? e.composedPath() : [];
      const inside = ids => path.some(n => n && n.id && ids.indexOf(n.id) >= 0) || ids.some(i => t.closest('#' + i));
      if(F23.mstrip && !inside(['mstrip', 'mchip-master', 'guia-convite', 'f23-modal'])) f23CloseMstrip();   // responder ao aviso ou passar o tutorial não fecha a faixa
      if(F23.filt && !inside(['filt-pop', 'mchip-filters'])) f23CloseFilters();
    });
    document.addEventListener('keydown', e => {
      if(e.key === 'Escape'){
        if(F23.modalClose){ F23.modalClose(); return; }
        if(F23.mstrip){ f23CloseMstrip(); const c = hudEl('mchip-master'); if(c) c.focus(); }
        if(F23.filt){ f23CloseFilters(); const c = hudEl('mchip-filters'); if(c) c.focus(); }
        // teclado (computador): Esc também fecha a Mochila e o Saque, se nenhum menu estiver aberto na frente
        const op = appPopovers.filter(x => x.popover.classList.contains('open'));
        if(op.length) op.forEach(x => x.close());   // Esc fecha primeiro o menu/busca que estiver na frente
        else if(!e.defaultPrevented){
          const inv = document.getElementById('inv-drawer'), sq = document.getElementById('saque-drawer');
          if(inv && inv.classList.contains('open')) closeInventory();
          else if(sq && sq.classList.contains('open')) closeDrawer();
        }
      }
    });
    // menus e buscas abertos: a barra de verbos e o d20 saem da frente (não cobrem as opções)
    const popSync = () => document.body.classList.toggle('pop-open', appPopovers.some(x => x.popover.classList.contains('open')));
    const pmo = new MutationObserver(popSync);
    appPopovers.forEach(x => pmo.observe(x.popover, { attributes:true, attributeFilter:['class'] }));
    popSync();
    f23Refresh(true);
    f23RenderSearchFns('');
    guiaWire();
  }

  function hudCampaignChanged(){
    if(!hudReady) return;
    hud.who = null; hudLoadPrefs(); hudFeedLayout(); mapfLoad(); mapfApply(); f23Refresh(true);
    plClear(); placesRefresh();
  }
  function hudInit(){
    hudDockBuild(); hudWireDock(); hudWireQR(); hudWireFeed(); hudWireMini(); mapfWire();
    hudEl('add-close').innerHTML = ic('close', 18); hudEl('feed-close').innerHTML = ic('close', 18); hudEl('lay-close').innerHTML = ic('close', 18);
    document.querySelectorAll('[data-ic]').forEach(e => { e.innerHTML = ic(e.dataset.ic, +e.dataset.icSize || 16); });   // ícones das partes estáticas do HTML
    hudLoadPrefs(); mapfLoad();
    hudReady = true;
    if(PLACES_ON) plPurge(); else plDropAll();
    mapfApply();
    if(PLACES_ON){ map.on('moveend', placesLater); placesRefresh(); }
    { const ps = hudEl('pl-status'); if(ps){ ps.addEventListener('click', () => { if(ps.classList.contains('pl-retry')) plRetryNow(); }); ps.addEventListener('keydown', e => { if((e.key === 'Enter' || e.key === ' ') && ps.classList.contains('pl-retry')){ e.preventDefault(); plRetryNow(); } }); } }
    map.on('zoomend', clusterUpdate); clusterSync();
    // f25: classe no <body> em vez de body:has(.leaflet-popup) no CSS (o :has() no body reavaliava a página inteira a cada mudança de DOM)
    map.on('popupopen', () => document.body.classList.add('lf-popup'));
    map.on('popupclose', () => document.body.classList.remove('lf-popup'));
    const ctg = document.getElementById('cluster-toggle'); if(ctg) ctg.addEventListener('click', () => clusterSetOn(!cl.on));
    clusterUpdate();
    map.on('click', () => { hudCloseSheets(); if(!hudCol() && hud.feed.sheet) hudFeedOpen(false); });
    f23Init(); hudFeedLayout(); hudDockSync();
    // o mapa recalcula o tamanho quando as colunas do desktop abrem ou fecham
    let mapRz = 0;
    if(window.ResizeObserver) new ResizeObserver(() => {
      if(mapRz) return;
      mapRz = requestAnimationFrame(() => { mapRz = 0; if(map && !document.body.classList.contains('tac-on')) map.invalidateSize({ animate:false }); });
    }).observe(document.getElementById('map'));
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

  // ================= APP INSTALÁVEL (PWA) =================
  // manifest.webmanifest + sw.js + ícones: o navegador oferece "Instalar app". O service worker deixa o app abrir sem internet
  // (o mapa-base e a sincronização da mesa continuam precisando de sinal). Só registra em http(s), nunca ao abrir o HTML como arquivo.
  if('serviceWorker' in navigator && /^https?:$/.test(location.protocol)){
    window.addEventListener('load', () => { navigator.serviceWorker.register('sw.js').catch(() => {}); });
  }
  (function(){
    const sec = document.getElementById('install-section'), btn = document.getElementById('install-btn'), hint = document.getElementById('install-hint');
    if(!sec || !btn || !hint) return;
    const standalone = () => { try{ return (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) || navigator.standalone === true; }catch(e){ return false; } };
    if(standalone()) return;
    let deferred = null;
    window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); deferred = e; sec.hidden = false; btn.hidden = false; hint.hidden = true; });
    window.addEventListener('appinstalled', () => { deferred = null; sec.hidden = true; toast('App instalado. Abra pelo ícone na tela inicial.'); });
    btn.addEventListener('click', async () => {
      if(!deferred) return;
      const ev = deferred; deferred = null; sec.hidden = true;
      try{ ev.prompt(); await ev.userChoice; }catch(err){}
    });
    // iPhone/iPad não têm o aviso automático: mostra o passo a passo
    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    if(ios){ sec.hidden = false; btn.hidden = true; hint.hidden = false; }
  })();

})();

// ===== Seletores e sugestões do app (f17): nada de lista branca do navegador =====
// <select>: o toque não chega mais ao seletor nativo (CSS: pointer-events:none); este bloco abre uma lista própria, escura,
// e grava a escolha no próprio <select> (value + eventos input/change), então todo o resto do app continua igual.
// <input list=...>: as sugestões do navegador também são brancas; aqui viram uma lista própria sob o campo.
(function(){
  'use strict';
  const SKIP = s => !s || s.multiple || s.size > 1 || s.hasAttribute('data-native') || s.disabled;
  const norm = t => String(t || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  let cur = null;        // lista de <select> aberta: { sel, back, panel, items, act, sheet }
  let sug = null;        // sugestões de campo aberta: { inp, box, items, act }
  const mkEl = (tag, cls, txt) => { const e = document.createElement(tag); if(cls) e.className = cls; if(txt != null) e.textContent = txt; return e; };
  const phone = () => window.matchMedia && window.matchMedia('(max-width: 700px)').matches;

  // ----- qual <select> está sob o dedo? (o seletor ignora o toque, então a conta é pela posição)
  function selectAt(x, y){
    const all = document.querySelectorAll('select');
    for(let i = 0; i < all.length; i++){
      const s = all[i]; if(SKIP(s)) continue;
      const r = s.getBoundingClientRect();
      if(r.width < 4 || r.height < 4 || x < r.left || x > r.right || y < r.top || y > r.bottom) continue;
      const top = document.elementFromPoint(x, y); if(!top) continue;
      const host = s.closest('label') || s.parentElement || s;
      if(top === s || host === top || host.contains(top)) return s;
    }
    return null;
  }
  function labelOf(s){
    const a = s.getAttribute('aria-label'); if(a) return a;
    const l = (s.id && document.querySelector('label[for="' + s.id.replace(/"/g, '') + '"]')) || s.closest('label');
    if(l){ const c = l.cloneNode(true); c.querySelectorAll('select,input,textarea,button').forEach(n => n.remove()); const t = c.textContent.trim(); if(t) return t.slice(0, 60); }
    return 'Escolher';
  }

  // ----- lista do <select>
  function closeSel(refocus){
    if(!cur) return;
    const c = cur; cur = null;
    document.removeEventListener('keydown', onKey, true);
    window.removeEventListener('resize', onWin);
    document.removeEventListener('scroll', onScroll, true);
    c.panel.classList.remove('open'); c.back.classList.remove('open');
    setTimeout(() => { c.panel.remove(); c.back.remove(); }, 160);
    if(refocus && c.sel.isConnected){ try{ c.sel.focus({ preventScroll:true }); }catch(e){} }
  }
  function setActive(i, scroll){
    if(!cur) return;
    const n = cur.items.length; if(!n) return;
    cur.act = Math.max(0, Math.min(n - 1, i));
    cur.items.forEach((it, k) => it.el.classList.toggle('act', k === cur.act));
    const el = cur.items[cur.act].el;
    cur.panel.setAttribute('aria-activedescendant', el.id);
    if(scroll !== false) el.scrollIntoView({ block:'nearest' });
  }
  function choose(i){
    if(!cur) return;
    const it = cur.items[i]; if(!it || it.dis) return;
    const sel = cur.sel, changed = sel.selectedIndex !== it.idx;
    sel.selectedIndex = it.idx;
    closeSel(true);
    if(changed){
      sel.dispatchEvent(new Event('input', { bubbles:true }));
      sel.dispatchEvent(new Event('change', { bubbles:true }));
    }
  }
  function onKey(e){
    if(!cur) return;
    const k = e.key;
    if(k === 'Escape'){ e.preventDefault(); e.stopPropagation(); closeSel(true); return; }
    if(k === 'Tab'){ closeSel(false); return; }
    const step = d => { let i = cur.act + d; while(i >= 0 && i < cur.items.length && cur.items[i].dis) i += d; if(i >= 0 && i < cur.items.length) setActive(i); };
    if(k === 'ArrowDown'){ e.preventDefault(); step(1); }
    else if(k === 'ArrowUp'){ e.preventDefault(); step(-1); }
    else if(k === 'Home'){ e.preventDefault(); setActive(0); }
    else if(k === 'End'){ e.preventDefault(); setActive(cur.items.length - 1); }
    else if(k === 'Enter' || k === ' '){ e.preventDefault(); e.stopPropagation(); choose(cur.act); }
    else if(k.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey){
      const q = norm(k), n = cur.items.length;
      for(let d = 1; d <= n; d++){ const i = (cur.act + d) % n, it = cur.items[i]; if(!it.dis && norm(it.text).indexOf(q) === 0){ setActive(i); break; } }
    }
  }
  function onWin(){ closeSel(false); }
  function onScroll(e){ if(cur && !cur.sheet && !cur.panel.contains(e.target)) closeSel(false); }

  function openSel(sel){
    closeSel(false); closeSug();
    const items = [], panel = mkEl('div', 'tvs-panel'), back = mkEl('div', 'tvs-back');
    const sheet = phone();
    panel.setAttribute('role', 'listbox'); panel.tabIndex = -1;
    const title = labelOf(sel);
    panel.setAttribute('aria-label', title);
    if(sheet){
      panel.classList.add('tvs-sheet');
      const head = mkEl('div', 'tvs-head'); head.appendChild(mkEl('b', '', title));
      const x = mkEl('button', 'tvs-x', '×'); x.type = 'button'; x.setAttribute('aria-label', 'Fechar'); head.appendChild(x);
      x.addEventListener('click', () => closeSel(true));
      panel.appendChild(head);
    }
    const body = mkEl('div', 'tvs-list'); panel.appendChild(body);
    let n = 0, optIdx = 0;
    const add = (o, host) => {
      if(o.hidden) { optIdx++; return; }
      const el = mkEl('div', 'tvs-opt'); el.id = 'tvs-o' + (n++); el.setAttribute('role', 'option');
      const dis = o.disabled || (o.parentElement && o.parentElement.tagName === 'OPTGROUP' && o.parentElement.disabled);
      const text = (o.textContent || '').trim() || ' ';
      el.appendChild(mkEl('span', 'tvs-t', text));
      const on = o.index === sel.selectedIndex;
      el.setAttribute('aria-selected', String(on)); if(on) el.classList.add('on');
      if(dis){ el.classList.add('dis'); el.setAttribute('aria-disabled', 'true'); }
      const rec = { el, idx:o.index, dis:!!dis, text };
      el.addEventListener('click', () => choose(items.indexOf(rec)));
      host.appendChild(el); items.push(rec);
    };
    Array.prototype.forEach.call(sel.children, ch => {
      if(ch.tagName === 'OPTGROUP'){ const g = mkEl('div', 'tvs-grp', ch.label || ''); body.appendChild(g); Array.prototype.forEach.call(ch.children, o => { if(o.tagName === 'OPTION') add(o, body); }); }
      else if(ch.tagName === 'OPTION') add(ch, body);
    });
    if(!items.length){ body.appendChild(mkEl('div', 'tvs-empty', 'Sem opções')); }
    document.body.appendChild(back); document.body.appendChild(panel);
    cur = { sel, back, panel, items, act:0, sheet };
    back.addEventListener('click', () => closeSel(true));
    if(!sheet){
      const r = sel.getBoundingClientRect(), vh = (window.visualViewport && window.visualViewport.height) || window.innerHeight, vw = window.innerWidth;
      const w = Math.min(Math.max(r.width, 180), vw - 16), left = Math.max(8, Math.min(r.left, vw - w - 8));
      const below = vh - r.bottom - 12, above = r.top - 12, up = below < 160 && above > below;
      panel.style.left = left + 'px'; panel.style.width = w + 'px';
      panel.style.maxHeight = Math.max(120, Math.min(320, up ? above : below)) + 'px';
      if(up) panel.style.bottom = (vh - r.top + 4) + 'px'; else panel.style.top = (r.bottom + 4) + 'px';
    }
    let sIdx = items.findIndex(it => it.idx === sel.selectedIndex); if(sIdx < 0) sIdx = Math.max(0, items.findIndex(it => !it.dis));
    requestAnimationFrame(() => { if(!cur) return; back.classList.add('open'); panel.classList.add('open'); setActive(sIdx); panel.focus({ preventScroll:true }); });
    document.addEventListener('keydown', onKey, true);
    window.addEventListener('resize', onWin);
    document.addEventListener('scroll', onScroll, true);
  }

  // ----- sugestões de campo (no lugar da <datalist> do navegador)
  function closeSug(){
    if(!sug) return;
    const s = sug; sug = null;
    s.box.remove();
  }
  function dlOf(inp){
    const id = inp.getAttribute('list') || inp.dataset.tvlist; if(!id) return null;
    if(inp.hasAttribute('list')){ inp.dataset.tvlist = id; inp.removeAttribute('list'); }   // tira a lista nativa
    return document.getElementById(id);
  }
  function showSug(inp){
    const dl = dlOf(inp); if(!dl){ closeSug(); return; }
    const q = norm(inp.value).trim();
    const all = Array.prototype.map.call(dl.options, o => o.value).filter(Boolean);
    const starts = [], has = [];
    all.forEach(v => { const nv = norm(v); if(!q || nv.indexOf(q) === 0) starts.push(v); else if(nv.indexOf(q) > 0) has.push(v); });
    const list = starts.concat(has).slice(0, 60);
    if(!list.length || (list.length === 1 && norm(list[0]) === q)){ closeSug(); return; }
    if(!sug || sug.inp !== inp){ closeSug(); const box = mkEl('div', 'tvs-sug'); box.setAttribute('role', 'listbox'); box.addEventListener('mousedown', e => e.preventDefault()); document.body.appendChild(box); sug = { inp, box, act:-1 }; }
    const box = sug.box; box.textContent = ''; sug.act = -1;
    list.forEach((v, i) => {
      const o = mkEl('div', 'tvs-opt', v); o.setAttribute('role', 'option');
      o.addEventListener('click', () => { inp.value = v; closeSug(); inp.dispatchEvent(new Event('input', { bubbles:true })); inp.dispatchEvent(new Event('change', { bubbles:true })); });
      box.appendChild(o);
    });
    const r = inp.getBoundingClientRect(), vh = (window.visualViewport && window.visualViewport.height) || window.innerHeight, vw = window.innerWidth;
    const w = Math.min(Math.max(r.width, 200), vw - 16), left = Math.max(8, Math.min(r.left, vw - w - 8));
    const below = vh - r.bottom - 8, above = r.top - 8, up = below < 140 && above > below;
    box.style.left = left + 'px'; box.style.width = w + 'px'; box.style.maxHeight = Math.max(100, Math.min(260, up ? above : below)) + 'px';
    if(up){ box.style.top = ''; box.style.bottom = (vh - r.top + 4) + 'px'; } else { box.style.bottom = ''; box.style.top = (r.bottom + 4) + 'px'; }
  }
  function moveSug(d){
    if(!sug) return false;
    const els = sug.box.querySelectorAll('.tvs-opt'); if(!els.length) return false;
    sug.act = (sug.act + d + els.length) % els.length;
    els.forEach((e, i) => e.classList.toggle('act', i === sug.act));
    els[sug.act].scrollIntoView({ block:'nearest' });
    return true;
  }

  // ----- ligações globais
  document.addEventListener('click', e => {
    if(cur && cur.panel.contains(e.target)) return;
    if(e.target && e.target.tagName === 'SELECT') return;          // clique "sintético" de <label>: o seletor só é focado
    const s = selectAt(e.clientX, e.clientY);
    if(!s) return;
    e.preventDefault(); e.stopPropagation();
    openSel(s);
  }, true);
  document.addEventListener('keydown', e => {
    if(cur) return;
    const t = e.target;
    if(t && t.tagName === 'SELECT' && !SKIP(t) && (e.key === 'Enter' || e.key === ' ' || e.key === 'F4' || (e.key === 'ArrowDown' && e.altKey) || (e.key === 'ArrowUp' && e.altKey))){
      e.preventDefault(); e.stopPropagation(); openSel(t); return;
    }
    if(sug && t === sug.inp){
      if(e.key === 'Escape'){ closeSug(); e.stopPropagation(); }
      else if(e.key === 'ArrowDown'){ if(moveSug(1)) e.preventDefault(); }
      else if(e.key === 'ArrowUp'){ if(moveSug(-1)) e.preventDefault(); }
      else if(e.key === 'Enter' && sug.act >= 0){ e.preventDefault(); const el = sug.box.querySelectorAll('.tvs-opt')[sug.act]; if(el) el.click(); }
    }
  }, true);
  document.addEventListener('focusin', e => { const t = e.target; if(t && t.tagName === 'INPUT' && (t.hasAttribute('list') || t.dataset.tvlist)) showSug(t); }, true);
  document.addEventListener('input', e => { const t = e.target; if(t && t.tagName === 'INPUT' && (t.hasAttribute('list') || t.dataset.tvlist)) showSug(t); }, true);
  document.addEventListener('focusout', e => { if(sug && e.target === sug.inp) setTimeout(() => { if(sug && document.activeElement !== sug.inp) closeSug(); }, 120); }, true);
  window.addEventListener('resize', closeSug);
  document.addEventListener('scroll', e => { if(sug && !sug.box.contains(e.target)) closeSug(); }, true);
  // para os testes e para o resto do app
  window.__tvSel = { open:openSel, close:closeSel, isOpen:() => !!cur };
})();

// ===== Ajuste de imagem (f18): enquadrar (arrastar), zoom, girar — antes de guardar qualquer foto enviada =====
// tvAdjustImage(fonte, opções) abre uma tela própria e devolve { data, w, h } ou null se o usuário cancelar.
//   fonte: File/Blob ou texto (endereço/data:).  opções: { title, ratio (largura/altura), ratios:[{id,label,ratio}], shape:'circle'|'rect', out (lado maior, px), q, fill, noUpscale (não passa do tamanho real da foto) }
// pickImage(file, opções) -> texto data: ou null. GIF passa direto (para não perder a animação); o resto passa pelo ajuste.
(function(){
  'use strict';
  const mk = (tag, cls, txt) => { const e = document.createElement(tag); if(cls) e.className = cls; if(txt != null) e.textContent = txt; return e; };
  let busy = false;

  function loadSource(src){
    return new Promise((resolve, reject) => {
      const done = (url, revoke) => {
        const img = new Image();
        img.onload = () => resolve({ img, revoke });
        img.onerror = () => { if(revoke) URL.revokeObjectURL(url); reject(new Error('Não foi possível ler essa imagem.')); };
        img.src = url;
      };
      if(typeof src === 'string') done(src, false);
      else if(src && typeof src === 'object'){ const u = URL.createObjectURL(src); done(u, true); }
      else reject(new Error('Sem imagem.'));
    });
  }
  function rotated(img, quarter){
    const w = img.naturalWidth || img.width, h = img.naturalHeight || img.height, q = ((quarter % 4) + 4) % 4;
    if(!q) return { src:img, w, h };
    const cv = document.createElement('canvas'); cv.width = q % 2 ? h : w; cv.height = q % 2 ? w : h;
    const cx = cv.getContext('2d'); cx.translate(cv.width / 2, cv.height / 2); cx.rotate(q * Math.PI / 2); cx.drawImage(img, -w / 2, -h / 2);
    return { src:cv, w:cv.width, h:cv.height };
  }

  function tvAdjustImage(source, opts){
    opts = opts || {};
    if(busy) return Promise.resolve(null);
    busy = true;
    return loadSource(source).then(({ img, revoke }) => new Promise(resolve => {
      const ratios = (opts.ratios && opts.ratios.length) ? opts.ratios : null;
      let ridx = 0;
      const st = { q:0, s:1, minS:1, x:0, y:0, bmp:rotated(img, 0) };
      const ratioNow = () => { const r = ratios ? ratios[ridx].ratio : opts.ratio; return r || (st.bmp.w / st.bmp.h); };   // ratio 0 = "original": acompanha a imagem (e o giro)   // x,y: deslocamento do centro da imagem (px do quadro)
      const root = mk('div', 'iadj'), card = mk('div', 'iadj-card');
      root.setAttribute('role', 'dialog'); root.setAttribute('aria-modal', 'true'); root.setAttribute('aria-label', opts.title || 'Ajustar imagem');
      const head = mk('div', 'iadj-head'); head.appendChild(mk('b', '', opts.title || 'Ajustar imagem'));
      const xb = mk('button', 'iadj-x', '×'); xb.type = 'button'; xb.setAttribute('aria-label', 'Cancelar'); head.appendChild(xb);
      const stage = mk('div', 'iadj-stage'), frame = mk('div', 'iadj-frame' + (opts.shape === 'circle' ? ' circle' : '')), cv = mk('canvas', 'iadj-cv');
      cv.setAttribute('aria-label', 'Área da imagem: arraste para enquadrar, use dois dedos ou o controle para dar zoom');
      frame.appendChild(cv); stage.appendChild(frame);
      const hint = mk('p', 'iadj-hint', 'Arraste para enquadrar. Dois dedos ou o controle dão zoom.');
      const ctr = mk('div', 'iadj-ctr');
      const zOut = mk('button', 'iadj-b', '−'); zOut.type = 'button'; zOut.setAttribute('aria-label', 'Diminuir zoom');
      const zr = mk('input'); zr.type = 'range'; zr.min = '0'; zr.max = '100'; zr.value = '0'; zr.setAttribute('aria-label', 'Zoom');
      const zIn = mk('button', 'iadj-b', '+'); zIn.type = 'button'; zIn.setAttribute('aria-label', 'Aumentar zoom');
      ctr.append(zOut, zr, zIn);
      const row = mk('div', 'iadj-row');
      const rl = mk('button', 'iadj-b wide', '⟲ Girar'); rl.type = 'button';
      const fit = mk('button', 'iadj-b wide', 'Preencher'); fit.type = 'button';
      const whole = mk('button', 'iadj-b wide', 'Inteira'); whole.type = 'button';
      row.append(rl, fit, whole);
      const foot = mk('div', 'iadj-foot');
      const cancel = mk('button', 'iadj-b wide', 'Cancelar'); cancel.type = 'button';
      const ok = mk('button', 'iadj-b wide go', 'Usar imagem'); ok.type = 'button';
      foot.append(cancel, ok);
      card.append(head, stage);
      if(ratios && ratios.length > 1){
        const rr = mk('div', 'iadj-ratios'); rr.setAttribute('role', 'radiogroup'); rr.setAttribute('aria-label', 'Formato');
        ratios.forEach((r, i) => {
          const b = mk('button', 'iadj-chip', r.label); b.type = 'button'; b.setAttribute('role', 'radio'); b.dataset.i = String(i);
          b.setAttribute('aria-checked', String(i === 0)); if(i === 0) b.classList.add('on');
          b.addEventListener('click', () => { ridx = i; rr.querySelectorAll('.iadj-chip').forEach(c => { const on = c === b; c.classList.toggle('on', on); c.setAttribute('aria-checked', String(on)); }); layout(true); });
          rr.appendChild(b);
        });
        card.appendChild(rr);
      }
      card.append(hint, ctr, row, foot); root.appendChild(card); document.body.appendChild(root);
      requestAnimationFrame(() => root.classList.add('open'));

      let W = 0, H = 0;                                   // tamanho do quadro em px de tela
      const coverS = () => Math.max(W / st.bmp.w, H / st.bmp.h), containS = () => Math.min(W / st.bmp.w, H / st.bmp.h);
      const maxS = () => Math.max(coverS(), containS()) * 4;
      function clamp(){
        const sw = st.bmp.w * st.s, sh = st.bmp.h * st.s;
        const lim = (box, size) => size >= box ? (size - box) / 2 : (box - size) / 2;
        const lx = lim(W, sw), ly = lim(H, sh);
        st.x = Math.max(-lx, Math.min(lx, st.x)); st.y = Math.max(-ly, Math.min(ly, st.y));
      }
      function draw(){
        const dpr = Math.min(2, window.devicePixelRatio || 1);
        if(cv.width !== Math.round(W * dpr) || cv.height !== Math.round(H * dpr)){ cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); }
        const cx = cv.getContext('2d'); cx.setTransform(dpr, 0, 0, dpr, 0, 0); cx.clearRect(0, 0, W, H);
        cx.imageSmoothingQuality = 'high';
        cx.drawImage(st.bmp.src, W / 2 + st.x - st.bmp.w * st.s / 2, H / 2 + st.y - st.bmp.h * st.s / 2, st.bmp.w * st.s, st.bmp.h * st.s);
      }
      function syncSlider(){ const a = containS(), b = maxS(); zr.value = String(Math.round(100 * (Math.log(st.s / a) / Math.log(b / a)))); }
      function setScale(s, keep){
        const a = containS(), b = maxS(); const ns = Math.max(a, Math.min(b, s));
        if(keep){ const k = ns / st.s; st.x = keep.x + (st.x - keep.x) * k; st.y = keep.y + (st.y - keep.y) * k; }
        st.s = ns; clamp(); syncSlider(); draw();
      }
      function layout(reset){
        const maxW = Math.max(120, Math.min((stage.clientWidth || (window.innerWidth - 56)) - 4, 520)), maxH = Math.max(160, Math.min(window.innerHeight * 0.46, 420));
        const ratio = ratioNow(); let w = maxW, h = w / ratio; if(h > maxH){ h = maxH; w = h * ratio; }
        W = Math.round(w); H = Math.round(h); frame.style.width = W + 'px'; frame.style.height = H + 'px';
        if(reset){ st.x = st.y = 0; st.s = coverS(); }
        else { st.s = Math.max(containS(), Math.min(maxS(), st.s)); clamp(); }
        syncSlider(); draw();
      }
      layout(true);
      const onResize = () => layout(false); window.addEventListener('resize', onResize);

      // gestos: um dedo arrasta, dois dedos dão zoom
      const ptrs = new Map(); let g = null;
      const center = () => { const r = cv.getBoundingClientRect(); return { x:W / 2, y:H / 2, ox:r.left, oy:r.top }; };
      cv.addEventListener('pointerdown', e => { try{ cv.setPointerCapture(e.pointerId); }catch(err){} ptrs.set(e.pointerId, { x:e.clientX, y:e.clientY }); g = null; });
      cv.addEventListener('pointermove', e => {
        if(!ptrs.has(e.pointerId)) return;
        const prev = ptrs.get(e.pointerId); ptrs.set(e.pointerId, { x:e.clientX, y:e.clientY });
        if(ptrs.size === 1){ st.x += e.clientX - prev.x; st.y += e.clientY - prev.y; clamp(); draw(); }
        else if(ptrs.size === 2){
          const [a, b] = [...ptrs.values()], d = Math.hypot(a.x - b.x, a.y - b.y), c = center(), mx = (a.x + b.x) / 2 - c.ox - W / 2, my = (a.y + b.y) / 2 - c.oy - H / 2;
          if(g && g.d > 0) setScale(st.s * d / g.d, { x:mx, y:my });
          g = { d };
        }
      });
      const up = e => { ptrs.delete(e.pointerId); g = null; };
      cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);
      cv.addEventListener('wheel', e => { e.preventDefault(); const c = center(); setScale(st.s * (e.deltaY < 0 ? 1.12 : 1 / 1.12), { x:e.clientX - c.ox - W / 2, y:e.clientY - c.oy - H / 2 }); }, { passive:false });
      zr.addEventListener('input', () => { const a = containS(), b = maxS(); setScale(a * Math.pow(b / a, (+zr.value) / 100)); });
      zOut.addEventListener('click', () => setScale(st.s / 1.25)); zIn.addEventListener('click', () => setScale(st.s * 1.25));
      rl.addEventListener('click', () => { st.q = (st.q + 3) % 4; st.bmp = rotated(img, st.q); layout(true); });
      fit.addEventListener('click', () => { st.x = st.y = 0; setScale(coverS()); });
      whole.addEventListener('click', () => { st.x = st.y = 0; setScale(containS()); });

      function finish(res){
        document.removeEventListener('keydown', onKey, true); window.removeEventListener('resize', onResize);
        root.classList.remove('open'); setTimeout(() => root.remove(), 160);
        if(revoke) URL.revokeObjectURL(img.src);
        busy = false; resolve(res);
      }
      function onKey(e){
        if(e.key === 'Escape'){ e.preventDefault(); e.stopPropagation(); finish(null); }
        else if(e.key === 'Tab'){                              // foco preso dentro da tela
          const f = [...card.querySelectorAll('button, input')].filter(n => !n.disabled && n.offsetParent !== null); if(!f.length) return;
          const first = f[0], last = f[f.length - 1];
          if(e.shiftKey && document.activeElement === first){ e.preventDefault(); last.focus(); } else if(!e.shiftKey && document.activeElement === last){ e.preventDefault(); first.focus(); }
        }
      }
      document.addEventListener('keydown', onKey, true);
      xb.addEventListener('click', () => finish(null)); cancel.addEventListener('click', () => finish(null));
      ok.addEventListener('click', () => {
        let maxSide = opts.out || 160;
        if(opts.noUpscale) maxSide = Math.max(16, Math.min(maxSide, Math.round((W >= H ? W : H) / st.s)));   // nunca amplia além dos pixels que a foto tem
        const rt = ratioNow(), ow = Math.max(1, W >= H ? maxSide : Math.round(maxSide * rt)), oh = Math.max(1, W >= H ? Math.round(maxSide / rt) : maxSide), f = ow / W, fy = oh / H;
        const out = document.createElement('canvas'); out.width = ow; out.height = oh;
        const cx = out.getContext('2d'); cx.imageSmoothingQuality = 'high';
        if(opts.fill){ cx.fillStyle = opts.fill; cx.fillRect(0, 0, ow, oh); }
        cx.drawImage(st.bmp.src, (W / 2 + st.x - st.bmp.w * st.s / 2) * f, (H / 2 + st.y - st.bmp.h * st.s / 2) * fy, st.bmp.w * st.s * f, st.bmp.h * st.s * fy);
        let data; try{ data = out.toDataURL('image/webp', opts.q || 0.82); if(!/^data:image\/webp/.test(data)) data = out.toDataURL('image/png'); }catch(e){ data = out.toDataURL('image/png'); }
        finish({ data, w:ow, h:oh });
      });
      ok.focus();
    })).catch(err => { busy = false; throw err; });
  }

  // arquivo -> texto data: ajustado (ou null se cancelou). GIF animado passa direto, sem ajuste.
  async function pickImage(file, opts, fallbackResize){
    const isGif = file && (file.type === 'image/gif' || /\.gif$/i.test(file.name || ''));
    if(isGif) return fallbackResize(file, (opts && opts.out) || 160);
    const r = await tvAdjustImage(file, opts);
    return r ? r.data : null;
  }
  window.tvAdjustImage = tvAdjustImage;
  window.__tvPickImage = pickImage;
})();

// ===== Escolhas à vista (f23): <select> curto vira botões segmentados ou chips =====
// Até 4 opções curtas: segmentado. Até 9: chips que quebram linha. Com data-chips="scroll": chips numa fileira que rola.
// Mais opções (ou grupos) continuam como lista (a do f17). O <select> original fica no lugar, escondido, e recebe a escolha
// (value + eventos input/change), então todo o resto do app continua igual. Só entra onde há formulários do app.
(function(){
  'use strict';
  const ROOTS = '#hub-drawer, #fp-head, #fichap-body, #mesa-body, #inv-drawer, #saque-drawer, #qr-sheet';
  const valDesc = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value');
  const done = new WeakMap();      // select -> { box, kind }
  let lastPick = null;             // { key, val, t }: devolve o foco ao botão certo depois que a tela se redesenha
  const mk = (tag, cls) => { const e = document.createElement(tag); if(cls) e.className = cls; return e; };
  const keyOf = s => (s.dataset.bind || s.id || s.getAttribute('aria-label') || '');
  function labelOf(s){
    const a = s.getAttribute('aria-label'); if(a) return a;
    const l = (s.id && document.querySelector('label[for="' + s.id.replace(/"/g, '') + '"]')) || s.closest('label');
    if(l){ const c = l.cloneNode(true); c.querySelectorAll('select,input,textarea,button').forEach(n => n.remove()); const t = c.textContent.trim(); if(t) return t.slice(0, 60); }
    const p = s.previousElementSibling; if(p && /label/.test(p.className || '') && p.textContent.trim()) return p.textContent.trim().slice(0, 60);
    return 'Opções';
  }
  function kindOf(s){
    if(s.multiple || s.size > 1 || s.hasAttribute('data-native') || s.hasAttribute('data-nochips') || s.querySelector('optgroup') || s.closest('.fp-who')) return null;
    const opts = Array.prototype.filter.call(s.options, o => !o.hidden);
    if(opts.length < 2) return null;
    if(s.dataset.chips === 'scroll') return opts.length <= 40 ? 'scroll' : null;
    const long = opts.some(o => (o.textContent || '').trim().length > 14);
    if(opts.length <= 4 && !long) return 'seg';
    return opts.length <= 9 ? 'chips' : null;
  }
  function build(s){
    const st = done.get(s); if(!st) return;
    if(!s.isConnected){ st.box.remove(); return; }
    const k = kindOf(s);
    if(!k){ unwrap(s); return; }
    const box = st.box, ae = document.activeElement, hadFocus = ae && box.contains(ae), want = hadFocus ? ae.dataset.v : null;
    box.className = 'sel-' + (k === 'seg' ? 'seg' : 'chips') + (k === 'scroll' ? ' sel-scroll' : '');
    box.setAttribute('role', 'radiogroup'); box.setAttribute('aria-label', labelOf(s));
    const cur = s.value;
    box.innerHTML = '';
    Array.prototype.forEach.call(s.options, (o, i) => {
      if(o.hidden) return;
      const on = o.value === cur && i === s.selectedIndex, b = mk('button'); b.type = 'button'; b.dataset.v = o.value; b.dataset.i = String(i);
      b.setAttribute('role', 'radio'); b.setAttribute('aria-checked', String(on)); b.tabIndex = on ? 0 : -1; b.textContent = (o.textContent || '').trim() || ' ';
      if(on) b.classList.add('on'); if(o.disabled){ b.disabled = true; }
      box.appendChild(b);
    });
    if(!box.querySelector('[tabindex="0"]')){ const f = box.querySelector('button:not([disabled])'); if(f) f.tabIndex = 0; }
    if(want != null){ const n = Array.prototype.find.call(box.children, c => c.dataset.v === want); if(n) n.focus({ preventScroll:true }); }
    else if(lastPick && Date.now() - lastPick.t < 600 && lastPick.key === keyOf(s)){ const n = Array.prototype.find.call(box.children, c => c.dataset.v === lastPick.val); if(n) n.focus({ preventScroll:true }); }
    if(k === 'scroll'){ const on = box.querySelector('.on'); if(on && box.scrollWidth > box.clientWidth) box.scrollLeft = Math.max(0, on.offsetLeft - 24); }
  }
  function unwrap(s){
    const st = done.get(s); if(!st) return;
    st.box.remove(); s.classList.remove('sel-src'); s.removeAttribute('tabindex'); s.removeAttribute('aria-hidden');
    st.mo.disconnect(); delete s.value; done.delete(s);
    watch(s);
  }
  // select que ainda não tem opções suficientes (preenchido depois) é revisto quando as opções chegam
  const watching = new WeakSet();
  function watch(s){
    if(watching.has(s)) return; watching.add(s);
    const w = new MutationObserver(() => { if(!s.isConnected){ w.disconnect(); watching.delete(s); return; } if(kindOf(s)){ w.disconnect(); watching.delete(s); enhance(s); } });
    w.observe(s, { childList:true, subtree:true });
  }
  function enhance(s){
    if(done.has(s)) return;
    if(!kindOf(s)){ watch(s); return; }
    const box = mk('div'), mo = new MutationObserver(() => build(s));
    s.insertAdjacentElement('afterend', box);
    s.classList.add('sel-src'); s.setAttribute('tabindex', '-1'); s.setAttribute('aria-hidden', 'true');
    done.set(s, { box, mo });
    mo.observe(s, { childList:true, subtree:true, characterData:true, attributes:true, attributeFilter:['disabled', 'hidden', 'label'] });
    Object.defineProperty(s, 'value', { configurable:true, get(){ return valDesc.get.call(this); }, set(v){ valDesc.set.call(this, v); build(s); } });
    s.addEventListener('change', () => build(s));
    box.addEventListener('click', e => {
      const b = e.target.closest('button'); if(!b || b.disabled) return;
      const idx = +b.dataset.i; if(s.selectedIndex === idx) return;
      lastPick = { key:keyOf(s), val:b.dataset.v, t:Date.now() };
      s.selectedIndex = idx; build(s);
      s.dispatchEvent(new Event('input', { bubbles:true })); s.dispatchEvent(new Event('change', { bubbles:true }));
    });
    box.addEventListener('keydown', e => {
      if(!/^(ArrowLeft|ArrowRight|ArrowUp|ArrowDown|Home|End)$/.test(e.key)) return;
      const bs = Array.prototype.filter.call(box.children, c => !c.disabled); const i = bs.indexOf(document.activeElement); if(i < 0) return;
      const n = e.key === 'Home' ? 0 : e.key === 'End' ? bs.length - 1 : (i + (/Right|Down/.test(e.key) ? 1 : -1) + bs.length) % bs.length;
      e.preventDefault(); bs[n].focus(); bs[n].click();
    });
    build(s);
  }
  function scan(root){ (root.querySelectorAll ? root.querySelectorAll('select') : []).forEach(s => { if(s.closest(ROOTS)) enhance(s); }); }
  // síncrono (microtarefa): o <select> novo já nasce escondido, antes do próximo quadro
  const mo = new MutationObserver(ms => {
    for(const m of ms){ for(const n of m.addedNodes){ if(n.nodeType === 1 && (n.tagName === 'SELECT' || n.querySelector('select'))){ scan(document); return; } } }
  });
  mo.observe(document.body, { childList:true, subtree:true });
  scan(document);
  window.__tvChips = { scan: () => scan(document), enhanced: s => done.has(s) };
})();
