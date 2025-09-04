import React, { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { BookOpen, Search, Filter, TrendingUp, Star } from 'lucide-react';
import CourseCard from '../components/CourseCard';
import TokenSwap from '../components/TokenSwap';
import { storage, initializeExampleData } from '../utils/storage';
import { ethers } from 'ethers';
import { useWeb3University } from './../utils/useWeb3University'



const HomePage = () => {
        const { address, isConnected } = useAccount();
        const [searchTerm, setSearchTerm] = useState('');
        const [purchasedCourses, setPurchasedCourses] = useState(new Set());
        const { useActiveCourses } = useWeb3University()
        const filteredAndSortedCourses = []



        const {
                data: activeCourses,
                // isLoading,
                // error
        } = useActiveCourses();
        console.log('activeCourses---', activeCourses)







        return (
                <div className="min-h-screen gradient-bg">
                        <div className="container mx-auto px-4 py-8">
                                <div className="flex gap-8">
                                        {/* 左侧：课程列表 */}
                                        <div className="flex-1">

                                                {/* 课程网格 */}
                                                {activeCourses?.length === 0 ? (
                                                        <div className="card p-12 text-center">
                                                                <BookOpen className="mx-auto mb-4 text-gray-400" size={64} />
                                                                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                                                        {searchTerm ? '未找到相关课程' : '暂无课程'}
                                                                </h3>
                                                                <p className="text-gray-600">
                                                                        {searchTerm
                                                                                ? '尝试使用不同的关键词进行搜索'
                                                                                : '课程正在准备中，敬请期待'}
                                                                </p>
                                                                {searchTerm && (
                                                                        <button
                                                                                onClick={() => setSearchTerm('')}
                                                                                className="mt-4 btn-primary"
                                                                        >
                                                                                清除搜索
                                                                        </button>
                                                                )}
                                                        </div>
                                                ) : (
                                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                                                {activeCourses?.map((course) => (
                                                                        <CourseCard
                                                                                key={course.id.toString()}
                                                                                course={course}
                                                                                // onPurchase={handlePurchaseCourse}
                                                                                hasPurchased={purchasedCourses.has(course.id.toString())}
                                                                                showDetails={true}
                                                                        />
                                                                ))}
                                                        </div>
                                                )}

                                        </div>

                                        {/* 右侧：代币兑换 */}
                                        <div className="w-80 hidden lg:block">
                                                <div className="sticky top-8">
                                                        <TokenSwap />
                                                </div>
                                        </div>
                                </div>
                        </div>
                </div>
        );
};

export default HomePage;