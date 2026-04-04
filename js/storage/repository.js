// js/storage/repository.js
// Repositório único consumido pelo app

(() => {
    const legacy = window.LegacyStorage;
    const idb = window.IndexedDBStorage;

    function sortNotesByDefault(notes) {
        return [...notes].sort((a, b) => {
            const aDate = a.createdAt || `${a.date || ''}T00:00:00.000Z`;
            const bDate = b.createdAt || `${b.date || ''}T00:00:00.000Z`;

            if (aDate < bDate) return 1;
            if (aDate > bDate) return -1;

            const aId = String(a.id || '');
            const bId = String(b.id || '');

            if (aId < bId) return 1;
            if (aId > bId) return -1;

            return 0;
        });
    }

    async function initialize() {
        await idb.openDatabase();
        await window.StorageMigration.migrateLegacyNotesIfNeeded();
    }

    async function getNotes() {
        try {
            const notes = await idb.getAllNotes();

            if (Array.isArray(notes) && notes.length > 0) {
                return sortNotesByDefault(legacy.sanitizeNotesArray(notes));
            }

            const legacyNotes = legacy.loadNotes();
            return sortNotesByDefault(legacyNotes);
        } catch (error) {
            console.error('Erro ao obter notas do IndexedDB. Usando legado:', error);
            return sortNotesByDefault(legacy.loadNotes());
        }
    }

    async function saveNote(note) {
        const normalizedNote = legacy.normalizeNote(note);
        if (!normalizedNote) {
            throw new Error('Nota inválida para salvar');
        }

        await idb.putNote(normalizedNote);

        // Escrita-sombra no legado para reduzir risco na fase inicial
        const legacyNotes = legacy.loadNotes().filter(item => item.id !== normalizedNote.id);
        legacy.saveNotes([normalizedNote, ...legacyNotes]);

        return normalizedNote;
    }

    async function deleteNote(noteId) {
        await idb.deleteNote(noteId);

        // Mantém legado sincronizado durante a fase híbrida
        const updatedLegacy = legacy.loadNotes().filter(note => note.id !== noteId);
        legacy.saveNotes(updatedLegacy);

        return true;
    }

    async function exportNotes() {
        return await getNotes();
    }

    window.NotesRepository = {
        initialize,
        getNotes,
        saveNote,
        deleteNote,
        exportNotes
    };
})();
