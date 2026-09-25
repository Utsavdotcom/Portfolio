(() => {
  'use strict';
  const stage = document.getElementById('type-stage');
  const rows = [document.getElementById('type-line-one'), document.getElementById('type-line-two')];
  const hero = document.getElementById('u2-home');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const items = [
    ['UTSAV', 'POUDEL'],
    ['ENGINEERING', ''],
    ['ANALYSIS', ''],
    ['CURIOSITY', ''],
    ['PROBLEM', 'SOLVING'],
  ];
  const accents = [
    [[3], [1]],
    [[5, 6], []],
    [[4], []],
    [[4], []],
    [[2], [1]],
  ];
  const INTERVAL_MS = 3500;
  const TRANSITION_MS = 1180;
  const measure = document.createElement('canvas').getContext('2d');
  if (!measure) return;
  let index = 0,
    paused = reduced.matches,
    busy = false,
    frame = 0;
  let elapsed = 0,
    last = 0,
    visible = true,
    timer = 0,
    ready = hero.dataset.entering !== 'true';

  function characterWidth(character, size) {
    measure.font = `700 ${size}px Arial`;
    return character ? Math.max(0, measure.measureText(character).width - size * 0.055) : 0;
  }
  function makeSlot(character, size, item, row, position) {
    const slot = document.createElement('span');
    slot.className = 'type-slot';
    slot.style.width = `${characterWidth(character, size)}px`;
    slot.style.setProperty('--delay', `${position * 28}ms`);
    const inner = document.createElement('span');
    inner.className = 'type-slot-inner';
    const letter = document.createElement('span');
    letter.className = 'type-char' + (accents[item][row].includes(position) ? ' red-letter' : '');
    letter.textContent = character;
    inner.append(letter);
    slot.append(inner);
    return slot;
  }
  function typeSize(item) {
    const base = Math.min(stage.clientWidth * 0.24, 200);
    measure.font = `700 ${base}px Arial`;
    const spacing = -0.055 * base;
    const longest = Math.max(
      ...items[item].map((text) =>
        Array.from(text).reduce(
          (sum, character) => sum + measure.measureText(character).width + spacing,
          0,
        ),
      ),
    );
    return base * Math.min(1, (stage.clientWidth - 12) / Math.max(1, longest));
  }
  function makeLayer(item, rowIndex) {
    const size = typeSize(item);
    const layer = document.createElement('span');
    layer.className = 'type-layer';
    layer.style.fontSize = `${size}px`;
    layer.append(
      ...Array.from(items[item][rowIndex]).map((character, position) =>
        makeSlot(character, size, item, rowIndex, position),
      ),
    );
    return layer;
  }
  function render() {
    const base = Math.min(stage.clientWidth * 0.24, 200);
    rows.forEach((row) => {
      row.style.fontSize = `${base}px`;
      row.style.height = `${base * 1.03}px`;
    });
    rows.forEach((row, i) => row.replaceChildren(makeLayer(index, i)));
  }
  function advance() {
    if (busy) return;
    index = (index + 1) % items.length;
    elapsed = 0;
    if (reduced.matches) {
      render();
      return;
    }
    busy = true;
    // Separate layers keep outgoing letters at their original size and horizontal positions.
    rows.forEach((row, rowIndex) => {
      row.firstElementChild.classList.add('leaving');
      const incoming = makeLayer(index, rowIndex);
      incoming.classList.add('entering');
      row.append(incoming);
    });
    timer = setTimeout(() => {
      busy = false;
      render();
    }, TRANSITION_MS);
  }
  function tick(now) {
    if (!visible || document.hidden) {
      frame = 0;
      return;
    }
    const delta = Math.min(now - last, 80);
    last = now;
    // Includes the transition, so successive changes start exactly 3.5 seconds apart.
    if (ready && !paused) {
      elapsed += delta;
      if (elapsed >= INTERVAL_MS && !busy) advance();
    }
    frame = requestAnimationFrame(tick);
  }
  function start() {
    if (visible && !document.hidden && !frame) {
      last = performance.now();
      frame = requestAnimationFrame(tick);
    }
  }
  new MutationObserver(() => {
    ready = hero.dataset.entering !== 'true';
    elapsed = 0;
    if (ready) {
      index = 0;
      busy = false;
      clearTimeout(timer);
      render();
    }
  }).observe(hero, { attributes: true, attributeFilter: ['data-entering'] });
  new ResizeObserver(() => {
    if (!busy) render();
  }).observe(stage);
  new IntersectionObserver((entries) => {
    visible = entries[0].isIntersecting;
    if (visible) start();
    else {
      cancelAnimationFrame(frame);
      frame = 0;
    }
  }).observe(stage);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      cancelAnimationFrame(frame);
      frame = 0;
    } else start();
  });
  reduced.addEventListener('change', () => {
    paused = reduced.matches;
    clearTimeout(timer);
    busy = false;
    if (paused) index = 0;
    elapsed = 0;
    render();
  });
  render();
  start();
})();
