(function() {
  const root = document.documentElement;
  const key = 'tw-theme';
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const saved = localStorage.getItem(key);
  const initial = saved || (prefersDark ? 'dark' : 'dark'); // default to dark
  root.setAttribute('data-theme', initial);

  const btnTheme = document.getElementById('themeToggle');
  if (btnTheme) {
    btnTheme.addEventListener('click', () => {
      const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      localStorage.setItem(key, next);
    });
  }

  // Current year
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Smooth anchor scroll
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const id = a.getAttribute('href').slice(1);
    const el = document.getElementById(id);
    if (!el) return;
    e.preventDefault();
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  // Path helpers (support GitHub Pages under /The-Olden-Ways/)
  const firstSegment = location.pathname.split('/').filter(Boolean)[0] || '';
  const basePath = firstSegment === 'The-Olden-Ways' ? '/The-Olden-Ways/' : '/';
  const isTopicPage = location.pathname.includes('/topics/');
  const postsJsonPath = (isTopicPage ? basePath + 'data/posts.json' : basePath + 'data/posts.json');

  // Lightweight store
  const Store = {
    ready: false,
    topics: [],
    posts: [],
    tags: new Map(), // tag -> count
    async init() {
      if (this.ready) return;
      try {
        const res = await fetch(postsJsonPath, { cache: 'no-cache' });
        const data = await res.json();
        this.topics = data.topics || [];
        this.posts = (data.posts || []).map(p => ({ ...p, q: (p.title + ' ' + (p.summary||'') + ' ' + (p.tags||[]).join(' ') + ' ' + (p.topic||'')).toLowerCase() }));
        // Build tag counts
        this.tags = new Map();
        this.posts.forEach(p => (p.tags||[]).forEach(t => this.tags.set(t, (this.tags.get(t)||0)+1)));
        this.ready = true;
      } catch(e) {
        console.error('Failed loading posts.json', e);
      }
    },
    search(q) {
      const s = q.trim().toLowerCase();
      if (!s) return [];
      const tokens = s.split(/\s+/).filter(Boolean);
      const scored = [];
      for (const p of this.posts) {
        let score = 0;
        for (const tk of tokens) {
          if (p.title.toLowerCase().includes(tk)) score += 5;
          if ((p.tags||[]).some(t => t.toLowerCase().includes(tk))) score += 3;
          if ((p.summary||'').toLowerCase().includes(tk)) score += 1;
          const topicObj = this.topics.find(t => t.slug === p.topic);
          if (topicObj && topicObj.title.toLowerCase().includes(tk)) score += 2;
        }
        if (score > 0) scored.push({ ...p, score });
      }
      scored.sort((a,b) => b.score - a.score || new Date(b.date) - new Date(a.date));
      return scored.slice(0, 30);
    },
    byTopic(slug) {
      return this.posts.filter(p => p.topic === slug)
        .sort((a,b) => new Date(b.date) - new Date(a.date));
    },
    tagsForTopic(slug) {
      const m = new Map();
      this.byTopic(slug).forEach(p => (p.tags||[]).forEach(t => m.set(t, (m.get(t)||0)+1)));
      return [...m.entries()].sort((a,b)=>b[1]-a[1]);
    }
  };

  // Search overlay (injected)
  function injectSearchUI() {
    if (document.querySelector('.search-overlay')) return;
    const wrap = document.createElement('div');
    wrap.className = 'search-overlay';
    wrap.innerHTML = `
      <div class="search-panel" role="dialog" aria-modal="true" aria-label="Search">
        <div class="search-head">
          <input id="searchInput" class="search-input" type="search" placeholder="Search posts, topics, or tags…" autocomplete="off" />
          <button id="closeSearch" class="icon-btn" aria-label="Close search">Esc</button>
        </div>
        <div id="searchResults" class="search-body" role="listbox" aria-live="polite"></div>
      </div>
    `;
    document.body.appendChild(wrap);
  }

  function openSearch(prefill='') {
    injectSearchUI();
    const overlay = document.querySelector('.search-overlay');
    const input = document.getElementById('searchInput');
    const results = document.getElementById('searchResults');
    overlay.classList.add('open');
    input.value = prefill;
    input.focus();
    renderResults(prefill);
    function renderResults(q) {
      results.innerHTML = '';
      if (!q.trim()) {
        results.innerHTML = `<div class="result"><small>Start typing to search across all topics…</small></div>`;
        return;
      }
      const items = Store.search(q);
      if (items.length === 0) {
        results.innerHTML = `<div class="result"><small>No results found.</small></div>`;
        return;
      }
      const frag = document.createDocumentFragment();
      for (const p of items) {
        const a = document.createElement('a');
        const link = (firstSegment === 'The-Olden-Ways' ? '/The-Olden-Ways' : '') + p.url;
        a.href = link;
        a.className = 'result';
        const topicObj = Store.topics.find(t => t.slug === p.topic);
        a.innerHTML = `
          <div><strong>${escapeHtml(p.title)}</strong></div>
          <small>${topicObj ? topicObj.title : p.topic} • ${escapeHtml(p.summary || '')}</small>
        `;
        frag.appendChild(a);
      }
      results.appendChild(frag);
    }
    input.oninput = () => renderResults(input.value);
    document.getElementById('closeSearch').onclick = () => closeSearch();
    overlay.onclick = (e) => { if (e.target === overlay) closeSearch(); };
    document.addEventListener('keydown', escCloseOnce);
    function escCloseOnce(ev){ if (ev.key === 'Escape') { closeSearch(); document.removeEventListener('keydown', escCloseOnce);} }
  }
  function closeSearch() {
    const overlay = document.querySelector('.search-overlay');
    if (overlay) overlay.classList.remove('open');
  }

  function escapeHtml(s=''){ return s.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }

  // Global search triggers
  const btnOpenSearch = document.getElementById('openSearch');
  if (btnOpenSearch) btnOpenSearch.addEventListener('click', async () => { await Store.init(); openSearch(''); });

  document.addEventListener('keydown', async (e) => {
    const mod = e.ctrlKey || e.metaKey;
    if ((mod && e.key.toLowerCase() === 'k') || (!mod && e.key === '/')) {
      e.preventDefault();
      await Store.init();
      openSearch('');
    }
  });

  // Tag cloud on home
  (async function initTagCloud() {
    const tagCloud = document.getElementById('tagCloud');
    if (!tagCloud) return;
    await Store.init();
    const entries = [...Store.tags.entries()].sort((a,b)=>b[1]-a[1]).slice(0, 30);
    for (const [tag, count] of entries) {
      const a = document.createElement('a');
      a.href = '#';
      a.className = 'chip';
      a.textContent = `${tag} (${count})`;
      a.onclick = async (e) => {
        e.preventDefault();
        openSearch(tag);
      };
      tagCloud.appendChild(a);
    }
  })();

  // Topic pages: render posts + tag filters
  (async function initTopicPages(){
    if (!isTopicPage) return;
    await Store.init();
    const slug = location.pathname.split('/').pop().replace('.html','');
    const list = document.querySelector('.post-list');
    const tagRow = document.getElementById('topicTags');
    const countEl = document.getElementById('topicCount');
    if (!list) return;

    const posts = Store.byTopic(slug);
    renderPosts(posts);

    // Build tag filters
    if (tagRow) {
      const tags = Store.tagsForTopic(slug).slice(0, 24);
      for (const [tag, count] of tags) {
        const b = document.createElement('button');
        b.className = 'chip';
        b.type = 'button';
        b.textContent = `${tag} (${count})`;
        b.onclick = () => {
          if (b.classList.contains('active')) {
            b.classList.remove('active');
            renderPosts(posts);
          } else {
            [...tagRow.children].forEach(el=>el.classList.remove('active'));
            b.classList.add('active');
            renderPosts(posts.filter(p => (p.tags||[]).includes(tag)));
          }
        };
        tagRow.appendChild(b);
      }
    }

    function renderPosts(arr) {
      list.innerHTML = '';
      if (countEl) countEl.textContent = `${arr.length} post${arr.length===1?'':'s'}`;
      if (arr.length === 0) {
        list.innerHTML = `<div class="post"><div class="meta">No posts yet.</div></div>`;
        return;
      }
      const frag = document.createDocumentFragment();
      for (const p of arr) {
        const art = document.createElement('article');
        art.className = 'post';
        art.id = p.id;
        const topicPathPrefix = (firstSegment === 'The-Olden-Ways' ? '/The-Olden-Ways' : '');
        // If p.url points to self, keep as internal anchor; otherwise use external
        const link = p.url.startsWith('/topics/') ? `${topicPathPrefix}${p.url}` : p.url;
        art.innerHTML = `
          <h3><a href="${link}">${escapeHtml(p.title)}</a></h3>
          <div class="meta">${new Date(p.date).toLocaleDateString()} • ${(p.tags||[]).map(t=>`<span class="chip" style="pointer-events:none">${escapeHtml(t)}</span>`).join(' ')}</div>
          ${p.summary ? `<p>${escapeHtml(p.summary)}</p>` : ''}
        `;
        frag.appendChild(art);
      }
      list.appendChild(frag);
    }
  })();

})();