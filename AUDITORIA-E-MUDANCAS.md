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
- **Desfazer**: botão "Desfazer" na barra restaura a posição e o movimento do último deslocamento.
- **Teclado e leitor de tela**: tokens focáveis, com nome falado (nome, tipo, coluna e linha, se está oculto ou na vez); o foco volta ao token depois de mover; avisos (toasts), barra de turno e régua são anunciados.
- **Alvos de toque** de pelo menos 44 px em todos os botões e campos do tático; foco visível em todos os controles.
- **Texto mínimo de 11 px** (antes havia textos de 9 a 10 px) e números alinhados nos contadores.
- **Sem brilho nem animação em loop**: seleção e vez atual agora usam anel sólido e uma seta ▶ (a vez não depende só de cor).
- **Mais cuidado**: confirmação ao encerrar combate; texto "Carregando a cena…" enquanto a imagem abre; mensagens de erro para jogadores sem jargão ("Avise o mestre"); o mapa se reajusta quando o painel inferior abre ou fecha; ao abrir o tático o foco vai para "Voltar", e ao fechar volta ao menu.
- Contrastes medidos: texto de apoio 5,4:1, texto principal 14:1, bordas de campo 3,4:1, inimigo 4,7:1 (todos acima do mínimo).

Ainda pendente (não mexi): ler as telas antigas (inventário, hub) com o mesmo critério; textos de 10 px existentes nelas continuam.
