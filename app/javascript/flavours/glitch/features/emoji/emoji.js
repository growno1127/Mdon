import { autoPlayGif, useSystemEmojiFont } from 'flavours/glitch/initial_state';
import unicodeMapping from './emoji_unicode_mapping_light';
import { assetHost } from 'flavours/glitch/utils/config';
import Trie from 'substring-trie';

const trie = new Trie(Object.keys(unicodeMapping));

// Convert to file names from emojis. (For different variation selector emojis)
const emojiFilenames = (emojis) => {
  return emojis.map(v => unicodeMapping[v].filename);
};

// Emoji requiring extra borders depending on theme
const darkEmoji = emojiFilenames(['🎱', '🐜', '⚫', '🖤', '⬛', '◼️', '◾', '◼️', '✒️', '▪️', '💣', '🎳', '📷', '📸', '♣️', '🕶️', '✴️', '🔌', '💂‍♀️', '📽️', '🍳', '🦍', '💂', '🔪', '🕳️', '🕹️', '🕋', '🖊️', '🖋️', '💂‍♂️', '🎤', '🎓', '🎥', '🎼', '♠️', '🎩', '🦃', '📼', '📹', '🎮', '🐃', '🏴', '🐞', '🕺', '📱', '📲', '🚲']);
const lightEmoji = emojiFilenames(['👽', '⚾', '🐔', '☁️', '💨', '🕊️', '👀', '🍥', '👻', '🐐', '❕', '❔', '⛸️', '🌩️', '🔊', '🔇', '📃', '🌧️', '🐏', '🍚', '🍙', '🐓', '🐑', '💀', '☠️', '🌨️', '🔉', '🔈', '💬', '💭', '🏐', '🏳️', '⚪', '⬜', '◽', '◻️', '▫️']);

const emojiFilename = (filename) => {
  const borderedEmoji = (document.body && document.body.classList.contains('skin-mastodon-light')) ? lightEmoji : darkEmoji;
  return borderedEmoji.includes(filename) ? (filename + '_border') : filename;
};

const emojifyTextNode = (node, customEmojis) => {
  const parentElement = node.parentElement;
  let str = node.textContent;

  for (;;) {
    let match, i = 0;

    if (customEmojis === null) {
      while (i < str.length && !(match = trie.search(str.slice(i)))) {
        i += str.codePointAt(i) < 65536 ? 1 : 2;
      }
    } else {
      while (i < str.length && str[i] !== ':' && !(match = trie.search(str.slice(i)))) {
        i += str.codePointAt(i) < 65536 ? 1 : 2;
      }
    }

    let rend, replacement = '';
    if (i === str.length) {
      break;
    } else if (str[i] === ':') {
      if (!(() => {
        rend = str.indexOf(':', i + 1) + 1;
        if (!rend) return false; // no pair of ':'
        const shortname = str.slice(i, rend);
        // now got a replacee as ':shortname:'
        // if you want additional emoji handler, add statements below which set replacement and return true.
        if (shortname in customEmojis) {
          const filename = autoPlayGif ? customEmojis[shortname].url : customEmojis[shortname].static_url;
          replacement = `<img draggable="false" class="emojione custom-emoji" alt="${shortname}" title="${shortname}" src="${filename}" data-original="${customEmojis[shortname].url}" data-static="${customEmojis[shortname].static_url}" />`;
          return true;
        }
        return false;
      })()) rend = ++i;
    } else if (!useSystemEmojiFont) { // matched to unicode emoji
      const { filename, shortCode } = unicodeMapping[match];
      const title = shortCode ? `:${shortCode}:` : '';
      replacement = `<img draggable="false" class="emojione" alt="${match}" title="${title}" src="${assetHost}/emoji/${emojiFilename(filename)}.svg" />`;
      rend = i + match.length;
      // If the matched character was followed by VS15 (for selecting text presentation), skip it.
      if (str.codePointAt(rend) === 65038) {
        rend += 1;
      }
    }

    node.textContent = str.slice(0, i);
    parentElement.insertAdjacentHTML('beforeend', replacement);
    str = str.slice(rend);
    node = document.createTextNode(str);
    parentElement.append(node);
  }
};

const emojifyNode = (node, customEmojis) => {
  for (const child of node.childNodes) {
    switch(child.nodeType) {
    case Node.TEXT_NODE:
      emojifyTextNode(child, customEmojis);
      break;
    case Node.ELEMENT_NODE:
      if (!child.classList.contains('invisible'))
        emojifyNode(child, customEmojis);
      break;
    }
  }
};

const emojify = (str, customEmojis = {}) => {
  const wrapper = document.createElement('div');
  wrapper.innerHTML = str;

  if (!Object.keys(customEmojis).length)
    customEmojis = null;

  emojifyNode(wrapper, customEmojis);

  return wrapper.innerHTML;
};

export default emojify;
export { unicodeMapping };

export const buildCustomEmojis = (customEmojis) => {
  const emojis = [];

  customEmojis.forEach(emoji => {
    const shortcode = emoji.get('shortcode');
    const url       = autoPlayGif ? emoji.get('url') : emoji.get('static_url');
    const name      = shortcode.replace(':', '');

    emojis.push({
      id: name,
      name,
      short_names: [name],
      text: '',
      emoticons: [],
      keywords: [name],
      imageUrl: url,
      custom: true,
      customCategory: emoji.get('category'),
    });
  });

  return emojis;
};

export const categoriesFromEmojis = customEmojis => customEmojis.reduce((set, emoji) => set.add(emoji.get('category') ? `custom-${emoji.get('category')}` : 'custom'), new Set(['custom']));
