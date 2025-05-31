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
  const actPicker   = document.createElement('select');
  const scenePicker = document.createElement('select');
  const viewer      = document.getElementById("viewer");
  const castDiv     = document.getElementById("cast");
  const nextBtn     = document.getElementById("nextBtn");
  const playSheet   = document.getElementById('playSheet');
  const playSearch  = playSheet.querySelector('input[type=search]');
  const sheetList   = playSheet.querySelector('ul');
  const contentsSheet = document.getElementById('contentsSheet');
  const actCtrl     = document.getElementById('actCtrl');
  const sceneCtrl   = document.getElementById('sceneCtrl');
  const contentsBtn = document.querySelector('.contents-btn');
  const header      = document.querySelector('header');

  /* copy-to-clipboard buttons */
  const announce = document.getElementById('announce');
  const defs = new Map();
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

  const parser      = new DOMParser();
  let   currentDoc  = null;
  let   castHtml    = "";

  /* ----------- populate play list ------------- */
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

  /* ------------- TEI → HTML ------------------- */
  function teiToHtml(node){
    if(!node) return "";
    let out = "";
    node.childNodes.forEach(ch=>{
      if(ch.nodeType === Node.TEXT_NODE){
        /* preserve significant spaces, ignore purely formatting whitespace */
        let text = ch.nodeValue;
        if(text.trim() === '') return;
        const startSpace = /^\s/.test(text);
        const endSpace   = /\s$/.test(text);
        text = text.trim().replace(/\s+/g,' ');
        if(startSpace) out += ' ';
        out += text;
        if(endSpace)   out += ' ';
      }else{
        switch(ch.nodeName){
          case "w":
            out += `<span class="lookup" data-word="${ch.textContent}">${ch.textContent}</span>`;
            break;
          case "pc":   out += ch.textContent;               break;
          case "c":    out += " ";                          break;
          case "lb":   out += "<br>";                       break;
          case "l":    out += teiToHtml(ch)+"<br>";         break;
          case "p":    out += teiToHtml(ch)+"<br><br>";     break;

          case "speaker": {                                 // speaker then optional stage dir on same line :contentReference[oaicite:3]{index=3}
            out += "<strong>"+teiToHtml(ch)+"</strong>";
            let next = ch.nextElementSibling;
            while(next && next.nodeType!==1){next = next.nextSibling;}
            if(next && next.nodeName==="stage"){
              out += " ";
            }else{
              out += "<br>";
            }
            break;
          }
          case "stage":   out += "<em>"+teiToHtml(ch)+"</em><br>";  break;

          case "castList":
            out += '<h2 class="act-title">Dramatis Personae</h2><ul>'+teiToHtml(ch)+"</ul><br>";
            break;
          case "castItem": {                                   // format character list
            const name = ch.querySelector("role");
            const desc = ch.querySelector("roleDesc");
            const text = (name?teiToHtml(name).trim():"") +
                         (desc?" — "+teiToHtml(desc).trim():"");
            if(text.trim()) out += "<li>"+text+"</li>";
            break;
          }
          case "head":
            if(ch.parentNode && ch.parentNode.nodeName==="castGroup"){
              out += "<li><strong>"+teiToHtml(ch)+"</strong></li>";
            }else{
              out += '<h3 class="scene-title">'+teiToHtml(ch)+"</h3>";
            }
            break;

          case "sp":  // speech block with copy button
            out += '<p class="speech"><span class="speech-text">'+teiToHtml(ch)+'</span>'+
                   '<button class="copy-btn" aria-label="Copy">'+
                     '<img class="icon copy" src="assets/copyIcon.png" alt="">'+
                     '<img class="icon check" src="assets/tick.png" alt="">'+
                   '</button></p>';
            break;

          default:    out += teiToHtml(ch);
        }
      }
    });
    return out;
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

    if(actPicker.value === "all"){
      acts.forEach(a=>{html += teiToHtml(a);});
    }else{
      const act = acts[actPicker.value];
      if(scenePicker.value === "all"){
        html += teiToHtml(act);
      }else{
        const scene = act.querySelectorAll('div[type="scene"]')[scenePicker.value];
        html += teiToHtml(scene);
      }
    }

    viewer.innerHTML = html;
    castDiv.innerHTML = "";

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
      populateActs(currentDoc);
      displayScene();
    }catch(e){
      viewer.textContent = "❌ "+e;
      console.error(e);
    }
  }

  /* -------------- wire-up --------------------- */
  nextBtn.addEventListener('click',()=>{
    const next = getNextSceneIndices();
    if(next) gotoScene(next);
  });

  contentsBtn.addEventListener('click',()=>openSheet(contentsSheet));

  actCtrl.addEventListener('click',e=>{
    const b = e.target.closest('button');
    if(!b) return;
    actPicker.value = b.dataset.value;
    const acts = currentDoc.querySelectorAll('body div[type="act"]');
    const val = actPicker.value === 'all' ? null : acts[actPicker.value];
    populateScenes(val);
    renderActSegments();
  });

  sceneCtrl.addEventListener('click',e=>{
    const b = e.target.closest('button');
    if(!b) return;
    scenePicker.value = b.dataset.value;
    renderSceneSegments();
  });

  contentsSheet.addEventListener('click',e=>{
    if(e.target===contentsSheet) closeSheet(contentsSheet);
  });

  window.addEventListener('scroll',()=>{
    if(scrollY>80 && !header.classList.contains('compact')){
      header.classList.add('compact');
    }else if(scrollY<=80 && header.classList.contains('compact')){
      header.classList.remove('compact');
    }
  });

  function openSheet(sheet){
    sheet.classList.add('open');
    const focusable = sheet.querySelector('input,button,li');
    if(focusable) focusable.focus();
  }

  function closeSheet(sheet){
    sheet.classList.remove('open');
    if(sheet===contentsSheet) displayScene();
  }



