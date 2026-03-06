import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Button, Form, Table, Modal } from "react-bootstrap";
import api from "../api/api";
import Layout from '../components/Layout';


const ExamQuestionPage = () => {
  const { examID } = useParams();
  const [questions, setQuestions] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [formData, setFormData] = useState({
    questionText: "",
    choices: [
      { choiceID: 0, text: "", isCorrect: false },
      { choiceID: 0, text: "", isCorrect: false },
      { choiceID: 0, text: "", isCorrect: false },
      { choiceID: 0, text: "", isCorrect: false },
    ],
  });

  // Fetch questions for the exam
  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      const response = await api.get(`/ExamQuestion/Exam/${examID}`);
      setQuestions(response.data);
    } catch (error) {
      console.error("Error fetching questions:", error);
    }
  };

  const handleShowModal = (question = null) => {
    setCurrentQuestion(question);
    if (question) {
      setFormData({
        questionText: question.questionText,
        choices: question.choices.map((choice) => ({
          choiceID: choice.choiceID,
          text: choice.text,
          isCorrect: choice.isCorrect,
        })),
      });
    } else {
      setFormData({
        questionText: "",
        choices: [
          { choiceID: 0, text: "", isCorrect: false },
          { choiceID: 0, text: "", isCorrect: false },
          { choiceID: 0, text: "", isCorrect: false },
          { choiceID: 0, text: "", isCorrect: false },
        ],
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setCurrentQuestion(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleChoiceChange = (index, field, value) => {
    const updatedChoices = [...formData.choices];
    if (field === "isCorrect") {
      // Ensure only one choice is marked as correct
      updatedChoices.forEach((choice, i) => {
        updatedChoices[i].isCorrect = false;
      });
      updatedChoices[index][field] = value;
    } else {
      updatedChoices[index][field] = value;
    }
    setFormData({ ...formData, choices: updatedChoices });
  };

  const handleSubmit = async () => {
    try {
      const payload = {
        questionText: formData.questionText,
        choices: formData.choices.map((choice) => ({
          choiceID: choice.choiceID, // Preserve existing choiceID for updates
          text: choice.text,
          isCorrect: choice.isCorrect,
        })),
        examID,
      };

      if (currentQuestion) {
        // Update existing question
        await api.put(`/ExamQuestion/${currentQuestion.questionID}`, payload);
        alert("Question updated successfully");
      } else {
        // Create new question
        await api.post("/ExamQuestion", payload);
        alert("Question created successfully");
      }

      fetchQuestions();
      handleCloseModal();
    } catch (error) {
      console.error("Error saving question:", error);
    }
  };

  const handleDelete = async (questionID) => {
    if (window.confirm("Are you sure you want to delete this question?")) {
      try {
        await api.delete(`/ExamQuestion/${questionID}`);
        alert("Question deleted successfully");
        fetchQuestions();
      } catch (error) {
        console.error("Error deleting question:", error);
      }
    }
  };

  return (
    <Layout>
    <div className="container mt-5">
      <h1 className="text-center mb-4">Exam Question Management</h1>
      <Button className="mb-3" onClick={() => handleShowModal()}>
        Add New Question
      </Button>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Question</th>
            <th>Choices</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {questions.map((question) => (
            <tr key={question.questionID}>
              <td>{question.questionText}</td>
              <td>
                {question.choices.map((choice, index) => (
                  <div key={index}>
                    {choice.text} {choice.isCorrect ? "(Correct)" : ""}
                  </div>
                ))}
              </td>
              <td>
                <Button
                  variant="warning"
                  className="me-2"
                  onClick={() => handleShowModal(question)}
                >
                  Edit
                </Button>
                <Button
                  variant="danger"
                  onClick={() => handleDelete(question.questionID)}
                >
                  Delete
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Modal for Add/Edit */}
      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>
            {currentQuestion ? "Edit Question" : "Add Question"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Question Text</Form.Label>
              <Form.Control
                type="text"
                name="questionText"
                value={formData.questionText}
                onChange={handleInputChange}
              />
            </Form.Group>
            <Form.Label>Choices</Form.Label>
            {formData.choices.map((choice, index) => (
              <Form.Group key={index} className="mb-3">
                <Form.Control
                  type="text"
                  value={choice.text}
                  onChange={(e) => handleChoiceChange(index, "text", e.target.value)}
                  placeholder={`Choice ${index + 1}`}
                />
                <Form.Check
                  type="radio"
                  name="correctChoice"
                  label="Correct Answer"
                  checked={choice.isCorrect}
                  onChange={(e) =>
                    handleChoiceChange(index, "isCorrect", e.target.checked)
                  }
                />
              </Form.Group>
            ))}
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
    </div>
   </Layout>
  );
  
};

export default ExamQuestionPage;
