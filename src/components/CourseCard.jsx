import React, { useState } from 'react';
import { CheckCircle, ShoppingCart, User, Clock, Star, Play } from 'lucide-react';
import { ethers } from 'ethers';
import { storage } from '../utils/storage';

const CourseCard = ({ course, onPurchase, hasPurchased = false, showDetails = false }) => {
        const [imageLoaded, setImageLoaded] = useState(false);
        const [imageError, setImageError] = useState(false);

        // 从存储中获取课程详细信息
        const courseDetails = storage.getCourse(course.id) || {
                title: `课程 #${course.id}`,
                description: '暂无描述',
                cover: 'https://via.placeholder.com/400x250/6366f1/ffffff?text=Course+Image',
                instructor: '未知讲师',
                videoUrl: '',
                duration: '待定'
        };

        // 格式化价格
        const formatPrice = (price) => {
                try {
                        const formatted = ethers.formatEther(price);
                        return parseFloat(formatted).toFixed(4);
                } catch {
                        return '0.0000';
                }
        };

        // 格式化购买次数
        const formatPurchaseCount = (count) => {
                const num = parseInt(count?.toString() || '0');
                if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
                return num.toString();
        };

        // 处理图片加载错误
        const handleImageError = () => {
                setImageError(true);
                setImageLoaded(true);
        };

        // 处理购买按钮点击
        const handlePurchaseClick = () => {
                onPurchase(course, courseDetails);
        };

        // 处理学习按钮点击
        const handleLearnClick = () => {
                if (courseDetails.videoUrl) {
                        window.open(courseDetails.videoUrl, '_blank');
                } else {
                        alert('视频链接暂未配置');
                }
        };

        return (
                <div className="card group hover:scale-105 transition-transform duration-300">
                        {/* 课程封面 */}
                        <div className="relative overflow-hidden">
                                {!imageLoaded && (
                                        <div className="w-full h-48 bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse flex items-center justify-center">
                                                <div className="text-gray-400">加载中...</div>
                                        </div>
                                )}

                                <img
                                        src={imageError ? 'https://via.placeholder.com/400x250/6366f1/ffffff?text=No+Image' : courseDetails.cover}
                                        alt={courseDetails.title}
                                        className={`w-full h-48 object-cover transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'
                                                }`}
                                        onLoad={() => setImageLoaded(true)}
                                        onError={handleImageError}
                                />

                                {/* 悬停时的播放按钮覆盖层 */}
                                {hasPurchased && (
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                                <button
                                                        onClick={handleLearnClick}
                                                        className="bg-white text-blue-600 p-3 rounded-full shadow-lg transform scale-90 group-hover:scale-100 transition-transform duration-300"
                                                >
                                                        <Play size={24} fill="currentColor" />
                                                </button>
                                        </div>
                                )}

                                {/* 已购买标识 */}
                                {hasPurchased && (
                                        <div className="absolute top-3 right-3 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1">
                                                <CheckCircle size={12} />
                                                <span>已购买</span>
                                        </div>
                                )}
                        </div>

                        {/* 课程信息 */}
                        <div className="p-6">
                                {/* 标题 */}
                                <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                                        {courseDetails.title}
                                </h3>

                                {/* 讲师信息 */}
                                <div className="flex items-center text-sm text-gray-600 mb-3">
                                        <User size={14} className="mr-1" />
                                        <span className="font-medium">{courseDetails.instructor}</span>
                                        {courseDetails.duration && (
                                                <>
                                                        <span className="mx-2">•</span>
                                                        <Clock size={14} className="mr-1" />
                                                        <span>{courseDetails.duration}</span>
                                                </>
                                        )}
                                </div>

                                {/* 课程描述 */}
                                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                                        {courseDetails.description}
                                </p>

                                {/* 统计信息 */}
                                <div className="flex items-center justify-between mb-4">
                                        {/* 价格 */}
                                        <div className="flex items-center">
                                                <span className="text-2xl font-bold text-blue-600">
                                                        {formatPrice(course.price)}
                                                </span>
                                                <span className="text-sm text-gray-500 ml-1">DD</span>
                                        </div>

                                        {/* 购买统计和评分 */}
                                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                                                <div className="flex items-center">
                                                        <span>{formatPurchaseCount(course.purchaseCount)} 人购买</span>
                                                </div>
                                                {/* 可以添加评分功能 */}
                                                <div className="flex items-center">
                                                        <Star size={14} className="text-yellow-400 mr-1" fill="currentColor" />
                                                        <span>4.8</span>
                                                </div>
                                        </div>
                                </div>

                                {/* 操作按钮 */}
                                <div className="space-y-2">
                                        {hasPurchased ? (
                                                <>
                                                        <button
                                                                onClick={handleLearnClick}
                                                                className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white py-3 rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all duration-200 font-medium flex items-center justify-center space-x-2"
                                                        >
                                                                <Play size={16} />
                                                                <span>开始学习</span>
                                                        </button>

                                                        {showDetails && (
                                                                <button className="w-full btn-secondary text-sm py-2">
                                                                        查看详情
                                                                </button>
                                                        )}
                                                </>
                                        ) : (
                                                <button
                                                        onClick={handlePurchaseClick}
                                                        className="w-full btn-primary flex items-center justify-center space-x-2 group/btn"
                                                >
                                                        <ShoppingCart size={16} className="group-hover/btn:scale-110 transition-transform" />
                                                        <span>立即购买</span>
                                                </button>
                                        )}
                                </div>

                                {/* 课程特色标签（如果有的话） */}
                                {courseDetails.tags && courseDetails.tags.length > 0 && (
                                        <div className="mt-4 flex flex-wrap gap-2">
                                                {courseDetails.tags.slice(0, 3).map((tag, index) => (
                                                        <span
                                                                key={index}
                                                                className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                                                        >
                                                                {tag}
                                                        </span>
                                                ))}
                                        </div>
                                )}
                        </div>
                </div>
        );
};

export default CourseCard;