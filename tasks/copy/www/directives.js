module.exports = function(gulp, plugins) {
	return function() {
		return gulp.src('source/directives/**/*.{js,json}')
			.pipe(plugins.plumber())
			.pipe(gulp.dest('www/directives/'))
			.pipe(plugins.browserSync.stream());
	}
}