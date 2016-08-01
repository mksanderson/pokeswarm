module.exports = function (gulp, plugins) {
	return function () {
		gulp.watch('source/**/*.scss', ['sass:www:stylesheets']);
	};
}