const express = require('express');
const { Client } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const fs = require('fs');
const path = require('path');
const { GoogleSpreadsheet } = require('google-spreadsheet');

// Инициализация клиента WhatsApp
const client = new Client();
client.on('qr', qr => {
    console.log('QR код для сканирования:');
    qrcode.generate(qr, { small: true });
});

client.on('ready', async () => {
    console.log('WhatsApp подключён!');

    const doc = new GoogleSpreadsheet('1JNoOU5zkE_oMmuAbfyUpspasd-b8ZAJvqNQR4pgPvOY'); // Ваш ID таблицы Google
    await doc.useServiceAccountAuth(require('./credentials.json')); // Путь к вашему сервисному аккаунту JSON
    await doc.loadInfo();

    const sheet = doc.sheetsByIndex[0];
    const rows = await sheet.getRows();

    const message = 'Привет! Это автоматическая рассылка.';

    for (const row of rows) {
        // Получение списка групп
        const groupName = row['Названия группы'];  // Замените на название вашей колонки
        const groupId = row['group_id'];  // Замените на соответствующую колонку с ID групп

        // Отправка сообщения в каждую группу
        const group = await client.getChats().find(chat => chat.id._serialized === groupId);
        if (group) {
            await client.sendMessage(group.id._serialized, message);
            console.log(`Сообщение отправлено в группу: ${groupName}`);
        }
    }

    console.log('Рассылка завершена!');
});

client.initialize();

