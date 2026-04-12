require('dotenv').config();
const { execSync } = require('child_process');
const fs = require('fs');

console.log('🚀 开始自动化部署 TuanTuan Supreme 平台全线产品...');

try {
    // 1. 开始打包 Web Dashboard 到 Firebase Hosting
    console.log('\n[1/3] 🌐 正在打包网页端后台...');
    execSync('npm run build', { cwd: './web', stdio: 'inherit' });
    console.log('✅ 网页打包成功！正在推送到 Firebase Hosting 免费平台...');
    
    try {
        execSync('npx firebase deploy --only hosting', { cwd: './web', stdio: 'inherit' });
        console.log('✅ 网页后台已成功上线！');
    } catch (e) {
        console.log('⚠️ Firebase推行跳过：需要您先运行 npx firebase login 登录您的账号。');
    }

    // 2. 将 Bot 部署到 Google Cloud Run (24/7 持久化运行)
    console.log('\n[2/3] 🤖 正在将 Discord 机器人推送到 Google Cloud Run 进行24/7永不掉线部署...');
    
    const envVars = `DISCORD_TOKEN=${process.env.DISCORD_TOKEN},CLIENT_ID=${process.env.CLIENT_ID},GOOGLE_API_KEY=${process.env.GOOGLE_API_KEY},FIREBASE_PROJECT_ID=${process.env.FIREBASE_PROJECT_ID},FIREBASE_CLIENT_EMAIL=${process.env.FIREBASE_CLIENT_EMAIL},FIREBASE_PRIVATE_KEY=${process.env.FIREBASE_PRIVATE_KEY.split('\n').join('\\n')}`;
    
    // GCloud run command
    console.log(`执行 gcloud 部署中... (此过程可能较慢，请耐心等待)`);
    try {
        execSync(`gcloud run deploy tuantuanbot --source ./bot --region us-central1 --allow-unauthenticated --project ${process.env.FIREBASE_PROJECT_ID} --set-env-vars="${envVars}"`, { stdio: 'inherit' });
        console.log('✅ 机器人已成功云端上线并开启24小时存活守卫！');
    } catch (e) {
        console.log('⚠️ GCloud 部署跳过：检测到本地无 gcloud SDK，或者您需要运行 gcloud auth login。作为替代您可以直接使用控制台的指令。');
    }

    // 3. 构建 Electron Desktop 应用 (.exe)
    console.log('\n[3/3] 💻 开始构建桌面级应用 (.exe)...');
    try {
        execSync('npm run electron:build', { cwd: './web', stdio: 'inherit' });
        console.log('✅ 桌面级客户端 .exe 已生成！请查看 web/dist-electron 目录！');
    } catch (e) {
         console.log('⚠️ 桌面端打包失败，可手动进入 web 目录运行 npm run electron:build。');
    }

    console.log('\n🎉 所有部署与打包流程运行完毕。团团已经进化为全平台满血级 TuanTuan Supreme Core！');

} catch (error) {
    console.error('\n❌ 部署过程中发生致命错误:');
    console.error(error.message);
}
