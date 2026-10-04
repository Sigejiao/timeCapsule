# Time Capsule

在线体验： https://timecapsule.simba.wang

一个“只能向前写、不能向后翻”的日记工具。

你无法主动浏览过去的笔记。每次写下新的记录后，系统会分析这条记录背后的情境、思维模式与内在张力，并从过去的笔记中召回一条与此刻最相似的旧思考。

它更像一个真正的时间胶囊：过去不会被随时打开，而会在某个相似的时刻重新出现。

## 核心体验

1. 用户登录后写下一条新的笔记。
2. 原始笔记立即保存到数据库。
3. AI 将笔记提炼为结构化的“模式卡”，包括：
   - 情境
   - 反复出现的行为 / 思维模式
   - 思维张力
   - 动机与需要
   - 关键词
4. 系统根据模式卡生成 1024 维向量。
5. 将当前笔记与用户过去已完成分析的笔记进行余弦相似度比较。
6. 召回最相似的一条旧笔记，并展示当时的内容、时间与相似度。

如果还没有足够的历史记录，则只完成本次封存，不产生召回。

## 当前功能

- 邮箱 + 密码注册与登录
- 登录态保护：首页仅对已登录用户开放
- 写入最多 5000 字的笔记
- 本地自动保存未提交草稿
- 原始笔记优先落库，AI 处理失败不会丢失原文
- 使用 AI 提炼结构化模式卡
- 使用 embedding 表示笔记背后的模式
- 基于余弦相似度召回最相关的历史笔记
- 保存每次“相遇”的匹配结果与相似度
- Web 界面与早期 CLI 版本并存

## 在线体验
https://timecapsule.simba.wang

## 技术栈

- Next.js 16
- React 19
- TypeScript
- Better Auth
- Drizzle ORM
- PostgreSQL
- 阿里云 DashScope
  - `qwen-plus`：模式分析
  - `text-embedding-v4`：向量生成

## 项目结构

```text
app/
  api/                 Next.js API Routes
  sign-in/             登录页
  sign-up/             注册页
  page.tsx             主页面

components/
  auth-form.tsx        登录 / 注册表单
  auth-status.tsx      当前用户与退出登录
  time-capsule.tsx     时间胶囊主交互

src/
  ai/                  AI 模式分析与 embedding
  db/                  Drizzle schema、查询与写入
  services/
    notes.ts           新笔记处理主流程
    recall.ts          相似度计算与召回逻辑
  auth.ts              Better Auth 服务端配置
  index.ts             早期 CLI 入口

## 本地运行

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

在项目根目录创建 `.env`：

```env
DATABASE_URL=postgresql://...
DASHSCOPE_API_KEY=...
```

数据库用于保存用户、笔记与召回记录；DashScope 用于模式分析与向量生成。

### 3. 初始化 / 同步数据库

```bash
npx drizzle-kit push
```

也可以先检查数据库连接：

```bash
npm run db:check
```

### 4. 启动开发服务器

```bash
npm run dev
```

然后在浏览器打开 Next.js 输出的本地地址。

## 常用命令

```bash
npm run dev        # 启动 Web 开发环境
npm run build      # 构建生产版本
npm run start      # 启动生产版本
npm run typecheck  # TypeScript 类型检查
npm run db:check   # 检查数据库连接
npm run cli        # 运行早期 CLI 版本
```
## 召回机制

当前召回逻辑不是直接比较原始日记文本。

系统先把一条笔记抽象成“模式卡”，再将模式卡转换成一段用于 embedding 的结构化文本。这样，相似度更关注跨场景重复出现的思维与行为模式，而不只是表面的词语是否相同。

当前版本会在符合条件的历史笔记中选择余弦相似度最高的一条：

```text
新笔记
  ↓
模式分析
  ↓
模式卡
  ↓
Embedding
  ↓
与历史向量逐一计算余弦相似度
  ↓
Top 1
  ↓
旧笔记重新出现
```

## 项目状态

目前是持续开发中的 MVP。

核心闭环已经跑通：

**记录 → 分析 → 向量化 → 相似匹配 → 旧笔记重现**

后续仍会继续调整产品交互、召回策略和 AI 对“相似思考”的定义。
