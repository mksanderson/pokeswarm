module.exports = function(gulp, plugins) {
	return function() {
		return gulp.src(['source/browser/**/*'])
			.pipe(plugins.plumber())
			.pipe(gulp.dest('www/browser/'))
			.pipe(plugins.browserSync.stream());
	}
}