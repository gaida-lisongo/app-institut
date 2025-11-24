import crypto from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
const JWT_EXPIRES_IN = 7 * 24 * 60 * 60 * 1000; // 7 jours en millisecondes

export interface TokenPayload {
  userId: string;
  email?: string;
  role?: string;
  iat?: number;
  exp?: number;
}

export class JWTUtils {
  // Génération d'un token simple (remplacer par JWT en production)
  static generateToken(payload: Omit<TokenPayload, 'iat' | 'exp'>): string {
    const now = Date.now();
    const tokenData = {
      ...payload,
      iat: now,
      exp: now + JWT_EXPIRES_IN
    };
    
    const tokenString = JSON.stringify(tokenData);
    const signature = crypto
      .createHmac('sha256', JWT_SECRET)
      .update(tokenString)
      .digest('hex');
    
    // Utiliser un séparateur différent du point pour éviter les conflits
    const combined = `${tokenString}|||${signature}`;
    return Buffer.from(combined).toString('base64');
  }

  static verifyToken(token: string): TokenPayload {
    try {
      const decoded = Buffer.from(token, 'base64').toString();
      const parts = decoded.split('|||');
      
      if (parts.length !== 2) {
        throw new Error('Format de token invalide');
      }
      
      const [tokenString, signature] = parts;
      
      // Vérifier la signature
      const expectedSignature = crypto
        .createHmac('sha256', JWT_SECRET)
        .update(tokenString)
        .digest('hex');
      
      if (signature !== expectedSignature) {
        throw new Error('Signature invalide');
      }
      
      const payload = JSON.parse(tokenString) as TokenPayload;
      
      // Vérifier l'expiration
      if (payload.exp && Date.now() > payload.exp) {
        throw new Error('Token expiré');
      }
      
      return payload;
    } catch (error: any) {
      throw new Error(`Token invalide ou expiré: ${error.message}`);
    }
  }

  static decodeToken(token: string): TokenPayload | null {
    try {
      const decoded = Buffer.from(token, 'base64').toString();
      const [tokenString] = decoded.split('|||');
      return JSON.parse(tokenString) as TokenPayload;
    } catch (error) {
      return null;
    }
  }
}
