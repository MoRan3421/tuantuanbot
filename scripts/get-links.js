require('dotenv').config();
const chalk = require('chalk');

const CLIENT_ID = process.env.CLIENT_ID || '未设置';
const PROJECT_ID = process.env.FIREBASE_PROJECT_ID || '未设置';

console.log(chalk.cyan('\n----------------------------------------'));
console.log(chalk.bold.magenta('🐼 TuanTuan Supreme 链接中心'));
console.log(chalk.cyan('----------------------------------------\n'));

console.log(chalk.yellow('🤖 机器人邀请链接 (至尊管理员权限):'));
console.log(chalk.green(`https://discord.com/api/oauth2/authorize?client_id=${CLIENT_ID}&permissions=8&scope=bot%20applications.commands\n`));

console.log(chalk.blue('🌐 网页后台地址 (如果您已成功部署):'));
console.log(chalk.green(`https://${PROJECT_ID}.web.app\n`));

console.log(chalk.magenta('💻 本地预览地址:'));
console.log(chalk.green(`http://localhost:5173\n`));

console.log(chalk.cyan('----------------------------------------'));
console.log(chalk.gray('请确保您的 .env 文件中已填入正确的 CLIENT_ID 和 PROJECT_ID！'));
console.log(chalk.cyan('----------------------------------------\n'));
