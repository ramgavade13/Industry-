import { Suspense } from "react";
import LoginHero from "@/components/LoginHero";

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginHero variant="login" />
    </Suspense>
  );
}