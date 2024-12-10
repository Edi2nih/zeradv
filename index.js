const fs = require("fs");
const login = require("ryuu-fca-api");

// Fungsi untuk membaca file config dan menangani kesalahan
function readConfig() {
    try {
        const configData = fs.readFileSync('config.json');
        return JSON.parse(configData);
    } catch (err) {
        console.error("Terjadi kesalahan saat membaca config.json:", err);
        process.exit(1); // Keluar dari program jika terjadi kesalahan
    }
}

// Load config
const config = readConfig();
const prefix = config.prefix;

// Load commands
let commands = {};
fs.readdirSync('./cmd').forEach(file => {
    if (file.endsWith('.js')) {
        let cmd = require(`./cmd/${file}`);
        commands[cmd.name] = cmd;
    }
});

// Initialize bot
login({appState: JSON.parse(fs.readFileSync('appstate.json', 'utf8'))}, (err, api) => {
    if(err) return console.error(err);
    api.setOptions({listenEvents: true});

    var stopListening = api.listenMqtt((err, event) => {
        if(err) return console.error(err);
        api.markAsRead(event.threadID, (err) => { if(err) console.error(err); });

        switch(event.type) {
            case "message":
                if(event.body.startsWith(prefix)) {
                    const commandBody = event.body.slice(prefix.length).trim();
                    const args = commandBody.split(/ +/);
                    const command = args.shift().toLowerCase();

                    if (commands[command]) {
                        try {
                            commands[command].execute(api, event, args);
                        } catch (err) {
                            console.error(`Terjadi kesalahan saat menjalankan perintah ${command}:`, err);
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