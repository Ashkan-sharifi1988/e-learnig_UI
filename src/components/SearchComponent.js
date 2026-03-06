import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import "../assets/SearchComponent.scss";
import config from "../config";
import noImageCourse from "../assets/Images/No-Image-Course.png";
import { FaVideo, FaPlayCircle } from "react-icons/fa"; // Icons for course types

const SearchComponent = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState({ courses: [], learningPaths: [] });
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const searchContainerRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchResults = async () => {
      if (query.length < 2) {
        setResults({ courses: [], learningPaths: [] });
        setShowDropdown(false); // Do not show dropdown for short queries
        return;
      }

      setLoading(true);
      try {
        const response = await api.get(`/search`, { params: { query } });
        setResults(response.data || { courses: [], learningPaths: [] });
        setShowDropdown(true); // Show dropdown when there are results or loading
      } catch (error) {
        console.error("Error fetching search results:", error);
        setResults({ courses: [], learningPaths: [] });
        setShowDropdown(false);
      }
      setLoading(false);
    };

    fetchResults();
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleResultSelect = (type, id) => {
    const routes = {
      course: `/course/${id}`,
      learningPath: `/learning-path/${id}`,
    };
    navigate(routes[type]);
    setShowDropdown(false);
  };

  return (
    <div className="search-container" ref={searchContainerRef}>
      <div className="input-wrapper">
        <input
          type="text"
          className="search-input"
          placeholder="Search courses or learning paths..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setShowDropdown(true)}
        />
      </div>
      {showDropdown &&
        (loading ||
          results.courses.length > 0 ||
          results.learningPaths.length > 0) && (
          <div className="search-results">
            {loading && <div className="loading-spinner">Searching...</div>}
            {!loading &&
              query.length >= 2 &&
              results.courses?.length === 0 &&
              results.learningPaths?.length === 0 && (
                <div className="no-results">No results found.</div>
              )}
            {results.courses?.map((course) => (
              <div
                key={`course-${course.courseID}`}
                className="search-item"
                onClick={() => handleResultSelect("course", course.courseID)}
              >
                <img
                  src={
                    course.coursePicture
                      ? config.BaseUrl + course.coursePicture
                      : noImageCourse
                  }
                  alt={`${course.courseName} Thumbnail`}
                  className="course-image"
                />
                <div className="item-info">
                  <h4>
                    {course.courseType ? (
                      <FaVideo className="course-icon live-icon" />
                    ) : (
                      <FaPlayCircle className="course-icon recorded-icon" />
                    )}
                    {course.courseName}
                  </h4>
                  <p>{course.courseDescription.substring(0, 100)}...</p>
                  <p className="instructor">Instructor: {course.courseInstructors}</p>
                </div>
              </div>
            ))}
            {results.learningPaths?.map((path) => (
              <div
                key={`learningPath-${path.learningPathID}`}
                className="search-item"
                onClick={() => handleResultSelect("learningPath", path.learningPathID)}
              >
                <img
                  src={
                    path.imageUrl
                      ? config.BaseUrl + path.imageUrl
                      : noImageCourse
                  }
                  alt={`${path.learningPathName} Thumbnail`}
                  className="course-image"
                />
                <div className="item-info">
                  <h4>{path.learningPathName}</h4>
                  <p>{path.description.substring(0, 100)}...</p>
                </div>
              </div>
            ))}
          </div>
        )}
    </div>
  );
};

export default SearchComponent;
