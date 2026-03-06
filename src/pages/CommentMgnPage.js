import React, { useState, useEffect } from "react";
import { Table, Button, Form, Row, Col } from "react-bootstrap";
import api from "../api/api"; // Axios instance with base URL
import { toast, ToastContainer } from "react-toastify";
import Layout from "../components/Layout";
import "../assets/Pagination.css"; // Include your pagination styles

const CommentMgnPage = () => {
  const [comments, setComments] = useState([]);
  const [filteredComments, setFilteredComments] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("");

  useEffect(() => {
    fetchComments();
  }, []);

  useEffect(() => {
    handleSearchAndFilter();
  }, [search, filter, comments]);

  const fetchComments = async () => {
    try {
      const response = await api.get("/CommentManagement/GetAllComments");

      if (Array.isArray(response.data)) {
        setComments(response.data);
        setFilteredComments(response.data);
      } else {
        setComments([]);
        setFilteredComments([]);
        toast.warning("No comments found.");
      }
    } catch (error) {
      setComments([]);
      setFilteredComments([]);
      toast.error("Failed to fetch comments");
    }
  };

  const acceptComment = async (commentId, entityType) => {
    try {
      const endpoint = `/CommentManagement/AcceptComment/${commentId}?entityType=${entityType}`;
      await api.post(endpoint);
      toast.success(`Comment accepted for ${entityType}`);
      fetchComments(); // Refresh comments after acceptance
    } catch (error) {
      toast.error(`Failed to accept comment for ${entityType}`);
    }
  };

  const deleteComment = async (commentId, entityType) => {
    try {
      const endpoint = `/CommentManagement/DeleteComment/${commentId}?entityType=${entityType}`;
      await api.delete(endpoint);
      toast.success(`Comment deleted for ${entityType}`);
      fetchComments(); // Refresh comments after deletion
    } catch (error) {
      toast.error(`Failed to delete comment for ${entityType}`);
    }
  };

  const handleSearchAndFilter = () => {
    let filtered = comments;

    if (search) {
      filtered = filtered.filter((comment) =>
        comment.commentText.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (filter) {
      filtered = filtered.filter((comment) =>
        filter === "accepted" ? comment.isAccepted : !comment.isAccepted
      );
    }

    setFilteredComments(filtered);
    setCurrentPage(1);
  };

  // Pagination logic
  const indexOfLastRow = currentPage * pageSize;
  const indexOfFirstRow = indexOfLastRow - pageSize;
  const currentComments = filteredComments.slice(
    indexOfFirstRow,
    indexOfLastRow
  );
  const totalPages = Math.ceil(filteredComments.length / pageSize);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
  
      <div>
        <ToastContainer />
        <h3>Comments Management</h3>

        <Row className="mb-3 align-items-center">
          <Col md={8}>
            <Form.Control
              placeholder="Search comments"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </Col>
          <Col md={4} className="d-flex justify-content-end">
            <Form.Group className="d-flex align-items-center w-100">
              <Form.Select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="filter-select ms-auto"
              >
                <option value="">All</option>
                <option value="accepted">Accepted</option>
                <option value="unaccepted">Unaccepted</option>
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>

        {/* Comments Table */}
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>Comment Text</th>
              <th>Author</th>
              <th>Entity</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentComments.length > 0 ? (
              currentComments.map((comment) => (
                <tr key={comment.commentID}>
                  <td>{comment.commentText}</td>
                  <td>{comment.userName}</td>
                  <td>{comment.entityType}</td>
                  <td>{new Date(comment.commentDate).toLocaleString()}</td>
                  <td>
                    {!comment.isAccepted && (
                      <Button
                        variant="success"
                        className="me-2"
                        onClick={() =>
                          acceptComment(comment.commentID, comment.entityType)
                        }
                      >
                        Accept
                      </Button>
                    )}
                    <Button
                      variant="danger"
                      onClick={() =>
                        deleteComment(comment.commentID, comment.entityType)
                      }
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center">
                  No comments to display
                </td>
              </tr>
            )}
          </tbody>
        </Table>

        {/* Pagination */}
        <div className="pagination">
          <button
            className="page-btn"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          {[...Array(totalPages).keys()].map((number) => (
            <button
              key={number + 1}
              className={`page-btn ${
                currentPage === number + 1 ? "active" : ""
              }`}
              onClick={() => handlePageChange(number + 1)}
            >
              {number + 1}
            </button>
          ))}
          <button
            className="page-btn"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      </div>
    
  );
};

export default CommentMgnPage;
