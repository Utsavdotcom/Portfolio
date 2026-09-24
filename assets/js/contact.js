(() => {
  'use strict';
  const $ = (selector) => document.querySelector(selector);
  const form = $('#contact-form-new');
  const submit = $('#contact-send');
  const contactStatus = $('#contact-status');
  let sending = false;
  submit.disabled = false;
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (sending || !form.reportValidity()) return;
    const config = window.PORTFOLIO_CONFIG || {};
    if (!config.contactAccessKey) {
      contactStatus.textContent = `This form is not available yet. Please email ${config.contactEmail || 'poudelutsav65@gmail.com'} instead. Your message has been kept.`;
      return;
    }
    const data = new FormData(form);
    if (data.get('botcheck')) return;
    const name = String(data.get('name') || '').trim();
    const email = String(data.get('email') || '').trim();
    const message = String(data.get('message') || '').trim();
    if (!name || !email || !message) {
      contactStatus.textContent = 'Please complete your name, email, and message.';
      return;
    }
    sending = true;
    submit.disabled = true;
    form.setAttribute('aria-busy', 'true');
    submit.textContent = 'Sending…';
    contactStatus.textContent = 'Sending your message…';
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);
    try {
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          access_key: config.contactAccessKey,
          name,
          email,
          message,
          replyto: email,
          subject: `Portfolio inquiry from ${name.replace(/[\r\n]+/g, ' ').slice(0, 80)} | Utsavdotcom`,
          from_name: 'Utsavdotcom',
          botcheck: false,
        }),
        signal: controller.signal,
      });
      const result = await response.json();
      if (!response.ok || result.success !== true) throw new Error('Submission not accepted');
      contactStatus.textContent = 'Thanks — your message has been sent.';
      const current = new FormData(form);
      if (
        current.get('name') === data.get('name') &&
        current.get('email') === data.get('email') &&
        current.get('message') === data.get('message')
      )
        form.reset();
      else
        contactStatus.textContent =
          'Your original message was sent. Your newer edits have been kept.';
    } catch {
      contactStatus.textContent = `We couldn't confirm delivery. Your message has been kept. You can try again, or email ${config.contactEmail || 'poudelutsav65@gmail.com'}.`;
    } finally {
      clearTimeout(timeout);
      sending = false;
      submit.disabled = false;
      submit.textContent = 'Send message ↗';
      form.removeAttribute('aria-busy');
    }
  });
})();
