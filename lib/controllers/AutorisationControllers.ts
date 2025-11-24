import dbConnect from "@/lib/dbConnect";
import Autorisation, { IAutorisation, AutorisationData, CreateAutorisationData } from "@/models/Autorisation";
import { Types } from "mongoose";

class AutorisationController {
    //constructor
    constructor() {
        dbConnect()
            .then(() => {
                console.log('Connected to MongoDB');
            })
            .catch((error) => {
                console.error('Error connecting to MongoDB:', error);
            });
    }

    //get all autorisations
    async getAllAutorisations() {
        try {
            const autorisations = await Autorisation.find().populate('agents').populate('agents.grade');
            return autorisations;
        } catch (error) {
            console.error('Error fetching autorisations:', error);
            throw error;
        }
    }

    //get autorisations by agentID
    async getAutorisationsByAgentID(agentID: string) {
        try {
            const autorisations = await Autorisation
                .find()
                .populate('agents')
                .populate('agents.grade')
                .where('agents._id').equals(agentID);
            return autorisations;
        } catch (error) {
            console.error('Error fetching autorisations by agent ID:', error);
            throw error;
        }
    }
    
    //create autorisation
    async createAutorisation(autorisation: any) {
        try {
            // Convertir les agents string[] en ObjectId[] si nécessaire
            const autorisationData = {
                ...autorisation,
                agents: autorisation.agents?.map((agentId: string) => 
                    typeof agentId === 'string' ? new Types.ObjectId(agentId) : agentId
                ) || []
            };
            
            const newAutorisation = await Autorisation.create(autorisationData);
            return newAutorisation;
        } catch (error) {
            console.error('Error creating autorisation:', error);
            throw error;
        }
    }
    //update autorisation
    async updateAutorisation(id: string, autorisation: any) {
        try {
            // Convertir les agents string[] en ObjectId[] si nécessaire
            const updateData = {
                ...autorisation,
                agents: autorisation.agents?.map((agentId: string) => 
                    typeof agentId === 'string' ? new Types.ObjectId(agentId) : agentId
                ) || autorisation.agents
            };
            
            const updatedAutorisation = await Autorisation.findByIdAndUpdate(id, updateData, { new: true });
            return updatedAutorisation;
        } catch (error) {
            console.error('Error updating autorisation:', error);
            throw error;
        }
    }
    
    //delete autorisation
    async deleteAutorisation(id: string) {
        try {
            const deletedAutorisation = await Autorisation.findByIdAndDelete(id);
            return deletedAutorisation;
        } catch (error) {
            console.error('Error deleting autorisation:', error);
            throw error;
        }
    }
}

export default new AutorisationController();