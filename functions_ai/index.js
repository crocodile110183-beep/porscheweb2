const functions = require('firebase-functions');
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

const OPENAI_KEY = functions.config().openai && functions.config().openai.key;
if (!OPENAI_KEY) console.warn('OpenAI key not set: firebase functions:config:set openai.key="YOUR_KEY"');

app.post('/consult', async (req, res) => {
  try {
    const prompt = req.body?.prompt || '';
    if (!prompt) return res.status(400).json({ error: 'missing prompt' });

    const systemPrompt = `You are an expert Porsche consultant. Ask clarifying questions (budget, use, new/used, performance). Recommend 2-3 Porsche models and explain tradeoffs, maintenance, and give a short buying checklist.`;

    const payload = {
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ],
      max_tokens: 600,
      temperature: 0.9
    };

    const r = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_KEY}`
      },
      body: JSON.stringify(payload)
    });

    if (!r.ok) {
      const txt = await r.text().catch(() => '');
      return res.status(r.status).send(txt);
    }

    const data = await r.json();
    const assistantText = data.choices?.[0]?.message?.content || '';
    return res.json({ reply: assistantText });
  } catch (err) {
    console.error('aiConsult failed', err);
    return res.status(500).json({ error: 'server error' });
  }
});

exports.aiConsult = functions.https.onRequest(app);
