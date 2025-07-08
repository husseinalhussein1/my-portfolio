// --- Canvas background: interactive dots & lines ---
const canvas = document.getElementById('bg-canvas');
let ctx, w, h, points = [], mouse = {x:0, y:0};
function getPointsCount() {
  if (window.innerWidth < 600) return 38; // موبايل
  if (window.innerWidth < 900) return 76; // تابلت
  return 114; // ديسكتوب
}
let POINTS = getPointsCount(), DIST = 120, SPEED = 0.5;

function resizeCanvas() {
  w = window.innerWidth;
  h = window.innerHeight;
  canvas.width = w;
  canvas.height = h;
  POINTS = getPointsCount();
  initPoints();
}
function randomPoint() {
  return {
    x: Math.random() * w,
    y: Math.random() * h,
    vx: (Math.random() - 0.5) * SPEED,
    vy: (Math.random() - 0.5) * SPEED
  };
}
function initPoints() {
  points = [];
  for (let i = 0; i < POINTS; i++) points.push(randomPoint());
}
function draw() {
  ctx.clearRect(0,0,w,h);
  // Draw lines
  for (let i = 0; i < points.length; i++) {
    for (let j = i+1; j < points.length; j++) {
      let dx = points[i].x - points[j].x, dy = points[i].y - points[j].y;
      let dist = Math.sqrt(dx*dx + dy*dy);
      if (dist < DIST) {
        let opacity = 1 - dist/DIST;
        ctx.strokeStyle = `rgba(56,189,248,${opacity*0.45})`;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(points[i].x, points[i].y);
        ctx.lineTo(points[j].x, points[j].y);
        ctx.stroke();
      }
    }
  }
  // Draw points
  for (let p of points) {
    let d = Math.sqrt((p.x-mouse.x)**2 + (p.y-mouse.y)**2);
    let r = d < 120 ? 5 : 3;
    ctx.beginPath();
    ctx.arc(p.x, p.y, r, 0, 2*Math.PI);
    ctx.fillStyle = d < 120 ? '#38bdf8' : '#7dd3fc';
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = d < 120 ? 12 : 0;
    ctx.fill();
    ctx.shadowBlur = 0;
  }
}
function animate() {
  for (let p of points) {
    p.x += p.vx;
    p.y += p.vy;
    if (p.x < 0 || p.x > w) p.vx *= -1;
    if (p.y < 0 || p.y > h) p.vy *= -1;
  }
  draw();
  requestAnimationFrame(animate);
}
function onMouseMove(e) {
  mouse.x = e.clientX;
  mouse.y = e.clientY;
}
window.addEventListener('resize', resizeCanvas);
window.addEventListener('mousemove', onMouseMove);
window.addEventListener('touchmove', function(e) {
  if (e.touches && e.touches.length > 0) {
    mouse.x = e.touches[0].clientX;
    mouse.y = e.touches[0].clientY;
  }
}, {passive:true});
setTimeout(() => {
  if (canvas) {
    ctx = canvas.getContext('2d');
    resizeCanvas();
    animate();
  }
}, 100);

// --- Language Switcher & Portfolio rendering ---
const app = document.getElementById('app');
// إزالة زر الترجمة العائم القديم إذا كان موجود
const oldLangBtn = document.querySelector('.lang-switcher-btn');
if (oldLangBtn) oldLangBtn.remove();
let stickyHeader = document.querySelector('.sticky-header');
if (!stickyHeader) {
  stickyHeader = document.createElement('div');
  stickyHeader.className = 'sticky-header';
  stickyHeader.style.display = 'none';
  document.body.appendChild(stickyHeader);
}

let currentLang = localStorage.getItem('portfolioLang') || 'en';
let lastStickyLang = currentLang;
let lastStickyName = '';
renderByLang(currentLang);

function renderByLang(lang) {
  const jsonPath = lang === 'ar' ? 'data/cv-ar.json' : 'data/cv.json';
  document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  document.documentElement.lang = lang === 'ar' ? 'ar' : 'en';
  fetch(jsonPath)
    .then(res => res.json())
    .then(data => {
      renderPortfolio(data, lang);
      lastStickyName = data.personalInfo.name;
      lastStickyLang = lang;
      renderStickyHeader(data.personalInfo.name, lang);
    });
}

