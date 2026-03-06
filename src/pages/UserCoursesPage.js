import React, { useState, useEffect, useContext } from "react";
import { Modal, Button } from "react-bootstrap";
import { FaPlay, FaPaperclip } from "react-icons/fa"; // Import react-icons
import { AuthContext } from "../context/AuthContext";
import Layout from "../components/Layout";
import api from "../api/api";
import "../assets/CourseGrid.css";
import config from "../config";
import noImageCourse from "../assets/Images/No-Image-Course.png";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from 'react-toastify';
import "react-toastify/dist/ReactToastify.css"; // Import toast styles
import noImageProfile from '../assets/Images/No-Image-Profile.png';

const UserCourses = () => {
    const { userId, isAuthenticated, isLoading } = useContext(AuthContext);
    const [courses, setCourses] = useState([]);
    const [selectedAttachments, setSelectedAttachments] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 6; // Number of courses per page
    const navigate = useNavigate();

    useEffect(() => {
        if (isLoading) return; // Wait for authentication to resolve
        if (!isAuthenticated || !userId) {
            navigate("/login");
            return;
        }

        const fetchCourses = async () => {
            try {
                setLoading(true);
                const response = await api.get(`/UserCourse/Detailed/User/${userId}`);
                if (response.data?.length) {
                    setCourses(response.data);
                } else {
                    // Handle empty courses case
                    setCourses([]);
                }
            } catch (err) {
                if (err.response?.status === 404) {
                    // No courses found for the user
                    setCourses([]); // Treat it as an empty list
                } else {
                    setError(err.response?.data?.message || err.message || "Failed to fetch courses.");
                    toast.error(err.response?.data?.message || err.message || "Failed to fetch courses.");
                }
            } finally {
                setLoading(false);
            }
        };

        fetchCourses();
    }, [isLoading, isAuthenticated, userId, navigate]);

    const handleAttachmentClick = (e, attachments) => {
        e.stopPropagation(); // Prevent triggering course click
        setSelectedAttachments(attachments);
        setShowModal(true);
    };

    const handleCourseClick = (courseID) => {
        navigate(`/course/${courseID}/sessions`);
    };

    const handleExamRedirect = (examID) => {
        if (!examID) {
            toast.warn("Exam is not available for this course!");
            return;
        }
        navigate(`/ExamAttempt/${examID}`);
    };

    const indexOfLastRow = currentPage * rowsPerPage;
    const indexOfFirstRow = indexOfLastRow - rowsPerPage;
    const currentCourses = courses.slice(indexOfFirstRow, indexOfLastRow);
    const totalPages = Math.ceil(courses.length / rowsPerPage);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    if (isLoading || loading) {
        return (
            
            <Layout>
                 <ToastContainer />
                <div className="spinner-container" style={{ height: "50vh" }}>
                    <div className="spinner"></div>
                </div>
            </Layout>
        );
    }


    if (error) {
        return (
            <Layout>
                <div className="user-courses-container">
                    <p className="text-danger">Error: {error}</p>
                </div>
            </Layout>
        );
    }

    if (!courses.length) {
        return (
            <Layout>
            <div className=" text-center mt-4">
                <p>You have not purchased any courses yet.</p>
            </div>
        </Layout>
        );
    }

    return (
        <Layout>
            <div className="main-page">
                <h1>Your Purchased Courses</h1>
                <div className="course-grid-container">
                    <div className="course-grid">
                        {currentCourses.map((course) => (
                            <div
                                className="course-card"
                                key={course.courseID}
                                onClick={() => handleCourseClick(course.courseID)}
                            >
                                <div className="course-image-container">
                                    <img
                                        src={
                                            course.coursePicture
                                                ? config.BaseUrl + course.coursePicture
                                                : noImageCourse
                                        }
                                        alt={course.courseName}
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
                                    <h3>{course.courseName}</h3>
                                    <p className="course-description">
                                        {course.courseDescription || "No description available."}
                                    </p>
                                    <p>Category: {course.courseCategoryName || "Uncategorized"}</p>
                                    <div className="course-actions">
                                        <FaPaperclip
                                            className="clip-icon"
                                            onClick={(e) => handleAttachmentClick(e, course.attachments)}
                                            title="View Attachments"
                                            style={{ cursor: "pointer", fontSize: "1.5rem" }}
                                        />
                                        {course.examStartDateTime && (
                                            <Button
                                                variant="success"
                                                size="sm"
                                                className="ms-2"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleExamRedirect(course.examID);
                                                }}
                                            >
                                                <FaPlay /> Start Exam
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="pagination">
                        {[...Array(totalPages)].map((_, index) => (
                            <button
                                key={index}
                                className={`page-btn ${currentPage === index + 1 ? "active" : ""}`}
                                onClick={() => handlePageChange(index + 1)}
                            >
                                {index + 1}
                            </button>
                        ))}
                    </div>
                    {/* Modal for Attachments */}
                    <Modal show={showModal} onHide={() => setShowModal(false)}>
                        <Modal.Header closeButton>
                            <Modal.Title>Course Attachments</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            {selectedAttachments.length > 0 ? (
                                selectedAttachments.map((att) => (
                                    <div key={att.courseAttachmentID}>
                                        <a
                                            href={att.courseAttachmentURL}
                                            download
                                            className="attachment-link"
                                        >
                                            {att.courseAttachmentName}
                                        </a>
                                        <p>{att.courseAttachmentDescription}</p>
                                    </div>
                                ))
                            ) : (
                                <p>No attachments available.</p>
                            )}
                        </Modal.Body>
                    </Modal>
                </div>
            </div>
        </Layout>
    );
};

export default UserCourses;
