// 内存存储 - 在实际环境中替换为localStorage
class MemoryStorage {
        constructor() {
                this.data = {
                        courses: {},
                        userProfiles: {},
                        userPurchases: {},
                        settings: {}
                };
        }

        // 课程相关
        saveCourse(courseId, courseData) {
                this.data.courses[courseId] = {
                        ...courseData,
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString()
                };
        }

        getCourse(courseId) {
                return this.data.courses[courseId] || null;
        }

        getAllCourses() {
                return Object.values(this.data.courses);
        }

        // 用户资料相关
        saveUserProfile(address, profile) {
                if (!this.data.userProfiles[address]) {
                        this.data.userProfiles[address] = {};
                }
                this.data.userProfiles[address] = {
                        ...this.data.userProfiles[address],
                        ...profile,
                        updatedAt: new Date().toISOString()
                };
        }

        getUserProfile(address) {
                return this.data.userProfiles[address] || {};
        }

        // 购买记录相关
        addUserPurchase(address, courseId, purchaseData) {
                if (!this.data.userPurchases[address]) {
                        this.data.userPurchases[address] = [];
                }

                const purchase = {
                        courseId,
                        ...purchaseData,
                        purchasedAt: new Date().toISOString()
                };

                this.data.userPurchases[address].push(purchase);
        }

        getUserPurchases(address) {
                return this.data.userPurchases[address] || [];
        }

        hasUserPurchased(address, courseId) {
                const purchases = this.getUserPurchases(address);
                return purchases.some(purchase => purchase.courseId === courseId);
        }

        // 设置相关
        saveSetting(key, value) {
                this.data.settings[key] = value;
        }

        getSetting(key, defaultValue = null) {
                return this.data.settings[key] || defaultValue;
        }

        // 调试方法
        getAllData() {
                return this.data;
        }

        clearAll() {
                this.data = {
                        courses: {},
                        userProfiles: {},
                        userPurchases: {},
                        settings: {}
                };
        }
}

// 创建单例实例
const memoryStorage = new MemoryStorage();

// 在实际环境中，将以下函数替换为localStorage操作
export const storage = {
        // 课程相关
        saveCourse: (courseId, courseData) => memoryStorage.saveCourse(courseId, courseData),
        getCourse: (courseId) => memoryStorage.getCourse(courseId),
        getAllCourses: () => memoryStorage.getAllCourses(),

        // 用户资料相关
        saveUserProfile: (address, profile) => memoryStorage.saveUserProfile(address, profile),
        getUserProfile: (address) => memoryStorage.getUserProfile(address),

        // 购买记录相关
        addUserPurchase: (address, courseId, purchaseData) => memoryStorage.addUserPurchase(address, courseId, purchaseData),
        getUserPurchases: (address) => memoryStorage.getUserPurchases(address),
        hasUserPurchased: (address, courseId) => memoryStorage.hasUserPurchased(address, courseId),

        // 设置相关
        saveSetting: (key, value) => memoryStorage.saveSetting(key, value),
        getSetting: (key, defaultValue) => memoryStorage.getSetting(key, defaultValue),

        // 签名相关（新增）
        saveSignatureData: (address, signatureData) => saveSignatureData(address, signatureData),
        getSignatureData: (address) => getSignatureData(address),
        clearSignatureData: (address) => clearSignatureData(address),

        // 工具方法
        clearAll: () => memoryStorage.clearAll(),
        getAllData: () => memoryStorage.getAllData()
};

// 示例数据初始化
export const initializeExampleData = () => {
        // 添加示例课程
        const exampleCourses = [
                {
                        id: 1,
                        title: "区块链基础入门",
                        description: "从零开始学习区块链技术的基本概念和原理",
                        cover: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=400&h=300&fit=crop",
                        instructor: "张教授",
                        price: "0.5",
                        videoUrl: "https://example.com/video1.mp4"
                },
                {
                        id: 2,
                        title: "智能合约开发实战",
                        description: "学习Solidity语言，掌握智能合约开发技能",
                        cover: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop",
                        instructor: "李工程师",
                        price: "1.2",
                        videoUrl: "https://example.com/video2.mp4"
                },
                {
                        id: 3,
                        title: "DeFi协议设计与实现",
                        description: "深入了解去中心化金融协议的设计理念和实现方法",
                        cover: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=400&h=300&fit=crop",
                        instructor: "王博士",
                        price: "2.0",
                        videoUrl: "https://example.com/video3.mp4"
                }
        ];

        exampleCourses.forEach(course => {
                memoryStorage.saveCourse(course.id, course);
        });
};

// 保存签名数据
export const saveSignatureData = (address, signatureData) => {
        const key = `signature_${address}`;
        localStorage.setItem(key, JSON.stringify(signatureData));
};

// 获取签名数据
export const getSignatureData = (address) => {
        const key = `signature_${address}`;
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
};

// 清除签名数据
export const clearSignatureData = (address) => {
        const key = `signature_${address}`;
        localStorage.removeItem(key);
};