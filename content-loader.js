function setupHeroSlideshow(images) {
  const layerA = document.getElementById('heroBg0');
  const layerB = document.getElementById('heroBg1');
  if (!images || !images.length) return;

  let idx = 0;
  layerA.style.backgroundImage = `url('${images[0]}')`;
  layerA.classList.add('active');
  if (images.length < 2) return;

  let active = layerA, inactive = layerB;
  setInterval(() => {
    idx = (idx + 1) % images.length;
    inactive.style.backgroundImage = `url('${images[idx]}')`;
    // force a reflow so the opacity transition actually fires
    void inactive.offsetWidth;
    inactive.classList.add('active');
    active.classList.remove('active');
    const tmp = active; active = inactive; inactive = tmp;
  }, 6000);
}

async function loadContent() {
  let data;
  if (window.__INLINE_CONTENT__) {
    // Used only by the standalone preview.html build, which embeds content
    // directly so it can be opened as a local file without a server.
    data = window.__INLINE_CONTENT__;
  } else {
    try {
      const res = await fetch('content.json', { cache: 'no-store' });
      data = await res.json();
    } catch (err) {
      document.getElementById('heroContent').innerHTML =
        '<p class="loading-note" style="color:#fff;">Could not load site content. If you are viewing this file directly on your computer, note that content.json only loads correctly when the site is served over http/https (e.g. on GitHub Pages) — not when double-clicked as a local file.</p>';
      console.error('content.json load failed', err);
      return;
    }
  }

  // ---- Logo & slogan ----
  if (data.logo) document.getElementById('navLogo').src = data.logo;
  if (data.slogan) document.getElementById('navTagline').textContent = data.slogan;

  // ---- Hero ----
  const hero = document.getElementById('heroSection');
  const heroImages = data.hero.bgImages && data.hero.bgImages.length
    ? data.hero.bgImages
    : (data.hero.bgImage ? [data.hero.bgImage] : []);
  const existingInner = document.getElementById('heroContent').outerHTML;
  hero.innerHTML = `
    <div class="hero-bg-layer" id="heroBg0"></div>
    <div class="hero-bg-layer" id="heroBg1"></div>
    <div class="hero-overlay"></div>
    ${existingInner}
  `;
  setupHeroSlideshow(heroImages);
  document.getElementById('heroContent').innerHTML = `
    <p class="eyebrow">${data.hero.eyebrow}</p>
    ${data.slogan ? `<p class="hero-slogan">"${data.slogan}"</p>` : ''}
    <h1>${data.hero.headline}</h1>
    <p class="lede">${data.hero.subhead}</p>
    <div class="cta-row">
      <a href="#donate" class="btn btn-primary">Support our work</a>
      <a href="#programs" class="btn btn-ghost">Explore our programs</a>
    </div>`;

  // ---- Stats ----
  document.getElementById('statStrip').innerHTML = data.stats.map(s => `
    <div class="stat"><div class="n">${s.n}</div><div class="l">${s.l}</div></div>
  `).join('');

  // ---- Utility bar ----
  document.getElementById('utilContact').innerHTML = `
    <a href="mailto:${data.contact.email}">${data.contact.email}</a>
    <a href="tel:${data.contact.phones[0].replace(/\s/g, '')}">${data.contact.phones[0]}</a>`;
  document.getElementById('utilReg').textContent = `Reg. No. ${data.contact.registration.split(',')[0]} · Societies Registration Act XXI of 1860`;

  // ---- About ----
  document.getElementById('aboutIntro').textContent = data.about.intro;
  document.getElementById('aboutBadges').innerHTML = data.about.badges.map(b => `<span class="badge">${b}</span>`).join('');
  document.getElementById('aboutPhoto').src = data.about.photo;
  document.getElementById('visionText').textContent = data.vision;
  document.getElementById('missionText').textContent = data.mission;
  document.getElementById('objectivesList').innerHTML = data.objectives.map((o, i) => `
    <li><span class="idx">${String(i + 1).padStart(2, '0')}</span> ${o}</li>
  `).join('');

  // ---- Programs ----
  document.getElementById('programGrid').innerHTML = data.programs.map(p => `
    <div class="program-card">
      <div class="thumb"><img src="${p.image}" alt="${p.title}"></div>
      <div class="program-body">
        <p class="tag">${p.tag}</p>
        <h3>${p.title}</h3>
        <p>${p.desc}</p>
        <div class="examples"><span>From our activity record</span>${p.examples}</div>
      </div>
    </div>
  `).join('');

  // ---- Activities / timeline tabs ----
  const tabRow = document.getElementById('tabRow');
  const panels = document.getElementById('timelinePanels');
  tabRow.innerHTML = data.activityYears.map((y, i) => `
    <button class="tab-btn${i === 0 ? ' active' : ''}" data-tab="${y.id}">${y.label}</button>
  `).join('');
  panels.innerHTML = data.activityYears.map((y, i) => `
    <div class="timeline-panel${i === 0 ? ' active' : ''}" id="${y.id}">
      <div class="activity-list">
        ${y.items.map(a => `
          <div class="activity-item">
            <p class="date">${a.date}</p>
            <h4>${a.title}</h4>
            <p>${a.desc}</p>
          </div>
        `).join('')}
      </div>
    </div>
  `).join('');
  tabRow.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      tabRow.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      panels.querySelectorAll('.timeline-panel').forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById(btn.dataset.tab).classList.add('active');
    });
  });

  // ---- Gallery ----
  document.getElementById('galleryGrid').innerHTML = data.gallery.map(g => `
    <a class="${g.size || ''}" href="${g.image}" target="_blank"><img src="${g.image}" alt="${g.alt}" loading="lazy"></a>
  `).join('');

  // ---- Partners ----
  document.getElementById('partnerStrip').innerHTML = data.partners.map(p => `<span class="partner-chip">${p}</span>`).join('');

  // ---- Approach ----
  document.getElementById('approachSubhead').textContent = data.approachSubhead || '';
  const approachIcons = [
    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s7-7.58 7-12a7 7 0 1 0-14 0c0 4.42 7 12 7 12Z"/><circle cx="12" cy="9" r="2.5"/></svg>`,
    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="8" r="3.2"/><path d="M2.5 20c.7-3.4 3.4-5.6 6.5-5.6s5.8 2.2 6.5 5.6"/><circle cx="17.5" cy="9" r="2.5"/><path d="M16 14.6c2.4.3 4.3 2.2 4.9 5"/></svg>`,
    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M8 12l2.5 2.5a2 2 0 0 0 2.8 0l4.2-4.2"/><path d="M3 11l4-4 4 2 3-3 4 4-3 3"/><path d="M14 17l1.5 1.5a2 2 0 0 0 2.8 0L21 16"/></svg>`,
    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3Z"/><path d="M9 12l2 2 4-4"/></svg>`,
    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M15.5 8.5l-2 4.5-4.5 2 2-4.5 4.5-2Z"/></svg>`
  ];
  document.getElementById('approachGrid').innerHTML = data.approach.map((a, i) => `
    <div class="approach-item">
      <div class="approach-icon">${approachIcons[i % approachIcons.length]}</div>
      <span class="tag">${a.tag || ''}</span>
      <h4>${a.title}</h4>
      <p>${a.desc}</p>
    </div>
  `).join('');

  // ---- Donate ----
  document.getElementById('donateNote').textContent = data.donate.note;
  document.getElementById('qrImage').src = data.donate.qrImage;
  document.getElementById('upiIdText').textContent = data.donate.upiId;

  // ---- Contact ----
  document.getElementById('contactInfo').innerHTML = `
    <dt>Registered Office</dt><dd>${data.contact.address}</dd>
    <dt>Email</dt><dd>${data.contact.email}</dd>
    <dt>Phone</dt><dd>${data.contact.phones.join(' &middot; ')}</dd>
    <dt>Registration</dt><dd>${data.contact.registration}</dd>`;

  // ---- Footer ----
  document.getElementById('footerAddress').innerHTML = data.contact.address.replace(/, /g, ',<br>');
  document.getElementById('footerEmail').textContent = data.contact.email;
  document.getElementById('footerEmail').href = `mailto:${data.contact.email}`;
  document.getElementById('footerReg').textContent = `Reg. No. ${data.contact.registration.split(',')[0]}`;

  // Re-run reveal-on-scroll for newly injected .reveal elements
  document.dispatchEvent(new CustomEvent('contentLoaded'));
}

loadContent();
