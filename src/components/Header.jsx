import React, { useState } from 'react';
import { useAccount, useDisconnect, useBalance } from 'wagmi';
import { BookOpen, Wallet, ChevronDown, LogOut, Copy, ExternalLink } from 'lucide-react';

const Header = ({ currentPage, setCurrentPage }) => {
        const { address } = useAccount();
        const { disconnect } = useDisconnect();
        const [showAccountMenu, setShowAccountMenu] = useState(false);

        const { data: ethBalance } = useBalance({ address });

        // 导航菜单项
        const navItems = [
                { key: 'home', label: '首页', icon: '🏠' },
                { key: 'profile', label: '个人中心', icon: '👤' },
                { key: 'create', label: '创建课程', icon: '➕' },
                { key: 'finance', label: '理财中心', icon: '💰' },
        ];

        // 复制地址到剪贴板
        const copyAddress = () => {
                navigator.clipboard.writeText(address);
                // 这里可以添加toast提示
                alert('地址已复制到剪贴板');
        };

        // 在区块浏览器中查看地址
        const viewInExplorer = () => {
                const explorerUrl = 'https://sepolia.etherscan.io';
                window.open(`${explorerUrl}/address/${address}`, '_blank');
        };

        return (
                <header className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 text-white shadow-lg">
                        <div className="container mx-auto px-4">
                                <div className="flex justify-between items-center h-16">
                                        {/* 左侧：Logo和标题 */}
                                        <div className="flex items-center space-x-3">
                                                <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
                                                        <BookOpen size={24} className="text-white" />
                                                </div>
                                                <div>
                                                        <h1 className="text-xl font-bold text-shadow">Web3 University</h1>
                                                        <p className="text-xs text-white/80">去中心化教育平台</p>
                                                </div>
                                        </div>

                                        {/* 中间：导航菜单 */}
                                        <nav className="hidden md:flex space-x-1">
                                                {navItems.map((item) => (
                                                        <button
                                                                key={item.key}
                                                                onClick={() => setCurrentPage(item.key)}
                                                                className={`
                  px-4 py-2 rounded-lg transition-all duration-200 font-medium flex items-center space-x-2
                  ${currentPage === item.key
                                                                                ? 'bg-white text-blue-600 shadow-lg'
                                                                                : 'hover:bg-white/10 text-white/90 hover:text-white'
                                                                        }
                `}
                                                        >
                                                                <span>{item.icon}</span>
                                                                <span>{item.label}</span>
                                                        </button>
                                                ))}
                                        </nav>

                                        {/* 右侧：账户信息和菜单 */}
                                        <div className="flex items-center space-x-4">
                                                {/* 网络指示器 */}
                                                {/* <div className="hidden sm:flex items-center space-x-2 px-3 py-1 bg-white/10 rounded-lg backdrop-blur-sm">
                                                        <div className={`w-2 h-2 rounded-full ${chain?.name ? 'bg-green-400' : 'bg-red-400'
                                                                }`}></div>
                                                        <span className="text-sm font-medium">
                                                                {chain?.name || '未连接'}
                                                        </span>
                                                </div> */}

                                                {/* 余额显示 */}
                                                {ethBalance && (
                                                        <div className="hidden sm:flex items-center space-x-2 px-3 py-1 bg-white/10 rounded-lg backdrop-blur-sm">
                                                                <Wallet size={16} />
                                                                <span className="text-sm font-medium">
                                                                        {parseFloat(ethBalance.formatted).toFixed(4)} {ethBalance.symbol}
                                                                </span>
                                                        </div>
                                                )}

                                                {/* 账户菜单 */}
                                                <div className="relative">
                                                        <button
                                                                onClick={() => setShowAccountMenu(!showAccountMenu)}
                                                                className="flex items-center space-x-2 px-3 py-2 bg-white/10 rounded-lg backdrop-blur-sm hover:bg-white/20 transition-colors"
                                                        >
                                                                <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center font-bold text-sm">
                                                                        {address?.slice(2, 4).toUpperCase()}
                                                                </div>
                                                                <span className="hidden sm:block text-sm font-medium">
                                                                        {address?.slice(0, 6)}...{address?.slice(-4)}
                                                                </span>
                                                                <ChevronDown size={16} className={`transition-transform ${showAccountMenu ? 'rotate-180' : ''}`} />
                                                        </button>

                                                        {/* 账户下拉菜单 */}
                                                        {showAccountMenu && (
                                                                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-50 animate-slide-in">
                                                                        {/* 账户信息 */}
                                                                        <div className="px-4 py-3 border-b border-gray-100">
                                                                                <p className="text-sm font-medium text-gray-900">我的钱包</p>
                                                                                <p className="text-xs text-gray-500 font-mono mt-1 break-words">{address}</p>
                                                                                {/* {chain && (
                                                                                        <p className="text-xs text-gray-500 mt-1">网络: {chain.name}</p>
                                                                                )} */}
                                                                        </div>

                                                                        {/* 菜单项 */}
                                                                        <div className="py-2">
                                                                                <button
                                                                                        onClick={copyAddress}
                                                                                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-3"
                                                                                >
                                                                                        <Copy size={16} />
                                                                                        <span>复制地址</span>
                                                                                </button>

                                                                                <button
                                                                                        onClick={viewInExplorer}
                                                                                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-3"
                                                                                >
                                                                                        <ExternalLink size={16} />
                                                                                        <span>在浏览器中查看</span>
                                                                                </button>

                                                                                <div className="border-t border-gray-100 mt-2 pt-2">
                                                                                        <button
                                                                                                onClick={() => {
                                                                                                        disconnect();
                                                                                                        setShowAccountMenu(false);
                                                                                                }}
                                                                                                className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-3"
                                                                                        >
                                                                                                <LogOut size={16} />
                                                                                                <span>断开连接</span>
                                                                                        </button>
                                                                                </div>
                                                                        </div>
                                                                </div>
                                                        )}
                                                </div>
                                        </div>
                                </div>

                                {/* 移动端导航 */}
                                <div className="md:hidden border-t border-white/20 py-2">
                                        <div className="flex justify-around">
                                                {navItems.map((item) => (
                                                        <button
                                                                key={item.key}
                                                                onClick={() => setCurrentPage(item.key)}
                                                                className={`
                  px-3 py-2 rounded-lg transition-all duration-200 text-xs flex flex-col items-center space-y-1
                  ${currentPage === item.key
                                                                                ? 'bg-white text-blue-600'
                                                                                : 'text-white/80 hover:text-white hover:bg-white/10'
                                                                        }
                `}
                                                        >
                                                                <span className="text-sm">{item.icon}</span>
                                                                <span>{item.label}</span>
                                                        </button>
                                                ))}
                                        </div>
                                </div>
                        </div>
                </header>
        );
};

export default Header;