module.exports = async (client, interaction) => {
    if (!interaction.isChatInputCommand()) return; // https://old.discordjs.dev/#/docs/discord.js/main/class/CommandInteraction?scrollTo=isChatInputCommand
    const command = client.commands.get(interaction.commandName)
    if (!command) return interaction.reply({ content: "Bir hata oluştu ve kendini burada buldun.", ephemeral: true })
    command.execute(client, interaction)
}