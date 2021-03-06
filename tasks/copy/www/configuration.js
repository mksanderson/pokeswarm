module.exports = function(gulp, plugins) {
	return function() {
		return gulp.src(['source/browser/**/*','source/*.{js, xml, txt}'])
			.pipe(plugins.plumber())
			.pipe(gulp.dest('www/'))
			.pipe(plugins.browserSync.stream());
	}
}