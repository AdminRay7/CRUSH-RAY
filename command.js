const Database = require('./database');

class WhatsAppCommands {
    constructor(sock) {
        this.sock = sock;
        this.db = new Database();
    }
    
    async handleMessage(sender, messageText) {
        const [command, ...args] = messageText.split(' ');
        
        switch(command) {
            case '/broadcast':
                return this.broadcastMessage(args.join(' '));
            case '/save':
                return this.saveToDatabase(sender, args.join(' '));
            case '/get':
                return this.getFromDatabase(sender);
            case '/stats':
                return this.getStats();
            default:
                return this.unknownCommand();
        }
    }
    
    async broadcastMessage(message) {
        const users = await this.db.getAllUsers();
        for (const user of users) {
            await this.sock.sendMessage(user.number, { text: message });
        }
        return `📢 Broadcast sent to ${users.length} users`;
    }
    
    async saveToDatabase(sender, data) {
        await this.db.saveUserData(sender, data);
        return `💾 Data saved successfully!`;
    }
    
    async getFromDatabase(sender) {
        const data = await this.db.getUserData(sender);
        return `📁 Your data: ${data || 'No data found'}`;
    }
    
    async getStats() {
        const userCount = await this.db.getUserCount();
        return `📊 Bot Statistics:\n👥 Total Users: ${userCount}\n⚡ Status: Active`;
    }
    
    unknownCommand() {
        return '❌ Unknown command. Type /help for available commands.';
    }
}

module.exports = WhatsAppCommands;
