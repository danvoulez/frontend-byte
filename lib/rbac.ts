// RBAC permission map -- source of truth for frontend gate + tooltip text
// Backend MUST enforce the same rules via middleware

export type Role = "Owner" | "Admin" | "Operator" | "Auditor"

export type Permission =
  | "executions.read"
  | "executions.create"
  | "evidence.read"
  | "policies.read"
  | "policies.write"
  | "integrations.read"
  | "integrations.write"
  | "audits.read"
  | "billing.read"
  | "billing.write"
  | "team.read"
  | "team.write"
  | "settings.read"
  | "settings.write"

const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  Owner: [
    "executions.read", "executions.create",
    "evidence.read",
    "policies.read", "policies.write",
    "integrations.read", "integrations.write",
    "audits.read",
    "billing.read", "billing.write",
    "team.read", "team.write",
    "settings.read", "settings.write",
  ],
  Admin: [
    "executions.read", "executions.create",
    "evidence.read",
    "policies.read", "policies.write",
    "integrations.read", "integrations.write",
    "audits.read",
    "team.read", "team.write",
    "settings.read", "settings.write",
  ],
  Operator: [
    "executions.read", "executions.create",
    "evidence.read",
    "policies.read",
    "integrations.read",
  ],
  Auditor: [
    "executions.read",
    "evidence.read",
    "policies.read",
    "audits.read",
  ],
}

export function hasPermission(role: Role, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false
}

export function canAccessRoute(role: Role, route: string): boolean {
  const routePerms: Record<string, Permission> = {
    "/console":              "executions.read",
    "/console/executions":   "executions.read",
    "/console/evidence":     "evidence.read",
    "/console/policies":     "policies.read",
    "/console/integrations": "integrations.read",
    "/console/audits":       "audits.read",
    "/console/billing":      "billing.read",
    "/console/team":         "team.read",
    "/console/settings":     "settings.read",
    "/console/help":         "executions.read", // everyone sees help
  }
  const perm = routePerms[route]
  if (!perm) return true // unknown routes are allowed
  return hasPermission(role, perm)
}

export function tooltipForDenied(permission: Permission): string {
  const labels: Record<string, string> = {
    "billing.read":       "Acesso restrito ao Owner",
    "billing.write":      "Acesso restrito ao Owner",
    "team.write":         "Requer papel Admin ou superior",
    "settings.write":     "Requer papel Admin ou superior",
    "policies.write":     "Requer papel Admin ou superior",
    "integrations.write": "Requer papel Admin ou superior",
    "executions.create":  "Requer papel Operator ou superior",
    "audits.read":        "Requer papel Auditor ou superior",
  }
  return labels[permission] ?? "Sem permissao para esta acao"
}
