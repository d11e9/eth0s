module.exports = {
	getEthereumDataDir: function(){
		if (process.platform == 'win32') {
			return process.env['USERPROFILE'] + '/AppData/Roaming/Ethereum'
		} else if (process.platform == 'darwin') {
			return process.env['HOME'] + '/Library/Ethereum'
		} else {
			return process.env['HOME'] + '/.ethereum'
		}
	}
}