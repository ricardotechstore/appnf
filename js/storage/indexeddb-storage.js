// js/storage/indexeddb-storage.js
// Camada principal de persistência em IndexedDB

(() => {
    const config = window.StorageConfig;
    let dbPromise = null;

    function openDatabase() {
        if (dbPromise) return dbPromise;

        dbPromise = new Promise((resolve, reject) => {
            const request = indexedDB.open(config.DB_NAME, config.DB_VERSION);

            request.onupgradeneeded = (event) => {
                const db = event.target.result;

                if (!db.objectStoreNames.contains(config.STORES.NOTES)) {
                    const notesStore = db.createObjectStore(config.STORES.NOTES, {
                        keyPath: 'id'
                    });

                    notesStore.createIndex('by_date', 'date', { unique: false });
                    notesStore.createIndex('by_category', 'category', { unique: false });
                    notesStore.createIndex('by_createdAt', 'createdAt', { unique: false });
                    notesStore.createIndex('by_value', 'value', { unique: false });
                }

                if (!db.objectStoreNames.contains(config.STORES.META)) {
                    db.createObjectStore(config.STORES.META, {
                        keyPath: 'key'
                    });
                }

                if (!db.objectStoreNames.contains(config.STORES.LEGACY_BACKUPS)) {
                    db.createObjectStore(config.STORES.LEGACY_BACKUPS, {
                        keyPath: 'id',
                        autoIncrement: true
                    });
                }
            };

            request.onsuccess = () => {
                const db = request.result;

                db.onversionchange = () => {
                    db.close();
                };

                resolve(db);
            };

            request.onerror = () => {
                reject(request.error || new Error('Falha ao abrir IndexedDB'));
            };

            request.onblocked = () => {
                console.warn('Abertura do IndexedDB bloqueada por outra aba/instância.');
            };
        });

        return dbPromise;
    }

    async function withStore(storeName, mode, executor) {
        const db = await openDatabase();

        return new Promise((resolve, reject) => {
            const tx = db.transaction(storeName, mode);
            const store = tx.objectStore(storeName);

            let result;

            try {
                result = executor(store, tx);
            } catch (error) {
                reject(error);
                return;
            }

            tx.oncomplete = () => resolve(result);
            tx.onerror = () => reject(tx.error || new Error(`Erro na transaction do store ${storeName}`));
            tx.onabort = () => reject(tx.error || new Error(`Transaction abortada no store ${storeName}`));
        });
    }

    async function getAllNotes() {
        const db = await openDatabase();

        return new Promise((resolve, reject) => {
            const tx = db.transaction(config.STORES.NOTES, 'readonly');
            const store = tx.objectStore(config.STORES.NOTES);
            const request = store.getAll();

            request.onsuccess = () => {
                resolve(Array.isArray(request.result) ? request.result : []);
            };

            request.onerror = () => {
                reject(request.error || new Error('Erro ao listar notas do IndexedDB'));
            };
        });
    }

    async function getNoteById(noteId) {
        const db = await openDatabase();

        return new Promise((resolve, reject) => {
            const tx = db.transaction(config.STORES.NOTES, 'readonly');
            const store = tx.objectStore(config.STORES.NOTES);
            const request = store.get(noteId);

            request.onsuccess = () => resolve(request.result || null);
            request.onerror = () => reject(request.error || new Error('Erro ao obter nota por ID'));
        });
    }

    async function putNote(note) {
        const db = await openDatabase();

        return new Promise((resolve, reject) => {
            const tx = db.transaction(config.STORES.NOTES, 'readwrite');
            const store = tx.objectStore(config.STORES.NOTES);
            const request = store.put(note);

            request.onsuccess = () => resolve(true);
            request.onerror = () => reject(request.error || new Error('Erro ao salvar nota no IndexedDB'));
        });
    }

    async function putNotes(notes) {
        const sanitized = Array.isArray(notes) ? notes : [];

        return withStore(config.STORES.NOTES, 'readwrite', (store) => {
            sanitized.forEach((note) => {
                store.put(note);
            });
            return true;
        });
    }

    async function deleteNote(noteId) {
        const db = await openDatabase();

        return new Promise((resolve, reject) => {
            const tx = db.transaction(config.STORES.NOTES, 'readwrite');
            const store = tx.objectStore(config.STORES.NOTES);
            const request = store.delete(noteId);

            request.onsuccess = () => resolve(true);
            request.onerror = () => reject(request.error || new Error('Erro ao excluir nota do IndexedDB'));
        });
    }

    async function clearNotes() {
        const db = await openDatabase();

        return new Promise((resolve, reject) => {
            const tx = db.transaction(config.STORES.NOTES, 'readwrite');
            const store = tx.objectStore(config.STORES.NOTES);
            const request = store.clear();

            request.onsuccess = () => resolve(true);
            request.onerror = () => reject(request.error || new Error('Erro ao limpar notas do IndexedDB'));
        });
    }

    async function countNotes() {
        const db = await openDatabase();

        return new Promise((resolve, reject) => {
            const tx = db.transaction(config.STORES.NOTES, 'readonly');
            const store = tx.objectStore(config.STORES.NOTES);
            const request = store.count();

            request.onsuccess = () => resolve(request.result || 0);
            request.onerror = () => reject(request.error || new Error('Erro ao contar notas no IndexedDB'));
        });
    }

    async function getMeta(key) {
        const db = await openDatabase();

        return new Promise((resolve, reject) => {
            const tx = db.transaction(config.STORES.META, 'readonly');
            const store = tx.objectStore(config.STORES.META);
            const request = store.get(key);

            request.onsuccess = () => {
                resolve(request.result ? request.result.value : null);
            };

            request.onerror = () => reject(request.error || new Error('Erro ao ler metadado'));
        });
    }

    async function setMeta(key, value) {
        const db = await openDatabase();

        return new Promise((resolve, reject) => {
            const tx = db.transaction(config.STORES.META, 'readwrite');
            const store = tx.objectStore(config.STORES.META);
            const request = store.put({ key, value });

            request.onsuccess = () => resolve(true);
            request.onerror = () => reject(request.error || new Error('Erro ao salvar metadado'));
        });
    }

    async function saveLegacyBackup(payload) {
        const db = await openDatabase();

        return new Promise((resolve, reject) => {
            const tx = db.transaction(config.STORES.LEGACY_BACKUPS, 'readwrite');
            const store = tx.objectStore(config.STORES.LEGACY_BACKUPS);
            const request = store.add({
                createdAt: new Date().toISOString(),
                payload
            });

            request.onsuccess = () => resolve(true);
            request.onerror = () => reject(request.error || new Error('Erro ao salvar backup legado'));
        });
    }

    window.IndexedDBStorage = {
        openDatabase,
        getAllNotes,
        getNoteById,
        putNote,
        putNotes,
        deleteNote,
        clearNotes,
        countNotes,
        getMeta,
        setMeta,
        saveLegacyBackup
    };
})();
