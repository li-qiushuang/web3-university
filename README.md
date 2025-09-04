# Web3 University - 去中心化教育平台

一个基于 React + Vite + Wagmi + Ethers.js 6.x 构建的 Web3 大学前端项目，支持课程购买、创建、理财等功能。

## 🌟 功能特色

### 📚 核心功能
- **课程浏览与购买**：使用 DD 代币购买课程，支持 MetaMask 签名
- **课程创建**：讲师可以创建课程，支持 AI 润色功能
- **个人中心**：MetaMask 签名管理个人资料，查看已购课程
- **理财中心**：DD 代币兑换 ETH，再兑换 USDT 质押到 AAVE 协议

### 🔧 技术亮点
- **现代化技术栈**：React 18 + Vite + TypeScript
- **Web3 集成**：Wagmi + Ethers.js 6.x + MetaMask 连接
- **响应式设计**：Tailwind CSS + 移动端适配
- **智能合约**：完整的课程购买和管理合约
- **状态管理**：内存存储系统（可替换为 localStorage）

## 🚀 快速开始

### 环境要求
- Node.js >= 16.0.0
- MetaMask 浏览器插件
- Git

### 安装步骤

1. **克隆项目**
```bash
git clone <项目地址>
cd web3-university
```

2. **安装依赖**
```bash
npm install
```

3. **启动开发服务器**
```bash
npm run dev
```

4. **构建生产版本**
```bash
npm run build
```

### 项目结构

```
src/
├── components/          # 可复用组件
│   ├── ConnectWallet.jsx    # 钱包连接组件
│   ├── Header.jsx           # 页面头部
│   ├── CourseCard.jsx       # 课程卡片
│   └── TokenSwap.jsx        # 代币兑换组件
├── pages/              # 页面组件
│   ├── HomePage.jsx         # 首页
│   ├── ProfilePage.jsx      # 个人中心
│   ├── CreateCoursePage.jsx # 创建课程
│   └── FinancePage.jsx      # 理财中心
├── config/             # 配置文件
│   ├── wagmi.js            # Wagmi 配置
│   └── contracts.js        # 合约配置
├── utils/              # 工具函数
│   └── storage.js          # 存储工具
├── styles/             # 样式文件
│   └── index.css           # 全局样式
├── App.jsx             # 主应用组件
└── main.jsx            # 应用入口
```

## 🔧 配置说明

### 1. 合约地址配置

在 `src/config/contracts.js` 中更新实际的合约地址：

```javascript
export const CONTRACT_ADDRESSES = {
  1: { // 主网
    UNIVERSITY: "你的合约地址",
    DD_TOKEN: "DD代币合约地址",
    USDT: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
  },
  // 其他网络...
};
```

### 2. 网络配置

在 `src/config/wagmi.js` 中配置支持的网络和RPC提供商：

```javascript
// 建议在生产环境中使用
alchemyProvider({ apiKey: process.env.VITE_ALCHEMY_ID }),
infuraProvider({ apiKey: process.env.VITE_INFURA_ID }),
```

### 3. 环境变量

创建 `.env` 文件：

```env
VITE_ALCHEMY_ID=your_alchemy_api_key
VITE_INFURA_ID=your_infura_api_key
VITE_WALLETCONNECT_PROJECT_ID=your_walletconnect_id
```

## 📱 页面说明

### 首页 (HomePage)
- 课程列表展示和搜索
- 课程购买功能
- 代币兑换侧边栏
- 热门课程推荐

### 个人中心 (ProfilePage)
- MetaMask 签名更新个人资料
- 已购课程查看和管理
- 学习进度追踪
- 成就系统

### 创建课程 (CreateCoursePage)
- 课程信息表单
- AI 润色功能
- 实时预览
- 收益计算

### 理财中心 (FinancePage)
- 三步理财流程：DD→ETH→USDT→AAVE
- 实时收益计算
- 操作历史记录
- 风险提示

## ⚠️ 重要说明

### localStorage 替换

由于开发环境限制，项目使用内存存储。在生产环境中，请将 `src/utils/storage.js` 中的内存存储替换为 localStorage：

```javascript
// 替换示例
// 当前：memoryStorage.courses[courseId] = courseData;
// 改为：
localStorage.setItem('courses', JSON.stringify({
  ...JSON.parse(localStorage.getItem('courses') || '{}'),
  [courseId]: courseData
}));
```

### 合约部署

1. 编译并部署 `Web3University.sol` 合约
2. 部署 DD 代币合约
3. 更新前端配置中的合约地址
4. 确保合约与前端 ABI 保持同步

## 🔒 安全注意事项

- 私钥永远不要暴露在前端代码中
- 使用环境变量管理敏感信息
- 定期更新依赖包版本
- 在生产环境中启用 HTTPS
- 进行充分的安全测试

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 📞 联系方式

- 项目维护者：[您的姓名]
- 邮箱：[your.email@example.com]
- 项目链接：[https://github.com/yourname/web3-university]

## 🙏 致谢

- [React](https://reactjs.org/) - 用户界面库
- [Vite](https://vitejs.dev/) - 快速构建工具
- [Wagmi](https://wagmi.sh/) - React Hooks for Ethereum
- [Ethers.js](https://docs.ethers.org/) - 以太坊库
- [Tailwind CSS](https://tailwindcss.com/) - CSS 框架
- [Lucide React](https://lucide.dev/) - 图标库

---

**Happy Coding! 🚀**