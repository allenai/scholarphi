import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import * as serviceWorker from './serviceWorker'
import ScholarReader from './ScholarReader'
import * as queryString from 'query-string'

// var DEFAULT_PDF_URL = "https://arxiv.org/pdf/1907.09807.pdf"  // Deep learning for programming languages paper
var DEFAULT_PDF_URL = "https://arxiv.org/pdf/1907.07355v1.pdf";

var params = queryString.parse(window.location.search)
var url
if (params.url instanceof Array) {
    url = params.url[0]
} else if (params.url == null) {
    url = DEFAULT_PDF_URL
} else {
    url = params.url
}

ReactDOM.render(<ScholarReader pdfUrl={url}/>, document.getElementById('root'))

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister()
