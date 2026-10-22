const { getApps, initializeApp, cert, applicationDefault } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");
const { getDb, get, run } = require("../db");

function httpError(status, message) {
  return Object.assign(new Error(message), { status });
}

async function requireIdentity(req) {
  const match = /^Bearer (\S+)$/.exec(req.headers.authorization || "");
  if (!match) throw httpError(401, "Please sign in to continue.");
  const projectId = process.env.FIREBASE_PROJECT_ID;
  if (!projectId) throw httpError(503, "Firebase server is not configured.");
  let app = getApps().find((item) => item.name === "onemessage-auth");
  if (!app) {
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");
    const credential = clientEmail && privateKey
      ? cert({ projectId, clientEmail, privateKey })
      : process.env.GOOGLE_APPLICATION_CREDENTIALS ? applicationDefault() : undefined;
    app = initializeApp({ projectId, ...(credential ? { credential } : {}) }, "onemessage-auth");
  }
  try {
    return await getAuth(app).verifyIdToken(match[1], Boolean(process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY || process.env.GOOGLE_APPLICATION_CREDENTIALS));
  } catch (error) {
    if (["auth/argument-error", "auth/invalid-argument", "auth/id-token-expired", "auth/id-token-revoked", "auth/invalid-id-token", "auth/user-disabled", "auth/user-not-found"].includes(error.code)) {
      throw httpError(401, "Your session is invalid or expired. Please sign in again.");
    }
    throw httpError(503, "Unable to verify your session. Check Firebase server configuration.");
  }
}

async function requireUser(req) {
  const identity = await requireIdentity(req);
  await getDb();
  const user = get("SELECT id, nickname, email, created_at FROM users WHERE firebase_uid = ?", [identity.uid]);
  if (!user) throw httpError(403, "Finish setting up your profile first.");
  return user;
}

module.exports = { requireIdentity, requireUser, httpError };
