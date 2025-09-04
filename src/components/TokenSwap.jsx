import React, { useState, useEffect } from 'react';
import {
        useAccount,
        useBalance,
        useWriteContract,
        useWaitForTransactionReceipt,
        useReadContract
} from 'wagmi';
import { ArrowRightLeft, ArrowUpDown, TrendingUp, AlertCircle } from 'lucide-react';
import { EXCHANGE_RATES } from '../config/contracts';
import { parseEther, parseUnits, maxUint256 } from 'viem';
import DD2ETHSwapABIJson from './../../abis/DD2ETHSwap.json'
import DDTOKENABIJson from './../../abis/DDTOKENABI.json'

// 兑换合约 ABI
const SWAP_ABI = DD2ETHSwapABIJson.abi
// DD代币合约 ABI
const DDToken_ABI = DDTOKENABIJson.abi

const SWAP_CONTRACT_ADDRESS = '0x54277A4B84Dd4a9741Da0C7D46c3fC8C01f62607' //兑换合约
const WEB3_CONTRACT_ADDRESS = '0xA661589192E966Bfb85970a51fea9afD21489B4e'; // web3课程合约
const DD_TOKEN_ADDRESS = '0x2c082b72C18D75b29E3B220Fe685F2D7D3505F02'; // DD代币合约

