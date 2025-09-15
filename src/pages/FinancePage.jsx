import { useState, useEffect, useCallback } from 'react';
import {
        useAccount,
        useBalance,
        useWriteContract,
        useWaitForTransactionReceipt,
        useReadContract,
        usePublicClient,
        useChainId
} from 'wagmi';
import { parseUnits, formatUnits, parseEther } from 'viem'

import {
        TrendingUp,
        ArrowRightLeft,
        DollarSign,
        PiggyBank,
        BarChart3,
        CheckCircle,
        ExternalLink,
        Wallet,
        Target
} from 'lucide-react';
import TokenSwap from '../components/TokenSwap';
import { EXCHANGE_RATES } from '../config/contracts';
import DD2ETHSwapABIJson from './../../abis/DD2ETHSwap.json'
import DDTOKENABIJson from './../../abis/DDTOKENABI.json'

const DD_TOKEN_ADDRESS = '0x2c082b72C18D75b29E3B220Fe685F2D7D3505F02'
const SWAP_CONTRACT_ADDRESS = '0x54277A4B84Dd4a9741Da0C7D46c3fC8C01f62607' // 兑换合约地址

// 兑换合约 ABI
const SWAP_ABI = DD2ETHSwapABIJson.abi

const DD_TOKEN_ABI = [
        "function approve(address spender, uint256 amount) returns (bool)",
        "function allowance(address owner, address spender) view returns (uint256)"
];

const SWAP_CONTRACT_ABI = [
        "function swapDDForETH(uint256 amount) external",
        "function getExchangeRate() view returns (uint256)"
];

// Sepolia 测试网合约地址
const SEPOLIA_CONTRACTS = {
        USDT: '0x7169D38820dfd117C3FA1f22a697dBA58d90BA06', // Sepolia USDT (如果存在)
        WETH: '0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14', // Sepolia WETH
        UNISWAP_V3_ROUTER: '0x3bFA4769FB09eefC5a80d6E87c3B9C650f7Ae48E', // Sepolia Uniswap V3 Router (SwapRouter02)
        QUOTER_V2: '0xEd1f6473345F45b75F8179591dd5bA1888cf2FB3', // Sepolia Quoter V2
};

// 主网合约地址 (备用)
const MAINNET_CONTRACTS = {
        USDT: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
        WETH: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
        UNISWAP_V3_ROUTER: '0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45',
        QUOTER_V2: '0x61fFE014bA17989E743c5F6cB21bF9697530B21e',
};
// Uniswap V3 SwapRouter02 ABI
const SWAP_ROUTER_ABI = [
        {
                "inputs": [
                        {
                                "components": [
                                        { "internalType": "address", "name": "tokenIn", "type": "address" },
                                        { "internalType": "address", "name": "tokenOut", "type": "address" },
                                        { "internalType": "uint24", "name": "fee", "type": "uint24" },
                                        { "internalType": "address", "name": "recipient", "type": "address" },
                                        { "internalType": "uint256", "name": "deadline", "type": "uint256" },
                                        { "internalType": "uint256", "name": "amountIn", "type": "uint256" },
                                        { "internalType": "uint256", "name": "amountOutMinimum", "type": "uint256" },
                                        { "internalType": "uint160", "name": "sqrtPriceLimitX96", "type": "uint160" }
                                ],
                                "internalType": "struct IV3SwapRouter.ExactInputSingleParams",
                                "name": "params",
                                "type": "tuple"
                        }
                ],
                "name": "exactInputSingle",
                "outputs": [{ "internalType": "uint256", "name": "amountOut", "type": "uint256" }],
                "stateMutability": "payable",
                "type": "function"
        }
];
// Quoter V2 ABI
const QUOTER_ABI = [
        {
                "inputs": [
                        { "internalType": "address", "name": "tokenIn", "type": "address" },
                        { "internalType": "address", "name": "tokenOut", "type": "address" },
                        { "internalType": "uint24", "name": "fee", "type": "uint24" },
                        { "internalType": "uint256", "name": "amountIn", "type": "uint256" },
                        { "internalType": "uint160", "name": "sqrtPriceLimitX96", "type": "uint160" }
                ],
                "name": "quoteExactInputSingle",
                "outputs": [
                        { "internalType": "uint256", "name": "amountOut", "type": "uint256" },
                        { "internalType": "uint160", "name": "sqrtPriceX96After", "type": "uint160" },
                        { "internalType": "uint32", "name": "initializedTicksCrossed", "type": "uint32" },
                        { "internalType": "uint256", "name": "gasEstimate", "type": "uint256" }
                ],
                "stateMutability": "nonpayable",
                "type": "function"
        }
];

