import React, { useState } from "react";
import { Plus, Pin, Trash, Search, Edit3, Bookmark, FileText, CheckCircle } from "lucide-react";
import { Note } from "../types";

interface NotesManagerProps {
  notes: Note[];
  onAddNote: (note: Omit<Note, "id" | "createdAt">) => void;
  onUpdateNote: (note: Note) => void;
  onDeleteNote: (id: string) => void;
  subjects: string[];
}

export default function NotesManager({ notes, onAddNote, onUpdateNote, onDeleteNote, subjects = [] }: NotesManagerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("ALL");
  const [isCreating, setIsCreating] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);

  // New Note states
  const [newTitle, setNewTitle] = useState("");
  const [newSubject, setNewSubject] = useState(subjects[0] || "General Core");
  const [newContent, setNewContent] = useState("");

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;
    onAddNote({
      title: newTitle,
      subject: newSubject,
      content: newContent,
      pinned: false
    });
    setNewTitle("");
    setNewContent("");
    setIsCreating(false);
  };

  const handleUpdateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingNote || !editingNote.title.trim() || !editingNote.content.trim()) return;
    onUpdateNote(editingNote);
    setEditingNote(null);
  };

  const togglePin = (note: Note) => {
    onUpdateNote({
      ...note,
      pinned: !note.pinned
    });
  };

  const filteredNotes = notes.filter((n) => {
    const matchesSearch = n.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          n.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSubject = selectedSubject === "ALL" || n.subject === selectedSubject;
    return matchesSearch && matchesSubject;
  });

  // Sort notes so pinned ones show up first
  const sortedNotes = [...filteredNotes].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const subjectList = subjects.length > 0 ? subjects : ["General Core", "Data Structures", "Operating Systems", "Computer Networks"];

  return (
    <div className="max-w-4xl mx-auto px-6 py-6 font-sans">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* SIDEBAR: NOTES DIRECTORY & SEARCH */}
        <div className="md:col-span-1 space-y-4">
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4.5 space-y-4 backdrop-blur-sm">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-1.5 uppercase tracking-wider">
              <FileText className="w-4 h-4 text-indigo-400" />
              <span>Syllabus Notes</span>
            </h3>

            {/* Create Note button */}
            <button
              id="notes-btn-create"
              onClick={() => { setIsCreating(true); setEditingNote(null); }}
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center space-x-1 cursor-pointer transition-all active:scale-95 shadow"
            >
              <Plus className="w-4 h-4" />
              <span>Compose Quick Note</span>
            </button>

            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
              <input
                id="notes-search"
                type="text"
                placeholder="Search notes content..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-850 pl-9 pr-3 py-2 text-xs text-slate-300 placeholder-slate-650 outline-none rounded-xl"
              />
            </div>

            {/* Filter tags */}
            <div className="space-y-1.5">
              <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Filter Subject</div>
              <div className="flex flex-wrap gap-1">
                <button
                  id="note-filter-all"
                  onClick={() => setSelectedSubject("ALL")}
                  className={`px-2.5 py-1 text-[10px] font-semibold rounded ${
                    selectedSubject === "ALL" ? "bg-indigo-600 text-white" : "bg-slate-950 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  All (ALL)
                </button>
                {subjectList.map((sub, i) => (
                  <button
                    key={i}
                    id={`note-filter-${i}`}
                    onClick={() => setSelectedSubject(sub)}
                    className={`px-3 py-1 text-[10px] font-semibold rounded ${
                      selectedSubject === sub ? "bg-indigo-600 text-white" : "bg-slate-950 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {sub}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* WORK BENCH SIDE: COMPOSE / VIEW / EDIT */}
        <div className="md:col-span-2 space-y-4">
          
          {/* Note Form for Creating */}
          {isCreating && (
            <form onSubmit={handleCreateSubmit} className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4 backdrop-blur-sm">
              <div className="flex justify-between items-center pb-2.5 border-b border-slate-805/40">
                <span className="text-xs font-bold text-slate-350">Composer Portal</span>
                <button 
                  id="notes-btn-cancel-create"
                  type="button" 
                  onClick={() => setIsCreating(false)} 
                  className="text-slate-400 hover:text-slate-200 text-xs"
                >
                  Cancel
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 pb-1">
                <input
                  id="note-input-title"
                  type="text"
                  placeholder="Note Header Title..."
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="bg-slate-950 border border-slate-850 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-200 outline-none"
                  required
                />
                <select
                  id="note-input-subject"
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  className="bg-slate-950 border border-slate-850 rounded-xl p-2.5 text-xs font-semibold text-slate-200 outline-none"
                >
                  {subjectList.map((sub, i) => (
                    <option key={i} value={sub}>{sub}</option>
                  ))}
                </select>
              </div>

              <textarea
                id="note-input-content"
                rows={6}
                placeholder="Insert study definitions or revision notes. High-yielding pointers keep active recall fast!"
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                className="w-full bg-slate-950 border border-slate-850 rounded-xl p-4 text-xs leading-relaxed text-slate-300 outline-none resize-none"
                required
              />

              <button
                id="notes-sumbit-new"
                type="submit"
                className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-bold text-xs text-white cursor-pointer active:scale-95 transition-all"
              >
                Assemble Pinned Note Card
              </button>
            </form>
          )}

          {/* Note Form for Editing Card */}
          {editingNote && (
            <form onSubmit={handleUpdateSubmit} className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4 backdrop-blur-sm">
              <div className="flex justify-between items-center pb-2.5 border-b border-slate-805/40">
                <span className="text-xs font-bold text-indigo-300">Edit Mode</span>
                <button 
                  id="notes-btn-cancel-edit"
                  type="button" 
                  onClick={() => setEditingNote(null)} 
                  className="text-slate-400 hover:text-slate-200 text-xs"
                >
                  Close
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <input
                  id="note-edit-title"
                  type="text"
                  value={editingNote.title}
                  onChange={(e) => setEditingNote({ ...editingNote, title: e.target.value })}
                  className="bg-slate-950 border border-slate-850 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-200 outline-none"
                  required
                />
                <select
                  id="note-edit-subject"
                  value={editingNote.subject}
                  onChange={(e) => setEditingNote({ ...editingNote, subject: e.target.value })}
                  className="bg-slate-950 border border-slate-850 rounded-xl p-2.5 text-xs font-semibold text-slate-200 outline-none"
                >
                  {subjectList.map((sub, i) => (
                    <option key={i} value={sub}>{sub}</option>
                  ))}
                </select>
              </div>

              <textarea
                id="note-edit-content"
                rows={6}
                value={editingNote.content}
                onChange={(e) => setEditingNote({ ...editingNote, content: e.target.value })}
                className="w-full bg-slate-950 border border-slate-850 rounded-xl p-4 text-xs leading-relaxed text-slate-300 outline-none resize-none"
                required
              />

              <button
                id="notes-submit-edit"
                type="submit"
                className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-bold text-xs text-white cursor-pointer active:scale-95 transition-all"
              >
                Save Pinned Card Updates
              </button>
            </form>
          )}

          {/* NOTES LIST RENDER */}
          <div className="space-y-3">
            {sortedNotes.length === 0 ? (
              <div className="p-8 text-center bg-slate-90/40 border border-slate-800 rounded-2xl">
                <Bookmark className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                <p className="text-slate-400 text-xs font-semibold">No revision cards found</p>
                <p className="text-[10px] text-slate-500 mt-1">Compose notes based on subjects to support active retrieval.</p>
              </div>
            ) : (
              sortedNotes.map((note) => (
                <div 
                  key={note.id}
                  className={`bg-slate-900/60 border rounded-2xl p-5 hover:border-indigo-500/25 transition-all space-y-3 ${
                    note.pinned ? "border-indigo-500/40" : "border-slate-800"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-slate-100">{note.title}</span>
                        {note.pinned && <Pin className="w-3.5 h-3.5 text-indigo-400 fill-indigo-400" />}
                      </div>
                      <span className="inline-block text-[9px] px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 font-bold border border-indigo-500/20">
                        {note.subject}
                      </span>
                    </div>

                    <div className="flex space-x-2">
                      <button
                        id={`note-pin-${note.id}`}
                        onClick={() => togglePin(note)}
                        className={`p-1.5 rounded bg-slate-950 border text-slate-400 hover:text-indigo-400 hover:border-indigo-500/10 transition-all cursor-pointer ${
                          note.pinned ? "border-indigo-500/25 text-indigo-400" : "border-slate-850"
                        }`}
                        title="Pin this note card"
                      >
                        <Pin className="w-3.5 h-3.5" />
                      </button>
                      <button
                        id={`note-edit-trigger-${note.id}`}
                        onClick={() => { setEditingNote(note); setIsCreating(false); }}
                        className="p-1.5 rounded bg-slate-950 border border-slate-850 text-slate-400 hover:text-white transition-all cursor-pointer"
                        title="Edit note"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        id={`note-delete-${note.id}`}
                        onClick={() => onDeleteNote(note.id)}
                        className="p-1.5 rounded bg-slate-950 border border-slate-850 text-slate-400 hover:text-red-400 transition-all cursor-pointer"
                        title="Purge note"
                      >
                        <Trash className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-slate-350 leading-relaxed pr-2 font-light select-text">
                    {note.content}
                  </p>

                  <div className="text-[10px] text-slate-500 font-mono flex justify-between items-center pt-2 border-t border-slate-850/40">
                    <span>Stagger Date: {new Date(note.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
