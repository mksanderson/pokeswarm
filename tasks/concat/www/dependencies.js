module.exports = function(gulp, plugins) {
	return function() {
		return gulp.src(
			[
				'www/bower_components/angular/angular.min.js',
				'www/bower_components/angular-route/angular-route.min.js',
				'www/bower_components/angular-off-click/dist/angular-off-click.min.js'
			])
			.pipe(plugins.concat('dependencies.js'))
				.pipe(plugins.plumber())
			.pipe(gulp.dest('www/bower_components/'))
			.pipe(plugins.browserSync.stream());
	}
}