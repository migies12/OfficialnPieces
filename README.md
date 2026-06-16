# In Pieces — Band Portfolio Site

Static site for **In Pieces** (metal/alt). Deploys for free on GitHub Pages.

---

## Swap in real photos

Drop your images into the `images/` folder with these exact names:

| File | Used for |
|---|---|
| `images/hero.jpg` | Full-viewport hero background |
| `images/about.jpg` | About section photo |
| `images/members/member-1.jpg` | Vocals |
| `images/members/member-2.jpg` | Lead Guitar |
| `images/members/member-3.jpg` | Rhythm Guitar |
| `images/members/member-4.jpg` | Bass |
| `images/members/member-5.jpg` | Drums |
| `images/album-1.jpg` | Album One art |
| `images/album-2.jpg` | EP art |
| `images/album-3.jpg` | Single art |

Any common format works (jpg, png, webp). Landscape shots work best for hero/about; portrait for member cards.

---

## Connect Google Calendar (shows section)

### 1 — Create a public calendar
1. Go to [calendar.google.com](https://calendar.google.com)
2. Create a new calendar: **Other calendars → +** → name it "In Pieces Shows"
3. Open its **Settings** → scroll to **Access permissions** → check **Make available to public**
4. Copy the **Calendar ID** (looks like `xxxx@group.calendar.google.com`)

### 2 — Add show events
Each event in the calendar becomes a row on the site. Use this convention:
- **Title**: Venue name (e.g. "The Masquerade")
- **Location**: City, State (e.g. "Atlanta, GA")
- **Description**: Paste the ticket URL on its own line (e.g. `https://ticketmaster.com/...`)

### 3 — Get an API key
1. Open [console.cloud.google.com](https://console.cloud.google.com)
2. Create a project → **Enable APIs** → search for and enable **Google Calendar API**
3. **Credentials → Create credentials → API key**
4. Restrict the key: **API restrictions → Restrict key → Google Calendar API**
5. Copy the key

### 4 — Paste both into the site
Open `js/main.js` and update lines 8–9:

```js
const CALENDAR_ID = 'xxxx@group.calendar.google.com';
const API_KEY     = 'AIza...';
```

Save. Done. The shows section will now pull live from your calendar.

---

## Update band info

- **Names & roles** — edit the five `.member-card` blocks in `index.html`
- **Bio** — edit the `<p>` tags inside `#about .about-text`
- **Music section** — update `.music-title`, `.music-meta`, and the Spotify `href` on each `.music-link`
- **Social links** — update the `href` values in `<footer>` for Instagram, Spotify, YouTube, and email

---

## Deploy to GitHub Pages

```bash
git init
git add .
git commit -m "initial commit"
gh repo create in-pieces --public --source=. --push
```

Then in GitHub: **Settings → Pages → Source: main branch, / (root)** → Save.

Your site will be live at `https://your-username.github.io/in-pieces/` within ~60 seconds.

---

## Local preview

```bash
npx serve .
# or
python3 -m http.server 8080
```

Open `http://localhost:8080` in your browser.
