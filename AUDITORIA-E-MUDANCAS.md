# Tau Volantis — auditoria e mudanças desta rodada

Base: o ZIP `tau-volantis-mapa-main` (HTML + CSS + JS puro, Leaflet, Firebase compat v10 via CDN). Nada de build, npm ou terminal: continua sendo só enviar os arquivos pelo navegador.

## 1. Auditoria (o que o código real faz)

**Funciona de verdade**
- Mapa Leaflet com pins (17 tipos), tokens, áreas (polígono/retângulo/círculo), rotas com tempo estimado, busca, lista de navegação, agrupamento/veículos/abrigos.
- Login Google + perfil de jogador; sincronização em tempo real (Realtime Database); fallback em localStorage sem Firebase.
- Campanhas independentes (a "legacy" mantém os caminhos antigos), sessões, código de convite, papéis mestre/jogador.
- Saque por sorteio ponderado (940 itens, 11 tipos de local), pesca, animação de roleta, escolha de guardar/descartar.
- Inventário por token/NPC (modo espaços, carga por categoria ou livre), troca atômica entre dois donos, registro de transações (CSV) e auditoria no Discord com fila de reenvio.
- Dados completos (kh/kl/dh/dl, explosão, rerrolagem, sucessos, dados físicos), atalhos, ficha leve, necessidades (registro manual), relógio, exploração dos pins, ofício (receitas).
- Clima global com overlay e narração no Discord.

**Parcial / com problemas encontrados**
- Saque **não era persistente**: cada busca sorteava do zero; a "reserva" de um pin era um contador gravado junto com o array inteiro de pins (dois jogadores podiam sobrescrever um ao outro).
- Inventário sem quantidade (cada unidade ocupava um espaço), sem equipamento, sem condição, sem dividir/agrupar, sem contêineres.
- O menu "Sistema" não fechava ao escolher uma opção (deixava o painel aberto por trás da gaveta).
- Clima podia ser alterado por qualquer pessoa, mesmo com mestre definido.
- Permissões: no cliente, `isMaster()` e `canEditHolder()` são aplicadas; nas regras sugeridas, qualquer membro escreve em pins, tokens e inventários de qualquer um (a regra não distingue dono). Num arquivo `SUGESTAO`, **não dá para saber** quais regras estão publicadas de fato no Firebase.
- O link do webhook do Discord está escrito no `app.js`, que é público: quem abrir o site consegue lê-lo e postar no seu canal. **Preservado exatamente como estava** (conferido por hash), como você pediu. Se um dia quiser reduzir o risco, o caminho é rotacionar o webhook no Discord e colar o novo no mesmo lugar; não fiz isso.
- Pins/tokens/áreas/rotas são gravados como arrays inteiros: edições simultâneas em itens diferentes ainda podem se sobrescrever (não alterei, para não arriscar seus dados).

**Ainda não existe**
- Mapa tático (cenas, grade, névoa), encontros, presença de jogadores conectados, recursos compartilhados do grupo, tabelas de saque editáveis pelo mestre (hoje o mestre escolhe a tabela existente por contêiner), regras automáticas de sobrevivência.

## 2. O que mudou

**Inventário v2** (compatível: itens antigos continuam válidos; campos novos são opcionais, `v:2` marca instâncias novas)
- Pilhas com quantidade (comida, bebida, munição, médicos, combustível, plantas, materiais, peixes); usar consome 1; descartar parcial; **Dividir** e **Agrupar iguais**.
- **Equipamento**: 7 espaços (cabeça, tronco, mãos, pernas, botas, mochila, acessório) com capacidade configurável pelo mestre. O nome do item só *sugere* o espaço; nenhum bônus é aplicado.
- **Condição** (Quebrado → Novo) para armas, ferramentas, roupas etc.; ações Reparar/Condição registradas.
- **Inspecionar** (utilidade, origem, histórico daquela unidade), filtro por nome e categoria.
- Troca e ofício agora respeitam quantidades e capacidade por dono.

**Contêineres e saque persistente**
- O mestre marca um pin como contêiner (Mestre → Contêineres): tabela de saque, mínimo/máximo, capacidade, bloqueado/aberto.
- "Vasculhar" sorteia **uma única vez** (transação do Firebase); depois, o conteúdo é o que sobrou. "Pegar" também é transacional: dois jogadores no mesmo item → só um leva. Estados: inexplorado, parcial, esgotado, bloqueado. Reabastecer/esvaziar/bloquear só pelo mestre, sem reposição automática.
- Tudo fica nos caminhos de inventário que já existem (`inventories/{pin}` + `_meta`), então **não exige regras novas** do Firebase.

**Navegação por áreas** (menu "Áreas"): Mundo, Personagem, Inventário, Expedição, Diário, Grupo e Mestre (só aparece para o mestre). Painéis são folhas inferiores no celular.

**Diário**: entradas (resumo, pista, decisão, objetivo, nota), públicas ou privadas do mestre, objetivos com estado, linha do tempo (sessões, saques de contêiner, trocas, fabricações, eventos como mudança de clima, rolagens marcadas como relevantes).

**Grupo**: sessão, participantes, personagens com recursos e equipamento.

**Ficha**: recursos configuráveis (PV/PE/Sanidade ou o que a mesa definir; você escolhe nomes e máximos, sem suposição de regra), equipamento real, clima atual junto às necessidades.

**Mestre**: contêineres, dar item, recursos, espaços de equipamento, ajuste de necessidades em grupo (com confirmação e registro), **backup/restauração** (JSON; valida o arquivo, baixa um backup do estado atual antes de restaurar, exige digitar RESTAURAR).

