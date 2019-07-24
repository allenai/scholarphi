/**
 * Adapted from pdf.js pdfHandler.js
 */
chrome.webRequest.onHeadersReceived.addListener(
  function(details) {
    console.log("Trying to log header receive info");
    return {
      redirectUrl: chrome.extension.getURL('extension/app.html')
    };
  }, {
    urls: [
      'https://arxiv.org/pdf/*'
    ],
    types: [ 'main_frame', 'sub_frame' ]
  },
  ['blocking', 'responseHeaders']);
