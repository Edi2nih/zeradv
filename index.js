const fs = require("fs").promises;
const login = require("ryuu-fca-api");

// Fungsi untuk membaca file config dan menangani kesalahan
async function readConfig() {
    try {
        const configData = await fs.readFile('config.json', 'utf8');
        return JSON.parse(configData);
    } catch (err) {
        console.error("Terjadi kesalahan saat membaca config.json:", err);
        process.exit(1);
    }
}

// Fungsi untuk load commands dengan async
async function loadCommands() {
    let commands = {};
    try {
        const files = await fs.readdir('./cmd');
        for (const file of files) {
            if (file.endsWith('.js')) {
                try {
                    let cmd = require(`./cmd/${file}`);
                    commands[cmd.name] = cmd;
                } catch (cmdLoadError) {
                    console.error(`Gagal memuat command dari file ${file}:`, cmdLoadError);
                }
            }
        }
        return commands;
    } catch (err) {
        console.error("Terjadi kesalahan saat membaca direktori commands:", err);
        return {};
    }
}

// Main function async
async function initializeBot() {
    try {
        // Load config
        const config = await readConfig();
        const prefix = config.prefix;

        // Load commands
        let commands = await loadCommands();

        // Tambahkan command prefix
        commands['prefix'] = {
            name: 'prefix',
            execute: function(api, event, args) {
                api.sendMessage(`Prefix:\n${prefix}`, event.threadID);
            }
        };

        // Kata kunci untuk menanyakan prefix
        const prefixKeywords = [
            'prefix',
            'Prefix'
        ];

        // Baca appstate
        const appState = await fs.readFile('appstate.json', 'utf8');

        // Initialize bot
        login({appState: JSON.parse(appState)}, (err, api) => {
            if(err) {
                console.error("Error saat login:", err);
                return;
            }

            api.setOptions({listenEvents: true});

            var stopListening = api.listenMqtt((err, event) => {
                if(err) {
                    console.error("Error saat mendengarkan pesan:", err);
                    return;
                }

                api.markAsRead(event.threadID, (err) => { 
                    if(err) console.error("Gagal menandai pesan sebagai terbaca:", err); 
                });

                switch(event.type) {
                    case "message":
                        // Cek apakah pesan mengandung kata kunci prefix
                        const lowercaseMessage = event.body.toLowerCase();
                        if (prefixKeywords.some(keyword => lowercaseMessage.includes(keyword))) {
                            api.sendMessage(`Prefix:\n${prefix}`, event.threadID);
                        }

                        // Proses command dengan prefix
                        if(event.body.startsWith(prefix)) {
                            const commandBody = event.body.slice(prefix.length).trim();
                            const args = commandBody.split(/ +/);
                            const command = args.shift().toLowerCase();

                            if (commands[command]) {
                                try {
                                    commands[command].execute(api, event, args);
                                } catch (executeErr) {
                                    console.error(`Terjadi kesalahan saat menjalankan perintah ${command}:`, executeErr);
                                    api.sendMessage(`Terjadi kesalahan saat menjalankan perintah.`, event.threadID);
                                }
                            } else {
                                api.sendMessage("Perintah tidak ditemukan!", event.threadID);
                            }
                        }
                        break;

                    case "event":
                        console.log(event);
                        break;
                }
            });
        });

    } catch (mainError) {
        console.error("Terjadi kesalahan utama:", mainError);
    }
}

// Jalankan bot
initializeBot().catch(err => {
    console.error("Error dalam inisialisasi bot:", err);
    process.exit(1);
});