## 3. Passo a passo pelo celular
1. No GitHub (navegador), abra o repositório → **Add file → Upload files** e envie `app.js`, `index.html` e `style.css` substituindo os atuais. `tv-icons.js` não mudou.
2. **Opcional, para o diário privado do mestre e o mapa tático funcionarem com Firebase**: Firebase Console → Realtime Database → Regras. Compare com `firebase-rules.SUGESTAO-v3.json` (inclui tudo da v2 mais as chaves do mapa tático). Sem isso, diário e tático mostram aviso ao salvar; todo o resto funciona. Eu não publiquei nem alterei nenhuma regra.
3. Na campanha original, quem ainda não é mestre toca em Campanhas → "Assumir como mestre" para liberar a área Mestre só para você (hoje, sem mestre definido, todos são tratados como mestre).

## 4. Como testei
Chromium no celular (360–420 px) com os CDNs servidos localmente: inventário completo (empilhar, equipar, dividir, condição, inspecionar), contêiner (vasculhar/pegar/guardar), navegação das áreas, diário, backup/restauração, ofício, dados e saque clássico, sem erros de console e sem rolagem horizontal. Com um Firebase simulado em memória e dois clientes ao mesmo tempo: um único vasculhador e nenhum item duplicado. **Não testado contra o Firebase real** (login Google e regras publicadas), nem em aparelho físico.

## 5. Decisões que dependem de você
- Quais necessidades e efeitos de sobrevivência devem ser automáticos (hoje: tudo manual, com ajuste em grupo pelo mestre).
- Se mochilas equipadas devem aumentar a capacidade, e quanto.
- Regras de PV/PE/Sanidade da sua adaptação (hoje só guardo os valores).
- Se quer restringir no Firebase quem escreve em tokens/inventários (exige reestruturar os dados).

## 6. Mapa tático (nova rodada)
**Onde fica:** menu **Áreas → Tático** (tela cheia; o botão ← volta ao mapa).

**O que faz**
- **Cenas**: o mestre cria cenas a partir de uma *grade em branco*, de uma *foto do celular* (reduzida para até 1600 px e guardada à parte, para não pesar na sincronização) ou de um *endereço de imagem* (por exemplo `cenas/posto.jpg`, subindo o arquivo numa pasta `cenas` do GitHub). "Ativar" faz o grupo todo ver a cena; "Ver" é só prévia do mestre. Quando o mestre ativa outra cena, os jogadores recebem um aviso.
- **Grade**: tamanho da casa, deslocamento horizontal/vertical, metros por casa e regra de diagonal (1 casa / alterna 1 e 2 / linha reta), ajustáveis com botões −5 −1 +1 +5 e com pré-visualização antes de salvar.
- **Tokens**: personagens do mapa (com o dono), inimigos, aliados e objetos (criar vários de uma vez: "Lobo 1…N"). Arrastar encaixa na casa. O jogador só arrasta o próprio token; o mestre arrasta todos.
- **Deslocamento**: cada token gasta casas por turno; o limite (padrão da cena e exceção por token) pode só **avisar**, **bloquear jogadores** ou ficar desligado. Nada mais é aplicado sozinho.
- **Combate**: iniciativa digitada pelo mestre (role em "Dados"), ordem, rodada, "Próximo" (zera o movimento de quem começa), opção de jogadores só moverem na vez do próprio token.
- **Régua**: toque em dois pontos; mostra casas e metros (só local, não é gravada).
- **Oculto**: o mestre pode ocultar/revelar tokens. Ocultos ficam num caminho separado (`gm-tactical`) que só o mestre assina; o jogador nem recebe o dado.

**Valores provisórios (confirme com a sua mesa):** 1,5 m por casa, 6 casas por turno, diagonal = 1 casa. Estão marcados na tela como padrões editáveis; não afirmo que sejam regra oficial.

**Para funcionar com Firebase:** publique `firebase-rules.SUGESTAO-v3.json` (inclui `tv-map:tactical`, `tv-map:tactical-img` e `tv-map:gm-tactical`, para campanhas novas e para a original). Sem isso, o app mostra aviso ao tentar gravar; o resto continua normal. As regras v3 deixam o jogador gravar só nos próprios tokens e reservam cenas, grade, regras, turnos e ocultos ao mestre. Não publiquei nada.

**Limites conhecidos**
- A imagem da cena **não é secreta**: quem abre a cena a vê inteira. Só os tokens ocultos são realmente privados. Não há névoa de guerra nesta versão.
- O limite de deslocamento é um apoio de mesa: o app o aplica no aparelho, e as regras v3 não conferem a conta de casas (alguém que mexa no banco por fora poderia burlar).
- Tokens do tático são independentes dos tokens do mapa geográfico (guardam só nome, dono e vínculo).
- Testado em Chromium 360–420 px e com dois clientes simulados (mestre e jogador), **não** no Firebase real nem em aparelho físico.

