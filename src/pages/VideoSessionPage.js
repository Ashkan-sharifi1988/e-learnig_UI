import React, { useState, useEffect, useCallback, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/api";
import "../assets/VideoSessionPage.css";
import { AuthContext } from "../context/AuthContext";
import config from "../config";
import Layout from '../components/Layout';
import CommentComponent from "../components/Comment";
import TimeSpentTracker from "../components/SessionTimeSpentTracker";
import noImageSession from "../assets/Images/No-Image-Session.png";

const VideoSessionPage = () => {
  const { sessionID } = useParams();
  const navigate = useNavigate();

  const [currentSession, setCurrentSession] = useState(null);
  const [relatedSessions, setRelatedSessions] = useState([]);
  const [hasAccess, setHasAccess] = useState(false);
  const { userId } = useContext(AuthContext);

  // Fetch session details and associated course ID
  const fetchSessionDetails = useCallback(async () => {
    try {
      const response = await api.get(`/CourseSession/${sessionID}`);
      setCurrentSession(response.data);
    } catch (error) {
      console.error("Error fetching session details:", error);
      setCurrentSession(null);
    }
  }, [sessionID]);

  // Fetch related sessions for the same course
  const fetchRelatedSessions = useCallback(async (courseID) => {
    try {
      const response = await api.get(`/CourseSession/course/${courseID}`);
      setRelatedSessions(response.data.filter((session) => session.courseSessionID !== parseInt(sessionID)));
    } catch (error) {
      console.error("Error fetching related sessions:", error);
      setRelatedSessions([]);
    }
  }, [sessionID]);

  // Check user access to the course
  const checkUserAccess = useCallback(async (userId,courseID) => {
    try {
  
      // Fetch course details to check if it is free or paid
      const courseResponse = await api.get(`/Course/${courseID}`);
      const course = courseResponse.data;

      if (!course.courseIsPaid) {
        // If the course is free, grant access immediately
        setHasAccess(true);
        return;
      }
       // If the course is paid, check if the user has purchased it
      const response = await api.get(`/UserCourse/check/${userId}/${courseID}`);
    
      setHasAccess(response.data.data || false);
    } catch (error) {
      console.error("Error checking user access:", error);
      setHasAccess(false);
    }
  }, []);

  useEffect(() => {
    const initialize = async () => {
      if (sessionID) {
        await fetchSessionDetails();
      }
    };

    initialize();
  }, [sessionID, fetchSessionDetails]);

  useEffect(() => {
    if (currentSession) {
      const { courseID } = currentSession;
      fetchRelatedSessions(courseID);
      checkUserAccess(userId, courseID);
    }
  }, [currentSession, fetchRelatedSessions, checkUserAccess, userId]);

  const handleSessionClick = (sessionID) => {
    navigate(`/session/${sessionID}`);
  };

  if (!currentSession) {
    return <div>Loading session details...</div>;
  }

  if (!hasAccess) {
    return <div>You do not have permission to view this session.</div>;
  }

  return (
    <Layout>
    <div className="video-session-page">
    <TimeSpentTracker userId={userId} sessionId={sessionID} />
      <div className="main-content">
        <div className="video-section">
          <h3>{currentSession.courseSessionTitle}</h3>
          <video
            controls
            src={`${config.BaseUrl}${currentSession.courseSessionVideoURL}`}
            className="video-player"
          />
        </div>
        <div className="comments-section">
                    <CommentComponent 
        userID={userId} 
        id={sessionID} 
        entity="courseSession" 
        isManager={false} 
      />
        </div>
      </div>
      <div className="sidebar">
        <h4>Other Sessions</h4>
        <ul>
          {relatedSessions.map((session) => (
            <li key={session.courseSessionID} onClick={() => handleSessionClick(session.courseSessionID)}>
              <img
                  src={
                    session.courseSessionPicture
                      ? config.BaseUrl + session.courseSessionPicture
                      : noImageSession
                  }
                  alt={`${session.courseSessionTitle} Thumbnail`}
                  className="session-image"
                />
              <div>
                <h5>{session.courseSessionTitle}</h5>
                <p>{session.courseSessionDescription}</p>
                <p>Duration: {session.courseSessionDuration || "N/A"}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
    </Layout>
  );
};

export default VideoSessionPage;
