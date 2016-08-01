module.exports = function (gulp, plugins) {
	return function() {
		var store = {};
		
		return gulp.src('source/components/**/*.pug')
			.pipe(plugins.changed('www/components', {extension: '.pug'}))
			.pipe(plugins.pug({
				basedir:'source/components',
				locals: store,
				pretty: true
			}))
			.pipe(plugins.plumber())
			.pipe(gulp.dest('www/components/'))
			.on('end', function(){
				plugins.browserSync.reload();
			})
	}
}