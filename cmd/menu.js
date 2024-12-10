const fs = require("fs");
module.exports = {
    name: 'menu',
    execute(api, event) {
        let menuText = "Daftar Perintah:\n";
        fs.readdirSync('./cmd')
            .filter(file => file.endsWith('.js')) // Filter file yang berakhiran .js
            .forEach(file => {
                const commandName = file.replace('.js', ''); // Hapus ekstensi .js
                menuText += `* ${commandName}\n`;
            });

        api.sendMessage(menuText, event.threadID);
    }
};