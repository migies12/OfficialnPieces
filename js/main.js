/* ──────────────────────────────────────────────────────────────────────
   In Pieces — main.js
   Replace CALENDAR_ID and API_KEY with your values to enable live shows.
   Instructions: see README.md
────────────────────────────────────────────────────────────────────── */

const CALENDAR_ID = '__GOOGLE_CAL_ID__';
const API_KEY     = '__GOOGLE_API_KEY__';

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
  const desc        = (event.description || '').replace(/<[^>]*>/g, ' ');
  const ticketUrl   = desc.match(/https?:\/\/[^\s<>"]+/)?.[0] || event.htmlLink || '#';

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

/* ── Book a Gig form ───────────────────────────────────────────────── */
document.getElementById('book-form').addEventListener('submit', function (e) {
  e.preventDefault();

  const name    = document.getElementById('book-name').value.trim();
  const date    = document.getElementById('book-date').value.trim();
  const venue   = document.getElementById('book-venue').value.trim();
  const message = document.getElementById('book-message').value.trim();

  const subject = encodeURIComponent(
    'Booking Inquiry' + (name ? ' — ' + name : '')
  );

  const lines = ['Hi In Pieces,\n'];
  if (name)    lines.push('Name / Organization: ' + name);
  if (date)    lines.push('Event Date: ' + date);
  if (venue)   lines.push('Venue & Location: ' + venue);
  if (message) lines.push('\n' + message);
  lines.push('\nLooking forward to hearing from you.');

  const body = encodeURIComponent(lines.join('\n'));

  window.location.href =
    'mailto:officialinpieces@gmail.com?subject=' + subject + '&body=' + body;
});
