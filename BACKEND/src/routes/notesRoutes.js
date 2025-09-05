import express from "express";
import { createNote, deleteNote, getAllNotes, getNoteById, updateNote } from "../controllers/notesControllers.js";

const router = express.Router();
// Get all notes
router.get("/", getAllNotes);
// Get specific note
router.get("/:id", getNoteById);
// Create notes
router.post("/", createNote);
// Update notes
router.put("/:id", updateNote);
// Delete notes
router.delete("/:id", deleteNote);

export default router;
