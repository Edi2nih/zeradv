const axios = require('axios');

module.exports = {
    name: 'gpt4o',
    execute(api, event) {
        const query = event.body;
        const uid = event.senderID;

        // Panggil API
        axios.get(`https://kaiz-apis.gleeze.com/api/gpt-4o-pro?q=${encodeURIComponent(query)}&uid=${uid}`)
            .then(response => {
                api.sendMessage(response.data.response, event.threadID);
            })
            .catch(error => {
                console.error(error);
                api.sendMessage('Terjadi kesalahan saat memproses permintaan Anda.', event.threadID);
            });
    }
};