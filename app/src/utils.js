
const path = require('path')
const mkdirp = require('mkdirp')


module.exports = {
	getEthereumDataDir: function(append){
		var dir;
		var append = append ? append : '';

		if (process.platform == 'win32') {
			dir = path.join( process.env['USERPROFILE'] , '/AppData/Roaming/Ethereum', append )
		} else if (process.platform == 'darwin') {
			dir = path.join( process.env['HOME'], '/Library/Ethereum', append )
		} else {
			dir = path.join( process.env['HOME'], '/.ethereum', append )
		}

		try {
			mkdirp.sync(dir)
		} catch(e){
			if (e.code !== 'EEXIST') console.error(e)
		}

		return dir
	}
}