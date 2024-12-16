const axios = require('axios');
const fs = require('fs');
const path = require('path');

module.exports = {
    name: 'ss',
    async execute(api, event, args) {
        try {
            const url = args[0];
            if (!url) {
                return api.sendMessage('Silakan berikan URL untuk mengambil screenshot.', event.threadID);
            }

            const response = await axios.get(`https://kaiz-apis.gleeze.com/api/screenshot?url=${encodeURIComponent(url)}`, {
                responseType: 'arraybuffer'
            });

            const imageBuffer = Buffer.from(response.data, 'binary');
            const imagePath = path.join(__dirname, 'screenshot.png');

            fs.writeFileSync(imagePath, imageBuffer);

            api.sendMessage({
                body: "Here's your screenshot:",
                attachment: fs.createReadStream(imagePath)
            }, event.threadID, (err) => {
                if (err) {
                    console.error('Error:', err);
                    api.sendMessage('Failed to send the screenshot.', event.threadID);
                }
                fs.unlinkSync(imagePath); // Remove the file after sending the message
            });

        } catch (error) {
            console.error('Error:', error);
            api.sendMessage(`Terjadi kesalahan saat mengakses API: ${error}`, event.threadID);
        }
    }
};
