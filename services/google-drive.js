const { google } = require("googleapis");
const googleApiConfig = require("../config/google-api");

const token = googleApiConfig.token;
const credentials = googleApiConfig.creadentials;

const authorize = () => {
  const { client_secret, client_id, redirect_uris } = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    redirect_uris[0]
  );
  oAuth2Client.setCredentials(token);
  return oAuth2Client;
};

const writeToDocument = async (documentId, text) => {
  const auth = authorize();
  const docs = google.docs({
    version: "v1",
    auth,
  });
  await docs.documents.batchUpdate({
    auth,
    documentId,
    requestBody: {
      requests: [
        {
          insertText: {
            location: {
              index: 30,
            },
            text,
          },
        },
      ],
    },
  });
};

module.exports = {
  writeToDocument,
};
