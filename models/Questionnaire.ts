import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IDevoir extends Document {
    url: String;
    typeFile?: String;
}

export interface ITravailPratique extends Document {
    questions: {
        title: String;
        description?: String;
        points: Number;
        filePath?: String;
    }[];
    typeFile?: String;
}

export interface IProjet extends Document {
    contexte: String;
    problematiques: {
        title: String;
        description?: String;
        filePath?: String;
    }[];
    typeFile?: String;
}

export interface IQCM extends Document {
    questions: {
        questionText: String;
        options: {
            text: String;
            isCorrect: Boolean;
        }[];
        points: Number;
    }[];
}

export interface IQuestionnaire extends Document {
    activityId: mongoose.Types.ObjectId;
    status: String;
    dateRemise: Date;
    maximumScore: Number;
    devoir?: IDevoir;
    travailPratique?: ITravailPratique;
    projet?: IProjet;
    qcm?: IQCM;
    createdAt: Date;
    updatedAt: Date;
}

const QuestionnaireSchema = new Schema<IQuestionnaire>({
    activityId: { type: mongoose.Schema.Types.ObjectId, ref: 'Activity', required: true },
    status: { type: String, enum: ['ok', 'pending', 'no'], default: 'no' },
    dateRemise: { type: Date, required: true },
    maximumScore: { type: Number, required: true },
    devoir: {
        url: { type: String },
        typeFile: { type: String }
    },
    travailPratique: {
        questions: [{
            title: { type: String },
            description: { type: String },
            points: { type: Number },
            filePath: { type: String }
        }],
        typeFile: { type: String }
    },
    projet: {
        contexte: { type: String },
        problematiques: [{
            title: { type: String },
            description: { type: String },
            filePath: { type: String }
        }],
        typeFile: { type: String }
    },
    qcm: {
        questions: [{
            questionText: { type: String },
            options: [{
                text: { type: String },
                isCorrect: { type: Boolean }
            }],
            points: { type: Number }
        }]
    }
}, { timestamps: true });

// Modèle
const Questionnaire: Model<IQuestionnaire> = mongoose.models.Questionnaire || mongoose.model<IQuestionnaire>('Questionnaire', QuestionnaireSchema);

export default Questionnaire;