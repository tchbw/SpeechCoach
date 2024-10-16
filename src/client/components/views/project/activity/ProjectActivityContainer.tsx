import React from "react";

import { cn } from "@/lib/utils";

type ProjectActivityContainerProps = {
  children: React.ReactNode;
  className?: string;
};

const ProjectActivityContainer: React.FC<ProjectActivityContainerProps> = ({
  children,
  className,
}) => {
  return (
    <div
      className={cn(
        `shadow-xs flex-1 rounded-lg border border-muted-foreground/20 bg-white`,
        className
      )}
    >
      {children}
    </div>
  );
};

export default ProjectActivityContainer;
