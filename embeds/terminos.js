require('dotenv').config();

const { Client, GatewayIntentBits, EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle } = require('discord.js');

// 🔑 Coloca tu token del bot aquí
const TOKEN = process.env.TOKEN;

// 💬 ID del canal donde se enviará el mensaje automáticamente
const CANAL_ID = "1426072823763566603";

// 🧠 Crea el cliente
const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages]
});

// Cuando el bot se conecte
client.once('ready', async () => {
  console.log(`✅ Bot conectado como ${client.user.tag}`);

  const canal = await client.channels.fetch(CANAL_ID);
  if (!canal) return console.log("❌ No se encontró el canal.");

  // 🔹 Embed
  const embed = new EmbedBuilder()
    .setColor("#00BFFF")
    .setTitle("📋 ¡Bienvenido/a a Ultra Feders Shop!")
    .setDescription(
      "Antes de comenzar, es importante que leas nuestros **Términos de Servicio y reglamento**, donde encontrarás información sobre **compras, reembolsos, normas del servidor y reglas de uso.**\n\n" +
      "Al unirte, aceptas cumplir con todas estas disposiciones. Puedes acceder a ellos desde el botón de abajo. Si tienes dudas o necesitas más información, nuestro equipo de soporte está disponible para ayudarte en <#1419803262953066676>."
    )
    .setImage("https://media.discordapp.net/attachments/1419831102779953294/1423146706765090936/fondo-textura-marmol-negro-azul-abstracto_53876-126689.png?ex=68e9cc27&is=68e87aa7&hm=25003ebbce813fac0c3335d6a826f8e0811b527b800dd81aed5ff630a4c75802&=&format=webp&quality=lossless")
    .setFooter({
      text: "Ultra Feders Shop",
      iconURL: "https://media.discordapp.net/attachments/1419831102779953294/1423146706765090936/fondo-textura-marmol-negro-azul-abstracto_53876-126689.png?ex=68e9cc27&is=68e87aa7&hm=25003ebbce813fac0c3335d6a826f8e0811b527b800dd81aed5ff630a4c75802&=&format=webp&quality=lossless"
    });

  // 🔘 Botones
  const botones = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setLabel("TÉRMINOS DE SERVICIO")
      .setStyle(ButtonStyle.Link)
      .setURL("https://docs.google.com/document/d/1KaARWSKlOezO1qwnYfUbGF7kUiD29KA_HE4m8ZAZk9M/edit?tab=t.0#heading=h.gvhhso5big5h"),
    new ButtonBuilder()
      .setLabel("REGLAMENTO COMUNITARIO")
      .setStyle(ButtonStyle.Link)
      .setURL("https://docs.google.com/document/d/1RdsmivZCn_rb9vvvf44YaCQjcgh2JUUJnxXkbJmUg1o/edit?tab=t.0#heading=h.m3kupbqt0rs5")
  );

  // 📤 Envía el mensaje
  await canal.send({ embeds: [embed], components: [botones] });
  console.log("📨 Mensaje de términos enviado correctamente.");

  // 🔒 Cierra el bot después de enviar el mensaje
  client.destroy();
});

// 🔑 Inicia sesión
client.login(TOKEN);
