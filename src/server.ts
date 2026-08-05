import express from "express";
import { readNotesByUserId } from "./db/queries.ts";

const app = express();
const port = Number(process.env.PORT ?? 3000);

const currentUserId = "demo";

app.use(express.json());

app.get("/api/health", (_request, response) => {
    response.json({
        status: "ok",
    });
});

app.get(
    "/api/notes",
    async (_request, response) => {
        try {

            const notes = await readNotesByUserId(currentUserId);

            const items = notes.map((note) => ({
                id: note.id,
                content: note.content,
                createdAt: note.createdAt,
                status: note.status,
                patternCard: note.patternCard ?? null,
            }));

            response.json({
                items,
                count: items.length,
            });
        } catch (error) {
            console.error("读取笔记失败", error);

            response.status(500).json({
                error: "读取笔记失败",
            });
        }
    },
);

app.listen(port, () => {
    console.log(
        '时间胶囊 API 已启动：http://localhost:${port}',
    );
});
