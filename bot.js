const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const qrcode = require('qrcode-terminal');
const { Boom } = require('@hapi/boom');

let sock = null;

async function connectToWhatsApp() {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info');
    
    sock = makeWASocket({
        auth: state,
        printQRInTerminal: false,
        browser: ['WhatsApp Bot', 'Chrome', '1.0.0']
    });

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect, qr } = update;
        
        if (qr) {
            console.log('📱 Scan this QR code with WhatsApp:');
            qrcode.generate(qr, { small: true });
        }
        
        if (connection === 'close') {
            const shouldReconnect = (lastDisconnect?.error instanceof Boom)?.output?.statusCode !== DisconnectReason.loggedOut;
            console.log('Connection closed due to:', lastDisconnect?.error);
            if (shouldReconnect) {
                console.log('Reconnecting...');
                connectToWhatsApp();
            }
        } else if (connection === 'open') {
            console.log('✅ WhatsApp bot connected successfully!');
            global.bot = sock;
        }
    });

    sock.ev.on('creds.update', saveCreds);
    
    // Message handler
    sock.ev.on('messages.upsert', async (m) => {
        const msg = m.messages[0];
        if (!msg.message || msg.key.fromMe) return;
        
        const sender = msg.key.remoteJid;
        const messageText = msg.message.conversation || msg.message.extendedTextMessage?.text;
        
        console.log(`📨 Message from ${sender}: ${messageText}`);
        
        // Simple command handler
        if (messageText === '/start' || messageText === '/help') {
            await sock.sendMessage(sender, {
                text: `🤖 *WhatsApp Bot*\n\nCommands:\n/start - Start bot\n/help - Show help\n/time - Current time\n/ping - Check bot status`
            });
        } else if (messageText === '/time') {
            await sock.sendMessage(sender, {
                text: `🕐 Current time: ${new Date().toLocaleString()}`
            });
        } else if (messageText === '/ping') {
            await sock.sendMessage(sender, {
                text: '🏓 Pong! Bot is active'
            });
        }
    });
    
    return sock;
}

module.exports = { connectToWhatsApp };