function renderPortfolio(data, lang) {
  const isMobile = window.innerWidth < 700;
  app.innerHTML = `
    <section class="hero glass" style="position:relative;">
      <div class="hero-float-btns ${lang === 'ar' ? 'hero-float-ar' : 'hero-float-en'}">
        ${lang === 'ar' ? `
          <button class="lang-switcher-btn hero-lang-btn" onclick="window.dispatchEvent(new Event('toggleLang'))">EN</button>
          <a href="data/cv.pdf" download class="lang-switcher-btn hero-cv-btn">CV</a>
        ` : `
          <a href="data/cv.pdf" download class="lang-switcher-btn hero-cv-btn">CV</a>
          <button class="lang-switcher-btn hero-lang-btn" onclick="window.dispatchEvent(new Event('toggleLang'))">AR</button>
        `}
      </div>
      <div class="hero-row" style="display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;">
        <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;">
          <h1>${data.personalInfo.name}</h1>
        </div>
      </div>
      <h2>${data.summary}</h2>
      <div class="contact">
        <a href="mailto:${data.personalInfo.contact.email}">
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path fill="#38bdf8" d="M2 6.75A2.75 2.75 0 0 1 4.75 4h14.5A2.75 2.75 0 0 1 22 6.75v10.5A2.75 2.75 0 0 1 19.25 20H4.75A2.75 2.75 0 0 1 2 17.25V6.75Zm2.75-1.25a1.25 1.25 0 0 0-1.25 1.25v.217l9.25 6.17 9.25-6.17V6.75a1.25 1.25 0 0 0-1.25-1.25H4.75Zm15.5 2.783-7.72 5.153a.75.75 0 0 1-.82 0L4.75 8.283V17.25c0 .69.56 1.25 1.25 1.25h14.5c.69 0 1.25-.56 1.25-1.25V8.283Z"/></svg>
          ${data.personalInfo.contact.email}
        </a>
        <a href="tel:${data.personalInfo.contact.phone}">
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path fill="#38bdf8" d="M6.62 10.79a15.053 15.053 0 0 0 6.59 6.59l2.2-2.2a1 1 0 0 1 1.01-.24c1.12.37 2.33.57 3.58.57a1 1 0 0 1 1 1V20a1 1 0 0 1-1 1C10.07 21 3 13.93 3 5a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.46.57 3.58a1 1 0 0 1-.24 1.01l-2.2 2.2Z"/></svg>
          ${data.personalInfo.contact.phone}
        </a>
        <a href="https://wa.me/${data.personalInfo.contact.whatsapp.replace(/[^\d]/g, '')}" target="_blank">
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="12" fill="#38bdf8"/><path fill="#fff" d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.472-.148-.67.15-.198.297-.767.967-.94 1.166-.173.198-.347.223-.644.075-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.372-.025-.521-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.007-.372-.009-.571-.009-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.1 3.205 5.077 4.369.71.306 1.263.489 1.695.626.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.288.173-1.413-.074-.124-.272-.198-.57-.347z"/></svg>
          WhatsApp
        </a>
        <a href="https://github.com/${data.personalInfo.contact.github.replace('@','')}" target="_blank">
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path fill="#38bdf8" d="M12 2C6.48 2 2 6.58 2 12.26c0 4.48 2.87 8.28 6.84 9.63.5.09.68-.22.68-.48 0-.24-.01-.87-.01-1.7-2.78.62-3.37-1.36-3.37-1.36-.45-1.18-1.1-1.5-1.1-1.5-.9-.63.07-.62.07-.62 1 .07 1.53 1.05 1.53 1.05.89 1.56 2.34 1.11 2.91.85.09-.66.35-1.11.63-1.37-2.22-.26-4.56-1.14-4.56-5.07 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.7 0 0 .84-.28 2.75 1.05A9.38 9.38 0 0 1 12 6.84c.85.004 1.71.12 2.51.35 1.91-1.33 2.75-1.05 2.75-1.05.55 1.4.2 2.44.1 2.7.64.72 1.03 1.63 1.03 2.75 0 3.94-2.34 4.81-4.57 5.07.36.32.68.94.68 1.9 0 1.37-.01 2.47-.01 2.81 0 .27.18.58.69.48A10.01 10.01 0 0 0 22 12.26C22 6.58 17.52 2 12 2Z"/></svg>
          GitHub
        </a>
        <a href="https://linkedin.com/in/${data.personalInfo.contact.linkedin.replace('@','')}" target="_blank">
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path fill="#38bdf8" d="M19 0h-14c-2.76 0-5 2.24-5 5v14c0 2.76 2.24 5 5 5h14c2.76 0 5-2.24 5-5v-14c0-2.76-2.24-5-5-5zm-11 19h-3v-10h3v10zm-1.5-11.27c-.97 0-1.75-.79-1.75-1.76s.78-1.76 1.75-1.76 1.75.79 1.75 1.76-.78 1.76-1.75 1.76zm15.5 11.27h-3v-5.6c0-1.34-.03-3.07-1.87-3.07-1.87 0-2.16 1.46-2.16 2.97v5.7h-3v-10h2.88v1.36h.04c.4-.75 1.38-1.54 2.85-1.54 3.05 0 3.61 2.01 3.61 4.62v5.56z"/></svg>
          LinkedIn
        </a>
      </div>
    </section>
    <section class="skills glass">
      <h3>${lang === 'ar' ? 'المهارات التقنية' : 'Technical Skills'}</h3>
      <div class="skills-list">
        <div class="skill-cat">
          <strong>${lang === 'ar' ? 'الواجهة الخلفية' : 'Back-End'}</strong>
          <ul>${data.technicalSkills.backEnd.map(skill => `<li>${skill}</li>`).join('')}</ul>
        </div>
        <div class="skill-cat">
          <strong>${lang === 'ar' ? 'الواجهة الأمامية' : 'Front-End'}</strong>
          <ul>${data.technicalSkills.frontEnd.map(skill => `<li>${skill}</li>`).join('')}</ul>
        </div>
        <div class="skill-cat">
          <strong>${lang === 'ar' ? 'أدوات التطوير' : 'Development Tools'}</strong>
          <ul>${data.technicalSkills.developmentTools.map(skill => `<li>${skill}</li>`).join('')}</ul>
        </div>
        <div class="skill-cat">
          <strong>${lang === 'ar' ? 'لغات البرمجة' : 'Programming Languages'}</strong>
          <ul>${data.technicalSkills.programmingLanguages.map(skill => `<li>${skill}</li>`).join('')}</ul>
        </div>
      </div>
    </section>
    <section class="experience glass">
      <h3>${lang === 'ar' ? 'الخبرات العملية' : 'Experience'}</h3>
      <div class="experience-list">
        ${data.experience.map(exp => `
          <div class="exp-card">
            <h4>${exp.position} <span style="color:#7dd3fc;font-weight:400;">| ${exp.project}</span></h4>
            <ul>${exp.description.map(line => `<li>${line}</li>`).join('')}</ul>
          </div>
        `).join('')}
      </div>
    </section>
    <section class="education glass">
      <h3>${lang === 'ar' ? 'التعليم' : 'Education'}</h3>
      <div class="education-list">
        ${data.education.map(edu => `
          <div class="edu-card">
            <strong>${edu.degree}</strong> - ${edu.institution} <span>(${edu.duration})</span>
          </div>
        `).join('')}
      </div>
    </section>
    <section class="training glass">
      <h3>${lang === 'ar' ? 'الدورات التدريبية' : 'Training Courses'}</h3>
      <div class="training-list">
        ${data.trainingCourses.map(tr => `
          <div class="train-card">
            <strong>${tr.name}</strong> <span>(${tr.duration})</span>
          </div>
        `).join('')}
      </div>
    </section>
    <section class="softskills glass">
      <h3>${lang === 'ar' ? 'المهارات الشخصية' : 'Soft Skills'}</h3>
      <div class="experience-list">
        ${data.softSkills.map(skill => `
          <div class="exp-card">
            <strong>${skill.name}</strong>
            <p style="margin:6px 0 0 0;color:#b6eafe;font-size:0.98em;">${skill.description}</p>
          </div>
        `).join('')}
      </div>
    </section>
    <section class="languages glass">
      <h3>${lang === 'ar' ? 'اللغات' : 'Languages'}</h3>
      <ul>${data.languages.map(l => `<li>${l}</li>`).join('')}</ul>
    </section>
  `;
}

