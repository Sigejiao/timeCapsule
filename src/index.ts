import {
  stdin,
  stdout,
} from "node:process";

import {
  createInterface,
} from "node:readline/promises";

import {
  DEMO_USER_ID,
} from "./config.ts";

import {
  readNotesByUserId,
} from "./db/queries.ts";

import {
  processNewNote,
} from "./services/notes.ts";

import type {
  Note,
} from "./types.ts";

function showNotes(
  notes: Note[],
): void {
  if (notes.length === 0) {
    console.log("\n目前还没有笔记。");
    return;
  }

  console.log(
    `\n共有 ${notes.length} 条笔记：`,
  );

  notes.forEach((note, index) => {
    console.log(
      `\n${index + 1}. ${note.content}`,
    );

    console.log(
      `状态：${note.status}`,
    );

    if (note.patternCard) {
      console.log(
        `模式：${note.patternCard.recurringPattern}`,
      );
    }
  });
}

async function main(): Promise<void> {
  const readline = createInterface({
    input: stdin,
    output: stdout,
  });

  console.log("时间胶囊 MVP");
  console.log("============");

  while (true) {
    console.log("\n请选择：");
    console.log("1. 写入一条新笔记");
    console.log("2. 查看已有笔记");
    console.log("3. 退出");

    const choice = (
      await readline.question(
        "\n请输入数字：",
      )
    ).trim();

    if (choice === "1") {
      const content = (
        await readline.question(
          "\n请写下此刻想记录的内容：\n",
        )
      ).trim();

      if (!content) {
        console.log("笔记内容不能为空。");
        continue;
      }

      try {
        console.log(
          "\n原始笔记将先保存，然后生成模式卡与向量……",
        );

        const result =
          await processNewNote(
            DEMO_USER_ID,
            content,
          );

        console.log("\n模式卡片：");
        console.log(
          JSON.stringify(
            result.newNote.patternCard,
            null,
            2,
          ),
        );

        if (
          !result.recalledNote ||
          !result.encounter
        ) {
          console.log(
            "\n目前还没有可匹配的旧笔记。继续写入下一条后，就可以开始召回。",
          );

          continue;
        }

        console.log(
          "\n找到了一条与你当前状态相呼应的旧笔记：",
        );
        console.log("--------------------------------");
        console.log(result.recalledNote.content);
        console.log("--------------------------------");
        console.log(
          `相似度：${result.encounter.similarity.toFixed(3)}`,
        );
      } catch (error) {
        console.error(
          "\nAI 处理失败，但原始笔记已经保存。",
        );

        console.error(
          error instanceof Error
            ? error.message
            : error,
        );
      }

      continue;
    }

    if (choice === "2") {
      const notes =
        await readNotesByUserId(
          DEMO_USER_ID,
        );

      showNotes(notes);
      continue;
    }

    if (choice === "3") {
      console.log("\n时间胶囊已关闭。");
      readline.close();
      return;
    }

    console.log("请输入 1、2 或 3。");
  }
}

main().catch((error) => {
  console.error("\n程序启动失败：");

  console.error(
    error instanceof Error
      ? error.message
      : error,
  );

  process.exit(1);
});