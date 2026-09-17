import { renderNavigation } from './navigation.js?v=p5r-modules-20260917-5';
import { renderHome } from './components.js?v=p5r-modules-20260917-5';
import { renderPage } from './router.js?v=p5r-modules-20260917-9';

const page = document.body.dataset.page;
renderNavigation(document.querySelector('#site-navigation'));

if (page === 'home') {
  renderHome(document.querySelector('#home-links'));
} else {
  renderPage(page, document.querySelector('#app'));
}
