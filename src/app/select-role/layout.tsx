import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Select Your Role | CodeSync",
  description: "Choose whether you want to join as a candidate or interviewer",
};

export default function SelectRoleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
} 