# Life Protocol - 人生模拟游戏

一个 AI 驱动的人生模拟游戏，通过每日输入行为，AI 评价并调整能力值，模拟人生成长轨迹。

## 技术栈

- **后端**: Go + Gin
- **前端**: React + TypeScript + Vite
- **AI**: 支持 OpenAI / Claude / MiniMax 多模型

## 项目结构

```
life-protocol/
├── backend/              # Go 后端
│   ├── main.go          # 入口
│   ├── handlers/        # HTTP 处理器
│   ├── ai/              # AI 提供商
│   ├── models/          # 数据模型
│   └── config/          # 配置管理
├── frontend/            # React 前端
│   ├── src/
│   │   ├── components/  # UI 组件
│   │   ├── pages/      # 页面
│   │   ├── hooks/      # 自定义 Hooks
│   │   ├── store/      # Zustand 状态
│   │   └── styles/     # 样式
│   └── package.json
├── config.json          # 全局配置
└── player.json          # 玩家数据
```

## 运行

### 后端

```bash
cd backend
go run main.go
```

### 前端

```bash
cd frontend
npm install
npm run dev
```

## API 端点

- `POST /api/config` - 保存 AI 配置
- `GET /api/config` - 获取配置
- `POST /api/init` - 初始化玩家
- `POST /api/daily` - 每日行为评价
- `GET /api/status` - 获取状态
- `GET /api/history` - 获取历史

## 能力系统

10 种核心能力: 智慧、活力、魅力、创造力、财富、智慧(处世)、运气、名声、心境、灵魂

## 防膨胀机制

- 每日变化范围: -5 到 +5
- 超过 100 后边际效应递减
- ±10% 随机波动