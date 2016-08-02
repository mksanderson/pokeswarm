var gulp = require('gulp'),
	plugins = require('gulp-load-plugins')({
		pattern: '*'
	});

// Tasks

	// Bower
	// Path: tasks/bower
	gulp.task('bower:www', ['bower:www:install']);
	gulp.task('bower:www:install', require('./tasks/bower/www/install')(gulp, plugins));

	// BrowserSync
	// Path: tasks/browser-sync
	gulp.task('browserSync:www', ['browserSync:www:server']);
	gulp.task('browserSync:www:server', require('./tasks/browser-sync/www/server')(gulp, plugins));

	// Concat
	// Path: tasks/concat
	gulp.task('concat:www', ['concat:www:dependencies']);
	gulp.task('concat:www:dependencies', require('./tasks/concat/www/dependencies')(gulp, plugins));

	// Copy
	// Path: tasks/copy
	gulp.task('copy:www', [
		'copy:www:api',
		'copy:www:components',
		'copy:www:configuration',
		'copy:www:controllers',
		'copy:www:dependencies',
		'copy:www:directives',
		'copy:www:root']);
	gulp.task('copy:www:api', require('./tasks/copy/www/api')(gulp, plugins));
	gulp.task('copy:www:components', require('./tasks/copy/www/components')(gulp, plugins));
	gulp.task('copy:www:configuration', require('./tasks/copy/www/configuration')(gulp, plugins));
	gulp.task('copy:www:controllers', require('./tasks/copy/www/controllers')(gulp, plugins));
	gulp.task('copy:www:directives', require('./tasks/copy/www/directives')(gulp, plugins));
	gulp.task('copy:www:dependencies', require('./tasks/copy/www/dependencies')(gulp, plugins));
	gulp.task('copy:www:root', require('./tasks/copy/www/root')(gulp, plugins));

	// Pug
	// Path: tasks/copy
	gulp.task('pug:www', [
		'pug:www:components',
		'pug:www:directives',
		'pug:www:views']);
	gulp.task('pug:www:components', require('./tasks/pug/www/components')(gulp, plugins));
	gulp.task('pug:www:directives', require('./tasks/pug/www/directives')(gulp, plugins));
	gulp.task('pug:www:views', require('./tasks/pug/www/views')(gulp, plugins));

	// Imagemin
	// Path: tasks/image-min
	gulp.task('imagemin:www', ['imagemin:www:images', 'imagemin:www:api']);
	gulp.task('imagemin:www:api', require('./tasks/image-min/www/api')(gulp, plugins));
	gulp.task('imagemin:www:images', require('./tasks/image-min/www/images')(gulp, plugins));

	// Sass
	// Path: tasks/sass
	gulp.task('sass:www', ['sass:www:stylesheets']);
	gulp.task('sass:www:stylesheets', require('./tasks/sass/www/stylesheets')(gulp, plugins));

	// SVG Symbols
	// Path: tasks/svg-symbols
	gulp.task('svgSymbols:www', ['svgSymbols:www:graphics']);
	gulp.task('svgSymbols:www:graphics', require('./tasks/svg-symbols/www/graphics')(gulp, plugins));

	// TypeScript
	// Path: tasks/typescript
	gulp.task('typescript:www', [
		'typescript:www:application'
	]);
	gulp.task('typescript:www:application', require('./tasks/typescript/www/application')(gulp, plugins));

	// Typings
	// Path: tasks/typings
	gulp.task('typings:root', ['typings:root:install']);
	gulp.task('typings:root:install', require('./tasks/typings/root/install')(gulp, plugins));

	// Watch
	// Path: tasks/watch
	gulp.task('watch:source', [
		'watch:source:api:copy',
		'watch:source:api:images',
		'watch:source:application:typescript',
		'watch:source:bower:install',
		'watch:source:components:pug',
		'watch:source:dependencies:copy',
		'watch:source:directives:pug',
		'watch:source:images:image-min',
		'watch:source:images:svg-symbols',
		'watch:source:stylesheets:sass',
		'watch:source:views:pug']);
	gulp.task('watch:source:api:copy', require('./tasks/watch/source/api/copy')(gulp, plugins));
	gulp.task('watch:source:api:images', require('./tasks/watch/source/api/images')(gulp, plugins));
	gulp.task('watch:source:application:typescript', require('./tasks/watch/source/application/typescript')(gulp, plugins));
	gulp.task('watch:source:bower:install', require('./tasks/watch/source/bower/install')(gulp, plugins));
	gulp.task('watch:source:components:pug', require('./tasks/watch/source/components/pug')(gulp, plugins));
	gulp.task('watch:source:dependencies:copy', require('./tasks/watch/source/dependencies/copy')(gulp, plugins));
	gulp.task('watch:source:directives:pug', require('./tasks/watch/source/directives/pug')(gulp, plugins));
	gulp.task('watch:source:images:image-min', require('./tasks/watch/source/images/image-min')(gulp, plugins));
	gulp.task('watch:source:images:svg-symbols', require('./tasks/watch/source/images/svg-symbols')(gulp, plugins));
	gulp.task('watch:source:stylesheets:sass', require('./tasks/watch/source/stylesheets/sass')(gulp, plugins));
	gulp.task('watch:source:views:pug', require('./tasks/watch/source/views/pug')(gulp, plugins));

	gulp.task('watch:www', [
		'watch:www:bower:install',
		'watch:www:dependencies:concat']);
	gulp.task('watch:www:bower:install', require('./tasks/watch/www/bower/install')(gulp, plugins));
	gulp.task('watch:www:dependencies:concat', require('./tasks/watch/www/dependencies/concat')(gulp, plugins));

// Actions

	// Command: gulp 
	gulp.task('default', ['bower:www', 'typings:root', 'sass:www', 'copy:www', 'imagemin:www', 'pug:www', 'typescript:www'], function () {
		gulp.start('svgSymbols:www');
		gulp.start('concat:www');
		gulp.start('server');
	});

	// Command: gulp build
	gulp.task('build', ['bower:www', 'typings:root', 'sass:www', 'copy:www', 'imagemin:www', 'pug:www', 'typescript:www'], function () {
		gulp.start('svgSymbols:www');
		gulp.start('concat:www');
	});

	// Command: gulp server
	gulp.task('server', ['watch:source','watch:www'], function () {
		gulp.start('watch:www');
		gulp.start('browserSync:www');
	});