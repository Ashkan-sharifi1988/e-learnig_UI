import React, { useEffect, useState, useContext, useCallback } from "react";
import CircleProgressTracker from "../components/CircleProgressTracker";
import { AuthContext } from "../context/AuthContext";
import { Spinner } from "react-bootstrap";
import { toast, ToastContainer } from "react-toastify";
import api from "../api/api";
import "../assets/LearningPathPage.css";
import "react-toastify/dist/ReactToastify.css";
import Layout from "../components/Layout";

const LearningPathsPage = () => {
  const { userId } = useContext(AuthContext);
  const [learningPaths, setLearningPaths] = useState([]);
  const [selectedPaths, setSelectedPaths] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch all available learning paths
  const fetchLearningPaths = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/LearningPath`);
      setLearningPaths(response.data);
    } catch (error) {
      toast.error("Failed to fetch learning paths.");
      console.error("Error fetching learning paths:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch user-selected learning paths
  const fetchSelectedPaths = useCallback(async () => {
    try {
      const response = await api.get(`/UserLearningPath/${userId}`);
      const pathIds = response.data.map((path) => path.learningPathID);
      setSelectedPaths(pathIds);
    } catch (error) {
      toast.error("Failed to fetch user learning paths.");
      console.error("Error fetching selected paths:", error);
    }
  }, [userId]);

  useEffect(() => {
    fetchLearningPaths();
    fetchSelectedPaths();
  }, [fetchSelectedPaths]);

  // Add a learning path to the user's list
  const addUserLearningPath = async (learningPathId) => {
    try {
      await api.post("/UserLearningPath", {
        userId,
        learningPathId,
      });
      toast.success("Learning path selected successfully!");
      setSelectedPaths((prev) => [...prev, learningPathId]);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Error selecting learning path"
      );
      console.error("API Error:", error);
    }
  };

  // Remove a learning path from the user's list
  const removeUserLearningPath = async (learningPathId) => {
    try {
      await api.delete(`/UserLearningPath/${learningPathId}`);
      toast.success("Learning path removed successfully!");
      setSelectedPaths((prev) => prev.filter((id) => id !== learningPathId));
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Error removing learning path"
      );
      console.error("API Error:", error);
    }
  };

  if ( learningPaths.length === 0) {
    return (
      <Layout>
      <div className=" text-center mt-4">
          <p>No learning paths are available at the moment.</p>
      </div>
  </Layout>
  );
}


  return (
    <Layout>
    <div className="container mt-4">
      <ToastContainer />
      <h2 className="mb-2">Available Learning Paths</h2>

      {loading ? (
        <div className="text-center">
          <Spinner animation="border" />
        </div>
      ) : (
        <div className="learning-path-list">
          {learningPaths.map((path) => {
            const isSelected = selectedPaths.includes(path.learningPathID);

            return (
              
              <div
                className={`learning-path-card ${
                  isSelected ? "selected" : ""
                }`}
                key={path.learningPathID}
                style={{
                  backgroundColor: isSelected ? "#f0f0f0" : "#fff",
                }}
              >
                <div className="card-content">
                  {/* Pass the learning path and exclude userId to disable progress */}
                  <CircleProgressTracker learningPath={path} />

                  <div className="button-wrapper mt-1">
                    <button
                      className={`btn ${
                        isSelected ? "btn-danger" : "btn-primary"
                      }`}
                      onClick={() =>
                        isSelected
                          ? removeUserLearningPath(path.learningPathID)
                          : addUserLearningPath(path.learningPathID)
                      }
                    >
                      {isSelected ? "Remove Path" : "Select Path"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
    </Layout>);
};

export default LearningPathsPage;