const TokenSwap = ({ compact = false }) => {
        const [swapAmount, setSwapAmount] = useState('');
        const [swapDirection, setSwapDirection] = useState('eth-to-dd');
        const [isSwapping, setIsSwapping] = useState(false);
        const [errorMessage, setErrorMessage] = useState('');
        const [isApproved, setIsApproved] = useState(false);
        const [isApproving, setIsApproving] = useState(false);

        const { address } = useAccount();
        const { data: ethBalance } = useBalance({ address });
        const { data: ddBalance } = useBalance({
                address,
                token: DD_TOKEN_ADDRESS
        });

        // 检查授权状态
        const { data: allowance } = useReadContract({
                address: DD_TOKEN_ADDRESS,
                abi: DDToken_ABI,
                functionName: 'allowance',
                args: [address, SWAP_CONTRACT_ADDRESS],
                query: {
                        enabled: !!address,
                }
        });

        // 检查授权状态
        useEffect(() => {
                if (allowance !== undefined) {
                        const isSufficientlyApproved = allowance >= parseUnits(swapAmount || '0', 18);
                        console.log('检查授权状态-isSufficientlyApproved--', isSufficientlyApproved)
                        setIsApproved(isSufficientlyApproved);
                }
        }, [allowance, swapAmount]);

        // 授权交易
        const { writeContract: writeApprove, data: approveHash } = useWriteContract();
        const { isLoading: isApprovingTx, isSuccess: isApprovedTx } =
                useWaitForTransactionReceipt({ hash: approveHash });

        // 授权成功后的处理
        useEffect(() => {
                if (isApprovedTx) {
                        setIsApproved(true);
                        setIsApproving(false);
                }
        }, [isApprovedTx]);

        /**
         * 授权合约使用DD代币
         */
        const handleApprove = async () => {
                if (!address) {
                        setErrorMessage('请先连接钱包');
                        return;
                }

                setIsApproving(true);
                console.log('开始授权---')
                try {
                        // 授权最大数量，避免多次授权
                        writeApprove({
                                address: DD_TOKEN_ADDRESS,
                                abi: DDToken_ABI,
                                functionName: 'approve',
                                args: [SWAP_CONTRACT_ADDRESS, maxUint256],
                        });
                } catch (error) {
                        console.error('授权失败:', error);
                        setErrorMessage(`授权失败: ${error.shortMessage || error.message}`);
                        setIsApproving(false);
                }
        };

        // 使用新的 wagmi v2 hooks
        const { writeContract, data: hash, error: writeError, reset: resetWrite } = useWriteContract();
        const {
                isLoading: isConfirming,
                isSuccess: isConfirmed,
                isError: isReceiptError,
                error: receiptError
        } = useWaitForTransactionReceipt({ hash });

        /**
         * 计算兑换输出数量
         */
        const calculateOutput = () => {
                if (!swapAmount || isNaN(parseFloat(swapAmount)) || parseFloat(swapAmount) <= 0) return '0';

                const amount = parseFloat(swapAmount);

                if (swapDirection === 'eth-to-dd') {
                        const output = amount * EXCHANGE_RATES.ETH_TO_DD;
                        return output.toFixed(6);
                } else {
                        const output = amount * EXCHANGE_RATES.DD_TO_ETH;
                        return output.toFixed(6);
                }
        };

        const { data: swapContractDDBalance } = useBalance({
                address: SWAP_CONTRACT_ADDRESS,
                token: DD_TOKEN_ADDRESS,
        });

        /**
         * 处理兑换操作
         */
        const handleSwap = async () => {
                // 重置错误状态
                setErrorMessage('');
                resetWrite();

                if (!swapAmount || parseFloat(swapAmount) <= 0) {
                        setErrorMessage('请输入有效的兑换数量');
                        return;
                }

                if (!address) {
                        setErrorMessage('请先连接钱包');
                        return;
                }

                // 检查兑换合约是否有足够的DD余额（如果是ETH转DD）
                if (swapDirection === 'eth-to-dd') {
                        const requiredDD = parseUnits(calculateOutput(), 18);
                        if (swapContractDDBalance && swapContractDDBalance.value < requiredDD) {
                                setErrorMessage('兑换合约DD余额不足，请联系管理员');
                                return;
                        }
                }

                // 如果是DD转ETH，检查授权【ETH转DD不需要授权：合约向用户发送DD代币，这是合约自己的行为，合约从自己的余额中转账，不需要用户的批准】
                if (swapDirection === 'dd-to-eth' && !isApproved) {
                        handleApprove() //如果没有授权就直接执行授权的逻辑
                        // setErrorMessage('请先授权合约使用您的DD代币');
                        // return;
                }

                setIsSwapping(true);

                try {
                        if (swapDirection === 'eth-to-dd') {
                                // ETH 转 DD
                                writeContract({
                                        address: SWAP_CONTRACT_ADDRESS,
                                        abi: SWAP_ABI,
                                        functionName: 'swapEthToDd',
                                        value: parseEther(swapAmount)
                                });
                        } else {
                                // DD 转 ETH
                                writeContract({
                                        address: SWAP_CONTRACT_ADDRESS,
                                        abi: SWAP_ABI,
                                        functionName: 'swapDdToEth',
                                        args: [parseUnits(swapAmount, 18)],
                                });
                        }
                } catch (error) {
                        console.error('兑换失败:', error);
                        setErrorMessage(`兑换失败: ${error.shortMessage || error.message}`);
                        setIsSwapping(false);
                }
        };

        // 交易确认后的处理
        useEffect(() => {
                if (isConfirmed) {
                        alert(`兑换成功！您获得了 ${calculateOutput()} ${swapDirection === 'eth-to-dd' ? 'DD' : 'ETH'}`);
                        setSwapAmount('');
                        setIsSwapping(false);
                        setErrorMessage('');
                }
        }, [isConfirmed]);

        // 处理交易错误
        useEffect(() => {
                if (writeError) {
                        console.error('交易发送失败:', writeError);
                        setErrorMessage(`交易发送失败: ${writeError.shortMessage || writeError.message}`);
                        setIsSwapping(false);
                }
        }, [writeError]);

        // 处理交易收据错误
        useEffect(() => {
                if (isReceiptError && receiptError) {
                        console.error('交易执行失败:', receiptError);
                        setErrorMessage(`交易执行失败: ${receiptError.shortMessage || receiptError.message}`);
                        setIsSwapping(false);
                }
        }, [isReceiptError, receiptError]);

        /**
         * 设置最大可兑换金额
         */
        const setMaxAmount = () => {
                const balance = swapDirection === 'eth-to-dd' ? ethBalance : ddBalance;
                if (balance) {
                        const maxAmount = swapDirection === 'eth-to-dd'
                                ? Math.max(0, parseFloat(balance.formatted) - 0.01) // 预留0.01 ETH作为gas费
                                : parseFloat(balance.formatted);
                        setSwapAmount(maxAmount.toString());
                }
        };

        /**
         * 切换兑换方向
         */
        const switchDirection = () => {
                const newDirection = swapDirection === 'eth-to-dd' ? 'dd-to-eth' : 'eth-to-dd';
                setSwapDirection(newDirection);
                setSwapAmount('');
                setErrorMessage(''); // 切换方向时清除错误信息
        };

        const fromToken = swapDirection === 'eth-to-dd' ? 'ETH' : 'DD';
        const toToken = swapDirection === 'eth-to-dd' ? 'DD' : 'ETH';
        const fromBalance = swapDirection === 'eth-to-dd' ? ethBalance : ddBalance;
        const toBalance = swapDirection === 'eth-to-dd' ? ddBalance : ethBalance;
        const outputAmount = calculateOutput();

        const isButtonDisabled = !swapAmount || parseFloat(swapAmount) <= 0 || isSwapping || isConfirming;

        // 获取交易状态文本
        const getTransactionStatus = () => {
                if (writeError) return '交易发送失败';
                if (isReceiptError) return '交易执行失败';
                if (isConfirming) return '交易确认中...';
                if (isConfirmed) return '交易已确认';
                if (hash) return '交易处理中...';
                return '';
        };

        // 获取交易状态图标和颜色
        const getTransactionStatusIcon = () => {
                if (writeError || isReceiptError) {
                        return { icon: '❌', color: 'text-red-500', bgColor: 'bg-red-50' };
                }
                if (isConfirming) {
                        return { icon: '🔄', color: 'text-blue-500', bgColor: 'bg-blue-50' };
                }
                if (isConfirmed) {
                        return { icon: '✅', color: 'text-green-500', bgColor: 'bg-green-50' };
                }
                if (hash) {
                        return { icon: '⏳', color: 'text-blue-500', bgColor: 'bg-blue-50' };
                }
                return { icon: '', color: '', bgColor: '' };
        };

        const statusInfo = getTransactionStatusIcon();

        return (
                <div className={`card ${compact ? 'p-4' : 'p-6'}`}>
                        {/* 标题和滑点设置 */}
                        <div className="flex items-center justify-between mb-4">
                                <h3 className={`font-semibold flex items-center ${compact ? 'text-lg' : 'text-xl'}`}>
                                        <ArrowRightLeft className="mr-2" size={compact ? 18 : 20} />
                                        代币兑换
                                </h3>
                                <span className="text-gray-500">1 ETH = {EXCHANGE_RATES.ETH_TO_DD} DD</span>
                        </div>

                        <div className="space-y-4">
                                {/* 错误提示 */}
                                {errorMessage && (
                                        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                                                <div className="flex items-center space-x-2 text-red-800">
                                                        <AlertCircle size={16} />
                                                        <span className="text-sm">{errorMessage}</span>
                                                </div>
                                        </div>
                                )}

                                {/* 输入区域 - 支付代币 */}
                                <div className="bg-gray-50 rounded-lg p-4">
                                        <div className="flex justify-between items-center mb-2">
                                                <span className="text-sm text-gray-600">支付</span>
                                                <div className="text-sm text-gray-500">
                                                        余额: {fromBalance?.formatted ? parseFloat(fromBalance.formatted).toFixed(4) : '0.0000'} {fromToken}
                                                </div>
                                        </div>

                                        <div className="flex items-center space-x-3">
                                                <input
                                                        type="number"
                                                        value={swapAmount}
                                                        onChange={(e) => {
                                                                setSwapAmount(e.target.value);
                                                                setErrorMessage(''); // 输入时清除错误信息
                                                        }}
                                                        placeholder="0.0"
                                                        className="flex-1 bg-transparent text-xl font-semibold outline-none placeholder-gray-400"
                                                        step="0.000001"
                                                        min="0"
                                                />

                                                <div className="flex items-center space-x-2">
                                                        <button
                                                                onClick={setMaxAmount}
                                                                className="text-blue-500 hover:text-blue-600 text-sm font-medium"
                                                        >
                                                                MAX
                                                        </button>

                                                        <div className="flex items-center space-x-1 bg-white rounded-lg px-3 py-2 border">
                                                                <div className={`w-5 h-5 rounded-full ${fromToken === 'ETH' ? 'bg-gray-800' : 'bg-blue-500'}`}></div>
                                                                <span className="font-medium">{fromToken}</span>
                                                        </div>
                                                </div>
                                        </div>
                                </div>

                                {/* 切换兑换方向按钮 */}
                                <div className="flex justify-center">
                                        <button
                                                onClick={switchDirection}
                                                className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors group"
                                        >
                                                <ArrowUpDown size={20} className="text-gray-600 group-hover:text-blue-500 transition-colors" />
                                        </button>
                                </div>

                                {/* 输出区域 - 获得代币 */}
                                <div className="bg-gray-50 rounded-lg p-4">
                                        <div className="flex justify-between items-center mb-2">
                                                <span className="text-sm text-gray-600">获得</span>
                                                <div className="text-sm text-gray-500">
                                                        余额: {toBalance?.formatted ? parseFloat(toBalance.formatted).toFixed(4) : '0.0000'} {toToken}
                                                </div>
                                        </div>

                                        <div className="flex items-center space-x-3">
                                                <div className="flex-1 text-xl font-semibold text-gray-900">
                                                        {outputAmount}
                                                </div>

                                                <div className="flex items-center space-x-1 bg-white rounded-lg px-3 py-2 border">
                                                        <div className={`w-5 h-5 rounded-full ${toToken === 'ETH' ? 'bg-gray-800' : 'bg-blue-500'}`}></div>
                                                        <span className="font-medium">{toToken}</span>
                                                </div>
                                        </div>
                                </div>

                                {/* 交易状态提示 */}
                                {(hash || writeError || isReceiptError) && (
                                        <div className={`rounded-lg p-3 text-sm ${statusInfo.bgColor}`}>
                                                <div className="flex items-center space-x-2">
                                                        <span className={statusInfo.color}>{statusInfo.icon}</span>
                                                        <span className={statusInfo.color}>{getTransactionStatus()}</span>
                                                </div>
                                                {hash && (
                                                        <div className="mt-2 text-xs">
                                                                <a
                                                                        href={`https://sepolia.etherscan.io/tx/${hash}`}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="text-blue-500 hover:underline"
                                                                >
                                                                        查看交易详情
                                                                </a>
                                                        </div>
                                                )}
                                        </div>
                                )}

                                {/* 兑换按钮 */}
                                <button
                                        onClick={handleSwap}
                                        disabled={isButtonDisabled}
                                        className="w-full bg-blue-500 text-white py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-600 transition-colors"
                                >
                                        {isSwapping || isConfirming ? (
                                                <div className="flex items-center justify-center space-x-2">
                                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                        <span>兑换中...</span>
                                                </div>
                                        ) : (
                                                `兑换 ${fromToken} → ${toToken}`
                                        )}
                                </button>

                                {/* 兑换历史链接（紧凑模式下隐藏） */}
                                {!compact && (
                                        <div className="text-center">
                                                <button className="text-blue-500 hover:text-blue-600 text-sm font-medium flex items-center justify-center space-x-1">
                                                        <TrendingUp size={14} />
                                                        <span>查看兑换历史</span>
                                                </button>
                                        </div>
                                )}
                                <div className="text-xs text-gray-500 mt-2">
                                        <div>兑换合约地址: {SWAP_CONTRACT_ADDRESS}</div>
                                        <div>兑换合约DD余额: {swapContractDDBalance?.formatted || '0'} DD</div>
                                        <div>当前授权额度: {allowance} DD</div>
                                </div>
                        </div>
                </div>
        );
};

export default TokenSwap;