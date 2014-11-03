(function(Math) {
	'use strict';

	/**
	 * Logger Class to show log messages in the console and log to an API
	 * @param {object} [options]
	 * @param {object} [options.colors] Color scheme for Logger.
	 * ex. { log: '#000000', logBg: '#ffffff', warn: '#333333', warnBg: '#ffffff' error: '#222222', logBg: '#ffffff' }
	 * @constructor
	 */
	function Logger(options) {
		options = options || {};

		this._logs = [];
		this._groups = {};
		this._listeners = {};
		this.logLevel = this.logLevels.LOG;
		this.errorNum = 1;
		this.colors = options.colors || {
			log: this.defaultColors.FONT,
			logBg: this.defaultColors.LOG,
			warn: this.defaultColors.FONT,
			warnBg: this.defaultColors.WARN,
			error: this.defaultColors.FONT,
			errorBg: this.defaultColors.ERROR
		};
	}

	/**
	 * Store a log event, console.log if Logger.level <= 1
	 * @param {object} options
	 * @param {string} options.id ID of the event, can be <group>:<id> to specify group and ID together
	 * @param {string} [options.group] The group of the event
	 * @param {*} options.data Any data associated with event
	 */
	Logger.prototype.log = function (options) {
		this._addLog(this.logLevels.LOG, 'log', options);
	};

	/**
	 * Store a warn event, console.warn if Logger.level <= 2
	 * @param {object} options
	 * @param {string} options.id ID of the event, can be <group>:<id> to specify group and ID together
	 * @param {string} [options.group] The group of the event
	 * @param {*} options.data Any data associated with event
	 */
	Logger.prototype.warn = function (options) {
		this._addLog(this.logLevels.WARN, 'warn',  options);
	};

	/**
	 * Store an error event, console.error if Logger.level <= 3
	 * @param {object} options
	 * @param {string} options.id ID of the event, can be <group>:<id> to specify group and ID together
	 * @param {string} [options.group] The group of the event
	 * @param {*} options.data Any data associated with event
	 */
	Logger.prototype.error = function (options) {
		this._addLog(this.logLevels.ERROR, 'error', options);
	};


	Logger.prototype.getLog = function(id) {
		var parts = id.split(':'),
			hasGroup = parts.length > 1;
		return this._groups[hasGroup ? parts[0] : ''][hasGroup ? parts[1] : parts[0]]
	};

	/**
	 * Outputs all group events to console via console.table
	 * @param groupId
	 */
	Logger.prototype.showGroup = function (groupId) {
		var group = this._groups[groupId], i, len,
			id,
			items = [],
			startTime, lastTime;
		for (id in group) {
			items.push({
				'ID': group[id].id,
				'Time': group[id].time,
				'Time Since Start': null,
				'Time Since Last': null,
				'Data': group[id].data,
				'Level': group[id].level
			});
		}
		items.sort(function(a, b) {
			if (a.Time === b.Time) {
				return 0;
			}
			return a.Time < b.Time ? -1 : 1;
		});

		i = 0;
		len = items.length;
		lastTime = startTime = items[0].Time;
		for (; i < len; i++) {
			items[i]['Time Since Start'] = getTimeStr(items[i].Time - startTime);
			items[i]['Time Since Last'] = getTimeStr(items[i].Time - lastTime);
			lastTime = items[i].Time;
			items[i].Time = getTimeStr(items[i].Time);
		}
		consoleTable(items);
	};

	/**
	 * Get the time difference between 2 events
	 * @param {string} firstEventId The first event. Use <group>:<id> to specify group and ID
	 * @param {string} secondEventId The second event. Use <group>:<id> to specify group and ID
	 * @returns {string}
	 */
	Logger.prototype.getDifference = function(firstLogId, secondLogId) {
		return getTimeStr(this.getLog(firstLogId).time - this.getLog(secondLogId))
	};

	Logger.prototype.listen = function(options, fn) {
		this._listeners.push({
			options: options,
			fn: fn
		});
	};

	Logger.prototype.clearAll = function() {
		this._groups = {};
		this._logs = [];
	}

	Logger.prototype._addLog = function(logLevel, consoleFn, options) {
		var parts = options.id.split(':'),
			group = parts.length > 1 ? parts[0] : '',
			id = parts.length > 1 ? parts[1] : options.id;

		var log = {
			id: id,
			time: window.performance ? window.performance.now() : +(new Date()),
			data: options.data,
			level: logLevel,
			group: group
		};

		if (this.logLevel <= this.logLevels.LOG) {
			console[consoleFn]('%c' + (group ? group + ':' + id : id) + '(' + getTimeStr(log.time) +  ')',
				'background-color:' + this.colors[consoleFn + 'Bg'] + ';color:' + this.colors[consoleFn],
				log.data);
		}

		this._logs.push(log);

		if (!this._groups[group]) {
			this._groups[group] = {};
		}
		if (this._groups[group][log.id]) {
			this.error({
				id: '@@LoggerErrors@@:' + ++this.errorNum,
				data: 'ID `' + id + '` is already used' + (group ? ' in group `' + group : '') + '.'
			});
		}

		this._groups[group][log.id] = log;

		// Call the listeners async
		if (this._listeners.length) {
			setTimeout(this._listeners.bind(this, log), 0);
		}
	};

	Logger._callListeners = function(log) {
		var listener;
		for (var i = 0, len = this._listeners.length; i < len; i++) {
			listener = this._listeners[i];
			if ( listener.group === log.group || listener.level <= log.level) {
				listener.fn(options);
			}
		}
	};

	Logger.prototype.logLevels = {
		LOG: 1,
		WARN: 2,
		ERROR: 3,
		NONE: 4
	};

	Logger.prototype.defaultColors = {
		LOG: '#5677fc',
		WARN: '#ff9800',
		ERROR: '#e51c23',
		FONT: '#ffffff'
	};

	// Allow people to use a static version of Logger
	var staticLogger = new Logger();
	for (var key in staticLogger) {
		if ( typeof staticLogger === 'function') {
			Logger[key] = function() {
				staticLogger[key].apply(staticLogger, arguments);
			};
		} else {
			Logger[key] = staticLogger[key];
		}
	}
	Logger.util = {
		getTimeStr: getTimeStr
	};

	/* Utilities */
	var consoleTable = console.table ? console.table.bind(console) : function() {
		var keys = [], key, i, len;
		for (key in arguments[0]) {
			keys.push(key);
		}
		i = 0;
		len = arguments.length;
		for (; i < len; i++) {
			console.log.apply(console, arguments[i]);
		}
	};

	function getTimeStr(time) {
		var micro = Math.floor(time * 1000),
			seconds = Math.floor(micro / 1000000),
			mills;

		micro = micro - (seconds * 1000000);
		mills =  Math.floor(micro / 1000);
		micro = micro - (mills * 1000);

		return '' + (seconds ? seconds + 's' : '') + (mills ? ' ' +  mills + 'ms' : '') + (micro ? ' ' +  micro + '\xB5s' : '');
	}

	if ( typeof module !== 'undefined' && module.exports) {
		module.exports = Logger;
	} else {
		window.Logger = Logger;
	}

})(Math);
