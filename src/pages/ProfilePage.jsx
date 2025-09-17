import React, { useState, useEffect } from 'react';
import { useAccount, useSignMessage, useBalance, useContractRead } from 'wagmi';
import { User, Edit3, Save, X, BookOpen, Trophy, Clock, Shield, Copy, ExternalLink, CheckCircle, AlertCircle } from 'lucide-react';
import CourseCard from '../components/CourseCard';
import { storage } from '../utils/storage';
import { UNIVERSITY_ABI, getContractAddress } from '../config/contracts';

const ProfilePage = () => {
        const { address } = useAccount();
        const [userProfile, setUserProfile] = useState({
                name: '',
                bio: '',
                avatar: '',
                email: '',
                website: '',
                twitter: ''
        });
        const [isEditing, setIsEditing] = useState(false);
        const [tempProfile, setTempProfile] = useState({ ...userProfile });
        const [purchasedCourses, setPurchasedCourses] = useState([]);
        const [loading, setLoading] = useState(true);
        const [activeTab, setActiveTab] = useState('courses'); // courses, achievements, settings

        const { data: ethBalance } = useBalance({ address });
        const { data: ddBalance } = useBalance({
                address,
                token: getContractAddress(1, 'DD_TOKEN')
        });

        // 获取用户购买的课程
        const { data: userPurchaseIds } = useContractRead({
                address: getContractAddress(1, 'UNIVERSITY'),
                abi: UNIVERSITY_ABI,
                functionName: 'getUserPurchases',
                args: address ? [address] : undefined,
                enabled: !!address,
        });

        const [signatureStatus, setSignatureStatus] = useState({
                signed: false,
                valid: false,
                timestamp: null,
                expiresAt: null
        });

        // 签名消息hook
        const { signMessage, data: signature, isError: signError, isLoading: isSignLoading } = useSignMessage();
        // 检查签名状态
        const checkSignatureStatus = () => {
                if (!address) return;

                console.log(address, 'address----')
                console.log(storage, 'storage----')
                const signatureData = storage.getSignatureData(address);

                if (!signatureData) {
                        setSignatureStatus({
                                signed: false,
                                valid: false,
                                timestamp: null,
                                expiresAt: null
                        });
                        return;
                }

                const now = new Date();
                const expiresAt = new Date(signatureData.expiresAt);
                const isValid = expiresAt > now;

                setSignatureStatus({
                        signed: true,
                        valid: isValid,
                        timestamp: signatureData.timestamp,
                        expiresAt: signatureData.expiresAt
                });
        };

        // 加载用户资料和签名状态
        useEffect(() => {
                if (address) {
                        const savedProfile = storage.getUserProfile(address);
                        setUserProfile({ ...userProfile, ...savedProfile });
                        setTempProfile({ ...userProfile, ...savedProfile });

                        // 检查签名状态
                        checkSignatureStatus();

                        // 模拟购买的课程数据
                        const mockPurchases = [
                                {
                                        id: 1,
                                        purchasedAt: new Date(Date.now() - 86400000).toISOString(),
                                        progress: 75
                                },
                                {
                                        id: 2,
                                        purchasedAt: new Date(Date.now() - 172800000).toISOString(),
                                        progress: 30
                                }
                        ];
                        setPurchasedCourses(mockPurchases);
                }
                setLoading(false);
        }, [address]);

        // 监听签名结果
        useEffect(() => {
                if (signature) {
                        // 计算过期时间（例如7天后）
                        const now = new Date();
                        const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

                        // 保存签名数据
                        storage.saveSignatureData(address, {
                                signature,
                                timestamp: now.toISOString(),
                                expiresAt: expiresAt.toISOString()
                        });

                        // 更新签名状态
                        checkSignatureStatus();

                        // 保存用户资料
                        storage.saveUserProfile(address, tempProfile);
                        setUserProfile({ ...tempProfile });
                        setIsEditing(false);

                        alert('资料更新成功！');
                }
                if (signError) {
                        alert('签名失败，请重试');
                }
        }, [signature, signError]);

        // 处理签名和保存
        const handleSignAndSave = async () => {
                try {
                        const message = `更新用户资料\n地址: ${address}\n时间: ${new Date().toISOString()}\n姓名: ${tempProfile.name}`;
                        await signMessage({ message });
                } catch (error) {
                        console.error('签名失败:', error);
                        alert('签名失败，请重试');
                }
        };

        // 格式化时间显示
        const formatTime = (dateString) => {
                if (!dateString) return '未知';

                const date = new Date(dateString);
                return date.toLocaleString('zh-CN');
        };

        // 获取剩余时间
        const getRemainingTime = () => {
                if (!signatureStatus.expiresAt) return '';

                const now = new Date();
                const expiresAt = new Date(signatureStatus.expiresAt);
                const diffMs = expiresAt - now;

                if (diffMs <= 0) return '已过期';

                const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
                const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

                return `${diffDays}天${diffHours}小时后过期`;
        };

        // 取消编辑
        const handleCancelEdit = () => {
                setTempProfile({ ...userProfile });
                setIsEditing(false);
        };

        // 更新临时资料
        const updateTempProfile = (field, value) => {
                setTempProfile(prev => ({
                        ...prev,
                        [field]: value
                }));
        };

        // 复制地址
        const copyAddress = () => {
                navigator.clipboard.writeText(address);
                alert('地址已复制到剪贴板');
        };

        // 在浏览器中查看
        const viewInExplorer = () => {
                window.open(`https://etherscan.io/address/${address}`, '_blank');
        };

        // 获取用户统计信息
        const userStats = {
                totalCourses: purchasedCourses.length,
                completedCourses: purchasedCourses.filter(course => course.progress === 100).length,
                totalProgress: purchasedCourses.length > 0
                        ? Math.round(purchasedCourses.reduce((sum, course) => sum + course.progress, 0) / purchasedCourses.length)
                        : 0,
                studyDays: 15 // 模拟学习天数
        };

        if (loading) {
                return (
                        <div className="min-h-screen gradient-bg flex items-center justify-center">
                                <div className="text-center">
                                        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                                        <p className="text-gray-600">加载个人资料中...</p>
                                </div>
                        </div>
                );
        }

        return (
                <div className="min-h-screen gradient-bg py-8">
                        <div className="container mx-auto px-4 max-w-6xl">

                                {/* 签名状态指示器 */}
                                <div className="mb-6">
                                        <div className={`flex items-center p-4 rounded-lg ${signatureStatus.valid
                                                ? 'bg-green-50 border border-green-200'
                                                : 'bg-yellow-50 border border-yellow-200'}`}>
                                                <div className="mr-3">
                                                        {signatureStatus.valid ? (
                                                                <CheckCircle className="text-green-500" size={24} />
                                                        ) : (
                                                                <AlertCircle className="text-yellow-500" size={24} />
                                                        )}
                                                </div>
                                                <div className="flex-1">
                                                        <h3 className="font-medium">
                                                                {signatureStatus.signed
                                                                        ? signatureStatus.valid ? '签名有效'
                                                                                : '签名已过期'
                                                                        : '未签名'}
                                                        </h3>
                                                        <p className="text-sm text-gray-600">
                                                                {signatureStatus.signed ? (
                                                                        <>
                                                                                签名时间: {formatTime(signatureStatus.timestamp)}
                                                                                <br />
                                                                                {signatureStatus.valid ? (
                                                                                        <>有效期剩余: {getRemainingTime()}</>
                                                                                ) : (
                                                                                        <>签名已于 {formatTime(signatureStatus.expiresAt)} 过期</>
                                                                                )}
                                                                        </>
                                                                ) : (
                                                                        '您需要签名以验证身份并保存个人资料'
                                                                )}
                                                        </p>
                                                </div>{!signatureStatus.valid && (
                                                        <button
                                                                onClick={handleSignAndSave}
                                                                disabled={isSignLoading}
                                                                className="btn-primary ml-4"
                                                        >
                                                                {isSignLoading ? '签名中...' : '立即签名'}
                                                        </button>
                                                )}
                                        </div>
                                </div>

                                {/* 个人信息卡片 */}
                                <div className="card p-6 mb-8">
                                        <div className="flex flex-col lg:flex-row gap-6">
                                                {/* 左侧：头像和基本信息 */}
                                                <div className="lg:w-1/3">
                                                        <div className="text-center">
                                                                {/* 头像 */}
                                                                <div className="relative inline-block mb-4">
                                                                        <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                                                                                {userProfile.name ? userProfile.name.charAt(0).toUpperCase() : address?.slice(2, 4).toUpperCase()}
                                                                        </div>
                                                                        {isEditing && (
                                                                                <button className="absolute bottom-0 right-0 bg-blue-500 text-white rounded-full p-2 hover:bg-blue-600 transition-colors">
                                                                                        <Edit3 size={16} />
                                                                                </button>
                                                                        )}
                                                                </div>

                                                                {/* 姓名 */}
                                                                {isEditing ? (
                                                                        <input
                                                                                type="text"
                                                                                value={tempProfile.name}
                                                                                onChange={(e) => updateTempProfile('name', e.target.value)}
                                                                                placeholder="输入您的姓名"
                                                                                className="input-field text-center mb-2"
                                                                        />
                                                                ) : (
                                                                        <h2 className="text-xl font-bold text-gray-900 mb-2">
                                                                                {userProfile.name || '未设置姓名'}
                                                                        </h2>
                                                                )}

                                                                {/* 地址 */}
                                                                <div className="flex items-center justify-center space-x-2 text-sm text-gray-600 mb-4">
                                                                        <span className="font-mono">{address?.slice(0, 8)}...{address?.slice(-6)}</span>
                                                                        <button onClick={copyAddress} className="text-blue-500 hover:text-blue-600">
                                                                                <Copy size={14} />
                                                                        </button>
                                                                        <button onClick={viewInExplorer} className="text-blue-500 hover:text-blue-600">
                                                                                <ExternalLink size={14} />
                                                                        </button>
                                                                </div>

                                                                {/* 钱包余额 */}
                                                                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                                                                        <div className="flex justify-between text-sm">
                                                                                <span className="text-gray-600">ETH 余额:</span>
                                                                                <span className="font-medium">{ethBalance?.formatted ? parseFloat(ethBalance.formatted).toFixed(4) : '0.0000'}</span>
                                                                        </div>
                                                                        <div className="flex justify-between text-sm">
                                                                                <span className="text-gray-600">DD 余额:</span>
                                                                                <span className="font-medium">{ddBalance?.formatted ? parseFloat(ddBalance.formatted).toFixed(4) : '0.0000'}</span>
                                                                        </div>
                                                                </div>
                                                        </div>
                                                </div>


                                                {/* 右侧：详细信息和统计 */}
                                                <div className="lg:w-2/3">
                                                        {/* 编辑按钮 */}
                                                        <div className="flex justify-end mb-4">
                                                                {isEditing ? (
                                                                        <div className="flex space-x-2">
                                                                                <button
                                                                                        onClick={handleSignAndSave}
                                                                                        disabled={isSignLoading || !signatureStatus.valid}
                                                                                        className="flex items-center space-x-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
                                                                                        title={!signatureStatus.valid ? "签名已过期，请重新签名" : ""}
                                                                                >
                                                                                        <Save size={16} />
                                                                                        <span>{isSignLoading ? '签名中...' : '签名保存'}</span>
                                                                                </button>
                                                                                <button
                                                                                        onClick={handleCancelEdit}
                                                                                        className="flex items-center space-x-2 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                                                                                ></button> <X size={16} />
                                                                                <span>取消</span>

                                                                        </div>
                                                                ) : (
                                                                        <button
                                                                                onClick={() => setIsEditing(true)}
                                                                                className="flex items-center space-x-2 btn-primary"
                                                                        >
                                                                                <Edit3 size={16} />
                                                                                <span>编辑资料</span>
                                                                        </button>
                                                                )}
                                                        </div>


                                                </div>
                                        </div>

                                        {/* 标签页 */}
                                        <div className="card">
                                                {/* 标签头 */}
                                                <div className="border-b border-gray-200">
                                                        <div className="flex space-x-8 px-6">
                                                                {[
                                                                        { key: 'courses', label: '我的课程', icon: BookOpen },
                                                                        { key: 'achievements', label: '成就', icon: Trophy },
                                                                        { key: 'settings', label: '设置', icon: User }
                                                                ].map(({ key, label, icon: Icon }) => (
                                                                        <button
                                                                                key={key}
                                                                                onClick={() => setActiveTab(key)}
                                                                                className={`flex items-center space-x-2 py-4 px-2 border-b-2 transition-colors ${activeTab === key
                                                                                        ? 'border-blue-500 text-blue-600'
                                                                                        : 'border-transparent text-gray-500 hover:text-gray-700'
                                                                                        }`}
                                                                        >
                                                                                <Icon size={18} />
                                                                                <span>{label}</span>
                                                                        </button>
                                                                ))}
                                                        </div>
                                                </div>

                                                {/* 标签内容 */}
                                                <div className="p-6">
                                                        {activeTab === 'courses' && (
                                                                <div>
                                                                        <h3 className="text-lg font-semibold mb-4">我的课程</h3>

                                                                        {purchasedCourses.length === 0 ? (
                                                                                <div className="text-center py-12">
                                                                                        <BookOpen className="mx-auto mb-4 text-gray-400" size={64} />
                                                                                        <h4 className="text-xl font-semibold text-gray-900 mb-2">还没有购买课程</h4>
                                                                                        <p className="text-gray-600 mb-4">去首页看看有什么感兴趣的课程吧</p>
                                                                                        <button className="btn-primary">
                                                                                                浏览课程
                                                                                        </button>
                                                                                </div>
                                                                        ) : (
                                                                                <div className="space-y-4">
                                                                                        {purchasedCourses.map((purchase) => {
                                                                                                const courseDetails = storage.getCourse(purchase.id) || {};
                                                                                                return (
                                                                                                        <div key={purchase.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                                                                                                                <div className="flex items-center space-x-4">
                                                                                                                        <img
                                                                                                                                src={courseDetails.cover || 'https://via.placeholder.com/80x60'}
                                                                                                                                alt={courseDetails.title}
                                                                                                                                className="w-20 h-15 object-cover rounded"
                                                                                                                        />

                                                                                                                        <div className="flex-1">
                                                                                                                                <h4 className="font-semibold text-gray-900 mb-1">
                                                                                                                                        {courseDetails.title || `课程 #${purchase.id}`}
                                                                                                                                </h4>
                                                                                                                                <p className="text-sm text-gray-600 mb-2">
                                                                                                                                        讲师: {courseDetails.instructor || '未知'}
                                                                                                                                </p>

                                                                                                                                {/* 进度条 */}
                                                                                                                                <div className="flex items-center space-x-3">
                                                                                                                                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                                                                                                                                                <div
                                                                                                                                                        className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                                                                                                                                                        style={{ width: `${purchase.progress}%` }}
                                                                                                                                                ></div>
                                                                                                                                        </div>
                                                                                                                                        <span className="text-sm font-medium text-gray-600">
                                                                                                                                                {purchase.progress}%
                                                                                                                                        </span>
                                                                                                                                </div>
                                                                                                                        </div>

                                                                                                                        <div className="flex flex-col space-y-2">
                                                                                                                                <button className="btn-primary text-sm px-4 py-2">
                                                                                                                                        继续学习
                                                                                                                                </button>
                                                                                                                                <button className="btn-secondary text-sm px-4 py-2">
                                                                                                                                        查看详情
                                                                                                                                </button>
                                                                                                                        </div>
                                                                                                                </div>
                                                                                                        </div>
                                                                                                );
                                                                                        })}
                                                                                </div>
                                                                        )}
                                                                </div>
                                                        )}

                                                        {activeTab === 'achievements' && (
                                                                <div>
                                                                        <h3 className="text-lg font-semibold mb-4">我的成就</h3>

                                                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                                                {/* 成就徽章 */}
                                                                                {[
                                                                                        { title: '新手上路', description: '完成第一个课程', earned: true, icon: '🎯' },
                                                                                        { title: '学习达人', description: '连续学习7天', earned: true, icon: '🔥' },
                                                                                        { title: '知识探索者', description: '购买3门课程', earned: false, icon: '🚀' },
                                                                                        { title: '社区贡献者', description: '分享课程给朋友', earned: false, icon: '🤝' },
                                                                                        { title: '专家级', description: '完成10门课程', earned: false, icon: '🏆' },
                                                                                        { title: '课程创作者', description: '创建第一门课程', earned: false, icon: '✨' },
                                                                                ].map((achievement, index) => (
                                                                                        <div
                                                                                                key={index}
                                                                                                className={`p-4 border-2 border-dashed rounded-lg text-center transition-all ${achievement.earned
                                                                                                        ? 'border-green-300 bg-green-50'
                                                                                                        : 'border-gray-300 bg-gray-50'
                                                                                                        }`}
                                                                                        >
                                                                                                <div className={`text-3xl mb-2 ${achievement.earned ? '' : 'grayscale'}`}>
                                                                                                        {achievement.icon}
                                                                                                </div>
                                                                                                <h4 className={`font-semibold mb-1 ${achievement.earned ? 'text-green-800' : 'text-gray-500'
                                                                                                        }`}>
                                                                                                        {achievement.title}
                                                                                                </h4>
                                                                                                <p className={`text-sm ${achievement.earned ? 'text-green-600' : 'text-gray-400'
                                                                                                        }`}>
                                                                                                        {achievement.description}
                                                                                                </p>
                                                                                                {achievement.earned && (
                                                                                                        <div className="mt-2 text-green-600 font-medium text-xs">
                                                                                                                ✓ 已获得
                                                                                                        </div>
                                                                                                )}
                                                                                        </div>
                                                                                ))}
                                                                        </div>
                                                                </div>
                                                        )}

                                                        {activeTab === 'settings' && (
                                                                <div>
                                                                        <h3 className="text-lg font-semibold mb-4">账户设置</h3>

                                                                        <div className="space-y-6">
                                                                                {/* 通知设置 */}
                                                                                <div className="border border-gray-200 rounded-lg p-4">
                                                                                        <h4 className="font-medium mb-3">通知设置</h4>
                                                                                        <div className="space-y-3">
                                                                                                {[
                                                                                                        { label: '新课程推荐', key: 'newCourses' },
                                                                                                        { label: '学习提醒', key: 'studyReminder' },
                                                                                                        { label: '成就通知', key: 'achievements' },
                                                                                                        { label: '价格变动', key: 'priceAlerts' },
                                                                                                ].map((setting) => (
                                                                                                        <label key={setting.key} className="flex items-center space-x-3">
                                                                                                                <input
                                                                                                                        type="checkbox"
                                                                                                                        defaultChecked
                                                                                                                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                                                                                                />
                                                                                                                <span className="text-gray-700">{setting.label}</span>
                                                                                                        </label>
                                                                                                ))}
                                                                                        </div>
                                                                                </div>

                                                                                {/* 隐私设置 */}
                                                                                <div className="border border-gray-200 rounded-lg p-4">
                                                                                        <h4 className="font-medium mb-3">隐私设置</h4>
                                                                                        <div className="space-y-3">
                                                                                                {[
                                                                                                        { label: '公开学习进度', key: 'publicProgress' },
                                                                                                        { label: '允许其他用户查看我的课程', key: 'publicCourses' },
                                                                                                        { label: '接收社区消息', key: 'communityMessages' },
                                                                                                ].map((setting) => (
                                                                                                        <label key={setting.key} className="flex items-center space-x-3">
                                                                                                                <input
                                                                                                                        type="checkbox"
                                                                                                                        defaultChecked={setting.key !== 'communityMessages'}
                                                                                                                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                                                                                                />
                                                                                                                <span className="text-gray-700">{setting.label}</span>
                                                                                                        </label>
                                                                                                ))}
                                                                                        </div>
                                                                                </div>

                                                                                {/* 数据管理 */}
                                                                                <div className="border border-gray-200 rounded-lg p-4">
                                                                                        <h4 className="font-medium mb-3">数据管理</h4>
                                                                                        <div className="space-y-3">
                                                                                                <button className="text-blue-600 hover:text-blue-700 text-sm">
                                                                                                        导出我的数据
                                                                                                </button>
                                                                                                <br />
                                                                                                <button className="text-red-600 hover:text-red-700 text-sm">
                                                                                                        清除本地缓存
                                                                                                </button>
                                                                                        </div>
                                                                                </div>
                                                                        </div>
                                                                </div>
                                                        )}
                                                </div>
                                        </div>
                                </div>
                        </div>
                </div>
        );
}

export default ProfilePage;