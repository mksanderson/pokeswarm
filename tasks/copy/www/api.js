module.exports = function(gulp, plugins) {
	return function() {
		return gulp.src('source/api/**/*.json')
			.pipe(plugins.plumber())
			.pipe(gulp.dest('www/api/'))
			.pipe(plugins.browserSync.stream());
	}
}