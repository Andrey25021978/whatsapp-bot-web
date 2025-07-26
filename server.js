const express = require('express');
const qrcode = require('qrcode-terminal');
const { Client, LocalAuth } = require('whatsapp-web.js');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));

app.get('/start', async (req, res) => {
  const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: { headless: true, args: ['--no-sandbox'] }
  });

  client.on('qr', qr => {
  console.log('\n\nСканируйте этот QR‑код (ASCII):\n');
  qrcode.generate(qr, { small: true });
  console.log('\n');
});
  client.on('ready', async () => {
    console.log('✅ Бот готов, начинаем рассылку...');
    const chats = await client.getChats();
    const groups = chats.filter(c => c.isGroup);
    for (let g of groups) {
      await client.sendMessage(g.id._serialized, 'Привет! Авторассылка.');
      console.log(`Отправлено в ${g.name}`);
    }
    res.send('Рассылка запущена');
  });

  client.initialize();
  res.send('Бот запускается — смотри логи сервера');
});

app.listen(port, () => {
  console.log(`Сервер запущен на порту ${port}`);
});
