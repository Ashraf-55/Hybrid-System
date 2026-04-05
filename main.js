const { app, BrowserWindow } = require('electron');

function createWindow() {
    const win = new BrowserWindow({
        width: 1200,
        height: 800,
        // عشان السيستم يبان احترافي شيلنا المنيو بار اللي فوق
        autoHideMenuBar: true,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });

    // هنا بنقوله افتح ملف السيستم بتاعك الأساسي
    win.loadFile('index.html');
}

app.whenReady().then(createWindow);