// eslint-disable-next-line no-unused-vars
module.exports = (err, req, res, next) => {
	if (err.message === 'parseConfig') {
		res.status(500).send({ error: 'Could not parse stylelint config' });
	} else {
		res.status(500).send({ error: err.message });
	}
};
