import { NextRequest, NextResponse } from 'next/server';
import { JWTUtils } from '@/lib/auth/jwt';

export async function GET(request: NextRequest) {
  try {
    console.log('=== TEST JWT ===');
    
    // Test de génération
    const testPayload = {
      userId: 'test-user-123',
      email: 'test@example.com',
      role: 'agent'
    };
    
    console.log('1. Payload de test:', testPayload);
    const token = await JWTUtils.generateToken(testPayload);
    console.log('2. Token généré:', token);
    
    // Test de vérification
    try {
      const verified = await JWTUtils.verifyToken(token);
      console.log('3. Token vérifié:', verified);
      
      return NextResponse.json({
        success: true,
        data: {
          original: testPayload,
          token: token,
          verified: verified,
          match: verified.userId === testPayload.userId
        }
      });
    } catch (verifyError: any) {
      console.log('3. Erreur de vérification:', verifyError.message);
      return NextResponse.json({
        success: false,
        error: `Erreur de vérification: ${verifyError.message}`,
        token: token
      });
    }
    
  } catch (error: any) {
    console.log('Erreur générale:', error.message);
    return NextResponse.json({
      success: false,
      error: error.message
    });
  }
}
