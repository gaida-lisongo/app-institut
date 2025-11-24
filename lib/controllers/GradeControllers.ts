import dbConnect from '@/lib/dbConnect';
import Grade, { IGrade, GradeData, CreateGradeData } from '@/models/Grade';

class GradeController {
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

    //get grades by type
    async getGradesByType(type: string) {
        try {
            const grades = await Grade.find({ type });
            return grades;
        } catch (error) {
            console.error('Error fetching grades by type:', error);
            throw error;
        }
    }

    //get grade by code
    async getGradeByCode(code: string) {
        try {
            const grade = await Grade.findOne({ code });
            return grade;
        } catch (error) {
            console.error('Error fetching grade by code:', error);
            throw error;
        }
    }

    //create grade
    async createGrade(grade: CreateGradeData) {
        try {
            const newGrade = await Grade.create(grade);
            return newGrade;
        } catch (error) {
            console.error('Error creating grade:', error);
            throw error;
        }
    }

    //update grade
    async updateGrade(id: string, grade: Partial<CreateGradeData>) {
        try {
            const updatedGrade = await Grade.findByIdAndUpdate(id, grade, { new: true });
            return updatedGrade;
        } catch (error) {
            console.error('Error updating grade:', error);
            throw error;
        }
    }

    //delete grade
    async deleteGrade(id: string) {
        try {
            const deletedGrade = await Grade.findByIdAndDelete(id);
            return deletedGrade;
        } catch (error) {
            console.error('Error deleting grade:', error);
            throw error;
        }
    }
}

export default new GradeController();