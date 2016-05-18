const electron = require('electron')
const app = electron.app

const Tray = electron.Tray
const Menu = electron.Menu

function createTray(options) {

  let iconPath = __dirname + "/client/images" + (process.platform === 'darwin' ? '/iconTemplate@2x.png' : '/icon.png' )
  let tray = new Tray(iconPath)

  let contextMenu = Menu.buildFromTemplate([{
    label: 'About',
    click: options.createWindow(options.mainWindow)
  },{
    label: 'Debug',
    click: function(){
      // Open the DevTools.
      options.createWindow()
      options.mainWindow.toggleDevTools();
    }
  },{
    label: 'Quit',
    accelerator: 'Command+Q',
    click: app.quit
  }]);

  tray.setToolTip('Welcome to the Future - Eth0s');
  tray.setContextMenu(contextMenu);

  tray.on('click', function(){
    if (options.mainWindow.isVisible()){
      options.mainWindow.hide()
    } else {
      options.mainWindow.show()
      options.mainWindow.focus()
    }
  });

  return tray;
}


module.exports = createTray;