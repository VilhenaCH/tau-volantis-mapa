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
- **Condições** com efeito automático nas rolagens (Abalado, Apavorado, Debilitado, Esmorecido, Fraco, Ofuscado). O texto da rolagem mostra a conta, ex.: `d20: 15 + AGI 3 + Treinado 5 − 2 (Abalado) = 21`. Vulnerável e as outras condições ficam só como marcação.
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
