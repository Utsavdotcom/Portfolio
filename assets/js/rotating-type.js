(() => {
  'use strict';
  const stage = document.getElementById('type-stage');
  const rows = [document.getElementById('type-line-one'), document.getElementById('type-line-two')];
  const replay = document.getElementById('replay-welcome');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const items = [
    ['UTSAV', 'POUDEL'],
    ['ENGINEERING', ''],
    ['ANALYSIS', ''],
    ['CURIOSITY', ''],
    ['PROBLEM', 'SOLVING'],
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
    ready = !replay.disabled;

  function characterWidth(character, row) {
    const style = getComputedStyle(row);
    measure.font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
    return character
      ? Math.max(0, measure.measureText(character).width + parseFloat(style.letterSpacing || 0))
      : 0;
  }
  function makeSlot(character, row) {
    const slot = document.createElement('span');
    slot.className = 'type-slot';
    slot.style.width = `${characterWidth(character, row)}px`;
    const inner = document.createElement('span');
    inner.className = 'type-slot-inner';
    const letter = document.createElement('span');
    letter.className = 'type-char current';
    letter.textContent = character;
    inner.append(letter);
    slot.append(inner);
    return slot;
  }
  function sizeType() {
    const base = Math.min(stage.clientWidth * 0.24, 200);
    measure.font = `700 ${base}px Arial`;
    const spacing = -0.055 * base;
    const longest = Math.max(
      ...items[index].map((text) =>
        Array.from(text).reduce(
          (sum, character) => sum + measure.measureText(character).width + spacing,
          0,
        ),
      ),
    );
    const size = base * Math.min(1, (stage.clientWidth - 12) / Math.max(1, longest));
    rows.forEach((row) => {
      row.style.fontSize = `${size}px`;
      row.style.height = `${base * 1.03}px`;
    });
  }
  function render() {
    sizeType();
    rows.forEach((row, i) =>
      row.replaceChildren(
        ...Array.from(items[index][i]).map((character) => makeSlot(character, row)),
      ),
    );
  }
  function advance() {
    if (busy) return;
    const oldIndex = index;
    index = (index + 1) % items.length;
    elapsed = 0;
    if (reduced.matches) {
      render();
      return;
    }
    busy = true;
    sizeType();
    rows.forEach((row, rowIndex) => {
      const source = Array.from(items[oldIndex][rowIndex]);
      const destination = Array.from(items[index][rowIndex]);
      const count = Math.max(source.length, destination.length);
      for (let i = 0; i < count; i++) {
        let slot = row.children[i];
        if (!slot) {
          slot = makeSlot('', row);
          row.append(slot);
        }
        const incoming = document.createElement('span');
        incoming.className = 'type-char next';
        incoming.textContent = destination[i] || '';
        slot.querySelector('.type-slot-inner').append(incoming);
        slot.style.setProperty('--delay', `${i * 28 + rowIndex * 55}ms`);
        slot.style.width = `${characterWidth(destination[i] || '', row)}px`;
        slot.classList.add('turning');
      }
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
    ready = !replay.disabled;
    elapsed = 0;
    if (ready) {
      index = 0;
      busy = false;
      clearTimeout(timer);
      render();
    }
  }).observe(replay, { attributes: true, attributeFilter: ['disabled'] });
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
