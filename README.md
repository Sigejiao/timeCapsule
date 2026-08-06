# timeCapsule
一个日记工具，但是不可以查看已有日记，只能在写下日记之后得到一条曾经写过的相似思考。类似时间胶囊。


## 项目结构【内容不一定准确，暂时为描述测试】

src/
├── server.ts
│ Express API入口，负责HTTP请求处理
│
├── db/
│ 数据库相关代码
│ ├── client.ts
│ │ PostgreSQL连接和Drizzle初始化
│ │
│ └── schema.ts
│ 数据库表结构定义
│
├── ai/
│ AI能力模块
│ ├── analyze-pattern.ts
│ │ 从笔记提取模式卡片
│ │
│ └── create-embedding.ts
│ 生成文本向量
│
├── services/
│ 业务逻辑层
│
└── types.ts
TypeScript类型定义