## 7. Revisão de UX e acessibilidade (menu Áreas e mapa tático)
Revisei com critérios de acessibilidade (WCAG 2.1 A/AA), as 10 heurísticas de usabilidade e regras de acabamento visual. O que mudou:
- **Mover sem arrastar**: botões direcionais (8 direções, 1 casa por toque) no painel do token e setas do teclado com o token em foco. Em celular, arrastar com casas pequenas é impreciso; antes só havia arrasto.
- **Desfazer**: restaura a posição e o movimento do último deslocamento.
- **Teclado e leitor de tela**: tokens focáveis, com nome falado (nome, tipo, coluna e linha, se está oculto ou na vez); o foco volta ao token depois de mover; avisos (toasts), barra de turno e régua são anunciados.
- **Alvos de toque** de pelo menos 44 px em todos os botões e campos do tático; foco visível em todos os controles.
- **Texto mínimo de 11 px** (antes havia textos de 9 a 10 px) e números alinhados nos contadores.
- **Sem brilho nem animação em loop**: seleção e vez atual agora usam anel sólido e uma seta ▶ (a vez não depende só de cor).
- **Mais cuidado**: confirmação ao encerrar combate; texto "Carregando a cena…" enquanto a imagem abre; mensagens de erro para jogadores sem jargão ("Avise o mestre"); o mapa se reajusta quando o painel inferior abre ou fecha; ao abrir o tático o foco vai para "Voltar", e ao fechar volta ao menu.
- Contrastes medidos: texto de apoio 5,4:1, texto principal 14:1, bordas de campo 3,4:1, inimigo 4,7:1 (todos acima do mínimo).

Ainda pendente (não mexi): ler as telas antigas (inventário, hub) com o mesmo critério; textos de 10 px existentes nelas continuam.

## 8. Melhorias de interface aplicadas (a partir do design)
- **Aviso de cena ativa** no mapa do mundo: quando o mestre ativa uma cena tática, aparece uma faixa "Cena tática ativa · nome" com o botão **Abrir** e um **×** para dispensar (volta a aparecer quando a cena ativa mudar).
- **Menu Áreas**: o botão Tático mostra o nome da cena ativa e o selo **Ao vivo**; **Dados** agora é um botão do menu (antes era um botão solto na lateral).
- **Barra do tático com 6 botões** (Régua, Centro, Token, Combate, Cena, Dados). "Cenas" e "Grade" viraram um só botão **Cena**; dentro dele há **Ajustar grade** para a cena em exibição.
- **Desfazer movimento** virou uma pílula flutuante no canto do mapa, só aparece depois de um movimento.
- **Painel do token**: contador grande "x/y casas", quadradinhos de movimento, metros usados e as setas de direção ao lado; ícones em vez de emojis.
- Testado em 360, 390 e 420 px: sem rolagem horizontal, alvos de pelo menos 44 px, faixa de aviso acima da barra de abas. Não testado em aparelho físico nem no Firebase real.

## 9. Correção: campanha nova que sumia + código de convite
**O que acontecia.** Ao criar uma campanha, o app gravava a campanha e a sessão dela numa gravação só. As regras do Firebase (`campaign-sessions`) só deixam gravar a sessão depois que a campanha já existe, então o Firebase recusava a gravação inteira. O app mostrava a campanha por um instante (cópia local), depois ela sumia, e o aviso "Abrir agora?" aparecia mesmo assim, porque a falha não era conferida. O mesmo problema impedia a campanha original de ser gravada por completo (ficava sem código de convite e sem a marca "ativa").

**O que mudou (só no `app.js`; as regras não foram alteradas).**
- A campanha é gravada primeiro, depois a sessão, depois os dados copiados. Cada etapa é conferida.
- Se o Firebase recusar, aparece um aviso claro ("A campanha não foi salva. O Firebase recusou a gravação…") e o app não pergunta se quer abrir.
- A campanha original passa a ser gravada em duas etapas, e o registro incompleto que já existe no banco é consertado sozinho (id, data de criação, sessão ativa), quando você é o mestre.
- Novos botões na lista de campanhas, só para o mestre: **Gerar código** (quando não há), **Copiar código** e **Trocar código** (pede confirmação; o código antigo deixa de funcionar para novos jogadores, e quem já entrou continua na campanha).
- Os códigos não se repetem entre campanhas; entrar com o código aceita letras minúsculas.
- Entrar na campanha e assumir como mestre também avisam quando a gravação falha.

**Como testei.** Simulei no teste a regra do Firebase que recusa a gravação (e reproduzi o sumiço antes da correção). Depois da correção, testei criar campanha (vazia e com mapa-modelo), recarregar a página, gerar/trocar/copiar código, um jogador entrando pelo código, o código antigo sendo recusado e o aviso quando o Firebase recusa. Não testei no Firebase real.

## 10. Correção: excluir campanha
Dois problemas, os dois reproduzidos em teste:
- **O botão "Excluir" não aparecia na campanha que está aberta.** Como uma campanha recém-criada normalmente fica aberta, parecia que a exclusão não existia. Agora o botão aparece em qualquer campanha sua, menos a original. Ao excluir a que está aberta, o app volta para a campanha original.
- **Com as regras antigas do Firebase** (`firebase-rules.SUGESTAO.json` e `-v2`), o banco recusa apagar alguns tipos de dado (diário, tático), e a exclusão parava no meio, sem aviso. Agora cada tipo de dado é apagado separadamente, o que o banco recusar é pulado (com aviso), e a campanha e as sessões são removidas no fim. Se a remoção da campanha falhar, aparece um aviso claro. Para apagar tudo de verdade, publique as regras `firebase-rules.SUGESTAO-v3.json`.
- A confirmação (digitar o nome) agora ignora maiúsculas/minúsculas e espaços nas pontas.

---

# Plano em 4 fases (rodada atual)

Tudo é **aditivo**: campos novos são opcionais, nada que já existia foi removido do banco, não há dependência externa nova e os ícones novos são SVG (nenhum emoji). Cada fase foi testada antes de começar a próxima. Arquivos alterados: `app.js`, `index.html`, `style.css` (o `tv-icons.js` e as regras do Firebase não mudaram).

