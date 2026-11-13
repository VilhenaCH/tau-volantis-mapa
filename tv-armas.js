/* Tau Volantis · armas e munição (lógica pura, sem DOM). 1 unidade de munição = 1 tiro.
   Carrega no navegador como window.TVArmas e no Node (testes) via require. */
(function(root, factory){
  if(typeof module === 'object' && module.exports) module.exports = factory();
  else root.TVArmas = factory();
})(typeof self !== 'undefined' ? self : this, function(){
  'use strict';

  const CATS_ARMA = ['Armas de Fogo', 'Armas Brancas e Improvisadas'];
  const CAP_PADRAO = 6;

  /* Tabela de capacidade do carregador: primeira regra que casar vence. Ajuste os números aqui. */
  const REGRAS_CAPACIDADE = [
    [r => /ar comprimido/.test(r.n), 1],
    [r => r.cal === 'co2', 8],
    [r => r.cal === 'arrow' || r.cal === 'bolt' || /\barco\b|besta/.test(r.n), 1],
    [r => r.cal === 'flare' || /sinaliza/.test(r.n), 1],
    [r => r.cal === 'nail', 10],
    [r => r.cal === 'tranq' || r.cal === 'improv', 1],
    [r => r.cal === 'polvora_negra' || /soca-soca/.test(r.n), 1],
    [r => r.cal === 'festim', 6],
    [r => /revólver/.test(r.n), 6],
    [r => /submetralhadora|metralhadora/.test(r.n), 25],
    [r => /assalto/.test(r.n), 30],
    [r => /fuzil/.test(r.n), 8],
    [r => /ferrolho|bolt|precisão/.test(r.n), 5],
    [r => /cano serrado|cano único|câmara única/.test(r.n), 1],
    [r => /dois canos/.test(r.n), 2],
    [r => /tática|pump/.test(r.n), 6],
    [r => /semiautom/.test(r.n), 10],
    [r => /espingarda/.test(r.n), 2],
    [r => /pistola/.test(r.n), 12],
    [r => /carabina|rifle/.test(r.n), 5]
  ];

  function ehArma(category){ return CATS_ARMA.indexOf(category) !== -1; }

  function usaMunicao(ref){ return !!(ref && ref.calibre) && ehArma(ref.category) && ref.alc !== 'corpo a corpo'; }

  function capacidade(ref, inst){
    const mm = inst && parseInt(inst.magMax, 10);
    if(mm > 0) return mm;
    if(!ref) return CAP_PADRAO;
    const r = { n: String(ref.name || '').toLowerCase(), cal: ref.calibre };
    if(/pistola/.test(r.n) && String(r.cal) === '22' && !/submetralhadora/.test(r.n)) return 10;
    for(let i = 0; i < REGRAS_CAPACIDADE.length; i++) if(REGRAS_CAPACIDADE[i][0](r)) return REGRAS_CAPACIDADE[i][1];
    return CAP_PADRAO;
  }

  function lerCrit(s){
    const m = /(\d+)\s*\/\s*x\s*(\d+)/i.exec(String(s || ''));
    return m ? { margem: parseInt(m[1], 10), mult: parseInt(m[2], 10) } : { margem: 20, mult: 2 };
  }

  /* Ataque virtual com a mesma forma de card.attacks[i]; nada é copiado para a ficha. */
  function ataque(inst, ref){
    const c = lerCrit(ref && ref.crit), corpo = !ref || ref.alc === 'corpo a corpo';
    return {
      id: 'w:' + inst.uid, name: inst.name || (ref && ref.name) || 'Arma', damage: (ref && ref.dano) || '',
      critMargin: c.margem, critMult: c.mult,
      skill: corpo ? 'luta' : 'pontaria', attribute: corpo ? 'for' : 'agi',
      addAttrToDamage: false, addTrainingToDamage: false
    };
  }

  const calibreDe = (inst, refDe) => { const r = refDe && refDe(inst); return r && r.calibre != null ? r.calibre : inst.calibre; };

  /* Recarga: tira tiros das pilhas do mesmo calibre (menores primeiro) até encher. Não muta nada.
     ops = { uid: instAtualizada | null (apagar) }; a própria arma entra com o novo mag. */
  function planoRecarga(itens, arma, ref, refDe){
    const cap = capacidade(ref, arma), mag = Math.max(0, parseInt(arma.mag, 10) || 0), need = Math.max(0, cap - mag), ops = {};
    const cal = ref && ref.calibre;
    if(!usaMunicao(ref) || need === 0 || cal === 'festim') return { ops, carregados: 0, faltou: cal === 'festim' ? need : 0 };
    const pilhas = (itens || []).filter(i => i.uid !== arma.uid && i.category === 'Munição' && !i.slot && i.cond !== 0 && (i.qty | 0) > 0 && calibreDe(i, refDe) === cal)
      .sort((a, b) => a.qty - b.qty);
    let falta = need, carregados = 0;
    for(const p of pilhas){
      const take = Math.min(falta, p.qty); if(take <= 0) break;
      ops[p.uid] = take === p.qty ? null : Object.assign({}, p, { qty: p.qty - take });
      falta -= take; carregados += take;
    }
    if(carregados > 0) ops[arma.uid] = Object.assign({}, arma, { mag: mag + carregados });
    return { ops, carregados, faltou: falta };
  }

  function planoDescarga(arma){
    return { tiros: Math.max(0, parseInt(arma.mag, 10) || 0), armaDepois: Object.assign({}, arma, { mag: 0 }) };
  }

  /* Item de munição do catálogo para devolver tiros descarregados (nunca festim nem sem calibre). */
  function municaoDoCalibre(calibre, catalogo){
    if(!calibre || calibre === 'festim') return null;
    return (catalogo || []).find(i => i.category === 'Munição' && i.calibre === calibre) || null;
  }

  const ROTULOS = { '22':'.22 LR', '22mag':'.22 magnum', '38':'.38 Special', '45acp':'.45 ACP', '223':'.223', '243':'.243', '270':'.270', '308':'.308', '3006':'.30-06',
    '9mm':'9mm', '12':'calibre 12', '16ga':'calibre 16', '20ga':'calibre 20', co2:'CO₂', flare:'sinalizador', arrow:'flechas', bolt:'virotes', nail:'pregos',
    festim:'festim', improv:'improvisada', tranq:'dardos', dart:'dardos', pedra:'pedras', arpao:'arpão', polvora_negra:'pólvora negra' };
  function rotuloCalibre(cal){ return cal == null ? '' : (ROTULOS[cal] || String(cal)); }

  return { ehArma, usaMunicao, rotuloCalibre, capacidade, lerCrit, ataque, planoRecarga, planoDescarga, municaoDoCalibre, REGRAS_CAPACIDADE };
});
