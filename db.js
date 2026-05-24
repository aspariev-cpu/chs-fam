const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');

let db;

async function initDB() {
    db = await open({
        filename: path.join(__dirname, 'blacklist.db'),
        driver: sqlite3.Database
    });

    // Таблица активных записей (кто сейчас в ЧС)
    await db.exec(`
        CREATE TABLE IF NOT EXISTS blacklist_active (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            static_id TEXT UNIQUE NOT NULL,
            reason TEXT NOT NULL,
            added_by TEXT NOT NULL,
            added_by_name TEXT NOT NULL,
            added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // Таблица архива (история удалений)
    await db.exec(`
        CREATE TABLE IF NOT EXISTS blacklist_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            static_id TEXT NOT NULL,
            added_reason TEXT NOT NULL,
            removed_reason TEXT NOT NULL,
            added_by TEXT NOT NULL,
            added_by_name TEXT NOT NULL,
            removed_by TEXT NOT NULL,
            removed_by_name TEXT NOT NULL,
            added_at TIMESTAMP NOT NULL,
            removed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `);

    console.log('✅ База данных инициализирована');
    return db;
}

function getDB() {
    return db;
}

// Добавить в чёрный список
async function addToBlacklist(static_id, reason, userId, userName) {
    const db = getDB();
    try {
        await db.run(
            `INSERT INTO blacklist_active (static_id, reason, added_by, added_by_name) 
             VALUES (?, ?, ?, ?)`,
            [static_id, reason, userId, userName]
        );
        return { success: true };
    } catch (err) {
        if (err.message.includes('UNIQUE constraint failed')) {
            return { success: false, error: 'duplicate' };
        }
        return { success: false, error: err.message };
    }
}

// Проверить статик
async function checkStatic(static_id) {
    const db = getDB();
    
    // Сначала проверяем активный список
    const active = await db.get(
        `SELECT * FROM blacklist_active WHERE static_id = ?`,
        [static_id]
    );
    
    if (active) {
        return { status: 'active', data: active };
    }
    
    // Проверяем историю
    const history = await db.get(
        `SELECT * FROM blacklist_history WHERE static_id = ? ORDER BY removed_at DESC LIMIT 1`,
        [static_id]
    );
    
    if (history) {
        return { status: 'history', data: history };
    }
    
    return { status: 'clean' };
}

// Удалить из чёрного списка (переместить в историю)
async function removeFromBlacklist(static_id, reason, userId, userName) {
    const db = getDB();
    
    // Получаем активную запись
    const active = await db.get(
        `SELECT * FROM blacklist_active WHERE static_id = ?`,
        [static_id]
    );
    
    if (!active) {
        return { success: false, error: 'not_found' };
    }
    
    // Переносим в историю
    await db.run(
        `INSERT INTO blacklist_history 
         (static_id, added_reason, removed_reason, added_by, added_by_name, removed_by, removed_by_name, added_at) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            active.static_id,
            active.reason,
            reason,
            active.added_by,
            active.added_by_name,
            userId,
            userName,
            active.added_at
        ]
    );
    
    // Удаляем из активного списка
    await db.run(
        `DELETE FROM blacklist_active WHERE static_id = ?`,
        [static_id]
    );
    
    return { success: true };
}

module.exports = { initDB, getDB, addToBlacklist, checkStatic, removeFromBlacklist };