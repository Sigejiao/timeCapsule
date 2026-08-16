"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useState,
} from "react";

import {
  authClient,
} from "../src/auth-client.ts";

export function AuthStatus() {
  const router = useRouter();

  const {
    data: session,
    isPending,
  } = authClient.useSession();

  const [isSigningOut, setIsSigningOut] =
    useState(false);

  async function handleSignOut(): Promise<void> {
    setIsSigningOut(true);

    await authClient.signOut();
    router.refresh();
    setIsSigningOut(false);
  }

  if (isPending) {
    return (
      <div className="authStatus">
        <span>正在确认登录状态……</span>
      </div>
    );
  }

  if (!session) {
    return (
      <nav
        className="authStatus"
        aria-label="账号"
      >
        <Link href="/sign-in">
          登录
        </Link>

        <Link
          className="authPrimaryLink"
          href="/sign-up"
        >
          注册
        </Link>
      </nav>
    );
  }

  return (
    <div className="authStatus">
      <span>
        {session.user.name ||
          session.user.email}
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