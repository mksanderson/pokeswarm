module.exports = function (gulp, plugins) {
	return function () {
		return gulp.src([
			'source/**/*.ts',
			])
			.pipe(plugins.plumber())
			.pipe(plugins.sourcemaps.init())
				.pipe(plugins.typescript({
					out:'application.js'
				}))
			.pipe(plugins.sourcemaps.write())
			.pipe(gulp.dest('www/'))
			.pipe(plugins.browserSync.stream());
	}
}