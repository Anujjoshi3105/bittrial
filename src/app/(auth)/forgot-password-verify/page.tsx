import { redirect } from "next/navigation";
import { emailSchema } from "./_schema";
import ForgotPasswordVerifyPage from "./forgot-password-verify";

type Props = {
  searchParams: Promise<{ mailto: string }>;
};

export default async function ForgotPasswordVerifyRootPage({
  searchParams,
}: Props) {
  const { mailto } = await searchParams;
  const email = emailSchema.safeParse(mailto);

  if (!email.success) return redirect("/forgot-password");

  return <ForgotPasswordVerifyPage />;
}
