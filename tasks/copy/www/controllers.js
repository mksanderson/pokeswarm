module.exports = function(gulp, plugins) {
	return function() {
		return gulp.src('source/controllers/**/*.{js,json}')
			.pipe(plugins.plumber())
			.pipe(gulp.dest('www/controllers/'))
			.pipe(plugins.browserSync.stream());
	}
}