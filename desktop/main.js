const electron = require('electron')
const _ = require('lodash')
// Module to control application life.
const {app, dialog, ipcMain} = electron
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow

const Tray = electron.Tray
const Menu = electron.Menu

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let windowStack = []

function createWindow (filePath) {
  // Create the browser window.
  let newWindow = new BrowserWindow({width: 1200, height: 800, show: false})

  newWindow.once('ready-to-show', () => {
    newWindow.show()
    if (filePath) {
      newWindow.filePath = filePath
      newWindow.webContents.send('open', filePath)
    } else {
      newWindow.setDocumentEdited(true)
    }
  })
  // and load the index.html of the app.
  newWindow.loadURL(`file://${__dirname}/index.html`)

  // Open the DevTools.
  // newWindow.webContents.openDevTools()

  // Emitted when the window is closed.
  newWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    // newWindow = null
    _.pull(windowStack, newWindow)
    newWindow = null
  })

  ipcMain.on('documentedited', (event, filePath) => {
    if (newWindow && newWindow.filePath === filePath) {
      newWindow.setDocumentEdited(true)
    }
  })

  windowStack.push(newWindow)
}

app.on('open-file', function (e) {
  e.preventDefault()
  createWindow()
  console.log(e)
})

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', function () {
  // let tray = new Tray(`${__dirname}/logo-icon-blue-black-square.png`)
  // const contextMenu = Menu.buildFromTemplate([
  //   {label: 'Item1', type: 'radio'},
  //   {label: 'Item2', type: 'radio'},
  //   {label: 'Item3', type: 'radio', checked: true},
  //   {label: 'Item4', type: 'radio'}
  // ])
  // tray.setToolTip('This is my application.')
  // tray.setContextMenu(contextMenu)
  const template = [
    {
      label: 'File',
      submenu: [
        {
          label: 'New',
          accelerator: 'CmdOrCtrl+N',
          click () {
            createWindow()
          }
        },
        {
          label: 'Open',
          accelerator: 'CmdOrCtrl+O',
          click () {
            dialog.showOpenDialog({properties: ['openFile']}, function (filePaths) {
              createWindow(filePaths[0])
            })
          }
        },
        {
          label: 'Save',
          accelerator: 'CmdOrCtrl+S',
          click (item, focusedWindow) {
            if (focusedWindow.filePath) {
              focusedWindow.webContents.send('save', focusedWindow.filePath)
              focusedWindow.setDocumentEdited(false)
            } else {
              dialog.showSaveDialog({properties: ['saveFile']}, function (filePath) {
                focusedWindow.webContents.send('save', filePath)
                focusedWindow.setDocumentEdited(false)
                focusedWindow.filePath = filePath
              })
            }
          }
        },
        {
          label: 'Save As'
        }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        {
          role: 'undo'
        },
        {
          role: 'redo'
        },
        {
          type: 'separator'
        },
        {
          role: 'cut'
        },
        {
          role: 'copy'
        },
        {
          role: 'paste'
        },
        {
          role: 'pasteandmatchstyle'
        },
        {
          role: 'delete'
        },
        {
          role: 'selectall'
        }
      ]
    },
    {
      label: 'View',
      submenu: [
        {
          label: 'Reload',
          accelerator: 'CmdOrCtrl+R',
          click (item, focusedWindow) {
            if (focusedWindow) focusedWindow.reload()
          }
        },
        {
          label: 'Toggle Developer Tools',
          accelerator: process.platform === 'darwin' ? 'Alt+Command+I' : 'Ctrl+Shift+I',
          click (item, focusedWindow) {
            if (focusedWindow) focusedWindow.webContents.toggleDevTools()
          }
        },
        // {
        //   type: 'separator'
        // },
        // {
        //   role: 'resetzoom'
        // },
        // {
        //   role: 'zoomin'
        // },
        // {
        //   role: 'zoomout'
        // },
        // {
        //   type: 'separator'
        // },
        // {
        //   role: 'togglefullscreen'
        // }
      ]
    },
    {
      role: 'window',
      submenu: [
        {
          role: 'minimize'
        },
        {
          role: 'close'
        }
      ]
    },
    {
      role: 'help',
      submenu: [
        {
          label: 'Learn More',
          click () { require('electron').shell.openExternal('http://electron.atom.io') }
        }
      ]
    }
  ]

  if (process.platform === 'darwin') {
    template.unshift({
      label: app.getName(),
      submenu: [
        {
          role: 'about'
        },
        {
          type: 'separator'
        },
        {
          role: 'services',
          submenu: []
        },
        {
          type: 'separator'
        },
        {
          role: 'hide'
        },
        {
          role: 'hideothers'
        },
        {
          role: 'unhide'
        },
        {
          type: 'separator'
        },
        {
          role: 'quit'
        }
      ]
    })
    // Edit menu.
    template[1].submenu.push(
      {
        type: 'separator'
      },
      {
        label: 'Speech',
        submenu: [
          {
            role: 'startspeaking'
          },
          {
            role: 'stopspeaking'
          }
        ]
      }
    )
    // Window menu.
    template[3].submenu = [
      {
        label: 'Close',
        accelerator: 'CmdOrCtrl+W',
        role: 'close'
      },
      {
        label: 'Minimize',
        accelerator: 'CmdOrCtrl+M',
        role: 'minimize'
      },
      {
        label: 'Zoom',
        role: 'zoom'
      },
      {
        type: 'separator'
      },
      {
        label: 'Bring All to Front',
        role: 'front'
      }
    ]
  }
  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)
  createWindow()
  // const {dialog} = electron
  // console.log(dialog.showOpenDialog({properties: ['openFile', 'openDirectory', 'multiSelections']}))
})

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (windowStack.length === 0) {
    createWindow()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
