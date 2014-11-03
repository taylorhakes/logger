(function(Logger) {
	'use strict';

	describe('Logger', function() {
		var Date = window.Date;
		beforeEach(function() {
			spyOn(window, 'Date').and.callFake(function() {
				return new Date(1414975166997);
			});
			spyOn(console, 'log');
			spyOn(console, 'warn');
			spyOn(console, 'error');
			if ( console.table ) {
				spyOn(console, 'table');
			}
		});
		afterEach(function() {
			Logger.clearAll();
			Logger.logLevel = Logger.logLevels.LOG;
		});
		describe('log', function() {
			it('console.logs and saves by default', function() {
				Logger.log({
					id: 'hello',
					data: 'fun'
				});
				expect(console.log).toHaveBeenCalledWith('%chello(1414975166s 997ms)', 'background-color:#5677fc;color:#ffffff', 'fun');
				expect(Logger.getLog('hello')).toEqual({id : 'hello', time : 1414975166997, data : 'fun', level : 1, group : ''});
			});
			it('with group', function() {
				Logger.log({
					id: 'cool:hello1',
					data: 'fun'
				});
				expect(console.log).toHaveBeenCalledWith('%ccool:hello1(1414975166s 997ms)', 'background-color:#5677fc;color:#ffffff', 'fun');
				expect(Logger.getLog('cool:hello1')).toEqual({id : 'hello1', time : 1414975166997, data : 'fun', level : 1, group : 'cool'});
			});
			it('no console.log with log level change', function() {
				Logger.logLevel = Logger.logLevels.WARN;
				Logger.log({
					id: 'hello2',
					data: 'fun'
				});
				expect(console.log).not.toHaveBeenCalled();
			});
		});
		describe('warn', function() {
			it('console.warns and saves by default', function() {
				Logger.warn({
					id: 'warn',
					data: 'fun'
				});
				expect(console.warn).toHaveBeenCalledWith('%cwarn(1414975166s 997ms)', 'background-color:#ff9800;color:#ffffff', 'fun');
				expect(Logger.getLog('warn')).toEqual({id : 'warn', time : 1414975166997, data : 'fun', level : 2, group : ''});
			});
			it('no console.warn with log level change', function() {
				Logger.logLevel = Logger.logLevels.WARN;
				Logger.log({
					id: 'warn1',
					data: 'fun'
				});
				expect(console.warn).not.toHaveBeenCalled();
			});
		});
		describe('error', function() {
			it('console.errors and saves by default', function() {
				Logger.error({
					id: 'errors',
					data: 'fun'
				});
				expect(console.error).toHaveBeenCalledWith('%cerrors(1414975166s 997ms)', 'background-color:#e51c23;color:#ffffff', 'fun');
				expect(Logger.getLog('errors')).toEqual({id : 'errors', time : 1414975166997, data : 'fun', level : 3, group : ''});
			});
			it('no console.error with log level change', function() {
				Logger.logLevel = Logger.logLevels.ERROR;
				Logger.error({
					id: 'error1',
					data: 'fun'
				});
				expect(console.error).not.toHaveBeenCalled();
			});
		});
		describe('getDifference', function() {

			it('string difference', function() {
				window.Date.and.callFake(function() {
					return new Date(1414975166997);
				});
				Logger.log({
					id: 'cool:time',
					data: 'fun'
				});
				window.Date.and.callFake(function() {
					return new Date(5414975167997);
				});
				Logger.log({
					id: 'three:four',
					data: 'fun'
				});
				expect(Logger.getDifference('cool:time', 'three:four')).toBe('hello');
			});
		});
	});
})(Logger);
