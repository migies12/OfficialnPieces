/* ──────────────────────────────────────────────────────────────────────
   In Pieces — main.js
   Replace CALENDAR_ID and API_KEY with your values to enable live shows.
   Instructions: see README.md
────────────────────────────────────────────────────────────────────── */

const CALENDAR_ID = '52060da14521775b9109fb140977d12c1226f1860d0d23dc6fc53b11de0922f7@group.calendar.google.com'; 
const API_KEY     = 'AIzaSyDuxBa91cEw0EUtAhPuTKVd0wGQne3XkDM';   // Google Calendar API key

/* ── Nav scroll state ──────────────────────────────────────────────── */
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 20);
}, { passive: true });

/* ── Mobile nav toggle ─────────────────────────────────────────────── */
const toggle = document.querySelector('.nav-toggle');
const navLinks = document.getElementById('nav-links');

toggle.addEventListener('click', () => {
  const isOpen = navLinks.classList.toggle('open');
  toggle.classList.toggle('open', isOpen);
  toggle.setAttribute('aria-expanded', String(isOpen));
});

navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    toggle.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
  });
});

/* ── Hero bg parallax kick ─────────────────────────────────────────── */
const heroBg = document.querySelector('.hero-bg');
if (heroBg) {
  const img = new Image();
  img.src = heroBg.style.backgroundImage.replace(/url\(['"]?(.*?)['"]?\)/, '$1');
  img.onload = () => heroBg.classList.add('loaded');
}

/* ── Scroll reveal ─────────────────────────────────────────────────── */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => entry.target.classList.add('visible'), i * 80);
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

/* ── Footer year ───────────────────────────────────────────────────── */
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

/* ── Google Calendar shows ─────────────────────────────────────────── */
async function loadShows() {
  const list = document.getElementById('shows-list');
  if (!list) return;

  if (!CALENDAR_ID || !API_KEY) {
    list.innerHTML = renderPlaceholderShows();
    return;
  }

  try {
    const now = new Date().toISOString();
    const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(CALENDAR_ID)}/events`
      + `?key=${API_KEY}`
      + `&timeMin=${encodeURIComponent(now)}`
      + `&orderBy=startTime`
      + `&singleEvents=true`
      + `&maxResults=12`;

    const res = await fetch(url);
    if (!res.ok) throw new Error(`Calendar API ${res.status}`);
    const data = await res.json();

    const items = (data.items || []).filter(e => e.status !== 'cancelled');

    if (items.length === 0) {
      list.innerHTML = '<p class="shows-empty">No upcoming shows — check back soon.</p>';
      return;
    }

    list.innerHTML = items.map(event => renderShowRow(event)).join('');
  } catch (err) {
    console.warn('Calendar load failed:', err);
    list.innerHTML = renderPlaceholderShows();
  }
}

function formatDate(dateStr) {
  const d = new Date(dateStr.includes('T') ? dateStr : dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function renderShowRow(event) {
  const start = event.start.dateTime || event.start.date;
  const date  = formatDate(start);

  /* parse "Venue Name — City, State" from event title or use title + location */
  const rawTitle    = event.summary || 'TBA';
  const location    = event.location || '';
  const ticketUrl   = (event.description || '').match(/https?:\/\/\S+/)?.[0] || event.htmlLink || '#';

  const [venuePart, cityPart] = location.includes(',')
    ? [rawTitle, location]
    : [rawTitle, location || '&nbsp;'];

  return `
    <div class="show-row">
      <div class="show-date">${date}</div>
      <div>
        <div class="show-venue">${escHtml(venuePart)}</div>
        <div class="show-city">${escHtml(cityPart)}</div>
      </div>
      <a href="${escAttr(ticketUrl)}" target="_blank" rel="noopener" class="show-ticket btn">Tickets</a>
    </div>`;
}

function renderPlaceholderShows() {
  const placeholder = [
  ];
  return placeholder.map(s => `
    <div class="show-row">
      <div class="show-date">${s.date}</div>
      <div>
        <div class="show-venue">${s.venue}</div>
        <div class="show-city">${s.city}</div>
      </div>
      <a href="#" class="show-ticket btn">Tickets</a>
    </div>`).join('');
}

/* XSS-safe helpers */
function escHtml(s) {
  return String(s)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}
function escAttr(s) { return escHtml(s); }

loadShows();
