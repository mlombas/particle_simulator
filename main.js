const { 
   app,
   BrowserWindow,
   Menu
} = require("electron");

app.on("ready", () => {
   const win = new BrowserWindow({
      width: 1100,
      height: 775,
      webPreferences: { nodeIntegration: true },
   });

   win.loadFile("index.html");
   Menu.setApplicationMenu(null);
});
