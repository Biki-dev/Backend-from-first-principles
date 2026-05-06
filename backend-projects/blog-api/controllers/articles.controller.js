const Article = require('../models/article.model');

module.exports.createArticle = async (req, res) => {
    try {
        const { title, content } = req.body;
        const article = await Article.create({ title, content });
        res.status(201).json(article);
    } catch (error) {
        res.status(500).json({ error: `Internal server error: ${error}` });
    }
}

module.exports.listArticles = async (req, res) => {
    try {
        const articles = await Article.find();
        res.json(articles);
    } catch (error) {
        res.status(500).json({ error: `Internal server error: ${error}` });
    }
};

module.exports.getArticleById = async (req, res) => {
    try {
        const article = await Article.findById(req.params.id);
        if (!article) {
            return res.status(404).json({ error: 'Article not found' });
        }
        res.json(article);
    } catch (error) {
        res.status(500).json({ error: `Internal server error: ${error}` });
    }
};

module.exports.updateArticle = async (req, res) => {
    const articleId = req.params.id;
    console.log(`Updating article with ID: ${articleId} and data:`, req.body);
    try {
        const article = await Article.findByIdAndUpdate(articleId, req.body, { new: true });
        if (!article) {
            return res.status(404).json({ error: 'Article not found' });
        }
        res.json(article);
    } catch (error) {
        res.status(500).json({ error: `Internal server error: ${error}` });
    }
};

module.exports.deleteArticle = async (req, res) => {
    const articleId = req.params.id;
    console.log(`Deleting article with ID: ${articleId}`);
    try {
        const article = await Article.findByIdAndDelete(articleId);
        if (!article) {
            return res.status(404).json({ error: 'Article not found' });
        }
        res.json({ message: `Article with ID: ${articleId} deleted` });
    } catch (error) {
        res.status(500).json({ error: `Internal server error: ${error}` });
    }
};