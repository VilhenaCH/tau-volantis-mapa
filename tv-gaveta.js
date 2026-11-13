/* Tau Volantis · gaveta de personagens (lógica pura, sem DOM nem armazenamento).
   Os planos devolvem "writes": caminho lógico → valor (null apaga). Quem grava (app.js) traduz:
   tokens/{id} e pins/{id} são itens dos vetores tokens/pins; characters/{id} e inventories/{id} são nós do banco. */
(function(root, factory){
  if(typeof module === 'object' && module.exports) module.exports = factory();
  else root.TVGaveta = factory();
})(typeof self !== 'undefined' ? self : this, function(){
  'use strict';

  const KINDS = ['pc', 'npc'];
  const clone = v => (v === undefined ? v : JSON.parse(JSON.stringify(v)));
  const norm = s => String(s == null ? '' : s).trim().toLowerCase();
  const temItens = o => !!o && Object.keys(o).length > 0;

  function nova(dados, ctx){
    if(KINDS.indexOf(dados && dados.kind) === -1) throw new Error('Tipo de personagem desconhecido.');
    const nome = String(dados.name == null ? '' : dados.name).trim() || (dados.kind === 'npc' ? 'NPC' : 'Personagem');
    const e = { id: ctx.novoId(), kind: dados.kind, name: nome, tpl: dados.tpl == null ? dados.kind === 'npc' : !!dados.tpl,
      ownerId: dados.ownerId || null, card: {}, inv: {}, onMap: null, createdAt: ctx.agora, updatedAt: ctx.agora };
    if(dados.color) e.color = dados.color;
    return e;
  }

  // "Zumbi" → "Zumbi 2" → "Zumbi 3"…; compara sem diferenciar maiúsculas e espaços nas pontas
  function nomeSequencial(base, existentes){
    const usados = new Set((existentes || []).map(norm)), b = String(base == null ? '' : base).trim();
    if(!usados.has(norm(b))) return b;
    const raiz = b.replace(/\s+\d+$/, '') || b;
    for(let i = 2; ; i++){ const cand = raiz + ' ' + i; if(!usados.has(norm(cand))) return cand; }
  }

  // mochila copiada com uid novo em cada item (a chave acompanha o uid)
  function inventarioNovo(inv, novoId){
    const out = {};
    Object.keys(inv || {}).forEach(k => { const u = novoId(); out[u] = Object.assign(clone(inv[k]), { uid: u }); });
    return out;
  }
  function fichaNova(card, id, nome){
    const c = clone(card) || {};
    if(!temItens(c)) return { tokenId: id, name: nome };
    c.tokenId = id; c.name = nome;
    return c;
  }
  const caminhoMapa = (kind, id) => (kind === 'pc' ? 'tokens/' : 'pins/') + id;

  function objetoNoMapa(e, id, nome, pos){
    const base = { id, lat: pos.lat, lng: pos.lng };
    const dono = { ownerId: e.ownerId || null, ownerName: e.ownerName || null };
    const o = e.kind === 'pc' ? Object.assign(base, { label: nome }, dono) : Object.assign(base, { type: 'npc', title: nome, note: '' }, dono);
    if(e.color) o.color = e.color;
    return o;
  }

  function planoColocar(e, ctx){
    if(!e.tpl && e.onMap) throw new Error('Este personagem já está no mapa.');
    const copia = !!e.tpl;
    const id = copia ? ctx.novoId() : e.id;
    const nome = copia ? nomeSequencial(e.name, ctx.nomesNoMapa || []) : e.name;
    const inv = copia ? inventarioNovo(e.inv, ctx.novoId) : clone(e.inv || {});
    const writes = {};
    writes[caminhoMapa(e.kind, id)] = objetoNoMapa(e, id, nome, ctx.pos);
    writes['characters/' + id] = fichaNova(e.card, id, nome);
    writes['inventories/' + id] = temItens(inv) ? inv : null;
    const depois = copia ? clone(e) : Object.assign(clone(e), { onMap: id, updatedAt: ctx.agora });
    return { writes, idNoMapa: id, entradaDepois: depois };
  }

  function planoGuardar(e, ctx){
    if(e.tpl) throw new Error('Modelo não volta para a gaveta: cada cópia no mapa é independente.');
    if(!e.onMap) throw new Error('Este personagem não está no mapa.');
    const id = e.onMap, writes = {};
    writes[caminhoMapa(e.kind, id)] = null;
    writes['characters/' + id] = null;
    writes['inventories/' + id] = null;
    const h = ctx.holder || {};
    const depois = Object.assign(clone(e), { card: clone(ctx.card) || {}, inv: clone(ctx.inv) || {}, onMap: null, updatedAt: ctx.agora });
    if(h.name) depois.name = h.name;
    if(h.color) depois.color = h.color;
    return { writes, entradaDepois: depois };
  }

  function duplicar(e, ctx){
    const id = ctx.novoId(), nome = nomeSequencial(e.name, ctx.nomes || []);
    return Object.assign(clone(e), { id, name: nome, card: fichaNova(e.card, id, nome), inv: inventarioNovo(e.inv, ctx.novoId), onMap: null, createdAt: ctx.agora, updatedAt: ctx.agora });
  }

  const porNome = (a, b) => String(a.name).localeCompare(String(b.name), 'pt-BR', { sensitivity: 'base' });
  const lista = o => Object.keys(o || {}).map(k => o[k]).filter(Boolean);
  // O que cada pessoa enxerga: o mestre vê as duas gavetas; o jogador, só os próprios personagens da gaveta compartilhada.
  function visiveis(ctx, roster, gmRoster){
    if(!ctx.master){
      if(!ctx.uid) return [];
      return lista(roster).filter(e => e.kind === 'pc' && e.ownerId === ctx.uid).sort(porNome);
    }
    let todos = lista(roster).concat(lista(gmRoster));
    if(ctx.aba === 'npcs') todos = todos.filter(e => e.kind === 'npc' || e.tpl);
    return todos.sort(porNome);
  }
  const abas = master => (master ? [['todos', 'Todos'], ['npcs', 'NPCs e modelos']] : [['todos', 'Meus personagens']]);

  return { visiveis, abas, nova, nomeSequencial, planoColocar, planoGuardar, duplicar };
});
