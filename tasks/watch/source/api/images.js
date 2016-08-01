module.exports = function (gulp, plugins) {
	return function () {
		gulp.watch([
			'source/api/**/*.{jpg,png}',
		], ['images:www:api']);
	};
}