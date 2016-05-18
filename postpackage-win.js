"use strict";

const exec = require('child_process').exec
const exe = ".\\dist\\Eth0s-win32-x64\\Eth0s.exe"
const iconPath = ".\\build\\ethos.ico"


let cmd = exec(".\\node_modules\\rcedit\\bin\\rcedit.exe "+exe+" --set-icon " + iconPath, function(err, stdout, stderr){
	if (err) {
		console.log("Error updating executable ("+exe+") with icon: " + iconPath)
		throw err;
	} else {
		console.log("Updated executable ("+exe+") with icon: " + iconPath)
	}
})

cmd.stdout.pipe(process.stdout)
cmd.stderr.pipe(process.stderr)
