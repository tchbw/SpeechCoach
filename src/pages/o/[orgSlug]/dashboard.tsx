import { ProjectStatus } from "@prisma/client";
import { PlusCircle } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/client/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/client/components/ui/breadcrumb";
import { buttonVariants } from "@/client/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/client/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/client/components/ui/table";
import { api } from "@/utils/api";
import { Routes } from "@/utils/router/routes";

export const description = `An products dashboard with a sidebar navigation. The sidebar has icon navigation. The content area has a breadcrumb and search in the header. It displays a list of products in a table with actions.`;

import { type Company } from "@prisma/client";
import clsx from "clsx";

import { ProjectActionsDropdown } from "@/client/components/views/project/dashboard/ToggleProjectStatusDropdownItem";
import { ProfileDropdown } from "@/client/components/views/project/ProfileDropdown";
import { RequireCompany } from "@/pages/util";

type Props = {
  company: Company;
};

export default function Dashboard({ company }: Props) {
  // Fetch company projects
  const {
    data: projects,
    refetch: refetchProjects,
    isLoading,
  } = api.project.getCompanyProjects.useQuery(
    { companyId: company.id },
    { enabled: !!company.id }
  );

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <div className="flex flex-col sm:gap-4 sm:py-4 ">
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
          <Breadcrumb className="hidden md:flex">
            <BreadcrumbList>
              <BreadcrumbItem>{company.publicName}</BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Dashboard</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <ProfileDropdown />
        </header>
        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-6">
          {isLoading ? (
            <Card className="animate-pulse">
              <CardHeader className="flex flex-row items-start justify-between">
                <div className="grid gap-2">
                  <div className="h-6 w-24 rounded bg-muted"></div>
                  <div className="h-4 w-48 rounded bg-muted"></div>
                </div>
                <div className="h-9 w-24 rounded bg-muted"></div>
              </CardHeader>
              <CardContent>
                <div className="h-64 rounded bg-muted"></div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader className="flex flex-row items-start justify-between">
                <div className="grid gap-2">
                  <CardTitle>Projects</CardTitle>
                  <CardDescription>
                    View and manage your projects.
                  </CardDescription>
                </div>
                <Link
                  className={clsx(buttonVariants(), `gap-2`)}
                  href={Routes.company.project.new({
                    orgSlug: company.slug,
                  })}
                >
                  <PlusCircle className="h-3.5 w-3.5" />
                  <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                    New project
                  </span>
                </Link>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created at</TableHead>
                      <TableHead>
                        <span className="sr-only">Actions</span>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {projects?.map((project) => (
                      <TableRow key={project.id}>
                        <TableCell className="font-medium">
                          {project.status === ProjectStatus.ACTIVE ? (
                            <Link
                              href={Routes.company.project.home({
                                orgSlug: company.slug,
                                projectId: project.id,
                              })}
                            >
                              {project.name}
                            </Link>
                          ) : (
                            <span className="text-muted-foreground">
                              {project.name}
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              project.status === ProjectStatus.ACTIVE
                                ? `default`
                                : `secondary`
                            }
                          >
                            {project.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(project.createdAt).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <ProjectActionsDropdown
                            project={project}
                            companyId={company.id}
                            onSuccess={() => {
                              void refetchProjects();
                            }}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </main>
      </div>
    </div>
  );
}

export const getServerSideProps = RequireCompany(({ company }) => {
  return {
    props: {
      company,
    },
  };
});
