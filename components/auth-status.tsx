"use client";

import {
  useRouter,
} from "next/navigation";

import {
  useState,
} from "react";

import {
  authClient,
} from "../src/auth-client.ts";

interface AuthStatusProps {
  name: string;
  email: string;
}

export function AuthStatus({
  name,
  email,
}: AuthStatusProps) {
  const router = useRouter();

  const [isSigningOut, setIsSigningOut] =
    useState(false);

  async function handleSignOut(): Promise<void> {
    setIsSigningOut(true);

    try {
    await authClient.signOut();

      router.replace("/sign-in");
    router.refresh();
    } finally {
    setIsSigningOut(false);
  }
  }

  return (
    <div className="authStatus">
      <span>
        {name || email}
      </span>

      <button
        type="button"
        disabled={isSigningOut}
        onClick={handleSignOut}
      >
        {isSigningOut
          ? "正在退出……"
          : "退出登录"}
      </button>
    </div>
  );
}