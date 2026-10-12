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
2. **Opcional, só para o diário privado do mestre ser realmente secreto**: Firebase Console → Realtime Database → Regras. Compare com `firebase-rules.SUGESTAO-v2.json` (acrescenta `tv-map:journal` e `tv-map:gm-journal`, para campanhas novas e para a original). Sem isso, o diário não salva (aparece aviso); todo o resto funciona. Eu não publiquei nem alterei nenhuma regra.
3. Na campanha original, quem ainda não é mestre toca em Campanhas → "Assumir como mestre" para liberar a área Mestre só para você (hoje, sem mestre definido, todos são tratados como mestre).

## 4. Como testei
Chromium no celular (360–420 px) com os CDNs servidos localmente: inventário completo (empilhar, equipar, dividir, condição, inspecionar), contêiner (vasculhar/pegar/guardar), navegação das áreas, diário, backup/restauração, ofício, dados e saque clássico, sem erros de console e sem rolagem horizontal. Com um Firebase simulado em memória e dois clientes ao mesmo tempo: um único vasculhador e nenhum item duplicado. **Não testado contra o Firebase real** (login Google e regras publicadas), nem em aparelho físico.

## 5. Decisões que dependem de você
- Quais necessidades e efeitos de sobrevivência devem ser automáticos (hoje: tudo manual, com ajuste em grupo pelo mestre).
- Se mochilas equipadas devem aumentar a capacidade, e quanto.
- Regras de PV/PE/Sanidade da sua adaptação (hoje só guardo os valores).
- Se quer restringir no Firebase quem escreve em tokens/inventários (exige reestruturar os dados).
