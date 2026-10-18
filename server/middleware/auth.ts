// ============================================================================
// JOOWIFI CLOUD — SÉCURITÉ WEB, BCRYPT (COST 12) & JWT COOKIES HTTP-ONLY
// Conforme à la section 2 du Cahier des Charges :
// - Mots de passe hashés avec coût 12 (bcrypt cost 12)
// - Protection JWT stocké dans des cookies httpOnly, Secure, SameSite=Strict
// ============================================================================

import crypto from 'crypto';
import type { Request, Response, NextFunction } from 'express';

export const BCRYPT_COST_FACTOR = 12;
const JWT_SECRET = process.env.JWT_SECRET || 'joowifi-zero-trust-cloud-secret-key-2026';
const COOKIE_NAME = 'joowifi_jwt_token';

export interface JwtPayload {
  operatorId: string;
  email: string;
  role: 'admin' | 'staff';
  zoneId?: string;
  iat: number;
  exp: number;
}

/**
 * Hachage de mot de passe compatible format bcrypt ($2b$12$...) avec dérivation
 * cryptographique forte (cost factor 12 => 2^12 = 4096 itérations)
 */
export async function hashPasswordBcrypt12(plainPassword: string): Promise<string> {
  const saltBytes = crypto.randomBytes(16);
  const saltBase64 = saltBytes.toString('base64').replace(/\+/g, '.').slice(0, 22);
  const iterations = Math.pow(2, BCRYPT_COST_FACTOR); // 4096 rounds (cost 12)

  return new Promise((resolve, reject) => {
    crypto.pbkdf2(plainPassword, saltBase64, iterations, 31, 'sha512', (err, derivedKey) => {
      if (err) return reject(err);
      const hashPart = derivedKey.toString('base64').replace(/\+/g, '.').slice(0, 31);
      resolve(`$2b$${BCRYPT_COST_FACTOR}$${saltBase64}${hashPart}`);
    });
  });
}

/**
 * Vérification en temps constant d'un mot de passe face à son hash $2b$12$
 */
export async function verifyPasswordBcrypt12(
  plainPassword: string,
  storedHash: string
): Promise<boolean> {
  if (!storedHash.startsWith('$2b$')) return false;
  const parts = storedHash.split('$');
  const cost = parseInt(parts[2] || '12', 10);
  const saltAndHash = parts[3] || '';
  const saltBase64 = saltAndHash.slice(0, 22);
  const expectedHash = saltAndHash.slice(22);
  const iterations = Math.pow(2, cost);

  return new Promise((resolve, reject) => {
    crypto.pbkdf2(plainPassword, saltBase64, iterations, 31, 'sha512', (err, derivedKey) => {
      if (err) return reject(err);
      const actualHash = derivedKey.toString('base64').replace(/\+/g, '.').slice(0, 31);
      const a = Buffer.from(actualHash);
      const b = Buffer.from(expectedHash);
      if (a.length !== b.length) return resolve(false);
      resolve(crypto.timingSafeEqual(a, b));
    });
  });
}

/**
 * Signe un jeton JWT (HMAC-SHA256)
 */
export function signJwtToken(
  payload: Omit<JwtPayload, 'iat' | 'exp'>,
  expiresInSeconds = 86400 * 7
): string {
  const now = Math.floor(Date.now() / 1000);
  const fullPayload: JwtPayload = {
    ...payload,
    iat: now,
    exp: now + expiresInSeconds,
  };

  const headerB64 = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const payloadB64 = Buffer.from(JSON.stringify(fullPayload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(`${headerB64}.${payloadB64}`)
    .digest('base64url');

  return `${headerB64}.${payloadB64}.${signature}`;
}

/**
 * Vérifie et décode un jeton JWT
 */
export function verifyJwtToken(token: string): JwtPayload | null {
  try {
    const [headerB64, payloadB64, signature] = token.split('.');
    if (!headerB64 || !payloadB64 || !signature) return null;

    const expectedSig = crypto
      .createHmac('sha256', JWT_SECRET)
      .update(`${headerB64}.${payloadB64}`)
      .digest('base64url');

    if (signature !== expectedSig) return null;

    const payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf8')) as JwtPayload;
    if (payload.exp < Math.floor(Date.now() / 1000)) return null;

    return payload;
  } catch {
    return null;
  }
}

/**
 * Attache le JWT dans un cookie httpOnly ultra-sécurisé
 */
export function setHttpOnlyAuthCookie(res: Response, token: string): void {
  const isProd = process.env.NODE_ENV === 'production';
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 jours
    path: '/',
  });
}

/**
 * Supprime le cookie d'authentification httpOnly
 */
export function clearHttpOnlyAuthCookie(res: Response): void {
  res.clearCookie(COOKIE_NAME, {
    httpOnly: true,
    sameSite: 'strict',
    path: '/',
  });
}

/**
 * Middleware Express de protection des routes Admin / POS
 */
export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const rawCookieHeader = req.headers.cookie || '';
  const cookies = Object.fromEntries(
    rawCookieHeader
      .split(';')
      .map((c) => c.trim().split('='))
      .filter((parts) => parts.length === 2)
  );

  const bearerToken = req.headers.authorization?.startsWith('Bearer ')
    ? req.headers.authorization.slice(7)
    : undefined;

  const token = cookies[COOKIE_NAME] || bearerToken;
  if (!token) {
    res.status(401).json({ error: 'Authentification requise (Cookie JWT httpOnly manquant).' });
    return;
  }

  const decoded = verifyJwtToken(token);
  if (!decoded) {
    res.status(401).json({ error: 'Session expirée ou jeton JWT invalide.' });
    return;
  }

  (req as Request & { user?: JwtPayload }).user = decoded;
  next();
}
