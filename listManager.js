const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const db = require('./db');

// Форматирование даты
function formatDate(dateString) {
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
    const data = await db.getActiveList(page, 10);
    
    if (data.total === 0) {
        return {
            content: '📋 **Чёрный список**\n\nСписок пуст. Никого нет в ЧС.',
            components: []
        };
    }
    
    let listText = `📋 **Чёрный список (активные) — страница ${data.page}/${data.totalPages}**\n\n`;
    
    for (let i = 0; i < data.items.length; i++) {
        const item = data.items[i];
        const num = (data.page - 1) * 10 + i + 1;
        listText += `${num}. Статик: \`${item.static_id}\` | Причина: ${item.reason} | Добавил: <@${item.added_by}> | ${formatDate(item.added_at)}\n`;
    }
    
    listText += `\n---\n📌 **Всего записей: ${data.total}**`;
    
    // Кнопки навигации
    const row = new ActionRowBuilder();
    
    if (data.page > 1) {
        row.addComponents(
            new ButtonBuilder()
                .setCustomId(`list_page_${data.page - 1}`)
                .setLabel('◀ Назад')
                .setStyle(ButtonStyle.Secondary)
        );
    }
    
    if (data.page < data.totalPages) {
        row.addComponents(
            new ButtonBuilder()
                .setCustomId(`list_page_${data.page + 1}`)
                .setLabel('Вперед ▶')
                .setStyle(ButtonStyle.Secondary)
        );
    }
    
    return {
        content: listText,
        components: row.components.length > 0 ? [row] : []
    };
}

module.exports = { buildListMessage };