// ERC20 ABI for USDT
const ERC20_ABI = [
        "function balanceOf(address owner) view returns (uint256)",
        "function decimals() view returns (uint8)"
];



const FinancePage = () => {
        // 获取当前连接的钱包地址
        const { address } = useAccount();

        const publicClient = usePublicClient();
        const chainId = useChainId();
        // 根据网络选择合约地址
        const contracts = chainId === 11155111 ? SEPOLIA_CONTRACTS : MAINNET_CONTRACTS;
        const isTestnet = chainId === 11155111;


        // Wagmi hooks
        const { writeContract, data: hash, isPending, error } = useWriteContract();
        const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

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

        // 状态管理
        const [convertAmount, setConvertAmount] = useState('');
        const [stakeAmount, setStakeAmount] = useState('');
        const [isConverting, setIsConverting] = useState(false);
        const [isStaking, setIsStaking] = useState(false);
        const [activeStep, setActiveStep] = useState(2);// 1: DD->ETH, 2: ETH->USDT, 3: Stake USDT
        const [isApproving, setIsApproving] = useState(false);
        const [ethToUsdtQuote, setEthToUsdtQuote] = useState('0');
        const [isLoadingHistory, setIsLoadingHistory] = useState(false);

        // AAVE相关状态
        const [aaveData, setAaveData] = useState({
                totalDeposited: '0',
                currentAPY: '3.45',
                earnedInterest: '0',
                healthFactor: '0'
        });

        // 历史记录
        const [stakingHistory, setStakingHistory] = useState([])

        // 读取当前授权额度
        const { data: currentAllowance, refetch: refetchAllowance } = useReadContract({
                address: DD_TOKEN_ADDRESS,
                abi: DD_TOKEN_ABI,
                functionName: 'allowance',
                args: [address, SWAP_CONTRACT_ADDRESS]
        });

        const isButtonDisabled = isPending || isConfirming || isConverting || !convertAmount || parseFloat(convertAmount) <= 0;


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

                if (!address) {
                        alert('请先连接钱包');
                        return;
                }


                if (!convertAmount || parseFloat(convertAmount) <= 0) {
                        alert('请输入有效的DD代币数量');
                        return;
                }

                setIsConverting(true);

                try {
                        const amount = parseFloat(convertAmount);
                        console.log('amount', amount)
                        const requiredAllowance = BigInt(amount * 1e18); // 假设代币有18位小数
                        console.log('requiredAllowance--', requiredAllowance)

                        // 检查是否需要授权
                        if (currentAllowance < requiredAllowance) {
                                console.log('授权中...');
                                writeContract({
                                        address: DD_TOKEN_ADDRESS,
                                        abi: DD_TOKEN_ABI,
                                        functionName: 'approve',
                                        args: [SWAP_CONTRACT_ADDRESS, requiredAllowance]
                                });
                                return; // 等待授权完成后再执行兑换
                        } else {
                                // 已有足够授权，直接执行兑换
                                executeSwap();
                        }

                } catch (error) {
                        console.error('兑换失败:', error);
                        alert('兑换失败，请重试');
                        setIsConverting(false);
                }

        };

        // 处理ETH到USDT的兑换
        const handleETHToUSDT = async () => {
                //TODO:待联调
                if (!address) {
                        alert('请先连接钱包');
                        return;
                }

                if (!convertAmount || parseFloat(convertAmount) <= 0) {
                        alert('请输入有效的ETH数量');
                        return;
                }

                // 检查网络
                if (!isTestnet && chainId !== 1) {
                        alert('请切换到以太坊主网或Sepolia测试网');
                        return;
                }

                const ethAmount = parseFloat(convertAmount);
                console.log('ethAmount----', ethAmount)
                // 检查ETH余额
                if (!ethBalance || parseFloat(ethBalance.formatted) < ethAmount) {
                        alert(`ETH余额不足。需要: ${ethAmount} ETH，当前余额: ${ethBalance?.formatted || '0'} ETH`);
                        return;
                }

                setIsConverting(true);
                try {
                        console.log(`开始ETH到USDT兑换... 网络: ${isTestnet ? 'Sepolia测试网' : '以太坊主网'}`);
                        console.log('输入ETH数量:', ethAmount);
                        console.log('预期USDT数量:', ethToUsdtQuote);

                        // 计算最小输出金额 (设置5%的滑点保护)
                        const expectedUsdt = parseFloat(ethToUsdtQuote);
                        const minAmountOut = expectedUsdt * 0.95; // 5% 滑点保护

                        // 设置交易截止时间 (20分钟后)
                        const deadline = Math.floor(Date.now() / 1000) + 1200;

                        // USDT小数位数
                        const usdtDecimals = isTestnet ? 18 : 6;

                        // 构建兑换参数
                        const swapParams = {
                                tokenIn: contracts.WETH,
                                tokenOut: contracts.USDT,
                                fee: isTestnet ? 10000 : 3000, // 测试网1%，主网0.3%
                                recipient: address,
                                deadline: deadline,
                                amountIn: parseEther(ethAmount),
                                amountOutMinimum: parseUnits(minAmountOut.toFixed(usdtDecimals), usdtDecimals),
                                sqrtPriceLimitX96: 0
                        };

                        console.log('兑换参数:', swapParams);

                        // 执行兑换交易
                        await writeContract({
                                address: contracts.UNISWAP_V3_ROUTER,
                                abi: SWAP_ROUTER_ABI,
                                functionName: 'exactInputSingle',
                                args: [swapParams],
                                value: parseEther(ethAmount) // 发送ETH
                        });

                } catch (error) {
                        console.error('ETH到USDT兑换失败:', error);
                        let errorMessage = '兑换失败，请重试';

                        if (error.message.includes('user rejected')) {
                                errorMessage = '用户取消了交易';
                        } else if (error.message.includes('insufficient funds')) {
                                errorMessage = 'ETH余额不足或Gas费不够';
                        } else if (error.message.includes('INSUFFICIENT_OUTPUT_AMOUNT')) {
                                errorMessage = '滑点过大，请重试或增加滑点容忍度';
                        } else if (error.message.includes('execution reverted')) {
                                errorMessage = isTestnet ?
                                        '交易失败，可能是测试网流动性不足或合约地址不正确' :
                                        '交易失败，请检查网络状态';
                        }

                        alert(errorMessage);
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

        // 获取按钮文本
        const getButtonText = () => {
                if (isPending) return '等待用户确认...';
                if (isConfirming) return '交易确认中...';
                if (isConverting) return '处理中...';
                return 'DD → ETH 兑换';
        };

        // 执行兑换
        const executeSwap = useCallback(async () => {
                try {
                        // const amount = parseFloat(convertAmount);
                        console.log('开始兑换...', SWAP_CONTRACT_ADDRESS, SWAP_CONTRACT_ABI, convertAmount);
                        writeContract({
                                address: SWAP_CONTRACT_ADDRESS,
                                abi: SWAP_ABI,
                                functionName: 'swapDdToEth',
                                args: [parseUnits(convertAmount, 18)],

                        });

                } catch (error) {
                        console.error('兑换执行失败:', error);
                        alert('兑换执行失败，请重试');
                        setIsConverting(false);
                }
        }, [convertAmount, writeContract]);

        // 监听交易状态
        useEffect(() => {
                if (isConfirmed && hash) {
                        // 交易确认成功
                        if (isApproving) {
                                // 授权成功，重新获取授权额度
                                refetchAllowance();
                                setIsApproving(false);
                                // 授权成功后自动执行兑换
                                executeSwap();
                        } else {
                                if (activeStep === 1) {
                                        // DD->ETH兑换成功
                                        const receivedETH = parseFloat(convertAmount) / EXCHANGE_RATES.DD_TO_ETH;
                                        alert(`成功兑换 ${convertAmount} DD 为 ${receivedETH.toFixed(6)} ETH`);
                                        setConvertAmount('');
                                        setActiveStep(2);
                                } else if (activeStep === 2) {
                                        // ETH->USDT兑换成功
                                        alert(`成功兑换 ${convertAmount} ETH 为 ${ethToUsdtQuote} USDT`);
                                        // setEthToUsdtAmount('');
                                        setActiveStep(3);
                                }
                                setIsConverting(false);
                        }
                }

                if (error) {
                        console.error('交易错误:', error);
                        alert(`交易失败: ${error.message}`);
                        setIsConverting(false);
                        setIsApproving(false);
                }
                // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [isConfirmed, error, hash, isApproving, convertAmount, refetchAllowance]);


        // 从区块链获取真实历史记录
        const fetchTransactionHistory = useCallback(async () => {

                if (!address || !publicClient) return;

                setIsLoadingHistory(true);
                try {
                        // 获取最近的区块范围 (最近1000个区块)
                        const latestBlock = await publicClient.getBlockNumber();
                        // 获取最近的区块范围 (最近1000个区块，增加范围以获取更多历史)
                        const fromBlock = latestBlock - 1000n > 0n ? latestBlock - 1000n : 0n;
                        console.log('latestBlock----', fromBlock, latestBlock)
                        // 获取 DD->ETH 兑换事件
                        const ddToEthLogs = await publicClient.getLogs({
                                address: SWAP_CONTRACT_ADDRESS,
                                events: [
                                        {
                                                type: 'event',
                                                name: 'DdToEthSwapped',
                                                inputs: [
                                                        { name: 'user', type: 'address', indexed: true },
                                                        { name: 'ddAmount', type: 'uint256', indexed: false },
                                                        { name: 'ethAmount', type: 'uint256', indexed: false }
                                                ]
                                        }
                                ],
                                fromBlock,
                                toBlock: 'latest',
                                args: {
                                        user: address
                                }
                        });
                        // 获取 ETH->DD 兑换事件
                        const ethToDdLogs = await publicClient.getLogs({
                                address: SWAP_CONTRACT_ADDRESS,
                                events: [
                                        {
                                                type: 'event',
                                                name: 'EthToDdSwapped',  // 新增：ETH到DD的兑换事件
                                                inputs: [
                                                        { name: 'user', type: 'address', indexed: true },
                                                        { name: 'ethAmount', type: 'uint256', indexed: false },
                                                        { name: 'ddAmount', type: 'uint256', indexed: false }
                                                ]
                                        }
                                ],
                                fromBlock,
                                toBlock: 'latest',
                                args: {
                                        user: address
                                }
                        });

                        // 获取 DD 代币转账事件 (用于识别质押等操作)
                        const transferLogs = await publicClient.getLogs({
                                address: DD_TOKEN_ADDRESS,
                                events: [
                                        {
                                                type: 'event',
                                                name: 'EthToDdSwapped',
                                                inputs: [
                                                        { name: 'user', type: 'address', indexed: true },
                                                        { name: 'ethAmount', type: 'uint256', indexed: false },
                                                        { name: 'ddAmount', type: 'uint256', indexed: false }
                                                ]
                                        }
                                ],
                                fromBlock,
                                toBlock: 'latest',
                                args: [
                                        { from: address },
                                        { to: address }
                                ]
                        });

                        // 处理历史记录
                        const historyRecords = [];

                        // 处理 DD->ETH 兑换记录
                        for (const log of ddToEthLogs) {
                                try {
                                        const block = await publicClient.getBlock({ blockHash: log.blockHash });
                                        const transaction = await publicClient.getTransaction({ hash: log.transactionHash });

                                        historyRecords.push({
                                                id: log.transactionHash,
                                                type: 'swap',
                                                subtype: 'dd_to_eth',
                                                amount: formatUnits(log.args.ddAmount, 18),
                                                receivedAmount: formatUnits(log.args.ethAmount, 18),
                                                token: 'DD',
                                                receivedToken: 'ETH',
                                                timestamp: new Date(Number(block.timestamp) * 1000).toISOString(),
                                                status: 'completed',
                                                txHash: log.transactionHash,
                                                blockNumber: log.blockNumber.toString(),
                                                gasUsed: transaction.gas?.toString() || '0'
                                        });
                                } catch (error) {
                                        console.error('处理DD->ETH兑换记录时出错:', error);
                                }
                        }

                        // 处理 ETH->DD 兑换记录
                        for (const log of ethToDdLogs) {
                                try {
                                        const block = await publicClient.getBlock({ blockHash: log.blockHash });
                                        const transaction = await publicClient.getTransaction({ hash: log.transactionHash });

                                        historyRecords.push({
                                                id: log.transactionHash + '-eth-dd',
                                                type: 'swap',
                                                subtype: 'eth_to_dd',
                                                amount: formatUnits(log.args.ethAmount, 18),
                                                receivedAmount: formatUnits(log.args.ddAmount, 18),
                                                token: 'ETH',
                                                receivedToken: 'DD',
                                                timestamp: new Date(Number(block.timestamp) * 1000).toISOString(),
                                                status: 'completed',
                                                txHash: log.transactionHash,
                                                blockNumber: log.blockNumber.toString(),
                                                gasUsed: transaction.gas?.toString() || '0'
                                        });
                                } catch (error) {
                                        console.error('处理ETH->DD兑换记录时出错:', error);
                                }
                        }// 处理转账记录 (排除兑换合约的转账)
                        for (const log of transferLogs) {
                                try {
                                        // 跳过兑换合约相关的转账 (这些已经在兑换记录中处理了)
                                        if (log.args.to === SWAP_CONTRACT_ADDRESS || log.args.from === SWAP_CONTRACT_ADDRESS) {
                                                continue;
                                        }

                                        const block = await publicClient.getBlock({ blockHash: log.blockHash });
                                        const isIncoming = log.args.to === address;
                                        const isOutgoing = log.args.from === address;

                                        if (isOutgoing) {
                                                historyRecords.push({
                                                        id: `${log.transactionHash}-out`,
                                                        type: 'transfer',
                                                        subtype: 'send',
                                                        amount: formatUnits(log.args.value, 18),
                                                        token: 'DD',
                                                        timestamp: new Date(Number(block.timestamp) * 1000).toISOString(),
                                                        status: 'completed',
                                                        txHash: log.transactionHash,
                                                        blockNumber: log.blockNumber.toString(),
                                                        to: log.args.to
                                                });
                                        }

                                        if (isIncoming) {
                                                historyRecords.push({
                                                        id: `${log.transactionHash}-in`,
                                                        type: 'transfer',
                                                        subtype: 'receive',
                                                        amount: formatUnits(log.args.value, 18),
                                                        token: 'DD',
                                                        timestamp: new Date(Number(block.timestamp) * 1000).toISOString(),
                                                        status: 'completed',
                                                        txHash: log.transactionHash,
                                                        blockNumber: log.blockNumber.toString(),
                                                        from: log.args.from
                                                });
                                        }
                                } catch (error) {
                                        console.error('处理转账记录时出错:', error);
                                }
                        }


                        // 处理兑换记录
                        for (const log of ddToEthLogs) {
                                const block = await publicClient.getBlock({ blockHash: log.blockHash });
                                const transaction = await publicClient.getTransaction({ hash: log.transactionHash });

                                historyRecords.push({
                                        id: log.transactionHash,
                                        type: 'swap',
                                        subtype: 'dd_to_eth',
                                        amount: formatUnits(log.args.ddAmount, 18),
                                        receivedAmount: formatUnits(log.args.ethAmount, 18),
                                        token: 'DD',
                                        receivedToken: 'ETH',
                                        timestamp: new Date(Number(block.timestamp) * 1000).toISOString(),
                                        status: 'completed',
                                        txHash: log.transactionHash,
                                        blockNumber: log.blockNumber,
                                        gasUsed: transaction.gas
                                });
                        }
                        console.log('transferLogs--', transferLogs)
                        // 处理转账记录 (质押相关)
                        for (const log of transferLogs) {
                                const block = await publicClient.getBlock({ blockHash: log.blockHash });
                                const isIncoming = log.args.to === address;
                                const isOutgoing = log.args.from === address;

                                // 跳过兑换合约的转账 (这些已经在上面处理了)
                                if (log.args.to === SWAP_CONTRACT_ADDRESS || log.args.from === SWAP_CONTRACT_ADDRESS) {
                                        continue;
                                }

                                if (isOutgoing) {
                                        historyRecords.push({
                                                id: `${log.transactionHash}-out`,
                                                type: 'transfer',
                                                subtype: 'send',
                                                amount: formatUnits(log.args.value, 18),
                                                token: 'DD',
                                                timestamp: new Date(Number(block.timestamp) * 1000).toISOString(),
                                                status: 'completed',
                                                txHash: log.transactionHash,
                                                blockNumber: log.blockNumber,
                                                to: log.args.to
                                        });
                                }

                                if (isIncoming) {
                                        historyRecords.push({
                                                id: `${log.transactionHash}-in`,
                                                type: 'transfer',
                                                subtype: 'receive',
                                                amount: formatUnits(log.args.value, 18),
                                                token: 'DD',
                                                timestamp: new Date(Number(block.timestamp) * 1000).toISOString(),
                                                status: 'completed',
                                                txHash: log.transactionHash,
                                                blockNumber: log.blockNumber,
                                                from: log.args.from
                                        });
                                }
                        }

                        // 按时间排序 (最新的在前面)
                        historyRecords.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

                        setStakingHistory(historyRecords);

                } catch (error) {
                        console.error('获取历史记录失败:', error);
                        // 如果获取失败，可以设置一个空数组或者保持之前的数据
                        setStakingHistory([]);
                } finally {
                        setIsLoadingHistory(false);
                }
        }, [address, publicClient]);

        // // 监听区块变化，自动刷新历史记录
        // useEffect(() => {
        //         if (address && publicClient) {
        //                 fetchTransactionHistory();
        //         }
        // }, [address, publicClient, blockNumber, fetchTransactionHistory]);

        // 手动刷新历史记录
        const handleRefreshHistory = () => {
                fetchTransactionHistory();
        };

        // 格式化历史记录显示
        const formatHistoryRecord = (record) => {
                switch (record.type) {
                        case 'swap':
                                if (record.subtype === 'dd_to_eth') {
                                        return {
                                                title: `兑换 ${parseFloat(record.amount).toFixed(4)} DD → ${parseFloat(record.receivedAmount).toFixed(6)} ETH`,
                                                icon: <ArrowRightLeft size={16} />,
                                                bgColor: 'bg-blue-100 text-blue-600'
                                        };
                                }
                                break;
                        case 'transfer':
                                if (record.subtype === 'send') {
                                        return {
                                                title: `发送 ${parseFloat(record.amount).toFixed(4)} ${record.token}`,
                                                icon: <ArrowRightLeft size={16} />,
                                                bgColor: 'bg-red-100 text-red-600'
                                        };
                                } else if (record.subtype === 'receive') {
                                        return {
                                                title: `接收 ${parseFloat(record.amount).toFixed(4)} ${record.token}`,
                                                icon: <TrendingUp size={16} />,
                                                bgColor: 'bg-green-100 text-green-600'
                                        };
                                }
                                break;
                        default:
                                return {
                                        title: `未知操作`,
                                        icon: <BarChart3 size={16} />,
                                        bgColor: 'bg-gray-100 text-gray-600'
                                };
                }
        };

        useEffect(() => {
                handleRefreshHistory()
        }, [])

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
                                                        {usdtBalance?.formatted ? parseFloat(usdtBalance.formatted).toFixed(4) : '0.0000'}
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
                                                                                disabled={isButtonDisabled}
                                                                                className="w-full btn-primary mt-4"
                                                                        >
                                                                                {isPending || isConfirming || isConverting ? (
                                                                                        <div className="flex items-center justify-center space-x-2">
                                                                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                                                                <span>{getButtonText()}</span>
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