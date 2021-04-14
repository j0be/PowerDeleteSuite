const express = require('express');
const server = express();
const cors = require('cors');
const fs = require('fs');
const path = require('path');

let corsOptions = {
    origin: function origin(origin, callback) {
        callback(null, true);
    },
    credentials: true
};
server.use(cors(corsOptions));
server.options('*', cors(corsOptions));

server.all('*', function(req, res, next) {
    let fname = req.url.split('?')[0];
    if (fs.existsSync(__dirname + fname)) {
        res.sendFile(path.join(__dirname + fname));
        res.status(200);
    } else {
        res.status(404);
        res.end();
    }
});

const port = 8080;
server.listen(port, () => {
    console.log(`\x1b[32mServer started: \x1b[0mhttp://127.0.0.1:${port}\n`);
});
