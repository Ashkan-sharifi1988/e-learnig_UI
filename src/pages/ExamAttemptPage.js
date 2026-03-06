import React, { useState, useEffect, useContext, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button, Form, Modal } from "react-bootstrap";
import { AuthContext } from "../context/AuthContext";
import api from "../api/api";
import Layout from '../components/Layout';
import { toast,ToastContainer,Slide } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


const ExamAttemptPage = () => {
  const { isAuthenticated, userId } = useContext(AuthContext);
  const { examID } = useParams();
  const navigate = useNavigate();

  const [exam, setExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [showTimeOverModal, setShowTimeOverModal] = useState(false);

  const fetchExamData = useCallback(async () => {
    try {
      const examResponse = await api.get(`/Exam/${examID}`);
      const questionResponse = await api.get(`/ExamQuestion/Exam/${examID}`);

      setExam(examResponse.data);
      setQuestions(questionResponse.data);

      const durationInSeconds = convertDurationToSeconds(examResponse.data.duration);
      setTimeLeft(durationInSeconds);

      const initialAnswers = {};
      questionResponse.data.forEach((q) => {
        initialAnswers[q.questionID] = null; // No answer selected initially
      });
      setAnswers(initialAnswers);
    } catch (error) {
      console.error("Error fetching exam data:", error);
      toast.error("Error loading exam data.");
    }
  }, [examID]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    fetchExamData();
  }, [isAuthenticated, navigate, fetchExamData]);

  const handleSubmit = useCallback(async () => {
    if (submitted) return;
  
    const calculateGrade = () => {
      let correctAnswers = 0;
  
      questions.forEach((q) => {
        const correctChoice = q.choices.find((choice) => choice.isCorrect);
        if (correctChoice && correctChoice.choiceID === answers[q.questionID]) {
          correctAnswers += 1;
        }
      });
  
      return {
        correct: correctAnswers,
        total: questions.length,
        grade: Math.round((exam.totalScore / questions.length) * correctAnswers),
      };
    };
  
    const { correct, total, grade } = calculateGrade();
  
    try {
      // Submit the exam attempt
      await api.post("/ExamAttempt", {
        examID,
        userID: userId,
        grade,
        answers, // Submit answers for audit purposes
        comment: null, // Optionally allow students to leave feedback
      });
  
      // Update HasPassed field in UserCourse
      await api.post("/ExamAttempt/UpdateHasPassed", null, {
        params: {
          examId: examID,
          userId: userId,
          grade: grade,
        },
      });
  
      setSubmitted(true);
      toast.success(`Exam submitted! You scored ${grade}/${exam.totalScore} (${correct}/${total} correct).`);
      setTimeout(() => navigate("/exams"), 5000); // Redirect after showing the toast
    } catch (error) {
      console.error("Error during exam submission or updating HasPassed:", error);
      toast.error("Error submitting exam or updating course status.");
    }
  }, [submitted, questions, answers, exam, examID, userId, navigate]);
  useEffect(() => {
    if (timeLeft <= 0 && !submitted && exam) {
      setShowTimeOverModal(true); // Show the "time over" modal
      handleSubmit(); // Auto-submit when the timer runs out
    }

    const timer = timeLeft > 0 && setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, submitted, exam, handleSubmit]);

  const convertDurationToSeconds = (duration) => {
    const [hours, minutes, seconds] = duration.split(":").map(Number);
    return hours * 3600 + minutes * 60 + seconds;
  };

  const handleAnswerChange = (questionID, choiceID) => {
    setAnswers({ ...answers, [questionID]: choiceID });
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? "0" : ""}${secs}`;
  };

  if (!exam) return  <div className="spinner-container">
  <div className="spinner"></div>
</div>;

  return (
    <Layout>
      <div className="container mt-5">
      <ToastContainer />
        <h1 className="text-center mb-4">{exam.name}</h1>
        <h4 className="text-center">Time Left: {formatTime(timeLeft)}</h4>

        <Modal show={showTimeOverModal} onHide={() => {}} backdrop="static" keyboard={false}>
          <Modal.Header>
            <Modal.Title>Time's Up!</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            Your exam time has expired. Your answers have been automatically submitted.
          </Modal.Body>
          <Modal.Footer>
            <Button variant="primary" onClick={() => navigate("/exams")}>
              Return to Dashboard
            </Button>
          </Modal.Footer>
        </Modal>

        {submitted ? (
          <div className="spinner-container">
          <div className="spinner"></div>
      </div>
         
        ) : (
          <Form>
            {questions.map((question) => (
              <div key={question.questionID} className="mb-4">
                <h5>{question.questionText}</h5>
                {question.choices.map((choice) => (
                  <Form.Check
                    type="radio"
                    name={`question-${question.questionID}`}
                    key={choice.choiceID}
                    label={choice.text}
                    checked={answers[question.questionID] === choice.choiceID}
                    onChange={() => handleAnswerChange(question.questionID, choice.choiceID)}
                  />
                ))}
              </div>
            ))}

            <Button
              variant="primary"
              className="mt-3 mb-2"
              onClick={handleSubmit}
              disabled={submitted}
            >
              Submit Exam
            </Button>
          </Form>
        )}
      </div>
    </Layout>
  );
};

export default ExamAttemptPage;
