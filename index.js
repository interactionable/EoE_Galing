const express = require('express');
const app = express();
const http = require('http');
const https = require('https');

const path = require('path')
const reload = require('reload')
const bodyParser = require('body-parser')
const logger = require('morgan')
const config = require('./package.json');
const settingsPath = './settings.json';
const settings = require(settingsPath);
const publicDir = path.join(__dirname, 'public');
const logo = require('./src/logo').default(config, settings);
const fs = require('fs');
const development = (process.env.NODE_ENV === "development");
const structure = new Map();
const sockets = new Map();
const DIRECTIONS = Object.freeze({
  "ABOVE": "above",
  "LEFT": "left",
  "RIGHT": "right",
  "BELOW": "below"
})
var port = settings.port;
var insecurePort = settings.insecureport;
let server;
let insecureServer;
let options;
let certsPath = path.join(__dirname, 'certs', 'server');
let caCertsPath = path.join(__dirname, 'certs', 'ca');

//
// SSL Certificates
//
options = {
  key: fs.readFileSync(path.join(certsPath, 'my-server.key.pem'))
    // This certificate should be a bundle containing your server certificate and any intermediates
    // cat certs/cert.pem certs/chain.pem > certs/server-bundle.pem
    ,
  cert: fs.readFileSync(path.join(certsPath, 'my-server.crt.pem'))
    // ca only needs to be specified for peer-certificates
    //, ca: [ fs.readFileSync(path.join(caCertsPath, 'my-root-ca.crt.pem')) ]
    ,
  requestCert: false,
  rejectUnauthorized: true
};







const saveSettings = () => {
  fs.writeFile(settingsPath, JSON.stringify(settings, null, 2), function writeJSON(err) {
    if (err) return console.log(err);
    console.log('writing to ' + settingsPath);
  });
}

const printConnections = () => {
  settings.structure.forEach((row, rowindex, rows) => {
    row.forEach((element, colindex) => {
      const addConnection = (direction, ID) => {
        structure.get(element).push({
          direction,
          ID
        });
      }

      if (element) {
        structure.set(element, []);
        // add neighbours from previous row
        if (rowindex > 0) {
          rows[rowindex - 1].forEach((newElement, colindex2) => {
            if (newElement && Math.abs(colindex - colindex2) < 2) {
              addConnection(DIRECTIONS.BELOW, newElement);
            }
          })
        }

        //left neighbour
        if (colindex > 0) {
          let v = row[colindex - 1];
          if (v) {
            addConnection(DIRECTIONS.RIGHT, v);
          }
        }
        if (colindex < (row.length - 1)) {
          let v = row[colindex + 1];
          if (v) {
            addConnection(DIRECTIONS.LEFT, v);
          }
        }

        // add neighbours from next row
        if (rowindex < (rows.length - 1)) {
          rows[rowindex + 1].forEach((newElement, colindex2) => {
            if (newElement && Math.abs(colindex - colindex2) < 2) {
              addConnection(DIRECTIONS.ABOVE, newElement);
            }
          })
        }
      }
    })
  })
}

const startServer = () => {
  server = https.createServer(options);
  
    

    function listen(app) {
      server.on('request', app);
      server.listen(port, function () {
        port = server.address().port;
        // console.log('Listening on https://127.0.0.1:' + port);
      });
    }

    logo();
    printConnections();

    var publicDir = path.join(__dirname, 'public');
    // var app = require('./app').create(server, host, port, publicDir);

    app
      .set('port', port)
      .use(logger('dev'))
      .use(bodyParser.json())
      .use(express.static(path.join(__dirname, 'public/')))
      .get('/:id', function (req, res) {
        res.sendFile(path.join(publicDir, 'index.html'))
      })

    listen(app);


    const io = require('socket.io')(server);

    io.on('connection', (socket) => {
      socket.on("hello", (ID) => {
        sockets.set(ID, socket);
        console.log(`${ID} connected`);
        socket.emit("settings", {
          development,
          minSound: settings.minSound,
          maxSound: settings.maxSound,
          easing: settings.easing,
          directions: DIRECTIONS
        });
      });

      socket.on("updateMinSound", (newValue) => {
        settings.minSound = newValue;
        console.log(`updating mininmum sound: ${newValue}`);
        saveSettings();
      })

      socket.on("updateMaxSound", (newValue) => {
        settings.maxSound = newValue;
        console.log(`updating maximum sound: ${newValue}`);
        saveSettings();
      })

      socket.on("updateEasing", (newValue) => {
        settings.easing = newValue;
        console.log(`updating easing: ${newValue}`);
        saveSettings();
      })

      socket.on("activate", (ID) => {
        if (structure.get(ID) && structure.get(ID).length){
          structure.get(ID).forEach(({
            direction,
            ID
          }) => {
            if (sockets.get(ID)) {
              sockets.get(ID).emit("surround", direction);
            }
          })
        }
      })

    });


 




}

// insecureServer = http.createServer();
// insecureServer.on('request', function (req, res) {
//   // TODO also redirect websocket upgrades
//   res.setHeader(
//     'Location'
//   , 'https://' + req.headers.host.replace(/:\d+/, ':' + port) + req.url
//   );
//   res.statusCode = 302;
//   res.end();
// });
// insecureServer.listen(insecurePort, function(){
//   console.log("\nRedirecting all http traffic to https\n");
// });



// const startServer = () => http.listen(process.env.PORT || settings.port, () => {
//   logo();
//   printConnections();
// })

if (development) {
  reload(app).then(function (reloadReturned) {
    // Reload started, start web server
    startServer()
  }).catch(function (err) {
    console.error('Reload could not start, could not start server', err)
  })
} else {
  startServer()
}