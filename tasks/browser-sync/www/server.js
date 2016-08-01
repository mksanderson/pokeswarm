module.exports = function (gulp, plugins) {
	return function () {
		return plugins.browserSync.init(
			{
				open: false,
				server: {
					baseDir: 'www'
				}
			});
	}
}