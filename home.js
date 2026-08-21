const allProjects = window.PROJECTS || [];
const track = document.querySelector('#cover-track');
const viewport = document.querySelector('#cover-viewport');
const title = document.querySelector('#carousel-title');
const meta = document.querySelector('#carousel-meta');
const count = document.querySelector('#carousel-count');
const filters = [...document.querySelectorAll('[data-filter]')];
const previous = document.querySelector('#carousel-prev');
const next = document.querySelector('#carousel-next');

let visibleProjects = allProjects;
let currentIndex = 0;
let timer;
let isAnimating = false;
let touchStartX = null;

const getRealIndex = (index) => ((index % visibleProjects.length) + visibleProjects.length) % visibleProjects.length;

function setCopy() {
  const project = visibleProjects[getRealIndex(currentIndex)];
  if (!project) return;
  title.textContent = project.title;
  meta.textContent = `${project.category} · ${project.type}`;
  count.textContent = `${String(getRealIndex(currentIndex) + 1).padStart(2, '0')} / ${String(visibleProjects.length).padStart(2, '0')}`;
}

function render() {
  if (!visibleProjects.length) return;
  const repeated = [...visibleProjects, ...visibleProjects, ...visibleProjects];
  track.innerHTML = repeated.map((project, index) => `
    <a class="cover-card" data-cover-index="${index}" href="./project.html?project=${project.slug}" aria-label="查看 ${project.title} 完整项目">
      <img src="${project.cover}" alt="${project.title}项目封面">
      <span class="cover-card-label">${project.title}</span>
      <span class="cover-card-number">${String((index % visibleProjects.length) + 1).padStart(2, '0')}</span>
    </a>`).join('');
  requestAnimationFrame(() => position(false));
}

function position(animated = true) {
  if (!visibleProjects.length) return;
  const cardWidth = Math.max(188, Math.min(380, viewport.clientWidth * (viewport.clientWidth < 700 ? 0.72 : 0.25)));
  const gap = Math.max(14, Math.min(34, viewport.clientWidth * 0.018));
  const step = cardWidth + gap;
  const x = viewport.clientWidth / 2 - (currentIndex * step + cardWidth / 2);
  track.style.setProperty('--cover-width', `${cardWidth}px`);
  track.style.setProperty('--cover-gap', `${gap}px`);
  track.style.transition = animated ? '' : 'none';
  track.style.transform = `translate3d(${x}px, -50%, 0)`;
  [...track.children].forEach((card, index) => {
    const distance = Math.abs(index - currentIndex);
    card.classList.toggle('is-current', distance === 0);
    card.classList.toggle('is-near', distance === 1);
    card.setAttribute('aria-current', distance === 0 ? 'true' : 'false');
  });
  setCopy();
  if (!animated) requestAnimationFrame(() => { track.style.transition = ''; });
}

function normalize() {
  if (currentIndex < visibleProjects.length || currentIndex >= visibleProjects.length * 2) {
    currentIndex = visibleProjects.length + getRealIndex(currentIndex);
    position(false);
  }
}

function go(direction) {
  if (!visibleProjects.length || isAnimating) return;
  isAnimating = true;
  currentIndex += direction;
  position(true);
  window.setTimeout(() => {
    normalize();
    isAnimating = false;
  }, 760);
}

function stopAuto() { window.clearInterval(timer); }
function startAuto() {
  stopAuto();
  timer = window.setInterval(() => go(1), 3300);
}

function chooseFilter(filter) {
  visibleProjects = filter === 'brand'
    ? allProjects.filter((item) => item.category === '品牌与商用 AIGC')
    : filter === 'film'
      ? allProjects.filter((item) => item.category === 'AI 漫剧与视频')
      : allProjects;
  currentIndex = visibleProjects.length + (filter === 'all' ? Math.max(0, visibleProjects.findIndex((item) => item.slug === 'lamp-secret')) : 0);
  filters.forEach((button) => button.classList.toggle('is-active', button.dataset.filter === filter));
  render();
  startAuto();
}

filters.forEach((button) => button.addEventListener('click', () => chooseFilter(button.dataset.filter)));
previous.addEventListener('click', () => { go(-1); startAuto(); });
next.addEventListener('click', () => { go(1); startAuto(); });
viewport.addEventListener('mouseenter', stopAuto);
viewport.addEventListener('mouseleave', startAuto);
viewport.addEventListener('focusin', stopAuto);
viewport.addEventListener('focusout', startAuto);
viewport.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowLeft') { event.preventDefault(); go(-1); startAuto(); }
  if (event.key === 'ArrowRight') { event.preventDefault(); go(1); startAuto(); }
});
viewport.addEventListener('touchstart', (event) => {
  touchStartX = event.changedTouches[0]?.clientX ?? null;
  stopAuto();
}, { passive: true });
viewport.addEventListener('touchend', (event) => {
  const endX = event.changedTouches[0]?.clientX;
  if (touchStartX !== null && typeof endX === 'number') {
    const distance = endX - touchStartX;
    if (Math.abs(distance) > 36) go(distance < 0 ? 1 : -1);
  }
  touchStartX = null;
  startAuto();
}, { passive: true });
window.addEventListener('resize', () => position(false));
document.addEventListener('visibilitychange', () => (document.hidden ? stopAuto() : startAuto()));

chooseFilter('all');
