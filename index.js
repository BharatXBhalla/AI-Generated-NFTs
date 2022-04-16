process.env.NODE_ENV = process.env.NODE_ENV || 'development';

const config = require('./config/config.js');
let app = require('./config/express.js')();

app.listen(config.port, function() {
	console.log(process.env.NODE_ENV + ' server now listening on port '  + config.port);
});
