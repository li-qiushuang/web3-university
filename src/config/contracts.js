// 合约地址配置 - 请根据部署的实际地址更新
export const CONTRACT_ADDRESSES = {
        // 主网地址
        1: {
                UNIVERSITY: "0x1234567890123456789012345678901234567890",
                DD_TOKEN: "0x0987654321098765432109876543210987654321",
                USDT: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
        },
        // Goerli测试网地址
        5: {
                UNIVERSITY: "0x1234567890123456789012345678901234567890",
                DD_TOKEN: "0x0987654321098765432109876543210987654321",
                USDT: "0x509Ee0d083DdF8AC028f2a56731412edD63223B9",
        },
        // Sepolia测试网地址
        11155111: {
                UNIVERSITY: "0x1234567890123456789012345678901234567890",
                DD_TOKEN: "0x0987654321098765432109876543210987654321",
                USDT: "0x7169D38820dfd117C3FA1f22a697dBA58d90BA06",
        },
}

// Web3University合约ABI
export const UNIVERSITY_ABI = [
        {
                "inputs": [{ "name": "_author", "type": "address" }, { "name": "_price", "type": "uint256" }],
                "name": "createCourse",
                "outputs": [{ "name": "", "type": "uint256" }],
                "stateMutability": "nonpayable",
                "type": "function"
        },
        {
                "inputs": [{ "name": "_courseId", "type": "uint256" }],
                "name": "purchaseCourse",
                "outputs": [],
                "stateMutability": "nonpayable",
                "type": "function"
        },
        {
                "inputs": [],
                "name": "getActiveCourses",
                "outputs": [{
                        "components": [
                                { "name": "id", "type": "uint256" },
                                { "name": "author", "type": "address" },
                                { "name": "price", "type": "uint256" },
                                { "name": "active", "type": "bool" },
                                { "name": "purchaseCount", "type": "uint256" },
                                { "name": "createdAt", "type": "uint256" }
                        ], "name": "", "type": "tuple[]"
                }],
                "stateMutability": "view",
                "type": "function"
        },
        {
                "inputs": [{ "name": "_courseId", "type": "uint256" }, { "name": "_user", "type": "address" }],
                "name": "hasUserPurchased",
                "outputs": [{ "name": "", "type": "bool" }],
                "stateMutability": "view",
                "type": "function"
        },
        {
                "inputs": [{ "name": "_user", "type": "address" }],
                "name": "getUserPurchases",
                "outputs": [{ "name": "", "type": "uint256[]" }],
                "stateMutability": "view",
                "type": "function"
        },
        {
                "inputs": [{ "name": "_courseId", "type": "uint256" }],
                "name": "getCourse",
                "outputs": [{
                        "components": [
                                { "name": "id", "type": "uint256" },
                                { "name": "author", "type": "address" },
                                { "name": "price", "type": "uint256" },
                                { "name": "active", "type": "bool" },
                                { "name": "purchaseCount", "type": "uint256" },
                                { "name": "createdAt", "type": "uint256" }
                        ], "name": "", "type": "tuple"
                }],
                "stateMutability": "view",
                "type": "function"
        },
        {
                "inputs": [{ "name": "_courseId", "type": "uint256" }],
                "name": "withdrawAuthorEarnings",
                "outputs": [],
                "stateMutability": "nonpayable",
                "type": "function"
        },
        {
                "inputs": [],
                "name": "totalCourses",
                "outputs": [{ "name": "", "type": "uint256" }],
                "stateMutability": "view",
                "type": "function"
        }
]

// ERC20代币标准ABI
export const ERC20_ABI = [
        {
                "inputs": [{ "name": "spender", "type": "address" }, { "name": "amount", "type": "uint256" }],
                "name": "approve",
                "outputs": [{ "name": "", "type": "bool" }],
                "stateMutability": "nonpayable",
                "type": "function"
        },
        {
                "inputs": [{ "name": "owner", "type": "address" }, { "name": "spender", "type": "address" }],
                "name": "allowance",
                "outputs": [{ "name": "", "type": "uint256" }],
                "stateMutability": "view",
                "type": "function"
        },
        {
                "inputs": [{ "name": "account", "type": "address" }],
                "name": "balanceOf",
                "outputs": [{ "name": "", "type": "uint256" }],
                "stateMutability": "view",
                "type": "function"
        },
        {
                "inputs": [],
                "name": "totalSupply",
                "outputs": [{ "name": "", "type": "uint256" }],
                "stateMutability": "view",
                "type": "function"
        },
        {
                "inputs": [{ "name": "to", "type": "address" }, { "name": "amount", "type": "uint256" }],
                "name": "transfer",
                "outputs": [{ "name": "", "type": "bool" }],
                "stateMutability": "nonpayable",
                "type": "function"
        },
        {
                "inputs": [{ "name": "from", "type": "address" }, { "name": "to", "type": "address" }, { "name": "amount", "type": "uint256" }],
                "name": "transferFrom",
                "outputs": [{ "name": "", "type": "bool" }],
                "stateMutability": "nonpayable",
                "type": "function"
        },
        {
                "inputs": [],
                "name": "name",
                "outputs": [{ "name": "", "type": "string" }],
                "stateMutability": "view",
                "type": "function"
        },
        {
                "inputs": [],
                "name": "symbol",
                "outputs": [{ "name": "", "type": "string" }],
                "stateMutability": "view",
                "type": "function"
        },
        {
                "inputs": [],
                "name": "decimals",
                "outputs": [{ "name": "", "type": "uint8" }],
                "stateMutability": "view",
                "type": "function"
        }
]

// 获取当前链的合约地址
export const getContractAddress = (chainId, contractName) => {
        return CONTRACT_ADDRESSES[chainId]?.[contractName] || CONTRACT_ADDRESSES[1][contractName]
}

// 交换汇率配置
export const EXCHANGE_RATES = {
        ETH_TO_DD: 1000, // 1 ETH = 1000 DD
        DD_TO_ETH: 0.001, // 1 DD = 0.001 ETH
        ETH_TO_USDT: 2000, // 示例汇率，实际应该从预言机获取
}

// 平台配置
export const PLATFORM_CONFIG = {
        PLATFORM_FEE_PERCENT: 5, // 5%平台费用
        MIN_COURSE_PRICE: "0.001", // 最小课程价格
        MAX_COURSE_PRICE: "1000", // 最大课程价格
        SUPPORTED_FILE_TYPES: ['mp4', 'mov', 'avi', 'mkv'], // 支持的视频格式
        SUPPORTED_IMAGE_TYPES: ['jpg', 'jpeg', 'png', 'gif', 'webp'], // 支持的图片格式
}