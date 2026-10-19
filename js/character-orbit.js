import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js';

const RED = 0xf21d2f;
const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

function safeText(value, fallback = '—') {
  return value === undefined || value === null || value === '' ? fallback : String(value);
}

export function initCharacterOrbit(target, characters) {
  const existing = characters.find(c => c.id === (document.body.dataset.id || new URLSearchParams(location.search).get('id')));
  if (existing) {
    const personaHref = existing.personaId ? '../personas/' + encodeURIComponent(existing.personaId) + '.html' : '';
    target.innerHTML = `
      <div class="breadcrumb"><a href="../../index.html">Home</a><span>›</span><a href="../characters.html">Characters</a><span>›</span><strong>${safeText(existing.realName || existing.name)}</strong></div>
      <article class="p5r-profile-standalone">
        <div class="p5r-profile-art"><img src="${existing.profileImage || existing.image || ''}" alt="${safeText(existing.realName || existing.name)}"></div>
        <div class="p5r-profile-copy"><p class="eyebrow">PERSONA USER FILE / ${safeText(existing.arcana)}</p><h1>${safeText(existing.realName || existing.name)}</h1><p class="p5r-profile-code">CODENAME: <strong>${safeText(existing.codename || existing.name)}</strong></p>
        <div class="p5r-profile-stats"><div><small>AGE</small><strong>${safeText(existing.age)}</strong></div><div><small>ROLE</small><strong>${safeText(existing.role)}</strong></div><div><small>BIRTHDAY</small><strong>${safeText(existing.birthday)}</strong></div><div><small>AFFILIATION</small><strong>${safeText(existing.affiliation)}</strong></div></div>
        <section><h2>Biography</h2><p>${safeText(existing.bio)}</p></section>
        ${personaHref ? '<section><h2>Persona</h2><a href="' + personaHref + '">' + safeText(existing.personaName) + ' ↗</a><p>' + safeText(existing.personaRole) + '</p></section>' : ''}
        <a class="p5r-back-orbit" href="../characters.html">← BACK TO THE ROSTER</a></div>
      </article>`;
    return;
  }

  target.innerHTML = `
    <div class="breadcrumb"><a href="../index.html">Home</a><span>›</span><strong>Characters</strong></div>
    <section class="p5r-orbit-page" aria-label="Phantom Thieves character selector">
      <header class="p5r-orbit-heading"><p class="eyebrow">PHANTOM THIEVES / PERSONA USERS</p><h1>CHOOSE YOUR<br><span>THIEF.</span></h1><p>Gire a órbita. Encontre seu Phantom Thief.</p></header>
      <div class="p5r-orbit-stage" data-orbit-stage>
        <div class="p5r-orbit-scanline" aria-hidden="true"></div>
        <div class="p5r-orbit-canvas" data-orbit-canvas aria-hidden="true"></div>
        <div class="p5r-orbit-portraits" data-orbit-portraits></div>
        <div class="p5r-orbit-center-mark" aria-hidden="true"><span>心</span><small>PHANTOM<br>THIEVES</small></div>
        <div class="p5r-orbit-index"><span data-orbit-current>01</span><i>/</i><span>${String(characters.length).padStart(2, '0')}</span></div>
      </div>
      <nav class="p5r-orbit-controls" aria-label="Character navigation">
        <button type="button" data-orbit-prev aria-label="Previous character">← <span>PREVIOUS</span></button>
        <p><kbd>A</kbd><kbd>D</kbd><span>OR</span><kbd>←</kbd><kbd>→</kbd></p>
        <button type="button" data-orbit-next aria-label="Next character"><span>NEXT</span> →</button>
      </nav>
      <div class="p5r-orbit-selected"><p data-orbit-arcana>FOOL ARCANA</p><h2 data-orbit-name>JOKER</h2><span data-orbit-codename>CODENAME: JOKER</span><button class="p5r-orbit-confirm" type="button" data-orbit-confirm>OPEN PERSONA FILE <b>↘</b></button></div>
      <section class="p5r-orbit-profile" data-orbit-profile aria-hidden="true">
        <div class="p5r-profile-topline"><span>CONFIDENTIAL / PHANTOM THIEVES</span><button type="button" data-orbit-close>× <span>CLOSE FILE</span></button></div>
        <div class="p5r-profile-content" data-orbit-profile-content></div>
      </section>
      <p class="p5r-orbit-footnote">PERSONA 5 ROYAL FAN DATABASE · USE A / D OR ARROW KEYS TO NAVIGATE</p>
      <noscript>Este seletor precisa de JavaScript habilitado para funcionar.</noscript>
    </section>`;

  const stage = target.querySelector('[data-orbit-stage]');
  const canvasHost = target.querySelector('[data-orbit-canvas]');
  const portraitHost = target.querySelector('[data-orbit-portraits]');
  const profile = target.querySelector('[data-orbit-profile]');
  const profileContent = target.querySelector('[data-orbit-profile-content]');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let selectedIndex = Math.max(0, characters.findIndex(c => c.id === 'joker'));
  let rotation = 0;
  let targetRotation = 0;
  let profileOpen = false;
  let width = 1, height = 1;
  const portraitButtons = [];
  const orbitItems = [];
  let renderer, scene, camera, ringGroup, animationFrame;
  const pointer = new THREE.Vector2();
  const clock = new THREE.Clock();

  const rendererFallback = () => {
    canvasHost.classList.add('p5r-three-fallback');
    canvasHost.innerHTML = '<div class="p5r-fallback-orbit"></div>';
  };

  try {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
    camera.position.set(0, 0, 12.5);
    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'low-power' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.7));
    renderer.setClearColor(0x000000, 0);
    canvasHost.appendChild(renderer.domElement);

    ringGroup = new THREE.Group();
    scene.add(ringGroup);
    const ringMaterial = new THREE.MeshBasicMaterial({ color: RED, transparent: true, opacity: 0.55, side: THREE.DoubleSide });
    const ring = new THREE.Mesh(new THREE.TorusGeometry(4.15, 0.012, 8, 160), ringMaterial);
    ring.rotation.x = -0.2;
    ringGroup.add(ring);
    const innerRing = new THREE.Mesh(new THREE.TorusGeometry(3.35, 0.006, 6, 128), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.2 }));
    innerRing.rotation.x = 0.25;
    ringGroup.add(innerRing);

    const particleCount = 220;
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 3.4 + Math.random() * 2.6;
      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 5.8;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 3.5;
    }
    const particleGeometry = new THREE.BufferGeometry();
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    scene.add(new THREE.Points(particleGeometry, new THREE.PointsMaterial({ color: 0xffffff, size: 0.025, transparent: true, opacity: 0.7 })));

    const halo = new THREE.Mesh(new THREE.RingGeometry(1.35, 1.39, 72), new THREE.MeshBasicMaterial({ color: RED, transparent: true, opacity: 0.45, side: THREE.DoubleSide }));
    halo.position.z = -0.4;
    scene.add(halo);
  } catch (error) {
    rendererFallback();
  }

  characters.forEach((character, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'p5r-orbit-portrait';
    button.setAttribute('aria-label', 'Select ' + (character.realName || character.name));
    button.innerHTML = '<span class="p5r-portrait-frame"><img loading="' + (index < 4 ? 'eager' : 'lazy') + '" decoding="async" src="' + (character.image || character.profileImage || '') + '" alt=""></span><span class="p5r-portrait-number">' + String(index + 1).padStart(2, '0') + '</span>';
    button.addEventListener('click', () => {
      if (index === selectedIndex) {
        openProfile();
      } else {
        selectCharacter(index);
      }
    });
    portraitHost.appendChild(button);
    portraitButtons.push(button);
    const angle = (Math.PI * 2 * index) / characters.length;
    orbitItems.push({ angle, position: new THREE.Vector3(), projected: new THREE.Vector3() });
  });

  function setProfileContent(character) {
    const personaHref = character.personaId ? '../personas/' + encodeURIComponent(character.personaId) + '.html' : '';
    const portrait = character.profileImage || character.image || '';
    profileContent.innerHTML = `
      <div class="p5r-profile-art"><img src="${portrait}" alt="${safeText(character.realName || character.name)}"></div>
      <div class="p5r-profile-copy"><p class="eyebrow">PERSONA USER FILE / ${safeText(character.arcana)}</p><h2>${safeText(character.realName || character.name)}</h2><p class="p5r-profile-code">CODENAME: <strong>${safeText(character.codename || character.name)}</strong></p>
      <div class="p5r-profile-stats"><div><small>AGE</small><strong>${safeText(character.age)}</strong></div><div><small>ROLE</small><strong>${safeText(character.role)}</strong></div><div><small>BIRTHDAY</small><strong>${safeText(character.birthday)}</strong></div><div><small>AFFILIATION</small><strong>${safeText(character.affiliation)}</strong></div></div>
      <section><h3>Biography</h3><p>${safeText(character.bio)}</p></section>
      ${personaHref ? '<section><h3>Persona</h3><a href="' + personaHref + '">' + safeText(character.personaName) + ' ↗</a><p>' + safeText(character.personaRole) + '</p></section>' : ''}
      </div>`;
  }

  function selectCharacter(index, instant = false) {
    selectedIndex = (index + characters.length) % characters.length;
    const item = orbitItems[selectedIndex];
    const desired = -item.angle;
    targetRotation = desired;
    if (instant || reducedMotion) rotation = targetRotation;
    portraitButtons.forEach((button, i) => {
      button.classList.toggle('is-selected', i === selectedIndex);
      button.setAttribute('aria-pressed', String(i === selectedIndex));
    });
    const character = characters[selectedIndex];
    target.querySelector('[data-orbit-current]').textContent = String(selectedIndex + 1).padStart(2, '0');
    target.querySelector('[data-orbit-arcana]').textContent = (character.arcana || 'PERSONA USER').toUpperCase() + ' ARCANA';
    target.querySelector('[data-orbit-name]').textContent = (character.codename || character.name).toUpperCase();
    target.querySelector('[data-orbit-codename]').textContent = 'CODENAME: ' + (character.codename || character.name).toUpperCase();
    if (profileOpen) setProfileContent(character);
  }

  function openProfile() {
    if (profileOpen) return;
    profileOpen = true;
    setProfileContent(characters[selectedIndex]);
    stage.classList.add('is-profile-open');
    profile.classList.add('is-visible');
    profile.setAttribute('aria-hidden', 'false');
    target.querySelector('[data-orbit-confirm]').textContent = 'PROFILE OPEN';
    target.querySelector('[data-orbit-confirm]').disabled = true;
    target.querySelector('[data-orbit-close]').focus({ preventScroll: true });
  }

  function closeProfile() {
    if (!profileOpen) return;
    profileOpen = false;
    stage.classList.remove('is-profile-open');
    profile.classList.remove('is-visible');
    profile.setAttribute('aria-hidden', 'true');
    target.querySelector('[data-orbit-confirm]').innerHTML = 'OPEN PERSONA FILE <b>↘</b>';
    target.querySelector('[data-orbit-confirm]').disabled = false;
    target.querySelector('[data-orbit-confirm]').focus({ preventScroll: true });
  }

  function resize() {
    const rect = stage.getBoundingClientRect();
    width = Math.max(1, rect.width);
    height = Math.max(1, rect.height);
    if (renderer && camera) {
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.position.z = width < 520 ? 15 : width < 820 ? 13.5 : 12.5;
      camera.updateProjectionMatrix();
    }
  }

  function animate() {
    animationFrame = requestAnimationFrame(animate);
    const delta = Math.min(clock.getDelta(), 0.05);
    if (!reducedMotion) {
      rotation += (targetRotation - rotation) * Math.min(1, delta * 7);
      if (ringGroup) ringGroup.rotation.z += delta * 0.025;
    }
    orbitItems.forEach((item, index) => {
      const angle = item.angle + rotation;
      const x = Math.sin(angle) * (width < 520 ? 2.65 : 3.35);
      const z = Math.cos(angle) * 1.5;
      const y = Math.sin(angle * 2) * 0.18;
      item.position.set(x, y, z);
      item.projected.copy(item.position).project(camera || new THREE.PerspectiveCamera());
      const px = (item.projected.x * 0.5 + 0.5) * width;
      const py = (-item.projected.y * 0.5 + 0.5) * height;
      const depthScale = clamp((item.projected.z + 1) / 2, 0.55, 1.1);
      const isSelected = index === selectedIndex;
      const scale = (isSelected ? 1.12 : 0.82) * depthScale;
      const button = portraitButtons[index];
      button.style.left = px + 'px';
      button.style.top = py + 'px';
      button.style.setProperty('--portrait-scale', String(scale));
      button.style.zIndex = String(Math.round((item.position.z + 2) * 100) + (isSelected ? 1000 : 0));
      button.classList.toggle('is-selected', isSelected);
      button.classList.toggle('is-back', item.position.z < -0.3);
      button.style.opacity = item.position.z < -1.1 && !isSelected ? '0.52' : '1';
    });
    if (renderer && scene && camera) renderer.render(scene, camera);
  }

  function move(direction) {
    if (profileOpen) return;
    selectCharacter(selectedIndex + direction);
  }

  target.querySelector('[data-orbit-prev]').addEventListener('click', () => move(-1));
  target.querySelector('[data-orbit-next]').addEventListener('click', () => move(1));
  target.querySelector('[data-orbit-confirm]').addEventListener('click', openProfile);
  target.querySelector('[data-orbit-close]').addEventListener('click', closeProfile);
  const keyHandler = event => {
    if (!target.isConnected) return;
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    if (event.key === 'Escape' && profileOpen) {
      closeProfile();
      return;
    }
    if (profileOpen) return;
    if (['ArrowLeft', 'a', 'A'].includes(event.key)) {
      event.preventDefault();
      move(-1);
    } else if (['ArrowRight', 'd', 'D'].includes(event.key)) {
      event.preventDefault();
      move(1);
    } else if (event.key === 'Enter' && target.contains(document.activeElement) && document.activeElement.classList.contains('p5r-orbit-portrait')) {
      event.preventDefault();
      openProfile();
    }
  };
  window.addEventListener('keydown', keyHandler);
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(stage);
  resize();
  selectCharacter(selectedIndex, true);
  animate();

  const cleanup = () => {
    cancelAnimationFrame(animationFrame);
    window.removeEventListener('keydown', keyHandler);
    resizeObserver.disconnect();
    renderer?.dispose();
  };
  window.addEventListener('pagehide', cleanup, { once: true });
}
