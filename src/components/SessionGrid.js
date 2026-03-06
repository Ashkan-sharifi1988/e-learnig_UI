import React, { useEffect, useState, useCallback } from "react";
import "../assets/SessionGrid.css";
import { FaLock } from "react-icons/fa";
import config from "../config";
import noImageSession from "../assets/Images/No-Image-Session.png";
import api from "../api/api";
import { useNavigate } from "react-router-dom";

const SessionGrid = ({ courseId, userId }) => {
  const [sessions, setSessions] = useState([]);
  const [videoPlayerSession, setVideoPlayerSession] = useState(null);
  const [hasAccess, setHasAccess] = useState(false);
  const [courseType, setCourseType] = useState(null); // Store the course type

  const navigate = useNavigate();

  // Check user access to the course
  const checkUserAccess = useCallback(async (userId, courseId) => {
    try {
      // Fetch course details to determine if it's free or paid
      const courseResponse = await api.get(`/Course/${courseId}`);
      const course = courseResponse.data;
  
      setCourseType(course.courseType); // Set the course type here
  
      if (!course.courseIsPaid) {
        // If the course is free, grant access immediately
        return true;
      }
  
      // If the course is paid, check if the user has purchased it
      const response = await api.get(`/UserCourse/check/${userId}/${courseId}`);
      return response.data.data || false; // Return the check result or default to false
    } catch (error) {
      console.error("Error checking user access:", error);
      return false; // Default to no access in case of an error
    }
  }, []);

  // Fetch sessions for the course
  const fetchSessions = useCallback(async () => {
    try {
      const sessionResponse = await api.get(`/CourseSession/course/${courseId}`);
      setSessions(sessionResponse.data); // Always set session data regardless of access
    } catch (error) {
      console.error("Error fetching sessions:", error);
      setSessions([]); // Default to an empty array if there's an error
    }
  }, [courseId]);

  useEffect(() => {
    const initialize = async () => {
      if (courseId) {
        const access = await checkUserAccess(userId, courseId);
        setHasAccess(access); // Set access status
        await fetchSessions(); // Fetch sessions regardless of access
      }
    };

    initialize();
  }, [courseId, userId, checkUserAccess, fetchSessions]);

  const handleSessionClick = (session) => {
    if (!hasAccess) {
      alert("You need to purchase this course to access the sessions.");
      return;
    }

    if (courseType) {
      // Online course session
      navigate(`/OnlineSession/${session.sessionCode}`);; // Redirect to online session hub
    } else if (session.courseSessionVideoURL) {
      // Video-based session
      navigate(`/session/${session.courseSessionID}`);
    }
  };

  return (
    <div className="session-grid-container">
      <div className="session-grid">
        {sessions.length > 0 ? (
          sessions.map((session) => (
            <div
              key={session.courseSessionID}
              className={`session-card ${!hasAccess ? "locked" : ""}`}
              onClick={() => handleSessionClick(session)} // Allow click only if access is granted
            >
              <div className="session-image-container">
                <img
                  src={
                    session.courseSessionPicture
                      ? config.BaseUrl + session.courseSessionPicture
                      : noImageSession
                  }
                  alt={`${session.courseSessionTitle} Thumbnail`}
                  className="session-image"
                />
                <div className="session-overlay">
                  <div className="overlay-top-left">
                    {session.courseSessionStartDateTime || "Start Date N/A"}
                  </div>
                </div>
              </div>
              <div className="session-info">
                <h3>{session.courseSessionTitle}</h3>
                <p className="session-description">
                  {session.courseSessionDescription || "No description available."}
                </p>
                <p className="session-duration">
                  Duration: {session.courseSessionDuration || "N/A"}
                </p>
                {!hasAccess && (
                  <FaLock
                    className="lock-icon"
                    title="This session is locked. Purchase required."
                  />
                )}
              </div>
            </div>
          ))
        ) : (
          <div>No sessions available, but you can browse them below.</div>
        )}
      </div>

      {videoPlayerSession && (
        <div className="video-player-container">
          <h3>Playing: {videoPlayerSession.courseSessionTitle}</h3>
          <video
            controls
            src={videoPlayerSession.courseSessionVideoURL}
            className="video-player"
          />
        </div>
      )}
    </div>
  );
};

export default SessionGrid;
