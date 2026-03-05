# 🎰 WANNA BET?
### *"The Fair 24/7 Degenerate Casino That Runs On Pure Math And Poor Decisions"*
**A Zengine Original** · `wannabet.zengine.site` · Open Since 1993 (in spirit)

---

## WHAT IS THIS

Wanna Bet? is a **free, browser-based spectator app** that produces universally synchronized game results every 10–130 seconds. You and your buddy open the same page at the same time anywhere on Earth and you see **identical results**. No accounts. No money. No server. No cheating. Just chaos.

It looks like a **1990s Wendy's that got foreclosed and reopened as a casino** because someone thought the red-and-yellow color scheme was close enough.

The app runs entirely on **`Date.now()` math** — results are seeded from the current Unix timestamp, so everyone on Earth sees the same outcome at the same moment. No backend. No WebSockets. No database. Just one GitHub repo and a vibes-based economy.

**Games:**
| Game | Interval | Description |
|------|----------|-------------|
| 🎰 Roulette | 60s | European single-zero wheel, animated spin |
| 🎱 Lottery | 70s | Pick 3, Pick 5, and Powerball simultaneously |
| 🇺🇸 Keno | 80s | 10 of 50 numbers, Stars & Stripes theme |
| 🃏 Single Draw | 90s | One card from a full 52-card deck |
| 🙈 Blind Man's Bluff | 100s | Player vs House, phase-based reveal |
| 🪙 Coin Toss | 110s | Heads/Tails with streak tracking |
| 🎲 Dice Haus | 120s | 5-dice combos + 1-die roll |
| ✨ Random Emoji | 130s | 21 emojis, one winner — A Zengine Original |

**Cascading result windows:** If you click through all 8 games in sequence, you'll hit a result roughly every 10 seconds. This is intentional. This is the ad revenue model. Welcome.

---

## HOW THE SYNC WORKS (EXPLAIN TO YOUR BRAIN)

Every game result is computed like this:

```javascript
const roundIndex = Math.floor(Date.now() / intervalMs);
// same millisecond = same roundIndex = same seed = same result
// for EVERY person on Earth running this page
```

We use **Mulberry32** — a seeded PRNG that given the same seed always produces the same sequence:

```javascript
function prng(seed) {
  let s = seed >>> 0;
  return function() {
    s += 0x6D2B79F5;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
```

**Result for roulette at any given moment:**
```javascript
const seed = Math.floor(Date.now() / 60000) * 7777 + 1;
const rng  = prng(seed);
const ball = Math.floor(rng() * 37); // 0-36
// This is identical for everyone. No server needed.
```

Each game uses a different multiplier/offset so results don't correlate between games.

**Nobody has an advantage.** You can't "check the result early." The result for the current round is what it is. You can verify it in your browser console right now:

```javascript
// Paste this in your browser console on any game page:
const ri = Math.floor(Date.now() / 60000);
const s  = ri * 7777 + 1;
let seed = s >>> 0;
seed += 0x6D2B79F5;
let t = seed;
t = Math.imul(t ^ (t >>> 15), t | 1);
t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
const ball = (((t ^ (t >>> 14)) >>> 0) / 4294967296 * 37) | 0;
console.log("Current roulette number:", ball);
```

---

## FILE STRUCTURE

```
wannabet/
├── index.html              ← Main lobby (the Wendy's storefront)
├── css/
│   └── game-shell.css      ← Shared styles for all game pages
├── js/
│   └── sync.js             ← Universal time engine + all game logic
└── games/
    ├── roulette.html       ← 🎰 Animated canvas wheel
    ├── lottery.html        ← 🎱 Pick 3 / Pick 5 / Powerball
    ├── keno.html           ← 🇺🇸 10 of 50 stars & stripes
    ├── poker.html          ← 🃏 Single card draw
    ├── bluff.html          ← 🙈 Blind Man's Bluff
    ├── coin.html           ← 🪙 Coin toss + streak
    ├── dice.html           ← 🎲 Dice Haus (5-dice + 1-die)
    └── emoji.html          ← ✨ Random Emoji (Zengine Original)
```

**Total backend required:** Zero. None. Zilch. It's 9 HTML files and 2 shared assets.

---

## DEPLOYMENT — GITHUB PAGES (THE CRAYON GUIDE)

### STEP 1: Get a GitHub account
> If you don't have one, go to **github.com** and make one.
> Username doesn't matter. Use something you won't regret in 5 years.
> (You will regret it.)

