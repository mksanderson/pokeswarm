module.exports = function (gulp, plugins) {
	return function () {
		gulp.watch('source/views/**/*.pug', ['pug:www:views']);
	};
}