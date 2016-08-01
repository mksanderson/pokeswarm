module.exports = function(gulp, plugins) {
	return function() {
		return gulp.src('source/components/**/*.{js,json}')
			.pipe(plugins.plumber())
			.pipe(gulp.dest('www/components/'))
			.pipe(plugins.browserSync.stream());
	}
}