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
       // 🔹 tu token
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
      { name: '⏣ 200 Robux', value: '> 🇨🇴 5,790 COP\n> 🇺🇸 1.5 USD\n> 🇲🇽 27.7 MXN\n> 🇵🇪 5.1 PEN', inline: true },
      { name: '⏣ 500 Robux', value: '> 🇨🇴 14,475 COP\n> 🇺🇸 3.75 USD\n> 🇲🇽 69.2 MXN\n> 🇵🇪 12.7 PEN', inline: true },
      { name: '⏣ 1,000 Robux', value: '> 🇨🇴 28,950 COP\n> 🇺🇸 7.5 USD\n> 🇲🇽 138.5 MXN\n> 🇵🇪 25.4 PEN', inline: true },

      // fila 2
      { name: '⏣ 2,000 Robux', value: '> 🇨🇴 57,900 COP\n> 🇺🇸 15 USD\n> 🇲🇽 277.0 MXN\n> 🇵🇪 50.7 PEN', inline: true },
      { name: '⏣ 4,000 Robux', value: '> 🇨🇴 115,800 COP\n> 🇺🇸 30 USD\n> 🇲🇽 554 MXN\n> 🇵🇪 101.3 PEN', inline: true },
      { name: '⏣ 8,000 Robux', value: '> 🇨🇴 231,600 COP\n> 🇺🇸 60 USD\n> 🇲🇽 1,108 MXN\n> 🇵🇪 202.6 PEN', inline: true },

      // fila 3 (dos precios + espacio para mantener columnas alineadas)
      { name: '⏣ 10,000 Robux', value: '> 🇨🇴 289,500 COP\n> 🇺🇸 75 USD\n> 🇲🇽 1,385 MXN\n> 🇵🇪 253.3 PEN', inline: true },
      { name: '⏣ 20,000 Robux', value: '> 🇨🇴 579,000 COP\n> 🇺🇸 150 USD\n> 🇲🇽 2,770 MXN\n> 🇵🇪 506.7 PEN', inline: true },
      { name: '\u200B', value: '\u200B', inline: true } // hueco para mantener la estructura 3xN
    )
    .addFields(
      { name: '🛒 Cómo comprar', value: `Dirígete al canal <#${ID_CANAL_COMPRA}> e inicia un ticket. Un administrador se comunicará contigo al instante.` },
      { name: '📦 Tipos de entrega', value: '• Gamepass: Recibirás los Robux en un plazo de hasta 5 días.\n• Grupo: El primer pago tarda aproximadamente 3 días; después las entregas son inmediatas.' }
    )
    .setImage('https://media.discordapp.net/attachments/1419831102779953294/1423146706765090936/fondo-textura-marmol-negro-azul-abstracto_53876-126689.png?format=webp&quality=lossless')
    .setFooter({ text: 'UF Shop | Confianza y rapidez 💙' ,
      iconURL: 'https://cdn.discordapp.com/attachments/1419831102779953294/1433973290942201866/LOGO.png?ex=6906a332&is=690551b2&hm=a1cf1f28fe1246af8fd80279a7da35a94638c0368fad1d43b823e63a5d11983c&'
    });

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

console.log("🔍 TOKEN cargado:", process.env.TOKEN ? "Sí" : "No");


client.login(process.env.TOKEN);
