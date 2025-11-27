"use client";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { GradeManager } from "@/components/ui/agents/GradeManager";

const AdministratifsPage = () => {
    return (
        <div>
            <PageBreadcrumb pageTitle="Administratifs" />
            <GradeManager type="administratif" />
        </div>
    );
};

export default AdministratifsPage;
