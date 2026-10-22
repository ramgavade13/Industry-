import { Suspense } from "react";
import LoginHero from "@/components/LoginHero";

export default function Home() {
  return (
    <Suspense fallback={null}>
      <LoginHero variant="home" />
    </Suspense>
  );
}