import type { Company, User } from "@prisma/client";
import { useRouter } from "next/router";
import { useState } from "react";

import { RequireCompany } from "@/pages/util";
import { api } from "@/utils/api";
import { Routes } from "@/utils/router/routes";

export type Props = {
  user: User;
  company: Company;
};

export default function NewProjectPage({ company }: Props) {
  const [projectName, setProjectName] = useState(``);
  const router = useRouter();
  const createProject = api.project.createProject.useMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const project = await createProject.mutateAsync({
      name: projectName,
      companyId: company.id,
    });
    await router.push(
      Routes.company.project.home({
        orgSlug: company.slug,
        projectId: project.id,
      })
    );
  };

  return (
    <div className="flex h-screen flex-col items-center justify-center bg-background">
      <div className="w-full max-w-md rounded-lg bg-card p-8 shadow-lg">
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-card-foreground">
            Create a new project
          </h2>
          <p className="text-muted-foreground">
            What do you want to name your project?
          </p>
        </div>
        <div className="mt-6 space-y-4">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-card-foreground"
            >
              Name
            </label>
            <input
              type="text"
              id="name"
              autoFocus
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="mt-1 block w-full rounded-md border border-input px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-primary"
            />
          </div>
          <button
            onClick={handleSubmit}
            disabled={createProject.isPending}
            className="inline-flex justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 focus:outline-none focus:ring-1 focus:ring-primary focus:ring-offset-1"
          >
            {createProject.isPending ? `Creating...` : `Create project`}
          </button>
        </div>
      </div>
    </div>
  );
}

export const getServerSideProps = RequireCompany(({ user, company }) => {
  return {
    props: {
      user,
      company,
    },
  };
});
