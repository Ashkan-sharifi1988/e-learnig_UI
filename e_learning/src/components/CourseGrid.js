import React, { useState, useEffect, useContext } from "react";
import "../assets/CourseGrid.css";
import "../assets/Pagination.css";
import { FaHeart, FaThumbsUp, FaShoppingCart } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import config from "../config";
import noImageCourse from "../assets/Images/No-Image-Course.png";
import api from "../api/api";
import "../assets/Spiner.css";
import { Basket } from "../context/Basket"; // Imported Basket context
import LoginPrompt from "../components/LoginPrompt";
import noImageProfile from '../assets/Images/No-Image-Profile.png';

const CourseGrid = ({ fetchService,isAuthenticated,userId }) => {
    const navigate = useNavigate();
    const [courses, setCourses] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(true); // Prevent showing stale data
    const rowsPerPage = 6; // Number of courses per page
    const [action, setAction] = useState("");

    const { addToBasket } = useContext(Basket); // Access addToBasket from Basket context
    const [showLoginPrompt, setShowLoginPrompt] = useState(false);

    // Fetch courses with stats (likes, like status, favorite status) from backend
    useEffect(() => {
        const fetchCourses = async () => {
            try {
                setLoading(true);
                const data = await fetchService(userId);
                setCourses(data);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching courses:", error);
                setLoading(false);
            }
        };

        fetchCourses();
    }, [userId,fetchService]);
    const handleOpenLoginPrompt = (actionName) => {
        setAction(actionName);
        setShowLoginPrompt(true);
    };

    // Handle liking or unliking a course
    const handleLike = async (courseID) => {
        if (!isAuthenticated) {
            handleOpenLoginPrompt("like");
            return;
        }
        try {
            const response = await api.post(`/CourseLikes/toggle-like/${courseID}/${userId}`);
            const message = response.data?.message || "No message received";

            setCourses((prevCourses) =>
                prevCourses.map((course) =>
                    course.courseID === courseID
                        ? {
                              ...course,
                              totalLikes:
                                  message.includes("added")
                                      ? course.totalLikes + 1
                                      : Math.max(course.totalLikes - 1, 0),
                              isLikedByUser: message.includes("added"),
                          }
                        : course
                )
            );
        } catch (error) {
            console.error("Error toggling like:", error);
        }
    };

    // Handle favoriting or unfavoriting a course
    const handleFavorite = async (courseID) => {
        if (!isAuthenticated) {
            handleOpenLoginPrompt("Favorite");
            return;
        }
        try {
            const response = await api.post(`/CourseFavourites/toggle-Favourite/${courseID}/${userId}`);
            const message = response.data?.message || "No message received";

            setCourses((prevCourses) =>
                prevCourses.map((course) =>
                    course.courseID === courseID
                        ? { ...course, isFavoritedByUser: message.includes("added") }
                        : course
                )
            );
        } catch (error) {
            console.error("Error toggling favorite:", error);
        }
    };

    // Pagination logic
    const indexOfLastRow = currentPage * rowsPerPage;
    const indexOfFirstRow = indexOfLastRow - rowsPerPage;
    const currentCourses = courses.slice(indexOfFirstRow, indexOfLastRow);
    const totalPages = Math.ceil(courses.length / rowsPerPage);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    const truncateText = (text, wordLimit) => {
        const words = text.split(" ");
        return words.length > wordLimit
            ? `${words.slice(0, wordLimit).join(" ")}...`
            : text;
    };

    const calculateDiscountedPrice = (cost, discount) => {
        if (!cost || !discount) return null;
        const discountAmount = (cost * discount) / 100;
        return (cost - discountAmount).toFixed(2);
    };

    const logUserActivity = async (userId, courseID) => {
        const activity = {
            userId,
            action: 'Click',
            entity: 'Course',
            entityID: courseID.toString(),
            additionalData: null,
        };
    
        try {
            await api.post('/UserActivity', activity);
            console.log('User activity logged successfully.');
        } catch (error) {
            console.error('Error logging user activity:', error);
        }
    };

    const handleCourseClick = (courseID) => {

       logUserActivity(userId, courseID);
        navigate(`/course/${courseID}/sessions`);
    };
    const handleLogin = () => {
        setShowLoginPrompt(false);
        navigate("/login", { state: { from: "/" } });
    };

    return (
        
        <div className="course-grid-container">
             <LoginPrompt
                show={showLoginPrompt}
                onHide={() => setShowLoginPrompt(false)}
                onLogin={handleLogin}
                action={action}
            />
            {loading ? (
                <div className="spinner-container">
                    <div className="spinner"></div>
                </div>
            ) : (
                <>
                    <div className="course-grid">
                        {currentCourses.map((course) => (
                            <div
                                key={course.courseID}
                                className="course-card"
                                onClick={() => handleCourseClick(course.courseID)}
                                aria-label={`View sessions for ${course.courseName}`}
                            >
                                <div className="course-image-container">
                                    <img
                                        src={
                                            course.coursePicture
                                                ? config.BaseUrl + course.coursePicture
                                                : noImageCourse
                                        }
                                        alt={`${course.courseName} Thumbnail`}
                                        className="course-image"
                                    />
                                    <div className="course-overlay">
                                        <div className="overlay-top-left"> {course.courseType ? "Online" : "Offline"}</div>
                                        <div className="overlay-bottom-right">
                                            {course.courseDuration || "Duration not available"}
                                        </div>
                                        <div className="overlay-bottom-left">
                <img
                    src={course.instructorPicture ?  config.BaseUrl + course.instructorPicture  : noImageProfile}
                    // alt={course.InstructorUserName}
                    alt={''}
                    className="instructor-picture"
                />
                <span className="instructor-name">{course.instructorUserName}</span>
            </div>
                                    </div>
                                </div>
                                <div className="course-info">
                                <p className="course-name">
                                {course.courseName}
                                    </p>
                                    <p className="course-description">
                                        {truncateText(course.courseDescription, 20)}
                                        {course.courseDescription.split(" ").length > 20 && (
                                            <span className="read-more"> Read More</span>
                                        )}
                                    </p>
                                    <div className="course-meta">
                                        <div>
                                            <button
                                                className="like-btn"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleLike(course.courseID);
                                                }}
                                                aria-label="Like or Unlike this course"
                                            >
                                                <FaThumbsUp
                                                    className={`icon ${
                                                        course.isLikedByUser ? "liked" : ""
                                                    }`}
                                                />
                                            </button>
                                            <span>{course.totalLikes || 0} Likes</span>
                                        </div>
                                        <div className="course-price">
                                            {course.courseIsPaid ? (
                                                course.courseDiscount ? (
                                                    <>
                                                        <span className="original-price">
                                                            £{course.courseCost.toFixed(2)}
                                                        </span>
                                                        <span className="discounted-price">
                                                            £{calculateDiscountedPrice(
                                                                course.courseCost,
                                                                course.courseDiscount
                                                            )}
                                                        </span>
                                                    </>
                                                ) : (
                                                    <span className="price">
                                                        £{course.courseCost.toFixed(2)}
                                                    </span>
                                                )
                                            ) : (
                                                <span className="free-tag">Free</span>
                                            )}
                                        </div>
                                        <button
                                            className={`favorite-btn ${
                                                course.isFavoritedByUser ? "favorited" : ""
                                            }`}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleFavorite(course.courseID);
                                            }}
                                            aria-label={`${
                                                course.isFavoritedByUser ? "Unfavorite" : "Favorite"
                                            } this course`}
                                        >
                                            <FaHeart />
                                        </button>
                                    </div>
                                    {!course.courseIsFree && (
    course.isPurchased ? (
        <span className="purchased-tag">Purchased</span>
    ) : (
        <button
        className="basket-btn"
        onClick={(e) => {
            e.stopPropagation();
            if (!isAuthenticated) {
                handleOpenLoginPrompt("add to the basket");
                return;
            }
            addToBasket(course.courseID);
        }}
        aria-label="Add this course to the basket"
    >
        <FaShoppingCart /> Add to Basket
        </button>
    )
)}
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="pagination">
                        <button
                            className="page-btn"
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                        >
                            Previous
                        </button>
                        {[...Array(totalPages).keys()].map((number) => (
                            <button
                                key={number + 1}
                                className={`page-btn ${
                                    currentPage === number + 1 ? "active" : ""
                                }`}
                                onClick={() => handlePageChange(number + 1)}
                            >
                                {number + 1}
                            </button>
                        ))}
                        <button
                            className="page-btn"
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                        >
                            Next
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

export default CourseGrid;