## 11. Fase 1 — tamanhos, token tático com imagem, saque automático por tipo de pin
- **Pins e tokens menores.** Pin comum 26 px; NPC, veículo, abrigo e token 36 px (antes: NPC e token 44 px). A etiqueta com o nome continua só com a primeira palavra.
- **Token do mapa tático com imagem.** Se o token tem foto/GIF, o tático mostra a imagem; sem imagem, continuam as iniciais. A imagem acompanha o token ao trocar.
- **Contêiner de saque automático.** Os pins que são local de saque ganham no popup o botão **Vasculhar**, cada um com a tabela do seu tipo: Saque (casas), Médico (farmácias), Suprimentos (mercados), Combustível (oficinas), Veículo (veículos), Abrigo (acampamentos), Água (rios), Munição, Rádio e Extração (bases) e Radiação (convergência). O primeiro uso sorteia da tabela daquele tipo, grava os itens no inventário do pin e abre o contêiner; depois disso o botão some e nada novo é sorteado (nem ao recarregar). Nota, Perigo, Ameaça, Armadilha, Pino e NPC não viram contêiner. O mestre pode desligar (`container.enabled:false`) ou trocar a tabela (`container.locKey`) por pin.

## 12. Fase 2 — ficha de Ordem Paranormal
- **Atributos** AGI, FOR, INT, PRE e VIG; **perícias** com treino (Destreinado +0, Treinado +5, Veterano +10, Expert +15) e campo "Outros"; total mostrado em cada perícia e botão de rolar.
- **Barras de PV e PD.** Você pediu que DET e PD fossem a mesma coisa: existe só **PD** (azul). Não há PE nem Sanidade.
- **Ataques**: nome, atributo, perícia, dano, margem de crítico e multiplicador. A rolagem de ataque marca CRÍTICO quando o d20 natural cai na margem; o botão de dano rola os dados multiplicados (o bônus fixo não multiplica).
- **Condições** com efeito automático nas rolagens (Abalado, Apavorado, Debilitado, Esmorecido, Fraco, Ofuscado). O texto da rolagem mostra a conta, ex.: `3d20 maior (AGI 3) [(5), 15, (8)] → 15 + Treinado 5 − 2 (Abalado) = 18`. Vulnerável e as outras condições ficam só como marcação.
- **Migração sem perda.** Fichas antigas mostram um aviso: "Migrar" copia os dados para o formato novo mantendo uma cópia (`skillsLegacy`, `resLegacy`) e **não toca** em `skills`, `res`, `notes`, `reminders`, `needs`; "Continuar no formato antigo" não grava nada; dá para voltar ao formato antigo depois.

## 13. Fase 3 — dock, Índice, rolagem rápida e feed vivo
- **Dock de 5 botões** no rodapé: Rolar, Saque, Inventário, Tático, Mais. Um painel por vez; o botão ativo fica marcado; o Tático mostra um ponto quando há cena ativa.
- **Índice (Mais)** com busca (ignora acentos): tudo que saiu do dock (Personagem, Diário, Grupo, Mestre, Mundo/Clima, Sessão, Ofício, Dados, Campanhas, Adicionar ao mapa, Camadas e lista do mapa). A aba "Registro" foi removida; o CSV continua no Índice.
- **Rolagem rápida** (Rolar): d4 a d100, vantagem/desvantagem, expressão livre, e as perícias e ataques do personagem ativo.
- **Feed vivo** unificado (dados, itens e diário em ordem de tempo): chip "Feed da mesa" com contador de novidades no celular, coluna fixa à direita no desktop. Filtros Tudo/Dados/Itens/Diário por campanha; o mestre filtra também "só jogadores / só mestre". Itens privados do mestre nunca aparecem para jogadores.
- **Desktop (≥ 1100 px)**: 3 colunas — mini-ficha | mapa | feed.
- Tocar no mapa fecha as folhas abertas; emojis da interface viraram SVG.

## 14. Fase 4 — clima expandido e filtros do mapa
**Clima (só o mestre muda; o app só aplica modificadores enquanto o clima está ativo):**

| Clima | Efeito mostrado na mesa | O que o app aplica sozinho |
|---|---|---|
| Neblina | −5 Percepção; camuflagem total além de 9 m | −5 na perícia Percepção |
| Vento Forte | −2 ataques à distância; 50% por rodada de apagar chamas/dissipar névoa | −2 em ataques com a perícia Pontaria |
| Vendaval | −5 à distância; apaga chamas e dissipa névoas | −5 em ataques com Pontaria |
| Tempestade | −5 Percepção; efeitos de vendaval; 10% de raio por rodada (8d12) | −5 Percepção e −5 Pontaria; botão do mestre **Testar o raio** (d100 ≤ 10 → rola 8d12; tudo vai para o feed) |
| Nevasca Forte | −5 Percepção; terreno difícil (deslocamento ×2) | −5 Percepção; no mapa tático cada casa custa 2 de deslocamento (aviso e limite usam o custo dobrado) |

Calmo, Nevasca e Nevasca Espectral continuam como eram. Cada clima tem ícone SVG e efeito visual na tela (neblina, rajadas de vento, chuva, neve), que respeita "reduzir movimento". A troca grava um evento no feed ("Clima: A → B (efeitos)") e segue para o Discord como antes. Nas rolagens o modificador aparece na conta, ex.: `… − 5 (Clima: Neblina) = 17`. O que não é número (camuflagem, apagar chamas, dano) fica como lembrete para o mestre decidir.

