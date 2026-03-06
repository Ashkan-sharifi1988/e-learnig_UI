import React, { useState, useEffect } from "react";
import Slider from "react-slick";
import "../assets/Recommendations.css";

import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import noImageCourse from "../assets/Images/No-Image-Course.png";
import noImageProfile from "../assets/Images/No-Image-Profile.png";
import api from "../api/api";
import config from "../config";
import "../assets/Spiner.css";

const Recommendations = ({ userId, visibleItems }) => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/Recommendations/${userId}`);
        const { courses = [], learningPaths = [] } = response.data || {};
        const combinedRecommendations = [
          ...courses.map((item) => ({ ...item, type: "course" })),
          ...learningPaths.map((item) => ({ ...item, type: "learningPath" })),
        ];
        setRecommendations(combinedRecommendations);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching recommendations:", error);
        setLoading(false);
        setRecommendations([]);
      }
    };

    fetchRecommendations();
  }, [userId]);

  const truncateText = (text, wordLimit) => {
    const words = text.split(" ");
    return words.length > wordLimit
      ? `${words.slice(0, wordLimit).join(" ")}...`
      : text;
  };

  const sliderSettings = {
    dots: true,
    infinite: false,
    speed: 500,
    slidesToShow: visibleItems,
    slidesToScroll: 1,
    arrows: true,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 1,
          infinite: true,
          dots: true,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
    ],
  };

  if (loading) {
    return (
      <div className="spinner-container">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!recommendations.length) {
    return (
      <div className="text-center p-4">
        No recommendations available at the moment.
      </div>
    );
  }

  return (
    <div className="recommendations-container">
      <h2 className="recommendations-title">Recommendations</h2>
      <Slider {...sliderSettings}>
        {recommendations.map((item, index) => (
          <div key={index} className="recommendation-card">
            <div className="image-container">
              <img
                src={
                  item.type === "course"
                    ? item.coursePicture
                      ? `${config.BaseUrl}${item.coursePicture}`
                      : noImageCourse
                    : item.image
                    ? item.image
                    : noImageCourse
                }
                alt={item.type === "course" ? item.courseName : item.learningPathName}
                className="recommendation-image"
              />
              <div className="type-label">
                {item.type === "course" ? "Course" : "Learning Path"}
              </div>
              {item.type === "course" && (
                <div className="recom-overlay-top-left">
                  <span>{item.courseType ? "Online" : "Offline"}</span>
                </div>
              )}
              {item.type === "course" && (
                <div className="recom-overlay-bottom-left">
                  <img
                    src={noImageProfile}
                    alt={item.courseInstructors || "Instructor"}
                    className="instructor-picture"
                  />
                  <span>{item.courseInstructors}</span>
                </div>
              )}
            </div>
            <div className="recommendation-info">
              <h3>
                {item.type === "course" ? item.courseName : item.learningPathName}
              </h3>
              <p>
                {truncateText(
                  item.type === "course" ? item.courseDescription : item.description,
                  20
                )}
              </p>
              {item.type === "course" && (
                <span className="duration">
                  Duration: {item.courseDuration || "N/A"}
                </span>
              )}
            </div>
          </div>
        ))}
      </Slider>
    </div>
  );
};

export default Recommendations;
