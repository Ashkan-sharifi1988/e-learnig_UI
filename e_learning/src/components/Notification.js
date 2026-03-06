import React, { useEffect, useState } from 'react';
import { Dropdown, Badge, DropdownButton } from 'react-bootstrap';
import { FaBell } from 'react-icons/fa';
import api from '../api/api'; // Make sure you have an API setup to fetch notifications

const Notification = ({ userId }) => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const response = await api.get(`/notification/${userId}`);
                setNotifications(response.data);
                setUnreadCount(response.data.filter(n => !n.isRead).length); // Count unread notifications
            } catch (error) {
                console.error('Error fetching notifications:', error);
            }
        };

        if (userId) {
            fetchNotifications();
        }
    }, [userId]);

    const markAsRead = (notificationId) => {
        api.put(`/notifications/read/${notificationId}`).then(() => {
            setNotifications(notifications.map(n => 
                n.notificationID === notificationId ? { ...n, isRead: true } : n
            ));
            setUnreadCount(unreadCount - 1);
        });
    };

    return (
        <Dropdown align="end">
            <Dropdown.Toggle variant="link" id="notification-dropdown">
                <FaBell size={25} />
                {unreadCount > 0 && (
                    <Badge pill bg="danger" style={{ position: 'absolute', top: 0, right: 0 }}>
                        {unreadCount}
                    </Badge>
                )}
            </Dropdown.Toggle>

            <Dropdown.Menu>
                {notifications.length > 0 ? (
                    notifications.map((notification) => (
                        <Dropdown.Item 
                            key={notification.notificationID} 
                            onClick={() => markAsRead(notification.notificationID)}
                            style={{ backgroundColor: notification.isRead ? '#f8f9fa' : '#d1ecf1' }}
                        >
                            {notification.message}
                        </Dropdown.Item>
                    ))
                ) : (
                    <Dropdown.Item>No new notifications</Dropdown.Item>
                )}
            </Dropdown.Menu>
        </Dropdown>
    );
};

export default Notification;
