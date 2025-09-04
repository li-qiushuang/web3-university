import React, { useState, useEffect } from 'react';
import { useAccount, useBalance } from 'wagmi';
import { ethers } from 'ethers';
import {
        TrendingUp,
        ArrowRightLeft,
        DollarSign,
        PiggyBank,
        BarChart3,
        AlertCircle,
        CheckCircle,
        ExternalLink,
        Wallet,
        Target
} from 'lucide-react';
import TokenSwap from '../components/TokenSwap';
import { EXCHANGE_RATES } from '../config/contracts';

const DD_TOKEN_ADDRESS = '0x2c082b72C18D75b29E3B220Fe685F2D7D3505F02'
const SWAP_CONTRACT_ADDRESS = '0x...'; // 兑换合约地址

const DD_TOKEN_ABI = [
        "function approve(address spender, uint256 amount) returns (bool)",
        "function allowance(address owner, address spender) view returns (uint256)"
];

const SWAP_CONTRACT_ABI = [
        "function swapDDForETH(uint256 amount) external",
        "function getExchangeRate() view returns (uint256)"
];

const FinancePage = () => {
        // 获取当前连接的钱包地址
        const { address } = useAccount();

        // 获取用户余额信息
        // ETH 余额
        const { data: ethBalance } = useBalance({ address });
        // USDT 余额 TODO:usdtBalance的地址
        const { data: usdtBalance } = useBalance({ address });
        // DD 代币余额（需要指定代币合约地址）
        const { data: ddBalance } = useBalance({
                address,
                token: DD_TOKEN_ADDRESS
        });

        // 兑换和质押状态
        const [convertAmount, setConvertAmount] = useState('');
        const [stakeAmount, setStakeAmount] = useState('');
        const [isConverting, setIsConverting] = useState(false);
        const [isStaking, setIsStaking] = useState(false);
        const [activeStep, setActiveStep] = useState(1); // 1: DD->ETH, 2: ETH->USDT, 3: Stake USDT

        // AAVE相关状态
        const [aaveData, setAaveData] = useState({
                totalDeposited: '0',
                currentAPY: '3.45',
                earnedInterest: '0',
                healthFactor: '0'
        });

        // 历史记录
        const [stakingHistory, setStakingHistory] = useState([
                {
                        id: 1,
                        type: 'stake',
                        amount: '1000',
                        token: 'USDT',
                        timestamp: new Date(Date.now() - 86400000).toISOString(),
                        status: 'completed',
                        apy: '3.45'
                },
                {
                        id: 2,
                        type: 'withdraw',
                        amount: '500',
                        token: 'USDT',
                        timestamp: new Date(Date.now() - 172800000).toISOString(),
                        status: 'completed',
                        apy: '3.45'
                }
        ]);

        // 计算兑换预览
        const calculateConversion = (amount, step) => {
                const num = parseFloat(amount || '0');
                switch (step) {
                        case 1: // DD -> ETH
                                return (num / EXCHANGE_RATES.DD_TO_ETH).toFixed(6);
                        case 2: // ETH -> USDT
                                return (num * EXCHANGE_RATES.ETH_TO_USDT).toFixed(2);
                        default:
                                return '0';
                }
        };

        // 处理DD到ETH的兑换
        const handleDDToETH = async () => {
                if (!convertAmount || parseFloat(convertAmount) <= 0) {
                        alert('请输入有效的DD代币数量');
                        return;
                }

                setIsConverting(true);
                try {
                        // TODO:模拟兑换过程
                        // 1. 先授权DD代币给兑换合约
                        //  2. 执行DD兑换ETH
                        console.log(`兑换 ${convertAmount} DD 为 ETH`);
                        // 这里可以用wagmi hooks 也可以ethers.js 推荐ethers.js
                        const ddContract = new ethers.Contract(DD_TOKEN_ADDRESS, DD_TOKEN_ABI, signer);
                        const swapContract = new ethers.Contract(SWAP_CONTRACT_ADDRESS, SWAP_CONTRACT_ABI, signer);

                        // 检查当前授权额度
                        const currentAllowance = await ddContract.allowance(await signer.getAddress(), SWAP_CONTRACT_ADDRESS);
                        const requiredAllowance = ethers.utils.parseEther(amount.toString());

                        // 如果需要，先授权
                        if (currentAllowance.lt(requiredAllowance)) {
                                console.log('授权中...');
                                const approveTx = await ddContract.approve(SWAP_CONTRACT_ADDRESS, requiredAllowance);
                                await approveTx.wait(); // 等待授权交易确认
                                console.log('授权成功');
                        }

                        // 执行兑换
                        console.log('开始兑换...');
                        const swapTx = await swapContract.swapDDForETH(requiredAllowance);
                        const receipt = await swapTx.wait(); // 等待兑换交易确认

                        console.log('兑换成功！交易哈希:', receipt.transactionHash);

                        // 计算获得的ETH数量（基于1:1000汇率）
                        const receivedETH = amount / 1000;
                        console.log(`获得 ${receivedETH} ETH`)

                        alert(`成功兑换 ${convertAmount} DD 为 ${calculateConversion(convertAmount, 1)} ETH`);
                        setConvertAmount('');
                        setActiveStep(2);
                } catch (error) {
                        console.error('兑换失败:', error);
                        alert('兑换失败，请重试');
                } finally {
                        setIsConverting(false);
                }
        };

        // 处理ETH到USDT的兑换
        const handleETHToUSDT = async () => {
                const ethAmount = calculateConversion(convertAmount, 1);

                setIsConverting(true);
                try {
                        // 模拟兑换过程
                        console.log(`兑换 ${ethAmount} ETH 为 USDT`);
                        await new Promise(resolve => setTimeout(resolve, 2000));

                        const usdtAmount = calculateConversion(ethAmount, 2);
                        alert(`成功兑换 ${ethAmount} ETH 为 ${usdtAmount} USDT`);
                        setActiveStep(3);
                } catch (error) {
                        console.error('兑换失败:', error);
                        alert('兑换失败，请重试');
                } finally {
                        setIsConverting(false);
                }
        };

        // 处理AAVE质押
        const handleStakeToAave = async () => {
                if (!stakeAmount || parseFloat(stakeAmount) <= 0) {
                        alert('请输入有效的USDT数量');
                        return;
                }

                setIsStaking(true);
                try {
                        // 模拟质押过程
                        console.log(`质押 ${stakeAmount} USDT 到 AAVE`);
                        await new Promise(resolve => setTimeout(resolve, 3000));

                        // 更新AAVE数据
                        setAaveData(prev => ({
                                ...prev,
                                totalDeposited: (parseFloat(prev.totalDeposited) + parseFloat(stakeAmount)).toString()
                        }));

                        // 添加到历史记录
                        const newRecord = {
                                id: Date.now(),
                                type: 'stake',
                                amount: stakeAmount,
                                token: 'USDT',
                                timestamp: new Date().toISOString(),
                                status: 'completed',
                                apy: aaveData.currentAPY
                        };
                        setStakingHistory(prev => [newRecord, ...prev]);

                        alert(`成功质押 ${stakeAmount} USDT 到 AAVE！预期年收益率: ${aaveData.currentAPY}%`);
                        setStakeAmount('');
                } catch (error) {
                        console.error('质押失败:', error);
                        alert('质押失败，请重试');
                } finally {
                        setIsStaking(false);
                }
        };

        // 流程步骤组件
        const StepIndicator = ({ step, title, isActive, isCompleted }) => (
                <div className={`flex items-center space-x-3 p-3 rounded-lg transition-all ${isActive ? 'bg-blue-50 border border-blue-200' :
                        isCompleted ? 'bg-green-50 border border-green-200' : 'bg-gray-50'
                        }`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${isActive ? 'bg-blue-500 text-white' :
                                isCompleted ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600'
                                }`}>
                                {isCompleted ? <CheckCircle size={16} /> : step}
                        </div>
                        <span className={`font-medium ${isActive ? 'text-blue-700' :
                                isCompleted ? 'text-green-700' : 'text-gray-600'
                                }`}>
                                {title}
                        </span>
                </div>
        );

        return (
                <div className="min-h-screen gradient-bg py-8">
                        <div className="container mx-auto px-4 max-w-7xl">
                                {/* 页面标题 */}
                                <div className="text-center mb-8">
                                        <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center justify-center">
                                                <TrendingUp className="mr-3" size={32} />
                                                理财中心
                                        </h1>
                                        <p className="text-gray-600">
                                                将您的DD代币转换为稳定收益，通过AAVE协议获得被动收入
                                        </p>
                                </div>

                                {/* 资产概览 */}
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                                        <div className="card p-6 text-center">
                                                <Wallet className="mx-auto mb-3 text-blue-500" size={32} />
                                                <div className="text-2xl font-bold text-gray-900">
                                                        {ddBalance?.formatted ? parseFloat(ddBalance.formatted).toFixed(2) : '0.00'}
                                                </div>
                                                <div className="text-gray-600 text-sm">DD 代币</div>
                                        </div>

                                        <div className="card p-6 text-center">
                                                <div className="w-8 h-8 bg-gray-800 rounded-full mx-auto mb-3"></div>
                                                <div className="text-2xl font-bold text-gray-900">
                                                        {ethBalance?.formatted ? parseFloat(ethBalance.formatted).toFixed(4) : '0.0000'}
                                                </div>
                                                <div className="text-gray-600 text-sm">ETH</div>
                                        </div>

                                        <div className="card p-6 text-center">
                                                <div className="w-8 h-8 bg-green-500 rounded-full mx-auto mb-3"></div>
                                                <div className="text-2xl font-bold text-gray-900">
                                                        {usdtBalance?.formatted ? parseFloat(usdtBalance.formatted).toFixed(2) : '0.00'}
                                                </div>
                                                <div className="text-gray-600 text-sm">USDT</div>
                                        </div>

                                        <div className="card p-6 text-center">
                                                <PiggyBank className="mx-auto mb-3 text-purple-500" size={32} />
                                                <div className="text-2xl font-bold text-gray-900">
                                                        {aaveData.totalDeposited}
                                                </div>
                                                <div className="text-gray-600 text-sm">AAVE 质押</div>
                                        </div>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                        {/* 左侧：理财流程 */}
                                        <div className="lg:col-span-2">
                                                <div className="card p-6">
                                                        <h2 className="text-xl font-semibold mb-6">理财流程</h2>

                                                        {/* 步骤指示器 */}
                                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                                                                <StepIndicator
                                                                        step={1}
                                                                        title="DD → ETH"
                                                                        isActive={activeStep === 1}
                                                                        isCompleted={activeStep > 1}
                                                                />
                                                                <StepIndicator
                                                                        step={2}
                                                                        title="ETH → USDT"
                                                                        isActive={activeStep === 2}
                                                                        isCompleted={activeStep > 2}
                                                                />
                                                                <StepIndicator
                                                                        step={3}
                                                                        title="质押 AAVE"
                                                                        isActive={activeStep === 3}
                                                                        isCompleted={false}
                                                                />
                                                        </div>

                                                        {/* 步骤1: DD转ETH */}
                                                        {activeStep === 1 && (
                                                                <div className="border border-blue-200 rounded-lg p-6 bg-blue-50">
                                                                        <h3 className="font-semibold text-blue-800 mb-4 flex items-center">
                                                                                <ArrowRightLeft className="mr-2" size={20} />
                                                                                第一步：DD代币转换为ETH
                                                                        </h3>

                                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                                                <div>
                                                                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                                                                                DD代币数量
                                                                                        </label>
                                                                                        <input
                                                                                                type="number"
                                                                                                value={convertAmount}
                                                                                                onChange={(e) => setConvertAmount(e.target.value)}
                                                                                                placeholder="输入DD代币数量"
                                                                                                className="input-field"
                                                                                                step="0.001"
                                                                                                min="0"
                                                                                        />

                                                                                        <button
                                                                                                onClick={() => setConvertAmount(ddBalance?.formatted || '0')}
                                                                                                className="text-blue-500 text-sm mt-1 hover:text-blue-600"
                                                                                        >
                                                                                                使用全部余额: {ddBalance?.formatted ? parseFloat(ddBalance.formatted).toFixed(4) : '0.0000'} DD
                                                                                        </button>
                                                                                </div>

                                                                                <div>
                                                                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                                                                                预计获得ETH
                                                                                        </label>
                                                                                        <div className="input-field bg-gray-50 text-gray-600">
                                                                                                {calculateConversion(convertAmount, 1)} ETH
                                                                                        </div>

                                                                                        <div className="text-sm text-gray-500 mt-1">
                                                                                                汇率: 1 DD = {(1 / EXCHANGE_RATES.DD_TO_ETH).toFixed(6)} ETH
                                                                                        </div>
                                                                                </div>
                                                                        </div>

                                                                        <button
                                                                                onClick={handleDDToETH}
                                                                                disabled={isConverting || !convertAmount || parseFloat(convertAmount) <= 0}
                                                                                className="w-full btn-primary mt-4"
                                                                        >
                                                                                {isConverting ? (
                                                                                        <div className="flex items-center justify-center space-x-2">
                                                                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                                                                <span>兑换中...</span>
                                                                                        </div>
                                                                                ) : (
                                                                                        'DD → ETH 兑换'
                                                                                )}
                                                                        </button>
                                                                </div>
                                                        )}

                                                        {/* 步骤2: ETH转USDT */}
                                                        {activeStep === 2 && (
                                                                <div className="border border-green-200 rounded-lg p-6 bg-green-50">
                                                                        <h3 className="font-semibold text-green-800 mb-4 flex items-center">
                                                                                <DollarSign className="mr-2" size={20} />
                                                                                第二步：ETH转换为USDT
                                                                        </h3>

                                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                                                <div>
                                                                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                                                                                ETH数量
                                                                                        </label>
                                                                                        <div className="input-field bg-gray-50 text-gray-600">
                                                                                                {calculateConversion(convertAmount, 1)} ETH
                                                                                        </div>
                                                                                </div>

                                                                                <div>
                                                                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                                                                                预计获得USDT
                                                                                        </label>
                                                                                        <div className="input-field bg-gray-50 text-gray-600">
                                                                                                {calculateConversion(calculateConversion(convertAmount, 1), 2)} USDT
                                                                                        </div>
                                                                                </div>
                                                                        </div>

                                                                        <button
                                                                                onClick={handleETHToUSDT}
                                                                                disabled={isConverting}
                                                                                className="w-full btn-primary mt-4"
                                                                        >
                                                                                {isConverting ? (
                                                                                        <div className="flex items-center justify-center space-x-2">
                                                                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                                                                <span>兑换中...</span>
                                                                                        </div>
                                                                                ) : (
                                                                                        'ETH → USDT 兑换'
                                                                                )}
                                                                        </button>
                                                                </div>
                                                        )}

                                                        {/* 步骤3: AAVE质押 */}
                                                        {activeStep === 3 && (
                                                                <div className="border border-purple-200 rounded-lg p-6 bg-purple-50">
                                                                        <h3 className="font-semibold text-purple-800 mb-4 flex items-center">
                                                                                <Target className="mr-2" size={20} />
                                                                                第三步：质押到AAVE协议
                                                                        </h3>

                                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                                                <div>
                                                                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                                                                                USDT质押数量
                                                                                        </label>
                                                                                        <input
                                                                                                type="number"
                                                                                                value={stakeAmount}
                                                                                                onChange={(e) => setStakeAmount(e.target.value)}
                                                                                                placeholder="输入USDT数量"
                                                                                                className="input-field"
                                                                                                step="0.01"
                                                                                                min="0"
                                                                                        />

                                                                                        <button
                                                                                                onClick={() => setStakeAmount(usdtBalance?.formatted || '0')}
                                                                                                className="text-purple-500 text-sm mt-1 hover:text-purple-600"
                                                                                        >
                                                                                                使用全部余额: {usdtBalance?.formatted ? parseFloat(usdtBalance.formatted).toFixed(2) : '0.00'} USDT
                                                                                        </button>
                                                                                </div>

                                                                                <div>
                                                                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                                                                                预期年收益
                                                                                        </label>
                                                                                        <div className="input-field bg-gray-50 text-gray-600">
                                                                                                {stakeAmount ? (parseFloat(stakeAmount) * parseFloat(aaveData.currentAPY) / 100).toFixed(2) : '0.00'} USDT
                                                                                        </div>

                                                                                        <div className="text-sm text-gray-500 mt-1">
                                                                                                当前APY: {aaveData.currentAPY}%
                                                                                        </div>
                                                                                </div>
                                                                        </div>

                                                                        <button
                                                                                onClick={handleStakeToAave}
                                                                                disabled={isStaking || !stakeAmount || parseFloat(stakeAmount) <= 0}
                                                                                className="w-full btn-primary mt-4"
                                                                        >
                                                                                {isStaking ? (
                                                                                        <div className="flex items-center justify-center space-x-2">
                                                                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                                                                <span>质押中...</span>
                                                                                        </div>
                                                                                ) : (
                                                                                        '质押到AAVE协议'
                                                                                )}
                                                                        </button>
                                                                </div>
                                                        )}
                                                </div>

                                                {/* 质押历史 */}
                                                <div className="card p-6 mt-6">
                                                        <h3 className="text-lg font-semibold mb-4 flex items-center">
                                                                <BarChart3 className="mr-2" size={20} />
                                                                操作历史
                                                        </h3>

                                                        {stakingHistory.length === 0 ? (
                                                                <div className="text-center py-8">
                                                                        <PiggyBank className="mx-auto mb-4 text-gray-400" size={48} />
                                                                        <p className="text-gray-500">暂无操作记录</p>
                                                                </div>
                                                        ) : (
                                                                <div className="space-y-3">
                                                                        {stakingHistory.map((record) => (
                                                                                <div key={record.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                                                                        <div className="flex items-center space-x-3">
                                                                                                <div className={`p-2 rounded-lg ${record.type === 'stake' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                                                                                                        }`}>
                                                                                                        {record.type === 'stake' ? <TrendingUp size={16} /> : <ArrowRightLeft size={16} />}
                                                                                                </div>

                                                                                                <div>
                                                                                                        <div className="font-medium">
                                                                                                                {record.type === 'stake' ? '质押' : '提取'} {record.amount} {record.token}
                                                                                                        </div>
                                                                                                        <div className="text-sm text-gray-500">
                                                                                                                {new Date(record.timestamp).toLocaleString()} • APY: {record.apy}%
                                                                                                        </div>
                                                                                                </div>
                                                                                        </div>

                                                                                        <div className={`px-3 py-1 rounded-full text-xs font-medium ${record.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                                                                                }`}>
                                                                                                {record.status === 'completed' ? '已完成' : '进行中'}
                                                                                        </div>
                                                                                </div>
                                                                        ))}
                                                                </div>
                                                        )}
                                                </div>
                                        </div>

                                        {/* 右侧：工具和信息 */}
                                        <div className="space-y-6">
                                                {/* 快速兑换 */}
                                                <div>
                                                        <h3 className="font-semibold mb-4">快速兑换</h3>
                                                        <TokenSwap compact={true} />
                                                </div>

                                                {/* AAVE信息 */}
                                                <div className="card p-4">
                                                        <h3 className="font-semibold mb-4 flex items-center">
                                                                <ExternalLink className="mr-2" size={18} />
                                                                AAVE协议信息
                                                        </h3>

                                                        <div className="space-y-3 text-sm">
                                                                <div className="flex justify-between">
                                                                        <span className="text-gray-600">当前APY:</span>
                                                                        <span className="font-medium text-green-600">{aaveData.currentAPY}%</span>
                                                                </div>

                                                                <div className="flex justify-between">
                                                                        <span className="text-gray-600">总质押量:</span>
                                                                        <span className="font-medium">{aaveData.totalDeposited} USDT</span>
                                                                </div>

                                                                <div className="flex justify-between">
                                                                        <span className="text-gray-600">累计收益:</span>
                                                                        <span className="font-medium text-blue-600">{aaveData.earnedInterest} USDT</span>
                                                                </div>

                                                                <div className="pt-3 border-t">
                                                                        <a
                                                                                href="https://app.aave.com/"
                                                                                target="_blank"
                                                                                rel="noopener noreferrer"
                                                                                className="flex items-center justify-center space-x-2 text-blue-600 hover:text-blue-700 text-sm"
                                                                        >
                                                                                <span>访问AAVE官网</span>
                                                                                <ExternalLink size={14} />
                                                                        </a>
                                                                </div>
                                                        </div>
                                                </div>

                                        </div>
                                </div>
                        </div>
                </div>
        );
};

export default FinancePage;