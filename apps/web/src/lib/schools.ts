import { apiFetch } from "@/lib/auth-client";

export type School = {
  id: string;
  name: string;
  subCity: string | null;
  woreda: string | null;
  region: string;
  cohortTag: string | null;
  schoolType: string;
  verified: boolean;
  createdAt: string;
};

export async function fetchSchools(): Promise<School[]> {
  const data = await apiFetch<{ schools: School[] }>("/schools");
  return data.schools;
}
