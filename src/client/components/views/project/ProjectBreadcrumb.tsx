import type { Company } from "@prisma/client";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/client/components/ui/breadcrumb";
import type { ProjectWithDefaults } from "@/server/services/project/model";
import { Routes } from "@/utils/router/routes";

type ProjectBreadcrumbProps = {
  company: Company;
  project: ProjectWithDefaults;
};

export function ProjectBreadcrumb({
  company,
  project,
}: ProjectBreadcrumbProps) {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink
            href={Routes.company.dashboard({ orgSlug: company.slug })}
          >
            Projects
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>{project.name}</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}
