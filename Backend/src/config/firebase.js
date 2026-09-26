import { initializeApp, cert } from "firebase-admin/app";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let serviceAccount;

const possiblePaths = [
    path.join(__dirname, "serviceAccountKey.json"),
    path.join(process.cwd(), "serviceAccountKey.json"),
    path.join(process.cwd(), "src", "config", "serviceAccountKey.json"),
    "/etc/secrets/serviceAccountKey.json"
];

for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
        try {
            serviceAccount = JSON.parse(fs.readFileSync(p, "utf8"));
            console.log(`Successfully loaded Firebase service account from: ${p}`);
            break;
        } catch (e) {
            console.error(`Failed to parse serviceAccountKey from ${p}:`, e.message);
        }
    }
}

if (!serviceAccount && process.env.FIREBASE_PRIVATE_KEY) {
    serviceAccount = {
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
    };
    console.log("Loaded Firebase credentials from environment variables.");
}

if (!serviceAccount) {
    console.error("ERROR: No Firebase service account file or environment variables found!");
}

const firebaseApp = initializeApp({
    credential: cert(serviceAccount)
});

export default firebaseApp;