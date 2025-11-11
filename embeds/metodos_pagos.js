require('dotenv').config();

const { 
    Client, 
    GatewayIntentBits, 
    EmbedBuilder 
} = require('discord.js');

// IDs
const CANAL_ID = '1419802511463940106'; // 🔹 canal donde se enviará el mensaje

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once('ready', async () => {
    console.log(`✅ metodos_pago.js - Conectado como ${client.user.tag}`);

    const canal = await client.channels.fetch(CANAL_ID).catch(() => null);
    if (!canal) return console.log('❌ Canal no encontrado.');

  // 📦 EMBED MÉTODOS DE PAGO
    const embed = new EmbedBuilder()
    .setColor(0x2b8cff)
    .setTitle('💳 Métodos de Pago')
    .setDescription(
        'Aceptamos múltiples métodos de pago para tus pedidos, aquí te listamos todos:\n\n' +
      '🌍 **GLOBALES**\n' +
        '• 💳 Tarjeta Débito/Crédito\n' +
      '• 🪙 **Wise**\n' +
      '• 🅿️ PayPal *(❌ NO para colombianos)*\n' +
      '• 🔑 Criptomonedas *(Aceptamos Binance ID)*\n\n' +
      '🏦 **LOCALES**\n' +
      '🇨🇴 **Transferencia COLOMBIANA**\n' +
        'Nequi, Bancolombia.\n\n' +
      '🇵🇪 **Transferencia PERUANA**\n' +
        'Yape.\n\n' +
      '🇲🇽 **Transferencia MEXICANA**\n' +
        'OXXO, Banco Santander.'
    )
    .setImage('https://media.discordapp.net/attachments/1419831102779953294/1423146706765090936/fondo-textura-marmol-negro-azul-abstracto_53876-126689.png?format=webp&quality=lossless')
    .setFooter({ 
        text: 'Ultra Feder Bot | Confianza y rapidez 💙', 
      iconURL: 'https://cdn.discordapp.com/attachments/1419831102779953294/1433973290942201866/LOGO.png?ex=6906a332&is=690551b2&hm=a1cf1f28fe1246af8fd80279a7da35a94638c0368fad1d43b823e63a5d11983c&' // puedes cambiar este ícono
    })
    .setTimestamp();

  // 📩 Enviar mensaje al canal
    await canal.send({ embeds: [embed] });
    console.log('📨 Embed de métodos de pago enviado correctamente.');
    process.exit();
});

console.log("🔍 TOKEN cargado:", process.env.TOKEN ? "Sí" : "No");

client.login(process.env.TOKEN);
