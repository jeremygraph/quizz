const dotenv = require("dotenv");
dotenv.config();
const tmi = require("tmi.js");
const { google } = require("googleapis");

const sheets = google.sheets({ version: "v4" });

const client = new tmi.Client({
  connection: {
    reconnect: true,
  },
  channels: ["yourChannel"],
});

client.connect();
client.on("message", onMessageHandler);

async function onMessageHandler(channel, context, msg, self) {
  console.log("channel", {
    channel,
    user: context.username,
    msg,
  });

  // Check for your command
  if (msg.startsWith("!question")) {
    // Log the username to the spreadsheet
    try {
      const auth = await authenticateWithOAuth();
      google.options({ auth });

      await appendUsernameToSheet(context.username);
    } catch (error) {
      console.error("Error processing message:", error);
    }
  }
}

async function authenticateWithOAuth() {
  try {
    const keyFileContent = {
      type: process.env.GOOGLE_SHEETS_API_KEY_TYPE,
      project_id: process.env.GOOGLE_SHEETS_API_KEY_PROJECT_ID,
      private_key_id: process.env.GOOGLE_SHEETS_API_KEY_PRIVATE_KEY_ID,
      private_key: process.env.GOOGLE_SHEETS_API_KEY_PRIVATE_KEY,
      client_email: process.env.GOOGLE_SHEETS_API_KEY_CLIENT_EMAIL,
      client_id: process.env.GOOGLE_SHEETS_API_KEY_CLIENT_ID,
      auth_uri: process.env.GOOGLE_SHEETS_API_KEY_AUTH_URI,
      token_uri: process.env.GOOGLE_SHEETS_API_KEY_TOKEN_URI,
      auth_provider_x509_cert_url:
        process.env.GOOGLE_SHEETS_API_KEY_AUTH_PROVIDER_X509_CERT_URL,
      client_x509_cert_url:
        process.env.GOOGLE_SHEETS_API_KEY_CLIENT_X509_CERT_URL,
      universe_domain: process.env.GOOGLE_SHEETS_API_KEY_UNIVERSE_DOMAIN,
    };

    if (!keyFileContent.client_email) {
      throw new Error("Missing client_email in keyFileContent");
    }

    const auth = google.auth.fromJSON(keyFileContent);
    auth.scopes = ["https://www.googleapis.com/auth/spreadsheets"];

    return auth;
  } catch (error) {
    console.error("Error authenticating with OAuth:", error);
    throw error;
  }
}

async function appendUsernameToSheet(username) {
  try {
    const spreadsheetId = ""; // Replace with your spreadsheet ID
    const range = "question"; // Replace with your sheet name

    const response = await sheets.spreadsheets.values.append({
      spreadsheetId,
      range,
      valueInputOption: "USER_ENTERED",
      resource: {
        values: [[username]],
      },
    });

    console.log(`${username} logged to the spreadsheet.`);
  } catch (error) {
    console.error("Error appending username to sheet:", error);
    throw error;
  }
}
