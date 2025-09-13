import Note from "../models/Note.js";

export const getAllNotes = async (_, res) => {
    try {
        const notes = await Note.find().sort({createdAt : -1});
        res.status(200).json(notes);
    } catch (error) {
        console.error("Error in getAllNotes controllers : ", error.message);
        res.status(500).json({message : "Internal server error."});
    }
};

export const createNote = async (req, res) => {
    try {
        const { title, content } = req.body;
        const createNote = new Note({ title, content });
        await createNote.save();
        res.status(201).json({message : "Note created successfully.", NoteValue : createNote})
    } catch (error) {
        console.error("Error in createNote controller : ", error.message);
        res.status(500).json({message : "Internal Server Error."});
    }
};

export const updateNote = async (req, res) => {
    try {
        const { title, content } = req.body;
        const Id = req.params.id;
        const updatedNote = await Note.findByIdAndUpdate(Id, {title, content}, {new : true});
        if (!updateNote) return res.status(404).json({message : "Note not found."});
        res.status(201).json(updatedNote);
    } catch (error) {
        console.error("Error in updateNote controller : ", error.message);
        res.status(500).json({message : "Internal server error."});
    }
};

export const deleteNote = async (req, res) => {
    try {
        const Id = req.params.id;
        await Note.findByIdAndDelete(Id);
        res.status(201).json({message : "Note deleted successfully."});
    } catch (error) {
        console.error("Error in deleteNote controller : ", error.message);
        res.status(500).json({message : "Internal server error."});
    }
};

export const getNoteById = async (req, res) => {
    try {
        const Id = req.params.id;
        const getNote = await Note.findById(Id);
        if (!getNote) return res.status(404).json({message : "Note not found."});
        res.status(201).json(getNote);
    } catch (error) {
        console.error("Error in getNoteById controller : ", error.message);
        res.status(500).json({message : "Internal server error."});
    }
};