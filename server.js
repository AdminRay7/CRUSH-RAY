require('dotenv').config();

process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});
process.on('uncaughtException', (err) => {
    console.error('❌ Uncaught Exception:', err);
});
process.on('SIGTERM', async () => {
    console.log('Received SIGTERM, shutting down gracefully...');
    if (global.bot) {
        await global.bot.end();
    }
    process.exit(0);
});

const { app, dbPromise } = require('./index');
const { connectToWhatsApp } = require('./whatsappBot');
const PORT = process.env.PORT || 3000;

dbPromise.then(async () => {
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`✅ Server listening on port ${PORT}`);
    });
    
    // Start WhatsApp bot
    await connectToWhatsApp();
    
    if (require('./telegramBot')) {
        console.log('✅ Telegram bot started');
    }
}).catch(err => {
    console.error('❌ Failed to connect to DB, exiting.', err);
    process.exit(1);
});
