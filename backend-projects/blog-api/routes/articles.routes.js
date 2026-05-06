const express = require('express');
const router = express.Router();
const articlesController = require('../controllers/articles.controller');


router.get('/articles', articlesController.listArticles);

router.post('/articles', articlesController.createArticle);

router.get('/articles/:id', articlesController.getArticleById);

router.put('/articles/:id', articlesController.updateArticle);

router.delete('/articles/:id', articlesController.deleteArticle);


module.exports = router;