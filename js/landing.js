const quotes=[
  'To be, or not to be',
  'All the world\'s a stage',
  'The play\'s the thing',
  'If music be the food of love, play on',
  'The lady doth protest too much, methinks',
  'Some are born great, some achieve greatness',
  'Brevity is the soul of wit',
  'We are such stuff as dreams are made on',
  'Now is the winter of our discontent',
  'Cry havoc and let slip the dogs of war'
];

const container=document.querySelector('.quote-stream');
quotes.forEach(q=>{
  const span=document.createElement('span');
  span.className='ghost';
  span.textContent=q;
  container.appendChild(span);
});

function cycleQuotes(box){
  let active=0;
  box.children[active].classList.add('revealed');
  setInterval(()=>{
    box.children[active].classList.remove('revealed');
    active=(active+1)%box.children.length;
    box.children[active].classList.add('revealed');
  },4000);
}
cycleQuotes(container);

const io=new IntersectionObserver((entries,ob)=>{
  entries.forEach(e=>{
    if(e.isIntersecting){
      e.target.classList.add('visible');
      ob.unobserve(e.target);
    }
  });
},{threshold:.2});
document.querySelectorAll('.fade-in').forEach(el=>io.observe(el));
