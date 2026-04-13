const { REST, Routes } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');
require('dotenv').config({ path: '../.env' });

const commands = [];
const commandNames = new Set();
const foldersPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(foldersPath);

for (const item of commandFiles) {
    const itemPath = path.join(foldersPath, item);
    const stat = fs.statSync(itemPath);

    if (stat.isDirectory()) {
        const subFiles = fs.readdirSync(itemPath).filter(file => file.endsWith('.js'));
        for (const file of subFiles) {
            const filePath = path.join(itemPath, file);
            const command = require(filePath);
            if ('data' in command && 'execute' in command) {
                if (!commandNames.has(command.data.name)) {
                    commands.push(command.data.toJSON());
                    commandNames.add(command.data.name);
                }
            }
        }
    } else if (item.endsWith('.js')) {
        const command = require(itemPath);
        if ('data' in command && 'execute' in command) {
            if (!commandNames.has(command.data.name)) {
                commands.push(command.data.toJSON());
                commandNames.add(command.data.name);
            }
        }
    }
}

const rest = new REST().setToken(process.env.DISCORD_TOKEN);

(async () => {
	try {
		console.log(`正在注册 ${commands.length} 个团团巅峰指令... 🐼`);

		const data = await rest.put(
			Routes.applicationCommands(process.env.CLIENT_ID || '1481640516931031050'),
			{ body: commands },
		);

		console.log(`✅ 成功激活！现在您可以在 Discord 输入 / 看到所有指令啦！🚀`);
	} catch (error) {
		console.error('❌ 注册失败:', error);
	}
})();
