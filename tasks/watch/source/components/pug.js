module.exports = function (gulp, plugins) {
	return function () {
		gulp.watch('source/components/**/*.pug', ['pug:www:components']);
	};
	}