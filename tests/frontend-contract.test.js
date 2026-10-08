const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const css = fs.readFileSync(path.join(root, 'style.css'), 'utf8');
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
  assert.match(css, /--tap-size:\s*44px/);
  assert.match(css, /#search-toggle-btn\.tabbar-item\s*\{\s*left:16\.67%/);
  assert.match(css, /#fab-add\.tabbar-item\s*\{\s*left:50%/);
  assert.match(css, /#fab-loot\.tabbar-item\s*\{\s*left:83\.33%/);
  assert.match(css, /\.leaflet-control-zoom\s*\{[^}]*display:block!important/);
});

test('gavetas móveis têm proporções limitadas e rolagem própria', () => {
  assert.match(css, /height:min\(80dvh,780px\)/);
  assert.match(css, /height:min\(74dvh,680px\)/);
  assert.doesNotMatch(css, /91dvh/);
  assert.match(css, /\.drawer-body\s*\{[^}]*overflow:auto/);
});

test('pins e personagens próximos usam agrupamento e spiderfy', () => {
  assert.match(html, /leaflet\.markercluster@1\.5\.3/);
  assert.match(app, /L\.markerClusterGroup/);
  assert.match(app, /spiderfyOnMaxZoom:\s*true/);
  assert.match(app, /iconAnchor:\s*L\.point\(21, 21\)/);
  assert.match(app, /zoomToShowLayer/);
  assert.match(css, /\.tv-marker-cluster/);
  assert.ok(html.indexOf('leaflet.markercluster.js') < html.indexOf('app.js'));
});

test('regras CSS estão balanceadas', () => {
  const withoutComments = css.replace(/\/\*[\s\S]*?\*\//g, '');
  assert.equal((withoutComments.match(/{/g) || []).length, (withoutComments.match(/}/g) || []).length);
});
