var gulp = require('gulp'),
	uglify = require('gulp-uglifyjs'),
	rename = require('gulp-rename'),
	karma = require('karma').server;

gulp.task('build', function() {
	gulp.src('Logger.js')
		.pipe(rename('Logger.min.js'))
		.pipe(uglify())
		.pipe(gulp.dest('./'))
});

gulp.task('coverage', function (done) {
	karma.start({
		configFile: __dirname + '/karma.conf.js',
		reporters: ['progress', 'coverage'],
		singleRun: true,
		preprocessors: {
			'Logger.js': ['coverage']
		}
	}, done);
});