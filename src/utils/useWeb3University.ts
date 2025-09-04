// hooks/useWeb3University.ts
import { useState, useCallback } from 'react'
import {
        useAccount,
        useReadContract,
        useWriteContract,
        useBlockNumber,
        useSimulateContract
} from 'wagmi'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

const Web3UniversityABI = [
        {
                "inputs": [],
                "name": "PLATFORM_FEE_PERCENT",
                "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
                "stateMutability": "view",
                "type": "function"
        },
        {
                "inputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }, { "internalType": "uint256", "name": "", "type": "uint256" }],
                "name": "coursePurchases",
                "outputs": [
                        { "internalType": "uint256", "name": "courseId", "type": "uint256" },
                        { "internalType": "address", "name": "buyer", "type": "address" },
                        { "internalType": "uint256", "name": "purchasedAt", "type": "uint256" },
                        { "internalType": "bool", "name": "refunded", "type": "bool" }
                ],
                "stateMutability": "view",
                "type": "function"
        },
        {
                "inputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
                "name": "courses",
                "outputs": [
                        { "internalType": "uint256", "name": "id", "type": "uint256" },
                        { "internalType": "address", "name": "author", "type": "address" },
                        { "internalType": "uint256", "name": "price", "type": "uint256" },
                        { "internalType": "bool", "name": "active", "type": "bool" },
                        { "internalType": "uint256", "name": "purchaseCount", "type": "uint256" },
                        { "internalType": "uint256", "name": "createdAt", "type": "uint256" }
                ],
                "stateMutability": "view",
                "type": "function"
        },
        {
                "inputs": [
                        { "internalType": "address", "name": "_author", "type": "address" },
                        { "internalType": "uint256", "name": "_price", "type": "uint256" }
                ],
                "name": "createCourse",
                "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
                "stateMutability": "nonpayable",
                "type": "function"
        },
        {
                "inputs": [],
                "name": "ddToken",
                "outputs": [{ "internalType": "address", "name": "", "type": "address" }],
                "stateMutability": "view",
                "type": "function"
        },
        {
                "inputs": [{ "internalType": "uint256", "name": "_courseId", "type": "uint256" }],
                "name": "deactivateCourse",
                "outputs": [],
                "stateMutability": "nonpayable",
                "type": "function"
        },
        {
                "inputs": [],
                "name": "emergencyWithdraw",
                "outputs": [],
                "stateMutability": "nonpayable",
                "type": "function"
        },
        {
                "inputs": [],
                "name": "getActiveCourses",
                "outputs": [
                        {
                                "components": [
                                        { "internalType": "uint256", "name": "id", "type": "uint256" },
                                        { "internalType": "address", "name": "author", "type": "address" },
                                        { "internalType": "uint256", "name": "price", "type": "uint256" },
                                        { "internalType": "bool", "name": "active", "type": "bool" },
                                        { "internalType": "uint256", "name": "purchaseCount", "type": "uint256" },
                                        { "internalType": "uint256", "name": "createdAt", "type": "uint256" }
                                ],
                                "internalType": "struct Web3University.Course[]",
                                "name": "",
                                "type": "tuple[]"
                        }
                ],
                "stateMutability": "view",
                "type": "function"
        },
        {
                "inputs": [{ "internalType": "uint256", "name": "_courseId", "type": "uint256" }],
                "name": "getCourse",
                "outputs": [
                        { "internalType": "uint256", "name": "id", "type": "uint256" },
                        { "internalType": "address", "name": "author", "type": "address" },
                        { "internalType": "uint256", "name": "price", "type": "uint256" },
                        { "internalType": "bool", "name": "active", "type": "bool" },
                        { "internalType": "uint256", "name": "purchaseCount", "type": "uint256" },
                        { "internalType": "uint256", "name": "createdAt", "type": "uint256" }
                ],
                "stateMutability": "view",
                "type": "function"
        },
        {
                "inputs": [{ "internalType": "uint256", "name": "_courseId", "type": "uint256" }],
                "name": "getCoursePurchases",
                "outputs": [
                        {
                                "components": [
                                        { "internalType": "uint256", "name": "courseId", "type": "uint256" },
                                        { "internalType": "address", "name": "buyer", "type": "address" },
                                        { "internalType": "uint256", "name": "purchasedAt", "type": "uint256" },
                                        { "internalType": "bool", "name": "refunded", "type": "bool" }
                                ],
                                "internalType": "struct Web3University.CoursePurchase[]",
                                "name": "",
                                "type": "tuple[]"
                        }
                ],
                "stateMutability": "view",
                "type": "function"
        },
        {
                "inputs": [],
                "name": "getDDTokenAddress",
                "outputs": [{ "internalType": "address", "name": "", "type": "address" }],
                "stateMutability": "view",
                "type": "function"
        },
        {
                "inputs": [{ "internalType": "address", "name": "_user", "type": "address" }],
                "name": "getUserPurchases",
                "outputs": [{ "internalType": "uint256[]", "name": "", "type": "uint256[]" }],
                "stateMutability": "view",
                "type": "function"
        },
        {
                "inputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }, { "internalType": "address", "name": "", "type": "address" }],
                "name": "hasPurchased",
                "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
                "stateMutability": "view",
                "type": "function"
        },
        {
                "inputs": [
                        { "internalType": "uint256", "name": "_courseId", "type": "uint256" },
                        { "internalType": "address", "name": "_user", "type": "address" }
                ],
                "name": "hasUserPurchased",
                "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
                "stateMutability": "view",
                "type": "function"
        },
        {
                "inputs": [],
                "name": "owner",
                "outputs": [{ "internalType": "address", "name": "", "type": "address" }],
                "stateMutability": "view",
                "type": "function"
        },
        {
                "inputs": [{ "internalType": "uint256", "name": "_courseId", "type": "uint256" }],
                "name": "purchaseCourse",
                "outputs": [],
                "stateMutability": "nonpayable",
                "type": "function"
        },
        {
                "inputs": [],
                "name": "renounceOwnership",
                "outputs": [],
                "stateMutability": "nonpayable",
                "type": "function"
        },
        {
                "inputs": [],
                "name": "totalCourses",
                "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
                "stateMutability": "view",
                "type": "function"
        },
        {
                "inputs": [{ "internalType": "address", "name": "newOwner", "type": "address" }],
                "name": "transferOwnership",
                "outputs": [],
                "stateMutability": "nonpayable",
                "type": "function"
        },
        {
                "inputs": [{ "internalType": "address", "name": "_newDDToken", "type": "address" }],
                "name": "updateDDToken",
                "outputs": [],
                "stateMutability": "nonpayable",
                "type": "function"
        },
        {
                "inputs": [{ "internalType": "address", "name": "", "type": "address" }, { "internalType": "uint256", "name": "", "type": "uint256" }],
                "name": "userPurchases",
                "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
                "stateMutability": "view",
                "type": "function"
        },
        {
                "inputs": [{ "internalType": "uint256", "name": "_courseId", "type": "uint256" }],
                "name": "withdrawAuthorEarnings",
                "outputs": [],
                "stateMutability": "nonpayable",
                "type": "function"
        },
        {
                "inputs": [],
                "name": "withdrawPlatformFees",
                "outputs": [],
                "stateMutability": "nonpayable",
                "type": "function"
        }
] as const

