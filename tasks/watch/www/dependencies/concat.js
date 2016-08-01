module.exports = function (gulp, plugins) {
	return function () {
		gulp.watch([
			'www/bower_components/**/*'
		], ['concat:www:dependencies']);
	};
}