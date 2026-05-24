# Life Protocol - 人生模拟游戏 (Web Deployed Version)

> **基于 AI 驱动的沉浸式人生模拟与属性成长系统。**  
> 在这里，你的每一次日常行为、每一个重要抉择，都将由 AI 深度评估并折射为能力的成长或起落，映射出专属于你的独特人生成长轨迹。

---

## 🌟 项目愿景与特色

**Life Protocol** 是一款充满科技感与现代美学风格的 AI 个人成长模拟器。它摆脱了传统预设剧本的束缚，利用前沿大语言模型（LLM）的开放生成能力，实现千人千面的动态评估。

### ✨ 核心机制

- **🧠 AI 双驱人生系统**：
  - **初启档案**：通过玩家输入基础背景（MBTI、教育、职业、性格等），AI 将进行多阶段推演，生成你初始的**10维核心能力指标**与**人生叙事开篇**。
  - **日常行动评估**：每日记录你的行为，AI 将智能归类为“普通行动（累积经验）”、“重大变故（直接能力波动）”或“荒谬虚假（予以拒绝）”，提供极具现实穿透力的人生旁白。
- **📊 10维核心能力模型**：
  - **智慧 (INTELLIGENCE)** | **活力 (VITALITY)** | **魅力 (CHARISMA)** | **创造力 (CREATIVITY)** | **财富 (WEALTH)**
  - **处世 (WISDOM)** | **运气 (FORTUNE)** | **名声 (REPUTATION)** | **心境 (MENTAL)** | **灵魂 (SPIRIT)**
- **📅 动态审核任务系统**：
  - 支持创建周度/月度挑战任务，所有任务均需通过 AI 严格的“属性相关性”与“难度合理性”双重审核，实现真正的抗膨胀、强对抗式成长。
- **🏆 勋章与编年史**：
  - 自动沉淀人生关键事件，生成历史时间轴；随着能力值突破，解锁多达数十种独特的人生荣誉勋章。

---

## 🛠️ 纯前端无服务器架构 (Serverless Architecture)

为保障个人数据隐私、降低运维成本，本项目采用**全本地化纯前端架构**设计：

1. **隐私安全 (LocalStorage)**：所有的玩家数据（属性、经验、任务状态、行动历史、当前配置）全部加密存储在浏览器本地的 `localStorage` 中。数据永远不会上传到第三方服务器，由你完全掌握。
2. **多 LLM 提供商原生集成**：客户端直接发起对大模型的 API 请求。目前原生集成并支持自定义配置：
   - **OpenAI** (包含各类兼容接口，如 DeepSeek、通义千问等)
   - **Anthropic Claude**
   - **MiniMax**
3. **零后端服务器费用**：部署该项目仅需静态网页托管（Nginx、Vercel、Netlify、GitHub Pages 等），无需维护数据库或购买高昂的后端服务器，极其适合低成本快速部署。

---

## 💻 技术栈

- **核心框架**：React 18 + TypeScript + Vite 5
- **视觉动画**：TailwindCSS + Framer Motion (精美微交互、流光科技感滤镜)
- **数据可视化**：Recharts (折线图与雷达图，直观展现人生维度)
- **状态管理**：Zustand 4 (高性能、防重渲染 Selector 选择器)

---

## 🚀 本地开发与运行

### 1. 克隆并进入前端目录

```bash
cd frontend
```

### 2. 安装依赖

```bash
npm install
```

### 3. 运行开发服务器

```bash
npm run dev
```

在浏览器中打开 `http://localhost:3001` 即可开始你的模拟人生。

---

## 🌐 生产部署指南 (Static Hosting)

由于项目为纯前端 React SPA，构建完成后会生成一套完全静态的 HTML/JS/CSS 文件，您可以使用任何静态服务器进行托管。

### 1. 构建项目

在 `frontend` 目录下运行：

```bash
npm run build
```

构建成功后，会在 `frontend/dist/` 目录下生成打包好的静态资源。

### 2. 使用 Nginx 部署

这是最推荐的生产部署方式。由于应用使用了前端路由（React Router），请务必在 Nginx 中配置路由重定向以防止页面刷新时出现 404 错误。

以下是推荐的 Nginx 配置文件：

```nginx
server {
    listen 80;
    server_name yourdomain.com; # 替换为您的域名

    # 静态资源根目录指向打包后的 dist 路径
    root /var/www/life-protocol/dist;
    index index.html;

    # 启用 Gzip 压缩以加快加载速度
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
    gzip_min_length 1000;

    location / {
        # 关键配置：找不到文件时重定向到 index.html，交由前端 React Router 处理路由
        try_files $uri $uri/ /index.html;
    }

    # 静态资源强缓存策略
    location ~* \.(?:ico|css|js|gif|jpe?g|png|woff2?|eot|ttf|otf|svg|map)$ {
        expires 6M;
        access_log off;
        add_header Cache-Control "public, no-transform";
    }

    error_page 404 /index.html;
}
```

### 3. 一键托管平台部署

你可以极其方便地将 `frontend/dist` 部署到以下免费托管平台，仅需配置 **单页应用（SPA）重定向规则**：

- **Vercel**：导入项目，将 Build Command 设为 `npm run build`，Output Directory 设为 `dist`。重定向路由会自动被识别并处理。
- **GitHub Pages / Cloudflare Pages**：直接配置代码仓源目录为 `frontend` 并执行静态构建部署。
- **Netlify**：在根目录下或 `dist/` 下创建 `_redirects` 文件，写入 `/* /index.html 200` 即可完美支持路由刷新。

---

## ⚙️ AI 接口配置指引

启动应用后，在系统首次初始化页面或“设置”面板中，您需要配置您的大模型参数：

1. **选择渠道**：OpenAI / Claude / MiniMax
2. **填入 API Key**：填入您购买或申请的模型 Key。
3. **自定义 Base URL（非必填）**：如果您使用了中转 API 或反向代理服务（例如国内中转、DeepSeek、腾讯混元等兼容接口），在此处填写对应的中转网关 URL。
4. **选择模型名称**：如 `gpt-4o`、`claude-3-5-sonnet`、`MiniMax-M2.7` 等。

> 🔒 **安全声明**：所有 API 秘钥均存储于您本地浏览器的 LocalStorage 中，API 请求直接在您的客户端浏览器与模型服务商网关之间进行。我们绝不会、也无法收集您的任何私钥信息。