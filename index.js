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
  ButtonStyle
} = require('discord.js');

const fs = require('fs');
const path = require('path');
const TOKEN = process.env.TOKEN;
const config = require('./config.json');

// ================== VALIDACIÓN DE CONFIG ==================
// Llaves requeridas por servidor en config.json
const REQUIRED_KEYS = [
  'CANAL_COMPRA_ID',
  'CANAL_CATALOGO_ID',
  'CATEGORIA_TICKETS_ID',
  'ROLE_STAFF_ID',
  'LOGS_CHANNEL_ID'
];

function getConfig(guildId) {
  return config[guildId];
}

// Valida que la config de un servidor tenga todas las claves necesarias
// y que ninguna sea undefined/vacía. Retorna array de claves faltantes.
function validateConfig(cfg) {
  return REQUIRED_KEYS.filter(key => !cfg[key]);
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// ================== READY ==================
client.once('ready', async () => {
  console.log(`✅ Bot iniciado como ${client.user.tag}`);

  // forEach no respeta async, usar for...of en su lugar
  for (const [, guild] of client.guilds.cache) {
    const cfg = getConfig(guild.id);

    if (!cfg) {
      console.log(`⚠️ Sin config para: ${guild.name} (${guild.id})`);
      continue;
    }

    // Validar que todas las IDs existan antes de usarlas
    const faltantes = validateConfig(cfg);
    if (faltantes.length > 0) {
      console.log(`❌ Config incompleta en ${guild.name}. Faltan: ${faltantes.join(', ')}`);
      continue;
    }

    try {
      const canal = await client.channels.fetch(cfg.CANAL_COMPRA_ID).catch(() => null);

      if (!canal) {
        console.log(`❌ Canal CANAL_COMPRA_ID no encontrado en ${guild.name}`);
        continue;
      }

      const embed = new EmbedBuilder()
        .setTitle('🌎 ¡LISTO PARA COMPRAR!')
        .setDescription(
          'Selecciona tu **país de compra** para ver los métodos de pago disponibles.\n\n' +
          '⚠️ **Importante:** No compartas contraseñas ni envíes dinero a nadie no confirmado por el bot o staff.\n\n' +
          '💙 ¡Gracias por confiar en **UF Shop**!'
        )
        .setColor(0x2b8cff)
        .setImage('https://cdn.discordapp.com/attachments/1419831102779953294/1426009467287240784/IMG-20251001-WA0029.jpg')
        .setFooter({ text: '© UF Shop 2025 | Confianza y rapidez 💙' });

      const menuPaises = new StringSelectMenuBuilder()
        .setCustomId('seleccionar_pais')
        .setPlaceholder('Selecciona tu país')
        .addOptions([
          { label: 'Global',   value: 'global',   emoji: '🌍' },
          { label: 'Colombia', value: 'colombia',  emoji: '🇨🇴' },
          { label: 'Perú',     value: 'peru',      emoji: '🇵🇪' },
          { label: 'México',   value: 'mexico',    emoji: '🇲🇽' },
        ]);

      const row = new ActionRowBuilder().addComponents(menuPaises);

      const mensajes = await canal.messages.fetch({ limit: 15 });
      const yaExiste = mensajes.find(m => m.author.id === client.user.id);

      if (!yaExiste) {
        await canal.send({ embeds: [embed], components: [row] });
        console.log(`📨 Panel enviado en ${guild.name}`);
      } else {
        console.log(`ℹ️ Panel ya existe en ${guild.name}, no se reenvía.`);
      }

    } catch (err) {
      console.error(`❌ Error en ${guild.name}: ${err.message}`);
    }
  }
});

// ================== INTERACCIONES ==================
client.on('interactionCreate', async interaction => {
  if (!interaction.guild) return;

  const cfg = getConfig(interaction.guild.id);
  if (!cfg) return;

  const faltantes = validateConfig(cfg);
  if (faltantes.length > 0) {
    console.error(`❌ Interacción ignorada — config incompleta en ${interaction.guild.name}. Faltan: ${faltantes.join(', ')}`);
    // Responder al usuario si la interacción necesita respuesta
    if (interaction.isRepliable() && !interaction.replied && !interaction.deferred) {
      await interaction.reply({ content: '⚠️ El bot no está configurado correctamente en este servidor. Contacta al administrador.', ephemeral: true }).catch(() => {});
    }
    return;
  }

  // ================== SELECT PAÍS ==================
  if (interaction.isStringSelectMenu() && interaction.customId === 'seleccionar_pais') {
    const pais = interaction.values[0];

    let metodoPlaceholder = '';
    switch (pais) {
      case 'colombia': metodoPlaceholder = 'Nequi, Bancolombia'; break;
      case 'peru':     metodoPlaceholder = 'Yape'; break;
      case 'mexico':   metodoPlaceholder = 'OXXO, Santander'; break;
      default:         metodoPlaceholder = 'Tarjeta, PayPal, Cripto...'; break;
    }

    const modal = new ModalBuilder()
      .setCustomId(`modal_compra_${pais}`)
      .setTitle(`🛒 Compra - ${pais.toUpperCase()}`);

    modal.addComponents(
      new ActionRowBuilder().addComponents(
        new TextInputBuilder()
          .setCustomId('producto')
          .setLabel('¿Qué vas a comprar?')
          .setPlaceholder('Robux')
          .setStyle(TextInputStyle.Short)
          .setRequired(true)
      ),
      new ActionRowBuilder().addComponents(
        new TextInputBuilder()
          .setCustomId('cantidad')
          .setLabel('¿Cuánto vas a comprar?')
          .setPlaceholder('1000')
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
          .setPlaceholder('Sí, No, Depende…')
          .setStyle(TextInputStyle.Short)
          .setRequired(true)
      )
    );

    return interaction.showModal(modal);
  }

  // ================== CREAR TICKET ==================
  if (interaction.isModalSubmit() && interaction.customId.startsWith('modal_compra_')) {
    await interaction.deferReply({ ephemeral: true }); // Evita timeout si la creación tarda

    const pais = interaction.customId.split('_')[2];
    const producto = interaction.fields.getTextInputValue('producto');
    const cantidad  = interaction.fields.getTextInputValue('cantidad');
    const metodo    = interaction.fields.getTextInputValue('metodo');
    const propina   = interaction.fields.getTextInputValue('propina');

    try {
      const canal = await interaction.guild.channels.create({
        // FIX: guardar userId en el nombre para poder recuperarlo al reabrir
        name: `🛒┃ticket-${interaction.user.id}`,
        type: 0,
        parent: cfg.CATEGORIA_TICKETS_ID,
        permissionOverwrites: [
          { id: interaction.guild.id,  deny:  [PermissionsBitField.Flags.ViewChannel] },
          { id: interaction.user.id,   allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] },
          { id: cfg.ROLE_STAFF_ID,     allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] }
        ]
      });

      const embed = new EmbedBuilder()
        .setColor(0x2b8cff)
        .setTitle(`🧾 Pedido de ${interaction.user.username}`)
        .addFields(
          { name: '¿Qué vas a comprar?',  value: producto },
          { name: '¿Cuánto vas a comprar?', value: cantidad },
          { name: 'Método de pago',         value: metodo },
          { name: 'Propina',                value: propina },
          { name: 'País',                   value: pais.toUpperCase() }
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

      return interaction.editReply({ content: `✅ Tu ticket ha sido creado: ${canal}` });

    } catch (err) {
      console.error('❌ Error al crear ticket:', err);
      return interaction.editReply({ content: '❌ Hubo un error al crear tu ticket. Intenta de nuevo.' });
    }
  }

  // ================== CERRAR TICKET ==================
  if (interaction.isButton() && interaction.customId === 'cerrar_ticket') {
    await interaction.reply({ content: '🔒 Ticket cerrado', ephemeral: true });

    await interaction.channel.send({
      embeds: [
        new EmbedBuilder()
          .setColor(0xff5555)
          .setTitle('🔒 Ticket cerrado')
          .setTimestamp()
      ],
      components: [
        new ActionRowBuilder().addComponents(
          new ButtonBuilder().setCustomId('reabrir_ticket').setLabel('Reabrir').setEmoji('🔓').setStyle(ButtonStyle.Success),
          new ButtonBuilder().setCustomId('guardar_ticket').setLabel('Guardar').setEmoji('💾').setStyle(ButtonStyle.Primary),
          new ButtonBuilder().setCustomId('eliminar_ticket').setLabel('Eliminar').setEmoji('🗑️').setStyle(ButtonStyle.Secondary)
        )
      ]
    });

    await interaction.channel.permissionOverwrites.edit(interaction.user.id, {
      ViewChannel: false
    });
  }

  // ================== REABRIR TICKET ==================
  if (interaction.isButton() && interaction.customId === 'reabrir_ticket') {
    // FIX: extraer userId del nombre del canal en lugar de buscar por username
    const userId = interaction.channel.name.split('ticket-')[1];

    if (userId) {
      await interaction.channel.permissionOverwrites.edit(userId, {
        ViewChannel: true,
        SendMessages: true
      }).catch(err => console.error('Error al reabrir permisos:', err));
    } else {
      console.warn(`⚠️ No se pudo extraer userId del canal: ${interaction.channel.name}`);
    }

    return interaction.reply({ content: '🔓 Ticket reabierto.', ephemeral: true });
  }

  // ================== GUARDAR TICKET ==================
  if (interaction.isButton() && interaction.customId === 'guardar_ticket') {
    await interaction.deferReply({ ephemeral: true });

    // FIX: usar /tmp para archivos temporales en producción
    const archivo = path.join('/tmp', `ticket-${interaction.channel.id}.txt`);

    try {
      const mensajes = await interaction.channel.messages.fetch({ limit: 100 });
      const texto = [...mensajes.values()]
        .reverse()
        .map(m => `[${new Date(m.createdTimestamp).toISOString()}] ${m.author?.tag ?? 'Desconocido'}: ${m.content}`)
        .join('\n');

      fs.writeFileSync(archivo, texto, 'utf8');

      const logChannel = await client.channels.fetch(cfg.LOGS_CHANNEL_ID).catch(() => null);
      if (!logChannel) {
        console.error('❌ LOGS_CHANNEL_ID no encontrado');
        return interaction.editReply({ content: '❌ No se encontró el canal de logs.' });
      }

      await logChannel.send({
        embeds: [
          new EmbedBuilder()
            .setColor(0x2b8cff)
            .setTitle('💾 Ticket guardado')
            .setDescription(`Canal: ${interaction.channel.name}\nGuardado por <@${interaction.user.id}>`)
            .setTimestamp()
        ],
        files: [archivo]
      });

      return interaction.editReply({ content: '💾 Ticket guardado en logs.' });

    } catch (err) {
      console.error('❌ Error al guardar ticket:', err);
      return interaction.editReply({ content: '❌ Error al guardar el ticket.' });
    } finally {
      // Siempre limpiar el archivo temporal, incluso si hubo error
      if (fs.existsSync(archivo)) fs.unlinkSync(archivo);
    }
  }

  // ================== ELIMINAR TICKET ==================
  if (interaction.isButton() && interaction.customId === 'eliminar_ticket') {
    await interaction.reply({ content: '🗑️ Eliminando en 3 segundos...', ephemeral: true });
    setTimeout(() => interaction.channel.delete().catch(err => console.error('Error al eliminar canal:', err)), 3000);
  }
});

// ================== MANEJO DE ERRORES GLOBALES ==================
client.on('error', err => console.error('❌ Error del cliente Discord:', err));
client.on('warn', info => console.warn('⚠️ Advertencia Discord:', info));

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection:', reason);
});

// ================== SERVIDOR WEB ==================
const express = require("express");
const app = express();
app.get("/", (_, res) => res.send("Bot activo 24/7 🔥"));
app.listen(process.env.PORT || 3000);

client.login(TOKEN);