### STEP 2: Create a new repository
1. Click the **+** icon in the top right of GitHub
2. Click **"New repository"**
3. Name it: `wannabet` (or whatever, you're the boss)
4. Set it to **Public** ← THIS IS REQUIRED FOR FREE GITHUB PAGES
5. Check **"Add a README file"** (we'll replace it)
6. Click **"Create repository"**

### STEP 3: Upload your files
**Option A — The Drag & Drop Method (for crayon users):**
1. Open your new repository on GitHub
2. Click **"Add file"** → **"Upload files"**
3. Drag your entire `wannabet/` folder contents into the browser window
4. You need to maintain the folder structure:
   - Upload `index.html` to the root
   - Create a `css/` folder: click "Add file" > type `css/game-shell.css`
   - Create a `js/` folder: click "Add file" > type `js/sync.js`  
   - Create a `games/` folder: upload all 8 game HTML files there
5. Scroll down, click **"Commit changes"**
6. Click the green button that says **"Commit changes"** again

**Option B — Git CLI (for people who enjoy pain):**
```bash
# Clone your new repo
git clone https://github.com/YOUR_USERNAME/wannabet.git
cd wannabet

# Copy all your files in (maintaining the folder structure)
cp -r /path/to/your/wannabet/* .

# Add, commit, push
git add .
git commit -m "Initial deploy — the Wendy's is open"
git push origin main
```

### STEP 4: Enable GitHub Pages
1. In your repository, click **"Settings"** (the gear icon, top right)
2. In the left sidebar, scroll down and click **"Pages"**
3. Under **"Source"**, click the dropdown that says **"None"**
4. Select **"main"** branch
5. Keep the folder as **"/ (root)"**
6. Click **"Save"**
7. Wait 1-5 minutes
8. Refresh the page — you'll see a green box that says:
   **"Your site is live at: `https://YOUR_USERNAME.github.io/wannabet/`"**

> ⚠️ **GitHub Pages takes 1-5 minutes to go live after first setup.**
> If you see a 404, wait 3 minutes and refresh. Don't panic.
> Well, you can panic a little.

### STEP 5: Custom domain (optional but pro)
If you have a domain (like `wannabet.zengine.site`):

1. In your domain registrar (GoDaddy, Namecheap, Cloudflare, etc.):
   - Add a **CNAME record**:
     - Name: `wannabet`
     - Value: `YOUR_USERNAME.github.io`

2. Back in GitHub Pages settings:
   - Under **"Custom domain"**, type: `wannabet.yourdomain.com`
   - Click **Save**
   - Check **"Enforce HTTPS"** after it verifies (might take 10 min)

3. Create a file called `CNAME` in your repo root containing just:
   ```
   wannabet.yourdomain.com
   ```

---

## AD REVENUE SETUP (THE MONEY PART)

### Google AdSense Setup
1. Go to **adsense.google.com**
2. Sign in with your Google account
3. Click **"Get started"** and enter your site URL
4. Google will review your site (takes 1-14 days for new sites)
5. Once approved, go to **Ads** → **By ad unit** → **Display ads**
6. Create ad units for each slot type:
   - **Leaderboard (728x90)**: for the top banner slots
   - **Rectangle (300x250)**: for the in-page slots
7. Copy the ad unit code — it looks like:
   ```html
   <ins class="adsbygoogle"
        style="display:inline-block;width:728px;height:90px"
        data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
        data-ad-slot="XXXXXXXXXX"></ins>
   <script>(adsbygoogle = window.adsbygoogle || []).push({});</script>
   ```

### Replace the placeholder ad slots
In every HTML file, find the `<div class="ad-slot">` elements and replace them with your actual AdSense code. Example:

```html
<!-- BEFORE (placeholder): -->
<div class="ad-slot">AD SLOT — 728x90 LEADERBOARD</div>

<!-- AFTER (with AdSense): -->
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-YOUR_ID" crossorigin="anonymous"></script>
<ins class="adsbygoogle" style="display:block;width:728px;height:90px" 
     data-ad-client="ca-pub-YOUR_ID" data-ad-slot="YOUR_SLOT_ID"></ins>
<script>(adsbygoogle = window.adsbygoogle || []).push({});</script>
```

### Add the AdSense meta tag to every page
In the `<head>` section of every HTML file, add:
```html
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-YOUR_PUBLISHER_ID" crossorigin="anonymous"></script>
```

### The Monetization Logic
Here's why this works for ads:
- **8 games × ~30-60s cycles** = users bouncing between pages constantly
- Each page load = **new ad impression**
- The cascading 10-second offset means there's **always something about to happen** somewhere
- Users naturally check multiple games → **multiple page loads per session**
- Fully bookmarkable individual game pages = **direct traffic + sharing**
- Zero loading time (pure static HTML) = **low bounce rate**
- Mobile-friendly = **full mobile ad inventory**

**Realistic CPM range:** $1-8 depending on geo/audience. At 10,000 page views/day that's $10-80/day, or $300-2,400/month. Scale accordingly by sending it everywhere.

---

## THE RESPONSIBLE GAMBLING BIT (REQUIRED, NOT OPTIONAL)

Every page already includes:
```html
<a href="https://www.ncpgambling.org">NCPG Hotline 1-800-522-4700</a>
<a href="https://www.samhsa.gov">SAMHSA 1-800-662-4357</a>
```

The footer disclaimer on every page states clearly:
> *"No real money is wagered, won, or lost on this platform. All game outcomes are determined by universal time-synchronized mathematical functions."*

**This is important.** This app is entertainment. No one can deposit money. No one can win money. It's a TV show you can bet on with your buddy using Venmo or a handshake. The legal exposure is essentially zero because:
1. No real money changes hands on the platform
2. No accounts, no wallets, no transactions
3. Outcomes are deterministic and publicly verifiable
4. It's the same as watching football and betting with your friend on the couch

*But we're not lawyers. Consult a lawyer if you're worried. We're just people who put duct tape on a window.*

---

## MAKING UPDATES

When you want to change something:

**Via GitHub web editor:**
1. Find the file in your repo
2. Click the pencil icon (✏️) to edit
3. Make your changes
4. Click "Commit changes" → green button

**Via Git:**
```bash
git pull origin main          # get latest
# ... make your changes ...
git add .
git commit -m "describe what you changed"
git push origin main
```

GitHub Pages auto-deploys within ~1-2 minutes of any push to `main`.

---

## ADDING YOUR OWN GAMES

Want a new game? Here's the template. Copy any existing game file and modify the sync call:

```javascript
// In js/sync.js, add your interval:
WB.MYGAME = 150000; // 150 second cycle

// Add your result function:
function getMyGame(ri) {
  const r = prng(ri * 9999 + 42); // unique multiplier + offset
  // ... your logic here ...
  return result;
}

// In your new game HTML:
const ri   = S.roundIdx(window.WB.MYGAME);
const secs = S.secsLeft(window.WB.MYGAME);
const result = S.getMyGame(ri);
```

**Rules for picking intervals:**
- Keep them multiples of 10000 (10 seconds) for clean cascading
- Longer = more anticipation = more engagement
- Don't go below 30 seconds (feels frantic) or above 5 minutes (people leave)
- Current cascade: 60, 70, 80, 90, 100, 110, 120, 130 seconds — add new games at 140, 150, etc.

---

## TROUBLESHOOTING

| Problem | Probably Because | Fix |
|---------|-----------------|-----|
| 404 after deploy | Pages not enabled | Settings → Pages → Set source to main |
| 404 on game pages | Wrong folder structure | Make sure `games/` folder exists in repo root |
| CSS not loading | Wrong relative path | `games/` pages use `../css/game-shell.css` — check the `..` |
| Roulette wheel blurry | DPR scaling | Already handled in code — if still blurry, hard-refresh |
| Results differ from friend | Different timezones? | Should be fine — we use Unix timestamp. Make sure both browsers are not paused (background tabs throttle) |
| Coin won't flip | CSS animation conflict | Check browser hasn't disabled animations (accessibility settings) |
| Ad slots showing pattern | AdSense not set up | Replace `<div class="ad-slot">` with real AdSense code |
| GitHub Pages slow | CDN propagation | Wait 5 min, force refresh with Ctrl+Shift+R |

---

## THE LEGAL-ISH BIT

This app:
- ✅ Contains no real money gambling
- ✅ Requires no account or login
- ✅ Has no transactions
- ✅ Has no deposits or withdrawals  
- ✅ Is mathematically fair and verifiable by any user
- ✅ Includes problem gambling resources on every page
- ✅ Has no hidden RNG or server-side manipulation
- ❌ Is not a licensed gambling platform
- ❌ Should not be used as a licensed gambling platform
- ❌ Is not legal advice

---

## CREDITS

**Wanna Bet?** — A Zengine Original  
Based on the Telegaming Suite architecture (`tg.zengine.site`)  
PRNG: Mulberry32 by Tommy Ettinger  
Fonts: Oswald, Special Elite, Share Tech Mono, Permanent Marker (Google Fonts)  
Aesthetic: The Wendy's on Route 9 that closed in 1997 but spiritually lives on  

---

*"Nobody has an unfair advantage. Everybody has an unfair disadvantage. That's what makes it fun."*  
— Wanna Bet? company philosophy, paraphrased from a lottery ticket scratch-off we found in the parking lot

---

**If gambling is a problem for you or someone you know:**  
National Council on Problem Gambling: **1-800-522-4700** | ncpgambling.org  
SAMHSA National Helpline: **1-800-662-4357** | samhsa.gov  
Crisis Text Line: Text **HOME** to **741741**
