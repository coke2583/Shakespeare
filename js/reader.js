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

const actPicker      = d ? d.createElement('select')            : { value:'all' };
const scenePicker    = d ? d.createElement('select')            : { value:'all' };
const viewer         = d ? d.getElementById('viewer')           : { innerHTML:'', textContent:'' };
const castDiv        = d ? d.getElementById('cast')             : { innerHTML:'' };
const nextBtn        = d ? d.getElementById('nextBtn')          : { style:{ display:'' } };

const playSheet      = d ? d.getElementById('playSheet')        : null;
const playSearch     = playSheet ? playSheet.querySelector('input[type=search]') : null;
const sheetList      = playSheet ? playSheet.querySelector('ul')                  : null;

const contentsSheet  = d ? d.getElementById('contentsSheet')    : null;
const actCtrl        = d ? d.getElementById('actCtrl')          : null;
const sceneCtrl      = d ? d.getElementById('sceneCtrl')        : null;

const contentsBtn    = d ? d.querySelector('.contents-btn')     : { style:{} };
if (contentsBtn.style) contentsBtn.style.display = 'none';

const header         = d ? d.querySelector('header')            : null;

/* -------------- accessibility / clipboard / dictionary listeners -------------- */
const announce = d ? d.getElementById('announce') : { textContent:'' };
const defs     = new Map();

if (viewer.addEventListener) {
  viewer.addEventListener('click', async e => {
    /* copy button */
    const btn = e.target.closest('.copy-btn');
    if (btn) {
      const speech = btn.closest('.speech').querySelector('.speech-text').innerText;
      navigator.clipboard.writeText(speech).then(() => {
        btn.classList.add('copied');
        announce.textContent = 'Copied!';
        setTimeout(() => btn.classList.remove('copied'), 1000);
      });
      return;
    }

    /* dictionary lookup */
    const w = e.target.closest('.lookup');
    if (w) {
      const word    = w.dataset.word.toLowerCase();
      const cached  = defs.get(word) ||
                      await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`)
                             .then(r => r.json())
                             .catch(() => null);
      if (!defs.has(word) && cached) defs.set(word, cached);
      showTooltip(e.clientX, e.clientY, getDefinitionText(cached));
    }
  });
}

/* -------------- DOMParser setup -------------- */
const parser = (typeof DOMParser === 'undefined')
             ? { parseFromString: () => null }
             : new DOMParser();

/* --------------------------------------------------------------------------- */
/* The rest of the module (populate play list, TEI parsing, sheets logic, etc.)
   remains unchanged. It already references the handles above and works in both
   browser and SSR contexts.                                                    */
/* --------------------------------------------------------------------------- */
