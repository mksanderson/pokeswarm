module.exports = function(gulp, plugins) {
	return function() {
		return gulp.src('source/api/**/*')
			.pipe(plugins.plumber())
			.pipe(gulp.dest('www/api/'))
			.pipe(plugins.browserSync.stream());
	}
}