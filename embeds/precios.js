require("dotenv").config();

const {
  Client,
  GatewayIntentBits,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");

const config = require("../config.json");

const GUILD_ID = process.argv[2];

if (!GUILD_ID) {
  console.log("❌ Debes ejecutar el script así:");
  console.log("   node precios.js ID_DEL_SERVIDOR");
  process.exit();
}

const serverConfig = config[GUILD_ID];

if (!serverConfig) {
  console.log(`❌ No hay configuración para el servidor ${GUILD_ID}`);
  process.exit();
}

const { CANAL_CATALOGO_ID, CANAL_COMPRA_ID } = serverConfig;

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once("ready", async () => {
  console.log(`✅ precios.js — conectado como ${client.user.tag}`);
  console.log(`📌 Enviando catálogo al servidor: ${GUILD_ID}`);

  const canal = await client.channels.fetch(CANAL_CATALOGO_ID).catch(() => null);

  if (!canal) {
    console.log("❌ Canal de catálogo no encontrado.");
    process.exit();
  }

  // 📌 Embed
  const embed = new EmbedBuilder()
    .setTitle("💸 Catálogo actualizado de Robux 💎")
    .setDescription(
      "💸 **CATÁLOGO ROBUX**\n\n" +
        "🌟 **Tienes libre elección** — puedes pedir un monto personalizado.\n" +
        "🌟 **Por compras en gran cantidad** se puede aplicar un descuento.\n\n" +
        "💰 **Precios Actualizados:**"
    )
    .setColor(0x2b8cff)
    .addFields(
      { name: "⏣ 200 Robux", value: "> 🇨🇴 5,790 COP\n> 🇺🇸 1.5 USD\n> 🇲🇽 27.7 MXN\n> 🇵🇪 5.1 PEN", inline: true },
      { name: "⏣ 500 Robux", value: "> 🇨🇴 14,475 COP\n> 🇺🇸 3.75 USD\n> 🇲🇽 69.2 MXN\n> 🇵🇪 12.7 PEN", inline: true },
      { name: "⏣ 1,000 Robux", value: "> 🇨🇴 28,950 COP\n> 🇺🇸 7.5 USD\n> 🇲🇽 138.5 MXN\n> 🇵🇪 25.4 PEN", inline: true },

      { name: "⏣ 2,000 Robux", value: "> 🇨🇴 57,900 COP\n> 🇺🇸 15 USD\n> 🇲🇽 277.0 MXN\n> 🇵🇪 50.7 PEN", inline: true },
      { name: "⏣ 4,000 Robux", value: "> 🇨🇴 115,800 COP\n> 🇺🇸 30 USD\n> 🇲🇽 554 MXN\n> 🇵🇪 101.3 PEN", inline: true },
      { name: "⏣ 8,000 Robux", value: "> 🇨🇴 231,600 COP\n> 🇺🇸 60 USD\n> 🇲🇽 1,108 MXN\n> 🇵🇪 202.6 PEN", inline: true },

      { name: "⏣ 10,000 Robux", value: "> 🇨🇴 289,500 COP\n> 🇺🇸 75 USD\n> 🇲🇽 1,385 MXN\n> 🇵🇪 253.3 PEN", inline: true },
      { name: "⏣ 20,000 Robux", value: "> 🇨🇴 579,000 COP\n> 🇺🇸 150 USD\n> 🇲🇽 2,770 MXN\n> 🇵🇪 506.7 PEN", inline: true },
      { name: "\u200B", value: "\u200B", inline: true }
    )
    .addFields(
      { name: '🛒 Cómo comprar', value: `Dirígete al canal <#${CANAL_ID}> e inicia un ticket. Un administrador se comunicará contigo al instante.` },
      { name: '📦 Tipos de entrega', value: '• Gamepass: Recibirás los Robux en un plazo de hasta 5 días.\n• Grupo: El primer pago tarda aproximadamente 3 días; después las entregas son inmediatas.' }
    )
    .setImage('https://media.discordapp.net/attachments/1419831102779953294/1423146706765090936/fondo-textura-marmol-negro-azul-abstracto_53876-126689.png?format=webp&quality=lossless')
    .setFooter({ 
      text: 'UF Shop | Confianza y rapidez 💙',
      iconURL: 'https://cdn.discordapp.com/attachments/1419831102779953294/1433973290942201866/LOGO.png'
    });

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setLabel("🛒 COMPRAR")
      .setStyle(ButtonStyle.Link)
      .setURL(`https://discord.com/channels/${GUILD_ID}/${CANAL_ID}`)
  );

  await canal.send({
    content: "💎 Catálogo actualizado de Robux 💎",
    embeds: [embed],
    components: [row],
  });

  console.log("📨 Catálogo enviado correctamente.");
  process.exit();
});

client.login(process.env.TOKEN);
