module.exports = function (gulp, plugins) {
	return function() {
		var store = {};
		
		return gulp.src('source/views/**/*.pug')
			.pipe(plugins.changed('source/views/**/*', {extension: '.pug'}))
			.pipe(plugins.pug({
				basedir:'source/views',
				locals: store,
				pretty: true
			}))
			.pipe(plugins.plumber())
			.pipe(gulp.dest('www/'))
			.on('end', function(){
				plugins.browserSync.reload();
			})
	}
}