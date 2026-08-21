"use client";

import {
  useState,
} from "react";

import type {
  FormEvent,
} from "react";

import type {
  CreateNoteResponse,
  ErrorResponse,
} from "../src/contracts/notes.ts";

export function TimeCapsule() {
  const [content, setContent] =
    useState("");

  const [result, setResult] =
    useState<CreateNoteResponse | null>(
      null,
    );

  const [errorMessage, setErrorMessage] =
    useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] =
    useState(false);

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
      setContent("");
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
        className="noteForm"
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
            setContent(event.target.value);
          }}
        />

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
          {result.newNote.patternCard && (
            <article className="resultCard">
              <p className="cardLabel">
                这次记录呈现出的模式
              </p>

              <h2>
                {
                  result.newNote.patternCard
                    .recurringPattern
                }
              </h2>

              <dl className="patternGrid">
                <div>
                  <dt>情景</dt>
                  <dd>
                    {
                      result.newNote.patternCard
                        .situation
                    }
                  </dd>
                </div>

                <div>
                  <dt>思维张力</dt>
                  <dd>
                    {
                      result.newNote.patternCard
                        .thinkingTension
                    }
                  </dd>
                </div>

                <div>
                  <dt>动机需求</dt>
                  <dd>
                    {
                      result.newNote.patternCard
                        .motivationNeed
                    }
                  </dd>
                </div>
              </dl>

              <div className="keywords">
                {result.newNote.patternCard
                  .keywords.map((keyword) => (
                    <span key={keyword}>
                      {keyword}
                    </span>
                  ))}
              </div>
            </article>
          )}

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