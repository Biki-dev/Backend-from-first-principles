import express from 'express';
import mongoose from 'mongoose';
import Url from '../models/url.model.js';
import dotenv from 'dotenv';

dotenv.config();
const router = express.Router();

const url = `http://localhost:${process.env.PORT}/`;

// Create a new shortened URL
router.post('/', async (req, res) => {
  var { urllong } = req.body;

  // if url not contains http or https, add http by default
  if (!/^https?:\/\//i.test(urllong)) {
    urllong = 'http://' + urllong;
  }

  if (!urllong) {
    return res.status(400).json({ error: 'Long URL is required' });
  }

  try {
    const shortrendom = Math.random().toString(36).substring(2, 8);
    const urlshort = url+shortrendom;
    const newShortUrl = new Url({ urlshort, urllong, shortrendom });
    await newShortUrl.save();
    res.status(201).json(newShortUrl);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create shortened URL' });
  }
});

// Redirect to the original URL
router.get('/:shortrendom', async (req, res) => {
  const { shortrendom } = req.params;

  try {
    const shortUrl = await Url.findOne({ shortrendom });
    if (!shortUrl) {
      return res.status(404).json({ error: 'Short URL not found' });
    }
    shortUrl.traffic += 1;
    await shortUrl.save();
    return res.redirect(shortUrl.urllong);
  } catch (err) {
    res.status(500).json({ error: 'Failed to redirect to original URL' });
  }
});

export default router;