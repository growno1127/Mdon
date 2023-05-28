import './public-path';
import { loadPolyfills } from '../mastodon/polyfills';
import { start } from '../mastodon/common';
import ready from '../mastodon/ready';
import ComposeContainer  from '../mastodon/containers/compose_container';
import { createRoot } from 'react-dom/client';

start();

function loaded() {
  const mountNode = document.getElementById('mastodon-compose');

  if (mountNode) {
    const attr = mountNode.getAttribute('data-props');
    if(!attr) return;

    const props = JSON.parse(attr);
    const root = createRoot(mountNode);
    root.render(<ComposeContainer {...props} />);
  }
}

function main() {
  ready(loaded);
}

loadPolyfills().then(main).catch(error => {
  console.error(error);
});
