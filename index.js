const Discord = require("discord.js")
const client = new Discord.Client({
    intents: [ // https://discordjs.guide/popular-topics/intents.html#enabling-intents
        Discord.GatewayIntentBits.Guilds,
        Discord.GatewayIntentBits.MessageContent,
        Discord.GatewayIntentBits.GuildMessages,
        Discord.GatewayIntentBits.GuildMembers
    ] // istediğinizi kaldırabilirsiniz.
})
const db = require('croxydb')
const config = require("./botConfig")
const fs = require("fs")
client.commands = new Discord.Collection();

const komutlarDosyasi = fs.readdirSync('./src/commands/')
// komutları yükleme
for (const kategori of komutlarDosyasi) {
    const commands = fs.readdirSync(`./src/commands/${kategori}`).filter((file) => file.endsWith('.js'));
    for (const file of commands) {
        const dosya = require(`./src/commands/${kategori}/${file}`);
        if (!dosya.execute || !dosya.slash) continue;
        client.commands.set(dosya.slash.name, dosya);
        console.log(`Komut ${dosya.slash.name} yüklendi. (Kategori: ${kategori})`);
    }
}

client.on("ready", async () => {

    client.user.setActivity({ state: "Hello world!", name: "Custom Status", type: Discord.ActivityType.Custom })

    // slash komutları gönderme
    const rest = new Discord.REST({ version: '10' }).setToken(config.bot.token);
    try {
        const commands = client.commands.map(module => module.slash);
        await rest.put(Discord.Routes.applicationCommands(client.user.id), { body: commands });
        console.log('Slash Komutlar yüklendi.');
    } catch (e) {
        console.error(e);
    }

    console.log(`${client.user.tag} olarak bağlanıldı.`)
})
// eventleri yükleme
fs.readdir('./src/events', (err, files) => {
    if (err) return console.error(err);
    files.filter(file => file.endsWith('.js')).forEach(file => {
        const event = require(`./src/events/${file}`);
        const eventad = file.slice(0, -3);
        client.on(eventad, (...args) => event(client, ...args));
        delete require.cache[require.resolve(`./src/events/${file}`)];
    });
});

client.on("interactionCreate", async (interaction) => { // modal
    if (!interaction.isModalSubmit()) return;
    if (interaction.customId == "modalId") {
        const ad = interaction.fields.getTextInputValue('input1');
        const bilgi = interaction.fields.getTextInputValue('input2');
        interaction.reply({ content: `${ad} - ${bilgi}`, ephemeral: true })
    }
})

client.login(config.bot.token || process.env.token).catch(err => {
    console.log("Bota bağlanılamadı. Gereken intentleri açmamış olabilir veya tokeni yanlış girmiş olabilirsiniz:")
    console.log(err)
})


client.on('guildMemberAdd', async (member) => {
    if(member.guild.id !== '1166068084042375199') return;
    const channel = member.guild.channels.cache.get(config.invite.inviteKanal)
    const invites = await member.guild.invites.fetch()
    const invite = invites.find((invite) => invite.inviter && invite.inviter.id !== client.user.id);
    db.add(`invite_${invite.inviter.id}`, 1)

    const embed = new Discord.EmbedBuilder()
    .setDescription(`📥 **${member.user.username}**, ${invite.inviter.username}(${db.fetch(`invite_${invite.inviter.id}`)} davete sahip.) tarafından davet edildi.`)
    .setColor("Green")
    db.set(`inviter_${member.id}`, `${invite.inviter.id}`)
     channel.send({embeds: [embed]})
});

client.on('guildMemberRemove', async (member) => {
    if(member.guild.id !== '1166068084042375199') return;
    const channel = member.guild.channels.cache.get(config.invite.inviteKanal)
    const inviter = db.fetch(`inviter_${member.id}`)
    await db.subtract(`invite_${inviter}`, 1) 
    const inviteCount = db.fetch(`invite_${inviter}`)
    const embed = new Discord.EmbedBuilder()
    .setDescription(`📤 <@${member.id}>, <@${inviter}> (${inviteCount} davete sahip.) tarafından davet edilmişti`)
    .setColor("Red")
   await channel.send({embeds: [embed]})

})