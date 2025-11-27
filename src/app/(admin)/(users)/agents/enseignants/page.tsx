"use client";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { GradeManager } from "@/components/ui/agents/GradeManager";


const EnseignantsPage = () => {
    return (
        <div>
            <PageBreadcrumb pageTitle="Enseignants" />
            <GradeManager type="enseignant" />
        </div>
    );
};


export default EnseignantsPage;
