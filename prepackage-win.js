"use strict";

const exec = require('child_process').exec
let command = "rd /S /Q %USERPROFILE%\\AppData\\Local\\Temp\\electron-packager"
let command2 = "dir %USERPROFILE%\\AppData\\Local\\Temp"

console.log("Exec: " + command)

let cmd = exec( command, function(err, stdout, stderr){
	

	console.log("Exec: " + command2)
	cmd = exec( command2, function(err) {
		if (err) throw err;		
	})

	cmd.stdout.pipe(process.stdout)
	cmd.stderr.pipe(process.stderr)
})




cmd.stdout.pipe(process.stdout)
cmd.stderr.pipe(process.stderr)
