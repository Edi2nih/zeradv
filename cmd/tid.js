const fs = require("fs");

module.exports = {
    name: 'tid',
    execute(api, event) {
        api.sendMessage(`ThreadID:\n${event.threadID}`, event.threadID);
    }
};