"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createAdminSession } from "@/lib/auth";

export type LoginFormState = {
  status: "idle" | "error";
  message: string;
};

export async function login(
  _previousState: LoginFormState,
  formData: FormData
): Promise<LoginFormState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { status: "error", message: "Please enter both email and password." };
  }

  const adminUser = await prisma.adminUser.findUnique({ where: { email } });

  // Deliberately show the SAME error message for "no such email" and
  // "wrong password" — telling an attacker which one was wrong (a common
  // mistake called a "user enumeration" vulnerability) would let them
  // confirm the founder's email is a valid login before trying to guess
  // passwords against it.
  const genericError = "Incorrect email or password.";

  if (!adminUser) {
    return { status: "error", message: genericError };
  }

  const passwordMatches = await bcrypt.compare(password, adminUser.passwordHash);
  if (!passwordMatches) {
    return { status: "error", message: genericError };
  }

  await createAdminSession(adminUser.id);

  // redirect() works by throwing a special (expected) error internally
  // that Next.js catches to perform the navigation — that's normal, and
  // why there's no `return` after this line.
  redirect("/admin");
}
