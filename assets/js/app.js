(() => {
  'use strict';
  const root = document.getElementById('up2');
  const $ = (selector) => root.querySelector(selector);
  const all = (selector) => [...root.querySelectorAll(selector)];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');

  const themeButton = $('#u2-theme');
  function currentTheme() {
    return (
      document.documentElement.dataset.theme ||
      (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
    );
  }
  function themeLabel() {
    themeButton.setAttribute(
      'aria-label',
      `Switch to ${currentTheme() === 'dark' ? 'light' : 'dark'} mode`,
    );
  }
  themeButton.addEventListener('click', () => {
    const theme = currentTheme() === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem('utsav-theme', theme);
    } catch {
      /* Storage may be unavailable. */
    }
    themeLabel();
  });
  matchMedia('(prefers-color-scheme: dark)').addEventListener('change', themeLabel);
  themeLabel();
  document.getElementById('copyright-year').textContent = new Date().getFullYear();

  // The entrance plays once per browser tab; it can always be replayed explicitly.
  const door = $('#welcome-door');
  const greeting = [$('#greeting-first'), $('#greeting-second')];
  const greetingCopy = ["Hello, I'm Utsav.", 'Make yourself at home.'];
  const replay = $('#replay-welcome');
  let entranceFrame = 0;
  let entranceStart = 0;
  function finishEntrance() {
    cancelAnimationFrame(entranceFrame);
    door.className = 'doorway';
    greeting.forEach((line, i) => {
      line.textContent = greetingCopy[i];
    });
    replay.disabled = false;
  }
  function animateEntrance(now) {
    const elapsed = now - entranceStart;
    if (elapsed > 200) door.classList.add('is-opening');
    if (elapsed > 1500) door.className = 'doorway';
    const count = Math.max(0, Math.floor((elapsed - 900) / 38));
    greeting[0].textContent = greetingCopy[0].slice(0, count);
    greeting[1].textContent = greetingCopy[1].slice(
      0,
      Math.max(0, count - greetingCopy[0].length - 6),
    );
    if (count > greetingCopy.join('').length + 6) return finishEntrance();
    entranceFrame = requestAnimationFrame(animateEntrance);
  }
  function playEntrance() {
    cancelAnimationFrame(entranceFrame);
    if (reduced.matches) return finishEntrance();
    greeting.forEach((line) => {
      line.textContent = '';
    });
    replay.disabled = true;
    door.className = 'doorway is-closed no-transition';
    void door.offsetWidth;
    door.classList.remove('no-transition');
    entranceStart = performance.now();
    entranceFrame = requestAnimationFrame(animateEntrance);
  }
  replay.addEventListener('click', playEntrance);
  let visited = false;
  try {
    visited = sessionStorage.getItem('utsav-visited') === 'true';
  } catch {}
  if (!visited) {
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting) return;
        observer.disconnect();
        try {
          sessionStorage.setItem('utsav-visited', 'true');
        } catch {}
        playEntrance();
      },
      { threshold: 0.15 },
    );
    observer.observe($('#u2-home'));
  }
  reduced.addEventListener('change', () => {
    if (reduced.matches) finishEntrance();
  });

  // Isolated illustrative auction; nothing here calls or changes the actual project.
  let auctionState = 'live';
  let price = 240;
  let bids = 3;
  function renderAuction() {
    all('[data-stage]').forEach((button) =>
      button.setAttribute('aria-pressed', String(button.dataset.stage === auctionState)),
    );
    $('#u2-auction-state').textContent = {
      live: 'Auction live',
      before: 'Not yet open',
      closed: 'Auction closed',
    }[auctionState];
    $('#u2-price').textContent = `$${price.toLocaleString('en-US')}`;
    $('#u2-bids').textContent = `${bids} bids`;
  }
  all('[data-stage]').forEach((button) =>
    button.addEventListener('click', () => {
      auctionState = button.dataset.stage;
      renderAuction();
      $('#u2-feedback').dataset.error = 'false';
      $('#u2-feedback').textContent = {
        live: 'Bidding is open. Offers must exceed the current bid.',
        before: 'Bidding has not opened. Try submitting an offer.',
        closed: 'Bidding is closed. Try submitting an offer.',
      }[auctionState];
    }),
  );
  const bidForm = $('#u2-bidform');
  bidForm.querySelector('button').type = 'submit';
  bidForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const value = Number($('#u2-amount').value);
    let message;
    let error = true;
    if (auctionState !== 'live')
      message =
        auctionState === 'before'
          ? 'Not accepted: the auction has not opened.'
          : 'Not accepted: the auction has ended.';
    else if (!Number.isSafeInteger(value) || value <= price)
      message = `Not accepted: enter a whole-dollar bid higher than $${price}.`;
    else {
      price = value;
      bids += 1;
      error = false;
      message = `Accepted. Your $${value} offer is now the highest bid.`;
    }
    renderAuction();
    $('#u2-feedback').textContent = message;
    $('#u2-feedback').dataset.error = String(error);
  });
  let panel = 0;
  let cutaway = false;
  let illuminated = true;
  const portrait = $('#u2-litho-photo');
  const photos = [
    portrait.getAttribute('href'),
    $('.about img').getAttribute('src'),
    'assets/images/carousel-1.jpeg',
    'assets/images/carousel-2.jpeg',
  ];
  function renderDevice() {
    const selected = ((panel % 4) + 4) % 4;
    $('#u2-tft').textContent = `PHOTO 0${selected + 1} OF 04`;
    $('#u2-rotor').setAttribute('transform', `rotate(${-panel * 90})`);
    portrait.setAttribute('href', photos[selected % photos.length]);
    portrait.setAttribute('opacity', illuminated ? '.9' : '.24');
    $('#u2-shell').setAttribute('visibility', cutaway ? 'hidden' : 'visible');
    $('#u2-inside').setAttribute('visibility', cutaway ? 'visible' : 'hidden');
    $('#u2-cutaway').textContent = cutaway ? 'Close cutaway' : 'View inside';
    $('#u2-cutaway').setAttribute('aria-pressed', String(cutaway));
    $('#u2-lamp').textContent = illuminated ? 'Light on' : 'Light off';
    $('#u2-lamp').setAttribute('aria-pressed', String(illuminated));
    $('#u2-hardware-status').textContent =
      `Panel ${selected + 1} of 4 · ${cutaway ? 'Curved panels inside the stationary enclosure' : 'Illustrative proportions, sample photos and screen UI'}`;
  }
  $('#u2-prev').addEventListener('click', () => {
    panel -= 1;
    renderDevice();
  });
  $('#u2-next').addEventListener('click', () => {
    panel += 1;
    renderDevice();
  });
  $('#u2-cutaway').addEventListener('click', () => {
    cutaway = !cutaway;
    renderDevice();
  });
  $('#u2-lamp').addEventListener('click', () => {
    illuminated = !illuminated;
    renderDevice();
  });
})();
