export function getRoleLabel(role: string): string {
  if (role === "researcher") return "Agricultural Researcher";
  if (role === "farmer") return "Farmer";
  if (role === "admin") return "Administrator";
  return role;
}
