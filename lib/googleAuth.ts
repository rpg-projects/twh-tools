import { google } from "googleapis";

const SERVICE_ACCOUNT_FILE = JSON.parse(
  process.env.GOOGLE_SERVICE_ACCOUNT_KEY!
);

const SCOPES = [
  "https://www.googleapis.com/auth/spreadsheets.readonly",
  "https://www.googleapis.com/auth/documents.readonly",
];

export async function getAuthService() {
  console.log("SERVICE_ACCOUNT_FILE :>> ", SERVICE_ACCOUNT_FILE);
  console.log(
    "process.env.GOOGLE_SERVICE_ACCOUNT_KEY :>> ",
    process.env.GOOGLE_SERVICE_ACCOUNT_KEY
  );

  const auth = new google.auth.GoogleAuth({
    credentials: SERVICE_ACCOUNT_FILE,
    scopes: SCOPES,
  });

  const sheets = google.sheets({ version: "v4", auth });
  const docs = google.docs({ version: "v1", auth });

  return { sheets, docs };
}
