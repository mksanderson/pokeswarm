module.exports = function(gulp, plugins) {
	return function() {
		return gulp.src('source/bower_components/**')
			.pipe(plugins.plumber())
			.pipe(gulp.dest('www/bower_components/'))
			.pipe(plugins.browserSync.stream());
	}
}