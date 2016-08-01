module.exports = function (gulp, plugins) {
	return function () {
		gulp.watch('source/directives/**/*.pug', ['pug:www:directives']);
	};
}