**Filtros do mapa.** Barra de chips logo abaixo do cabeçalho: **Camadas, Pins, Tokens, Perigos, Rotas, Notas**.
- Cada chip liga/desliga uma categoria. *Tokens* inclui tokens e NPCs; *Perigos* inclui pins de perigo, ameaça, radiação e armadilha **e as áreas marcadas**; *Notas* são os pins de nota; *Pins* é o resto (saque, abrigo, água, veículo…). Nada é apagado: só deixa de aparecer.
- Chip desligado fica tracejado, com texto riscado e a **quantidade escondida**; o chip Camadas ganha um pontinho enquanto houver algo oculto.
- A escolha fica salva **neste aparelho, por campanha** (`tv-mapf:<campanha>`); não vai para o Firebase e não afeta os outros jogadores.
- Usar uma ferramenta de criação (pin, token, área, rota) ou "ir até" um item de uma categoria oculta religa essa categoria sozinho e avisa.
- **Camadas** abre uma folha com o **mapa-base** (Ruas/Relevo/Satélite), um aviso "Ocultos no mapa… / Mostrar tudo", e a **lista de itens para ir até** (a antiga gaveta de navegação, agora dentro da folha, com a mesma busca e os mesmos botões de excluir). O botão **Reiniciar o mapa** mudou para o rodapé dessa folha, com o aviso do que apaga (ainda pede confirmação). O painel flutuante de camadas do menu foi removido.

## 15. Como testei (fases 1–4)
Chromium headless com Firebase simulado (dois clientes, mestre e jogador), em 360, 390 e 420 px e em desktop 1280 px: **cerca de 700 verificações automáticas, todas passando** (clima: 67 + 12 do tático; filtros do mapa: 78; rodada final de larguras: 42; fase 3: 183; fases 1 e 2, tático, inventário, ofício, campanhas e a regressão antiga: o restante). Conferi também capturas de tela dos overlays de clima, dos chips e da folha Camadas. Sem erros de console. Sem rolagem horizontal, alvos de toque ≥ 44 px (chips incluem área de toque estendida).

## 16. O que NÃO foi verificado — leia antes de jogar
- **Nada foi testado em celular de verdade nem no Firebase real**; foi tudo em navegador simulado com banco de mentira. As regras `firebase-rules.SUGESTAO-v3.json` continuam as mesmas (não validam os campos novos, então funcionam publicadas ou não; publicar a v3 é opcional e é você quem publica).
- **Tabelas e condições de Ordem Paranormal escritas de memória** (lista de perícias, treino +5/+10/+15, efeitos de Abalado, Apavorado, Debilitado etc.). Confira com o livro; tudo é editável na ficha.
- **Interpretações minhas:** crítico = d20 natural ≥ margem (o dano multiplica só os dados, não o fixo); condições do mesmo grupo (ex.: Abalado e Apavorado) não se acumulam e vale só a pior; "ataque à distância" para o clima = ataque que usa a perícia **Pontaria**; "−5 em Percepção" vale para a perícia Percepção da ficha.
- **Filtros do mapa e do feed ficam por aparelho e por campanha** (localStorage). Trocar de celular volta tudo a "visível".
- A **v3 das regras não limita quem muda o clima**: a trava "só o mestre" está no app, não no banco (como já era).

## 17. Passo a passo pelo celular (GitHub)
Os três arquivos dependem um do outro (o `index.html` novo tem a barra de filtros e o `app.js` novo procura por ela). **Suba os três juntos, num único commit**, para ninguém abrir o site com versões misturadas:
1. Extraia o ZIP no celular.
2. No repositório: **Add file → Upload files** e selecione de uma vez `app.js`, `index.html` e `style.css` (eles substituem os antigos). Escreva uma mensagem e toque em **Commit changes**.
3. Não mexa em `tv-icons.js` nem nas regras. (Opcional: se ainda não publicou a v3, copie `firebase-rules.SUGESTAO-v3.json` para Firebase Console → Realtime Database → Regras → Publicar.)
4. Espere o GitHub Pages atualizar (1–2 min) e recarregue. O `index.html` agora chama `app.js?v=f4` e `style.css?v=f4`, então o navegador não reaproveita o `app.js` antigo do cache; se ainda assim aparecer a versão antiga, feche e abra o navegador.
5. Se você fizer outra atualização depois, troque `f4` por outro texto (ex.: `f5`) nessas duas linhas do `index.html`.


## 18. Regra de teste de perícia (Ordem Paranormal) — correção
- O **valor do atributo é a quantidade de d20** rolados; vale o **maior**. Atributo 0 → rola **2d20 e vale o menor**. O atributo **não é somado**: somam apenas treinamento, bônus avulso (Outros), condições e clima. Dados descartados aparecem entre parênteses no resultado.
- **Escolher o atributo**: cada perícia da ficha tem um seletor de atributo (campo opcional `skillsV2.<perícia>.attr`; sem ele vale o padrão do sistema, e a linha avisa "padrão XXX" quando foi trocado). Perícias livres também aceitam atributo.
- Na folha **Rolar** há "Atributo desta rolagem": vale só para aquela folha aberta (não altera a ficha) e volta ao padrão ao fechar.
- Condições seguem o atributo escolhido (ex.: Debilitado pesa em AGI/FOR/VIG, não em INT).
- Interpretações: ataques usam o mesmo critério (atributo do ataque define os dados); o crítico vale para o d20 que **ficou**; limite de 20 dados.
- Cache: `app.js?v=f9` / `style.css?v=f9` — nas próximas atualizações troque `f9` por outro texto.

