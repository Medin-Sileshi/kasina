"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ContentSkeleton } from "@/components/ui";

/** Old /results URL → same class page with the results tab selected. */
export default function ClassResultsRedirectPage() {
  const params = useParams<{ classId: string }>();
  const router = useRouter();

  useEffect(() => {
    router.replace(`/teacher/classes/${params.classId}?tab=results`);
  }, [params.classId, router]);

  return <ContentSkeleton rows={3} />;
}
