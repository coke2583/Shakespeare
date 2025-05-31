import { plays } from './reader.js';

const parser = new DOMParser();

// Build a random pool of XML lines
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
const cached   = JSON.parse(sessionStorage.getItem('quotes') || 'null');
const linePool = cached || await buildLinePool();
if (!cached) sessionStorage.setItem('quotes', JSON.stringify(linePool));

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
