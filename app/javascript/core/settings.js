//  This file will be loaded on settings pages, regardless of theme.

function main() {
  const { length } = require('stringz');
  const { delegate } = require('rails-ujs');

  delegate(document, '.webapp-btn', 'click', ({ target, button }) => {
    if (button !== 0) {
      return true;
    }
    window.location.href = target.href;
    return false;
  });

  delegate(document, '.status__content__spoiler-link', 'click', ({ target }) => {
    const contentEl = target.parentNode.parentNode.querySelector('.e-content');

    if (contentEl.style.display === 'block') {
      contentEl.style.display = 'none';
      target.parentNode.style.marginBottom = 0;
    } else {
      contentEl.style.display = 'block';
      target.parentNode.style.marginBottom = null;
    }

    return false;
  });

  delegate(document, '.account_display_name', 'input', ({ target }) => {
    const nameCounter = document.querySelector('.name-counter');

    if (nameCounter) {
      nameCounter.textContent = 30 - length(target.value);
    }
  });

  delegate(document, '.account_note', 'input', ({ target }) => {
    const noteCounter = document.querySelector('.note-counter');

    if (noteCounter) {
      const noteWithoutMetadata = processBio(target.value).text;
      noteCounter.textContent = 500 - length(noteWithoutMetadata);
    }
  });

  delegate(document, '#account_avatar', 'change', ({ target }) => {
    const avatar = document.querySelector('.card.compact .avatar img');
    const [file] = target.files || [];
    const url = file ? URL.createObjectURL(file) : avatar.dataset.originalSrc;

    avatar.src = url;
  });

  delegate(document, '#account_header', 'change', ({ target }) => {
    const header = document.querySelector('.card.compact');
    const [file] = target.files || [];
    const url = file ? URL.createObjectURL(file) : header.dataset.originalSrc;

    header.style.backgroundImage = `url(${url})`;
  });
}

loadPolyfills().then(main).catch(error => {
  console.error(error);
});
