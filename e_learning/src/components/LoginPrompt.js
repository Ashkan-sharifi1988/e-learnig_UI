import React from "react";
import { Modal, Button } from "react-bootstrap";

const LoginPrompt = ({ show, onHide, onLogin, action }) => {
    return (
        <Modal show={show} onHide={onHide} centered>
            <Modal.Header closeButton>
                <Modal.Title>Login Required</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                To {action} a course, you need to log in. Would you like to log in now?
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onHide}>
                    Cancel
                </Button>
                <Button variant="primary" onClick={onLogin}>
                    Log In
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default LoginPrompt;
