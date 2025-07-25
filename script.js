// Score handling
document.getElementById('btnAPlus').onclick = () => {
  const score = document.getElementById('scoreA');
  score.textContent = parseInt(score.textContent) + 1;
};

document.getElementById('btnAMinus').onclick = () => {
  const score = document.getElementById('scoreA');
  const val = parseInt(score.textContent);
  if (val > 0) score.textContent = val - 1;
};

document.getElementById('btnBPlus').onclick = () => {
  const score = document.getElementById('scoreB');
  score.textContent = parseInt(score.textContent) + 1;
};

document.getElementById('btnBMinus').onclick = () => {
  const score = document.getElementById('scoreB');
  const val = parseInt(score.textContent);
  if (val > 0) score.textContent = val - 1;
};

// Layout toggle
document.getElementById('layoutSwitcher').addEventListener('click', () => {
  const body = document.body;
  const app = document.getElementById('app');
  const isVertical = body.classList.contains('vertical');
  body.classList.toggle('vertical', !isVertical);
  body.classList.toggle('horizontal', isVertical);
  app.classList.toggle('vertical', !isVertical);
  app.classList.toggle('horizontal', isVertical);
});

// Future: Hook up color picker logic here.
