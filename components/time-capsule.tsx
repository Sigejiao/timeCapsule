"use client";

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import type {
  FormEvent,
} from "react";
import type {
  CreateNoteResponse,
  ErrorResponse,
} from "../src/contracts/notes.ts";
import { useRouter } from "next/navigation";

interface TimeCapsuleProps {
  userId: string;
}

export function TimeCapsule({
  userId
}:TimeCapsuleProps) {
  const router = useRouter();

  const draftKey = `timecapsule:draft:${userId}`;

  const [content, setContent] =
    useState("");

  const [isFocusMode, setIsFocusMode] =
    useState(false);

  const [
    hasEnteredFocusMode,
    setHasEnteredFocusMode,
  ] = useState(false);

  const formRef =
    useRef<HTMLFormElement>(null);

  const transitionStartRectRef =
    useRef<DOMRect | null>(null);

  const [result, setResult] =
    useState<CreateNoteResponse | null>(
      null,
    );

  const [errorMessage, setErrorMessage] =
    useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  function rememberFormRect(): void {
    const form = formRef.current;

    if (form) {
      transitionStartRectRef.current =
        form.getBoundingClientRect();
    }
  }

  function enterFocusMode(): void {
    rememberFormRect();
    setHasEnteredFocusMode(true);
    setIsFocusMode(true);
  }

  function exitFocusMode(): void {
    rememberFormRect();
    setIsFocusMode(false);
  }

  useEffect(()=>{
    const savedDraft = localStorage.getItem(draftKey);

    if (savedDraft !== null) {
      setContent(savedDraft);
    }
  }, [draftKey])

  useEffect(() => {
    const characterCount =
      Array.from(content.trim()).length;

    if (characterCount === 0) {
      setHasEnteredFocusMode(false);
      return;
    }

    if (
      characterCount > 5 &&
      !hasEnteredFocusMode
    ) {
      enterFocusMode();
    }
  }, [content, hasEnteredFocusMode]);

  useEffect(() => {
    if (!isFocusMode) {
      return;
    }

    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow = "hidden";

    function handleKeyDown(
      event: KeyboardEvent,
    ): void {
      if (event.key === "Escape") {
        exitFocusMode();
      }
    }

    window.addEventListener(
      "keydown",
      handleKeyDown,
    );

    return () => {
      document.body.style.overflow =
        previousOverflow;

      window.removeEventListener(
        "keydown",
        handleKeyDown,
      );
    };
  }, [isFocusMode]);

  useLayoutEffect(() => {
    const form = formRef.current;
    const startRect =
      transitionStartRectRef.current;

    if (!form || !startRect) {
      return;
    }

    const endRect =
      form.getBoundingClientRect();

    transitionStartRectRef.current = null;

    if (
      window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches
    ) {
      return;
    }

    const translateX =
      startRect.left - endRect.left;

    const translateY =
      startRect.top - endRect.top;

    const scaleX =
      startRect.width / endRect.width;

    const scaleY =
      startRect.height / endRect.height;

    const animation = form.animate(
      [
        {
          transformOrigin: "top left",
          transform:
            `translate(${translateX}px, ${translateY}px) ` +
            `scale(${scaleX}, ${scaleY})`,
          borderRadius:
            isFocusMode ? "6px" : "0px",
        },
        {
          transformOrigin: "top left",
          transform:
            "translate(0, 0) scale(1, 1)",
          borderRadius:
            isFocusMode ? "0px" : "6px",
        },
      ],
      {
        duration: isFocusMode ? 420 : 320,
        easing:
          "cubic-bezier(0.22, 1, 0.36, 1)",
        fill: "both",
      },
    );

    return () => {
      animation.cancel();
    };
  }, [isFocusMode]);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ): Promise<void> {
    event.preventDefault();

    setErrorMessage(null);
    setResult(null);
    setIsSubmitting(true); 

    try {
      const response = await fetch(
        "/api/notes", // app/api/notes/route.ts
        {
          method: "POST", //创建新数据
          headers: {
            "Content-Type":
              "application/json",//通知服务器body格式
          },
          body: JSON.stringify({ //javascript to json
            content,
          }),
        },
      );

      if (response.status === 401) {
        localStorage.setItem(
          draftKey,
          content,
        );

        router.replace("/sign-in");
        router.refresh();

        return;
      }

      const responseBody =
        (await response.json()) as //json to javasctipt
          | CreateNoteResponse
          | ErrorResponse;

      if (!response.ok) {
        throw new Error(
          "error" in responseBody
            ? responseBody.error
            : "提交失败",
        );
      }

      if ("error" in responseBody) {
        throw new Error(responseBody.error);
      }

      setResult(responseBody);

      localStorage.removeItem(
        draftKey
      );

      setContent("");
      exitFocusMode();
      setHasEnteredFocusMode(false); 


    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "发生了未知错误",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="capsule">
      <header className="hero">
        <p className="eyebrow">
          TIME CAPSULE
        </p>

        <h1>写下此刻</h1>

        <p className="subtitle">
          每次记录之后，一条过去的笔记可能会重新出现。
        </p>
      </header>

      <form
        ref={formRef}
        className={
          isFocusMode
            ? "noteForm noteFormFocus"
            : "noteForm"
        }
        onSubmit={handleSubmit}
      >
        <label htmlFor="content">
          此刻发生了什么？
        </label>

        <textarea
          id="content"
          name="content"
          value={content}
          maxLength={5000}
          placeholder="写下你的经历、困惑、判断或感受……"
          onChange={(event) => {
            const nextContent = event.target.value;
            setContent(nextContent);            
          
            if (nextContent.length == 0){
              localStorage.removeItem(draftKey,);
            } else {
              localStorage.setItem(
                draftKey,
                nextContent,
              );
            }
          }}
        />

        {(isFocusMode ||
          hasEnteredFocusMode) && (
          <button
            className="focusExitButton"
            type="button"
            onClick={
              isFocusMode
                ? exitFocusMode
                : enterFocusMode
            }
          >
            {isFocusMode
              ? "退出"
              : "进入全屏模式"}
          </button>
        )}

        <div className="formFooter">
          <span>
            {content.length} / 5000
          </span>

          <button
            type="submit"
            disabled={
              isSubmitting ||
              content.trim().length === 0
            }
          >
            {isSubmitting
              ? "正在分析……"
              : "封存并召回"}
          </button>
        </div>
      </form>

      {errorMessage && ( //if 存在
        <p
          className="errorMessage"
          role="alert"
        >
          {errorMessage}
        </p>
      )}
  
      {result && (
        <div
          className="resultArea"
          aria-live="polite"
        >
          
          {result.recalledNote &&
          result.encounter ? (
            <article className="recallCard">
              <p className="cardLabel">
                一条旧笔记重新出现
              </p>

              <blockquote>
                {result.recalledNote.content}
              </blockquote>

              <footer>
                <time>
                  {new Date(
                    result.recalledNote.createdAt,
                  ).toLocaleString("zh-CN")}
                </time>

                <span>
                  相似度{" "}
                  {(
                    result.encounter
                      .similarity * 100
                  ).toFixed(1)}
                  %
                </span>
              </footer>
            </article>
          ) : (
            <p className="emptyRecall">
              这次还没有可召回的旧笔记。继续记录后，时间胶囊会逐渐形成。
            </p>
          )}
        </div>
      )}
    </section>
  );
}