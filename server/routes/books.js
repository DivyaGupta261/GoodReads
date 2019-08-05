const express = require('express');
const router = express.Router();

const goodreads = require('goodreads-api-node');

const myCredentials = {
  key: 'v6qHOKwJG6NO1gL01IecZg',
  secret: '0Nbk4HbcFwBNAlvoFgcHv6JDfDTyC0d6FzBr7oBoI'
};
 
const gr = goodreads(myCredentials);

/* GET books listing. */
router.get('/', function(req, res, next) {
  console.log('get books...', req.query);
  // console.log('get books...', req.param('page'));
  let books = gr.searchBooks({
    q: req.query.q,
    page: req.query.page
  });
  books.then(data => res.send(data));
  // res.send(books);
});

module.exports = router;
