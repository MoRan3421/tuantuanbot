import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8080;

const distPath = path.join(__dirname, 'dist');

// Ensure dist exists
if (!fs.existsSync(distPath)) {
    console.warn("⚠️ Warning: 'dist' folder not found. Please run 'npm run build' first!");
}

// Serve static files
app.use(express.static(distPath));

// Route all unknown traffic to index.html (SPA Fallback)
app.get('*', (req, res) => {
    const indexPath = path.join(distPath, 'index.html');
    if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
    } else {
        res.status(404).send("Error: Frontend completely missing. Run 'npm run build'.");
    }
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ TuanTuan Web Dashboard is running on port ${PORT}`);
    console.log(`🌐 Ready to be deployed via standard Node.js on justrunmy.app`);
});
