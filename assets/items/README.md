# Catálogo de itens

O catálogo usado pelo saque fica em `loot-data.js`, fora do código principal.

- `locNames`: nomes dos locais de busca.
- `items`: catálogo completo; cada entrada mantém `id`, `name`, `category`, `locations`, `utility` e campos opcionais como `calibre` e `fish`.
- Para editar uma descrição, altere o campo `utility` do item correspondente.
- Para adicionar um item, use um `id` novo e inclua os locais em que ele pode aparecer.

O arquivo expõe os dados em `window.TAU_VOLANTIS_LOOT_DATA` e é carregado antes de `app.js` pelo `index.html`.
