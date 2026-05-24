const { ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const config = require('./config');

// Создание панели с кнопками
function getButtonRow() {
    return new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('add_blacklist')
                .setLabel('➕ Добавить')
                .setStyle(ButtonStyle.Danger),
            new ButtonBuilder()
                .setCustomId('remove_blacklist')
                .setLabel('❌ Убрать')
                .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
                .setCustomId('check_blacklist')
                .setLabel('🔍 Проверить')
                .setStyle(ButtonStyle.Primary)
        );
}

// Модальное окно для добавления
function getAddModal() {
    const modal = new ModalBuilder()
        .setCustomId('modal_add')
        .setTitle('➕ Добавление в чёрный список');

    const staticInput = new TextInputBuilder()
        .setCustomId('static_id')
        .setLabel('Статик ID')
        .setPlaceholder('Введите числовой ID персонажа')
        .setRequired(true)
        .setStyle(TextInputStyle.Short);

    const reasonInput = new TextInputBuilder()
        .setCustomId('reason')
        .setLabel('Причина занесения')
        .setPlaceholder('Опишите причину добавления в ЧС')
        .setRequired(true)
        .setStyle(TextInputStyle.Paragraph);

    modal.addComponents(
        new ActionRowBuilder().addComponents(staticInput),
        new ActionRowBuilder().addComponents(reasonInput)
    );

    return modal;
}

// Модальное окно для удаления
function getRemoveModal() {
    const modal = new ModalBuilder()
        .setCustomId('modal_remove')
        .setTitle('❌ Удаление из чёрного списка');

    const staticInput = new TextInputBuilder()
        .setCustomId('static_id')
        .setLabel('Статик ID')
        .setPlaceholder('Введите числовой ID персонажа')
        .setRequired(true)
        .setStyle(TextInputStyle.Short);

    const reasonInput = new TextInputBuilder()
        .setCustomId('reason')
        .setLabel('Причина вынесения')
        .setPlaceholder('Опишите причину исключения из ЧС')
        .setRequired(true)
        .setStyle(TextInputStyle.Paragraph);

    modal.addComponents(
        new ActionRowBuilder().addComponents(staticInput),
        new ActionRowBuilder().addComponents(reasonInput)
    );

    return modal;
}

// Модальное окно для проверки
function getCheckModal() {
    const modal = new ModalBuilder()
        .setCustomId('modal_check')
        .setTitle('🔍 Проверка статика');

    const staticInput = new TextInputBuilder()
        .setCustomId('static_id')
        .setLabel('Статик ID')
        .setPlaceholder('Введите числовой ID персонажа')
        .setRequired(true)
        .setStyle(TextInputStyle.Short);

    modal.addComponents(new ActionRowBuilder().addComponents(staticInput));

    return modal;
}

// Проверка прав доступа
function hasCouncilRole(interaction) {
    return interaction.member.roles.cache.has(config.ROLE_COUNCIL_ID);
}

function hasHrRole(interaction) {
    return interaction.member.roles.cache.has(config.ROLE_HR_ID);
}

module.exports = {
    getButtonRow,
    getAddModal,
    getRemoveModal,
    getCheckModal,
    hasCouncilRole,
    hasHrRole
};