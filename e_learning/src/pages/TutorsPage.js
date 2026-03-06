import React from 'react';
import {  Container, Row, Col, Card } from 'react-bootstrap';
import { FaBook, FaBookOpen, FaClipboardList, FaCogs, FaComment, FaFileAlt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout'; 

const TutorsPage = () => {
    const navigate = useNavigate();

    const cardData = [
        {
            title: 'Course Management',
            icon: <FaBook />,
            action: () => navigate('/CourseMgn'),
            color: 'primary',
            description: 'Manage your courses, add new or update existing sessions.',
        },
        {
            title: 'LearningPaths Management',
            icon: <FaBookOpen />,
            action: () => navigate('/LearningPathsMgn'),
            color: 'info',
            description: 'Manage your LearningPaths, add new or update existing LearningPaths.',
        },
        {
            title: 'Exam Management',
            icon: <FaComment/>,
            action: () =>  navigate('/ExamMgn/'),
            color: 'warning',
            description: 'Manage Exams , Add new or update existing Exams.',
        },
        {
            title: 'Future functionality',
            icon: <FaFileAlt />,
            action: () => alert('Placeholder for future functionality.'),
            color: 'info',
            description: 'future functionality, Placeholder for future functionality.',
        },
    ];

    return (
        <Layout>
            <Container className="mt-5">
                <h1 className="text-center mb-5">Tutors Portal</h1>
                <Row className="g-4">
                    {cardData.map((card, index) => (
                        <Col key={index} xs={12} sm={6} lg={3}>
                            <Card
                                style={{ 
                                    cursor: 'pointer', 
                                    transition: 'transform 0.3s, box-shadow 0.3s' 
                                }}
                                onClick={card.action}
                                className={`text-center text-white bg-${card.color}`}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'scale(1.05)';
                                    e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'scale(1)';
                                    e.currentTarget.style.boxShadow = 'none';
                                }}
                            >
                                <Card.Body>
                                    <div className="display-1 mb-3">{card.icon}</div>
                                    <Card.Title>{card.title}</Card.Title>
                                    <Card.Text>{card.description}</Card.Text>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))}
                </Row>
            </Container>
        </Layout>
    );
};

export default TutorsPage;
