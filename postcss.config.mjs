// TODO: This polyfill will be no longer needed when Firefox supports `:has()`. See https://caniuse.com/css-has
import postcssHasPseudo from 'css-has-pseudo';

export default {
	plugins: [postcssHasPseudo()],
};
