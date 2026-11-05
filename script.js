(function () {
  'use strict';

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  /* ---------- Theme ---------- */
  const root = document.documentElement;
  $('#theme-toggle').addEventListener('click', () => {
    const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
    root.dataset.theme = next;
    try { localStorage.setItem('theme', next); } catch (e) { /* storage unavailable */ }
  });

  /* ---------- Mobile menu ---------- */
  const menuBtn = $('#menu-toggle');
  const navLinks = $('#nav-links');
  const setMenu = (open) => {
    navLinks.classList.toggle('is-open', open);
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  };
  menuBtn.addEventListener('click', () => setMenu(!navLinks.classList.contains('is-open')));
  $$('a', navLinks).forEach((a) => a.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });

  /* ---------- Header + scroll progress ---------- */
  const header = $('.site-header');
  const progress = $('.scroll-progress');
  const onScroll = () => {
    const y = window.scrollY;
    header.classList.toggle('is-scrolled', y > 8);
    const max = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Active nav link ---------- */
  const navMap = new Map($$('.nav-links a').map((a) => [a.getAttribute('href').slice(1), a]));
  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      navMap.forEach((a) => a.classList.remove('is-active'));
      const link = navMap.get(entry.target.id);
      if (link) link.classList.add('is-active');
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  navMap.forEach((_, id) => { const el = document.getElementById(id); if (el) sectionObserver.observe(el); });

  /* ---------- Reveal on scroll ---------- */
  const revealObserver = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) { entry.target.classList.add('is-visible'); obs.unobserve(entry.target); }
    });
  }, { threshold: 0.12 });
  $$('.reveal').forEach((el) => revealObserver.observe(el));

  /* ---------- Count-up stats ---------- */
  const countObserver = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      obs.unobserve(entry.target);
      const el = entry.target;
      const target = Number(el.dataset.count);
      if (reducedMotion) { el.textContent = target; return; }
      const start = performance.now();
      const dur = 1400;
      const tick = (now) => {
        const t = Math.min((now - start) / dur, 1);
        const eased = 1 - Math.pow(1 - t, 3);
        el.textContent = Math.round(target * eased);
        if (t < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
  }, { threshold: 0.6 });
  $$('[data-count]').forEach((el) => countObserver.observe(el));

  /* ---------- Rotating hero word ---------- */
  const words = ['secure', 'scalable', 'observable', 'reliable', 'maintainable'];
  const wordEl = $('.rotator-word');
  if (!reducedMotion && wordEl) {
    let i = 0;
    setInterval(() => {
      wordEl.classList.remove('in');
      wordEl.classList.add('out');
      setTimeout(() => {
        i = (i + 1) % words.length;
        wordEl.textContent = words[i];
        wordEl.classList.remove('out');
        wordEl.classList.add('in');
      }, 350);
    }, 2600);
  }

  /* ---------- Sparkles ---------- */
  const sparkleColors = ['#ffc14d', '#ff6b85', '#9b85ff'];
  const sparkleSvg = (size, color) =>
    `<svg width="${size}" height="${size}" viewBox="0 0 68 68" fill="none"><path d="M26.5 25.5C19.07 33.83 10.5 34 0 34c10.5 0 20.5 1.5 26.5 9.5C32.5 51.5 34 58 34 68c0-10 2.5-18.5 7.5-24.5C47 36.5 57.5 34 68 34c-10.5 0-19-1-26.5-8.5C34 18 34 10 34 0c0 10-1 18-7.5 25.5z" fill="${color}"/></svg>`;
  $$('[data-sparkle]').forEach((host) => {
    host.innerHTML = `<span class="sparkle-inner">${host.innerHTML}</span>`;
    if (reducedMotion) return;
    const spawn = () => {
      const s = document.createElement('span');
      const size = 10 + Math.random() * 12;
      s.className = 'sparkle';
      s.style.left = `${Math.random() * 100}%`;
      s.style.top = `${Math.random() * 100}%`;
      s.style.marginLeft = `${-size / 2}px`;
      s.style.marginTop = `${-size / 2}px`;
      s.innerHTML = sparkleSvg(size, sparkleColors[Math.floor(Math.random() * sparkleColors.length)]);
      host.appendChild(s);
      setTimeout(() => s.remove(), 950);
    };
    (function loop() {
      if (!document.hidden) spawn();
      setTimeout(loop, 250 + Math.random() * 450);
    })();
  });

  /* ---------- Agent console ---------- */
  const conversations = [
    {
      q: 'What does Kevin build?',
      status: 'retrieving from resume index · 4 chunks',
      a: 'Kevin builds AI-powered business software: agents, RAG pipelines, document intelligence and the secure Go, Python and Rust services underneath them.',
      cites: ['profile.md', 'experience/jaburg-wilk', 'skills/ai']
    },
    {
      q: 'How does he keep AI answers safe?',
      status: 'checking permissions · tenant=portfolio · 3 chunks',
      a: 'Retrieval is permission-aware, output is validated with Pydantic schemas, PII is scrubbed before inference, and CI/CD runs security scanning.',
      cites: ['experience/jaburg-wilk', 'principles/secure']
    },
    {
      q: 'Which models has he shipped with?',
      status: 'retrieving from resume index · 5 chunks',
      a: 'Claude and GPT-4o through APIs, plus self-hosted Qwen served with vLLM and Ollama, and OCR models like Mistral OCR, GLM-OCR and Tesseract.',
      cites: ['skills/ai', 'experience/rturner']
    }
  ];
  const qEl = $('#console-q');
  const aEl = $('#console-a');
  const statusEl = $('#console-status');
  const citesEl = $('#console-cites');
  const cursor = $('#console-cursor');

  const renderStatic = (c) => {
    qEl.textContent = c.q;
    statusEl.textContent = '✓ ' + c.status;
    aEl.textContent = c.a;
    citesEl.innerHTML = c.cites.map((x) => `<span class="cite">📎 ${x}</span>`).join('');
  };

  async function runConsole() {
    let idx = 0;
    while (true) {
      const c = conversations[idx];
      qEl.textContent = ''; aEl.textContent = ''; statusEl.textContent = ''; citesEl.innerHTML = '';
      cursor.style.display = 'inline-block';
      for (const ch of c.q) { qEl.textContent += ch; await sleep(38 + Math.random() * 40); }
      await sleep(350);
      cursor.style.display = 'none';
      statusEl.innerHTML = `<span class="spin">◐</span> ${c.status}`;
      await sleep(1100);
      statusEl.textContent = '✓ ' + c.status;
      // Stream tokens like an SSE response
      const tokens = c.a.match(/\S+\s*/g) || [];
      for (const t of tokens) { aEl.textContent += t; await sleep(45 + Math.random() * 55); }
      await sleep(250);
      for (const cite of c.cites) {
        const span = document.createElement('span');
        span.className = 'cite';
        span.textContent = '📎 ' + cite;
        citesEl.appendChild(span);
        await sleep(160);
      }
      await sleep(3800);
      idx = (idx + 1) % conversations.length;
    }
  }
  if (qEl) {
    if (reducedMotion) { cursor.style.display = 'none'; renderStatic(conversations[0]); }
    else runConsole();
  }

  /* ---------- Pipeline explainer ---------- */
  const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  // Light single-pass syntax highlighting: comments, strings, keywords, function calls, numbers
  const tokenRe = /(#[^\n]*)|("[^"\n]*"|f"[^"\n]*")|\b(def|async|await|return|class|for|in|if|with|from|import|yield|None)\b|\b([A-Za-z_]\w*)(?=\()|\b(\d+(?:\.\d+)?)\b/g;
  const highlight = (code) => {
    let out = '';
    let last = 0;
    code.replace(tokenRe, (m, c, s, k, f, n, offset) => {
      out += esc(code.slice(last, offset));
      const cls = c ? 'tok-c' : s ? 'tok-s' : k ? 'tok-k' : f ? 'tok-f' : 'tok-n';
      out += `<span class="${cls}">${esc(m)}</span>`;
      last = offset + m.length;
      return m;
    });
    return out + esc(code.slice(last));
  };

  const stages = [
    {
      title: 'Ingest',
      desc: 'Scheduled Airflow DAGs pull matters, clients, deadlines, emails and document metadata from connected systems such as iManage, SAM.gov and HigherGov. Every record is normalized and tagged with its tenant before it goes any further.',
      tags: ['Apache Airflow', 'Celery', 'Redis', 'ETL'],
      code: `# dags/sync_documents.py
@dag(schedule="*/15 * * * *")
def sync_documents():
    for doc in source.changed_since(last_run):
        record = normalize(doc)
        record.tenant_id = resolve_tenant(doc)
        queue.enqueue("ocr", record)`
    },
    {
      title: 'OCR',
      desc: 'Scanned PDFs and images go through Mistral OCR, GLM-OCR or Tesseract, depending on document type and cost. The output is clean, layout-aware text that the rest of the pipeline can work with.',
      tags: ['Mistral OCR', 'GLM-OCR', 'Tesseract'],
      code: `async def extract_text(doc):
    engine = pick_engine(doc.mime, doc.pages)
    pages = await engine.ocr(doc.blob)
    # keep layout so tables & headers survive
    return join_pages(pages, keep_layout=True)`
    },
    {
      title: 'Validate',
      desc: 'An LLM pulls out structured fields, then Pydantic models check every one of about 60 fields. Bad dates, missing parties or malformed amounts are caught here, before they can reach a deadline calendar.',
      tags: ['Pydantic', 'Structured outputs', 'Guardrails'],
      code: `class CaseIntake(BaseModel):
    case_number: str
    filed_on: date
    parties: list[Party]
    response_due: date | None
    # ...about 60 validated fields

intake = CaseIntake.model_validate(llm_json)`
    },
    {
      title: 'Embed',
      desc: 'Text is chunked, PII is scrubbed, and chunks are embedded into Pinecone. Each vector carries metadata for tenant, matter and access level, so the security rules travel with the data.',
      tags: ['Embeddings', 'Pinecone', 'PII scrubbing'],
      code: `for chunk in chunk_text(text, size=800):
    clean = scrub_pii(chunk)
    index.upsert(vectors=[{
        "id": chunk.id,
        "values": embed(clean),
        "metadata": {"tenant": tid, "matter": mid},
    }])`
    },
    {
      title: 'Retrieve',
      desc: 'At query time, retrieval is filtered by tenant and the user\'s permissions, then checked again at the application layer. A user can never get an answer built from a document they aren\'t allowed to open.',
      tags: ['RBAC', 'Tenant isolation', 'Semantic search'],
      code: `def retrieve(user, query):
    hits = index.query(
        vector=embed(query), top_k=8,
        filter={"tenant": user.tenant_id},
    )
    # second check at the app layer
    return [h for h in hits if user.can_read(h)]`
    },
    {
      title: 'Answer',
      desc: 'Claude, or a self-hosted Qwen model on vLLM or Ollama, writes a grounded answer with citations. It is streamed token by token over Server-Sent Events, so the UI feels fast.',
      tags: ['Claude', 'Qwen', 'vLLM', 'SSE', 'MCP'],
      code: `async def ask(user, question):
    context = retrieve(user, question)
    async for token in llm.stream(
        prompt(question, context)
    ):
        yield f"data: {token}\\n\\n"  # SSE
    yield cite(context)`
    }
  ];

  const pipeline = $('#pipeline');
  if (pipeline) {
    const stageBtns = $$('.stage', pipeline);
    const panel = $('.pipeline-panel', pipeline);
    const bar = $('.pipeline-progress span', pipeline);
    const playBtn = $('#pipe-play');
    let current = 0;
    let timer = null;

    const show = (i) => {
      current = (i + stages.length) % stages.length;
      const s = stages[current];
      stageBtns.forEach((b, j) => {
        b.classList.toggle('is-active', j === current);
        b.classList.toggle('is-done', j < current);
        b.setAttribute('aria-selected', String(j === current));
      });
      bar.style.width = `${(current / (stages.length - 1)) * 100}%`;
      $('#panel-step').textContent = `Stage ${current + 1} of ${stages.length}`;
      $('#panel-title').textContent = s.title;
      $('#panel-desc').textContent = s.desc;
      $('#panel-tags').innerHTML = s.tags.map((t) => `<li>${t}</li>`).join('');
      $('#panel-code').innerHTML = highlight(s.code);
      panel.classList.remove('swap');
      void panel.offsetWidth; // restart animation
      panel.classList.add('swap');
    };

    const stop = () => { clearInterval(timer); timer = null; playBtn.textContent = '▶ Play'; };
    const play = () => {
      playBtn.textContent = '❚❚ Pause';
      if (current === stages.length - 1) show(0);
      timer = setInterval(() => {
        if (current === stages.length - 1) { stop(); return; }
        show(current + 1);
      }, 3200);
    };

    stageBtns.forEach((b, i) => b.addEventListener('click', () => { stop(); show(i); }));
    $('#pipe-prev').addEventListener('click', () => { stop(); show(current - 1); });
    $('#pipe-next').addEventListener('click', () => { stop(); show(current + 1); });
    playBtn.addEventListener('click', () => (timer ? stop() : play()));
    $('.pipeline-track', pipeline).addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        e.preventDefault(); stop();
        show(current + (e.key === 'ArrowRight' ? 1 : -1));
        stageBtns[current].focus();
      }
    });
    show(0);
  }

  /* ---------- Experience tabs ---------- */
  const tabs = $$('.exp-tab');
  const indicator = $('.exp-indicator');
  const tabList = $('#exp-tabs');
  const vertical = () => window.matchMedia('(min-width: 961px)').matches;

  const moveIndicator = (tab) => {
    if (!indicator || !tab) return;
    if (vertical()) {
      indicator.style.width = '2px';
      indicator.style.height = `${tab.offsetHeight}px`;
      indicator.style.transform = `translateY(${tab.offsetTop}px)`;
    } else {
      indicator.style.height = '2px';
      indicator.style.width = `${tab.offsetWidth}px`;
      indicator.style.transform = `translateX(${tab.offsetLeft}px)`;
    }
  };

  const selectTab = (tab, focus) => {
    tabs.forEach((t) => {
      const active = t === tab;
      t.classList.toggle('is-active', active);
      t.setAttribute('aria-selected', String(active));
      t.tabIndex = active ? 0 : -1;
      const panelEl = document.getElementById(t.getAttribute('aria-controls'));
      panelEl.hidden = !active;
      panelEl.classList.toggle('is-active', active);
    });
    moveIndicator(tab);
    if (focus) tab.focus();
    if (!vertical()) tab.scrollIntoView({ block: 'nearest', inline: 'center', behavior: reducedMotion ? 'auto' : 'smooth' });
  };

  tabs.forEach((t) => t.addEventListener('click', () => selectTab(t)));
  if (tabList) {
    tabList.addEventListener('keydown', (e) => {
      const i = tabs.indexOf(document.activeElement);
      if (i < 0) return;
      const keys = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 };
      if (e.key in keys) { e.preventDefault(); selectTab(tabs[(i + keys[e.key] + tabs.length) % tabs.length], true); }
      if (e.key === 'Home') { e.preventDefault(); selectTab(tabs[0], true); }
      if (e.key === 'End') { e.preventDefault(); selectTab(tabs[tabs.length - 1], true); }
    });
  }
  const refreshIndicator = () => moveIndicator($('.exp-tab.is-active'));
  window.addEventListener('resize', refreshIndicator);
  window.addEventListener('load', refreshIndicator);
  if (document.fonts) document.fonts.ready.then(refreshIndicator);
  refreshIndicator();

  /* ---------- Skill filters ---------- */
  const filters = $$('.filter');
  const skillCards = $$('.skill-card');
  filters.forEach((f) => f.addEventListener('click', () => {
    const cat = f.dataset.filter;
    filters.forEach((x) => {
      x.classList.toggle('is-active', x === f);
      x.setAttribute('aria-pressed', String(x === f));
    });
    skillCards.forEach((card) => card.classList.toggle('is-hidden', cat !== 'all' && card.dataset.cat !== cat));
  }));

  /* ---------- Copy email + confetti ---------- */
  const toast = $('#toast');
  let toastTimer;
  const showToast = (msg) => {
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2400);
  };

  const confetti = (x, y) => {
    if (reducedMotion) return;
    const colors = ['#c81e3a', '#6d4aff', '#f5a524', '#16a34a', '#ff6b85'];
    for (let i = 0; i < 36; i++) {
      const p = document.createElement('span');
      p.className = 'confetti';
      p.style.background = colors[i % colors.length];
      p.style.left = `${x}px`;
      p.style.top = `${y}px`;
      document.body.appendChild(p);
      const angle = Math.random() * Math.PI * 2;
      const velocity = 120 + Math.random() * 180;
      const dx = Math.cos(angle) * velocity;
      const dy = Math.sin(angle) * velocity - 120;
      p.animate([
        { transform: 'translate(0,0) rotate(0deg)', opacity: 1 },
        { transform: `translate(${dx}px, ${dy + 260}px) rotate(${Math.random() * 720}deg)`, opacity: 0 }
      ], { duration: 1100 + Math.random() * 600, easing: 'cubic-bezier(0.2, 0.6, 0.4, 1)' }).onfinish = () => p.remove();
    }
  };

  const copyBtn = $('#copy-email');
  if (copyBtn) {
    const label = $('.copy-label', copyBtn);
    copyBtn.addEventListener('click', async (e) => {
      const email = copyBtn.dataset.email;
      try {
        await navigator.clipboard.writeText(email);
      } catch (err) {
        const ta = document.createElement('textarea');
        ta.value = email; document.body.appendChild(ta); ta.select();
        try { document.execCommand('copy'); } catch (e2) { /* ignore */ }
        ta.remove();
      }
      const rect = copyBtn.getBoundingClientRect();
      confetti(e.clientX || rect.left + rect.width / 2, e.clientY || rect.top + rect.height / 2);
      copyBtn.classList.add('copied');
      label.textContent = '✓ Copied!';
      showToast('Email copied to clipboard 🎉');
      setTimeout(() => { copyBtn.classList.remove('copied'); label.textContent = '📋 Copy email'; }, 2200);
    });
  }

  /* ---------- Footer year ---------- */
  $('#year').textContent = new Date().getFullYear();
})();
