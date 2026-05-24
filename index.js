const { Client, GatewayIntentBits, Events, REST, Routes } = require('discord.js');
const config = require('./config');
const db = require('./db');
const { getButtonRow, getAddModal, getRemoveModal, getCheckModal } = require('./buttons');
const { handleAddModal, handleRemoveModal, handleCheckModal } = require('./modals');
const embedBuilder = require('./embedBuilder');

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages]
});

client.once(Events.ClientReady, async () => {
    console.log(`✅ Бот запущен как ${client.user.tag}`);
    
    // Инициализация БД
    await db.initDB();
    
    // Регистрация слеш-команды
    await registerCommands();
    
    const channel = client.channels.cache.get(config.CHANNEL_ID);
    if (!channel) {
        console.error(`❌ Канал с ID ${config.CHANNEL_ID} не найден!`);
        return;
    }
    
    console.log(`✅ Бот готов. Для отправки панели используйте команду /panel в канале ${channel.name}`);
});

// Регистрация слеш-команд
async function registerCommands() {
    const commands = [
        {
            name: 'panel',
            description: 'Отправить панель управления чёрным списком (только администратор)'
        }
    ];
    
    const rest = new REST({ version: '10' }).setToken(config.TOKEN);
    
    try {
        console.log('🔄 Регистрация слеш-команды /panel...');
        await rest.put(
            Routes.applicationGuildCommands(client.user.id, config.GUILD_ID),
            { body: commands }
        );
        console.log('✅ Слеш-команда /panel зарегистрирована');
    } catch (error) {
        console.error('❌ Ошибка регистрации команды:', error);
    }
}

// Обработка кнопок
client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isButton()) return;
    
    switch (interaction.customId) {
        case 'add_blacklist':
            await interaction.showModal(getAddModal());
            break;
        case 'remove_blacklist':
            await interaction.showModal(getRemoveModal());
            break;
        case 'check_blacklist':
            await interaction.showModal(getCheckModal());
            break;
    }
});

// Обработка модальных окон
client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isModalSubmit()) return;
    
    switch (interaction.customId) {
        case 'modal_add':
            await handleAddModal(interaction);
            break;
        case 'modal_remove':
            await handleRemoveModal(interaction);
            break;
        case 'modal_check':
            await handleCheckModal(interaction);
            break;
    }
});

// Команда /panel
client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isChatInputCommand()) return;
    
    if (interaction.commandName === 'panel') {
        if (!interaction.member.permissions.has('Administrator')) {
            await interaction.reply({ content: '❌ Только администратор может отправлять панель', ephemeral: true });
            return;
        }
        
        const embed = embedBuilder.getMainPanelEmbed();
        const row = getButtonRow();
        
        await interaction.channel.send({ embeds: [embed], components: [row] });
        await interaction.reply({ content: '✅ Панель отправлена', ephemeral: true });
    }
});

client.login(config.TOKEN);