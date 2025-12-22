import { Model, Document } from 'mongoose';
import { Mention, Filiere, Promotion, Section } from '@/models/Mention';
import '@/models/Semestre';

// Interface générique pour les contrôleurs CRUD
interface CrudController<T extends Document> {
  create: (data: Partial<T>) => Promise<{ success: boolean; data?: T; error?: string }>;
  getAll: (populate?: string[], filter?: any) => Promise<{ success: boolean; data?: T[]; error?: string }>;
  getById: (id: string, populate?: string[]) => Promise<{ success: boolean; data?: T; error?: string }>;
  update: (id: string, data: Partial<T>) => Promise<{ success: boolean; data?: T; error?: string }>;
  delete: (id: string) => Promise<{ success: boolean; error?: string }>;
}

// Fonction générique pour créer un contrôleur CRUD
function createCrudController<T extends Document>(model: Model<T>): CrudController<T> {
  return {
    // Créer un nouvel élément
    async create(data: Partial<T>) {
      try {
        const newItem = new model(data);
        const savedItem = await newItem.save();
        return { success: true, data: savedItem };
      } catch (error: any) {
        console.error(`Erreur lors de la création:`, error);
        return { 
          success: false, 
          error: error.code === 11000 ? 'Cet élément existe déjà' : error.message 
        };
      }
    },

    // Récupérer tous les éléments
    async getAll(populate: string[] = [], filter: any= {}) {
      try {
        let query = model.find(filter);
        
        // Appliquer les populations si spécifiées
        populate.forEach(field => {
          query = query.populate(field);
        });

        const items = await query.sort({ createdAt: -1 });
        return { success: true, data: items };
      } catch (error: any) {
        console.error(`Erreur lors de la récupération:`, error);
        return { success: false, error: error.message };
      }
    },

    // Récupérer un élément par ID
    async getById(id: string, populate: string[] = []) {
      try {
        let query = model.findById(id);
        
        // Appliquer les populations si spécifiées
        populate.forEach(field => {
          query = query.populate(field);
        });

        const item = await query;
        if (!item) {
          return { success: false, error: 'Élément non trouvé' };
        }
        return { success: true, data: item };
      } catch (error: any) {
        console.error(`Erreur lors de la récupération par ID:`, error);
        return { success: false, error: error.message };
      }
    },

    // Mettre à jour un élément
    async update(id: string, data: Partial<T>) {
      try {
        const updatedItem = await model.findByIdAndUpdate(
          id, 
          data, 
          { new: true, runValidators: true }
        );
        
        if (!updatedItem) {
          return { success: false, error: 'Élément non trouvé' };
        }
        
        return { success: true, data: updatedItem };
      } catch (error: any) {
        console.error(`Erreur lors de la mise à jour:`, error);
        return { 
          success: false, 
          error: error.code === 11000 ? 'Cet élément existe déjà' : error.message 
        };
      }
    },

    // Supprimer un élément
    async delete(id: string) {
      try {
        const deletedItem = await model.findByIdAndDelete(id);
        if (!deletedItem) {
          return { success: false, error: 'Élément non trouvé' };
        }
        return { success: true };
      } catch (error: any) {
        console.error(`Erreur lors de la suppression:`, error);
        return { success: false, error: error.message };
      }
    }
  };
}

// Créer les contrôleurs pour chaque collection
export const MentionControllers = createCrudController(Mention);
export const FiliereControllers = createCrudController(Filiere);
export const PromotionControllers = createCrudController(Promotion);
export const SectionControllers = createCrudController(Section);

// Fonctions spécialisées pour les relations

// Ajouter une filière à une mention
export const addFiliereToMention = async (mentionId: string, filiereId: string) => {
  try {
    const mention = await Mention.findByIdAndUpdate(
      mentionId,
      { $addToSet: { filieres: filiereId } },
      { new: true }
    );
    
    if (!mention) {
      return { success: false, error: 'Mention non trouvée' };
    }
    
    return { success: true, data: mention };
  } catch (error: any) {
    console.error('Erreur lors de l\'ajout de filière à la mention:', error);
    return { success: false, error: error.message };
  }
};

