import { useConnect, useAccount } from 'wagmi';
import { Wallet, AlertCircle } from 'lucide-react';

const ConnectWallet = () => {
        const { connect, connectors, isLoading, pendingConnector, error } = useConnect();
        const { isConnected } = useAccount();

        // 如果已连接，不显示此组件
        if (isConnected) return null;

        return (
                <div className="min-h-screen flex items-center justify-center gradient-bg">
                        <div className="max-w-md w-full mx-4">
                                {/* 主卡片 */}
                                <div className="card p-8 text-center animate-fade-in">
                                        {/* 图标 */}
                                        <div className="mb-6">
                                                <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                                                        <Wallet className="text-white" size={32} />
                                                </div>
                                        </div>

                                        {/* 标题和描述 */}
                                        <h1 className="text-2xl font-bold text-gray-900 mb-2">
                                                连接钱包
                                        </h1>
                                        <p className="text-gray-600 mb-8">
                                                连接您的钱包以开始使用Web3大学平台
                                        </p>

                                        {/* 错误信息 */}
                                        {error && (
                                                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
                                                        <AlertCircle className="text-red-500 mt-0.5 mr-3 flex-shrink-0" size={20} />
                                                        <div className="text-left">
                                                                <p className="text-red-800 font-medium">连接失败</p>
                                                                <p className="text-red-600 text-sm mt-1">{error.message}</p>
                                                        </div>
                                                </div>
                                        )}

                                        {/* 连接器列表 */}
                                        <div className="space-y-3">
                                                {connectors.map((connector) => {
                                                        const isCurrentPending = pendingConnector?.id === connector.id;

                                                        return (
                                                                <button
                                                                        key={connector.id}
                                                                        onClick={() => connect({ connector })}
                                                                        // disabled={!connector.ready || isLoading}
                                                                        className={`
                    w-full flex items-center justify-center px-6 py-3 rounded-lg font-medium transition-all duration-200
                    ${isCurrentPending
                                                                                        ? 'bg-blue-500 text-white cursor-wait'
                                                                                        : 'btn-primary hover:scale-105'
                                                                                }
                    disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
                  `}
                                                                >
                                                                        {/* 连接器图标 */}
                                                                        <div className="mr-3">
                                                                                {connector.name === 'MetaMask' && (
                                                                                        <img
                                                                                                src="https://cdn.jsdelivr.net/gh/MetaMask/brand-resources@master/SVG/metamask-fox.svg"
                                                                                                alt="MetaMask"
                                                                                                className="w-6 h-6"
                                                                                        />
                                                                                )}
                                                                                {connector.name !== 'MetaMask' && (
                                                                                        <Wallet size={20} />
                                                                                )}
                                                                        </div>

                                                                        {/* 连接器文本 */}
                                                                        <span>
                                                                                {isCurrentPending && isLoading
                                                                                        ? '连接中...'
                                                                                        : `连接 ${connector.name}`
                                                                                }
                                                                        </span>

                                                                        {/* 不可用提示 */}
                                                                        {/* {!connector.ready && (
                                                                                <span className="ml-2 text-xs opacity-75">
                                                                                        (未安装)
                                                                                </span>
                                                                        )} */}
                                                                </button>
                                                        );
                                                })}
                                        </div>

                                        {/* 帮助信息 */}
                                        <div className="mt-8 pt-6 border-t border-gray-200">
                                                <p className="text-sm text-gray-500">
                                                        没有钱包？
                                                        <a
                                                                href="https://metamask.io/"
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-blue-500 hover:text-blue-600 ml-1 underline"
                                                        >
                                                                下载 MetaMask
                                                        </a>
                                                </p>
                                        </div>
                                </div>

                                {/* 特性展示 */}
                                <div className="mt-8 grid grid-cols-1 gap-4 text-sm">
                                        <div className="flex items-center text-gray-600">
                                                <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                                                安全的区块链交互
                                        </div>
                                        <div className="flex items-center text-gray-600">
                                                <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                                                去中心化课程购买
                                        </div>
                                        <div className="flex items-center text-gray-600">
                                                <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
                                                DD代币奖励系统
                                        </div>
                                </div>
                        </div>
                </div>
        );
};

export default ConnectWallet;