/* =============================================================
   NEPA - Sistema de carregamento de dados
   Lê todas as abas de database.xlsx e disponibiliza globalmente.
   ============================================================= */

window.NepaDB = {
  // Cache de dados de cada aba
  data: {},

  /**
   * Carrega o database.xlsx e converte cada aba em array de objetos.
   * Faz cache: chama múltiplas vezes não recarrega o arquivo.
   * @param {string[]} sheets - lista de abas a carregar (vazio = todas)
   */
  async load(sheets = null) {
    if (this._loaded) {
      return this.data;
    }
    try {
      // cache: 'no-cache' força o navegador a checar se a planilha mudou.
      // Se ela for igual, usa o cache local (rápido). Se mudou, baixa a nova.
      // Isso garante que atualizações na planilha aparecem imediatamente.
      const resp = await fetch('database.xlsx', { cache: 'no-cache' });
      if (!resp.ok) throw new Error('database.xlsx não encontrado em ' + resp.url);
      const buf = await resp.arrayBuffer();
      const wb  = XLSX.read(buf, { type: 'buffer' });

      const target = sheets || wb.SheetNames;
      target.forEach(name => {
        if (wb.Sheets[name]) {
          this.data[name] = XLSX.utils.sheet_to_json(wb.Sheets[name], { defval: '' });
        }
      });
      this._loaded = true;
      return this.data;
    } catch (err) {
      console.error('[NepaDB] Erro ao carregar database.xlsx:', err);
      throw err;
    }
  },

  sheet(name) {
    return this.data[name] || [];
  },

  config(key, fallback = '') {
    const c = (this.data.config || []).find(r => r.chave === key);
    return c ? (c.valor || fallback) : fallback;
  },

  findById(sheetName, id) {
    const sheet = this.data[sheetName] || [];
    return sheet.find(r => String(r.id) === String(id));
  },

  isTruthy(v) {
    return v === true || v === 1 || v === '1' || (typeof v === 'string' && v.toUpperCase() === 'TRUE');
  },

  parseCompound(str, fieldNames = []) {
    if (!str) return [];
    return String(str).split(';').map(item => {
      const parts = item.split('|').map(s => s.trim());
      const obj = {};
      parts.forEach((p, i) => { obj[fieldNames[i] || i] = p; });
      return obj;
    }).filter(o => Object.values(o).some(v => v));
  },

  parseList(str) {
    if (!str) return [];
    return String(str).split(',').map(s => s.trim()).filter(Boolean);
  },

  parseLines(str) {
    if (!str) return [];
    return String(str).split(/\r?\n/).map(s => s.trim()).filter(Boolean);
  },

  /* =============================================================
     ÍCONES PADRONIZADOS de tipo de publicação.
     Mesmo SVG e tamanho usados no INDEX, BIBLIOTECA e PUBLICAÇÃO.
     Tamanho 22x22 dentro da caixa .pub-type-icon (44x44 verde-bg).
     ============================================================= */
  PUB_ICONS: {
    artigo:      '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>',
    livro:       '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>',
    revista:     '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>',
    anais:       '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>',
    monografia:  '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>',
    atlas:       '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m9 20-5-2V4l5 2 6-2 5 2v14l-5-2-6 2z"/><line x1="9" y1="6" x2="9" y2="20"/><line x1="15" y1="4" x2="15" y2="18"/></svg>',
    tese:        '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/></svg>',
    dissertacao: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/></svg>',
    relatorio:   '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/></svg>',
  },

  getPubIcon(tipo) {
    const key = String(tipo || '')
      .toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, ''); // remove acentos
    return this.PUB_ICONS[key] || this.PUB_ICONS.artigo;
  },

  /* =============================================================
     CARD PADRÃO de publicação. Usado em index, biblioteca e
     publicacao (relacionadas). Garante visual idêntico nos 3 lugares.
     Por padrão NÃO usa .reveal (que tem opacity:0 inicial) - assim os
     cards são visíveis imediatamente, mesmo em listas dinâmicas.
     ============================================================= */
  publicationCardHtml(pub, opts = {}) {
    const { extraClass = '' } = opts;
    const ano = (String(pub.publicado_em || '').match(/\d{4}/) || [''])[0];
    const isDestaque = this.isTruthy(pub.destaque);
    const tipo = pub.tipo || 'Publicação';
    const anoLabel = ano || pub.publicado_em || '';

    // SVG do calendário (usado na linha de meta do modo lista)
    const iconCal = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>';

    return '<article class="publication-card ' + extraClass + '">' +
             (isDestaque ? '<span class="pub-destaque-flag" title="Publicação em destaque">★</span>' : '') +
             '<div class="pub-card-meta">' +
               '<div class="pub-type-icon">' + this.getPubIcon(pub.tipo) + '</div>' +
               '<span class="badge badge-verde">' + tipo + '</span>' +
             '</div>' +
             '<div class="pub-card-body-wrap">' +
               '<h3 class="pub-card-title">' + (pub.titulo || '(sem título)') + '</h3>' +
               '<div class="pub-card-authors">' + (pub.autores || 'Autores não informados') + '</div>' +
               (anoLabel ? '<div class="pub-list-meta">' + iconCal + anoLabel + '</div>' : '') +
             '</div>' +
             '<div class="pub-card-footer">' +
               '<span class="pub-year">' + anoLabel + '</span>' +
               '<a href="publicacao.html?id=' + pub.id + '" class="btn-secondary">' +
                 'Ver detalhes ' +
                 '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m9 18 6-6-6-6"/></svg>' +
               '</a>' +
             '</div>' +
           '</article>';
  },

  /* =============================================================
     ÍCONES e CARD PADRÃO de membro.
     Mesmo card usado no INDEX (equipe) e na página MEMBROS.
     Foto circular + botões de Lattes / ORCID / E-mail.
     ============================================================= */
  MEMBRO_ICONS: {
    lattes: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>',
    orcid:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="11" x2="12" y2="16"/><circle cx="12" cy="8" r="0.6" fill="currentColor"/></svg>',
    email:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>',
  },

  /* Iniciais do nome (remove títulos como Prof., Dra. etc — inclusive
     vários em sequência, ex: "Profa. Dra. Maria Silva" -> "MS") */
  getInitials(nome) {
    const clean = String(nome || '')
      .replace(/^((Prof|Profa|Dr|Dra|Me|Ma|MSc|PhD|Esp)\.?\s+)+/i, '')
      .trim();
    const parts = clean.split(/\s+/).filter(Boolean);
    if (parts.length === 0) return '?';
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  },

  membroCardHtml(m, opts = {}) {
    const { extraClass = '' } = opts;
    const initials = this.getInitials(m.nome);
    const placeholder = 'https://placehold.co/130x130/607537/FFFFFF?text=' + encodeURIComponent(initials);
    const photoSrc = m.foto_url ? m.foto_url : placeholder;
    const cargo = m.cargo || '';
    const area = String(m.descricao || '');

    const links = [];
    if (m.lattes) links.push('<a href="' + m.lattes + '" class="membro-link" target="_blank" rel="noopener" title="Currículo Lattes">' + this.MEMBRO_ICONS.lattes + ' Lattes</a>');
    if (m.orcid)  links.push('<a href="' + m.orcid + '" class="membro-link" target="_blank" rel="noopener" title="ORCID">' + this.MEMBRO_ICONS.orcid + ' ORCID</a>');
    if (m.email)  links.push('<a href="mailto:' + m.email + '" class="membro-link" title="Enviar e-mail">' + this.MEMBRO_ICONS.email + ' E-mail</a>');

    return '<article class="membro-card ' + extraClass + '">' +
             '<div class="membro-photo-wrap">' +
               '<img class="membro-photo" src="' + photoSrc + '" alt="Foto de ' + (m.nome || '') + '" loading="lazy" ' +
                 'onerror="this.src=\'' + placeholder + '\'" />' +
             '</div>' +
             '<div class="membro-body">' +
               (cargo ? '<span class="membro-role">' + cargo + '</span>' : '') +
               '<h3 class="membro-name">' + (m.nome || '') + '</h3>' +
               (area ? '<p class="membro-area">' + area + '</p>' : '') +
               (links.length ? '<div class="membro-links">' + links.join('') + '</div>' : '') +
             '</div>' +
           '</article>';
  },
};

