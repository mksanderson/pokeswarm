module.exports = function (gulp, plugins) {
	return function() {
		var store = {};
		
		return gulp.src('source/directives/**/*.pug')
			.pipe(plugins.changed('www/directives', {extension: '.pug'}))
			.pipe(plugins.pug({
				basedir:'source/directives',
				locals: store,
				pretty: true
			}))
			.pipe(plugins.plumber())
			.pipe(gulp.dest('www/directives/'))
			.on('end', function(){
				plugins.browserSync.reload();
			})
	}
}