function renderStickyHeader(name, lang) {
  stickyHeader.innerHTML = `
    <div class="sticky-header-content ${lang === 'ar' ? 'sticky-ar' : 'sticky-en'}">
      ${lang === 'ar' ? `
        <div class="sticky-btns">
          <button class="lang-switcher-btn hero-lang-btn" onclick="window.dispatchEvent(new Event('toggleLang'))">EN</button>
          <a href="data/cv.pdf" download class="lang-switcher-btn hero-cv-btn">CV</a>
        </div>
        <span class="sticky-name">${name}</span>
      ` : `
        <span class="sticky-name">${name}</span>
        <div class="sticky-btns">
          <a href="data/cv.pdf" download class="lang-switcher-btn hero-cv-btn">CV</a>
          <button class="lang-switcher-btn hero-lang-btn" onclick="window.dispatchEvent(new Event('toggleLang'))">AR</button>
        </div>
      `}
    </div>
  `;
}

// زر التبديل من داخل الهيرو
window.addEventListener('toggleLang', () => {
  renderByLang(currentLang === 'en' ? 'ar' : 'en');
  currentLang = currentLang === 'en' ? 'ar' : 'en';
  localStorage.setItem('portfolioLang', currentLang);
});

// Sticky header on scroll
window.addEventListener('scroll', function() {
  if (window.scrollY > 80) {
    stickyHeader.style.display = 'flex';
  } else {
    stickyHeader.style.display = 'none';
  }
});

// عند تغيير حجم الشاشة، أعد ضبط ظهور الهيدر حسب scrollY
window.addEventListener('resize', function() {
  if (window.scrollY > 80) {
    stickyHeader.style.display = 'flex';
  } else {
    stickyHeader.style.display = 'none';
  }
});

// عند تحميل الصفحة، أظهر الهيدر حسب scrollY
(function initStickyHeaderDisplay() {
  if (window.scrollY > 80) {
    stickyHeader.style.display = 'flex';
  } else {
    stickyHeader.style.display = 'none';
  }
})(); 