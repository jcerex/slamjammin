const express = require('express');
const React = require('react');
console.log("1");
const { renderToString } = require('react-dom/server');
// const renderFullHTMLPage = require('../renderFullHTMLPage');
const App = require('./src/App');
const Index = require('./src/index.js');
const path = require('path');

const server = express();
console.log("Server started");
server.disable('x-powered-by');
server.use('/images', express.static(path.join(__dirname, '../src/assets/images')));
server.use('/scripts', express.static('build'));
server.use('/build', express.static(path.join(__dirname, 'build')));
server.use('/build', express.static('build'));
server.use(express.static(path.join(__dirname, '../')));
server.get('/favicon.ico', (req, res) => res.send(''));
console.log("App loaded");

server.get('/', (req, res) => {
  console.log("/ Route hit");
  try {

    const intialHTML = renderToString(Index);
    // res.send(renderFullHTMLPage(intialHTML));
    res.send(intialHTML);
  } catch (err) {
    /* eslint-disable */
    console.error('error', err);
    /* eslint-enable */

    res.status(500).send(`${err}`);
  }
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => console.log('listening on ', PORT));