// 合约地址
const CONTRACT_ADDRESS = '0xA661589192E966Bfb85970a51fea9afD21489B4e'

export const useWeb3University = () => {
        const { address } = useAccount()
        const { data: blockNumber } = useBlockNumber({ watch: true })
        const queryClient = useQueryClient()
        const [error, setError] = useState<string | null>(null)

        // 查询：获取平台手续费百分比
        const usePlatformFeePercent = () => {
                return useReadContract({
                        abi: Web3UniversityABI,
                        address: CONTRACT_ADDRESS,
                        functionName: 'PLATFORM_FEE_PERCENT',
                        query: {
                                enabled: !!address,
                                select: (data) => Number(data)
                        }
                })
        }

        // 查询：获取总课程数
        const useTotalCourses = () => {
                return useReadContract({
                        abi: Web3UniversityABI,
                        address: CONTRACT_ADDRESS,
                        functionName: 'totalCourses',
                        query: {
                                enabled: !!address,
                                select: (data) => Number(data)
                        }
                })
        }

        // 查询：获取活跃课程列表
        const useActiveCourses = () => {
                return useReadContract({
                        abi: Web3UniversityABI,
                        address: CONTRACT_ADDRESS,
                        functionName: 'getActiveCourses',
                        query: {
                                enabled: !!address,
                                select: (courses) => courses.map((course: any) => ({
                                        id: Number(course.id),
                                        author: course.author,
                                        price: course.price.toString(),
                                        active: course.active,
                                        purchaseCount: Number(course.purchaseCount),
                                        createdAt: Number(course.createdAt)
                                }))
                        }
                })
        }

        // 查询：获取单个课程信息
        const useCourse = (courseId: bigint) => {
                return useReadContract({
                        abi: Web3UniversityABI,
                        address: CONTRACT_ADDRESS,
                        functionName: 'getCourse',
                        args: [courseId],
                        query: {
                                enabled: !!address && !!courseId,
                                select: (course) => ({
                                        id: Number(course.id),
                                        author: course.author,
                                        price: course.price.toString(),
                                        active: course.active,
                                        purchaseCount: Number(course.purchaseCount),
                                        createdAt: Number(course.createdAt)
                                })
                        }
                })
        }

        // 查询：获取用户购买的课程
        const useUserPurchases = (userAddress?: string) => {
                return useReadContract({
                        abi: Web3UniversityABI,
                        address: CONTRACT_ADDRESS,
                        functionName: 'getUserPurchases',
                        args: [userAddress || address!],
                        query: {
                                enabled: !!address && !!(userAddress || address),
                                select: (purchases) => purchases.map((p: bigint) => Number(p))
                        }
                })
        }

        // 查询：检查用户是否购买过某课程
        const useHasPurchased = (courseId: bigint, userAddress?: string) => {
                return useReadContract({
                        abi: Web3UniversityABI,
                        address: CONTRACT_ADDRESS,
                        functionName: 'hasUserPurchased',
                        args: [courseId, userAddress || address!],
                        query: {
                                enabled: !!address && !!courseId && !!(userAddress || address)
                        }
                })
        }

        // 查询：获取DD代币地址
        const useDDTokenAddress = () => {
                return useReadContract({
                        abi: Web3UniversityABI,
                        address: CONTRACT_ADDRESS,
                        functionName: 'getDDTokenAddress',
                        query: {
                                enabled: !!address
                        }
                })
        }

        // 写操作：创建课程
        const { writeContract: createCourse, ...createCourseState } = useWriteContract()

        const createCourseMutation = useMutation({
                mutationFn: async ({ author, price }: { author: string; price: bigint }) => {
                        return createCourse({
                                abi: Web3UniversityABI,
                                address: CONTRACT_ADDRESS,
                                functionName: 'createCourse',
                                args: [author as `0x${string}`, price]
                        })
                },
                onSuccess: () => {
                        queryClient.invalidateQueries({ queryKey: ['activeCourses'] })
                        queryClient.invalidateQueries({ queryKey: ['totalCourses'] })
                }
        })

        // 写操作：购买课程
        const { writeContract: purchaseCourse, ...purchaseCourseState } = useWriteContract()

        const purchaseCourseMutation = useMutation({
                mutationFn: async (courseId: bigint) => {
                        return purchaseCourse({
                                abi: Web3UniversityABI,
                                address: CONTRACT_ADDRESS,
                                functionName: 'purchaseCourse',
                                args: [courseId]
                        })
                },
                onSuccess: () => {
                        queryClient.invalidateQueries({ queryKey: ['userPurchases'] })
                        queryClient.invalidateQueries({ queryKey: ['activeCourses'] })
                        queryClient.invalidateQueries({ queryKey: ['hasPurchased'] })
                }
        })

        // 写操作：作者提现收益
        const { writeContract: withdrawAuthorEarnings, ...withdrawAuthorEarningsState } = useWriteContract()

        const withdrawAuthorEarningsMutation = useMutation({
                mutationFn: async (courseId: bigint) => {
                        return withdrawAuthorEarnings({
                                abi: Web3UniversityABI,
                                address: CONTRACT_ADDRESS,
                                functionName: 'withdrawAuthorEarnings',
                                args: [courseId]
                        })
                },
                onSuccess: () => {
                        queryClient.invalidateQueries({ queryKey: ['activeCourses'] })
                }
        })

        // 写操作：停用课程
        const { writeContract: deactivateCourse, ...deactivateCourseState } = useWriteContract()

        const deactivateCourseMutation = useMutation({
                mutationFn: async (courseId: bigint) => {
                        return deactivateCourse({
                                abi: Web3UniversityABI,
                                address: CONTRACT_ADDRESS,
                                functionName: 'deactivateCourse',
                                args: [courseId]
                        })
                },
                onSuccess: () => {
                        queryClient.invalidateQueries({ queryKey: ['activeCourses'] })
                }
        })


        // 写操作：更新DD代币地址
        const { writeContract: updateDDTokenWrite, ...updateDDTokenState } = useWriteContract()

        const updateDDTokenMutation = useMutation({
                mutationFn: async (newDDToken: string) => {
                        return updateDDTokenWrite({
                                abi: Web3UniversityABI,
                                address: CONTRACT_ADDRESS,
                                functionName: 'updateDDToken',
                                args: [newDDToken as `0x${string}`]
                        })
                },
                onSuccess: () => {
                        queryClient.invalidateQueries({ queryKey: ['ddTokenAddress'] })
                }
        })

        const clearError = () => setError(null)

        return {
                // 读取Hooks
                usePlatformFeePercent,
                useTotalCourses,
                useActiveCourses,
                useCourse,
                useUserPurchases,
                useHasPurchased,
                useDDTokenAddress,

                // 写操作Mutations
                createCourse: createCourseMutation.mutate,
                createCourseState: { ...createCourseState, ...createCourseMutation },
                updateDDToken: updateDDTokenMutation.mutate,
                updateDDTokenState: { ...updateDDTokenState, ...updateDDTokenMutation },
                purchaseCourse: purchaseCourseMutation.mutate,
                purchaseCourseState: { ...purchaseCourseState, ...purchaseCourseMutation },
                withdrawAuthorEarnings: withdrawAuthorEarningsMutation.mutate,
                withdrawAuthorEarningsState: { ...withdrawAuthorEarningsState, ...withdrawAuthorEarningsMutation },
                deactivateCourse: deactivateCourseMutation.mutate,
                deactivateCourseState: { ...deactivateCourseState, ...deactivateCourseMutation },

                // 状态
                error,
                clearError,

                // 合约地址
                contractAddress: CONTRACT_ADDRESS
        }
}