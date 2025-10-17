require('dotenv').config();

// precios.js
const { 
  Client, 
  GatewayIntentBits, 
  EmbedBuilder, 
  ActionRowBuilder, 
  ButtonBuilder, 
  ButtonStyle 
} = require('discord.js');

const TOKEN = process.env.TOKEN;             // 🔹 tu token
const CANAL_ID = '1419802977534742709';      // 🔹 canal donde se enviará el catálogo
const ID_CANAL_COMPRA = '1425962455200305202'; // 🔹 canal #compra-aqui

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once('ready', async () => {
  console.log(`✅ precios.js - conectado como ${client.user.tag}`);

  const canal = await client.channels.fetch(CANAL_ID).catch(() => null);
  if (!canal) return console.log('❌ Canal no encontrado.');

  const embed = new EmbedBuilder()
    .setTitle('💸 Catálogo actualizado de Robux 💎')
    .setDescription(
      '💸 **CATÁLOGO ROBUX**\n\n' +
      '🌟 **Tienes libre elección** — puedes pedir un monto personalizado.\n' +
      '🌟 **Por compras en gran cantidad** se puede aplicar un descuento; primero consulta con el dueño o un helper.\n\n' +
      '💰 **Precios Actualizados:**'
    )
    .setColor(0x2b8cff)
    .addFields(
      // fila 1
      { name: '⏣ 200 Robux', value: '> 🇨🇴 6,200 COP\n> 🇺🇸 1.5 USD\n> 🇲🇽 33 MXN\n> 🇵🇪 6 PEN', inline: true },
      { name: '⏣ 500 Robux', value: '> 🇨🇴 15,500 COP\n> 🇺🇸 3.75 USD\n> 🇲🇽 82 MXN\n> 🇵🇪 15 PEN', inline: true },
      { name: '⏣ 1,000 Robux', value: '> 🇨🇴 31,000 COP\n> 🇺🇸 7.5 USD\n> 🇲🇽 164.5 MXN\n> 🇵🇪 29.5 PEN', inline: true },

      // fila 2
      { name: '⏣ 2,000 Robux', value: '> 🇨🇴 62,000 COP\n> 🇺🇸 15 USD\n> 🇲🇽 329 MXN\n> 🇵🇪 59 PEN', inline: true },
      { name: '⏣ 4,000 Robux', value: '> 🇨🇴 124,000 COP\n> 🇺🇸 30 USD\n> 🇲🇽 657.5 MXN\n> 🇵🇪 118 PEN', inline: true },
      { name: '⏣ 8,000 Robux', value: '> 🇨🇴 247,500 COP\n> 🇺🇸 60 USD\n> 🇲🇽 1,315 MXN\n> 🇵🇪 236 PEN', inline: true },

      // fila 3 (dos precios + espacio para mantener columnas alineadas)
      { name: '⏣ 10,000 Robux', value: '> 🇨🇴 309,400 COP\n> 🇺🇸 75 USD\n> 🇲🇽 1,643.5 MXN\n> 🇵🇪 295 PEN', inline: true },
      { name: '⏣ 20,000 Robux', value: '> 🇨🇴 618,800 COP\n> 🇺🇸 150 USD\n> 🇲🇽 3,287 MXN\n> 🇵🇪 590 PEN', inline: true },
      { name: '\u200B', value: '\u200B', inline: true } // hueco para mantener la estructura 3xN
    )
    .addFields(
      { name: '🛒 Cómo comprar', value: `Dirígete al canal <#${ID_CANAL_COMPRA}> e inicia un ticket. Un administrador se comunicará contigo al instante.` },
      { name: '📦 Tipos de entrega', value: '• Gamepass: Recibirás los Robux en un plazo de hasta 5 días.\n• Grupo: El primer pago tarda aproximadamente 3 días; después las entregas son inmediatas.' }
    )
    .setImage('https://media.discordapp.net/attachments/1419831102779953294/1423146706765090936/fondo-textura-marmol-negro-azul-abstracto_53876-126689.png?format=webp&quality=lossless')
    .setFooter({ text: 'UF Shop | Confianza y rapidez 💙' });

  // 🔘 Botón “COMPRAR”
  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setLabel('🛒 COMPRAR')
      .setStyle(ButtonStyle.Link)
      .setURL(`https://discord.com/channels/@me/${ID_CANAL_COMPRA}`)
  );

  await canal.send({ content: '💎 Catálogo actualizado de Robux 💎', embeds: [embed], components: [row] });
  console.log('📨 Catálogo enviado con botón.');
  process.exit();
});

client.login(process.env.TOKEN);
