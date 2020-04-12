const server = require('./src/server');

const PORT = process.env.PORT || 8080;
const NODE_ENV = process.env.NODE_ENV;

server.listen(PORT, () => {
	console.log(`Server started on ${PORT} in ${NODE_ENV}`); // eslint-disable-line no-console
});
