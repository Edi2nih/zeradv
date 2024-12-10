const fs = require("fs");

module.exports = {
    name: 'uid',
    execute(api, event) {
        api.sendMessage(`UID Anda:\n${event.senderID}`, event.threadID);
    }
};