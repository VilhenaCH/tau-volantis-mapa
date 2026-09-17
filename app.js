/**
 * Tau Volantis — Mapa de Campo & Sistema de Saque
 * Módulo Principal
 */

document.addEventListener('DOMContentLoaded', () => {
  console.log('Tau Volantis: Inicializando subsistemas...');

  // 1. Inicialização dos Utilitários da Interface (Popovers, Drawers e Modais)
  initUIEvents();

  // 2. Carregamento dos dados de saque e tabelas
  initLootSystem();

  // 3. Oculta loader inicial do mapa
  const loader = document.getElementById('map-loading');
  if (loader) {
    setTimeout(() => {
      loader.style.opacity = '0';
      setTimeout(() => loader.style.display = 'none', 200);
    }, 400);
  }
});

/**
 * Controla abertura e fechamento de Gavetas (Drawers) e Popovers do HUD
 */
function initUIEvents() {
  // Mapeamento de Popovers e triggers
  const popoverTriggers = [
    { btn: 'menu-toggle-btn', popover: 'menu-popover', backdrop: 'menu-backdrop' },
    { btn: 'search-toggle-btn', popover: 'hud-search', backdrop: 'search-backdrop' },
    { btn: 'account-toggle-btn', popover: 'account-popover', backdrop: 'account-backdrop' },
    { btn: 'fab-add', popover: 'add-popover', backdrop: 'add-backdrop' },
    { btn: 'fab-tools', popover: 'tools-popover', backdrop: 'tools-backdrop' },
    { btn: 'fab-system', popover: 'system-popover', backdrop: 'system-backdrop' },
  ];

  popoverTriggers.forEach(({ btn, popover, backdrop }) => {
    const btnEl = document.getElementById(btn);
    const popoverEl = document.getElementById(popover);
    const backdropEl = document.getElementById(backdrop);

    if (btnEl && popoverEl && backdropEl) {
      btnEl.addEventListener('click', () => {
        closeAllPopovers();
        popoverEl.classList.add('open');
        backdropEl.classList.add('open');
        btnEl.classList.add('active');
      });

      backdropEl.addEventListener('click', () => {
        popoverEl.classList.remove('open');
        backdropEl.classList.remove('open');
        btnEl.classList.remove('active');
      });
    }
  });

  // Controle das Gavetas (Drawers)
  setupDrawer('drawer-toggle-btn', 'saque-drawer', 'drawer-backdrop', 'drawer-close-btn');
  setupDrawer('nav-drawer-toggle-btn', 'nav-drawer', 'nav-drawer-backdrop', 'nav-drawer-close-btn');
}

function closeAllPopovers() {
  document.querySelectorAll('.app-popover').forEach(p => p.classList.remove('open'));
  document.querySelectorAll('.app-popover-backdrop').forEach(b => b.classList.remove('open'));
  document.querySelectorAll('.header-btn, .action-fab').forEach(b => b.classList.remove('active'));
}

function setupDrawer(triggerId, drawerId, backdropId, closeBtnId) {
  const trigger = document.getElementById(triggerId);
  const drawer = document.getElementById(drawerId);
  const backdrop = document.getElementById(backdropId);
  const closeBtn = document.getElementById(closeBtnId);

  const open = () => {
    closeAllPopovers();
    drawer?.classList.add('open');
    backdrop?.classList.add('open');
  };

  const close = () => {
    drawer?.classList.remove('open');
    backdrop?.classList.remove('open');
  };

  trigger?.addEventListener('click', open);
  closeBtn?.addEventListener('click', close);
  backdrop?.addEventListener('click', close);
}

/**
 * Inicializa a exibição e lógica da tabela de saques (Loot System)
 */
function initLootSystem() {
  const browseToggle = document.getElementById('saque-browse-toggle');
  const browsePanel = document.getElementById('saque-browse-panel');

  if (browseToggle && browsePanel) {
    browseToggle.addEventListener('click', () => {
      const isOpen = browsePanel.classList.toggle('open');
      browseToggle.textContent = isOpen ? '▾ Ocultar tabela completa de itens' : '▸ Ver tabela completa de itens';
    });
  }
}