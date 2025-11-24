import dbConnect from '@/lib/dbConnect';
import Agent, { IAgent, AgentData, CreateAgentData } from '@/models/Agent';
import Grade from '@/models/Grade';

class AgentController {
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

    //get agents by code of grade
    async getAgentsByGradeCode(code: string) {
        try {
            // First find the grade by code
            const grade = await Grade.findOne({ code });
            if (!grade) {
                return [];
            }
            
            // Then find agents with this grade ID
            const agents = await Agent.find({ grade: grade._id }).populate('grade');
            return agents;
        } catch (error) {
            console.error('Error fetching agents by grade code:', error);
            throw error;
        }
    }
    

    //create agent
    async createAgent(agent: CreateAgentData) {
        try {
            const newAgent = await Agent.create(agent);
            return newAgent;
        } catch (error) {
            console.error('Error creating agent:', error);
            throw error;
        }
    }
    //update agent
    async updateAgent(id: string, agent: Partial<CreateAgentData>) {
        try {
            const updatedAgent = await Agent.findByIdAndUpdate(id, agent, { new: true });
            return updatedAgent;
        } catch (error) {
            console.error('Error updating agent:', error);
            throw error;
        }
    }
    
    //delete agent
    async deleteAgent(id: string) {
        try {
            const deletedAgent = await Agent.findByIdAndDelete(id);
            return deletedAgent;
        } catch (error) {
            console.error('Error deleting agent:', error);
            throw error;
        }
    }
}

export default new AgentController();