import emojione from 'emojione';
import Trie from 'substring-trie';

const mappedUnicode = emojione.mapUnicodeToShort();
const trie = new Trie(Object.keys(emojione.jsEscapeMap));

function emojify(str) {
  // This walks through the string from start to end, ignoring any tags (<p>, <br>, etc.)
  // and replacing valid unicode strings
  // that _aren't_ within tags with an <img> version.
  // The goal is to be the same as an emojione.regUnicode replacement, but faster.
  let i = -1;
  let insideTag = false;
  let match;
  while (++i < str.length) {
    const char = str.charAt(i);
    if (insideTag && char === '>') {
      insideTag = false;
    } else if (char === '<') {
      insideTag = true;
    } else if (!insideTag && (match = trie.search(str.substring(i)))) {
      const unicodeStr = match;
      if (unicodeStr in emojione.jsEscapeMap) {
        const unicode  = emojione.jsEscapeMap[unicodeStr];
        const short    = mappedUnicode[unicode];
        const filename = emojione.emojioneList[short].fname;
        const alt      = emojione.convert(unicode.toUpperCase());
        const replacement =  `<img draggable="false" class="emojione" alt="${alt}" title="${short}" src="/emoji/${filename}.svg" />`;
        str = str.substring(0, i) + replacement + str.substring(i + unicodeStr.length);
        i += (replacement.length - unicodeStr.length); // jump ahead the length we've added to the string
      }
    }
  }
  return str;
}

export default emojify;
