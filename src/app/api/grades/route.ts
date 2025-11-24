import GradeControllers from '@/lib/controllers/GradeControllers';
import { NextRequest, NextResponse } from 'next/server';
import { IGrade, GradeData, CreateGradeData } from '@/models/Grade';

// GET /api/gades?type=<type> - Récupérer les grades d'un type spécifique
export async function GET(request: NextRequest) {
  try {
    const type = request.nextUrl.searchParams.get('type');
    const grades = await GradeControllers.getGradesByType(type as string);
    
    return NextResponse.json(
      { success: true, data: grades },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}

// POST /api/grades - Créer un nouveau grade
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const grade = await GradeControllers.createGrade(body as CreateGradeData);
    
    return NextResponse.json(
      { success: true, data: grade },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}

// UPDATE /api/grades - Modifier un grade dont les infos sont portés dans le body
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    console.log("body to update :", body);
    const { _id: id, ...updateData } = body;
    const grade = await GradeControllers.updateGrade(id, updateData as Partial<CreateGradeData>);
    
    return NextResponse.json(
      { success: true, data: grade },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Erreur lors de la modification du grade:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}

// DELETE /api/grades - Supprimer un grade dont l'id est porté dans le body
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const grade = await GradeControllers.deleteGrade(body.id);
    
    return NextResponse.json(
      { success: true, data: grade },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}