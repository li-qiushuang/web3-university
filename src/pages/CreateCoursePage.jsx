import React, { useState, useEffect } from 'react';
import { useAccount, useReadContract } from 'wagmi';
import { Plus, Upload, Video, Image, DollarSign, Sparkles, Eye, Save } from 'lucide-react';
import { PLATFORM_CONFIG } from '../config/contracts';
import { useWeb3University } from './../utils/useWeb3University'

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
]

// 合约地址
const CONTRACT_ADDRESS = '0xA661589192E966Bfb85970a51fea9afD21489B4e'

const CreateCoursePage = () => {
        const { address } = useAccount();
        const [courseData, setCourseData] = useState({
                title: '',
                description: '',
                price: '',
                cover: '',
                videoUrl: '',
                instructor: '',
                category: 'blockchain',
                duration: '',
                level: 'beginner',
                tags: []
        });

        const [currentTag, setCurrentTag] = useState('');
        const [isSubmitting, setIsSubmitting] = useState(false);
        const [previewMode, setPreviewMode] = useState(false);
        const [aiEnhancing, setAiEnhancing] = useState(false);

        const {
                updateDDToken,
                updateDDTokenState,
                createCourse,
                createCourseState
        } = useWeb3University();




        // 添加这个Hook来检查所有者
        const { data: contractOwner } = useReadContract({
                abi: Web3UniversityABI,
                address: CONTRACT_ADDRESS,
                functionName: 'owner',
        });
        useEffect(() => {
                if (address && contractOwner) {
                        console.log('当前用户:', address);
                        console.log('合约所有者:', contractOwner);
                        console.log('是否是所有者:', address.toLowerCase() === contractOwner.toLowerCase());
                }
        }, [address, contractOwner]);

        // 添加DD代币地址状态
        const [ddTokenAddress] = useState('0x2c082b72C18D75b29E3B220Fe685F2D7D3505F02');
        const [showTokenSetup, setShowTokenSetup] = useState(true);


        // 设置DD代币的函数
        const setupDDToken = async () => {
                try {
                        await updateDDToken(ddTokenAddress);
                        console.info('DD代币地址设置成功！');
                        setShowTokenSetup(false);
                } catch (error) {
                        console.error('设置失败:', error);
                        alert('设置失败: ' + error.message);
                }
        };

        useEffect(() => {
                setupDDToken()
        }, [showTokenSetup])


        // 课程分类选项
        const categories = [
                { value: 'blockchain', label: '区块链基础' },
                { value: 'defi', label: 'DeFi协议' },
                { value: 'nft', label: 'NFT与数字艺术' },
                { value: 'smart-contracts', label: '智能合约开发' },
                { value: 'web3-dev', label: 'Web3开发' },
                { value: 'tokenomics', label: '代币经济学' },
                { value: 'security', label: '区块链安全' },
                { value: 'other', label: '其他' }
        ];

        const levels = [
                { value: 'beginner', label: '初学者' },
                { value: 'intermediate', label: '中级' },
                { value: 'advanced', label: '高级' },
                { value: 'expert', label: '专家级' }
        ];
        const [isLoading, setIsLoading] = useState(false)


        // 处理表单数据变化
        const handleInputChange = (field, value) => {
                setCourseData(prev => ({
                        ...prev,
                        [field]: value
                }));
        };

        // 添加标签
        const addTag = () => {
                if (currentTag.trim() && !courseData.tags.includes(currentTag.trim())) {
                        setCourseData(prev => ({
                                ...prev,
                                tags: [...prev.tags, currentTag.trim()]
                        }));
                        setCurrentTag('');
                }
        };

        // 移除标签
        const removeTag = (tagToRemove) => {
                setCourseData(prev => ({
                        ...prev,
                        tags: prev.tags.filter(tag => tag !== tagToRemove)
                }));
        };

        // AI润色功能
        const handleAIEnhancement = async () => {
                if (!courseData.description.trim()) {
                        alert('请先输入课程描述');
                        return;
                }

                setAiEnhancing(true);
                try {
                        // 模拟AI润色延迟
                        await new Promise(resolve => setTimeout(resolve, 2000));

                        const enhancedDescription = courseData.description +
                                "\n\n✨ AI优化建议：\n• 本课程采用理论与实践相结合的教学方式\n• 提供丰富的案例分析和项目实战\n• 配备专业的技术支持和答疑服务\n• 学完即可获得相关技能认证";

                        setCourseData(prev => ({
                                ...prev,
                                description: enhancedDescription
                        }));

                        alert('AI润色完成！');
                } catch (error) {
                        console.error('AI润色失败:', error);
                        alert('AI润色失败，请重试');
                } finally {
                        setAiEnhancing(false);
                }
        };

        // 表单验证
        const validateForm = () => {
                const required = ['title', 'description', 'price', 'instructor'];
                const missing = required.filter(field => !courseData[field]?.trim());

                if (missing.length > 0) {
                        alert(`请填写以下必填项: ${missing.map(f => {
                                const labels = { title: '课程名称', description: '课程描述', price: '价格', instructor: '讲师姓名' };
                                return labels[f];
                        }).join(', ')}`);
                        return false;
                }

                const price = parseFloat(courseData.price);
                if (isNaN(price) || price <= 0) {
                        alert('请输入有效的价格');
                        return false;
                }

                if (price < parseFloat(PLATFORM_CONFIG.MIN_COURSE_PRICE) || price > parseFloat(PLATFORM_CONFIG.MAX_COURSE_PRICE)) {
                        alert(`价格必须在 ${PLATFORM_CONFIG.MIN_COURSE_PRICE} - ${PLATFORM_CONFIG.MAX_COURSE_PRICE} DD 之间`);
                        return false;
                }

                return true;
        };



        // 提交创建课程
        const handleSubmit = async () => {
                if (!validateForm()) return;

                if (!address) {
                        alert('请先连接钱包');
                        return;
                }
                // 检查是否是所有者
                if (contractOwner && address.toLowerCase() !== contractOwner.toLowerCase()) {
                        alert('只有合约所有者可以创建课程');
                        return;
                }

                // 检查DD代币是否设置
                if (!ddTokenAddress || ddTokenAddress === '0x0000000000000000000000000000000000000000') {
                        alert('DD代币地址未设置，请联系管理员');
                        return;
                }
                setIsSubmitting(true);

                try {

                        const priceInWei = BigInt(Math.floor(parseFloat(courseData.price) * 10 ** 18));
                        const result = await createCourse({
                                author: address, // 使用当前用户地址作为作者
                                price: priceInWei
                        })
                        console.log('result--', result)
                        alert('课程创建成功！交易已提交，等待区块链确认...');
                        //TODO:这里可以用useWaitForTransactionReceipt增加一下对区块打包的监听

                        // 2. 生成课程ID（在实际应用中从合约事件获取）
                        // const courseId = Date.now();

                        // 3. 保存课程详情到本地存储
                        // storage.saveCourse(courseId, {
                        //         ...courseData,
                        //         author: address,
                        //         createdAt: new Date().toISOString(),
                        //         active: true
                        // });

                        // alert('课程创建成功！课程ID: ' + courseId);

                        // 重置表单
                        setCourseData({
                                title: '',
                                description: '',
                                price: '',
                                cover: '',
                                videoUrl: '',
                                instructor: '',
                                category: 'blockchain',
                                duration: '',
                                level: 'beginner',
                                tags: []
                        });

                } catch (error) {
                        console.error('创建课程失败:', error);
                        alert('创建失败: ' + (error.message || '请重试'));
                } finally {
                        setIsSubmitting(false);
                }
        };

        // 预览卡片
        const PreviewCard = () => (
                <div className="card max-w-sm">
                        <img
                                src={courseData.cover || 'https://via.placeholder.com/300x200/6366f1/ffffff?text=Course+Preview'}
                                alt="课程预览"
                                className="w-full h-48 object-cover"
                        />
                        <div className="p-4">
                                <h3 className="font-semibold text-lg mb-2">
                                        {courseData.title || '课程标题'}
                                </h3>
                                <p className="text-gray-600 text-sm mb-2">
                                        讲师: {courseData.instructor || '讲师姓名'}
                                </p>
                                <p className="text-gray-500 text-sm mb-3 line-clamp-2">
                                        {courseData.description || '课程描述...'}
                                </p>
                                <div className="flex justify-between items-center">
                                        <span className="text-2xl font-bold text-blue-600">
                                                {courseData.price || '0'} DD
                                        </span>
                                        <span className="text-sm text-gray-500">
                                                {levels.find(l => l.value === courseData.level)?.label}
                                        </span>
                                </div>
                        </div>
                </div>
        );

        return (
                <div className="min-h-screen gradient-bg py-8">
                        <div className="container mx-auto px-4 max-w-6xl">
                                {/* 页面标题 */}
                                <div className="text-center mb-8">
                                        <h1 className="text-3xl font-bold text-gray-900 mb-2">创建课程</h1>
                                        <p className="text-gray-600">分享您的知识，帮助更多人学习Web3技术</p>
                                </div>

                                <div className="flex gap-8">
                                        {/* 左侧：表单 */}
                                        <div className="flex-1">
                                                <div className="card p-6">
                                                        <div className="flex items-center justify-between mb-6">
                                                                <h2 className="text-xl font-semibold flex items-center">
                                                                        <Plus className="mr-2" size={20} />
                                                                        课程信息
                                                                </h2>

                                                                <button
                                                                        onClick={() => setPreviewMode(!previewMode)}
                                                                        className="flex items-center space-x-2 btn-secondary text-sm"
                                                                >
                                                                        <Eye size={16} />
                                                                        <span>{previewMode ? '隐藏预览' : '预览'}</span>
                                                                </button>
                                                        </div>

                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                                {/* 基本信息 */}
                                                                <div className="md:col-span-2">
                                                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                                                                课程名称 <span className="text-red-500">*</span>
                                                                        </label>
                                                                        <input
                                                                                type="text"
                                                                                value={courseData.title}
                                                                                onChange={(e) => handleInputChange('title', e.target.value)}
                                                                                placeholder="输入一个吸引人的课程标题"
                                                                                className="input-field"
                                                                                maxLength={100}
                                                                        />
                                                                        <div className="text-xs text-gray-500 mt-1">
                                                                                {courseData.title.length}/100 字符
                                                                        </div>
                                                                </div>

                                                                <div>
                                                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                                                                讲师姓名 <span className="text-red-500">*</span>
                                                                        </label>
                                                                        <input
                                                                                type="text"
                                                                                value={courseData.instructor}
                                                                                onChange={(e) => handleInputChange('instructor', e.target.value)}
                                                                                placeholder="您的姓名或昵称"
                                                                                className="input-field"
                                                                        />
                                                                </div>

                                                                <div>
                                                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                                                                课程价格 (DD代币) <span className="text-red-500">*</span>
                                                                        </label>
                                                                        <div className="relative">
                                                                                <input
                                                                                        type="number"
                                                                                        step="0.001"
                                                                                        min={PLATFORM_CONFIG.MIN_COURSE_PRICE}
                                                                                        max={PLATFORM_CONFIG.MAX_COURSE_PRICE}
                                                                                        value={courseData.price}
                                                                                        onChange={(e) => handleInputChange('price', e.target.value)}
                                                                                        placeholder="0.000"
                                                                                        className="input-field pr-12"
                                                                                />
                                                                                <DollarSign className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                                                        </div>
                                                                        <div className="text-xs text-gray-500 mt-1">
                                                                                建议价格: {PLATFORM_CONFIG.MIN_COURSE_PRICE} - {PLATFORM_CONFIG.MAX_COURSE_PRICE} DD
                                                                        </div>
                                                                </div>

                                                                <div>
                                                                        <label className="block text-sm font-medium text-gray-700 mb-2">课程分类</label>
                                                                        <select
                                                                                value={courseData.category}
                                                                                onChange={(e) => handleInputChange('category', e.target.value)}
                                                                                className="input-field"
                                                                        >
                                                                                {categories.map(cat => (
                                                                                        <option key={cat.value} value={cat.value}>{cat.label}</option>
                                                                                ))}
                                                                        </select>
                                                                </div>

                                                                <div>
                                                                        <label className="block text-sm font-medium text-gray-700 mb-2">难度等级</label>
                                                                        <select
                                                                                value={courseData.level}
                                                                                onChange={(e) => handleInputChange('level', e.target.value)}
                                                                                className="input-field"
                                                                        >
                                                                                {levels.map(level => (
                                                                                        <option key={level.value} value={level.value}>{level.label}</option>
                                                                                ))}
                                                                        </select>
                                                                </div>

                                                                <div>
                                                                        <label className="block text-sm font-medium text-gray-700 mb-2">课程时长</label>
                                                                        <input
                                                                                type="text"
                                                                                value={courseData.duration}
                                                                                onChange={(e) => handleInputChange('duration', e.target.value)}
                                                                                placeholder="例如: 2小时30分钟"
                                                                                className="input-field"
                                                                        />
                                                                </div>

                                                                {/* 封面图片 */}
                                                                <div className="md:col-span-2">
                                                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                                                                封面图片URL
                                                                        </label>
                                                                        <div className="flex space-x-2">
                                                                                <input
                                                                                        type="url"
                                                                                        value={courseData.cover}
                                                                                        onChange={(e) => handleInputChange('cover', e.target.value)}
                                                                                        placeholder="https://example.com/image.jpg"
                                                                                        className="input-field flex-1"
                                                                                />
                                                                                <button className="btn-secondary flex items-center space-x-1">
                                                                                        <Upload size={16} />
                                                                                        <span>上传</span>
                                                                                </button>
                                                                        </div>
                                                                        <div className="text-xs text-gray-500 mt-1">
                                                                                支持格式: JPG, PNG, GIF, WebP (推荐尺寸: 400x300px)
                                                                        </div>
                                                                </div>

                                                                {/* 视频URL */}
                                                                <div className="md:col-span-2">
                                                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                                                                课程视频URL
                                                                        </label>
                                                                        <div className="flex space-x-2">
                                                                                <input
                                                                                        type="url"
                                                                                        value={courseData.videoUrl}
                                                                                        onChange={(e) => handleInputChange('videoUrl', e.target.value)}
                                                                                        placeholder="https://example.com/video.mp4"
                                                                                        className="input-field flex-1"
                                                                                />
                                                                                <button className="btn-secondary flex items-center space-x-1">
                                                                                        <Video size={16} />
                                                                                        <span>上传</span>
                                                                                </button>
                                                                        </div>
                                                                        <div className="text-xs text-gray-500 mt-1">
                                                                                支持格式: MP4, MOV, AVI, MKV
                                                                        </div>
                                                                </div>

                                                                {/* 课程描述 */}
                                                                <div className="md:col-span-2">
                                                                        <div className="flex items-center justify-between mb-2">
                                                                                <label className="block text-sm font-medium text-gray-700">
                                                                                        课程描述 <span className="text-red-500">*</span>
                                                                                </label>
                                                                                <button
                                                                                        onClick={handleAIEnhancement}
                                                                                        disabled={aiEnhancing || !courseData.description.trim()}
                                                                                        className="flex items-center space-x-1 text-sm bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded-md hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-50"
                                                                                >
                                                                                        <Sparkles size={14} />
                                                                                        <span>{aiEnhancing ? 'AI润色中...' : 'AI润色'}</span>
                                                                                </button>
                                                                        </div>
                                                                        <textarea
                                                                                value={courseData.description}
                                                                                onChange={(e) => handleInputChange('description', e.target.value)}
                                                                                placeholder="详细描述您的课程内容、学习目标、适合人群等..."
                                                                                rows={6}
                                                                                className="input-field"
                                                                                maxLength={2000}
                                                                        />
                                                                        <div className="text-xs text-gray-500 mt-1">
                                                                                {courseData.description.length}/2000 字符
                                                                        </div>
                                                                </div>

                                                                {/* 标签 */}
                                                                <div className="md:col-span-2">
                                                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                                                                课程标签
                                                                        </label>
                                                                        <div className="flex space-x-2 mb-2">
                                                                                <input
                                                                                        type="text"
                                                                                        value={currentTag}
                                                                                        onChange={(e) => setCurrentTag(e.target.value)}
                                                                                        placeholder="输入标签"
                                                                                        className="input-field flex-1"
                                                                                        onKeyPress={(e) => e.key === 'Enter' && addTag()}
                                                                                />
                                                                                <button
                                                                                        onClick={addTag}
                                                                                        className="btn-secondary"
                                                                                >
                                                                                        添加
                                                                                </button>
                                                                        </div>

                                                                        {courseData.tags.length > 0 && (
                                                                                <div className="flex flex-wrap gap-2">
                                                                                        {courseData.tags.map((tag, index) => (
                                                                                                <span
                                                                                                        key={index}
                                                                                                        className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                                                                                                >
                                                                                                        {tag}
                                                                                                        <button
                                                                                                                onClick={() => removeTag(tag)}
                                                                                                                className="ml-2 text-blue-600 hover:text-blue-800"
                                                                                                        >
                                                                                                                ×
                                                                                                        </button>
                                                                                                </span>
                                                                                        ))}
                                                                                </div>
                                                                        )}
                                                                </div>
                                                        </div>

                                                        {/* 提交按钮 */}
                                                        <div className="mt-8 flex space-x-4">
                                                                <button
                                                                        onClick={handleSubmit}
                                                                        disabled={isSubmitting || isLoading}
                                                                        className="btn-primary flex-1 flex items-center justify-center space-x-2"
                                                                >
                                                                        {isSubmitting || isLoading ? (
                                                                                <>
                                                                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                                                        <span>创建中...</span>
                                                                                </>
                                                                        ) : (
                                                                                <>
                                                                                        <Save size={16} />
                                                                                        <span>创建课程</span>
                                                                                </>
                                                                        )}
                                                                </button>

                                                                <button
                                                                        onClick={() => {
                                                                                if (confirm('确定要清空所有输入吗？')) {
                                                                                        setCourseData({
                                                                                                title: '',
                                                                                                description: '',
                                                                                                price: '',
                                                                                                cover: '',
                                                                                                videoUrl: '',
                                                                                                instructor: '',
                                                                                                category: 'blockchain',
                                                                                                duration: '',
                                                                                                level: 'beginner',
                                                                                                tags: []
                                                                                        });
                                                                                }
                                                                        }}
                                                                        className="btn-secondary"
                                                                >
                                                                        重置
                                                                </button>
                                                        </div>
                                                </div>
                                        </div>

                                        {/* 右侧：预览和提示 */}
                                        <div className="w-80 hidden lg:block">
                                                <div className="sticky top-8 space-y-6">
                                                        {/* 课程预览 */}
                                                        {previewMode && (
                                                                <div>
                                                                        <h3 className="font-semibold mb-4">课程预览</h3>
                                                                        <PreviewCard />
                                                                </div>
                                                        )}


                                                        {/* 收益预估 */}
                                                        <div className="card p-4">
                                                                <h3 className="font-semibold mb-3">📈 收益预估</h3>
                                                                {courseData.price && (
                                                                        <div className="space-y-2 text-sm">
                                                                                <div className="flex justify-between">
                                                                                        <span className="text-gray-600">课程价格:</span>
                                                                                        <span className="font-medium">{courseData.price} DD</span>
                                                                                </div>
                                                                                <div className="flex justify-between">
                                                                                        <span className="text-gray-600">平台费用 (5%):</span>
                                                                                        <span className="text-red-600">-{(parseFloat(courseData.price || 0) * 0.05).toFixed(3)} DD</span>
                                                                                </div>
                                                                                <div className="border-t pt-2 flex justify-between font-semibold">
                                                                                        <span>您的收益:</span>
                                                                                        <span className="text-green-600">{(parseFloat(courseData.price || 0) * 0.95).toFixed(3)} DD</span>
                                                                                </div>

                                                                                <div className="mt-3 pt-3 border-t">
                                                                                        <p className="text-xs text-gray-500">
                                                                                                假设售出 10 份，您将获得约 <span className="font-medium">{(parseFloat(courseData.price || 0) * 0.95 * 10).toFixed(2)} DD</span>
                                                                                        </p>
                                                                                </div>
                                                                        </div>
                                                                )}
                                                        </div>
                                                </div>
                                        </div>
                                </div>
                        </div>
                </div>
        );
};

export default CreateCoursePage;