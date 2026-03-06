import React, { useState, useEffect } from 'react';
import { toast,ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import api from '../api/api';
import {
  Table,
  Button,
  Modal,
  Form,
  Container,
  Row,
  Col,
  Spinner,
} from 'react-bootstrap';



const AdminUserManagement = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({});
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Fetch all users
  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const { data } = await api.get('/Profile/GetAll');
      setUsers(data);
    } catch (error) {
      toast.error('Failed to fetch users.');
    } finally {
      setIsLoading(false);
    }
  };

  // Save or update user
  const handleSaveUser = async () => {
    if (formData.password && formData.password !== passwordConfirm) {
      toast.error('Passwords do not match!');
      return;
    }
  
    try {
      const payload = { ...formData };
      if (!formData.password) {
        delete payload.password; // Remove password if not set
      }
  
      if (selectedUser) {
        // Update user
        await api.put(`/User/${selectedUser.userID}`, payload);
        toast.success('User updated successfully!');
      } else {
        // Add user
        await api.post('/User/Register', payload);
        toast.success('User added successfully!');
      }
  
      fetchUsers();
      setShowModal(false);
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || 'Failed to save user.';
      toast.error(errorMessage);
    }
  };

  // Delete user
  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;

    try {
      await api.delete(`/User/${userId}`);
      toast.success('User deleted successfully!');
      fetchUsers();
    } catch (error) {
      toast.error('Failed to delete user.');

      
    }
  };

  // Handle user edits
  const handleEditUser = (user) => {
    setSelectedUser(user);
    const { password, ...editableFields } = user; // Exclude password
    setFormData(editableFields);
    setPasswordConfirm(''); // Reset password confirmation
    setShowModal(true);
  };

  // Handle adding a new user
  const handleAddUser = () => {
    setSelectedUser(null);
    setFormData({});
    setPasswordConfirm(''); // Reset password confirmation
    setShowModal(true);
  };

  // Handle input changes
  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Map user type to readable labels
  const getUserTypeLabel = (userType) => {
    switch (userType) {
      case 0:
        return 'Student';
      case 1:
        return 'Teacher';
      case 2:
        return 'Administrator';
      default:
        return 'Unknown';
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <Container>
      <ToastContainer/>
      <Row className="my-4">
        <Col>
          <h2>User Management</h2>
          <Button variant="primary" onClick={handleAddUser}>
            Add User
          </Button>
        </Col>
      </Row>

      {isLoading ? (
        <Spinner animation="border" className="d-block mx-auto" />
      ) : (
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>ID</th>
              <th>Username</th>
              <th>Email</th>
              <th>First Name</th>
              <th>Last Name</th>
              <th>Type</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.userID}>
                <td>{user.userID}</td>
                <td>{user.username}</td>
                <td>{user.emailAddress}</td>
                <td>{user.firstName}</td>
                <td>{user.lastName}</td>
                <td>{getUserTypeLabel(user.userType)}</td>
                <td>
                  <Button variant="warning" size="sm" onClick={() => handleEditUser(user)}>
                    Edit
                  </Button>{' '}
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDeleteUser(user.userID)}
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      {/* Modal for Add/Edit User */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{selectedUser ? 'Edit User' : 'Add User'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="firstName">
              <Form.Label>First Name</Form.Label>
              <Form.Control
                type="text"
                name="firstName"
                value={formData.firstName || ''}
                onChange={handleInputChange}
              />
            </Form.Group>

            <Form.Group controlId="lastName" className="mt-3">
              <Form.Label>Last Name</Form.Label>
              <Form.Control
                type="text"
                name="lastName"
                value={formData.lastName || ''}
                onChange={handleInputChange}
              />
            </Form.Group>

            <Form.Group controlId="username" className="mt-3">
              <Form.Label>Username</Form.Label>
              <Form.Control
                type="text"
                name="username"
                value={formData.username || ''}
                onChange={handleInputChange}
              />
            </Form.Group>

            <Form.Group controlId="emailAddress" className="mt-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                name="emailAddress"
                value={formData.emailAddress || ''}
                onChange={handleInputChange}
              />
            </Form.Group>

            <Form.Group controlId="userType" className="mt-3">
              <Form.Label>User Type</Form.Label>
              <Form.Control
                as="select"
                name="userType"
                value={formData.userType || ''}
                onChange={handleInputChange}
              >
                <option value="">Select User Type</option>
                <option value="0">Student</option>
                <option value="1">Teacher</option>
                <option value="2">Administrator</option>
              </Form.Control>
            </Form.Group>

            <Form.Group controlId="password" className="mt-3">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                name="password"
                value={formData.password || ''}
                onChange={handleInputChange}
              />
            </Form.Group>

            <Form.Group controlId="passwordConfirm" className="mt-3">
              <Form.Label>Confirm Password</Form.Label>
              <Form.Control
                type="password"
                name="passwordConfirm"
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Close
          </Button>
          <Button variant="primary" onClick={handleSaveUser}>
            Save
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default AdminUserManagement;
