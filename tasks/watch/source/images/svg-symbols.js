module.exports = function (gulp, plugins) {
	return function () {
		gulp.watch('source/images/**/*', ['svgSymbols:www:graphics']);
	};
}