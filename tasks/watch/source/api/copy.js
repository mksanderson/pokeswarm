module.exports = function (gulp, plugins) {
	return function () {
		gulp.watch([
			'source/api/**/*',
		], ['copy:www:api']);
	};
}