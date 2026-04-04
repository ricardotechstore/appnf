// js/storage/migration.js
// Migração segura do localStorage para IndexedDB

(() => {
    const config = window.StorageConfig;
    const legacy = window.LegacyStorage;
    const idb = window.IndexedDBStorage;

    async function requestPersistentStorageIfAvailable() {
        try {
            if (navigator.storage && navigator.storage.persist) {
                return await navigator.storage.persist();
            }
            return false;
        } catch (error) {
            console.warn('Não foi possível solicitar persistência de storage:', error);
            return false;
        }
    }

    async function isMigrationDone() {
        const flag = await idb.getMeta(config.META_KEYS.MIGRATION_V1_DONE);
        return flag === true;
    }

    async function markMigrationDone(importedCount) {
        await idb.setMeta(config.META_KEYS.MIGRATION_V1_DONE, true);
        await idb.setMeta(config.META_KEYS.MIGRATION_V1_DATE, new Date().toISOString());
        await idb.setMeta(config.META_KEYS.MIGRATION_V1_COUNT, importedCount);
        await idb.setMeta(config.META_KEYS.STORAGE_MODE, config.DEFAULT_MODE);
    }

    async function migrateLegacyNotesIfNeeded() {
        await idb.openDatabase();
        await requestPersistentStorageIfAvailable();

        const alreadyDone = await isMigrationDone();
        if (alreadyDone) {
            return {
                migrated: false,
                reason: 'already_done',
                importedCount: 0
            };
        }

        const legacyNotes = legacy.exportLegacySnapshot();

        if (!Array.isArray(legacyNotes) || legacyNotes.length === 0) {
            await markMigrationDone(0);
            return {
                migrated: false,
                reason: 'no_legacy_data',
                importedCount: 0
            };
        }

        const sanitizedNotes = legacy.sanitizeNotesArray(legacyNotes);

        await idb.saveLegacyBackup({
            source: 'localStorage',
            legacyKey: config.LEGACY.NOTES_KEY,
            notes: sanitizedNotes
        });

        await idb.putNotes(sanitizedNotes);

        const importedCount = await idb.countNotes();

        if (importedCount < sanitizedNotes.length) {
            throw new Error(
                `Falha na validação da migração. Esperado >= ${sanitizedNotes.length}, obtido ${importedCount}`
            );
        }

        await markMigrationDone(sanitizedNotes.length);

        return {
            migrated: true,
            reason: 'imported',
            importedCount: sanitizedNotes.length
        };
    }

    window.StorageMigration = {
        requestPersistentStorageIfAvailable,
        isMigrationDone,
        migrateLegacyNotesIfNeeded
    };
})();
