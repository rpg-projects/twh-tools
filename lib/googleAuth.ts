import { google } from "googleapis";
import path from "path";

const SERVICE_ACCOUNT_FILE = path.join(process.cwd(), "lilamontenegro.json");

const SCOPES = [
  "https://www.googleapis.com/auth/spreadsheets.readonly",
  "https://www.googleapis.com/auth/documents.readonly",
];

export async function getAuthService() {
  const auth = new google.auth.GoogleAuth({
    keyFile: SERVICE_ACCOUNT_FILE,
    scopes: SCOPES,
  });

  const sheets = google.sheets({ version: "v4", auth });
  const docs = google.docs({ version: "v1", auth });

  return { sheets, docs };
}
