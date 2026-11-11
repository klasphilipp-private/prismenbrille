const stage = document.querySelector('#stage');
const glasses = document.querySelector('#glasses');
const lenses = [...glasses.querySelectorAll('.lens')];
const sceneView = document.querySelector('#scene-view');
const visionOptions = [...document.querySelectorAll('input[name="vision"]')];
const focusButton = document.querySelector('#focus-view');
const lensButton = document.querySelector('#lens-view');
const resetButton = document.querySelector('#reset');
const dragHelp = document.querySelector('#drag-help');
const description = document.querySelector('#vision-description');
const mode = document.querySelector('#mode');
const sceneButtons = [...document.querySelectorAll('.scene')];
const sceneName = document.querySelector('#scene-name');
const titles = {road: 'Straße bei Dämmerung', forest: 'Weg durch den Herbstwald', desk: 'Blick auf den Bildschirm'};
const visionCopy = {
  bare: ['Unscharf mit Doppelbild', 'Die Bildmitte ist etwas deutlicher. Zum Rand hin werden die Konturen weicher und stärker versetzt.'],
  normal: ['Scharf mit leichtem Doppelbild', 'Die Konturen sind scharf, liegen aber leicht versetzt. Mit „Stark konzentrieren“ sehen Sie, wie sich die Bilder bei starker Konzentration annähern können.'],
  prism: ['Scharfes Einzelbild', 'Die Konturen liegen übereinander. Das Bild ist klar und ohne sichtbare Doppelkonturen.']
};
let vision = 'bare';
let showLenses = true;
let focused = false;
let position = {x: .5, y: .5};
let drag;

function place(x, y) {
  if (glasses.hidden) return;
  const bounds = stage.getBoundingClientRect();
  const horizontalMargin = (glasses.offsetWidth / 2 + 5) / bounds.width;
  const verticalMargin = (glasses.offsetHeight / 2 + 5) / bounds.height;
  position = {
    x: Math.max(horizontalMargin, Math.min(1 - horizontalMargin, x)),
    y: Math.max(verticalMargin, Math.min(1 - verticalMargin, y))
  };
  glasses.style.setProperty('--x', position.x * 100 + '%');
  glasses.style.setProperty('--y', position.y * 100 + '%');
  glasses.style.setProperty('--sw', bounds.width + 'px');
  glasses.style.setProperty('--sh', bounds.height + 'px');
  for (const lens of lenses) {
    const rect = lens.getBoundingClientRect();
    lens.style.setProperty('--lx', bounds.left - rect.left - lens.clientLeft + 'px');
    lens.style.setProperty('--ly', bounds.top - rect.top - lens.clientTop + 'px');
  }
}

glasses.addEventListener('pointerdown', event => {
  if (event.button !== 0 || drag) return;
  const bounds = stage.getBoundingClientRect();
  drag = {id: event.pointerId, x: event.clientX - bounds.left - position.x * bounds.width,
    y: event.clientY - bounds.top - position.y * bounds.height};
  glasses.setPointerCapture(event.pointerId);
  glasses.classList.add('dragging');
});

glasses.addEventListener('pointermove', event => {
  if (drag?.id !== event.pointerId) return;
  const bounds = stage.getBoundingClientRect();
  place((event.clientX - bounds.left - drag.x) / bounds.width,
    (event.clientY - bounds.top - drag.y) / bounds.height);
});

glasses.addEventListener('lostpointercapture', () => {
  drag = undefined;
  glasses.classList.remove('dragging');
});

glasses.addEventListener('keydown', event => {
  const direction = {ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1]}[event.key];
  if (!direction) return;
  event.preventDefault();
  place(position.x + direction[0] * 12 / stage.clientWidth,
    position.y + direction[1] * 12 / stage.clientHeight);
});

function renderVision() {
  stage.dataset.vision = vision;
  glasses.dataset.vision = vision;
  sceneView.dataset.vision = showLenses ? 'bare' : vision;
  stage.classList.toggle('focused-view', focused);
  glasses.hidden = !showLenses;
  focusButton.hidden = vision !== 'normal';
  focusButton.setAttribute('aria-pressed', String(focused));
  lensButton.setAttribute('aria-pressed', String(showLenses));
  lensButton.textContent = showLenses ? 'Brille ausblenden' : 'Brille einblenden';
  resetButton.hidden = !showLenses;
  dragHelp.hidden = !showLenses;
  const [label, detail] = visionCopy[vision];
  mode.textContent = focused ? 'Doppelbild angenähert' : label;
  description.textContent = detail;
  dragHelp.textContent = vision === 'bare'
    ? 'Ziehen Sie die Brille oder bewegen Sie sie mit den Pfeiltasten.'
    : 'Die Korrektur ist in den Gläsern sichtbar. Ziehen Sie die Brille oder bewegen Sie sie mit den Pfeiltasten.';
  place(position.x, position.y);
}

for (const option of visionOptions) {
  option.addEventListener('change', () => {
    vision = option.value;
    focused = false;
    renderVision();
  });
}

focusButton.addEventListener('click', () => {
  focused = !focused;
  renderVision();
});

lensButton.addEventListener('click', () => {
  showLenses = !showLenses;
  renderVision();
});

for (const button of sceneButtons) {
  button.addEventListener('click', () => {
    stage.dataset.scene = button.dataset.scene;
    sceneName.textContent = titles[button.dataset.scene];
    for (const scene of sceneButtons) scene.setAttribute('aria-pressed', String(scene === button));
  });
}
resetButton.addEventListener('click', () => place(.5, .5));
new ResizeObserver(() => place(position.x, position.y)).observe(stage);
renderVision();
