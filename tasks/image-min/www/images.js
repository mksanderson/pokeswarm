module.exports = function (gulp, plugins) {
	return function () {
		return gulp.src('source/images/**/*')
			.pipe(plugins.changed('www/images/'))
			.pipe(plugins.plumber())
			.pipe(gulp.dest('www/images/'))
			.pipe(plugins.browserSync.stream());
	};
}