import type { ReactNode } from "react";

interface PageContainerProps {
  children: ReactNode;
  className?: string;
}

/**
 * A reusable layout container for consistent page margins and spacing.
 * Ensures that content follows a standard width and provides consistent vertical spacing.
 */
const PageContainer = ({ children, className = "" }: PageContainerProps) => {
  return (
    <main className={`flex min-h-screen flex-col bg-[#FDFDFB] ${className}`}>
      <div className="flex-grow">
        <div className="mx-auto max-w-[1360px] px-0 py-0">
          {children}
        </div>
      </div>
    </main>
  );
};

export default PageContainer;
