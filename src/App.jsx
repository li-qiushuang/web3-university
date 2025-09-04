import React, { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider, createConfig, http, useAccount } from 'wagmi'
import { mainnet, sepolia } from 'wagmi/chains'
import { initializeExampleData } from './utils/storage';

// 组件导入
import ConnectWallet from './components/ConnectWallet';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import ProfilePage from './pages/ProfilePage';
import CreateCoursePage from './pages/CreateCoursePage';
import FinancePage from './pages/FinancePage';

// 创建查询客户端
const queryClient = new QueryClient()

// 配置wagmi - 使用Sepolia测试网
const config = createConfig({
  chains: [sepolia],
  transports: {
    [sepolia.id]: http(),
  },
})

// 主应用组件
function AppContent() {
  const [currentPage, setCurrentPage] = useState('home'); //当前页面-首页
  const { isConnected, isConnecting, isReconnecting } = useAccount(); //

  // 初始化示例数据
  useEffect(() => {
    initializeExampleData();
  }, []);

  // 如果正在连接中，显示加载状态
  if (isConnecting || isReconnecting) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">正在连接钱包...</p>
        </div>
      </div>
    );
  }

  // 如果未连接钱包，显示连接页面
  if (!isConnected) {
    return <ConnectWallet />;
  }

  // 渲染主应用内容
  return (
    <div className="min-h-screen bg-gray-50">
      <Header currentPage={currentPage} setCurrentPage={setCurrentPage} />

      <main className="relative">
        {/* 背景装饰 */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-purple-400/20 to-pink-600/20 rounded-full blur-3xl"></div>
        </div>

        {/* 页面内容 */}
        <div className="relative z-10">
          {currentPage === 'home' && <HomePage />}
          {currentPage === 'profile' && <ProfilePage />}
          {currentPage === 'create' && <CreateCoursePage />}
          {currentPage === 'finance' && <FinancePage />}
        </div>
      </main>

      <Footer />

    </div>
  );
}

// 主App组件
function App() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <AppContent />
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default App;