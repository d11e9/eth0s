"use strict";

if (process.platform !== 'win32') process.exit(0);

const exec = require('child_process').exec

let cmd = exec("cd node_modules/sha3 && set HOME=%USERPROFILE%/.electron-gyp && node-gyp rebuild --target=0.37.0 --arch=x64 --dist-url=https://atom.io/download/atom-shell", function(err, stdout, stderr){
	if (err) throw err;
})

cmd.stdout.pipe(process.stdout)
cmd.stderr.pipe(process.stderr)
