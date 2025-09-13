import { useEffect, useState } from "react"
import NavBar from "../components/NavBar"
import RateLimitedUI from "../components/RateLimitedUI";
import toast from "react-hot-toast";
import { Loader } from "lucide-react";
import NoteCard from "../components/NoteCard";
import api from "../lib/axios";
import NotesNotFound from "../components/NotesNotFound";

const HomePage = () => {
    const [isRateLimited, setIsRateLimited] = useState(false);
    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchNotes = async () => {
            try {
                const res = await api.get("/notes");
                setNotes(res.data);
                setIsRateLimited(false);
            } catch (error) {
                console.log("Error fetching notes : ", error.response);
                if (error.response?.status === 429) {
                    setIsRateLimited(true);
                } else {
                    toast.error("Failed to load notes.");
                }
            } finally {
                setLoading(false);
            }
        }

        fetchNotes();
    }, []);

  return (
    <div className="min-h-screen">
        <NavBar />

        {isRateLimited && <RateLimitedUI />}

        <div className="max-w-7xl mx-auto p-4 mt-6">
            {loading && <Loader className="animate-spin text-primary fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" size={36} />}

            {notes.length === 0 && !isRateLimited && <NotesNotFound />}

            {notes?.length > 0 && !isRateLimited && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {notes.map(note => (
                        <NoteCard key={note._id} note={note} setNotes={setNotes}/>
                    ))}
                </div>
            )}
        </div>
    </div>
  )
}

export default HomePage