## 19. Painel do personagem recolhível (tela larga)
- A mini-ficha da esquerda ganhou um botão X (recolher). Recolhida, o mapa ocupa a largura toda e aparece uma aba com o ícone de personagem na borda esquerda para reabrir. A escolha é lembrada por campanha neste aparelho. Em telas estreitas o painel não existe (como antes). O feed da direita já era recolhível.

## 20. Lugares reais do OpenStreetMap (hotel, farmácia, posto…) como locais de saque
**O que é.** Com o módulo ligado, hotéis, hospitais, farmácias, mercados, postos, delegacias e locais de fé que existem de verdade na região do mapa aparecem como pontos para explorar. Tocar no ponto abre um cartão (nome, marcação do OpenStreetMap, endereço, estado) com o botão **Vasculhar**.

**Como liga.** Mestre: Mesa de jogo → Campanhas → Configuração desta campanha → módulo **Lugares reais no mapa (OpenStreetMap)**. Aparecem as categorias (Saúde, Comércio, Combustível e oficinas, Hospedagem, Segurança, Locais de fé) e o modo **Quando aparecem**: sempre (a partir do zoom de cidade) ou só perto de um token (250 m). Escolha de módulo, categorias e modo ficam em `campaign-meta/<campanha>/config` (campos novos e opcionais; campanhas antigas não mudam). Chip **Lugares** na barra do mapa mostra/oculta a camada só para quem tocar (fica neste aparelho).

**Como funciona por baixo.**
- A consulta usa a API Overpass, em blocos de mapa no zoom 14, e só desenha com o zoom em 14 ou mais. O resultado fica guardado no aparelho por 14 dias; mexer no mapa dentro da área já carregada não gera consulta. **O jeito de consultar (servidores, tempos, avisos) foi refeito na seção 22**: a primeira versão (descrita aqui) pedia um bloco por vez e era lenta.
- Nada é gravado até alguém tocar em **Vasculhar**. Aí o lugar vira um **pin comum** (`id osm_<tipo><número>`, campos novos opcionais `osm` e `osmTag`), do tipo equivalente (Saúde → Médico, Comércio → Suprimentos, Combustível → Combustível, Hospedagem e Locais de fé → Saque, Segurança → Munição) e o saque usa o sistema de contêineres que já existia: tabela por tipo, sorteio uma única vez, estado compartilhado, histórico e inventário do contêiner. Jogadores e mestre podem vasculhar (as regras do Firebase atuais já permitem, não precisa publicar regras novas).
- O ponto candidato some do mapa quando o pin existe. **Excluir o pin** (mestre) apaga o inventário do lugar e o ponto volta a aparecer como inexplorado.
- Todos os outros recursos de pin valem: o mestre pode trocar a tabela de saque, bloquear, mudar mínimo/máximo, abastecer à mão.

**Limites que valem saber.** Os dados vêm de voluntários do OpenStreetMap: em cidades grandes são bons, em áreas rurais podem faltar lugares; nomes podem estar em branco ("sem nome"). O serviço Overpass público tem limite de uso justo; por isso as consultas são em blocos e guardadas no aparelho. Casas e escolas não entram. Sem internet, só aparecem os blocos já guardados.

**Não testado em aparelho real nem com o Overpass de verdade** (o ambiente de desenvolvimento não alcança a API). Os testes usaram respostas simuladas no mesmo formato.

## 21. Agrupamento de tokens ao afastar o mapa
**O que é.** Com o mapa afastado, tokens, NPCs, veículos e abrigos que ficam muito perto uns dos outros viram **um círculo só com o total** (ex.: 3 tokens + 3 NPCs + 1 carro = **7**). Ao aproximar, cada um volta ao seu lugar. É só visual: nada é salvo no banco e nada muda para os outros jogadores.

**Regras.**
- Vale com o zoom em **15 ou menos** (de rua para mais longe). Do zoom 16 em diante tudo aparece separado.
- Junta o que estiver a menos de **52 pixels** um do outro na tela. Por isso o bando se junta cedo ou tarde conforme você afasta, e quem está longe do bando continua sozinho.
- **Conta:** tokens (uma pilha conta pelos tokens que ela guarda), NPCs, veículos e abrigos. Tokens guardados dentro de um veículo ou abrigo não aparecem no mapa e não entram na conta. Pins comuns (lugares, notas, perigos…) não entram.
- Respeita os filtros da barra do mapa: se **Tokens** ou **Pins** estiver desligado, o que ele esconde não entra no círculo.
- **Tocar no círculo** aproxima o mapa até enquadrar o grupo (no máximo zoom 17). No teclado: Tab até o círculo e Enter ou espaço. O círculo tem rótulo para leitor de tela, por exemplo "Grupo de 7 no mapa: 3 tokens, 3 NPCs, 1 veículo. Toque para aproximar." Acima de 99 aparece "99+".
- **Não agrupa** enquanto você seleciona tokens (modo de seleção) nem enquanto arrasta um token ou pin. Um balão aberto num item que entra num grupo é fechado.
- "Ir até" de pin ou token (Índice e mesa de jogo) aproxima até o zoom 16 no mínimo, então o item procurado aparece sozinho.

**Desligar.** Camadas → botão **Agrupar ao afastar: ligado/desligado**. A escolha vale **só para este aparelho** (`localStorage`, chave `tv-cluster`; padrão: ligado). Não depende de campanha nem do mestre.

