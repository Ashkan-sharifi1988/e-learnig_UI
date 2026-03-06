import React, { useEffect, useState, useContext } from "react";
import "../assets/CircleProgressTracker.css"; // Styles for the tracker
import noImageCourse from "../assets/Images/No-Image-Course.png";
import config from "../config";
import { useNavigate } from "react-router-dom";
import { FaLock, FaShoppingCart } from "react-icons/fa";
import api from "../api/api";
import { Basket } from "../context/Basket"; // Import Basket context

const CircleProgressTracker = ({ learningPath, userId = null }) => {
  const navigate = useNavigate();
  const { addToBasket } = useContext(Basket); // Use Basket context
  const [coursesWithStats, setCoursesWithStats] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCourseStats = async () => {
    try {
      setLoading(true);

      if (userId) {
        const response = await api.get(`/Course/GetLearningPathCourseStat`, {
          params: { userId, learningPathId: learningPath.learningPathID },
        });
        setCoursesWithStats(response?.data || []);
      } else {
        const detailedCourses = await Promise.all(
          learningPath.courses.map(async (course) => {
            const response = await api.get(`/Course/${course.courseID}`);
            return response?.data || course;
          })
        );
        setCoursesWithStats(detailedCourses);
      }
    } catch (error) {
      console.error("Error fetching course stats:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourseStats();
  }, [userId, learningPath]);

  const handleCircleClick = (courseID, isLocked, isPurchased) => {
    if (isLocked || (!isPurchased && userId)) return; // Prevent navigation if the course is locked or not purchased
    navigate(`/course/${courseID}/sessions`);
  };

  const handleAddToBasket = (courseID) => {
    if (!userId) {
      alert("Please log in to add courses to the basket.");
      return;
    }
    const confirmAdd = window.confirm("Do you want to add this course to your basket?");
    if (confirmAdd) {
      addToBasket(courseID);
    }
  };

  const currentProgressIndex = coursesWithStats.findIndex((course) => !course.hasPassed);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="circle-progress-container">
      {/* Learning Path Name and Course Count */}
      <div className="path-header">
        <h5 className="path-name">{learningPath.learningPathName}</h5>
        <span className="course-count">
          {learningPath.courses.length} Course
          {learningPath.courses.length > 1 ? "s" : ""}
        </span>
      </div>

      <div className="circle-progress-wrapper horizontal">
      {coursesWithStats.map((course, index) => {
  const isPassed = course.hasPassed ?? false; // Handle nullable values
  const isLocked =
    userId &&
    !isPassed &&
    !(
      index === 0 || // Always unlock the first course
      (index > 0 && coursesWithStats[index - 1].hasPassed) // Unlock the course after a passed course
    );
  const isPurchased = course.isPurchased ?? false; // Handle purchase status

  return (
    <React.Fragment key={course.courseID}>
      <div className="circle-node-wrapper">
        <div
          className={`circle-node ${
            isPassed
              ? "passed"
              : isLocked
              ? "locked"
              : !isPurchased
              ? "not-purchased"
              : ""
          }`}
          onClick={() => handleCircleClick(course.courseID, isLocked, isPurchased)}
        >
          {!isPurchased && userId ? (
            <FaShoppingCart
              className="not-purchased-icon"
              onClick={(e) => {
                e.stopPropagation(); // Prevent triggering circle click
                handleAddToBasket(course.courseID);
              }}
            />
          ) : isLocked && userId ? (
            <FaLock className="lock-icon" />
          ) : (
            <img
              src={
                course.coursePicture
                  ? config.BaseUrl + course.coursePicture
                  : noImageCourse
              }
              alt={course.courseName || "Course"}
              className="circle-image"
            />
          )}
        </div>
        {/* Truncated Course Name */}
        <p className="course-name">
          {course.courseName && course.courseName.length > 15
            ? `${course.courseName.slice(0, 15)}...`
            : course.courseName || "Unnamed Course"}
        </p>
      </div>
      {index < coursesWithStats.length - 1 && (
        <div
          className={`circle-connector ${
            index < currentProgressIndex ? "active" : ""
          }`}
        ></div>
      )}
    </React.Fragment>
  );
})}
      </div>
    </div>
  );
};

export default CircleProgressTracker;
