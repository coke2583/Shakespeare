/* ---------- quote-stream.js (merged) ---------- */
import { plays } from './reader.js';

const parser = new DOMParser();

/* Build one big pool of random sentences taken from a random play */
async function buildQuotePool() {
  const file = plays[Math.floor(Math.random() * plays.length)];
  const res  = await fetch(`XML/${file}`);                    // fetch XML :contentReference[oaicite:0]{index=0}
  const xml  = await res.text();
  const doc  = parser.parseFromString(xml, 'application/xml'); // DOMParser :contentReference[oaicite:1]{index=1}

  const quotes = [];
  doc.querySelectorAll('l, p').forEach(el => {
    const text = el.textContent.trim().replace(/\s+/g, ' ');
    text.split(/(?<=[.!?])\s+/).forEach(sent => {
      const s = sent.trim();
      if (s && s.length > 20 && s.length <= 120) quotes.push(s);
    });
  });

  /* Fisher-Yates shuffle */                                   // shuffle algo :contentReference[oaicite:2]{index=2}
  for (let i = quotes.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [quotes[i], quotes[j]] = [quotes[j], quotes[i]];
  }

  return quotes.slice(0, 200);
}

/* Re-use the pool for the whole tab session */
const cachedQuotes = JSON.parse(sessionStorage.getItem('quotePool') || 'null');
const quotePool    = cachedQuotes || await buildQuotePool();
if (!cachedQuotes) sessionStorage.setItem('quotePool', JSON.stringify(quotePool));

/* ---------- background “book page” wall ---------- */
const container   = document.querySelector('.quote-stream');
const wallEls     = [];
const WALL_COUNT  = 40;

for (let i = 0; i < WALL_COUNT; i++) {
  const span = document.createElement('span');
  span.className   = 'quote-line';
  span.textContent = quotePool[Math.floor(Math.random() * quotePool.length)];
  container.appendChild(span);
  wallEls.push(span);
}

/* swap a single line every 4 s for subtle motion */
function swapLine() {
  const el     = wallEls[Math.floor(Math.random() * wallEls.length)];
  const quote  = quotePool[Math.floor(Math.random() * quotePool.length)];
  el.style.opacity = '0';
  setTimeout(() => {
    el.textContent = quote;
    el.style.opacity = '.1';
  }, 500);
}
setInterval(swapLine, 4000);

/* fade-in helper for hero elements */
const io = new IntersectionObserver((entries, ob) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      ob.unobserve(e.target);
    }
  });
}, { threshold: 0.2 });
document.querySelectorAll('.fade-in').forEach(el => io.observe(el));

/* ---------- rotating centre quote ---------- */
const quoteEl   = document.getElementById('rotating-quote');
let quoteIndex  = 0;

function showNextQuote() {
  if (!quotePool.length) return;
  quoteEl.classList.remove('visible');
  setTimeout(() => {
    quoteEl.textContent = quotePool[quoteIndex];
    quoteEl.classList.add('visible');
    quoteIndex = (quoteIndex + 1) % quotePool.length;
  }, 500);
}
showNextQuote();
setInterval(showNextQuote, 6000);
