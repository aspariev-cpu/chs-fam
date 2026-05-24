const db = require('./db');
const embedBuilder = require('./embedBuilder');
const { hasCouncilRole, hasHrRole } = require('./buttons');

async function handleAddModal(interaction) {
    // Проверка прав
    if (!hasCouncilRole(interaction)) {
        await interaction.reply({
            content: '❌ У вас нет прав на добавление в чёрный список. Требуется роль "Совет".',
            ephemeral: true
        });
        return;
    }

    const static_id = interaction.fields.getTextInputValue('static_id').trim();
    const reason = interaction.fields.getTextInputValue('reason').trim();

    // Валидация
    if (!/^\d+$/.test(static_id)) {
        await interaction.reply({
            content: '❌ Статик ID должен содержать только цифры',
            ephemeral: true
        });
        return;
    }

    const result = await db.addToBlacklist(
        static_id,
        reason,
        interaction.user.id,
        interaction.user.username
    );

    if (!result.success) {
        if (result.error === 'duplicate') {
            await interaction.reply({
                content: `❌ Статик \`${static_id}\` уже находится в чёрном списке`,
                ephemeral: true
            });
        } else {
            await interaction.reply({
                content: `❌ Ошибка: ${result.error}`,
                ephemeral: true
            });
        }
        return;
    }

    const embed = embedBuilder.getAddConfirmEmbed(static_id, reason);
    await interaction.reply({ embeds: [embed], ephemeral: true });
}

async function handleRemoveModal(interaction) {
    // Проверка прав
    if (!hasCouncilRole(interaction)) {
        await interaction.reply({
            content: '❌ У вас нет прав на удаление из чёрного списка. Требуется роль "Совет".',
            ephemeral: true
        });
        return;
    }

    const static_id = interaction.fields.getTextInputValue('static_id').trim();
    const reason = interaction.fields.getTextInputValue('reason').trim();

    if (!/^\d+$/.test(static_id)) {
        await interaction.reply({
            content: '❌ Статик ID должен содержать только цифры',
            ephemeral: true
        });
        return;
    }

    const result = await db.removeFromBlacklist(
        static_id,
        reason,
        interaction.user.id,
        interaction.user.username
    );

    if (!result.success) {
        if (result.error === 'not_found') {
            await interaction.reply({
                content: `❌ Статик \`${static_id}\` не найден в чёрном списке`,
                ephemeral: true
            });
        } else {
            await interaction.reply({
                content: `❌ Ошибка: ${result.error}`,
                ephemeral: true
            });
        }
        return;
    }

    const embed = embedBuilder.getRemoveConfirmEmbed(static_id, reason);
    await interaction.reply({ embeds: [embed], ephemeral: true });
}

async function handleCheckModal(interaction) {
    // Проверка прав (кадровик или совет)
    if (!hasCouncilRole(interaction) && !hasHrRole(interaction)) {
        await interaction.reply({
            content: '❌ У вас нет прав на проверку. Требуется роль "Совет" или "Кадровик".',
            ephemeral: true
        });
        return;
    }

    const static_id = interaction.fields.getTextInputValue('static_id').trim();

    if (!/^\d+$/.test(static_id)) {
        await interaction.reply({
            content: '❌ Статик ID должен содержать только цифры',
            ephemeral: true
        });
        return;
    }

    const result = await db.checkStatic(static_id);
    const embed = embedBuilder.getCheckResultEmbed(result, static_id);
    await interaction.reply({ embeds: [embed], ephemeral: true });
}

module.exports = {
    handleAddModal,
    handleRemoveModal,
    handleCheckModal
};