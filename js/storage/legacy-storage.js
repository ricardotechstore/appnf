// js/storage/legacy-storage.js
// Camada de compatibilidade com o localStorage atual

(() => {
    const config = window.StorageConfig;

    function getTodayDateString() {
        return new Date().toISOString().split('T')[0];
    }

    function isValidDateString(value) {
        return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value);
    }

    function isValidISODateTime(value) {
        return typeof value === 'string' && !Number.isNaN(Date.parse(value));
    }

    function isValidCategory(category) {
        return config.ALLOWED_CATEGORIES.includes(category);
    }

    function normalizeNote(note) {
        if (!note || typeof note !== 'object') {
            return null;
        }

        const normalizedId =
            note.id !== undefined && note.id !== null && String(note.id).trim() !== ''
                ? String(note.id)
                : `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

        const numericValue = Number(note.value);
        const normalizedValue = Number.isFinite(numericValue) ? numericValue : 0;

        const normalizedDate = isValidDateString(note.date)
            ? note.date
            : getTodayDateString();

        const normalizedDescription =
            typeof note.description === 'string'
                ? note.description
                : 'Sem descrição';

        const normalizedCategory = isValidCategory(note.category)
            ? note.category
            : 'outros';

        const normalizedPhoto =
            typeof note.photo === 'string'
                ? note.photo
                : '';

        const normalizedCreatedAt = isValidISODateTime(note.createdAt)
            ? note.createdAt
            : new Date(`${normalizedDate}T00:00:00`).toISOString();

        return {
            id: normalizedId,
            value: normalizedValue,
            date: normalizedDate,
            description: normalizedDescription,
            category: normalizedCategory,
            photo: normalizedPhoto,
            createdAt: normalizedCreatedAt
        };
    }

    function sanitizeNotesArray(notes) {
        if (!Array.isArray(notes)) return [];

        const seenIds = new Set();
        const sanitized = [];

        for (const item of notes) {
            const normalized = normalizeNote(item);
            if (!normalized) continue;

            if (seenIds.has(normalized.id)) {
                normalized.id = `${normalized.id}-${Math.random().toString(36).slice(2, 6)}`;
            }

            seenIds.add(normalized.id);
            sanitized.push(normalized);
        }

        return sanitized;
    }

    function loadNotes() {
        try {
            const raw = localStorage.getItem(config.LEGACY.NOTES_KEY);
            if (!raw) return [];
            const parsed = JSON.parse(raw);
            return sanitizeNotesArray(parsed);
        } catch (error) {
            console.error('Erro ao carregar notas do localStorage:', error);
            return [];
        }
    }

    function saveNotes(notes) {
        try {
            const sanitized = sanitizeNotesArray(notes);
            localStorage.setItem(config.LEGACY.NOTES_KEY, JSON.stringify(sanitized));
            return true;
        } catch (error) {
            console.error('Erro ao salvar notas no localStorage:', error);
            return false;
        }
    }

    function hasLegacyNotes() {
        return loadNotes().length > 0;
    }

    function clearLegacyNotes() {
        try {
            localStorage.removeItem(config.LEGACY.NOTES_KEY);
            return true;
        } catch (error) {
            console.error('Erro ao limpar notas legadas:', error);
            return false;
        }
    }

    function exportLegacySnapshot() {
        return loadNotes();
    }

    function getLegacyRawJson() {
        try {
            return localStorage.getItem(config.LEGACY.NOTES_KEY);
        } catch (error) {
            console.error('Erro ao ler JSON bruto do legado:', error);
            return null;
        }
    }

    window.LegacyStorage = {
        normalizeNote,
        sanitizeNotesArray,
        loadNotes,
        saveNotes,
        hasLegacyNotes,
        clearLegacyNotes,
        exportLegacySnapshot,
        getLegacyRawJson
    };
})();
