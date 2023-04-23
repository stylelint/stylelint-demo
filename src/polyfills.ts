// TODO: This polyfill will be no longer needed when Firefox supports `:has()`. See https://caniuse.com/css-has
// @ts-expect-error -- TS2307: Cannot find module 'css-has-pseudo/browser' or its corresponding type declarations.
import cssHasPseudo from 'css-has-pseudo/browser';
cssHasPseudo(document);
