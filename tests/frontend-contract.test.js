const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const css = fs.readFileSync(path.join(root, 'style.css'), 'utf8');
const gameUiCss = fs.readFileSync(path.join(root, 'assets', 'game-ui.css'), 'utf8');
const app = fs.readFileSync(path.join(root, 'app.js'), 'utf8');

test('IDs da interface são únicos', () => {
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
  const duplicates = [...new Set(ids.filter((id, index) => ids.indexOf(id) !== index))];
  assert.deepEqual(duplicates, []);
});

test('crafting e seleção de personagem têm um único lugar', () => {
  assert.equal((html.match(/id="inventory-crafting-recipes"/g) || []).length, 1);
  assert.equal((html.match(/id="char-select"/g) || []).length, 1);
  assert.doesNotMatch(html, /loot-crafting-recipes|inventory-character-select/);
  assert.equal((app.match(/renderCraftingPanel\('inventory-crafting-recipes'/g) || []).length, 1);
});

test('a barra principal tem três ações e alvos de toque de 44px', () => {
  for (const id of ['search-toggle-btn', 'fab-add', 'fab-loot']) assert.match(html, new RegExp(`id="${id}"`));
  assert.doesNotMatch(html, /id="fab-inventory"/);
  assert.equal((html.match(/class="[^"]*\btabbar-item\b[^"]*"/g) || []).length, 3);
  assert.match(html, /<nav class="action-cluster"[^>]*aria-label="Ações rápidas"/);
  assert.match(gameUiCss, /--tap-size:\s*48px/);
  assert.match(gameUiCss, /\.action-cluster\s*\{[^}]*display:\s*flex/);
  assert.match(gameUiCss, /grid-template-columns:\s*repeat\(3,\s*minmax\(0,\s*1fr\)\)/);
  assert.doesNotMatch(gameUiCss, /left:\s*16\.67%|left:\s*83\.33%/);
  assert.match(css, /\.leaflet-control-zoom\s*\{[^}]*display:block!important/);
});

test('gavetas móveis têm proporções limitadas e rolagem própria', () => {
  assert.match(gameUiCss, /height:\s*min\(84dvh,\s*780px\)/);
  assert.match(gameUiCss, /max-height:\s*calc\(100dvh - env\(safe-area-inset-top/);
  assert.doesNotMatch(gameUiCss, /91dvh/);
  assert.match(css, /\.drawer-body\s*\{[^}]*overflow:auto/);
  assert.match(gameUiCss, /\.drawer-body\s*\{/);
});

test('HUD mantém três ações móveis, extras de saque recolhidos e crafting no inventário', () => {
  assert.match(html, /<details class="inventory-crafting">/);
  assert.equal((html.match(/class="loot-extra-section/g) || []).length, 2);
  assert.match(app, /class="result-details"/);
  assert.equal((html.match(/id="inventory-crafting-recipes"/g) || []).length, 1);
  assert.ok(html.indexOf('id="result-zone"') < html.indexOf('id="fish-btn"'));
  assert.match(app, /maxClusterRadius: zoom => zoom >= 16 \? 56 : 72/);
});

test('gavetas informam estado, prendem o foco e fecham com Escape', () => {
  assert.equal((html.match(/role="dialog" aria-modal="true"/g) || []).length, 2);
  assert.match(html, /role="tablist"/);
  assert.equal((html.match(/role="tabpanel"/g) || []).length, 3);
  assert.match(app, /ArrowRight/);
  assert.match(app, /containDrawerTabFocus/);
  assert.match(app, /if\(navDrawer\.classList\.contains\('open'\)\)\{ closeNavDrawer\(\); return; \}/);
});

test('campos de busca e título da tela têm nomes acessíveis', () => {
  assert.match(html, /<h1 class="app-header-name">/);
  for (const id of ['search-input', 'item-search-input', 'nav-search-input']) {
    const element = html.match(new RegExp(`<input[^>]*id="${id}"[^>]*>`));
    assert.ok(element, `campo ${id} existe`);
    assert.match(element[0], /aria-label=/);
  }
});

test('pins e personagens próximos usam agrupamento e spiderfy', () => {
  assert.match(html, /leaflet\.markercluster@1\.5\.3/);
  assert.match(app, /L\.markerClusterGroup/);
  assert.match(app, /spiderfyOnMaxZoom:\s*true/);
  assert.match(app, /iconAnchor:\s*L\.point\(21, 21\)/);
  assert.match(app, /zoomToShowLayer/);
  assert.match(gameUiCss, /\.tv-marker-cluster/);
  assert.ok(html.indexOf('leaflet.markercluster.js') < html.indexOf('app.js'));
});

test('saque e inventário exibem artes locais por categoria', () => {
  assert.match(app, /function lootArtKey\(item\)/);
  assert.match(app, /card\.dataset\.art = lootArtKey\(item\)/);
  assert.match(app, /data-art="\$\{lootArtKey\(item\)\}"/);
  assert.match(gameUiCss, /url\("game\/outpost-banner\.svg"\)/);
  for (const asset of [
    'outpost-banner.svg',
    path.join('items', 'field-kit.svg'),
    path.join('items', 'weapon-cache.svg'),
    path.join('items', 'anomaly-shard.svg')
  ]) assert.ok(fs.existsSync(path.join(root, 'assets', 'game', asset)), `arte ${asset} existe`);
  for (const art of ['field-kit', 'weapon', 'anomaly']) {
    assert.match(gameUiCss, new RegExp(`game/items/${art === 'field-kit' ? 'field-kit' : art === 'weapon' ? 'weapon-cache' : 'anomaly-shard'}\\.svg`));
  }
});

test('regras CSS estão balanceadas', () => {
  const withoutComments = `${css}\n${gameUiCss}`.replace(/\/\*[\s\S]*?\*\//g, '');
  assert.equal((withoutComments.match(/{/g) || []).length, (withoutComments.match(/}/g) || []).length);
});
