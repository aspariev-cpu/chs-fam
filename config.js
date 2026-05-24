require('dotenv').config();

module.exports = {
    TOKEN: process.env.DISCORD_TOKEN,
    CHANNEL_ID: process.env.CHANNEL_ID,
    ROLE_COUNCIL_ID: process.env.ROLE_COUNCIL_ID,
    ROLE_HR_ID: process.env.ROLE_HR_ID,
    GUILD_ID: process.env.GUILD_ID
};