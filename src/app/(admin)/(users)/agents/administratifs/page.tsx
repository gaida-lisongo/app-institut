"use client";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { GradeData, CreateGradeData } from "@/models/Grade";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { GradeManager } from "../enseignants/page";

const AdministratifsPage = () => {
    return (
        <div>
            <PageBreadcrumb pageTitle="Administratifs" />
            <GradeManager type="administratif" />
        </div>
    );
};

export default AdministratifsPage;
