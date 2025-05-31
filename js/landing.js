const quotes=[
  'To be, or not to be',
  'All the world\'s a stage',
  'The play\'s the thing'
];
const container=document.querySelector('.ghost-container');
quotes.forEach(q=>{
  const span=document.createElement('span');
  span.className='ghost fade-in';
  span.textContent=q;
  span.style.top=Math.random()*80+10+'%';
  span.style.left=Math.random()*80+10+'%';
  container.appendChild(span);
});
let revealed=false;
window.addEventListener('pointermove',()=>{
  if(!revealed){
    revealed=true;
    document.querySelectorAll('.ghost').forEach(g=>g.classList.add('revealed'));
  }
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
