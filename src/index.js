import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import MyApp from './MyApp';
import * as serviceWorker from './serviceWorker';
const queryString = require('query-string');

var params = queryString.parse(window.location.search);
var url = params.url;
ReactDOM.render(<MyApp pdfUrl={url}/>, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
