module.exports = function (gulp, plugins) {
	return function () {
		return gulp.src('source/stylesheets/style.scss')
			.pipe(plugins.plumber())
			.pipe(plugins.sassGlob())
			.pipe(plugins.sourcemaps.init())
				.pipe(plugins.sass())
					.on('error',function(error){
						console.log(error);
						this.emit('end');
					})
					.pipe(plugins.plumber())
				.pipe(plugins.autoprefixer({
					browsers: ['last 2 versions'],
					cascade: false
				}))
			.pipe(plugins.sourcemaps.write())
			.pipe(gulp.dest('www/stylesheets/'))
			.pipe(plugins.browserSync.stream());
			
	}
}