"use client";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import AgentManager from "@/components/ui/agents/AgentManager";

import { useParams } from "next/navigation";

const AgentsEnseignantsGradePage = () => {
    const params = useParams();
    const gradeCode = params.grade as string;

    return (
        <div>
            <PageBreadcrumb pageTitle={`Agents Enseignants - ${gradeCode}`} />
            <AgentManager gradeCode={gradeCode} />
        </div>
    );
};

export default AgentsEnseignantsGradePage;