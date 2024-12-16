const axios = require('axios');

module.exports = {
    name: 'tempmail',
    async execute(api, event, args) {
        try {
            // Case generate email
            if (args[0] === 'gen') {
                const response = await axios.get('https://kaiz-apis.gleeze.com/api/tempmail');
                const email = response.data.email;

                if (email) {
                    api.sendMessage(`📧 Email baru dibuat:\n${email}`, event.threadID);
                } else {
                    api.sendMessage('Gagal generate email.', event.threadID);
                }
            }

            // Case inbox
            else if (args[0] === 'inbox') {
                const email = args[1];

                if (!email) {
                    return api.sendMessage('Silakan berikan email untuk dicek inbox.', event.threadID);
                }

                const response = await axios.get(`https://kaiz-apis.gleeze.com/api/tempmail?email=${email}`);

                if (response.data.messages && response.data.messages.length > 0) {
                    let messageText = '📬 Inbox Email:\n\n';
                    response.data.messages.forEach((msg, index) => {
                        messageText += `Pesan ${index + 1}:\n`;
                        messageText += `Dari: ${msg.from}\n`;
                        messageText += `Subjek: ${msg.subject}\n`;
                        messageText += `Isi: ${msg.body}\n\n`;
                    });

                    api.sendMessage(messageText, event.threadID);
                } else {
                    api.sendMessage('Tidak ada pesan di inbox.', event.threadID);
                }
            }

            // Jika argumen tidak sesuai
            else {
                api.sendMessage('Gunakan /tempmail gen atau /tempmail inbox (email)', event.threadID);
            }
        } catch (error) {
            console.error('Error:', error);
            api.sendMessage(`Terjadi kesalahan saat mengakses API: ${error}`, event.threadID);
        }
    }
};
