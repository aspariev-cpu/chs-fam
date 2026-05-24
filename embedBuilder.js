const { EmbedBuilder } = require('discord.js');

// Главная панель с кнопками
function getMainPanelEmbed() {
    return new EmbedBuilder()
        .setTitle('📋 Чёрный список семьи Majestic RP')
        .setDescription('Используйте кнопки ниже для управления чёрным списком статиков')
        .setColor(0x2b2d31)
        .addFields(
            { name: '➖ Добавить', value: 'Внести статик в ЧС с указанием причины', inline: true },
            { name: '❌ Убрать', value: 'Исключить статик из ЧС с указанием причины вынесения', inline: true },
            { name: '🔍 Проверить', value: 'Проверить статик на наличие в ЧС', inline: true }
        )
        .setFooter({ text: 'Majestic RP Blacklist System' })
        .setTimestamp();
}

// Результат проверки
function getCheckResultEmbed(result, static_id) {
    if (result.status === 'active') {
        const data = result.data;
        return new EmbedBuilder()
            .setTitle('❌ Статик в чёрном списке')
            .setColor(0xff0000)
            .addFields(
                { name: '📌 Статик ID', value: `\`${static_id}\``, inline: true },
                { name: '📝 Причина занесения', value: data.reason, inline: false },
                { name: '👤 Добавил', value: `<@${data.added_by}>`, inline: true },
                { name: '📅 Дата добавления', value: new Date(data.added_at).toLocaleString('ru-RU'), inline: true }
            )
            .setFooter({ text: 'Статик числится в активном чёрном списке' });
    }
    
    if (result.status === 'history') {
        const data = result.data;
        return new EmbedBuilder()
            .setTitle('⚠️ Статик был в чёрном списке')
            .setColor(0xffa500)
            .addFields(
                { name: '📌 Статик ID', value: `\`${static_id}\``, inline: true },
                { name: '📝 Причина занесения', value: data.added_reason, inline: false },
                { name: '✅ Причина вынесения', value: data.removed_reason, inline: false },
                { name: '👤 Добавил', value: `<@${data.added_by}>`, inline: true },
                { name: '👤 Вынес', value: `<@${data.removed_by}>`, inline: true },
                { name: '📅 Дата вынесения', value: new Date(data.removed_at).toLocaleString('ru-RU'), inline: false }
            )
            .setFooter({ text: 'Статик исключён из чёрного списка' });
    }
    
    return new EmbedBuilder()
        .setTitle('✅ Статик чист')
        .setColor(0x00ff00)
        .addFields(
            { name: '📌 Статик ID', value: `\`${static_id}\``, inline: true }
        )
        .setFooter({ text: 'Статик не найден в чёрном списке' });
}

// Подтверждение добавления
function getAddConfirmEmbed(static_id, reason) {
    return new EmbedBuilder()
        .setTitle('✅ Статик добавлен в чёрный список')
        .setColor(0xff0000)
        .addFields(
            { name: '📌 Статик ID', value: `\`${static_id}\``, inline: true },
            { name: '📝 Причина', value: reason, inline: false }
        )
        .setTimestamp();
}

// Подтверждение удаления
function getRemoveConfirmEmbed(static_id, reason) {
    return new EmbedBuilder()
        .setTitle('✅ Статик исключён из чёрного списка')
        .setColor(0x00ff00)
        .addFields(
            { name: '📌 Статик ID', value: `\`${static_id}\``, inline: true },
            { name: '📝 Причина вынесения', value: reason, inline: false }
        )
        .setTimestamp();
}

module.exports = {
    getMainPanelEmbed,
    getCheckResultEmbed,
    getAddConfirmEmbed,
    getRemoveConfirmEmbed
};