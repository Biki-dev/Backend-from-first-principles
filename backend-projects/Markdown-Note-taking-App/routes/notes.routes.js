import express from 'express';
import Note from '../models/note.model.js';
import renderMarkdown from '../services/markdown.service.js';
import upload from '../middlewares/upload.middleware.js';
import writeGood from 'write-good';
const notesroutes = express.Router();

// Create a new note
notesroutes.post('/', async (req, res) => {
    try {
        const { title, contentMarkdown, attachments = [] } = req.body;

        if (!title || !contentMarkdown) {
            return res.status(400).json({
                error: 'Title and contentMarkdown are required'
            });
        }
        const renderedHtml = renderMarkdown(contentMarkdown);
        const newNote = new Note({ title, contentMarkdown, renderedHtml, attachments });

        await newNote.save();
        res.status(201).json(newNote);
    } catch (err) {
        res.status(500).json({ error: 'Failed to create note' });
    }
});

// Get all notes
notesroutes.get('/', async (req, res) => {
    try {
        const notes = await Note.find().sort({ createdAt: -1 });
        res.status(200).json(notes);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch notes' });
    }
});

// Upload an attachment
notesroutes.post('/upload', (req, res) => {
    if (!req.is('multipart/form-data')) {
        return res.status(400).json({
            error: 'Upload requests must use multipart/form-data with a file field named "file".',
        });
    }

    upload.single('file')(req, res, (err) => {
        if (err) {
            if (err.message === 'Unexpected end of form') {
                return res.status(400).json({
                    error: 'The upload stream ended before the form finished. Send the file as multipart/form-data and do not set the Content-Type header manually when using FormData.',
                });
            }

            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({
                    error: 'Uploaded file is too large.',
                });
            }

            return res.status(400).json({
                error: 'Failed to upload file',
            });
        }

        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
        return res.status(201).json({ url: fileUrl, filename: req.file.filename, mimeType: req.file.mimetype, size: req.file.size, originalName: req.file.originalname });

    });
});

// Check grammar of a text
notesroutes.post('/check-grammar', async (req, res) => {
    try {
        const { text } = req.body;
        if (!text) {
            return res.status(400).json({ error: 'No text provided' });
        }
        const suggestions = writeGood(text);
        res.status(200).json({ suggestions });
    } catch (err) {
        res.status(500).json({ error: 'Failed to check grammar' });
    }
});

// Get rendered HTML of a note by ID
notesroutes.get('/:id/render', async (req, res) => {
    try {
        const note = await Note.findById(req.params.id);
        if (!note) {
            return res.status(404).json({ error: 'Note not found' });
        }
        res.status(200).send(note.renderedHtml);
    } catch (err) {
        res.status(500).json({ error: 'Failed to render note' });
    }
});

// Get a single note by ID
notesroutes.get('/:id', async (req, res) => {
    try {
        const note = await Note.findById(req.params.id);
        if (!note) {
            return res.status(404).json({ error: 'Note not found' });
        }
        res.status(200).json(note);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch note' });
    }
});

// Update a note by ID
notesroutes.put('/:id', async (req, res) => {
    try {
        const { title, contentMarkdown, attachments } = req.body;
        if (
            title === undefined &&
            contentMarkdown === undefined &&
            attachments === undefined
        ) {
            return res.status(400).json({
                error: 'No fields provided for update'
            });
        }
        const updates = {};
        if (title !== undefined) {
            updates.title = title;
        }
        if (contentMarkdown !== undefined) {
            updates.contentMarkdown = contentMarkdown;
            updates.renderedHtml = renderMarkdown(contentMarkdown);
        }
        if (attachments !== undefined) {
            updates.attachments = attachments;
        }
        const updatedNote = await Note.findByIdAndUpdate(req.params.id, updates, {
            new: true,
        });
        if (!updatedNote) {
            return res.status(404).json({ error: 'Note not found' });
        }
        res.status(200).json(updatedNote);
    } catch (err) {
        res.status(500).json({ error: 'Failed to update note' });
    }
});

// Delete a note by ID
notesroutes.delete('/:id', async (req, res) => {
    try {
        const deletedNote = await Note.findByIdAndDelete(req.params.id);
        if (!deletedNote) {
            return res.status(404).json({ error: 'Note not found' });
        }
        res.status(200).json({ message: 'Note deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete note' });
    }
});


export default notesroutes;