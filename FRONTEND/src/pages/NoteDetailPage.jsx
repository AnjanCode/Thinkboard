import { useEffect, useState } from "react"
import toast from "react-hot-toast";
import { Link, useNavigate, useParams } from "react-router";
import api from "../lib/axios";
import { ArrowLeftIcon, LoaderIcon, Trash2Icon } from "lucide-react";


const NoteDetailPage = () => {
  const [note, setNote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const navigate = useNavigate();

  const { id } = useParams();

  console.log({id})
  useEffect(() => {
    const fetchNote = async () => {
      try {
        const res = await api.get(`/notes/${id}`);
        setNote(res.data);
      } catch (error) {
        console.log("Failed to fetch the note : ", error);
        toast.error("Failed to fetch the note.");
      } finally {
        setLoading(false);
      }
    }

    fetchNote();
  }, [id]);



  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this note?")) return;

    try {
      await api.delete(`/notes/${id}`);
      toast.success("Note Deleted.");
      navigate("/");
    } catch (error) {
      console.log("Error deleting the note:", error);
      toast.error("Failed to delete note.");
    } 
  };

  const handleSaving = async () => {
    if (!note.title.trim() || !note.content.trim()) {
      toast.error("Plase add a title or content.");
      return;
    }
    setSaving(true);
    try {
      const a = await api.put(`/notes/${id}`, note);
      console.log(a);
      toast.success("Note Updated successfully.");
      navigate("/");
    } catch (error) {
      console.log("Error in updating note: ", error);
      toast.error("Error while updating note.");
    } finally {
      setSaving(false);
    }
  };
  if (loading) {
    return (
      <div className="min-h-screen bg-base-200 flex items-center justify-center">
        <LoaderIcon className="animate-spin size-10"/>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <Link to={'/'} className="btn btn-ghost">
              <ArrowLeftIcon className="h-5 w-5"/>
              Back To Notes
            </Link>
            <button onClick={handleDelete} className="btn btn-error btn-outline">
              <Trash2Icon className="h-5 w-5"/>
              Delete Note
            </button>
          </div>

          <div className="card bg-base-100">
            <div className="card-body">
              <div className="flex flex-col mb-4">
                <label htmlFor="title" className="label mb-2">
                  <span className="label-text">Title</span>
                </label>
                <input 
                  type="text"
                  placeholder="Note title"
                  className="input input-bordered w-full"
                  value={note.title}
                  onChange={(e) => setNote({ ...note, title: e.target.value})}
                />
              </div>

              <div className="flex flex-col mb-4">
                <label htmlFor="content" className="label mb-2">
                  <span className="label-text">Content</span>
                </label>
                <textarea 
                  placeholder="Write your note here..."
                  className="textarea textarea-bordered h-48 w-full"
                  value={note.content}
                  onChange={(e) => setNote({ ...note, content: e.target.value})}
                />
              </div>

              <div className="card-actions justify-end">
                <button className="btn btn-primary" disabled={saving} onClick={handleSaving}>
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default NoteDetailPage;
