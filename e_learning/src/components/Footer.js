// src/components/Footer.js
import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';

const Footer = () => {
    return (
        <footer className="bg-dark text-light py-4 mt-4">
            <Container>
                <Row>
                    <Col md={6}>
                        <h5>E-Learning Platform</h5>
                        <p>Your gateway to knowledge and growth.</p>
                    </Col>
                    <Col md={3}>
                        <h5>Quick Links</h5>
                        <ul className="list-unstyled">
                            <li><a href="/home" className="text-light">Home</a></li>
                            <li><a href="/home" className="text-light">Profile</a></li>
                            <li><a href="/home" className="text-light">About Us</a></li>
                        </ul>
                    </Col>
                    <Col md={3}>
                        <h5>Contact Us</h5>
                        <p>Email: K2336276@kingston.ac.uk</p>
                        <p>Phone: +44123456789</p>
                    </Col>
                </Row>
                <Row className="mt-3">
                    <Col className="text-center">
                        <p className="mb-0">&copy; {new Date().getFullYear()} E-Learning Platform. All Rights Reserved.</p>
                    </Col>
                </Row>
            </Container>
        </footer>
    );
};

export default Footer;
