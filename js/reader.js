import { teiToHtml, nodeText, getLineText } from './formatting.js';

  /* ------------ available files ---------------- */
  export const plays = [
    "alls-well-that-ends-well_TEIsimple_FolgerShakespeare.xml",
    "a-midsummer-nights-dream_TEIsimple_FolgerShakespeare.xml",
    "antony-and-cleopatra_TEIsimple_FolgerShakespeare.xml",
    "as-you-like-it_TEIsimple_FolgerShakespeare.xml",
    "coriolanus_TEIsimple_FolgerShakespeare.xml",
    "cymbeline_TEIsimple_FolgerShakespeare.xml",
    "hamlet_TEIsimple_FolgerShakespeare.xml",
    "henry-iv-part-1_TEIsimple_FolgerShakespeare.xml",
    "henry-iv-part-2_TEIsimple_FolgerShakespeare.xml",
    "henry-v_TEIsimple_FolgerShakespeare.xml",
    "henry-viii_TEIsimple_FolgerShakespeare.xml",
    "henry-vi-part-1_TEIsimple_FolgerShakespeare.xml",
    "henry-vi-part-2_TEIsimple_FolgerShakespeare.xml",
    "henry-vi-part-3_TEIsimple_FolgerShakespeare.xml",
    "julius-caesar_TEIsimple_FolgerShakespeare.xml",
    "king-john_TEIsimple_FolgerShakespeare.xml",
    "king-lear_TEIsimple_FolgerShakespeare.xml",
    "loves-labors-lost_TEIsimple_FolgerShakespeare.xml",
    "macbeth_TEIsimple_FolgerShakespeare.xml",
    "measure-for-measure_TEIsimple_FolgerShakespeare.xml",
    "much-ado-about-nothing_TEIsimple_FolgerShakespeare.xml",
    "othello_TEIsimple_FolgerShakespeare.xml",
    "pericles_TEIsimple_FolgerShakespeare.xml",
    "richard-ii_TEIsimple_FolgerShakespeare.xml",
    "richard-iii_TEIsimple_FolgerShakespeare.xml",
    "romeo-and-juliet_TEIsimple_FolgerShakespeare.xml",
    "the-comedy-of-errors_TEIsimple_FolgerShakespeare.xml",
    "the-merchant-of-venice_TEIsimple_FolgerShakespeare.xml",
    "the-merry-wives-of-windsor_TEIsimple_FolgerShakespeare.xml",
    "the-taming-of-the-shrew_TEIsimple_FolgerShakespeare.xml",
    "the-tempest_TEIsimple_FolgerShakespeare.xml",
    "the-two-gentlemen-of-verona_TEIsimple_FolgerShakespeare.xml",
    "the-winters-tale_TEIsimple_FolgerShakespeare.xml",
    "timon-of-athens_TEIsimple_FolgerShakespeare.xml",
    "titus-andronicus_TEIsimple_FolgerShakespeare.xml",
    "troilus-and-cressida_TEIsimple_FolgerShakespeare.xml",
    "twelfth-night_TEIsimple_FolgerShakespeare.xml"
  ];

  /* ------------ element handles --------------- */
  const d = typeof document === 'undefined' ? null : document;
  const actPicker   = d? d.createElement('select') : {value:'all'};
  const scenePicker = d? d.createElement('select') : {value:'all'};
  const linePicker  = d? d.getElementById('linePicker') : null;
  const lineFrom    = d? d.getElementById('lineFrom') : {value:''};
  const lineTo      = d? d.getElementById('lineTo') : {value:''};
  const lineGo      = d? d.getElementById('lineGo') : null;
  const lineList    = d? d.getElementById('lineList') : null;
  const searchSheet = d? d.getElementById('searchSheet') : null;
  const searchInput = searchSheet ? searchSheet.querySelector('input[type=search]') : null;
  const searchList  = searchSheet ? searchSheet.querySelector('ul') : null;
  const searchBtn   = d? d.querySelector('.search-btn') : {style:{display:'none'}};
  const sizeBtn     = d? d.querySelector('.size-btn') : {style:{display:'none'}};
  const viewer      = d? d.getElementById("viewer")  : {innerHTML:'',textContent:''};
  const castDiv     = d? d.getElementById("cast")    : {innerHTML:''};
  const nextBtn     = d? d.getElementById("nextBtn") : {style:{display:''}};
  const playSheet   = d? d.getElementById('playSheet') : null;
  const playSearch  = playSheet? playSheet.querySelector('input[type=search]') : null;
  const sheetList   = playSheet? playSheet.querySelector('ul') : null;
  const contentsSheet = d? d.getElementById('contentsSheet') : null;
  const sizeSheet   = d? d.getElementById('sizeSheet') : null;
  const sizeRange   = sizeSheet? sizeSheet.querySelector('input[type=range]') : null;
  const savedFont   = sizeRange ? parseInt(localStorage.getItem('readerFontSize'),10) : NaN;
  if(sizeRange && !isNaN(savedFont)) sizeRange.value = savedFont;
  const actCtrl     = d? d.getElementById('actCtrl') : null;
  const sceneCtrl   = d? d.getElementById('sceneCtrl') : null;
  const contentsBtn = d? d.querySelector('.contents-btn') : {style:{}};
  if(contentsBtn.style) contentsBtn.style.display = 'none';
  const resumeBtn   = d? d.getElementById('resumeBtn') : null;
  const header      = d? d.querySelector('header') : null;
  const playTitleEl = d? d.getElementById('playTitle') : {textContent:''};
  const panel       = d? d.getElementById('panel') : null;

  /* cached lines for search */
  let lines = [];
  const lineNodes = new Map();

  /* scroll position for returning after closing a sheet */
  let savedScroll = 0;

  /* global overlay element for closing sheets */
  let sheetOverlay = null;


  const parser      = (typeof DOMParser==='undefined') ? {parseFromString:()=>null} : new DOMParser();
  let   currentDoc  = null;
  let   castHtml    = "";
  let   currentFile = null;


  function extractLines(xml){
    lines = [];
    lineNodes.clear();
    xml.querySelectorAll('l[n]').forEach(l=>{
      const id  = l.getAttribute('xml:id') || '';
      const ref = l.getAttribute('n') || '';
      const text = getLineText(l);
      lines.push({id, ref, text});
      if(id) lineNodes.set(id, l);
    });
    xml.querySelectorAll('ab[n]').forEach(ab=>{
      const id = ab.getAttribute('xml:id') || '';
      const ref = ab.getAttribute('n') || '';
      const text = getLineText(ab);
      lines.push({id, ref, text});
      if(id) lineNodes.set(id, ab);
    });
    xml.querySelectorAll('p').forEach(p=>{
      let current = null;
      let buf = '';
      p.childNodes.forEach(ch=>{
        if(ch.nodeName==='lb' && ch.getAttribute('n')){
          if(current){
            lines.push({id:current.id, ref:current.ref, text:buf.trim()});
            if(current.id) lineNodes.set(current.id, current.node);
          }
          current = {id:ch.getAttribute('xml:id')||'', ref:ch.getAttribute('n')||'', node:ch};
          buf = '';
        }else if(current){
          buf += nodeText(ch);
        }
      });
      if(current){
        lines.push({id:current.id, ref:current.ref, text:buf.trim()});
        if(current.id) lineNodes.set(current.id, current.node);
      }
    });
  }

  /* ----------- populate play list ------------- */
  if(playSheet && sheetList){
    plays.forEach(f=>{
      const title = f.replace(/_TEIsimple_FolgerShakespeare\.xml$/,"")
                      .replace(/-/g," ")
                      .replace(/\b\w/g,c=>c.toUpperCase());
      const li = document.createElement('li');
      li.dataset.file = f;
      li.textContent = title;
      sheetList.appendChild(li);
    });

    openSheet(playSheet);

    playSearch.addEventListener('input',()=>{
      const term = playSearch.value.toLowerCase();
      sheetList.querySelectorAll('li').forEach(li=>{
        li.style.display = li.textContent.toLowerCase().includes(term) ? '' : 'none';
      });
    });

    sheetList.addEventListener('click',e=>{
      const li = e.target.closest('li');
      if(!li) return;
      closeSheet(playSheet);
      loadProgress(true, li.dataset.file);
    });

    playSheet.addEventListener('click',e=>{
      if(e.target===playSheet) closeSheet(playSheet);
    });
  }


  /* ----------- populate acts/scenes ----------- */
  function populateActs(xml){
    actPicker.innerHTML = "";
    const acts = xml.querySelectorAll('body div[type="act"]');

    const allActs = new Option("All Acts","all");
    actPicker.appendChild(allActs);

    acts.forEach((act,i)=>{
      const head = act.querySelector("head");
      actPicker.appendChild(new Option(head?head.textContent.trim():`Act ${i+1}`,i));
    });

    actPicker.onchange = ()=>{
      const val = actPicker.value === "all" ? null : acts[actPicker.value];
      populateScenes(val);
      displayScene();
    };
    actPicker.value = "all";
    populateScenes(null);
    renderActSegments();
  }

  function populateScenes(act){
    scenePicker.innerHTML = "";

    scenePicker.appendChild(new Option("Characters","cast"));
    scenePicker.appendChild(new Option("All Scenes","all"));

    const scenes = act?act.querySelectorAll('div[type="scene"]'):[];
    scenes.forEach((sc,i)=>{
      const head = sc.querySelector("head");
      scenePicker.appendChild(new Option(head?head.textContent.trim():`Scene ${i+1}`,i));
    });
    scenePicker.onchange = displayScene;
    scenePicker.value = "all";
    renderSceneSegments();
  }

  let sceneFirstRef = '';
  let sceneLastRef  = '';

  function populateLines(scene){
    sceneFirstRef = '';
    sceneLastRef  = '';
    if(scene){
      const els = scene.querySelectorAll('lb[n], l[n], ab[n]');
      if(els.length){
        sceneFirstRef = els[0].getAttribute('n') || '';
        sceneLastRef  = els[els.length-1].getAttribute('n') || '';
      }
    }
    updateLineList();
  }

  function updateLineList(){
    if(!lineList) return;
    lineList.innerHTML = '';
    let startIndex = 0;
    let endIndex = lines.length - 1;
    if(sceneFirstRef){
      const idx = lines.findIndex(l => l.ref === sceneFirstRef);
      if(idx >= 0) startIndex = idx;
    }
    if(sceneLastRef){
      const idx = lines.findIndex(l => l.ref === sceneLastRef);
      if(idx >= 0) endIndex = idx;
    }
    for(let i=startIndex; i<=endIndex; i++){
      const opt = document.createElement('option');
      opt.value = lines[i].ref;
      opt.textContent = `${lines[i].ref} – ${lines[i].text.slice(0,50)}`;
      lineList.appendChild(opt);
    }
  }

  /* --------------- render view ---------------- */
  function displayScene(){
    if(!currentDoc) return;

    // Characters pane
    if(scenePicker.value === "cast"){
      castDiv.innerHTML = castHtml;
      viewer.innerHTML  = "";
      nextBtn.style.display = "none";
      window.scrollTo(0,0);
      return;
    }

    const acts = currentDoc.querySelectorAll('body div[type="act"]');
    let html = "";
    let currentScene = null;

    if(actPicker.value === "all"){
      acts.forEach(a=>{html += teiToHtml(a);});
    }else{
      const act = acts[actPicker.value];
      if(scenePicker.value === "all"){
        html += teiToHtml(act);
      }else{
        currentScene = act.querySelectorAll('div[type="scene"]')[scenePicker.value];
        html += teiToHtml(currentScene);
      }
    }

    viewer.innerHTML = html;
    addCopyButtons();
    castDiv.innerHTML = "";

    populateLines(currentScene);

    nextBtn.style.display = (actPicker.value!=="all" && scenePicker.value!=="all" && getNextSceneIndices()) ? "" : "none";
    window.scrollTo(0,0);
  }

  function getNextSceneIndices(){
    if(!currentDoc) return null;
    const acts = currentDoc.querySelectorAll('body div[type="act"]');
    let a = Number(actPicker.value);
    let s = Number(scenePicker.value);
    if(isNaN(a) || isNaN(s)) return null;

    const scenes = acts[a].querySelectorAll('div[type="scene"]');
    if(s < scenes.length - 1) return {actIndex:a, sceneIndex:s+1};

    for(let nextA=a+1; nextA<acts.length; nextA++){
      const nextScenes = acts[nextA].querySelectorAll('div[type="scene"]');
      if(nextScenes.length) return {actIndex:nextA, sceneIndex:0};
    }
    return null;
  }

  function gotoScene(indices){
    const acts = currentDoc.querySelectorAll('body div[type="act"]');
    actPicker.value = indices.actIndex;
    populateScenes(acts[indices.actIndex]);
    scenePicker.value = indices.sceneIndex;
    displayScene();
  }

  function renderActSegments(){
    actCtrl.innerHTML = '';
    const btnAll = document.createElement('button');
    btnAll.textContent = 'All Acts';
    btnAll.dataset.value = 'all';
    if(actPicker.value === 'all') btnAll.classList.add('active');
    actCtrl.appendChild(btnAll);
    const acts = currentDoc.querySelectorAll('body div[type="act"]');
    acts.forEach((act,i)=>{
      const head = act.querySelector('head');
      const btn = document.createElement('button');
      btn.dataset.value = i;
      btn.textContent = head?head.textContent.trim():`Act ${i+1}`;
      if(actPicker.value == i) btn.classList.add('active');
      actCtrl.appendChild(btn);
    });
  }

  function renderSceneSegments(){
    sceneCtrl.innerHTML = '';
    Array.from(scenePicker.options).forEach(opt=>{
      const btn = document.createElement('button');
      btn.dataset.value = opt.value;
      btn.textContent = opt.textContent;
      if(scenePicker.value === opt.value) btn.classList.add('active');
      sceneCtrl.appendChild(btn);
    });
  }

  if(typeof document!=='undefined' && panel){
    document.addEventListener('click',e=>{
      const w=e.target.closest('.word');
      if(!w) return;
      if(!/^\d+\.\d+\.\d+$/.test(w.dataset.ref)) return;
      const [act,scene,line]=w.dataset.ref.split('.');
      const word=w.textContent;
      panel.innerHTML=`<strong>${word}</strong><br>Act ${act}, Scene ${scene}, Line ${line}<br><em>Loading…</em>`;
      panel.style.display='block';
      fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`)
        .then(r=>r.ok?r.json():[])
        .then(data=>{
          const defs=data[0]?.meanings?.[0]?.definitions||[];
          panel.innerHTML=`<strong>${word}</strong><br>Act ${act}, Scene ${scene}, Line ${line}<ul>${defs.slice(0,3).map(d=>`<li>${d.definition}</li>`).join('')}</ul>`;
        });
    });

    document.addEventListener('click',e=>{
      if(!e.target.closest('.word') && !e.target.closest('#panel')){
        panel.style.display='none';
      }
    });
  }

  /* --------------- main load ------------------ */
  async function loadPlay(file){
    currentFile = file;
    const title = file.replace(/_TEIsimple_FolgerShakespeare\.xml$/,"")
                      .replace(/-/g, " ")
                      .replace(/\b\w/g, c => c.toUpperCase());
    playTitleEl.textContent = title;
    if(typeof document !== 'undefined'){
      document.title = `Shakespeare Reader – ${title}`;
    }
    contentsBtn.style.display = 'none';
    viewer.textContent = 'Loading… 0 %';
    try{
      const res   = await fetch(`XML/${file}`);
      const total = +res.headers.get('Content-Length') || 0;
      const reader = res.body.getReader();
      const chunks = [];
      let loaded = 0;
      while(true){
        const {done, value} = await reader.read();
        if(done) break;
        chunks.push(value);
        loaded += value.length;
        if(total>0){
          viewer.textContent = `Loading… ${(Math.min(loaded/total,1)*100).toFixed(0)} %`;
        }else{
          viewer.innerHTML = '<progress class="indeterminate"></progress>';
        }
      }
      const xml = await new Blob(chunks).text();
      currentDoc = parser.parseFromString(xml, 'application/xml');
      const castList = currentDoc.querySelector("castList");
      castHtml = castList ? teiToHtml(castList) : "";
      extractLines(currentDoc);
      populateActs(currentDoc);
      displayScene();
      contentsBtn.style.display = '';
      saveProgress();
    }catch(e){
      viewer.textContent = "❌ "+e;
      console.error(e);
    }
  }

  /* -------------- wire-up --------------------- */
  if(nextBtn.addEventListener){
    nextBtn.addEventListener('click',()=>{
      const next = getNextSceneIndices();
      if(next) gotoScene(next);
    });
  }

  if(contentsBtn.addEventListener){
    contentsBtn.addEventListener('click',()=>openSheet(contentsSheet));
  }

  if(actCtrl){
    actCtrl.addEventListener('click',e=>{
      const b = e.target.closest('button');
      if(!b) return;
      actPicker.value = b.dataset.value;
      const acts = currentDoc.querySelectorAll('body div[type="act"]');
      const val = actPicker.value === 'all' ? null : acts[actPicker.value];
      populateScenes(val);
      renderActSegments();
    });
  }

  if(sceneCtrl){
    sceneCtrl.addEventListener('click',e=>{
      const b = e.target.closest('button');
      if(!b) return;
      scenePicker.value = b.dataset.value;
      renderSceneSegments();
      closeSheet(contentsSheet);
    });
  }

  if(lineGo && lineGo.addEventListener){
    lineGo.addEventListener('click',()=>{
      const from = lineFrom.value.trim();
      const to   = lineTo.value.trim();
      closeSheet(contentsSheet);
      highlightRange(from||sceneFirstRef, to||sceneLastRef);
    });
  }

  if(contentsSheet){
    contentsSheet.addEventListener('click',e=>{
      if(e.target===contentsSheet) closeSheet(contentsSheet);
    });
  }

  if(searchBtn && searchBtn.addEventListener){
    searchBtn.addEventListener('click',()=>openSheet(searchSheet));
  }

  if(searchSheet){
    searchSheet.addEventListener('click',e=>{
      if(e.target===searchSheet) closeSheet(searchSheet);
    });
  }


  if(searchInput){
    let timer=null;
    searchInput.addEventListener('input',()=>{
      clearTimeout(timer);
      timer=setTimeout(()=>{
        const term = searchInput.value.toLowerCase();
        const hits = term ? lines.filter(l => l.text.toLowerCase().includes(term)) : [];
        renderSearchResults(hits, term);
      },150);
    });
  }

  if(searchList){
    searchList.addEventListener('click',e=>{
      const li=e.target.closest('li');
      if(!li) return;
      highlightLine(li.dataset.id);
      closeSheet(searchSheet);
    });
  }

  if(sizeBtn && sizeBtn.addEventListener){
    sizeBtn.addEventListener('click',()=>openSheet(sizeSheet));
  }

  if(sizeSheet){
    sizeSheet.addEventListener('click',e=>{
      if(e.target===sizeSheet) closeSheet(sizeSheet);
    });
  }

  function updateFontSize(){
    if(!sizeRange) return;
    let topEl=null, start=0, end=0;
    if(typeof document!=='undefined' && header){
      const y=header.offsetHeight+1;
      topEl=document.elementFromPoint(0,y);
      if(topEl) start=topEl.getBoundingClientRect().top;
    }

    const val=parseInt(sizeRange.value,10);
    if(viewer) viewer.style.fontSize=val+'px';
    if(castDiv) castDiv.style.fontSize=val+'px';
    if(typeof document!=='undefined'){
      document.documentElement.style.setProperty('--play-font-size',val+'px');
    }

    if(topEl){
      end=topEl.getBoundingClientRect().top;
      savedScroll+=end-start;
      document.body.style.top=`-${savedScroll}px`;
    }

    try{localStorage.setItem('readerFontSize',val);}catch(e){}
  }

  if(sizeRange){
    sizeRange.addEventListener('input',updateFontSize);
    sizeRange.addEventListener('change',()=>closeSheet(sizeSheet));
    updateFontSize();
  }

  if(typeof window!=='undefined'){
    window.addEventListener('scroll',()=>{
      if(scrollY>80 && header && !header.classList.contains('compact')){
        header.classList.add('compact');
      }else if(scrollY<=80 && header && header.classList.contains('compact')){
        header.classList.remove('compact');
      }
    });
  }

  function openSheet(sheet){
    savedScroll = window.scrollY || window.pageYOffset || 0;
    document.body.style.top = `-${savedScroll}px`;
    if(!sheetOverlay){
      sheetOverlay = document.createElement('div');
      sheetOverlay.className = 'sheet-overlay';
    }
    sheetOverlay.onclick = () => closeSheet(sheet);
    document.body.appendChild(sheetOverlay);
    sheet.classList.add('open');
    contentsBtn.style.display = 'none';

    if(searchBtn) searchBtn.style.display = 'none';
    if(sizeBtn) sizeBtn.style.display = 'none';
    document.body.classList.add('noscroll');

    const focusable = sheet.querySelector('input,button,li,select');
    if(focusable) focusable.focus();
  }

  function closeSheet(sheet){
    sheet.classList.remove('open');
    if(sheet===contentsSheet) displayScene();
    contentsBtn.style.display = '';
    if(searchBtn) searchBtn.style.display = '';
    if(sizeBtn) sizeBtn.style.display = '';
    document.body.classList.remove('noscroll');
    document.body.style.top = '';
    window.scrollTo(0, savedScroll);
    if(sheetOverlay && sheetOverlay.parentNode){
      sheetOverlay.parentNode.removeChild(sheetOverlay);
    }
  }

  function renderSearchResults(items, term){
    if(!searchList) return;
    searchList.innerHTML = '';
    const esc = term ? term.replace(/[.*+?^${}()|[\]\\]/g,'\\$&') : '';
    const regex = esc ? new RegExp(`(${esc})`, 'ig') : null;
    items.forEach(l => {
      const li = document.createElement('li');
      li.dataset.id = l.id;
      let text = l.text;
      if(regex) text = l.text.replace(regex, '<mark>$1</mark>');
      li.innerHTML = `<div><strong>${l.ref}</strong></div><div>${text}</div>`;
      searchList.appendChild(li);
    });
  }

  let activeHighlight=[];
  function highlightLine(id){
    activeHighlight.forEach(el=>el.classList.remove('line-hit'));
    activeHighlight=[];
    const anchor=document.getElementById(id);
    if(anchor){
      anchor.scrollIntoView();
      viewer.querySelectorAll(`[data-line-id="${id}"]`).forEach(el=>{
        el.classList.add('line-hit');
        activeHighlight.push(el);
      });
      setTimeout(()=>activeHighlight.forEach(el=>el.classList.remove('line-hit')),3000);
    }
  }

  function highlightRange(fromRef,toRef){
    activeHighlight.forEach(el=>el.classList.remove('line-hit'));
    activeHighlight=[];
    let startIndex=0,endIndex=lines.length-1;
    if(fromRef){
      const idx=lines.findIndex(l=>l.ref===fromRef);
      if(idx>=0) startIndex=idx;
    }
    if(toRef){
      const idx=lines.findIndex(l=>l.ref===toRef);
      if(idx>=0) endIndex=idx;
    }
    if(startIndex>endIndex) [startIndex,endIndex]=[endIndex,startIndex];
    let firstEl=null;
    for(let i=startIndex;i<=endIndex;i++){
      const id=lines[i].id;
      if(!id) continue;
      viewer.querySelectorAll(`[data-line-id="${id}"]`).forEach(el=>{
        el.classList.add('line-hit');
        activeHighlight.push(el);
        if(!firstEl) firstEl=el;
      });
    }
    if(firstEl){
      firstEl.scrollIntoView();
      setTimeout(()=>activeHighlight.forEach(el=>el.classList.remove('line-hit')),3000);
    }
  }

  function addCopyButtons(){
    if(!viewer) return;
    viewer.querySelectorAll('.speech .prose').forEach(p=>{
      if(p.querySelector('.copy-btn')) return;
      const btn=document.createElement('button');
      btn.type='button';
      btn.className='copy-btn';
      const img=document.createElement('img');
      img.src='assets/copyIcon.png';
      img.alt='Copy';
      btn.appendChild(img);
      btn.addEventListener('click',()=>{
        const speech=p.closest('.speech');
        const speaker=speech?.querySelector('strong')?.innerText.trim()||'';
        const text=p.innerText.trim();
        const copyText=speaker?`${speaker}\n${text}`:text;
        navigator.clipboard.writeText(copyText).then(()=>{
          img.src='assets/tick.png';
          setTimeout(()=>{img.src='assets/copyIcon.png';},2000);
        });
      });
      p.appendChild(btn);
    });
  }

  const PROGRESS_KEY = 'readerProgress';

  function getProgressData(){
    let data=null;
    try{data=JSON.parse(localStorage.getItem(PROGRESS_KEY)||'{}');}catch(e){data={};}
    if(!data || typeof data!=='object') data={};
    // upgrade old format
    if(!data.plays && data.file){
      data={lastFile:data.file, plays:{[data.file]:{
        act:data.act, scene:data.scene, line:data.line, scroll:data.scroll
      }}};
    }
    if(!data.plays) data.plays={};
    return data;
  }

  function saveProgress(){
    if(!currentDoc || !currentFile) return;
    const data=getProgressData();
    data.lastFile=currentFile;
    data.plays[currentFile]={
      act:actPicker.value,
      scene:scenePicker.value,
      line:lineFrom?lineFrom.value:'',
      scroll:typeof scrollY==='number'?scrollY:0
    };
    try{localStorage.setItem(PROGRESS_KEY,JSON.stringify(data));}catch(e){}
  }

  async function loadProgress(apply=true,file=null){
    const data=getProgressData();
    const f=file||data.lastFile;
    const prog=f?data.plays[f]:null;
    if(!f||!plays.includes(f)) return null;
    if(resumeBtn && prog) resumeBtn.style.display='';
    if(!apply){
      return prog?{file:f,...prog}:null;
    }
    await loadPlay(f);
    if(prog){
      const acts=currentDoc.querySelectorAll('body div[type="act"]');
      actPicker.value=prog.act;
      const act=prog.act==='all'?null:acts[+prog.act];
      populateScenes(act);
      scenePicker.value=prog.scene;
      displayScene();
      if(prog.line){
        lineFrom.value=prog.line;
        highlightLine(prog.line);
      }
      window.scrollTo(0,prog.scroll||0);
    }
    closeSheet(playSheet);
    return prog?{file:f,...prog}:{file:f};
  }

  if(typeof window!=='undefined'){
    window.addEventListener('beforeunload',saveProgress);
    loadProgress(false);
  }

  if(resumeBtn&&resumeBtn.addEventListener){
    resumeBtn.addEventListener('click',()=>loadProgress());
  }



