const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const db = require('./db');

// Форматирование даты
function formatDate(dateString) {
    if (!dateString) return 'Нет даты';
    const date = new Date(dateString);
    return date.toLocaleString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Создание текстового списка
async function buildListMessage(page = 1) {
    try {
        // Используем прямой доступ к БД через getRawDB
        const dbInstance = db.getRawDB();
        
        if (!dbInstance) {
            return {
                content: '❌ Ошибка: База данных не инициализирована',
                components: []
            };
        }
        
        // Прямой SQL запрос
        const totalResult = await dbInstance.get(`SELECT COUNT(*) as total FROM blacklist_active`);
        const total = totalResult.total;
        
        console.log(`[DEBUG] Всего записей в blacklist_active: ${total}`);
        
        if (total === 0) {
            return {
                content: '📋 **Чёрный список**\n\nСписок пуст. Никого нет в ЧС.\n\n(Проверь, что записи добавлялись через этого бота)',
                components: []
            };
        }
        
        const pageSize = 10;
        const offset = (page - 1) * pageSize;
        const totalPages = Math.ceil(total / pageSize);
        
        // Прямой запрос данных
        const items = await dbInstance.all(
            `SELECT static_id, reason, added_by, added_by_name, added_at 
             FROM blacklist_active 
             ORDER BY added_at DESC 
             LIMIT ? OFFSET ?`,
            [pageSize, offset]
        );
        
        console.log(`[DEBUG] Получено записей для страницы ${page}: ${items.length}`);
        
        let listText = `📋 **Чёрный список (активные) — страница ${page}/${totalPages}**\n\n`;
        
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            const num = offset + i + 1;
            listText += `${num}. Статик: \`${item.static_id}\` | Причина: ${item.reason} | Добавил: <@${item.added_by}> | ${formatDate(item.added_at)}\n`;
        }
        
        listText += `\n---\n📌 **Всего записей: ${total}**`;
        
        // Кнопки навигации
        const row = new ActionRowBuilder();
        
        if (page > 1) {
            row.addComponents(
                new ButtonBuilder()
                    .setCustomId(`list_page_${page - 1}`)
                    .setLabel('◀ Назад')
                    .setStyle(ButtonStyle.Secondary)
            );
        }
        
        if (page < totalPages) {
            row.addComponents(
                new ButtonBuilder()
                    .setCustomId(`list_page_${page + 1}`)
                    .setLabel('Вперед ▶')
                    .setStyle(ButtonStyle.Secondary)
            );
        }
        
        return {
            content: listText,
            components: row.components.length > 0 ? [row] : []
        };
        
    } catch (error) {
        console.error('Ошибка в buildListMessage:', error);
        return {
            content: `❌ Ошибка при загрузке списка: ${error.message}\n\nПроверь консоль хостинга.`,
            components: []
        };
    }
}

module.exports = { buildListMessage };
