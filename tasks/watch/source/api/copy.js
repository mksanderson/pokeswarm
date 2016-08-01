module.exports = function (gulp, plugins) {
	return function () {
		gulp.watch([
			'source/api/**/*.json',
		], ['copy:www:api']);
	};
}