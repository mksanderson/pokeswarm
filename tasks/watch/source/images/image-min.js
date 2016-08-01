module.exports = function (gulp, plugins) {
	return function () {
		gulp.watch('source/images/**/*', ['imagemin:www:images']);
	};
}