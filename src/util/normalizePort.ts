export default (val: string): any => {
	const port = parseInt(val, 10)

	if (isNaN(port)) {
		return val
	}

	if (port >= 0) {
		return port
	}
}
