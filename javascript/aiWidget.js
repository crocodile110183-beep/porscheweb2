// javascript/aiWidget.js
import { consultAI } from './aiService.js';

// Create a floating sidebar chat widget
(function () {
  const style = document.createElement('style');
  style.textContent = `
  .body {    font-family: 'PorscheNext', Arial, sans-serif;}
  .ai-widget { position: fixed; right: 16px; bottom: 16px; z-index: 9999; font-family: sans-serif; }
  .ai-toggle { background:#111;color:#fff;border-radius:999px;padding:10px 14px;cursor:pointer;box-shadow:0 6px 18px rgba(0,0,0,.18); }
  .ai-panel { width:360px; max-width:90vw; height:520px; background:#fff;border:1px solid #ddd;border-radius:12px;box-shadow:0 10px 30px rgba(0,0,0,.2); overflow:hidden; display:flex; flex-direction:column; }
  .ai-header { padding:10px 12px; background:#0b3b5a;color:#fff; font-weight:600; }
  .ai-messages { padding:12px; overflow:auto; flex:1; background:#f8f9fb; }
  .ai-controls { display:flex; gap:8px; padding:8px; border-top:1px solid #eee; }
  .ai-controls textarea { flex:1; padding:8px; border:1px solid #ddd; border-radius:6px; resize:none; }
  .ai-msg { margin:8px 0; padding:8px 10px; border-radius:8px; max-width:86%; }
  .ai-msg.user { background:#0b3b5a; color:#fff; margin-left:auto; }
  .ai-msg.ai { background:#fff; color:#111; border:1px solid #e6eef6; }
  `;
  document.head.appendChild(style);

  const widget = document.createElement('div'); widget.className = 'ai-widget';
  widget.innerHTML = `
    <div id="aiToggle" class="ai-toggle">AI</div>
    <div id="aiPanel" style="display:none;">
      <div class="ai-panel">
        <div class="ai-header">Porsche Consultant</div>
        <div id="aiMessages" class="ai-messages" aria-live="polite"></div>
        <div class="ai-controls">
          <textarea id="aiInput" rows="2" placeholder="Ask about budget/usage/new or used, performance..."></textarea>
          <button id="aiSend">Send</button>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(widget);

  const toggle = document.getElementById('aiToggle');
  const panel = document.getElementById('aiPanel');
  const messagesEl = document.getElementById('aiMessages');
  const input = document.getElementById('aiInput');
  const send = document.getElementById('aiSend');

  function appendMsg(role, text) {
    const d = document.createElement('div'); d.className = 'ai-msg ' + (role === 'user' ? 'user' : 'ai'); d.textContent = text; messagesEl.appendChild(d); messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  toggle.addEventListener('click', () => { if (panel.style.display === 'none') panel.style.display = 'block'; else panel.style.display = 'none'; });

  send.addEventListener('click', async () => {
    const v = input.value.trim(); if (!v) return;
    appendMsg('user', v); input.value = '';
    appendMsg('ai', 'Thinking...');
    try {
      const reply = await consultAI(v);
      const last = messagesEl.querySelector('.ai-msg.ai:last-child');
      if (last) last.textContent = reply;
    } catch (err) {
      const last = messagesEl.querySelector('.ai-msg.ai:last-child');
      if (last) last.textContent = 'Error: ' + (err.message || err);
    }
  });

  input.addEventListener('keydown', (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send.click(); } });

  // optional: prefill with a sample starter
  appendMsg('ai', 'Hi — tell me your budget, whether you want new/used, daily use or track, and I will recommend 2–3 Porsche models.');
})();
