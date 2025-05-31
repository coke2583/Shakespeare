import { plays } from './reader.js';

const parser = new DOMParser();

// Build a random pool of XML lines for the background stream
async function buildLinePool() {
  const file = plays[Math.floor(Math.random() * plays.length)];
  const res  = await fetch(`XML/${file}`);
  const xml  = await res.text();
  const doc  = parser.parseFromString(xml, 'application/xml');

  const lines = [];
  doc.querySelectorAll('l, p').forEach(el => {
    const text = el.textContent.trim().replace(/\s+/g, ' ');
    if (text.length > 40) lines.push(text);
  });

  // Fisher-Yates shuffle
  for (let i = lines.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [lines[i], lines[j]] = [lines[j], lines[i]];
  }

  return lines.slice(0, 20);
}

// Re-use the pool for the rest of the tab session
const cachedLines = JSON.parse(sessionStorage.getItem('streamLines') || 'null');
const linePool    = cachedLines || await buildLinePool();
if (!cachedLines) sessionStorage.setItem('streamLines', JSON.stringify(linePool));

const container = document.querySelector('.quote-stream');

linePool.forEach((text, i) => {
  const span = document.createElement('span');
  span.className = 'quote-line fade-in';      // fade-in watched by IO
  span.textContent = text;
  span.style.animationDelay = `${i * 3 + Math.random() * 1.5}s`;
  container.appendChild(span);
});

// Reveal each span once it scrolls into view
const io = new IntersectionObserver((entries, ob) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      ob.unobserve(e.target);
    }
  });
}, { threshold: 0.2 });

document.querySelectorAll('.fade-in').forEach(el => io.observe(el));

/* ----------- rotating quotes on the home screen ----------- */
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

  return quotes.slice(0, 20);
}

const quoteCached = JSON.parse(sessionStorage.getItem('rotatingQuotes') || 'null');
const quotePool   = quoteCached || await buildQuotePool();
if (!quoteCached) sessionStorage.setItem('rotatingQuotes', JSON.stringify(quotePool));

const quoteEl = document.getElementById('rotating-quote');
let quoteIndex = 0;

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
