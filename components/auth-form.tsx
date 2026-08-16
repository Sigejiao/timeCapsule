"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useState,
} from "react";

import type {
  FormEvent,
} from "react";

import {
  authClient,
} from "../src/auth-client.ts";

type AuthFormProps = {
  mode: "sign-in" | "sign-up";
};

export function AuthForm({
  mode,
}: AuthFormProps) {
  const router = useRouter();

  const isSignUp = mode === "sign-up";

  const [name, setName] = useState("");
  const [email, setEmail] =
    useState("");
  const [password, setPassword] =
    useState("");

  const [errorMessage, setErrorMessage] =
    useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ): Promise<void> {
    event.preventDefault();

    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      if (isSignUp) {
        const result =
          await authClient.signUp.email({
            name: name.trim(),
            email: email.trim(),
            password,
          });

        if (result.error) {
          setErrorMessage(
            result.error.message ??
              "注册失败，请稍后重试",
          );
          return;
        }
      } else {
        const result =
          await authClient.signIn.email({
            email: email.trim(),
            password,
          });

        if (result.error) {
          setErrorMessage(
            result.error.message ??
              "登录失败，请检查邮箱和密码",
          );
          return;
        }
      }

      router.replace("/");
      router.refresh();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "认证请求失败，请稍后重试",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="authPage">
      <section className="authPanel">
        <header className="authHeader">
          <p className="eyebrow">
            TIME CAPSULE
          </p>

          <h1>
            {isSignUp
              ? "创建时间胶囊"
              : "重新打开时间胶囊"}
          </h1>

          <p>
            {isSignUp
              ? "创建账号，让每一条记录都归属于你。"
              : "登录后，继续记录和遇见过去的自己。"}
          </p>
        </header>

        <form
          className="authForm"
          onSubmit={handleSubmit}
        >
          {isSignUp && (
            <label>
              <span>名字</span>

              <input
                type="text"
                name="name"
                value={name}
                required
                autoComplete="name"
                placeholder="如何称呼你"
                onChange={(event) => {
                  setName(event.target.value);
                }}
              />
            </label>
          )}

          <label>
            <span>邮箱</span>

            <input
              type="email"
              name="email"
              value={email}
              required
              autoComplete="email"
              placeholder="name@example.com"
              onChange={(event) => {
                setEmail(event.target.value);
              }}
            />
          </label>

          <label>
            <span>密码</span>

            <input
              type="password"
              name="password"
              value={password}
              required
              minLength={8}
              autoComplete={
                isSignUp
                  ? "new-password"
                  : "current-password"
              }
              placeholder="至少 8 个字符"
              onChange={(event) => {
                setPassword(event.target.value);
              }}
            />
          </label>

          {errorMessage && (
            <p
              className="errorMessage"
              role="alert"
            >
              {errorMessage}
            </p>
          )}

          <button
            className="authSubmit"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting
              ? "请稍候……"
              : isSignUp
                ? "创建账号"
                : "登录"}
          </button>
        </form>

        <p className="authSwitch">
          {isSignUp
            ? "已经有账号？"
            : "还没有账号？"}

          <Link
            href={
              isSignUp
                ? "/sign-in"
                : "/sign-up"
            }
          >
            {isSignUp ? "登录" : "注册"}
          </Link>
        </p>
      </section>
    </main>
  );
}