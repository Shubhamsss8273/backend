const express = require('express');
const router = express();
const Notebook = require('../models/Notebook');
const checkUser = require('../middlewares/checkUser');

//<<<<<<<<<<<-----------------------------------------NOTEBOOK CRUD------------------------------------------------------>>>>>>>>>>>>


// To add a notebook using POST: /api/notebook/addnotebook (Login required)
router.post('/addnotebook', checkUser, async (req, res) => {
    try {

        const newNotebook = new Notebook({
            user: req.user.id,
            title: req.body.title,
        })

        const savedNotebook = await newNotebook.save();
        res.status(201).json({ status: 'Success', notebook: savedNotebook, error: null })

    } catch (error) {
        res.status(500).json({ status: 'Error', notebook: null, error: 'Internal server error' });
    }
})


// To view all notebooks using GET: /api/notebook/fetchnotebook (Login required)
router.get('/fetchnotebook', checkUser, async (req, res) => {
    try {

        const notebooks = await Notebook.find({ user: req.user.id });
        res.status(200).json({ status: 'Success', notebooks: notebooks, error: null })

    } catch (error) {
        res.status(500).json({ status: 'Error', notebook: null, error: 'Internal server error' });
    }
})


// To update notebooks using PUT: /api/notebook/updatenotebook/:notebookId (Login required)

router.put('/updatenotebook/:notebookId', checkUser, async (req, res) => {
    try {
        // find the notebook 
        const notebook = await Notebook.findById(req.params.notebookId);
        if (!notebook) {
            return res.status(404).json({ status: 'Error', notebook: null, error: 'The requested notebook was not found' })
        }

        // To Check if the user is right one if user is not admin
        if (!req.user.isAdmin) {
            if (notebook.user.toString() !== req.user.id) {
                return res.status(403).json({ status: 'Error', error: 'Access denied' })
            }
        }

        notebook.title = req.body.title;
        const newNotebook = await notebook.save();
        res.status(201).json({ status: 'Success', notebook: newNotebook, error: null })

    } catch (error) {
        res.status(500).json({ status: 'Error', notebook: null, error: 'Internal server error' });
    }
})


// To delete notebooks using DELETE: /api/notebook/deletenotebook/:notebookId (Login required)
router.delete('/deletenotebook/:notebookId', checkUser, async (req, res) => {
    try {
        // find the notebook 
        const notebook = await Notebook.findById(req.params.notebookId);
        if (!notebook) {
            return res.status(404).json({ status: 'Error', notebook: null, error: 'The requested notebook was not found' })
        }

        // To Check if the user is right one if user is not admin
        if (!req.user.isAdmin) {
            if (notebook.user.toString() !== req.user.id) {
                return res.status(403).json({ status: 'Error', error: 'Access denied' })
            }
        }

        const deletedNotebook = await Notebook.findByIdAndDelete(req.params.notebookId)
        res.status(200).json({ status: 'Success', notebook: 'Notebook has been deleted', error: null })

    } catch (error) {

        res.status(500).json({ status: 'Error', notebook: null, error: 'Internal server error' });
    }
})

// <<<<<<---------------------------------------------NOTES CRUD---------------------------------------------------------->>>>>>

// To add a note using POST: /api/notebook/:notebookId/addnote (Login required)
router.post('/:notebookId/addnote', checkUser, async (req, res) => {
    try {
        const newNote = {
            title: req.body.title,
            tags: req.body.tags.toLowerCase(),
            description: req.body.description
        }

        const notebook = await Notebook.findById(req.params.notebookId);
        if (!notebook) {
            return res.status(404).json({ status: 'Error', notebook: null, error: 'The requested notebook was not found' })
        }
        // Check if the user is right one
        if (!req.user.isAdmin) {
            if (notebook.user.toString() !== req.user.id) {
                return res.status(403).json({ status: 'Error', error: 'Access denied' })
            }
        }

        notebook.notes.push(newNote);
        const newNotebook = await notebook.save();
        res.status(201).json({ status: 'Success', notebook: newNotebook, error: null })


    } catch (error) {
        res.status(500).json({ status: 'Error', notebook: null, error: 'Internal server error' });
    }
})


// To update note using PUT: /api/notebook/:notebookId/updatenote/:noteId (Login required)
router.put('/:notebookId/updatenote/:noteId', async (req, res) => {
    try {
        // find the notebook
        const notebook = await Notebook.findById(req.params.notebookId);
        if (!notebook) {
            return res.status(404).json({ status: 'Error', notebook: null, error: 'The requested notebook was not found' })
        }

        // To Check if the user is right one
        if (!req.user.isAdmin) {
            if (notebook.user.toString() !== req.user.id) {
                return res.status(403).json({ status: 'Error', error: 'Access denied' })
            }
        }

        // find the note
        const note = await notebook.notes.id(req.params.noteId)
        if (!note) {
            return res.status(404).json({ status: 'Error', notebook: notebook, error: 'The requested note was not found' })
        }

        note.title = req.body.title
        note.tags = req.body.tags
        note.description = req.body.description

        const updatedNotebook = await notebook.save();
        res.status(201).json({ status: 'Success', notebook: updatedNotebook, error: null })

    } catch (error) {
        res.status(500).json({ status: 'Error', note: null, error: 'Internal server error' });
    }
})

// To delete note using DELETE: /api/notebook/:notebookId/deletenote/:noteId (Login required)
router.delete('/:notebookId/deletenote/:noteId', async (req, res) => {
    try {
        // find the notebook
        const notebook = await Notebook.findById(req.params.notebookId);
        if (!notebook) {
            return res.status(404).json({ status: 'Error', notebook: null, error: 'The requested notebook was not found' })
        }

        // To Check if the user is right one
        if (!req.user.isAdmin) {
            if (notebook.user.toString() !== req.user.id) {
                return res.status(403).json({ status: 'Error', error: 'Access denied' })
            }
        }

        // find the note
        const note = await notebook.notes.id(req.params.noteId)
        if (!note) {
            return res.status(404).json({ status: 'Error', notebook: notebook, error: 'The requested note was not found' })
        }

        await notebook.notes.pull(req.params.noteId)
        const updatedNotebook = await notebook.save();
        res.status(200).json({ status: 'Success', notebook: updatedNotebook, error: null })

    } catch (error) {
        res.status(500).json({ status: 'Error', note: null, error: 'Internal server error' });
    }
})


module.exports = router;