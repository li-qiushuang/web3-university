const Footer = () => {
        return (<footer className="bg-white border-t border-gray-200 py-8 mt-16">
                <div className="container mx-auto px-4">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                                <div className="col-span-1 md:col-span-2">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Web3 University</h3>
                                        <p className="text-gray-600 mb-4">
                                                领先的去中心化教育平台，致力于推广Web3技术知识，让每个人都能参与到区块链革命中来。
                                        </p>
                                        <div className="flex space-x-4">
                                                <a href="#" className="text-gray-400 hover:text-blue-500 transition-colors">
                                                        <span className="sr-only">Twitter</span>
                                                        🐦
                                                </a>
                                                <a href="#" className="text-gray-400 hover:text-blue-500 transition-colors">
                                                        <span className="sr-only">GitHub</span>
                                                        🐙
                                                </a>
                                                <a href="#" className="text-gray-400 hover:text-blue-500 transition-colors">
                                                        <span className="sr-only">Discord</span>
                                                        💬
                                                </a>
                                        </div>
                                </div>

                                <div>
                                        <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4">
                                                学习资源
                                        </h4>
                                        <ul className="space-y-3">
                                                <li><a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">区块链基础</a></li>
                                                <li><a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">智能合约</a></li>
                                                <li><a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">DeFi协议</a></li>
                                                <li><a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">NFT开发</a></li>
                                        </ul>
                                </div>

                                <div>
                                        <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4">
                                                支持
                                        </h4>
                                        <ul className="space-y-3">
                                                <li><a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">帮助中心</a></li>
                                                <li><a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">社区论坛</a></li>
                                                <li><a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">联系我们</a></li>
                                                <li><a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">服务条款</a></li>
                                        </ul>
                                </div>
                        </div>

                        <div className="border-t border-gray-200 pt-8 mt-8">
                                <div className="flex flex-col md:flex-row justify-between items-center">
                                        <p className="text-gray-600 text-sm">
                                                © 2024 Web3 University. All rights reserved.
                                        </p>
                                        <div className="flex items-center space-x-6 mt-4 md:mt-0">
                                                <a href="#" className="text-gray-600 hover:text-gray-900 text-sm transition-colors">
                                                        隐私政策
                                                </a>
                                                <a href="#" className="text-gray-600 hover:text-gray-900 text-sm transition-colors">
                                                        使用条款
                                                </a>
                                                <div className="flex items-center space-x-2 text-sm text-gray-600">
                                                        <span>由</span>
                                                        <span className="font-medium">❤️</span>
                                                        <span>和</span>
                                                        <span className="font-medium">⚡️</span>
                                                        <span>构建</span>
                                                </div>
                                        </div>
                                </div>
                        </div>
                </div>
        </footer>)
}

export default Footer;