/* =============================================================
   CARROSSÉIS MOBILE — indicadores (dots) + dica de deslize
   Em telas pequenas, várias seções viram carrossel horizontal
   (ver dark-tweaks.css). Este script adiciona as bolinhas
   indicadoras embaixo e uma dica "deslize" no topo.
   Funciona sozinho: detecta quando os cards são inseridos via
   MutationObserver, então não precisa ser chamado manualmente.
   ============================================================= */
(function () {
  // Seções que viram carrossel no mobile
  var SEL = '.docs-grid, .projects-grid-home, .research-areas-grid, ' +
            '.publications-grid, .team-grid, .linhas-grid';
  var BREAKPOINT = 768;

  function isMobile() { return window.innerWidth <= BREAKPOINT; }

  function getCards(grid) {
    return Array.prototype.filter.call(grid.children, function (c) {
      return !c.classList || !c.classList.contains('carousel-dots');
    });
  }

  function setup(grid) {
    if (grid.dataset.carousel === 'on') return;
    var cards = getCards(grid);
    if (cards.length < 2) return;
    grid.dataset.carousel = 'on';

    // --- Dica de deslize (inserida antes do grid, uma vez) ---
    var prev = grid.previousElementSibling;
    if (!prev || !prev.classList.contains('carousel-hint')) {
      var hint = document.createElement('div');
      hint.className = 'carousel-hint';
      hint.innerHTML = 'Deslize para ver mais' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">' +
        '<path d="M5 12h14M13 6l6 6-6 6"/></svg>';
      grid.parentNode.insertBefore(hint, grid);
    }

    // --- Bolinhas indicadoras (inseridas depois do grid) ---
    var dots = document.createElement('div');
    dots.className = 'carousel-dots';
    cards.forEach(function (card, i) {
      var dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'dot' + (i === 0 ? ' active' : '');
      dot.setAttribute('aria-label', 'Ir para item ' + (i + 1));
      dot.addEventListener('click', function () {
        var gr = grid.getBoundingClientRect();
        var cr = card.getBoundingClientRect();
        grid.scrollBy({ left: cr.left - gr.left, behavior: 'smooth' });
      });
      dots.appendChild(dot);
    });
    grid.insertAdjacentElement('afterend', dots);

    // --- Atualiza a bolinha ativa conforme o usuário desliza ---
    var scrollTimer;
    grid.addEventListener('scroll', function () {
      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(function () {
        var gr = grid.getBoundingClientRect();
        var idx = 0, min = Infinity;
        cards.forEach(function (card, i) {
          var d = Math.abs(card.getBoundingClientRect().left - gr.left);
          if (d < min) { min = d; idx = i; }
        });
        var allDots = dots.querySelectorAll('.dot');
        for (var i = 0; i < allDots.length; i++) {
          allDots[i].classList.toggle('active', i === idx);
        }
      }, 60);
    }, { passive: true });
  }

  function teardown(grid) {
    if (grid.dataset.carousel !== 'on') return;
    grid.dataset.carousel = 'off';
    // remove dots
    var next = grid.nextElementSibling;
    if (next && next.classList.contains('carousel-dots')) next.remove();
    // remove hint
    var prev = grid.previousElementSibling;
    if (prev && prev.classList.contains('carousel-hint')) prev.remove();
  }

  function refresh() {
    var grids = document.querySelectorAll(SEL);
    for (var i = 0; i < grids.length; i++) {
      if (isMobile()) setup(grids[i]);
      else teardown(grids[i]);
    }
  }

  var refreshTimer;
  function debouncedRefresh() {
    clearTimeout(refreshTimer);
    refreshTimer = setTimeout(refresh, 150);
  }

  document.addEventListener('DOMContentLoaded', function () {
    refresh();
    // Os cards entram via JS async — observa o DOM para configurar quando aparecerem
    var observer = new MutationObserver(debouncedRefresh);
    observer.observe(document.body, { childList: true, subtree: true });
    // Reconfigura ao girar o celular / redimensionar
    window.addEventListener('resize', debouncedRefresh);
  });
})();
