import React, { useState, useEffect } from "react";
import { toast, ToastContainer, Slide } from "react-toastify"; // Ensure correct imports
import api from "../api/api";
import "react-toastify/dist/ReactToastify.css"; // Ensure Toastify CSS is imported
import "../assets/CommentComponent.css";
import { FaTrashAlt, FaEdit, FaReply } from "react-icons/fa";
import config from "../config";
import noImageProfile from '../assets/Images/No-Image-Profile.png';

const CommentComponent = ({ userID, id, entity }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [replyTo, setReplyTo] = useState(null);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editedText, setEditedText] = useState("");
  

  const standardizeComments = (comments, entity) => {
    return comments.map((comment) => ({
      id: entity === "course" ? comment.courseCommentID : comment.courseSessionCommentID,
      text: comment.commentText,
      date: comment.commentDate,
      isAccepted: comment.isAccepted,
      parentId: comment.parentCommentID || null,
      entityId: entity === "course" ? comment.courseID : comment.courseSessionID,
      userId: comment.userID,
      userName: comment.userName,
      userProfilePicture: comment.userProfilePicture,
    }));
  };

  const fetchComments = async () => {
    try {
      const endpoint = `/${entity === "course" ? "CourseComment" : "CourseSessionComment"}/${entity === "course" ? "course" : "session"}/${id}`;

      const response = await api.get(endpoint);
      if (response.data.success) {
        const standardizedComments = standardizeComments(response.data.data, entity);
        setComments(standardizedComments);
      } else {
        toast.error(response.data.message);
        console.error("Error in API response:", response.data.message);
      }
    } catch (error) {
      console.error("Error fetching comments:", error);
      toast.error("Failed to load comments");
    }
  };

  useEffect(() => {
    fetchComments();
  }, [id, entity]);

  const handleAddComment = async () => {
    if (!newComment.trim()) {
      toast.error("Comment cannot be empty");
      return;
    }

    const commentData = {
      CommentText: newComment,
      ParentCommentID: replyTo, // Ensure this is set correctly for replies
      UserID: userID,
      [`${entity}ID`]: id,
    };

    try {
      const endpoint = `/${entity === "course" ? "CourseComment" : "CourseSessionComment"}`;
      const response = await api.post(endpoint, commentData);

      if (response.status === 200) {
        const newCommentObj = {
          id: response.data.courseCommentID || response.data.courseSessionCommentID,
          text: newComment,
          date: new Date().toISOString(),
          isAccepted: false,
          parentId: replyTo, // Set the parent ID for replies
          entityId: id,
          userId: userID,
          userName: response.data.userName || "User",
          userProfilePicture: response.data.userProfilePicture
            ? `${config.BaseUrl}${response.data.userProfilePicture}`
            : noImageProfile,
        };

        setComments((prevComments) => [...prevComments, newCommentObj]);
        setNewComment("");
        setReplyTo(null);
        fetchComments();
        toast.success("Comment added successfully");
      } else {
        toast.error(response.data);
      }
    } catch (error) {
      console.error("Error adding comment:", error);
      toast.error("Failed to add comment");
    }
  };

  const handleEditComment = async (commentId) => {
    if (!editedText.trim()) {
      toast.error("Edited comment cannot be empty");
      return;
    }

    try {
      const endpoint = `/${entity === "course" ? "CourseComment" : "CourseSessionComment"}/${commentId}`;

      const response = await api.put(endpoint, { CommentText: editedText });

      if (response.status === 200) {
        setComments((prevComments) =>
          prevComments.map((comment) =>
            comment.id === commentId
              ? { ...comment, text: editedText }
              : comment
          )
        );
        setEditingCommentId(null);
        setEditedText("");
        toast.success("Comment edited successfully");
      } else {
        toast.error(response.data);
      }
    } catch (error) {
      console.error("Error editing comment:", error);
      toast.error("Failed to edit comment");
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      const endpoint = `/${entity === "course" ? "CourseComment" : "CourseSessionComment"}/${commentId}`;

      const response = await api.delete(endpoint);

      if (response.status === 200) {
        setComments((prevComments) =>
          prevComments.filter((comment) => comment.id !== commentId)
        );
        toast.success(response.data);
      } else {
        toast.error(response.data);
      }
    } catch (error) {
      console.error("Error deleting comment:", error);
      toast.error("Failed to delete comment");
    }
  };

  const formatDate = (date) => {
    const options = { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" };
    return new Date(date).toLocaleDateString(undefined, options);
  };

  return (
    <div>
      <ToastContainer position="top-right" transition={Slide} />
      <h4>Comments</h4>
      <ul className="comment-list">
        {comments
          .filter(
            (comment) =>
              comment.isAccepted || parseInt(comment.userId) === parseInt(userID) // Show accepted comments or unaccepted ones from the current user
          )
          .filter((comment) => !comment.parentId) // Show only top-level comments
          .map((comment, index, array) => (
            <li key={comment.id} className="comment-item">
              <div className="comment-header">
                <img
                  src={comment.userProfilePicture ? `${config.BaseUrl}${comment.userProfilePicture}` : noImageProfile}
                  alt="User Avatar"
                  className="comment-avatar"
                />
                <div>
                  <strong>{comment.userName}</strong>
                  <span className="comment-date">{formatDate(comment.date)}</span>
                </div>
              </div>
              <div className="comment-body">
                {editingCommentId === comment.id ? (
                  <textarea
                    value={editedText}
                    onChange={(e) => setEditedText(e.target.value)}
                    className="edit-textarea"
                  ></textarea>
                ) : (
                  <p>{comment.text}</p>
                )}
              </div>
              <div className="comment-actions">
                {parseInt(comment.userId) === parseInt(userID) && (
                  <>
                    {editingCommentId === comment.id ? (
                      <button
                        onClick={() => handleEditComment(comment.id)}
                        className="action-button save"
                      >
                        Save
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          setEditingCommentId(comment.id);
                          setEditedText(comment.text);
                        }}
                        className="action-button edit"
                      >
                        <FaEdit />
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteComment(comment.id)}
                      className="action-button delete"
                    >
                      <FaTrashAlt />
                    </button>
                  </>
                )}
                <button
                  onClick={() => setReplyTo(replyTo === comment.id ? null : comment.id)}
                  className="action-button reply"
                >
                  <FaReply />
                </button>
              </div>
              <ul className="reply-list">
                {comments
                  .filter((reply) => reply.parentId === comment.id)
                  .map((reply) => (
                    <li key={reply.id} className="reply-item">
                      <div className="comment-header">
                        <img
                          src={reply.userProfilePicture ? `${config.BaseUrl}${reply.userProfilePicture}` : noImageProfile}
                          alt="User Avatar"
                          className="comment-avatar"
                        />
                        <div>
                          <strong>{reply.userName}</strong>
                          <span className="comment-date">{formatDate(reply.date)}</span>
                        </div>
                      </div>
                      <div className="comment-body">
                        <p>{reply.text}</p>
                      </div>
                    </li>
                  ))}
              </ul>
              {index === array.length - 1 && replyTo && (
                <div className="reply-box">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Write a reply..."
                    className="reply-textarea"
                  ></textarea>
                  <button onClick={handleAddComment} className="add-reply-button">
                    Post Reply
                  </button>
                </div>
              )}
            </li>
          ))}
      </ul>
      <div className="add-comment">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Write a comment..."
          className="new-comment-textarea"
        ></textarea>
        <button onClick={handleAddComment} className="add-comment-button">
          Post
        </button>
      </div>
    </div>
  );
};

export default CommentComponent;
