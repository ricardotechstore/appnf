// js/storage/config.js
// Configuração central da camada de armazenamento

(() => {
    const CONFIG = {
        DB_NAME: 'nfReembolsoDB',
        DB_VERSION: 1,

        STORES: {
            NOTES: 'notes',
            META: 'meta',
            LEGACY_BACKUPS: 'legacy_backups'
        },

        LEGACY: {
            NOTES_KEY: 'nfReembolsoNotes'
        },

        META_KEYS: {
            MIGRATION_V1_DONE: 'migration_v1_done',
            MIGRATION_V1_DATE: 'migration_v1_date',
            MIGRATION_V1_COUNT: 'migration_v1_count',
            STORAGE_MODE: 'storage_mode'
        },

        STORAGE_MODE: {
            LEGACY: 'legacy',
            HYBRID: 'hybrid',
            INDEXEDDB: 'indexeddb'
        },

        DEFAULT_MODE: 'hybrid',

        ALLOWED_CATEGORIES: [
            'alimentacao',
            'transporte',
            'hospedagem',
            'material',
            'outros'
        ]
    };

    window.StorageConfig = Object.freeze(CONFIG);
})();
