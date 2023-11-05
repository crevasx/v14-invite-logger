const Discord = require("discord.js")
const db = require('croxydb')
module.exports = {
    slash: new Discord.SlashCommandBuilder()
        .setName('invites')
        .setDescription('Kendi invite sayını veya girdiğiniz kullanıcının davet sayısını görürsün')
        .addUserOption(option => option.setName("kullanıcı").setDescription(`Kimin davetini görmek istersin`).setRequired(false)),
        // https://discordjs.guide/slash-commands/advanced-creation.html#adding-options
    execute: async (client, interaction) => {
        let user = interaction.options.getUser("kullanıcı") || interaction.user
      const amount = db.fetch(`invite_${user.id}`)
      const embed = new Discord.EmbedBuilder()
      .setDescription(`<@${user.id}> adlı kullanıcının **${amount}** daveti bulunuyor.`)
      interaction.reply({embeds: [embed]})
    }
}