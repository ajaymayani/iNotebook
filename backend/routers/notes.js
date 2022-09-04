const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Note = require('../models/Note');
const fetchuser = require('../middleware/fetchuser');

//ROUTE 1 : Fetch all notes using GET /api/note/fetchallnotes
router.get('/fetchallnotes', fetchuser, async (req, res) => {

    try {
        const notes = await Note.find({ user: req.user.id });
        res.json(notes)
    } catch (e) {
        res.status(500).send("Internal server error")
    }

})

//ROUTE 2 : Add notes using POST /api/note/addnote
router.post('/addnote', fetchuser, [
    body('title', 'Enter valid title').isLength({ min: 3 }),
    body('description', 'Description must be atleast 5 characters').isLength({ min: 5 })
], async (req, res) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {

        const { title, description, tag } = req.body;

        const note = new Note({
            title, description, tag, user: req.user.id
        })

        const savedNote = await note.save();
        res.json(savedNote)
    } catch (e) {
        res.status(500).send("Internal server error")
    }

})

//ROUTE 3 : Update notes using PUT /api/note/updatenote/:id
router.put('/updatenote/:id', fetchuser, async (req, res) => {

    try {

        //Create a newNote object
        const newNote = {};
        const { title, description, tag } = req.body;

        if (title) { newNote.title = title }
        if (description) { newNote.description = description }
        if (tag) { newNote.tag = tag }

        //Find the note to be update and update it
        let note = await Note.findById(req.params.id);
        if (!note) { return res.status(404).send("Not Found") }

        if (note.user.toString() !== req.user.id) {
            return res.status(401).send("Accessed Denied");
        }

        note = await Note.findByIdAndUpdate(req.params.id, { $set: newNote }, { new: true });
        res.json(note);
    } catch (e) {
        res.status(500).send("Internal server error")
    }

})

//ROUTE 4 : Delete notes using DELETE /api/note/deletenote/:id
router.delete('/deletenote/:id', fetchuser, async (req, res) => {

    try {

        //Find the note to be deleted and delete it
        let note = await Note.findById(req.params.id);
        if (!note) { return res.status(404).send("Not Found") }

        if (note.user.toString() !== req.user.id) {
            return res.status(401).send("Accessed Denied");
        }

        note = await Note.findByIdAndDelete(req.params.id);
        res.json({success:"Note has been deleted successfully",note});
    } catch (e) {
        res.status(500).send("Internal server error")
    }

})


module.exports = router;