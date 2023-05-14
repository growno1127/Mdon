import React from 'react';
import ReactDOM from 'react-dom';
import { setupBrowserNotifications } from 'flavours/glitch/actions/notifications';
import Mastodon from 'flavours/glitch/containers/mastodon';
import { store } from 'flavours/glitch/store';
import { me } from 'flavours/glitch/initial_state';
import ready from 'flavours/glitch/ready';

import * as perf from 'flavours/glitch/performance';

/**
 * @returns {Promise<void>}
 */
function main() {
  perf.start('main()');

  return ready(async () => {
    const mountNode = document.getElementById('mastodon');
    const props = JSON.parse(mountNode.getAttribute('data-props'));

    ReactDOM.render(<Mastodon {...props} />, mountNode);
    store.dispatch(setupBrowserNotifications());

    if (process.env.NODE_ENV === 'production' && me && 'serviceWorker' in navigator) {
      const { Workbox } = await import('workbox-window');
      const wb = new Workbox('/sw.js');
      /** @type {ServiceWorkerRegistration} */
      let registration;

      try {
        registration = await wb.register();
      } catch (err) {
        console.error(err);
      }

      if (registration) {
        const registerPushNotifications = await import('flavours/glitch/actions/push_notifications');

        store.dispatch(registerPushNotifications.register());
      }
    }

    perf.stop('main()');
  });
}

export default main;