**Como foi feito.** Os marcadores de verdade não são removidos: o app só esconde (classe `cl-hide`) os que entraram num círculo e os mostra de volta ao aproximar. Recalcula a cada mudança de zoom e a cada redesenho de tokens/pins. Código em `app.js` (bloco "agrupamento de tokens ao afastar o mapa"), estilo em `style.css` (`.cl-mk`, `.cl-badge`), botão em `index.html` (folha Camadas).

**Limites.** Só o mapa principal agrupa (o mapa tático não). O agrupamento é por distância na tela, de forma simples: dois bandos vizinhos podem se juntar num jeito diferente do que você imaginou, e tocar de novo no círculo resolve. Não medi desempenho com centenas de tokens. **Não testado em celular de verdade** (só em navegador simulado).

## 22. Lugares reais mais rápidos e com aviso do que deu errado
**Por que mudou.** Na primeira versão os lugares demoravam muito ou não apareciam. Causas que encontrei no código: o app pedia **um bloco de mapa por vez** (uma tela de celular em zoom 14 cobre uns 8 a 15 blocos); se um servidor travava, esperava **22 segundos** antes de tentar o próximo; em zoom 14 num celular em pé a tela passava de 9 blocos e o app só avisava "Área grande demais"; e o aviso de falha dizia só "Sem conexão", sem o motivo. Não consigo alcançar o OpenStreetMap daqui, então **não consegui reproduzir o problema com os servidores de verdade**: o conserto foi testado com servidores simulados lentos, quebrados e vazios.

**O que faz agora.**
- **Uma consulta por tela.** Os blocos que faltam (até 8, os mais perto do centro primeiro) vão num único pedido; o resultado é repartido e guardado por bloco. Em celular em pé no zoom 14 cabem até 20 blocos (antes 9). A consulta ficou mais enxuta: só nós e vias (sem relações), prazo de 15 s no servidor, termina em `out center;`.
- **Servidores em paralelo.** Pergunta ao primeiro; se ele falhar, o segundo é consultado **na hora**; se só demorar, o segundo entra após 1,8 s **sem cancelar o primeiro**. Vale a primeira resposta com dados. Cada tentativa tem prazo de 14 s e o conjunto 22 s. Os servidores são `overpass-api.de`, `overpass.private.coffee` e `overpass.kumi.systems`; o que respondeu por último vai primeiro na vez seguinte (guardado em `tv-op-mirror`).
- **Respostas ruins não viram "nenhum lugar".** O Overpass às vezes responde 200 com a mensagem "runtime error: Query timed out" ou com uma página de erro em HTML; isso agora conta como falha e **não é guardado**. Uma resposta vazia só vale se um segundo servidor confirmar; área sem lugares fica guardada 1 dia (com lugares, 14 dias).
- **Busca antecipada.** Em segundo plano o app já pede o entorno (3×3 blocos) de cada token, e do centro do mapa no zoom 13, para o ícone estar pronto quando alguém aproximar. Mexer na tela cancela a busca antecipada e atende a tela na hora.
- **Aviso na tela** (pílula sob os chips): "Carregando lugares… N s" (os segundos aparecem a partir de 3 s); quando falha, diz o motivo ("OpenStreetMap ocupado (HTTP 503)", "Sem conexão com o OpenStreetMap" ou "OpenStreetMap demorou demais") e **vira botão: toque para tentar de novo**. Também tenta sozinho após 8 s, 20 s e 45 s.
- **Testar conexão (mestre).** Configuração da campanha → Lugares reais → botão **Testar conexão com o OpenStreetMap**: mostra, para cada servidor, "ok", "erro HTTP …", "sem rede ou bloqueado" ou "sem resposta em 12 s", com o tempo, e quantos blocos estão guardados no aparelho. Se os lugares continuarem sem aparecer, este teste (e o texto do aviso) dizem onde está o problema.
- **Guardado no aparelho.** Passou de `tv-poi:` para `tv-poi2:` (com validade por bloco). Ao abrir o app o guardado antigo e o vencido são apagados (o antigo podia ter gravado "área vazia" por engano); se faltar espaço, apaga os mais velhos.

**O que continua sem teste de verdade.** O teste de conexão e o aviso foram feitos para você me contar o que aparece no seu celular. Se o OpenStreetMap estiver bloqueado na sua rede ou os três servidores estiverem fora do ar, nada resolve no app: aí o aviso mostra isso. Relações do OpenStreetMap (prédios cadastrados como relação, raros) não entram mais.

## 23. Catálogo ampliado: 1.200 itens com texto próprio e ficha de jogo
**O que mudou.** O catálogo passou de 940 para **1.200 itens** (os 260 novos vêm da sua lista) e **todo item ganhou texto novo e ficha**. Os 940 antigos mantêm **id, nome, categoria, locais, calibre e `fish`** (um teste compara item por item), então inventários, receitas e registros salvos continuam apontando para o mesmo item. Os novos têm ids 941 a 1200, na ordem da sua lista. Categorias novas: **Higiene e Itens Pessoais** e **Lazer e Itens Pessoais**.

**Textos.** Os 1.200 são diferentes entre si (90 a 235 caracteres). Cada um diz o que o item é e em que estado está, para que serve na prática e o limite ou risco (estraga, quebra, esquenta, faz barulho). Itens de lore e anômalos terminam com um gancho para o mestre ("Pista:" ou "Risco:"), sem inventar regra. Nada de frase-modelo ("componente essencial para…"). Os textos antigos não foram aproveitados.

