import { useState } from 'react';
// import { useAccount } from 'wagmi';
import { BookOpen, Loader2 } from 'lucide-react';
import CourseCard from '../components/CourseCard';
import TokenSwap from '../components/TokenSwap';
import { useWeb3University } from './../utils/useWeb3University'

const HomePage = () => {
        // const { address, isConnected } = useAccount();
        const [purchasedCourses, setPurchasedCourses] = useState(new Set());
        const { useActiveCourses } = useWeb3University()

        const {
                data: activeCourses,
                isLoading,
                error
        } = useActiveCourses();
        console.log('activeCourses---', activeCourses)


        return (
                <div className="min-h-screen gradient-bg">
                        <div className="container mx-auto px-4 py-8">
                                <div className="flex gap-8">
                                        {/* 左侧：课程列表 */}
                                        <div className="flex-1">

                                                {/* 加载状态 */}
                                                {isLoading && (
                                                        <div className="card p-12 text-center">
                                                                <Loader2 className="mx-auto mb-4 text-blue-500 animate-spin" size={64} />
                                                                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                                                        课程加载中...
                                                                </h3>
                                                                <p className="text-gray-600">请稍等片刻</p>
                                                        </div>
                                                )}
                                                {/* 错误状态 */}
                                                {error && (
                                                        <div className="card p-12 text-center">
                                                                <AlertCircle className="mx-auto mb-4 text-red-500" size={64} />
                                                                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                                                        加载课程失败
                                                                </h3>
                                                                <p className="text-gray-600 mb-4">{error.message || "未知错误"}</p>
                                                                <button
                                                                        className="btn-primary"
                                                                        onClick={() => window.location.reload()}
                                                                >
                                                                        重新加载
                                                                </button>
                                                        </div>
                                                )}
                                                {/* 正常状态 */}
                                                {!isLoading && !error && (
                                                        <>
                                                                {/* 课程网格 */}
                                                                {activeCourses?.length === 0 ? (
                                                                        <div className="card p-12 text-center">
                                                                                <BookOpen className="mx-auto mb-4 text-gray-400" size={64} />
                                                                                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                                                                        暂无课程
                                                                                </h3>
                                                                                <p className="text-gray-600">请稍后再来查看</p>
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
                                                                                ))} </div>
                                                                )}
                                                        </>
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