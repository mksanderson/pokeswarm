module.exports = function (gulp, plugins) {
	return function () {
		return gulp.src('source/api/**/*.{ico,jpg,png}')
			.pipe(plugins.changed('www/api/'))
			.pipe(plugins.plumber())
			.pipe(gulp.dest('www/api/'))
			.pipe(plugins.browserSync.stream());
	};
}