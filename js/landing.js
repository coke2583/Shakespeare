/* ---------- quote-stream.js (merged) ---------- */
import { plays } from './reader.js';

const parser = new DOMParser();

async function buildQuotePool(){
  const random = plays[Math.floor(Math.random()*plays.length)];
  const xml = await fetch(`XML/${random}`).then(r=>r.text());
  const doc = parser.parseFromString(xml,'application/xml');
  const sentences=[];
  doc.querySelectorAll('l,p').forEach(el=>{
    el.textContent.trim()
      .replace(/\s+/g,' ')
      .split(/(?<=[.!?])\s+/)
      .forEach(s=>{
        const t=s.trim();
        if(t.length>20 && t.length<=120) sentences.push(t);
      });
  });
  sentences.sort(()=>Math.random()-0.5);
  return sentences.slice(0,400);
}
const pool = JSON.parse(sessionStorage.getItem('quotePool')||'null') 
             || await buildQuotePool();
sessionStorage.setItem('quotePool',JSON.stringify(pool));

/* ---------- background “book page” wall ---------- */
const WALL = 40;
const box  = document.querySelector('.quote-stream');
const els  = [];
for(let i=0;i<WALL;i++){
  const span=document.createElement('span');
  span.className='quote-line';
  span.textContent=pool[Math.floor(Math.random()*pool.length)];
  span.style.animationDelay=`${Math.random()*30}s`;
  box.append(span);
  els.push(span);
}

/* swap a single line every 4 s for subtle motion */
setInterval(()=>{
  const el   = els[Math.floor(Math.random()*els.length)];
  const next = pool[Math.floor(Math.random()*pool.length)];
  el.style.opacity='0';
  setTimeout(()=>{
    el.textContent=next;
    el.style.opacity='.12';
  },500);
},4000);

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
  if (!pool.length) return;
  quoteEl.classList.remove('visible');
  setTimeout(() => {
    quoteEl.textContent = pool[quoteIndex];
    quoteEl.classList.add('visible');
    quoteIndex = (quoteIndex + 1) % pool.length;
  }, 500);
}
showNextQuote();
setInterval(showNextQuote, 6000);
