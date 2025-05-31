/* ---------- quote-stream.js ---------- */
import { FAMOUS_QUOTES } from './quotes.js';

/* Use the curated list as our quote pool */
const pool = FAMOUS_QUOTES;

/* ---------- background “book page” wall ---------- */
const box = document.querySelector('.quote-stream');
pool.forEach(text => {
  const span = document.createElement('span');
  span.className = 'quote-line';
  span.textContent = text;
  box.append(span);
});

/* ---------- fade-in helper for hero elements ---------- */
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
const quoteEl  = document.getElementById('rotating-quote');
let quoteIndex = 0;

function parseQuote(q) {
  const match = q.match(/^(.*?)(?: \(([^)]+)\))?$/);
  return {
    text: match ? match[1] : q,
    attr: match && match[2] ? match[2] : ''
  };
}

function showNextQuote() {
  if (!pool.length) return;
  quoteEl.classList.remove('visible');
  setTimeout(() => {
    const { text, attr } = parseQuote(pool[quoteIndex]);
    quoteEl.innerHTML = `<span class="quote-text">${text}</span>` +
      (attr ? `<br><span class="quote-attr">${attr}</span>` : '');
    quoteEl.classList.add('visible');
    quoteIndex = (quoteIndex + 1) % pool.length;
  }, 500);
}
showNextQuote();
setInterval(showNextQuote, 6000);
