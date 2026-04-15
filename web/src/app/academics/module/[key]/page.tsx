import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NzAcademicSectionPage } from "@/components/academics/nz-academic-section-page";
import { NzOptionalSubjectsPage } from "@/components/academics/nz-optional-subjects-page";
import { NzSchoolClassesPage } from "@/components/academics/nz-school-classes-page";
import { NzSubjectsCatalogPage } from "@/components/academics/nz-subjects-catalog-page";
import { SidebarModuleDetail } from "@/components/sidebar-module-detail";
import { isAcademicsSidebarModuleKey } from "@/lib/academics-menu";
import { getAdminModuleByKey } from "@/lib/admin-control-center";

type Props = { params: Promise<{ key: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { key } = await params;
  if (key === "subjects-catalog") {
    return {
      title: "Subjects — NZ Curriculum — Youth programme",
      description:
        "Eight NZC learning areas with suggested subject names and codes for timetabling and reporting.",
    };
  }
  if (key === "school-classes") {
    return {
      title: "Class — NZ reference — Youth programme",
      description: "Year levels, class types, naming patterns, and example codes for NZ schools.",
    };
  }
  return {};
}

export default async function AcademicsModulePage({ params }: Props) {
  const { key } = await params;
  if (!isAcademicsSidebarModuleKey(key)) notFound();

  if (key === "subjects-catalog") {
    return <NzSubjectsCatalogPage />;
  }

  if (key === "school-classes") {
    return <NzSchoolClassesPage />;
  }

  if (key === "academic-section") {
    return <NzAcademicSectionPage />;
  }

  if (key === "optional-subjects") {
    return <NzOptionalSubjectsPage />;
  }

  const mod = getAdminModuleByKey(key);
  if (!mod) notFound();

  return (
    <SidebarModuleDetail
      mod={mod}
      homeHref="/dashboard"
      homeLabel="Dashboard"
      plannedExtra="This module is on the product roadmap. Academics menu items link here for training and future rollout. Related live tools (exams, evaluations) are linked where marked Available."
    />
  );
}
