module.exports = {
    name: 'echo',
    execute(api, event, args) {
        // Gabungkan semua argumen menjadi satu string
        const message = args.join(" ");
        // Kirim pesan yang digabungkan tanpa prefix
        api.sendMessage(message, event.threadID);
    }
};