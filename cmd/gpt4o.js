const axios = require('axios');

module.exports = {
    name: 'gpt4o',
    async execute(api, event, args) {
        try {
            const query = args.join(' ');
            const uid = event.senderID; // You can modify this UID as needed

            const response = await axios.get(`https://kaiz-apis.gleeze.com/api/gpt-4o?q=${encodeURIComponent(query)}&uid=${uid}`);
            const reply = response.data.response;

            if (reply) {
                api.sendMessage(reply, event.threadID);
            } else {
                api.sendMessage('Gagal mendapatkan respon dari API.', event.threadID);
            }
        } catch (error) {
            console.error('Error:', error);
            api.sendMessage(`Terjadi kesalahan saat mengakses API: ${error}`, event.threadID);
        }
    }
};
