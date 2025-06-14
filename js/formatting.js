// Formatting utilities for TEI Simple XML
// Extracted from reader.js so that formatting logic is isolated.

// Return text content for a TEI node, respecting spaces
export function nodeText(n) {
  if (n.nodeType === Node.TEXT_NODE) return n.nodeValue;
  switch (n.nodeName) {
    case 'w':
    case 'pc':
      return n.textContent;
    case 'c':
      return ' ';
    default:
      return Array.from(n.childNodes).map(nodeText).join('');
  }
}


// Get a line of text from a TEI element
export function getLineText(el) {
  return Array.from(el.childNodes).map(nodeText).join('').trim();
}

// Convert a TEI node to the HTML used by the reader
export function teiToHtml(node) {
  if (!node) return '';
  let out = '';
  node.childNodes.forEach(ch => {
    if (ch.nodeType === Node.TEXT_NODE) {
      // preserve significant spaces, ignore purely formatting whitespace
      let text = ch.nodeValue;
      if (text.trim() === '') return;
      const startSpace = /^\s/.test(text);
      const endSpace = /\s$/.test(text);
      text = text.trim().replace(/\s+/g, ' ');
      if (startSpace) out += ' ';
      out += text;
      if (endSpace) out += ' ';
    } else {
      switch (ch.nodeName) {
        case 'w':
          out += `<span class="lookup" data-word="${ch.textContent}">${ch.textContent}</span>`;
          break;
        case 'pc':
          out += ch.textContent;
          break;
        case 'c':
          out += ' ';
          break;
        case 'lb': {
          const id = ch.getAttribute('xml:id') || '';
          const n = ch.getAttribute('n') || '';
          out += `<br id="${id}" data-line="${n}">`;
          break;
        }
        case 'l': {
          const id = ch.getAttribute('xml:id') || '';
          const n  = ch.getAttribute('n') || '';
          let inner = '';
          ch.childNodes.forEach(child => { inner += teiToHtml(child); });
          out += `<p class="verse" id="${id}" data-line="${n}" data-line-id="${id}">` +
                 inner +
                 ` <span class="ln" aria-hidden="true">${n}</span></p>`;
          break;
        }
        case 'p':
          out += teiToHtml(ch) + '<br><br>';
          break;
        case 'speaker': {
          out += '<strong>' + teiToHtml(ch) + '</strong>';
          let next = ch.nextElementSibling;
          while (next && next.nodeType !== 1) {
            next = next.nextSibling;
          }
          if (next && next.nodeName === 'stage') {
            out += ' ';
          } else {
            out += '<br>';
          }
          break;
        }
        case 'stage':
          out += '<em>' + teiToHtml(ch) + '</em><br>';
          break;
        case 'castList':
          out += '<h2 class="act-title">Dramatis Personae</h2><ul>' + teiToHtml(ch) + '</ul><br>';
          break;
        case 'castItem': {
          const name = ch.querySelector('role');
          const desc = ch.querySelector('roleDesc');
          const text = (name ? teiToHtml(name).trim() : '') + (desc ? ' — ' + teiToHtml(desc).trim() : '');
          if (text.trim()) out += '<li>' + text + '</li>';
          break;
        }
        case 'head':
          if (ch.parentNode && ch.parentNode.nodeName === 'castGroup') {
            out += '<li><strong>' + teiToHtml(ch) + '</strong></li>';
          } else {
            out += '<h3 class="scene-title">' + teiToHtml(ch) + '</h3>';
          }
          break;
        case 'sp':
          out += '<p class="speech"><span class="speech-text">' + teiToHtml(ch) + '</span>' +
            '<button class="copy-btn" aria-label="Copy">' +
            '<img class="icon copy" src="assets/copyIcon.png" alt="">' +
            '<img class="icon check" src="assets/tick.png" alt="">' +
            '</button></p>';
          break;
        default:
          out += teiToHtml(ch);
      }
    }
  });
  return out;
}
