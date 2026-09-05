import type { Metadata } from "next";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = { title: "Admin Sign In" };

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <h1 className="text-center font-heading text-lg uppercase tracking-[0.2em] text-olive-dark">
          TÓLÚ KÍFÀ Admin
        </h1>
        <p className="mt-1 text-center text-sm text-olive-dark/60">
          Sign in to manage orders, inventory, and the site.
        </p>
        <div className="mt-8 border border-olive/15 bg-cream p-6">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
