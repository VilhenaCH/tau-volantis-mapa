/* Tau Volantis · motor dos tutoriais por parte (lógica pura, sem DOM).
   Cada tour é { id, papel:'todos'|'mestre'|'jogador', titulo, passos:[{alvo, titulo, texto, papel?}] }.
   A memória é por aparelho: store = { get(chave), set(chave, valor), del?(chave) } (em produção, localStorage). */
(function(root, factory){
  if(typeof module === 'object' && module.exports) module.exports = factory();
  else root.TVGuia = factory();
})(typeof self !== 'undefined' ? self : this, function(){
  'use strict';

  const CHAVE = 'tv-map:guia:';
  const CHAVE_ANTIGA = 'tv-map:tour';          // o passeio antigo; conta como "Visão geral vista"
  // alvo = seletor CSS do que será destacado; o passo é pulado se o alvo não estiver na tela (ex.: sem arma empunhada)
  const passo = (alvo, titulo, texto, papel) => (papel ? { alvo, titulo, texto, papel } : { alvo, titulo, texto });
  const tours = [
    { id:'visao-geral', papel:'todos', titulo:'Visão geral', passos:[
      passo('#dock', 'Bem-vindo à mesa', 'O mapa fica sempre à vista. Em volta dele ficam só quatro coisas: Mapa, Ficha, Mochila e Mesa. O d20 flutuante rola dados em qualquer tela (tecla D).'),
      passo('#dock-ficha', 'Ficha e Mochila', 'A Ficha mostra vida, perícias, armas e ataques. A Mochila guarda os itens em grade, com dois lugares para armas e a munição contada.'),
      passo('#dock-mesa', 'Mesa', 'O feed de rolagens, o grupo, o diário e o mundo ficam juntos no painel Mesa.'),
      passo('#mchip-add', 'Marcar e personagens', 'Marcar deixa notas e pins no mapa e abre a gaveta de personagens, onde você cria os seus e coloca no mapa quando quiser.'),
      passo('#mchip-master', 'Faixa do mestre', 'Em Mestre você escolhe a cena (Exploração, Combate ou Descanso) e abre clima, sessão e o mapa tático. Com cena tática ativa, um ícone pisca acima do d20.', 'mestre'),
      passo('#search-toggle-btn', 'Busca única', 'A lupa acha funções, lugares, pins e perícias. Os Ajustes e estes tutoriais ficam no menu ☰.')
    ] },
    { id:'ficha', papel:'todos', titulo:'Ficha e armas', passos:[
      passo('.ox-card', 'Seus números', 'Vida e demais pontos ficam no topo da ficha. Toque num valor para ajustar.'),
      passo('.ox-tabs', 'Abas da ficha', 'Agente, Perícias, Combate e Poderes. Os ataques e as armas ficam em Combate.'),
      passo('.op-w', 'Armas empunhadas', 'O que você equipar nos lugares de arma da Mochila aparece aqui, com ataque, dano, alcance e munição.'),
      passo('.op-w .inv-item-actions', 'Atacar', 'Atacar rola o ataque e o dano de uma vez e gasta 1 tiro de arma de fogo. Sem munição, o botão vira Recarregar.'),
      passo('.op-w .mag-line', 'Munição', 'O carregador mostra os tiros que restam. Recarregar puxa da Mochila a munição do mesmo calibre, uma por tiro que falta.')
    ] },
    { id:'mochila', papel:'todos', titulo:'Mochila', passos:[
      passo('.inv-cap', 'Capacidade', 'A barra mostra quanto da capacidade da mochila já está ocupado.'),
      passo('#inv-filter', 'Buscar e filtrar', 'Procure um item pelo nome ou filtre por categoria.'),
      passo('.eq-strip', 'Equipamento', 'Os lugares de equipamento ficam acima da lista. Há duas armas: principal e secundária. O carregador aparece no quadro da arma de fogo.'),
      passo('#inv-list', 'Itens', 'Cada item é um quadro. Toque para abrir os detalhes e as ações do item.'),
      passo('#inv-trade-open', 'Trocar', 'Passe itens para outro personagem sem sair da mochila.'),
      passo('#inv-find', 'Procurar', 'Abre o Saque, para vasculhar lugares e pescar.')
    ] },
    { id:'saque', papel:'todos', titulo:'Saque e pesca', passos:[
      passo('#char-select', 'Quem vasculha', 'Escolha o personagem que procura. O que for achado vai para a mochila dele.'),
      passo('#loc-grid', 'Lugares', 'Toque num lugar para vasculhar. Cada lugar sorteia itens diferentes.'),
      passo('#fish-btn', 'Pescar', 'Em rios, igarapés e margens, a pesca também sorteia o resultado.'),
      passo('.sq-set', 'Ajustes do saque', 'Aqui ficam o envio para o Discord e as outras opções do saque.')
    ] },
    { id:'mesa', papel:'todos', titulo:'Mesa', passos:[
      passo('#mesa-tabs', 'Abas da Mesa', 'Feed, Grupo, Diário e Mundo ficam no mesmo painel. Troque de aba sem perder o mapa.'),
      passo('#mesa-feed', 'Feed', 'Toda rolagem do grupo aparece aqui na hora, com quem rolou e o resultado.'),
      passo('#dock-roll', 'Rolar', 'O d20 abre a folha de rolagem: dados, perícias e ataques do seu personagem.')
    ] },
    { id:'rolagem', papel:'todos', titulo:'Rolagem', passos:[
      passo('.qr-who', 'Rolando como', 'Escolha qual personagem rola. O resultado aparece no feed com o nome dele.'),
      passo('.qr-dice', 'Dados', 'Toque num dado para rolar. Vantagem e Desvantagem rolam 2d20 e ficam com o maior ou o menor.'),
      passo('.qr-chips', 'Perícias', 'Com ficha, as perícias já saem com o seu bônus. O atributo pode ser trocado antes da rolagem.'),
      passo('.qr-atk', 'Ataques', 'Cada arma empunhada tem o seu botão de Atacar. Ele rola ataque e dano e gasta 1 tiro de arma de fogo.')
    ] },
    { id:'tatico-mestre', papel:'mestre', titulo:'Mapa tático (mestre)', passos:[
      passo('#tac-top', 'Mapa tático', 'Aqui você monta a cena de combate: grade, tokens e rodadas. Os jogadores veem a mesma cena.'),
      passo('#tac-bar', 'Ferramentas', 'Régua mede distâncias. Token coloca personagens e NPCs. Combate controla iniciativa e rodadas. Cena cria e troca de cena.'),
      passo('#tac-map', 'Tokens na grade', 'Toque num token para ver os detalhes e mover casa por casa. Com a régua ligada, toque nos pontos do mapa para medir.'),
      passo('#tac-top .tac-back', 'Voltar ao mapa', 'A seta volta ao mapa principal. Ao ativar a cena, os jogadores recebem um ícone que pisca acima do d20.')
    ] },
    { id:'tatico-jogador', papel:'jogador', titulo:'Mapa tático (jogador)', passos:[
      passo('#tac-top', 'Mapa tático', 'O mestre ativou uma cena de combate. Aqui você vê a grade, os tokens e a rodada.'),
      passo('#tac-bar', 'Régua, Meu token e Dados', 'Régua mede distâncias, Meu token coloca o seu personagem na cena e Dados rola sem sair do tático.'),
      passo('#tac-map', 'Mover o seu token', 'Toque no seu token para abrir os detalhes e mover casa por casa.')
    ] },
    { id:'gaveta', papel:'todos', titulo:'Gaveta de personagens', passos:[
      passo('[data-roster="novo"]', 'Novo personagem', 'Crie um personagem com ficha e mochila próprias. Ele fica guardado na gaveta até você querer colocá-lo no mapa.'),
      passo('#rs-list .rs-card', 'Cada personagem', 'Colocar espera o seu toque no mapa; No centro põe na vista atual. Guardar tira do mapa e devolve para a gaveta.'),
      passo('#rs-filter', 'Filtro', 'Procure pelo nome quando a gaveta crescer.'),
      passo('#rs-list .rs-sw', 'Modelo', 'Com Modelo ligado, cada vez que o personagem vai ao mapa vira uma cópia nova (Zumbi, Zumbi 2…). Ideal para NPCs repetidos.')
    ] },
    { id:'mestre', papel:'mestre', titulo:'Ferramentas do mestre', passos:[
      passo('#mchip-master', 'Faixa do mestre', 'Este botão abre as ferramentas do mestre e mostra a cena atual da mesa.'),
      passo('#mstrip .ms-scene', 'Cena da mesa', 'Exploração, Combate ou Descanso. Todos na mesa veem a cena que você escolher.'),
      passo('#mstrip .ms-tools', 'Ferramentas', 'Clima, Tático, Sessão e Saque ficam a um toque. Em Tático você ativa a cena de combate para os jogadores.'),
      passo('#mchip-add', 'Gaveta de NPCs', 'Em Marcar, Personagens (gaveta) guarda NPCs prontos. Com Modelo ligado, cada vez que um vai ao mapa vira uma cópia nova.'),
      passo('#menu-toggle-btn', 'Ajustes', 'No menu ☰ ficam os Ajustes, as campanhas e a lista de tutoriais.')
    ] }
  ];

  const porId = (id, lista) => (lista || tours).filter(t => t.id === id)[0] || null;
  const ler = (store, k) => { try{ return store.get(k); }catch(e){ return null; } };
  const gravar = (store, k, v) => { try{ store.set(k, v); }catch(e){} };
  const apagar = (store, k) => { try{ if(store.del) store.del(k); else store.set(k, ''); }catch(e){} };

  // passos que valem para este papel e cujo alvo existe agora na tela
  function passosVisiveis(tour, papel, existe){
    if(!tour || !Array.isArray(tour.passos)) return [];
    if(tour.papel && tour.papel !== 'todos' && tour.papel !== papel) return [];
    return tour.passos.filter(p => (!p.papel || p.papel === 'todos' || p.papel === papel) && !!existe(p.alvo));
  }
  function visto(id, store){
    if(ler(store, CHAVE + id)) return true;
    return id === 'visao-geral' && !!ler(store, CHAVE_ANTIGA);
  }
  function marcar(id, store){ gravar(store, CHAVE + id, '1'); }
  function limpar(id, store){
    apagar(store, CHAVE + id);
    if(id === 'visao-geral') apagar(store, CHAVE_ANTIGA);
  }
  // o aviso discreto "Ver dica rápida?" só vale para tour que existe e que a pessoa ainda não viu nem dispensou
  const convite = (id, store, lista) => !!porId(id, lista) && !visto(id, store);

  return { tours, porId, passosVisiveis, visto, marcar, limpar, convite, CHAVE, CHAVE_ANTIGA };
});
