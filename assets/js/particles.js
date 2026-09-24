(() => {
  'use strict';
  const root = document.getElementById('up2');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const coarse = matchMedia('(pointer: coarse)');
  const layer = document.createElement('div');
  layer.className = 'page-particles';
  layer.setAttribute('aria-hidden', 'true');
  root.prepend(layer);
  const toggle = root.querySelector('#page-field-toggle'),
    status = root.querySelector('#field-status');
  let active = false,
    attract = false,
    raf = 0,
    last = 0,
    width = 0,
    height = 0,
    inView = true,
    sensorTimer = 0,
    permissionPending = false,
    requestVersion = 0;
  const pointer = { x: -9000, y: -9000 };
  let gravity = { x: 0, y: 0 },
    gotSensor = false,
    dots = [];
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  function dimensions() {
    width = root.clientWidth;
    height = root.scrollHeight;
    if (!active) return;
    const count = clamp(Math.round((width * height) / 5500), 200, 1400);
    while (dots.length < count) {
      const el = document.createElement('span');
      el.className = 'page-particle';
      const r = Math.random();
      el.style.width = el.style.height = 1.4 + r * 1.8 + 'px';
      el.style.opacity = String(0.15 + Math.random() * 0.2);
      layer.appendChild(el);
      const nx = Math.random(),
        ny = Math.random();
      dots.push({
        el,
        nx,
        ny,
        x: nx * width,
        y: ny * height,
        ox: nx * width,
        oy: ny * height,
        vx: 0,
        vy: 0,
      });
    }
    while (dots.length > count) {
      dots.pop().el.remove();
    }
    for (const d of dots) {
      d.ox = d.nx * width;
      d.oy = d.ny * height;
      d.x = clamp(d.x, 0, width - 4);
      d.y = clamp(d.y, 0, height - 4);
      d.el.style.transform = 'translate(' + d.x + 'px,' + d.y + 'px)';
    }
  }
  new ResizeObserver(dimensions).observe(root);
  dimensions();
  function orientation(e) {
    if (!active || !Number.isFinite(e.gamma) || !Number.isFinite(e.beta)) return;
    if (!gotSensor) status.textContent = 'Tilt enabled. Particles drift slowly with your phone.';
    gotSensor = true;
    const angle = ((screen.orientation?.angle || 0) * Math.PI) / 180;
    const gx = Math.sin((e.gamma * Math.PI) / 180) * Math.cos((e.beta * Math.PI) / 180),
      gy = Math.sin((e.beta * Math.PI) / 180);
    gravity.x = clamp(gx * Math.cos(angle) + gy * Math.sin(angle), -1, 1);
    gravity.y = clamp(gy * Math.cos(angle) - gx * Math.sin(angle), -1, 1);
  }
  function draw(now) {
    if (!active || !inView || document.hidden) {
      raf = 0;
      return;
    }
    const dt = clamp((now - last) / 1000 || 0.016, 0, 0.04);
    last = now;
    const touch = coarse.matches;
    for (const d of dots) {
      if (touch && gotSensor) {
        d.vx += (gravity.x * 9 - d.vx * 0.95) * dt;
        d.vy += (gravity.y * 9 - d.vy * 0.95) * dt;
        d.x += clamp(d.vx, -7, 7) * dt;
        d.y += clamp(d.vy, -7, 7) * dt;
      } else {
        let dx = d.x - pointer.x,
          dy = d.y - pointer.y,
          dist = Math.max(4, Math.hypot(dx, dy)),
          force = Math.max(0, 1 - dist / 145) * 180 * (attract ? -1 : 1);
        d.vx += ((d.ox - d.x) * 10 + (dx / dist) * force - d.vx * 7) * dt;
        d.vy += ((d.oy - d.y) * 10 + (dy / dist) * force - d.vy * 7) * dt;
        d.x += d.vx * dt;
        d.y += d.vy * dt;
      }
      if (d.x < 0 || d.x > width - 4) {
        d.vx = 0;
        d.x = clamp(d.x, 0, width - 4);
      }
      if (d.y < 0 || d.y > height - 4) {
        d.vy = 0;
        d.y = clamp(d.y, 0, height - 4);
      }
      d.el.style.transform = 'translate(' + d.x.toFixed(2) + 'px,' + d.y.toFixed(2) + 'px)';
    }
    raf = requestAnimationFrame(draw);
  }
  function start() {
    if (active && inView && !document.hidden && !raf) {
      last = performance.now();
      raf = requestAnimationFrame(draw);
    }
  }
  function stop() {
    requestVersion++;
    active = false;
    permissionPending = false;
    root.dataset.field = 'false';
    toggle.setAttribute('aria-pressed', 'false');
    toggle.setAttribute('aria-label', 'Enable magnetic field');
    toggle.querySelector('span:last-child').textContent = 'Field off';
    window.removeEventListener('deviceorientation', orientation);
    clearTimeout(sensorTimer);
    cancelAnimationFrame(raf);
    raf = 0;
    gotSensor = false;
    status.textContent = '';
  }
  toggle.onclick = async () => {
    if (active || permissionPending) {
      stop();
      return;
    }
    if (reduce.matches) {
      status.textContent = 'Motion is disabled by your reduced-motion preference.';
      return;
    }
    active = true;
    dimensions();
    root.dataset.field = 'true';
    toggle.setAttribute('aria-pressed', 'true');
    toggle.setAttribute('aria-label', 'Disable magnetic field');
    toggle.querySelector('span:last-child').textContent = 'Field on';
    start();
    if (!coarse.matches) {
      status.textContent = 'Move to repel. Click empty space to switch attraction.';
      return;
    }
    const version = ++requestVersion;
    status.textContent = 'Checking phone tilt support…';
    try {
      if (!window.isSecureContext || !('DeviceOrientationEvent' in window))
        throw Error('unavailable');
      if (typeof DeviceOrientationEvent.requestPermission === 'function') {
        permissionPending = true;
        const permission = await DeviceOrientationEvent.requestPermission();
        permissionPending = false;
        if (version !== requestVersion || !active) return;
        if (permission !== 'granted') throw Error('denied');
      }
      window.addEventListener('deviceorientation', orientation);
      sensorTimer = setTimeout(() => {
        if (active && !gotSensor)
          status.textContent =
            'Tilt is unavailable in this browser. Touch near particles to move them.';
      }, 1800);
    } catch (e) {
      permissionPending = false;
      if (active)
        status.textContent =
          'Tilt is unavailable or was not allowed. Touch near particles to move them.';
    }
  };
  root.addEventListener(
    'pointermove',
    (e) => {
      if (!active) return;
      const r = root.getBoundingClientRect();
      pointer.x = e.clientX - r.left;
      pointer.y = e.clientY - r.top;
    },
    { passive: true },
  );
  root.addEventListener('pointerleave', () => {
    pointer.x = -9000;
    pointer.y = -9000;
  });
  root.addEventListener('pointerup', (e) => {
    if (e.pointerType === 'touch') {
      pointer.x = -9000;
      pointer.y = -9000;
    }
  });
  root.addEventListener('click', (e) => {
    if (
      !active ||
      coarse.matches ||
      e.target.closest('a,button,input,textarea,select,summary,form')
    )
      return;
    attract = !attract;
    status.textContent = attract
      ? 'Attracting. Click empty space to repel.'
      : 'Repelling. Click empty space to attract.';
  });
  new IntersectionObserver((es) => {
    inView = es[0].isIntersecting;
    if (inView) start();
    else {
      cancelAnimationFrame(raf);
      raf = 0;
    }
  }).observe(root);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      cancelAnimationFrame(raf);
      raf = 0;
    } else start();
  });
  reduce.addEventListener('change', () => {
    if (reduce.matches) stop();
  });
})();