// Retirer une filière d'une mention
export const removeFiliereFromMention = async (mentionId: string, filiereId: string) => {
  try {
    const mention = await Mention.findByIdAndUpdate(
      mentionId,
      { $pull: { filieres: filiereId } },
      { new: true }
    );
    
    if (!mention) {
      return { success: false, error: 'Mention non trouvée' };
    }
    
    return { success: true, data: mention };
  } catch (error: any) {
    console.error('Erreur lors de la suppression de filière de la mention:', error);
    return { success: false, error: error.message };
  }
};

// Ajouter une promotion à une filière
export const addPromotionToFiliere = async (filiereId: string, promotionId: string) => {
  try {
    const filiere = await Filiere.findByIdAndUpdate(
      filiereId,
      { $addToSet: { promotions: promotionId } },
      { new: true }
    );
    
    if (!filiere) {
      return { success: false, error: 'Filière non trouvée' };
    }
    
    return { success: true, data: filiere };
  } catch (error: any) {
    console.error('Erreur lors de l\'ajout de promotion à la filière:', error);
    return { success: false, error: error.message };
  }
};

// Ajouter une filière à une section
export const addFiliereToSection = async (sectionId: string, filiereId: string) => {
  try {
    const section = await Section.findByIdAndUpdate(
      sectionId,
      { $addToSet: { filieres: filiereId } },
      { new: true }
    );
    
    if (!section) {
      return { success: false, error: 'Section non trouvée' };
    }
    
    return { success: true, data: section };
  } catch (error: any) {
    console.error('Erreur lors de l\'ajout de filière à la section:', error);
    return { success: false, error: error.message };
  }
};

// Ajouter un membre au bureau d'une filière
export const addBureauMemberToFiliere = async (filiereId: string, agentId: string, role: string) => {
  try {
    const filiere = await Filiere.findByIdAndUpdate(
      filiereId,
      { $addToSet: { bureau: { agent: agentId, role } } },
      { new: true }
    ).populate('bureau.agent');
    
    if (!filiere) {
      return { success: false, error: 'Filière non trouvée' };
    }
    
    return { success: true, data: filiere };
  } catch (error: any) {
    console.error('Erreur lors de l\'ajout de membre au bureau:', error);
    return { success: false, error: error.message };
  }
};

// Ajouter un membre au bureau d'une section
export const addBureauMemberToSection = async (sectionId: string, agentId: string, role: string) => {
  try {
    const section = await Section.findByIdAndUpdate(
      sectionId,
      { $addToSet: { bureau: { agent: agentId, role } } },
      { new: true }
    ).populate('bureau.agent');
    
    if (!section) {
      return { success: false, error: 'Section non trouvée' };
    }
    
    return { success: true, data: section };
  } catch (error: any) {
    console.error('Erreur lors de l\'ajout de membre au bureau:', error);
    return { success: false, error: error.message };
  }
};

// Recupérer les filieres auquel un agent est affecté au bureau de section
export const fetchFilieresOfSectionByAgentId = async (agentId: string) => {
  try {
    const sections = await Section.find({ 'bureau.agent': agentId })
      .populate({
        path: 'filieres',
        populate: {
          path: 'promotions',
          model: 'Promotion',
          populate: {
            path: 'semestres',
            model: 'Semestre',
            populate: {
              path: 'unites',
              model: 'Unite',
              populate: {
                path: 'matieres',
                model: 'Matiere'
              }
            }
          }
        }
      });

    if(!sections || sections.length === 0){
      return {
        success: false,
        error: 'Sections non trouvées'
      }
    }

    const filieres = sections.map(section => section.filieres);
    
    return { success: true, data: filieres };
  } catch (error: any) {
    console.error('Erreur lors de la récupération des filieres:', error);
    return { success: false, error: error.message };
  }
};


export default {
  MentionControllers,
  FiliereControllers,
  PromotionControllers,
  SectionControllers,
  addFiliereToMention,
  removeFiliereFromMention,
  addPromotionToFiliere,
  addFiliereToSection,
  addBureauMemberToFiliere,
  addBureauMemberToSection,
  fetchFilieresOfSectionByAgentId
};