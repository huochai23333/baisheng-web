import type { SupabaseClient } from "@supabase/supabase-js";

import { withRequestTimeout } from "./request-timeout";
import { normalizeOptionalString } from "./value-normalizers";

type TaskTypeRecord = { code: string | null; display_name: string | null };
type TeamRecord = { id: string | null; team_name: string | null };

export async function getTaskCommissionTypeRecords(
  supabase: SupabaseClient,
  taskTypeCodes: string[],
): Promise<Array<{ code: string; display_name: string | null }>> {
  if (taskTypeCodes.length === 0) return [];
  const { data, error } = await withRequestTimeout(
    supabase
      .from("task_type_catalog")
      .select("code,display_name")
      .in("code", taskTypeCodes)
      .returns<TaskTypeRecord[]>(),
  );
  if (error) throw error;
  return (data ?? [])
    .map((row) => {
      const code = normalizeOptionalString(row.code);
      return code
        ? { code, display_name: normalizeOptionalString(row.display_name) }
        : null;
    })
    .filter(
      (row): row is { code: string; display_name: string | null } =>
        row !== null,
    );
}

export async function getTaskCommissionTeamRecords(
  supabase: SupabaseClient,
  teamIds: string[],
): Promise<Array<{ id: string; team_name: string | null }>> {
  if (teamIds.length === 0) return [];
  const { data, error } = await withRequestTimeout(
    supabase
      .from("team_profiles")
      .select("id,team_name")
      .in("id", teamIds)
      .returns<TeamRecord[]>(),
  );
  if (error) throw error;
  return (data ?? [])
    .map((row) => {
      const id = normalizeOptionalString(row.id);
      return id ? { id, team_name: normalizeOptionalString(row.team_name) } : null;
    })
    .filter(
      (row): row is { id: string; team_name: string | null } => row !== null,
    );
}
