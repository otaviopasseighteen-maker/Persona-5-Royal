import { renderNavigation } from './navigation.js';
import { renderHome } from './components.js';
import { renderPage } from './router.js';

const page = document.body.dataset.page;
renderNavigation(document.querySelector('#site-navigation'));

if (page === 'home') {
  renderHome(document.querySelector('#home-links'));
} else {
  renderPage(page, document.querySelector('#app'));
}