**Ficha de cada item** (tudo opcional e só informativo; **nenhum número é aplicado sozinho**):
- **Volume** 0 a 4 (espaço que ocupa: 0 = bilhete ou comprimido, 1 = mão cheia, 2 = volumoso, 3 = muito volumoso, 4 = enorme).
- **Raridade** comum, incomum ou raro. Agora pesa no sorteio do saque (veja abaixo).
- **Capacidades** (as "tags", 66 no total, no estilo Zomboid/Rust): o que o item faz ou é, como Corta, Acende fogo, Filtra água, Ilumina, Remédio, Isolante, Escambo, Anômalo, Pista; e o material (Metal, Madeira, Tecido…).
- **Efeito sugerido nas necessidades** (só comida, bebida, remédio, higiene, lazer, estimulante, álcool): "Alivia fome 2", "Agrava sede 1"… 263 itens têm.
- **Cura** em dado (1d4, 1d6, 2d6, 2d8): 15 itens (curativos, ataduras, suturas, kits, antibióticos fortes).
- **Estraga em ~N dias** (101 itens perecíveis; conservas e secos não têm).
- **Isolamento** 0 a 4 e **Proteção** 0 a 3 (roupas e proteção).
- **Dano, crítico, alcance e tipo** sugeridos em 96 armas (todas as armas de fogo e brancas, mais ferramentas que viram arma: machado, marreta, pé de cabra, martelo, foice grande, garfo de feno etc.).
- Novos calibres: `.223` e `.45 ACP` (o app já avisa "nenhuma arma catalogada usa esse calibre" para munição sem arma par).

**Onde aparece.** Cartas do saque (e embed do Discord, no campo "Ficha"), pesca, tabela completa, inventário (linha e "Inspecionar"). Na **tabela completa** há um novo filtro **Qualquer capacidade** (Capacidades e Materiais) e a busca agora olha nome, tipo, capacidades e texto ("acende fogo", "congelado", "hipotermia").

**Raridade no sorteio.** Peso por item: comum = 10, incomum = 5,5, raro = 2,2. Armas de fogo, munição e anômalos já eram raros por tipo e local; para eles o campo só reduz mais um pouco (×0,75 incomum, ×0,45 raro). O selo Comum/Incomum/Raro da carta é o mais raro entre o do tipo e o do item. Distribuição do catálogo: 62% comum, 32% incomum, 6% raro.

**O que o mestre pode ligar (tudo desligado por padrão).**
1. **Efeito sugerido ao Usar.** Com o módulo **Necessidades** ligado, em token que você pode editar, o painel Usar mostra "Aplicar à ficha o efeito sugerido: Fome −2". A caixa **começa desmarcada**. Marcada, sobe ou desce as necessidades (0 a 4) e escreve no registro "Necessidades: Fome −2" (dentro da observação, máx. 140 caracteres). NPCs e contêineres não têm ficha, então não mostram a opção.
2. **Carga por volume.** Configuração da campanha → Inventário → **Carga por peso** → caixa **Usar o volume de cada item**. Volume 0 conta 0,25; 1 conta 1; 2 conta 2; 3 conta 3; 4 conta 4. O padrão de 20 de capacidade continua servindo.
3. **Receitas de exemplo.** O botão de exemplos da aba Ofício agora cria **29 receitas** (as 4 antigas + 25 novas, estilo Rust: tala de bambu, tocha de resina, forninho de lata, arapuca, rede de dormir, tijolo de adobe, colete de couro cru…), 7 delas com ferramenta. Apertar de novo **não duplica** (confere pelo nome).

**Ícones.** As 2 categorias novas têm ícone, e 13 regras extras reconhecem nomes novos (guia, manual, aveia, salame, pipoca, colchonete, toldo, megafone, balaclava…). Os outros ~100 itens novos usam o ícone da categoria.

**PDF.** `catalogo-1200-itens-tau-volantis-v2.pdf` (113 páginas) traz os 1.200 itens na **ordem e numeração da sua lista**, com texto, ficha, capacidades e locais de saque. Itens novos têm a marca NOVO.

**Como foi escrito e conferido.** Os textos e fichas saíram em 35 lotes, cada um validado por script (campos, faixas, tags do vocabulário, dados válidos, repetição de começos e de frases, texto parecido, armas completas, calibre dos novos, distribuição de raridade). Depois li uma amostra de cerca de 120 itens de todas as categorias e corrigi o que vi. **Não li os 1.200 um por um**: o script garante forma e variedade, não gosto nem exatidão. Se algum texto ou número não servir, me diga o nome do item.

**O que NÃO foi verificado — leia antes de jogar.**
- Os números de **arma, cura, isolamento e efeito** são palpites coerentes com o modelo, **sem teste de equilíbrio em mesa**. A mesa decide.
- **Capacidade de mochila** (bônus de espaços ao equipar) **não foi feita**: mochilas só têm texto, volume e tags. Fica para uma próxima etapa se você quiser.
- **Fabricação:** a receita só aceita **uma ferramenta** por vez e não "desmonta" itens. As capacidades (tags) já estão no catálogo para uma próxima versão escolher a ferramenta por função.
- Itens que valem como arma mas ficam em Ferramentas só têm números de arma na lista acima; outros (ex.: tesoura, serrote) não.
- O texto de "Necessidades:" no registro vai no campo de observação que já existia; as regras sugeridas (v1 a v3) não validam os campos do registro, então não deve ser barrado, mas com o Firebase de verdade **não testei** a gravação (nos testes o banco é simulado).
- Tradução de gosto: alguns remédios comuns (ex.: antiácido) têm efeito sugerido discutível; é só sugestão.

**Para mexer num item.** Os dados ficam em `index.html`, no bloco `loot-data`, numa linha só. É difícil de editar no celular; peça a mudança pelo nome do item.

