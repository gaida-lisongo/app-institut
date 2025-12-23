import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import { initializeModels } from '@/lib/initModels';
import { Seance, Charge } from '@/models/Charge';
import mongoose from 'mongoose';

//GET - Verifier si la présence d'un étudiant pour une séance [id] existe
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string; }> }) {
  try {
    await dbConnect();
    await initializeModels();  
    const { id } = await params;
    const queryParams = request.nextUrl.searchParams;
    const studentId = queryParams.get('studentId');
    // Validation de l'ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'ID de séance invalide' }, { status: 400 });
    }

    // Récupérer la séance
    const seance = await Seance.findById(id);
    if (!seance) {
      return NextResponse.json({ error: 'Séance non trouvée' }, { status: 404 });
    }

    // Vérifier si la présence de l'étudiant existe
    const presence = seance.presences.find(p => p.student.toString() === studentId);
    if (!presence) {
      return NextResponse.json({ exists: false }, { status: 200 });
    }

    return NextResponse.json({ exists: true, presence }, { status: 200 });
  } catch (error) {
    console.error('Erreur lors de la vérification de la présence:', error);
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}

//POST - Créer une nouvelle présence pour une séance [id]
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();
    await initializeModels();  
    const { id } = await params;

    // Validation de l'ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'ID de séance invalide' }, { status: 400 });
    }

    // Récupérer la séance
    const seance = await Seance.findById(id);
    if (!seance) {
      return NextResponse.json({ error: 'Séance non trouvée' }, { status: 404 });
    }

    // Récupérer les données de la requête
    const { studentId, locationQr, locationStudent } = await request.json();

    // Location is lattite:longitute, parsing all locations and calculate satus if desitance is greater tha 15meters status is absent else present
    const [latQr, longQr] = locationQr.split(':').map(Number);
    const [latStudent, longStudent] = locationStudent.split(':').map(Number);

    const toRad = (value: number) => (value * Math.PI) / 180;

    const R = 6371e3;
    const φ1 = toRad(latQr);
    const φ2 = toRad(latStudent);
    const Δφ = toRad(latStudent - latQr);
    const Δλ = toRad(longStudent - longQr);

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) *
      Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // in meters

    let status = 'present';
    if (distance > 15) {
      status = 'absent';
    }
    // Ajouter la présence
    seance.presences.push({
      student: studentId,
      location: locationStudent,
      status: status,
      timeRecorded: new Date()
    });

    await seance.save();

    return NextResponse.json({ message: 'Présence ajoutée avec succès', status: status, data: {
      student: studentId,
      location: locationStudent,
      status: status,
      timeRecorded: new Date()
    } }, { status: 201 });
  } catch (error) {
    console.error('Erreur lors de l\'ajout de la présence:', error);
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }

}