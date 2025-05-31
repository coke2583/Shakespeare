import {plays} from './reader.js';

const parser = new DOMParser();

async function buildLinePool(){
  const file = plays[Math.floor(Math.random()*plays.length)];
  const res = await fetch(`XML/${file}`);
  const xml = await res.text();
  const doc = parser.parseFromString(xml,'application/xml');
  const lines=[];
  doc.querySelectorAll('l,p').forEach(el=>{
    const text = el.textContent.trim().replace(/\s+/g,' ');
    if(text.length>40) lines.push(text);
  });
  for(let i=lines.length-1; i>0; i--){
    const j=Math.floor(Math.random()*(i+1));
    [lines[i],lines[j]]=[lines[j],lines[i]];
  }
  return lines.slice(0,20);
}

const cached = JSON.parse(sessionStorage.getItem('quotes')||'null');
const linePool = cached || await buildLinePool();
if(!cached) sessionStorage.setItem('quotes',JSON.stringify(linePool));

const stream = document.querySelector('.quote-stream');
linePool.forEach(text=>{
  const span=document.createElement('span');
  span.className='quote-line';
  span.style.animationDelay=`${Math.random()*30}s`;
  span.textContent=text;
  stream.append(span);
});

const io=new IntersectionObserver((entries,ob)=>{
  entries.forEach(e=>{
    if(e.isIntersecting){
      e.target.classList.add('visible');
      ob.unobserve(e.target);
    }
  });
},{threshold:.2});
document.querySelectorAll('.fade-in').forEach(el=>io.observe(el));
