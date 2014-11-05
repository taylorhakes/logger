Logger Plus
======

Comprehensive javascript logging. Log information to the console as well as get timing information.

##Features
- Support for console.log, console.warn, console.error, console.table
- Timing Groups - group events and reports together
- High performance timing (if browser supports window.performance)
- Themes - Change the color and background of log output
- Backend support - Listen for errors and send to the backend
- Supress specific logs based on environment (ex. hide logs in production)


```
// Can be used statically
Logger.log('Page load');

// or object oriented
var logger = new Logger();
logger.log('Page load');
```

##API
####Logger.log(<id>)
Store a log statement and optionally output to console.log
