require('dotenv').config();

const {
  Client,
  GatewayIntentBits,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  EmbedBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  PermissionsBitField,
  ButtonBuilder,
  ButtonStyle,
  AttachmentBuilder
} = require('discord.js');
const fs = require('fs');

const TOKEN = process.env.TOKEN;
const config = require('./config.json');

// Función para obtener configuración del servidor
function getConfig(guildId) {
  return config[guildId];
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

client.once('ready', async () => {
  console.log(`✅ Bot iniciado como ${client.user.tag}`);

  const canal = await client.channels.fetch(CANAL_ID);
  if (!canal) return console.log('❌ Canal no encontrado.');

  const embed = new EmbedBuilder()
    .setTitle('🌎 ¡LISTO PARA COMPRAR!')
    .setDescription(
      'Selecciona tu **país de compra** para ver los métodos de pago disponibles.\n\n' +
      '⚠️ **Importante:** No compartas contraseñas ni envíes dinero a nadie que no sea confirmado por el bot o el staff.\n\n' +
      '💙 ¡Gracias por confiar en **UF Shop**!'
    )
    .setColor(0x2b8cff)
    .setImage('https://cdn.discordapp.com/attachments/1419831102779953294/1426009467287240784/IMG-20251001-WA0029.jpg')
    .setAuthor({
      name: 'UF Shop Bot',
      iconURL: 'https://cdn.discordapp.com/attachments/1419831102779953294/1426009467287240784/IMG-20251001-WA0029.jpg'
    })
    .setFooter({
      text: '© UF Shop 2025 | Confianza y rapidez 💙',
      iconURL: 'https://cdn.discordapp.com/attachments/1419831102779953294/1426009467287240784/IMG-20251001-WA0029.jpg'
    });

  const menuPaises = new StringSelectMenuBuilder()
    .setCustomId('seleccionar_pais')
    .setPlaceholder('Selecciona tu país')
    .addOptions([
      { label: 'Global', value: 'global', emoji: '🌍' },
      { label: 'Colombia', value: 'colombia', emoji: '🇨🇴' },
      { label: 'Perú', value: 'peru', emoji: '🇵🇪' },
      { label: 'México', value: 'mexico', emoji: '🇲🇽' },
    ]);

  const row = new ActionRowBuilder().addComponents(menuPaises);

  const mensajes = await canal.messages.fetch({ limit: 10 });
  const yaExiste = mensajes.find(m => m.author.id === client.user.id);
  if (!yaExiste) {
    await canal.send({ embeds: [embed], components: [row] });
    console.log('📨 Mensaje enviado con selector de país.');
  }
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isStringSelectMenu() && !interaction.isModalSubmit() && !interaction.isButton()) return;

  // === PASO 1: Seleccionar país ===
  if (interaction.customId === 'seleccionar_pais') {
    const pais = interaction.values[0];

    let metodoPlaceholder = '';
    switch (pais) {
      case 'colombia': metodoPlaceholder = 'Nequi, Bancolombia'; break;
      case 'peru': metodoPlaceholder = 'Yape'; break;
      case 'mexico': metodoPlaceholder = 'OXXO, Banco Santander'; break;
      default: metodoPlaceholder = 'Tarjeta, PayPal, Criptomonedas (Binance ID)'; break;
    }

    const modal = new ModalBuilder()
      .setCustomId(`modal_compra_${pais}`)
      .setTitle(`🛒 Compra - ${pais.toUpperCase()}`);

    const producto = new TextInputBuilder()
      .setCustomId('producto')
      .setLabel('¿Qué vas a comprar?')
      .setPlaceholder("Ej: Robux")
      .setStyle(TextInputStyle.Short)
      .setRequired(true);

    const cantidad = new TextInputBuilder()
      .setCustomId('cantidad')
      .setLabel('¿Cuánto vas a comprar?')
      .setPlaceholder("Ej: 1000")
      .setStyle(TextInputStyle.Short)
      .setRequired(true);

    const metodo = new TextInputBuilder()
      .setCustomId('metodo')
      .setLabel('Método de pago')
      .setPlaceholder(metodoPlaceholder)
      .setStyle(TextInputStyle.Short)
      .setRequired(true);

    const propina = new TextInputBuilder()
      .setCustomId('propina')
      .setLabel('¿Darás propina?')
      .setPlaceholder("Escribe Si/No")
      .setStyle(TextInputStyle.Short)
      .setRequired(true);

    modal.addComponents(
      new ActionRowBuilder().addComponents(producto),
      new ActionRowBuilder().addComponents(cantidad),
      new ActionRowBuilder().addComponents(metodo),
      new ActionRowBuilder().addComponents(propina)
    );

    await interaction.showModal(modal);
  }

  // === PASO 2: Crear ticket ===
  if (interaction.isModalSubmit() && interaction.customId.startsWith('modal_compra_')) {
    const pais = interaction.customId.split('_')[2];
    const producto = interaction.fields.getTextInputValue('producto');
    const cantidad = interaction.fields.getTextInputValue('cantidad');
    const metodo = interaction.fields.getTextInputValue('metodo');
    const propina = interaction.fields.getTextInputValue('propina');
    const guild = interaction.guild;

    const canal = await guild.channels.create({
      name: `🛒┃ticket-${interaction.user.username}`,
      type: 0,
      parent: CATEGORIA_TICKETS_ID,
      permissionOverwrites: [
        { id: guild.id, deny: [PermissionsBitField.Flags.ViewChannel] },
        { id: interaction.user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ReadMessageHistory] },
        { id: ROLE_STAFF_ID, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ReadMessageHistory] }
      ]
    });

    const resumen = new EmbedBuilder()
      .setColor(0x2b8cff)
      .setTitle(`🧾 Pedido de ${interaction.user.username}`)
      .setDescription(
        `**¿Qué vas a comprar?**\n${producto}\n\n` +
        `**¿Cuánto vas a comprar?**\n${cantidad}\n\n` +
        `**Método de pago**\n${metodo}\n\n` +
        `**Propina**\n${propina}\n\n` +
        `**País:** ${pais.toUpperCase()}`
      )
      .setThumbnail(interaction.user.displayAvatarURL())
      .setTimestamp();

    const botonCerrar = new ButtonBuilder()
      .setCustomId('cerrar_ticket')
      .setLabel('Cerrar')
      .setEmoji('🔒')
      .setStyle(ButtonStyle.Danger);

    const rowBotones = new ActionRowBuilder().addComponents(botonCerrar);

    await canal.send({
      content: `<@&${ROLE_STAFF_ID}> 🔔 Nuevo pedido de <@${interaction.user.id}>`,
      embeds: [resumen],
      components: [rowBotones],
    });

    await interaction.reply({
      content: `✅ Tu ticket ha sido creado: ${canal}`,
      ephemeral: true,
    });
  }

  // === PASO 3: Cerrar ticket ===
  if (interaction.isButton() && interaction.customId === 'cerrar_ticket') {
    const canal = interaction.channel;
    const user = interaction.user;

    await canal.permissionOverwrites.edit(user.id, { ViewChannel: false });

    const embedCerrado = new EmbedBuilder()
      .setColor(0xff5555)
      .setTitle('🔒 Ticket cerrado')
      .setDescription(`El ticket ha sido cerrado por <@${user.id}>.\nSolo el staff puede verlo ahora.`)
      .setTimestamp();

    const botonReabrir = new ButtonBuilder()
      .setCustomId('reabrir_ticket')
      .setLabel('Reabrir')
      .setEmoji('🔓')
      .setStyle(ButtonStyle.Success);

    const botonGuardar = new ButtonBuilder()
      .setCustomId('guardar_ticket')
      .setLabel('Guardar')
      .setEmoji('💾')
      .setStyle(ButtonStyle.Primary);

    const botonEliminar = new ButtonBuilder()
      .setCustomId('eliminar_ticket')
      .setLabel('Eliminar')
      .setEmoji('🗑️')
      .setStyle(ButtonStyle.Secondary);

    const row = new ActionRowBuilder().addComponents(botonReabrir, botonGuardar, botonEliminar);

    await canal.send({
      content: `<@&${ROLE_STAFF_ID}> ⚠️ El ticket ha sido cerrado.`,
      embeds: [embedCerrado],
      components: [row]
    });

    await interaction.reply({ content: '✅ Has cerrado este ticket.', ephemeral: true });
  }

  // === PASO 4: Reabrir ticket ===
  if (interaction.isButton() && interaction.customId === 'reabrir_ticket') {
    const canal = interaction.channel;
    const user = interaction.user;
    const ticketOwner = canal.name.split('ticket-')[1];
    const miembro = canal.guild.members.cache.find(m => m.user.username === ticketOwner);

    if (miembro) {
      await canal.permissionOverwrites.edit(miembro.id, {
        ViewChannel: true,
        SendMessages: true,
        ReadMessageHistory: true
      });
    }

    await interaction.reply({ content: '🔓 Ticket reabierto.', ephemeral: true });
  }

  // === PASO 5: Guardar ticket (transcripción completa) ===
  if (interaction.isButton() && interaction.customId === 'guardar_ticket') {
    const canal = interaction.channel;
    const mensajes = await canal.messages.fetch({ limit: 100 });
    const contenido = mensajes
      .reverse()
      .map(m => `[${m.author?.tag || 'Desconocido'}]: ${m.content}`)
      .join('\n');

    const archivo = `ticket-${canal.name}.txt`;
    fs.writeFileSync(archivo, contenido);

    const file = new AttachmentBuilder(archivo);
    const logEmbed = new EmbedBuilder()
      .setColor(0x2b8cff)
      .setTitle('💾 Ticket guardado')
      .setDescription(`Ticket: ${canal.name}\nGuardado por <@${interaction.user.id}>`)
      .setTimestamp();

    const logChannel = await client.channels.fetch(LOGS_CHANNEL_ID);
    await logChannel.send({ embeds: [logEmbed], files: [file] });

    fs.unlinkSync(archivo);
    await interaction.reply({ content: '💾 Ticket guardado correctamente.', ephemeral: true });
  }

  // === PASO 6: Eliminar ticket ===
  if (interaction.isButton() && interaction.customId === 'eliminar_ticket') {
    await interaction.reply({ content: '🗑️ Eliminando ticket...', ephemeral: true });
    setTimeout(() => interaction.channel.delete(), 2000);
  }
});

client.login(process.env.TOKEN);

// === Mantener el servicio vivo en Render ===
const express = require("express");
const app = express();

app.get("/", (req, res) => {
    res.send("Bot de UF Shop activo 24/7 🔥");
});

// Render usa process.env.PORT
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`🌐 Servidor web escuchando en el puerto ${PORT}`);
});