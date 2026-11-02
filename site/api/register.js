// Course registration endpoint (Vercel serverless function).
// Sends each registration to the owner's private chat through the Telegram bot.
// Required environment variables on Vercel (set by the owner, never in code):
//   TELEGRAM_BOT_TOKEN   the bot token
//   REGISTRATION_CHAT_ID the owner's private chat id with the bot (NOT the public channel)

const clean = (v, max) => String(v == null ? '' : v).replace(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, max);

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'الطريقة غير مسموحة.' });
  }
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chat = process.env.REGISTRATION_CHAT_ID;
  if (!token || !chat) {
    return res.status(503).json({ error: 'التسجيل مو مفعّل للحين. تواصل مع الدعم الفني @R166o.' });
  }

  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch { body = {}; } }
  body = body || {};

  // Honeypot: bots fill the hidden "website" field. Pretend success, send nothing.
  if (clean(body.website, 100)) return res.status(200).json({ ok: true });

  const name = clean(body.name, 80);
  let telegram = clean(body.telegram, 40).replace(/^@/, '');
  const phone = clean(body.phone, 20);
  const level = clean(body.level, 40);
  const note = clean(body.note, 500);

  if (!name || !telegram || !level || body.agree !== true) {
    return res.status(400).json({ error: 'عبّ الاسم ومعرّف التلقرام والمستوى، ووافق على الإقرار.' });
  }
  if (!/^[A-Za-z0-9_]{4,32}$/.test(telegram)) {
    return res.status(400).json({ error: 'معرّف التلقرام غير صحيح.' });
  }

  const when = new Date().toLocaleString('en-US', { timeZone: 'Asia/Riyadh', hour12: true });
  const text = [
    '🆕 طلب تسجيل: دورة OptionLap',
    `الاسم: ${name}`,
    `التلقرام: @${telegram}`,
    phone ? `الجوال: ${phone}` : null,
    `المستوى: ${level}`,
    note ? `الهدف: ${note}` : null,
    `الوقت: ${when} (الرياض)`,
  ].filter(Boolean).join('\n');

  try {
    const r = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chat, text }),
    });
    if (!r.ok) throw new Error('telegram ' + r.status);
    return res.status(200).json({ ok: true });
  } catch (e) {
    return res.status(502).json({ error: 'ما وصل الطلب. جرّب مرة ثانية أو تواصل مع الدعم الفني @R166o.' });
  }
};
