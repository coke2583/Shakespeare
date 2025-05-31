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
  const linePicker  = d? d.getElementById('linePicker') : {value:''};
  const searchSheet = d? d.getElementById('searchSheet') : null;
  const searchInput = searchSheet ? searchSheet.querySelector('input[type=search]') : null;
  const searchList  = searchSheet ? searchSheet.querySelector('ul') : null;
  const searchBtn   = d? d.querySelector('.search-btn') : {style:{display:'none'}};
  const viewer      = d? d.getElementById("viewer")  : {innerHTML:'',textContent:''};
  const castDiv     = d? d.getElementById("cast")    : {innerHTML:''};
  const nextBtn     = d? d.getElementById("nextBtn") : {style:{display:''}};
  const playSheet   = d? d.getElementById('playSheet') : null;
  const playSearch  = playSheet? playSheet.querySelector('input[type=search]') : null;
  const sheetList   = playSheet? playSheet.querySelector('ul') : null;
  const contentsSheet = d? d.getElementById('contentsSheet') : null;
  const actCtrl     = d? d.getElementById('actCtrl') : null;
  const sceneCtrl   = d? d.getElementById('sceneCtrl') : null;
  const contentsBtn = d? d.querySelector('.contents-btn') : {style:{}};
  if(contentsBtn.style) contentsBtn.style.display = 'none';
  const header      = d? d.querySelector('header') : null;

  /* cached lines for search */
  let lines = [];
  const lineNodes = new Map();

  /* copy-to-clipboard buttons */
  const announce = d? d.getElementById('announce') : {textContent:''};
  const defs = new Map();
  if(viewer.addEventListener){
    viewer.addEventListener('click',async e=>{
      const btn = e.target.closest('.copy-btn');
      if(btn){
        const speech = btn.closest('.speech').querySelector('.speech-text').innerText;
        navigator.clipboard.writeText(speech)
          .then(()=>{
            btn.classList.add('copied');
            announce.textContent = 'Copied!';
            setTimeout(()=>btn.classList.remove('copied'),1000);
          });
        return;
      }

      const w = e.target.closest('.lookup');
      if(w){
        const word = w.dataset.word.toLowerCase();
        const cached = defs.get(word) || await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`)
                              .then(r=>r.json()).catch(()=>null);
        if(!defs.has(word) && cached) defs.set(word,cached);
        showTooltip(e.clientX,e.clientY,getDefinitionText(cached));
      }
    });
  }

  const parser      = (typeof DOMParser==='undefined') ? {parseFromString:()=>null} : new DOMParser();
  let   currentDoc  = null;
  let   castHtml    = "";


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
      loadPlay(li.dataset.file);
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

  function populateLines(scene){
    if(!linePicker) return;
    linePicker.innerHTML = '';
    linePicker.appendChild(new Option('Top',''));
    if(scene){
      scene.querySelectorAll('lb[n], l[n]').forEach(el=>{
        const n = el.getAttribute('n');
        const id = el.getAttribute('xml:id');
        if(n && id) linePicker.appendChild(new Option(n,id));
      });
    }
    linePicker.value = '';
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

  function getDefinitionText(data){
    if(!Array.isArray(data) || !data.length) return 'No definition found.';
    const entry = data[0];
    const defs = (entry.meanings||[])
      .map(m=>`<strong>${m.partOfSpeech}</strong> ${m.definitions[0].definition}`)
      .join('<br>');
    return `<strong>${entry.word}</strong><br>${defs}`;
  }

  function showTooltip(x,y,html){
    document.querySelectorAll('.tooltip').forEach(t=>t.remove());
    if(!html) return;
    const div = document.createElement('div');
    div.className = 'tooltip';
    div.innerHTML = html;
    document.body.appendChild(div);
    const rect = div.getBoundingClientRect();
    const left = Math.min(x, window.innerWidth - rect.width - 10);
    div.style.left = left + 'px';
    div.style.top  = (y - rect.height - 10) + 'px';
    setTimeout(()=>{
      document.addEventListener('click',()=>div.remove(),{once:true});
    },0);
  }

  /* --------------- main load ------------------ */
  async function loadPlay(file){
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

  if(linePicker && linePicker.addEventListener){
    linePicker.addEventListener('change',()=>{
      const id = linePicker.value;
      closeSheet(contentsSheet);
      if(id){

        highlightLine(id);

        const el = document.getElementById(id);
        if(el) el.scrollIntoView();

      }else{
        window.scrollTo(0,0);
      }
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
        const term=searchInput.value.toLowerCase();
        const hits=term?lines.filter(l=>l.text.toLowerCase().includes(term)):[];
        renderSearchResults(hits);
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
    sheet.classList.add('open');
    contentsBtn.style.display = 'none';

    if(searchBtn) searchBtn.style.display = 'none';

    const focusable = sheet.querySelector('input,button,li,select');
    if(focusable) focusable.focus();
  }

  function closeSheet(sheet){
    sheet.classList.remove('open');
    if(sheet===contentsSheet) displayScene();
    contentsBtn.style.display = '';
    if(searchBtn) searchBtn.style.display = '';
  }

  function renderSearchResults(items){
    if(!searchList) return;
    searchList.innerHTML='';
    items.forEach(l=>{
      const li=document.createElement('li');
      li.dataset.id=l.id;
      const preview=l.text.slice(0,60);
      li.innerHTML=`<div><strong>${l.ref}</strong></div><div>${preview}</div>`;
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



