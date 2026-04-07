import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/pages/api/auth/[...nextauth]";

export async function requireOwner() {
  const session = await getServerSession(authOptions);
  if (!session || !session.isOwner) redirect("/private-admin/signin");
  return session;
}
