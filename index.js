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

// ========== READY ==========
client.once('ready', async () => {
  console.log(`✅ Bot iniciado como ${client.user.tag}`);

  client.guilds.cache.forEach(async guild => {
    const cfg = getConfig(guild.id);
    if (!cfg) {
      console.log(`⚠️ No hay config para el servidor: ${guild.name}`);
      return;
    }

    try {
      const canal = await client.channels.fetch(cfg.CANAL_ID);
      if (!canal) {
        console.log(`❌ Canal no encontrado en ${guild.name}`);
        return;
      }

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

      const mensajes = await canal.messages.fetch({ limit: 15 });
      const yaExiste = mensajes.find(m => m.author.id === client.user.id);

      if (!yaExiste) {
        await canal.send({ embeds: [embed], components: [row] });
        console.log(`📨 Panel enviado en ${guild.name}`);
      }
    } catch (err) {
      console.log(`❌ Error en ${guild.name}:`, err.message);
    }
  });
});

// ========= INTERACTIONS ==========
client.on('interactionCreate', async interaction => {
  if (!interaction.guild) return;
  const cfg = getConfig(interaction.guild.id);
  if (!cfg) return;

  if (!interaction.isStringSelectMenu() &&
      !interaction.isModalSubmit() &&
      !interaction.isButton()) return;

  // ===== PASO 1: Seleccionar país =====
  if (interaction.customId === 'seleccionar_pais') {
    const pais = interaction.values[0];

    let metodoPlaceholder = '';
    switch (pais) {
      case 'colombia': metodoPlaceholder = 'Nequi, Bancolombia'; break;
      case 'peru': metodoPlaceholder = 'Yape'; break;
      case 'mexico': metodoPlaceholder = 'OXXO, Santander'; break;
      default: metodoPlaceholder = 'Tarjeta, PayPal, Cripto...'; break;
    }

    const modal = new ModalBuilder()
      .setCustomId(`modal_compra_${pais}`)
      .setTitle(`🛒 Compra - ${pais.toUpperCase()}`);

    modal.addComponents(
      new ActionRowBuilder().addComponents(
        new TextInputBuilder()
          .setCustomId('producto')
          .setLabel('¿Qué vas a comprar?')
          .setStyle(TextInputStyle.Short)
          .setRequired(true)
      ),
      new ActionRowBuilder().addComponents(
        new TextInputBuilder()
          .setCustomId('cantidad')
          .setLabel('¿Cuánto vas a comprar?')
          .setStyle(TextInputStyle.Short)
          .setRequired(true)
      ),
      new ActionRowBuilder().addComponents(
        new TextInputBuilder()
          .setCustomId('metodo')
          .setLabel('Método de pago')
          .setPlaceholder(metodoPlaceholder)
          .setStyle(TextInputStyle.Short)
          .setRequired(true)
      ),
      new ActionRowBuilder().addComponents(
        new TextInputBuilder()
          .setCustomId('propina')
          .setLabel('¿Darás propina?')
          .setStyle(TextInputStyle.Short)
          .setRequired(true)
      )
    );

    return interaction.showModal(modal);
  }

  // ===== PASO 2: Crear ticket =====
  if (interaction.isModalSubmit() && interaction.customId.startsWith('modal_compra_')) {
    const pais = interaction.customId.split('_')[2];
    const producto = interaction.fields.getTextInputValue('producto');
    const cantidad = interaction.fields.getTextInputValue('cantidad');
    const metodo = interaction.fields.getTextInputValue('metodo');
    const propina = interaction.fields.getTextInputValue('propina');

    const canal = await interaction.guild.channels.create({
      name: `🛒┃ticket-${interaction.user.username}`,
      type: 0,
      parent: cfg.CATEGORIA_TICKETS_ID,
      permissionOverwrites: [
        { id: interaction.guild.id, deny: [PermissionsBitField.Flags.ViewChannel] },
        { id: interaction.user.id,
          allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages]
        },
        { id: cfg.ROLE_STAFF_ID,
          allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages]
        }
      ]
    });

    const embed = new EmbedBuilder()
      .setColor(0x2b8cff)
      .setTitle(`🧾 Pedido de ${interaction.user.username}`)
      .setDescription(
        `**Producto:** ${producto}\n` +
        `**Cantidad:** ${cantidad}\n` +
        `**Pago:** ${metodo}\n` +
        `**Propina:** ${propina}\n` +
        `**País:** ${pais.toUpperCase()}`
      )
      .setThumbnail(interaction.user.displayAvatarURL())
      .setTimestamp();

    const botonCerrar = new ButtonBuilder()
      .setCustomId('cerrar_ticket')
      .setLabel('Cerrar')
      .setEmoji('🔒')
      .setStyle(ButtonStyle.Danger);

    await canal.send({
      content: `<@&${cfg.ROLE_STAFF_ID}> 🔔 Nuevo pedido de <@${interaction.user.id}>`,
      embeds: [embed],
      components: [new ActionRowBuilder().addComponents(botonCerrar)]
    });

    return interaction.reply({
      content: `✅ Tu ticket ha sido creado: ${canal}`,
      ephemeral: true
    });
  }

  // ===== PASO 3: Cerrar ticket =====
  if (interaction.isButton() && interaction.customId === 'cerrar_ticket') {
    await interaction.reply({ content: '🔒 Ticket cerrado', ephemeral: true });

    await interaction.channel.send({
      content: `<@&${cfg.ROLE_STAFF_ID}> El ticket ha sido cerrado.`,
      embeds: [
        new EmbedBuilder()
          .setColor(0xff5555)
          .setTitle('🔒 Ticket cerrado')
          .setTimestamp()
      ],
      components: [
        new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId('reabrir_ticket')
            .setLabel('Reabrir')
            .setEmoji('🔓')
            .setStyle(ButtonStyle.Success),
          new ButtonBuilder()
            .setCustomId('guardar_ticket')
            .setLabel('Guardar')
            .setEmoji('💾')
            .setStyle(ButtonStyle.Primary),
          new ButtonBuilder()
            .setCustomId('eliminar_ticket')
            .setLabel('Eliminar')
            .setEmoji('🗑️')
            .setStyle(ButtonStyle.Secondary)
        )
      ]
    });

    await interaction.channel.permissionOverwrites.edit(interaction.user.id, {
      ViewChannel: false
    });
  }

  // ===== PASO 4: Reabrir ticket =====
  if (interaction.isButton() && interaction.customId === 'reabrir_ticket') {
    const ticketOwner = interaction.channel.name.split('ticket-')[1];
    const miembro = interaction.guild.members.cache.find(m => m.user.username === ticketOwner);

    if (miembro) {
      await interaction.channel.permissionOverwrites.edit(miembro.id, {
        ViewChannel: true,
        SendMessages: true
      });
    }

    return interaction.reply({ content: '🔓 Ticket reabierto.', ephemeral: true });
  }

  // ===== PASO 5: Guardar ticket =====
  if (interaction.isButton() && interaction.customId === 'guardar_ticket') {
    const mensajes = await interaction.channel.messages.fetch({ limit: 100 });
    const texto = mensajes.reverse().map(m => `[${m.author?.tag}]: ${m.content}`).join('\n');

    const archivo = `ticket-${interaction.channel.id}.txt`;
    fs.writeFileSync(archivo, texto);

    const logChannel = await client.channels.fetch(cfg.LOGS_CHANNEL_ID);
    await logChannel.send({
      embeds: [
        new EmbedBuilder()
          .setColor(0x2b8cff)
          .setTitle('💾 Ticket guardado')
          .setDescription(`Guardado por: <@${interaction.user.id}>`)
          .setTimestamp()
      ],
      files: [archivo]
    });

    fs.unlinkSync(archivo);
    return interaction.reply({ content: '💾 Ticket guardado.', ephemeral: true });
  }

  // ===== PASO 6: Eliminar ticket =====
  if (interaction.isButton() && interaction.customId === 'eliminar_ticket') {
    await interaction.reply({ content: '🗑️ Eliminando...', ephemeral: true });
    setTimeout(() => interaction.channel.delete(), 2000);
  }
});

// ============== SERVIDOR PARA RAILWAY/RENDER ==============
const express = require("express");
const app = express();

app.get("/", (req, res) => res.send("Bot activo 24/7 🔥"));

app.listen(process.env.PORT || 3000, () => {
  console.log("🌐 Servidor web iniciado");
});

client.login(TOKEN);
