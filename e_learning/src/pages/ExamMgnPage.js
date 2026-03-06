import React, { useState, useEffect, useCallback } from "react";
import { Modal, Button, Form, Pagination } from "react-bootstrap";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/api"; // Axios instance for API calls
import Layout from "../components/Layout";
import { toast ,ToastContainer} from "react-toastify";
import "react-toastify/dist/ReactToastify.css";



const ExamManagement = () => {
  const [exams, setExams] = useState([]);
  const [filteredExams, setFilteredExams] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5); // Number of exams per page
  const [errors, setErrors] = useState({});

  const [showModal, setShowModal] = useState(false);
  const [currentExam, setCurrentExam] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    type: "",
    duration: "",
    totalScore: "",
    passScore: "",
    startDateTime: "",
    allowedAttempts: "", 
  });

  const { courseID } = useParams();
  const navigate = useNavigate();

  const fetchExams = useCallback(async () => {
    try {
      const response = await api.get(`/Exam/Course/${courseID}`);
      setExams(response.data);
      setFilteredExams(response.data); // Initialize filtered exams
    } catch (error) {
     
      console.error("Error fetching exams", error);
    }
  }, [courseID]);

  useEffect(() => {
    const loadData = async () => {
      if (!courseID) {
        
        try {
          const response = await api.get("/Exam/");
          setExams(response.data);
          setFilteredExams(response.data); // Initialize filtered exams
        } catch (error) {
          toast.error("Error fetching exams");
          console.error("Error fetching exams", error);
        }
      } else {
        fetchExams();
      }
    };

    loadData();
  }, [courseID, fetchExams]);

  // Handle Search
  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(value);
    const filtered = exams.filter(
      (exam) =>
        exam.name.toLowerCase().includes(value) ||
        exam.description.toLowerCase().includes(value)
    );
    setFilteredExams(filtered);
    setCurrentPage(1); // Reset to first page
  };

  // Handle Filtering by Type
  const handleFilterByType = (e) => {
    const value = e.target.value;
    setSelectedType(value);
    const filtered = exams.filter((exam) => exam.type === value || value === "");
    setFilteredExams(filtered);
    setCurrentPage(1); // Reset to first page
  };

  // Pagination Logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentExams = filteredExams.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Open modal for Add or Edit
  const handleShowModal = (exam = null) => {
    setCurrentExam(exam);
    setFormData(
      exam
        ? {
            ...exam,
            startDateTime: new Date(exam.startDateTime).toISOString().slice(0, 16), // Format for datetime-local input
            allowedAttempts: exam.allowedAttempts || "", // Set existing value or empty string
          }
        : {
            name: "",
            description: "",
            type: "",
            duration: "",
            totalScore: "",
            passScore: "",
            startDateTime: "",
            allowedAttempts: "", // Initialize as empty
          }
    );
    setShowModal(true);
  };
  
  const handleCloseModal = () => {
    setShowModal(false);
    setCurrentExam(null);
  };

  // Handle form changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Submit form for Add or Edit
  const handleSubmit = async () => {
    // Validate form fields
    const errors = {};
    if (!formData.name.trim()) errors.name = "Name is required.";
    if (!formData.description.trim()) errors.description = "Description is required.";
    if (!formData.duration.trim()) errors.duration = "Duration is required.";
    if (!formData.totalScore) errors.totalScore = "Total score is required.";
    if (!formData.passScore) errors.passScore = "Pass score is required.";
    if (!formData.startDateTime) errors.startDateTime = "Start Date/Time is required.";
    if (!formData.allowedAttempts || formData.allowedAttempts <= 0) {
      errors.allowedAttempts = "Allowed attempts must be a positive number.";
    }
  
    // If there are errors, show them and stop form submission
    if (Object.keys(errors).length > 0) {
      setErrors(errors); // Set errors to display in the form
      toast.error("Please correct the errors in the form.");
      return;
    }
  
    try {
      const updatedFormData = {
        ...formData,
        startDateTime: new Date(formData.startDateTime).toISOString(), // Ensure ISO format
      };
  
      if (currentExam) {
        // Update Exam
        await api.put(`/Exam/${currentExam.examID}`, updatedFormData);
        toast.success("Exam updated successfully");
      } else {
        // Create Exam with courseID
        await api.post(`/Exam`, { ...updatedFormData, courseID });
        toast.success("Exam created successfully");
      }
      fetchExams(); // Refresh exam list
      handleCloseModal();
    } catch (error) {
      toast.error("Error saving exam");
      console.error("Error saving exam", error);
    }
  };
  

  // Delete Exam
  const handleDelete = async (examID) => {
    if (window.confirm("Are you sure you want to delete this exam?")) {
      try {
        await api.delete(`/Exam/${examID}`);
        toast.success("Exam deleted successfully");
        fetchExams(); // Refresh exam list
      } catch (error) {
        toast.error("Error deleting exam");
        console.error("Error deleting exam", error);
      }
    }
  };

  return (
    <Layout>
      <ToastContainer/>
      <div className="container mt-5">
        <h1 className="text-center mb-4">Exam Management</h1>
        <div className="row mb-3">
  <div className="col-md-6">
    <Form.Control
      type="text"
      placeholder="Search by Name or Description"
      value={searchTerm}
      onChange={handleSearch}
    />
  </div>
  <div className="col-md-6">
    <Form.Select value={selectedType} onChange={handleFilterByType}>
      <option value="">All Types</option>
      <option value="Type1">Type1</option>
      <option value="Type2">Type2</option>
      {/* Add more types as needed */}
    </Form.Select>
  </div>
</div> {courseID && (
  <Button className="mb-3" onClick={() => handleShowModal()}>
    Add New Exam
  </Button>
)}
        <table className="table table-striped">
          <thead>
            <tr>
              <th>Name</th>
              <th>Description</th>
              <th>Type</th>
              <th>Duration</th>
              <th>Total Score</th>
              <th>Pass Score</th>
              <th>Start Date</th>
              <th>Allowed Attempts</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentExams.map((exam) => (
              <tr key={exam.examID}>
                <td>{exam.name}</td>
                <td>{exam.description}</td>
                <td>{exam.type}</td>
                <td>{exam.duration}</td>
                <td>{exam.totalScore}</td>
                <td>{exam.passScore}</td>
                <td>{new Date(exam.startDateTime).toLocaleString()}</td>
                <td>{exam.allowedAttempts}</td>
                <td>
                  <Button
                    variant="warning"
                    className="me-2"
                    onClick={() => handleShowModal(exam)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="danger"
                    className="me-2"
                    onClick={() => handleDelete(exam.examID)}
                  >
                    Delete
                  </Button>
                  <Button
                    variant="primary"
                    onClick={() => navigate(`/exam/${exam.examID}/questions`)}
                  >
                    Manage Questions
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <Pagination>
          {Array.from(
            { length: Math.ceil(filteredExams.length / itemsPerPage) },
            (_, index) => (
              <Pagination.Item
                key={index + 1}
                active={index + 1 === currentPage}
                onClick={() => paginate(index + 1)}
              >
                {index + 1}
              </Pagination.Item>
            )
          )}
        </Pagination>
      </div>

      {/* Modal for Add/Edit Exam */}
      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>{currentExam ? "Edit Exam" : "Add Exam"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
          <Form.Group className="mb-3">
  <Form.Label>Name</Form.Label>
  <Form.Control
    type="text"
    name="name"
    value={formData.name}
    onChange={handleInputChange}
    isInvalid={!!errors.name} // Highlight field if error exists
  />
  <Form.Control.Feedback type="invalid">{errors.name}</Form.Control.Feedback>
</Form.Group>

<Form.Group className="mb-3">
  <Form.Label>Description</Form.Label>
  <Form.Control
    as="textarea"
    rows={3}
    name="description"
    value={formData.description}
    onChange={handleInputChange}
    isInvalid={!!errors.description}
  />
  <Form.Control.Feedback type="invalid">{errors.description}</Form.Control.Feedback>
</Form.Group>

<Form.Group className="mb-3">
  <Form.Label>Duration (hh:mm:ss)</Form.Label>
  <Form.Control
    type="text"
    name="duration"
    value={formData.duration}
    onChange={handleInputChange}
    isInvalid={!!errors.duration}
  />
  <Form.Control.Feedback type="invalid">{errors.duration}</Form.Control.Feedback>
</Form.Group>

<Form.Group className="mb-3">
  <Form.Label>Total Score</Form.Label>
  <Form.Control
    type="number"
    name="totalScore"
    value={formData.totalScore}
    onChange={handleInputChange}
    isInvalid={!!errors.totalScore}
  />
  <Form.Control.Feedback type="invalid">{errors.totalScore}</Form.Control.Feedback>
</Form.Group>

<Form.Group className="mb-3">
  <Form.Label>Pass Score</Form.Label>
  <Form.Control
    type="number"
    name="passScore"
    value={formData.passScore}
    onChange={handleInputChange}
    isInvalid={!!errors.passScore}
  />
  <Form.Control.Feedback type="invalid">{errors.passScore}</Form.Control.Feedback>
</Form.Group>
<Form.Group className="mb-3">
  <Form.Label>Allowed Attempts</Form.Label>
  <Form.Control
    type="number"
    name="allowedAttempts"
    value={formData.allowedAttempts}
    onChange={handleInputChange}
    isInvalid={!!errors.allowedAttempts}
  />
  <Form.Control.Feedback type="invalid">{errors.allowedAttempts}</Form.Control.Feedback>
</Form.Group>
<Form.Group className="mb-3">
  <Form.Label>Start Date/Time</Form.Label>
  <Form.Control
    type="datetime-local"
    name="startDateTime"
    value={formData.startDateTime}
    onChange={handleInputChange}
    isInvalid={!!errors.startDateTime}
  />
  <Form.Control.Feedback type="invalid">{errors.startDateTime}</Form.Control.Feedback>
</Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            Save
          </Button>
        </Modal.Footer>
      </Modal>
    </Layout>
  );
};

export default ExamManagement;
