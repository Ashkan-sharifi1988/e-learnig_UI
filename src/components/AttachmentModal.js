import React, { useState, useEffect } from "react";
import { Modal, Button, ProgressBar, Table, Form } from "react-bootstrap";
import { useDropzone } from "react-dropzone";
import { toast ,ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import api from "../api/api";

const AttachmentModal = ({ entityType, entityId, show, onClose }) => {
    const [attachments, setAttachments] = useState([]);
    const [uploadQueue, setUploadQueue] = useState([]);
    const [uploadProgress, setUploadProgress] = useState({});
    const [isUploading, setIsUploading] = useState(false);

    useEffect(() => {
        if (show) {
            fetchAttachments();
        }
    }, [show]);

    const fetchAttachments = async () => {
        try {
            const response = await api.get(`/${entityType}Attachment/${entityType}/${entityId}`);
            const attachmentData = response.data?.data || [];
            setAttachments(Array.isArray(attachmentData) ? attachmentData : []);
        } catch (error) {
            console.error(`Error fetching attachments for ${entityType}:`, error);
            toast.error("Failed to fetch attachments.");
            setAttachments([]);
        }
    };

    const { getRootProps, getInputProps } = useDropzone({
        accept: "*",
        onDrop: (acceptedFiles) => {
            const filesWithMetadata = acceptedFiles.map((file) => ({
                file,
                name: file.name,
                description: "",
            }));
            setUploadQueue((prev) => [...prev, ...filesWithMetadata]);
        },
    });

    const handleNameChange = (index, value) => {
        setUploadQueue((prev) =>
            prev.map((item, idx) =>
                idx === index ? { ...item, name: value } : item
            )
        );
    };

    const handleDescriptionChange = (index, value) => {
        setUploadQueue((prev) =>
            prev.map((item, idx) =>
                idx === index ? { ...item, description: value } : item
            )
        );
    };

    const handleUpload = async () => {
        setIsUploading(true);
        const progress = {};

        try {
            const promises = uploadQueue.map(async ({ file, name, description }) => {
                const formData = new FormData();
                formData.append("file", file);
                formData.append("CourseAttachmentName", name);
                formData.append("CourseAttachmentDescription", description);
                formData.append(`${entityType}ID`, entityId);

                try {
                    const response = await api.post(`/${entityType}Attachment`, formData, {
                        headers: {
                            "Content-Type": "multipart/form-data",
                        },
                        onUploadProgress: (event) => {
                            progress[file.name] = Math.round((event.loaded * 100) / event.total);
                            setUploadProgress({ ...progress });
                        },
                    });

                    toast.success(`File "${name}" uploaded successfully!`);
                    fetchAttachments();
                    return response.data?.data;
                } catch (error) {
                    console.error(`Error uploading file to ${entityType}:`, error);
                    toast.error(`Failed to upload file "${name}".`);
                    return null;
                }
            });

            const uploadedAttachments = (await Promise.all(promises)).filter(Boolean);
            setAttachments((prev) => [...prev, ...uploadedAttachments]); // Update table dynamically
        } catch (error) {
            console.error("Error during batch upload:", error);
            toast.error("Failed to upload files.");
        } finally {
            setUploadQueue([]);
            setIsUploading(false);
            setUploadProgress({});
        }
    };

    const handleDelete = async (attachmentId) => {
        try {
            await api.delete(`/${entityType}Attachment/${attachmentId}`);
            setAttachments((prev) =>
                prev.filter((attachment) => getAttachmentId(attachment) !== attachmentId)
            );
            toast.success("Attachment deleted successfully.");
        } catch (error) {
            console.error(`Error deleting attachment from ${entityType}:`, error);
            toast.error("Failed to delete attachment.");
        }
    };

    const getAttachmentId = (attachment) => {
        return attachment?.courseAttachmentID || attachment?.id || null;
    };

    const getAttachmentName = (attachment) => {
        return attachment?.courseAttachmentName || attachment?.name || "Unnamed";
    };

    const getAttachmentDescription = (attachment) => {
        return attachment?.courseAttachmentDescription || attachment?.description || "N/A";
    };

    return (
        <Modal show={show} onHide={onClose} size="lg">
             <ToastContainer />
            <Modal.Header closeButton>
                <Modal.Title>Manage Attachments for {entityType} {entityId}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div {...getRootProps({ className: "dropzone" })} style={{ border: "2px dashed #007bff", padding: "20px", textAlign: "center" }}>
                    <input {...getInputProps()} />
                    <p>Drag and drop files here, or click to browse</p>
                </div>
                {uploadQueue.length > 0 && (
                    <div className="mt-3">
                        {uploadQueue.map((item, index) => (
                            <div key={item.file.name} className="mt-3">
                                <Form.Group>
                                    <Form.Label>Attachment Name</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={item.name}
                                        onChange={(e) => handleNameChange(index, e.target.value)}
                                    />
                                </Form.Group>
                                <Form.Group>
                                    <Form.Label>Attachment Description</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Enter description"
                                        value={item.description}
                                        onChange={(e) => handleDescriptionChange(index, e.target.value)}
                                    />
                                </Form.Group>
                                <ProgressBar
                                    now={uploadProgress[item.file.name] || 0}
                                    label={`${uploadProgress[item.file.name] || 0}%`}
                                />
                            </div>
                        ))}
                        <Button className="mt-3" onClick={handleUpload} disabled={isUploading} variant="primary">
                            Upload Files
                        </Button>
                    </div>
                )}
                <div style={{ maxHeight: "400px", overflowY: "auto" }}>
                    {attachments.length > 0 ? (
                        <Table striped bordered hover className="mt-4">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Description</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {attachments.map((attachment) => (
                                    <tr key={getAttachmentId(attachment)}>
                                        <td>{getAttachmentName(attachment)}</td>
                                        <td>{getAttachmentDescription(attachment)}</td>
                                        <td>
                                            <Button
                                                variant="danger"
                                                size="sm"
                                                onClick={() => handleDelete(getAttachmentId(attachment))}
                                            >
                                                Delete
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    ) : (
                        <p className="mt-4 text-center">No attachments found.</p>
                    )}
                </div>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onClose}>
                    Close
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default AttachmentModal;
