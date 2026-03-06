import React, { useEffect, useState, useContext } from "react";
import CircleProgressTracker from "../components/CircleProgressTracker";
import { AuthContext } from "../context/AuthContext";
import { Spinner } from "react-bootstrap";
import { toast, ToastContainer } from "react-toastify";
import api from "../api/api";
import "../assets/LearningPathPage.css";
import "react-toastify/dist/ReactToastify.css";
import Layout from "../components/Layout";

const UserLearningPathsPage = () => {
  const { userId } = useContext(AuthContext);
  const [learningPaths, setLearningPaths] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUserLearningPaths = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/UserLearningPath/${userId}`);
      setLearningPaths(response.data);
    } catch (error) {
      toast.error("Failed to fetch your learning paths.");
      console.error("Error fetching user learning paths:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserLearningPaths();
  }, []);

  if ( learningPaths.length === 0) {
    return (
      <Layout>
      <div className=" text-center mt-4">
          <p>No learning paths selected yet. Go to the available paths page to choose one.</p>
      </div>
  </Layout>
  );
}
  return (
    <Layout>
    <div className="container mt-5">
      <ToastContainer />
      <h2 className="mb-4">My Learning Paths</h2>
      {loading ? (
        <div className="text-center">
          <Spinner animation="border" />
        </div>
      ) : (
        <div className="learning-path-list">
          {learningPaths.map((path) => (
            <div className="learning-path-card" key={path.learningPathID}>
                        
                <CircleProgressTracker learningPath={path} userId={userId} />
            
            </div>
          ))}
        </div>
      )}
    </div>
    </Layout>
  );
  
};

export default UserLearningPathsPage;
