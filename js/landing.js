import { plays } from './reader.js';

const parser = new DOMParser();

async function buildQuotePool() {
  const file = plays[Math.floor(Math.random() * plays.length)];
  const res  = await fetch(`XML/${file}`);
  const xml  = await res.text();
  const doc  = parser.parseFromString(xml, 'application/xml');

  const quotes = [];
  doc.querySelectorAll('l, p').forEach(el => {
    const text = el.textContent.trim().replace(/\s+/g, ' ');
    text.split(/(?<=[.!?])\s+/).forEach(sent => {
      const s = sent.trim();
      if (s && s.length > 20 && s.length <= 120) quotes.push(s);
    });
  });

  for (let i = quotes.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [quotes[i], quotes[j]] = [quotes[j], quotes[i]];
  }

  return quotes.slice(0, 200);
}

const cached = JSON.parse(sessionStorage.getItem('quotes') || 'null');
const quotePool = cached || await buildQuotePool();
if (!cached) sessionStorage.setItem('quotes', JSON.stringify(quotePool));

/* ----------- background quote wall ----------- */
const container = document.querySelector('.quote-stream');
const wallEls = [];
const WALL_COUNT = 40;

for (let i = 0; i < WALL_COUNT; i++) {
  const span = document.createElement('span');
  span.className = 'quote-line';
  span.textContent = quotePool[Math.floor(Math.random() * quotePool.length)];
  container.appendChild(span);
  wallEls.push(span);
}

function swapLine() {
  const el = wallEls[Math.floor(Math.random() * wallEls.length)];
  const quote = quotePool[Math.floor(Math.random() * quotePool.length)];
  el.style.opacity = '0';
  setTimeout(() => {
    el.textContent = quote;
    el.style.opacity = '0.1';
  }, 500);
}

setInterval(swapLine, 4000);

/* fade in hero text */
const io = new IntersectionObserver((entries, ob) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      ob.unobserve(e.target);
    }
  });
}, { threshold: 0.2 });

document.querySelectorAll('.fade-in').forEach(el => io.observe(el));

/* ----------- rotating quote ----------- */
const quoteEl = document.getElementById('rotating-quote');
let rotateIndex = 0;

function showNextQuote() {
  if (!quotePool.length) return;
  quoteEl.classList.remove('visible');
  setTimeout(() => {
    quoteEl.textContent = quotePool[rotateIndex];
    quoteEl.classList.add('visible');
    rotateIndex = (rotateIndex + 1) % quotePool.length;
  }, 500);
}

showNextQuote();
setInterval(showNextQuote, 6000);
