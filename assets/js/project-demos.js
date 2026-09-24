(() => {
  'use strict';
  const hip = document.getElementById('hip-dashboard');
  const status = document.getElementById('hip-status');
  let role = 'ems',
    sent = false,
    assigned = false,
    cleaned = false;
  const record = () =>
    `<div class="demo-record"><span class="meta">Incoming / Unit 07</span><h4>Sample handoff</h4><p>ETA 8 minutes · assessment prepared<br>Receiving team: Emergency department</p><span class="demo-badge">${assigned ? 'Bed 04 · Nurse Morgan · Monitor reserved' : sent ? 'Received · awaiting assignment' : 'Draft · not sent'}</span></div>`;
  function renderHip() {
    document
      .querySelectorAll('[data-hip]')
      .forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.hip === role)));
    if (role === 'ems')
      hip.innerHTML =
        record() +
        `<button class="primary" data-action="send" ${sent ? 'disabled' : ''}>${sent ? 'Handoff sent ✓' : 'Send to hospital →'}</button>`;
    if (role === 'charge')
      hip.innerHTML = sent
        ? record() +
          `<button class="primary" data-action="assign" ${assigned ? 'disabled' : ''}>${assigned ? 'Resources assigned ✓' : 'Assign bed, nurse & monitor'}</button><div class="demo-record"><strong>Room 06 / Turnover</strong><p>${cleaned ? 'Alex assigned · cleaning queued' : 'Cleaning team assignment needed'}</p><button class="demo-link" data-action="clean" ${cleaned ? 'disabled' : ''}>${cleaned ? 'Cleaner assigned ✓' : 'Assign Alex to room 06 →'}</button></div>`
        : '<div class="demo-empty"><h4>No incoming handoff yet.</h4><p>Send the sample handoff from the EMS view to begin.</p></div>';
    if (role === 'staff')
      hip.innerHTML = sent
        ? `<div class="demo-record"><span class="meta">Staff nurse dashboard</span><h4>${assigned ? 'Your next arrival / Bed 04' : 'Incoming arrival / ETA 8 min'}</h4><p>${assigned ? 'Morgan assigned. Monitor reserved. EMS handoff available.' : 'Handoff received. Resource assignments pending.'}</p></div><div class="demo-record"><span class="meta">Doctor / Activity</span><ol class="activity"><li>EMS handoff received · ETA shared</li>${assigned ? '<li>Bed 04, nurse and equipment assigned</li>' : ''}${cleaned ? '<li>Room 06 cleaning assigned to Alex</li>' : ''}</ol></div>`
        : '<div class="demo-empty"><h4>The shared board is clear.</h4><p>EMS handoffs and charge nurse assignments will appear here.</p></div>';
  }
  document.querySelectorAll('[data-hip]').forEach((b) =>
    b.addEventListener('click', () => {
      role = b.dataset.hip;
      renderHip();
    }),
  );
  hip.addEventListener('click', (e) => {
    const action = e.target.closest('[data-action]')?.dataset.action;
    if (action === 'send') {
      sent = true;
      status.textContent =
        'Handoff received by the hospital. Open Charge nurse to assign resources.';
    }
    if (action === 'assign') {
      assigned = true;
      status.textContent = 'Assignments shared. Open Care team to see the updated board.';
    }
    if (action === 'clean') {
      cleaned = true;
      status.textContent = 'Alex assigned to room 06. The activity feed has updated.';
    }
    if (action) renderHip();
  });
  renderHip();

  const plexi = document.getElementById('plexi-dashboard');
  const plexiStatus = document.getElementById('plexi-status');
  let side = '',
    offered = false;
  const tasks = [];
  function renderPlexi() {
    if (!side) {
      plexi.innerHTML =
        '<h4 class="demo-question">What brings you here?</h4><p>Find someone for the job, or put your skills to work.</p><div class="role-choices"><button data-role="requester"><strong>I need a hand ↗</strong><span>Post a task and find help.</span></button><button data-role="helper"><strong>I can help ↗</strong><span>Browse tasks and offer your skills.</span></button></div>';
      return;
    }
    plexi.innerHTML = `<div class="dashboard-heading"><h4>${side === 'helper' ? 'Find your next task' : 'Your task board'}</h4><button class="demo-link" data-switch>Switch role ↗</button></div>`;
    if (side === 'helper')
      plexi.innerHTML += `<div class="demo-record"><span class="meta">Home / Topeka</span><h4>Assemble a bookshelf</h4><p>Saturday afternoon · $45 budget</p><button class="primary" data-offer ${offered ? 'disabled' : ''}>${offered ? 'Offer sent ✓' : 'Offer to help →'}</button></div><div class="demo-record"><strong>Your offers / ${offered ? '1 pending' : 'None yet'}</strong><p>${offered ? 'Bookshelf assembly · awaiting a reply' : 'Choose a task to get started.'}</p></div>`;
    else {
      plexi.innerHTML +=
        '<form id="plexi-task-form" class="task-form"><label>What do you need help with?<input name="task" required maxlength="80" placeholder="e.g. Set up my new printer"></label><button class="primary" type="submit">Add sample task →</button></form><div id="plexi-tasks"></div>';
      const list = document.getElementById('plexi-tasks');
      ['Assemble a bookshelf', ...tasks].forEach((title, i) => {
        const card = document.createElement('div');
        card.className = 'demo-record';
        const heading = document.createElement('strong');
        heading.textContent = title;
        const detail = document.createElement('p');
        detail.textContent =
          i === 0 && offered
            ? '1 offer received · Review the helper’s availability'
            : 'Open · awaiting offers';
        card.append(heading, detail);
        list.append(card);
      });
    }
  }
  plexi.addEventListener('click', (e) => {
    const button = e.target.closest('button');
    if (!button) return;
    if (button.dataset.role) {
      side = button.dataset.role;
      plexiStatus.textContent = '';
      renderPlexi();
    }
    if (button.hasAttribute('data-switch')) {
      side = '';
      plexiStatus.textContent = '';
      renderPlexi();
    }
    if (button.hasAttribute('data-offer')) {
      offered = true;
      plexiStatus.textContent =
        'Sample offer sent. Switch to “I need a hand” to see it on the task board.';
      renderPlexi();
    }
  });
  plexi.addEventListener('submit', (e) => {
    e.preventDefault();
    const input = e.target.elements.task;
    const title = input.value.trim();
    if (!title) {
      input.setCustomValidity('Please describe your task.');
      input.reportValidity();
      input.addEventListener('input', () => input.setCustomValidity(''), { once: true });
      return;
    }
    tasks.push(title);
    renderPlexi();
    plexiStatus.textContent = 'Sample task added to your board. Nothing has been published.';
  });
  renderPlexi();
})();
