// Modules to control application life and create native browser window
const { app, BrowserWindow, dialog, globalShortcut,screen  } = require('electron')
const path = require('path')
const serve = require('electron-serve')
const loadURL = serve({ directory: 'public' })
// const { fork } = require('child_process')
const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')

let mainWindow
function isDev() {
    return !app.isPackaged;
}
const configFolderPath =
    isDev()
        ? path.join(__dirname, 'data')
        : path.join(process.resourcesPath, 'data');

// const ps = fork(`${__dirname}/file-server/server.js`, [configFolderPath])
const adapter = new FileSync(path.join(configFolderPath,'config.json'))
const lowConfig = low(adapter)
lowConfig.defaults({
    TARGET_SCREEN: 0,
    DEBUG: true,
    FULLSCREEN: false
    }).write()

const {TARGET_SCREEN, DEBUG, FULLSCREEN} = lowConfig.read().value()


function createWindow() {
    const displays = screen.getAllDisplays()
    const externalDisplays = displays.filter((display) =>display.bounds.x !== 0 || display.bounds.y !== 0)
    const mainDisplay = displays.find((display) =>  display.bounds.x === 0 && display.bounds.y === 0)
    const isExternal = TARGET_SCREEN !== 0
    const eIdx = TARGET_SCREEN - 1
    const selectedDisplay = isExternal && externalDisplays[eIdx]? externalDisplays[eIdx]: mainDisplay
    // Create the browser window.
    mainWindow = new BrowserWindow({
        width: 540,
        height: 960,
        webPreferences: {
            nodeIntegration: true
        },
        icon: isDev() ? path.join(process.cwd(), 'public/favicon.png') : path.join(__dirname, 'public/favicon.png'),
        show: false,
        titleBarStyle: 'customButtonsOnHover',
        frame: DEBUG,
        x :  selectedDisplay.bounds.x,
        y : selectedDisplay.bounds.y
    });
    mainWindow.setMenu(null)

    if (isDev()) {
        mainWindow.loadURL('http://localhost:5000/');
    } else {
        loadURL(mainWindow);
    }

    if(DEBUG) {
        mainWindow.webContents.openDevTools();
        mainWindow.maximize();
    }
    if(FULLSCREEN) {
        mainWindow.setFullScreen(true)
    }

    mainWindow.on('closed', function () {
        mainWindow = null
    });
    mainWindow.once('ready-to-show', () => {
        mainWindow.show()
    });

    //resizing window
    let resizeTimeout;
    mainWindow.on('resize', (e)=>{
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(function(){
            let size = mainWindow.getSize();
            mainWindow.setSize(size[0], parseInt(size[0] * 16 / 9));
        }, 100);
    });
}

app.whenReady().then(() => {

    const displays = screen.getAllDisplays()
    const externalDisplay = displays.find((display) => {
        return display.bounds.x !== 0 || display.bounds.y !== 0
    })

    console.log(displays, externalDisplay)


    globalShortcut.register('Alt+Return', () => {
        mainWindow.setFullScreen(!mainWindow.isFullScreen())
        // console.log('Electron fullscreen togle!')
    })
})
  
app.on('ready', createWindow);
// Quit when all windows are closed.
app.on('window-all-closed', function () {
    // controller.abort()
    if (process.platform !== 'darwin') app.quit()

});

app.on('activate', function () {



    if (mainWindow === null) {
        createWindow()
    }

});


