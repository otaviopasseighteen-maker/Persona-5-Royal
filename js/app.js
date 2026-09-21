import { renderNavigation } from './navigation.js?v=p5r-modules-20260917-6';
import { renderHome } from './components.js?v=p5r-modules-20260917-5';
import { renderPage } from './router.js?v=p5r-persona-cards-20260918-2';
import { initMotion } from './motion.js?v=p5r-motion-20260918-1';
import { initAmbientScene } from './ambient.js?v=p5r-ambient-20260918-1';
import { initPageTransitions } from './page-transitions.js?v=p5r-transitions-20260921-1';

const page=document.body.dataset.page;
initAmbientScene();
initPageTransitions();
renderNavigation(document.querySelector('#site-navigation'));
if(page==='home') renderHome(document.querySelector('#home-links'));
else renderPage(page,document.querySelector('#app'));
requestAnimationFrame(()=>initMotion());
