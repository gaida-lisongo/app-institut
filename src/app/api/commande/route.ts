import dbConnect from '@/lib/dbConnect';
import Commandes from '@/models/Commande';
import { NextRequest, NextResponse } from 'next/server';
// GET /api/gades?type=<type> - Récupérer les grades d'un type spécifique
export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const produit = request.nextUrl.searchParams.get('produit');
    const promotionId = request.nextUrl.searchParams.get('promotionId');
    const etudiantId = request.nextUrl.searchParams.get('etudiantId');
    const anneeId = request.nextUrl.searchParams.get('anneeId');

    let query: any = {};
    
    if(produit){
      query.produit = produit
    }
    
    if(promotionId){
      query.promotionId = promotionId
    }
    
    if(etudiantId){
      query.etudiantId = etudiantId
    }
    
    if(anneeId){
      query.anneeId = anneeId
    }

    const commandes = await Commandes.find()
        .populate('etudiantId')
        .populate('promotionId')
        .populate('anneeId')
    
    return NextResponse.json({
      success: true,
      data: commandes,
      messages: "Commandes fetch successfully"
    });
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
    const {
        etudiantId,
        promotionId,
        anneeId,
        montant,
        produit,
        statut
    } = body;

    if(!etudiantId || !promotionId || !anneeId || !montant || !produit || !statut){
      return NextResponse.json(
        { 
          success: false, 
          error: 'Tous les champs sont requis' 
        },
        { status: 400 }
      );

    }

    const newCommande = await Commandes.create({
        etudiantId,
        promotionId,
        anneeId,
        montant,
        produit,
        statut
    });

    console.log("New commande : ", newCommande);
    
    return NextResponse.json({
      success: true,
      data: newCommande,
      message: 'Commande créé avec succès'
    }, { status: 201 });
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

    const commandeUpdated = await Commandes.findByIdAndUpdate(
        id,
        updateData,
          { new: true, runValidators: true }
    )

    if (!commandeUpdated) {
        return { success: false, error: 'Élément non trouvé' };
    }
    
    return NextResponse.json(
      { success: true, data: commandeUpdated },
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
    const commande = await Commandes.findByIdAndDelete(body.id);
    
    return NextResponse.json(
      { success: true, data: commande },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}