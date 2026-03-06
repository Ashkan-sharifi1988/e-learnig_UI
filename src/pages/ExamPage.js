import React, { useState, useEffect, useContext } from "react";
import Layout from "../components/Layout";
import { Form, Dropdown, DropdownButton, Button } from "react-bootstrap";
import { FaPlay } from "react-icons/fa";
import { toast,ToastContainer } from "react-toastify";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import "react-toastify/dist/ReactToastify.css";
import { AuthContext } from "../context/AuthContext";
import "../assets/Pagination.css";
import { Margin } from "@mui/icons-material";

const ExamPage = () => {
  const [exams, setExams] = useState([]);
  const [filteredExams, setFilteredExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [examAttempts, setExamAttempts] = useState({});
  const rowsPerPage = 5; // Number of exams per page
  const navigate = useNavigate();
  const { userId, isAuthenticated } = useContext(AuthContext);

  useEffect(() => {
    if (!isAuthenticated) {
      toast.error("You need to be logged in to view exams.");
      return;
    }

    const fetchUserExams = async () => {
      try {
        const response = await api.get(`/Exam/UserExams/${userId}`);
        setExams(response.data);
        setFilteredExams(response.data);

        // Fetch attempts for all exams
        const attemptPromises = response.data.map((exam) =>
          api
            .get(`/ExamAttempt/UserAttempt/${exam.examID}/${userId}`)
            .then((res) => ({
              examID: exam.examID,
              attempts: res.data || [],
            }))
            .catch(() => ({ examID: exam.examID, attempts: [] }))
        );
        const attempts = await Promise.all(attemptPromises);
        const attemptData = attempts.reduce((acc, cur) => {
          acc[cur.examID] = cur.attempts;
          return acc;
        }, {});
        setExamAttempts(attemptData);
      } catch (error) {
        toast.error("Failed to fetch exams or attempts.");
        console.error("Error fetching exams:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserExams();
  }, [userId, isAuthenticated]);

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);

    const filtered = exams.filter((exam) =>
      exam.name.toLowerCase().includes(query) ||
      exam.courseName.toLowerCase().includes(query) ||
      new Date(exam.startDateTime).toLocaleString().toLowerCase().includes(query)
    );

    setFilteredExams(filtered);
  };

  const handleFilterChange = (filter) => {
    setSelectedFilter(filter);
    if (filter === "All") {
      setFilteredExams(exams);
    } else if (filter === "Upcoming") {
      setFilteredExams(
        exams.filter((exam) => new Date(exam.startDateTime) > new Date())
      );
    } else if (filter === "Past") {
      setFilteredExams(
        exams.filter((exam) => new Date(exam.startDateTime) <= new Date())
      );
    }
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleAttendExam = (examID, startDateTime) => {
    const now = new Date();
    const startTime = new Date(startDateTime);

    // if (examAttempts[examID]?.length > 0) {
    //   toast.warn("You have already attempted this exam.");
    //   return;
    // }

    if (now < startTime) {
      toast.warn(`The exam will start on ${startTime.toLocaleString()}.`);
    } else {
      navigate(`/examAttempt/${examID}`);
    }
  };

  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentExams = filteredExams.slice(indexOfFirstRow, indexOfLastRow);
  const totalPages = Math.ceil(filteredExams.length / rowsPerPage);

  if (loading) {
    return (
      <Layout>
       
        <div className="spinner-container" style={{ height: "50vh" }}>
          <div className="spinner"></div>
        </div>
      </Layout>
    );
  }

  if (!exams.length) {
    return (
        <Layout>
        <div className=" text-center mt-4">
            <p>You have no exam.</p>
        </div>
    </Layout>
    );
}


  return (
    <Layout>
       <ToastContainer/>
      <div className="container mt-5 mb-2" >
        <h1 className="text-center mb-4">Available Exams</h1>

        {/* Search Bar and Filter */}
        <div className="d-flex justify-content-between mb-4">
          <Form.Control
            type="text"
            placeholder="Search exams..."
            value={searchQuery}
            onChange={handleSearch}
            style={{ width: "25%" }}
          />
          <DropdownButton
            id="dropdown-basic-button"
            title={`Filter: ${selectedFilter}`}
            onSelect={handleFilterChange}
          >
            <Dropdown.Item eventKey="All">All</Dropdown.Item>
            <Dropdown.Item eventKey="Upcoming">Upcoming</Dropdown.Item>
            <Dropdown.Item eventKey="Past">Past</Dropdown.Item>
          </DropdownButton>
        </div>

        {/* Exam Table */}
        <table className="table table-bordered">
          <thead className="thead-dark">
            <tr>
              <th>Course</th>
              <th>Start Time</th>
              <th>Grade</th>
              <th>Last Attempt Date</th>
              <th>Allowed Attempts</th>
              
              <th>Attempts</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
  {currentExams.map((exam) => {
    const attempts = examAttempts[exam.examID] || [];
    const lastAttempt = attempts.sort((a, b) => new Date(b.attemptDate) - new Date(a.attemptDate))[0];
    const allowedAttempts = exam.allowedAttempts || 0; // Default to 0 if not provided

    return (
      <tr key={exam.examID}>
        {/* Course Name */}
        <td>{exam.courseName || "Unknown"}</td>

        {/* Start Time */}
        <td>{new Date(exam.startDateTime).toLocaleString()}</td>

        {/* Grade */}
        <td>
          {lastAttempt
            ? `${lastAttempt.grade}/${exam.totalScore}`
            : "-"}
        </td>

        {/* Last Attempt Date */}
        <td>
          {lastAttempt
            ? new Date(lastAttempt.attemptDate).toLocaleString()
            : "-"}
        </td>

        {/* Allowed Attempts */}
        <td>{allowedAttempts} Attempt(s)</td>

        {/* Actual Attempts */}
        <td>{attempts.length} Attempt(s)</td>

        {/* Status */}
        <td>
          {lastAttempt ? (
            lastAttempt.grade >= exam.passScore ? (
              <span style={{ color: "green" }}>Passed</span>
            ) : (
              <span style={{ color: "red" }}>Failed</span>
            )
          ) : (
            "-"
          )}
        </td>

        {/* Action Buttons */}
        <td>
  {attempts.length < allowedAttempts ? (
    <>
      {lastAttempt ? (
        <>
          {lastAttempt.grade < exam.passScore ? (
            <Button
              variant="warning"
              onClick={() => handleAttendExam(exam.examID, exam.startDateTime)}
              className="me-2"
            >
              Retake
            </Button>
          ) : (
            <Button
              variant="success"
              onClick={() => handleAttendExam(exam.examID, exam.startDateTime)}
            >
              <FaPlay /> Retake
            </Button>
          )}
        </>
      ) : (
        <Button
          variant="success"
          onClick={() => handleAttendExam(exam.examID, exam.startDateTime)}
        >
          <FaPlay /> Attend
        </Button>
      )}
    </>
  ) : (
    <Button variant="secondary" disabled>
      Attempted
    </Button>
  )}
</td>

      </tr>
    );
  })}
</tbody>


        </table>

        {/* Pagination */}
        <div className="pagination mt-4">
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
      </div>
    </Layout>
  );
};

export default ExamPage;
