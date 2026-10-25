import { redirect } from "next/navigation";

/** Public Adey AI URL — aliases /melak for K0 rename. */
export default function AdeyMarketingRedirect() {
  redirect("/melak");
}
