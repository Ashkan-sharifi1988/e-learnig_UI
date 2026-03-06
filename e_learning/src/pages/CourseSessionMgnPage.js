import React, { useState, useEffect, useCallback } from 'react';
import { Container, Table, Button, Modal, Form, Row, Col, Alert, Pagination } from 'react-bootstrap';
import { FaPlus, FaEdit, FaTrash, FaArrowLeft, FaEye } from 'react-icons/fa';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api/api';
import noImageSession from '../assets/Images/No-Image-Session.png';
import Layout from '../components/Layout';
import config from '../config';

const CourseSessionPage = () => {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const [sessions, setSessions] = useState([]);
    const [showSessionModal, setShowSessionModal] = useState(false);
    const [selectedSession, setSelectedSession] = useState(null);
    const [errors, setErrors] = useState({});
    const [alertMessage, setAlertMessage] = useState(null);
    const [alertType, setAlertType] = useState('success');
    const [sessionData, setSessionData] = useState({
        courseSessionTitle: '',
        courseSessionDescription: '',
        courseSessionDuration: '',
        courseSessionStartDateTime:'',
        courseSessionVideoURL:null, 
        courseSessionPicture: null,
       
    });
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredSessions, setFilteredSessions] = useState([]);
    const [activePage, setActivePage] = useState(1);
    const itemsPerPage = 5;


    const [courseType, setCourseType] = useState(null);
    // Fetch course Type
    useEffect(() => {
        const fetchCourseDetails = async () => {
            try {
                const response = await api.get(`/Course/${courseId}`);
                setCourseType(response.data.courseType); // true for online, false for recorded
            } catch (error) {
                console.error('Error fetching course details:', error);
            }
        };
        fetchCourseDetails();
    }, [courseId]);


    // Fetch course sessions
    const fetchSessions = useCallback(async () => {
        try {
            const response = await api.get(`/CourseSession/course/${courseId}`);
            setSessions(response.data);
            setFilteredSessions(response.data);
        } catch (error) {
            console.error('Error fetching sessions:', error);
        }
    }, [courseId]);

    useEffect(() => {
        fetchSessions();
    }, [fetchSessions]);

    useEffect(() => {
        const filtered = sessions.filter(session =>
            session.courseSessionTitle.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredSessions(filtered);
    }, [searchTerm, sessions]);

    const validateFields = () => {
        const newErrors = {};
        if (!sessionData.courseSessionTitle.trim()) newErrors.courseSessionTitle = 'Session title is required.';
        if (!sessionData.courseSessionDescription.trim()) newErrors.courseSessionDescription = 'Description is required.';
        if (!sessionData.courseSessionDuration) newErrors.courseSessionDuration = 'Session duration is required.';
      //  if (!sessionData.courseSessionVideoURL) newErrors.courseSessionVideoURL = 'Session video URL is required.';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSessionSubmit = async () => {
        if (!validateFields()) return;

        const formData = new FormData();
        formData.append("CourseID", courseId);
        formData.append("courseSessionTitle", sessionData.courseSessionTitle);
        formData.append("courseSessionDescription", sessionData.courseSessionDescription);
        formData.append("courseSessionPicture", sessionData.courseSessionPicture);
        formData.append("courseSessionDuration", sessionData.courseSessionDuration);
       
        

       
        formData.append('courseSessionVideoURL', sessionData.courseSessionVideoURL);
        if (sessionData.courseSessionStartDateTime) {
            const utcDateTime = new Date(sessionData.courseSessionStartDateTime).toISOString(); // Convert to UTC
            formData.append("courseSessionStartDateTime", utcDateTime);
        }

        try {
            if (selectedSession) {
                await api.put(`/CourseSession/${selectedSession.courseSessionID}`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
                setAlertMessage('Session updated successfully!');
            } else {
                await api.post('/CourseSession', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
                setAlertMessage('Session added successfully!');
            }
            setAlertType('success');
            fetchSessions();
            setShowSessionModal(false);
        } catch (error) {
            console.error('Error saving session:', error);
            setAlertMessage('An error occurred while saving the session.');
            setAlertType('danger');
        }
    };

    const handleDeleteSession = async (sessionId) => {
        if (window.confirm('Are you sure you want to delete this session?')) {
            try {
                await api.delete(`/CourseSession/${sessionId}`);
                setAlertMessage('Session deleted successfully!');
                setAlertType('success');
                fetchSessions();
            } catch (error) {
                console.error('Error deleting session:', error);
                setAlertMessage('An error occurred while deleting the session.');
                setAlertType('danger');
            }
        }
    };

    const handleEditSession = (session) => {
        setSelectedSession(session);
        const formattedDateTime = session.courseSessionStartDateTime
        ? new Date(session.courseSessionStartDateTime).toISOString().slice(0, 16) // Keep only YYYY-MM-DDTHH:mm
        : "";
        setSessionData({
            courseSessionTitle: session.courseSessionTitle,
            courseSessionDescription: session.courseSessionDescription,
            courseSessionPicture: null,
            courseSessionDuration: session.courseSessionDuration,
            courseSessionVideoURL: session.courseSessionVideoURL,
            courseSessionStartDateTime:formattedDateTime,
        });
        setErrors({});
        setShowSessionModal(true);
    };

    const handleAddSession = () => {
        setSelectedSession(null);
        setSessionData({
            courseSessionTitle: '',
            courseSessionDescription: '', 
            courseSessionDuration: '',
            courseSessionVideoURL: '',
            courseSessionPicture: null,
            courseSessionStartDateTime: '',
        });
        setErrors({});
        setShowSessionModal(true);
    };

    const handlePictureChange = (e) => {
        setSessionData({ ...sessionData, courseSessionPicture: e.target.files[0] });
    };

    const handleVideoURLChange = (e) => {
        setSessionData({ ...sessionData, courseSessionVideoURL: e.target.files[0] });
    };

    


    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const indexOfLastItem = activePage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentSessions = filteredSessions.slice(indexOfFirstItem, indexOfLastItem);

    const totalPages = Math.ceil(filteredSessions.length / itemsPerPage);



    return (
        <Layout>
            <Container className="mt-4">
                <Button variant="secondary" onClick={() => navigate('/courseMgn')} className="mb-3">
                    <FaArrowLeft /> Back to Courses
                </Button>

                <h1 className="mb-4">Manage Sessions for Course ID: {courseId}</h1>

                {alertMessage && (
                    <Alert variant={alertType} onClose={() => setAlertMessage(null)} dismissible>
                        {alertMessage}
                    </Alert>
                )}

                <Row className="mb-3">
                    <Col md={6}>
                        <Button variant="primary" onClick={handleAddSession}>
                            <FaPlus /> Add Session
                        </Button>
                    </Col>
                    <Col md={6}>
                        <Form.Control
                            type="text"
                            placeholder="Search sessions..."
                            value={searchTerm}
                            onChange={handleSearchChange}
                        />
                    </Col>
                </Row>

                <Table striped bordered hover>
                    <thead>
                        <tr>
                            <th>Image</th>
                            <th>Title</th>
                            <th>Description</th>
                            <th>Duration</th>
                            <th>Video</th>
                            <th>StartDate</th>
                            
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentSessions.map((session) => (
                            <tr key={session.courseSessionID}>
                                <td>
                                    <img
                                        src={session.courseSessionPicture ? config.BaseUrl+session.courseSessionPicture : noImageSession}
                                        alt={session.courseSessionTitle}
                                        style={{ width: '100px', height: 'auto' }}
                                    />
                                </td>
                                <td>{session.courseSessionTitle}</td>
                                <td>{session.courseSessionDescription}</td>
                                <td>{session.courseSessionDuration}</td>
                                <td>
                                    <Button variant="info" onClick={() => window.open(session.courseSessionURL, '_blank')}>
                                        <FaEye /> Preview
                                    </Button>
                                </td>
                                <td>
  {session.courseSessionStartDateTime
    ? new Date(session.courseSessionStartDateTime.replace(' ', 'T')).toLocaleString()
    : "N/A"}
</td>

                                <td>
                                <Button
                    variant="success"
                    className="me-2"
                    onClick={() => navigate(`/OnlineSession/${session.sessionCode}?isHost=true`)}
                >
                    Start Session
                </Button>
                                    <Button
                                        variant="warning"
                                        className="me-2"
                                        onClick={() => handleEditSession(session)}
                                    >
                                        <FaEdit /> Edit
                                    </Button>
                                    <Button
                                        variant="danger"
                                        onClick={() => handleDeleteSession(session.courseSessionID)}
                                    >
                                        <FaTrash /> Delete
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>

                <Pagination>
                    {[...Array(totalPages).keys()].map((number) => (
                        <Pagination.Item
                            key={number + 1}
                            active={number + 1 === activePage}
                            onClick={() => setActivePage(number + 1)}
                        >
                            {number + 1}
                        </Pagination.Item>
                    ))}
                </Pagination>

                <Modal show={showSessionModal} onHide={() => setShowSessionModal(false)}>
                    <Modal.Header closeButton>
                        <Modal.Title>{selectedSession ? 'Edit Session' : 'Add Session'}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        {Object.keys(errors).length > 0 && (
                            <Alert variant="danger">
                                {Object.values(errors).map((err, index) => (
                                    <p key={index}>{err}</p>
                                ))}
                            </Alert>
                        )}
                        <Form>
                            <Form.Group>
                                <Form.Label>Session Title</Form.Label>
                                <Form.Control
                                    value={sessionData.courseSessionTitle}
                                    onChange={(e) =>
                                        setSessionData({ ...sessionData, courseSessionTitle: e.target.value })
                                    }
                                    isInvalid={!!errors.courseSessionTitle}
                                />
                                <Form.Control.Feedback type="invalid">
                                    {errors.courseSessionTitle}
                                </Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group>
                                <Form.Label>Session Description</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={3}
                                    value={sessionData.courseSessionDescription}
                                    onChange={(e) =>
                                        setSessionData({ ...sessionData, courseSessionDescription: e.target.value })
                                    }
                                    isInvalid={!!errors.courseSessionDescription}
                                />
                                <Form.Control.Feedback type="invalid">
                                    {errors.courseSessionDescription}
                                </Form.Control.Feedback>
                            </Form.Group>
                          
                            <Form.Group>
                                <Form.Label>Session Duration (in HH:MM:SS format)</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={sessionData.courseSessionDuration}
                                    onChange={(e) =>
                                        setSessionData({ ...sessionData, courseSessionDuration: e.target.value })
                                    }
                                    isInvalid={!!errors.courseSessionDuration}
                                />
                                <Form.Control.Feedback type="invalid">
                                    {errors.courseSessionDuration}
                                </Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group>
                                <Form.Label>Session Picture</Form.Label>
                                <Form.Control type="file" onChange={handlePictureChange} />
                            </Form.Group>
                          
                            <Form.Group>
    <Form.Label>Session Start Date and Time</Form.Label>
    <Form.Control
    type="datetime-local"
    value={sessionData.courseSessionStartDateTime || ""}
    onChange={(e) => {
        const localDateTime = e.target.value; // Validate input format
        if (localDateTime) {
            setSessionData({
                ...sessionData,
                courseSessionStartDateTime: localDateTime,
            });
        }
    }}
    isInvalid={!!errors.courseSessionStartDateTime}
/>
    <Form.Control.Feedback type="invalid">
        {errors.courseSessionStartDateTime}
    </Form.Control.Feedback>
</Form.Group>

<Form.Group>
    <Form.Label>Session Video URL</Form.Label>
    <Form.Control 
        type="file" 
        onChange={handleVideoURLChange} 
        disabled={courseType === true} // Disable for online courses
    />
    {courseType === true && (
        <Form.Text muted>
            Video input is disabled for online courses.
        </Form.Text>
    )}
</Form.Group>
                        </Form>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowSessionModal(false)}>
                            Close
                        </Button>
                        <Button variant="primary" onClick={handleSessionSubmit}>
                            Save Session
                        </Button>
                    </Modal.Footer>
                </Modal>
            </Container>
        </Layout>
    );
};

export default CourseSessionPage;
