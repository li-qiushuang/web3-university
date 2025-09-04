// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Web3University is Ownable {
    IERC20 public ddToken;

    struct Course {
        uint256 id;
        address author;
        uint256 price; // 价格以DD代币计算
        bool active;
        uint256 purchaseCount;
        uint256 createdAt;
    }

    struct Purchase {
        uint256 courseId;
        address buyer;
        uint256 purchasedAt;
        bool refunded;
    }

    mapping(uint256 => Course) public courses;
    mapping(uint256 => mapping(address => bool)) public hasPurchased;
    mapping(address => uint256[]) public userPurchases;
    mapping(uint256 => Purchase[]) public coursePurchases;

    uint256 public totalCourses;
    uint256 public constant PLATFORM_FEE_PERCENT = 5; // 5%平台费用

    event CourseCreated(
        uint256 indexed courseId,
        address indexed author,
        uint256 price
    );
    event CoursePurchased(
        uint256 indexed courseId,
        address indexed buyer,
        uint256 price
    );
    event TokensWithdrawn(address indexed to, uint256 amount);
    event CourseDeactivated(uint256 indexed courseId);

    constructor(address _ddToken) {
        ddToken = IERC20(_ddToken);
    }

    modifier validCourse(uint256 _courseId) {
        require(
            _courseId > 0 && _courseId <= totalCourses,
            "Invalid course ID"
        );
        require(courses[_courseId].active, "Course is not active");
        _;
    }

    /**
     * 创建课程（只有所有者可以调用）
     */
    function createCourse(
        address _author,
        uint256 _price
    ) external onlyOwner returns (uint256) {
        require(_author != address(0), "Invalid author address");
        require(_price > 0, "Price must be greater than 0");

        totalCourses++;

        courses[totalCourses] = Course({
            id: totalCourses,
            author: _author,
            price: _price,
            active: true,
            purchaseCount: 0,
            createdAt: block.timestamp
        });

        emit CourseCreated(totalCourses, _author, _price);
        return totalCourses;
    }

    /**
     * 购买课程
     */
    function purchaseCourse(uint256 _courseId) external validCourse(_courseId) {
        require(
            !hasPurchased[_courseId][msg.sender],
            "Already purchased this course"
        );

        Course storage course = courses[_courseId];
        uint256 price = course.price;

        // 检查用户DD代币余额
        require(
            ddToken.balanceOf(msg.sender) >= price,
            "Insufficient DD token balance"
        );

        // 转移DD代币到合约
        require(
            ddToken.transferFrom(msg.sender, address(this), price),
            "Token transfer failed"
        );

        // 记录购买
        hasPurchased[_courseId][msg.sender] = true;
        userPurchases[msg.sender].push(_courseId);

        Purchase memory purchase = Purchase({
            courseId: _courseId,
            buyer: msg.sender,
            purchasedAt: block.timestamp,
            refunded: false
        });

        coursePurchases[_courseId].push(purchase);
        courses[_courseId].purchaseCount++;

        emit CoursePurchased(_courseId, msg.sender, price);
    }

    /**
     * 检查用户是否已购买课程
     */
    function hasUserPurchased(
        uint256 _courseId,
        address _user
    ) external view returns (bool) {
        return hasPurchased[_courseId][_user];
    }

    /**
     * 获取用户购买的所有课程
     */
    function getUserPurchases(
        address _user
    ) external view returns (uint256[] memory) {
        return userPurchases[_user];
    }

    /**
     * 获取课程信息
     */
    function getCourse(
        uint256 _courseId
    ) external view returns (Course memory) {
        require(
            _courseId > 0 && _courseId <= totalCourses,
            "Invalid course ID"
        );
        return courses[_courseId];
    }

    /**
     * 获取所有活跃课程
     */
    function getActiveCourses() external view returns (Course[] memory) {
        uint256 activeCount = 0;

        // 计算活跃课程数量
        for (uint256 i = 1; i <= totalCourses; i++) {
            if (courses[i].active) {
                activeCount++;
            }
        }

        Course[] memory activeCourses = new Course[](activeCount);
        uint256 currentIndex = 0;

        for (uint256 i = 1; i <= totalCourses; i++) {
            if (courses[i].active) {
                activeCourses[currentIndex] = courses[i];
                currentIndex++;
            }
        }

        return activeCourses;
    }

    /**
     * 获取课程购买历史
     */
    function getCoursePurchases(
        uint256 _courseId
    ) external view returns (Purchase[] memory) {
        require(
            _courseId > 0 && _courseId <= totalCourses,
            "Invalid course ID"
        );
        return coursePurchases[_courseId];
    }

    /**
     * 作者提现收益（扣除平台费用）
     */
    function withdrawAuthorEarnings(uint256 _courseId) external {
        require(
            _courseId > 0 && _courseId <= totalCourses,
            "Invalid course ID"
        );
        require(
            courses[_courseId].author == msg.sender,
            "Only course author can withdraw"
        );

        Course storage course = courses[_courseId];
        uint256 totalEarnings = course.price * course.purchaseCount;
        uint256 platformFee = (totalEarnings * PLATFORM_FEE_PERCENT) / 100;
        uint256 authorEarnings = totalEarnings - platformFee;

        require(authorEarnings > 0, "No earnings to withdraw");

        // 重置购买计数以避免重复提现
        course.purchaseCount = 0;

        require(
            ddToken.transfer(msg.sender, authorEarnings),
            "Transfer failed"
        );

        emit TokensWithdrawn(msg.sender, authorEarnings);
    }

    /**
     * 平台提现（只有所有者可以调用）
     */
    function withdrawPlatformFees() external onlyOwner {
        uint256 balance = ddToken.balanceOf(address(this));
        require(balance > 0, "No tokens to withdraw");

        require(ddToken.transfer(owner(), balance), "Transfer failed");

        emit TokensWithdrawn(owner(), balance);
    }

    /**
     * 停用课程（只有所有者或作者可以调用）
     */
    function deactivateCourse(uint256 _courseId) external {
        require(
            _courseId > 0 && _courseId <= totalCourses,
            "Invalid course ID"
        );
        require(
            msg.sender == owner() || msg.sender == courses[_courseId].author,
            "Only owner or author can deactivate"
        );

        courses[_courseId].active = false;
        emit CourseDeactivated(_courseId);
    }

    /**
     * 更新DD代币合约地址（只有所有者可以调用）
     */
    function updateDDToken(address _newDDToken) external onlyOwner {
        require(_newDDToken != address(0), "Invalid token address");
        ddToken = IERC20(_newDDToken);
    }

    /**
     * 紧急提现功能（只有所有者可以调用）
     */
    function emergencyWithdraw() external onlyOwner {
        uint256 balance = ddToken.balanceOf(address(this));
        if (balance > 0) {
            require(ddToken.transfer(owner(), balance), "Transfer failed");
        }
    }
}
