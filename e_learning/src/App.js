import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate,Outlet  } from 'react-router-dom';

import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import HomePage from './pages/HomePage';
import ProfilePage from './pages/ProfilePage';
import TutorsPage from './pages/TutorsPage';
import CoursePage from './pages/CourseMgnPage';
import CourseSessionPage from './pages/CourseSessionMgnPage';
import SessionsPage from './pages/SessionsPage';
import VideoSessionPage from './pages/VideoSessionPage';
import { BasketProvider } from './context/Basket';
import PaymentPage from './pages/PaymentPage';
import UserCoursesPage from './pages/UserCoursesPage';
import OnlineSessionPage from './pages/OnlineSessionPage';
import ExamManagement from './pages/ExamMgnPage';
import ExamQuestionPage from './pages/ExamQuestionMgnPage';
import ExamAttempt from './pages/ExamAttemptPage';
import ExamPage from './pages/ExamPage';
import NotAuthorizedPage from './pages/NotAuthorizedPage';
import LearningPathsMgnPage from './pages/LearningPathsMgnPage';
import LearningPathsPage from './pages/LearningPathsPage';
import UserLearningPathsPage from './pages/UserLearningPathsPage';
import CommentMgnPage from './pages/CommentMgnPage';
import UserManagement from './components/UserManagement';
import AdminPanel from './pages/AdminPanel';

import { AuthProvider, AuthContext } from './context/AuthContext';

// PrivateRoute Component
const PrivateRoute = ({ children }) => {
  const { isAuthenticated } = useContext(AuthContext);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/home" element={<HomePage />} />
      

      {/* Private Routes */}
      
      <Route path="/profile" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
      <Route path="/Tutors" element={<PrivateRoute><TutorsPage /></PrivateRoute>} />
      <Route path="/CourseMgn" element={<PrivateRoute><CoursePage /></PrivateRoute>} />
      <Route path="/CourseMgn/:courseId" element={<PrivateRoute><CourseSessionPage /></PrivateRoute>} />
      <Route path="/course/:courseId/sessions" element={<PrivateRoute><SessionsPage /></PrivateRoute>} />
      <Route path="/session/:sessionID" element={<PrivateRoute><VideoSessionPage /></PrivateRoute>} />
      <Route path="/payment" element={<PrivateRoute><PaymentPage /></PrivateRoute>} />
      <Route path="/usercourses" element={<PrivateRoute><UserCoursesPage /></PrivateRoute>} />
      <Route path="/onlineSession/:sessionCode" element={<PrivateRoute><OnlineSessionPage /></PrivateRoute>} />
      <Route path="/ExamMgn/:courseID?" element={<PrivateRoute><ExamManagement /></PrivateRoute>} />
      <Route path="/exam/:examID/questions" element={<PrivateRoute><ExamQuestionPage /></PrivateRoute>} />
      <Route path="/examAttempt/:examID" element={<PrivateRoute><ExamAttempt /></PrivateRoute>} />
      <Route path="/exams" element={<PrivateRoute><ExamPage /></PrivateRoute>} />
      <Route path="/LearningPathsMgn" element={<PrivateRoute><LearningPathsMgnPage /></PrivateRoute>} />
      <Route path="/LearningPaths" element={<PrivateRoute><LearningPathsPage /></PrivateRoute>} />
      <Route path="/MyLearningPaths" element={<PrivateRoute><UserLearningPathsPage /></PrivateRoute>} />
      <Route path="/NotAuthorized" element={<NotAuthorizedPage />} />
    

        {/* Admin Panel Layout */}
        <Route path="/Admin" element={<PrivateRoute><AdminPanelLayout /></PrivateRoute>}>
        <Route path="home" element={<h2>Welcome to the Admin Panel</h2>} />
        <Route path="userManagement" element={<UserManagement />} />
        <Route path="CommentMgnPage" element={<CommentMgnPage />} />
        <Route path="settings" element={<h2>Settings Page</h2>} />
      </Route>

      {/* Default Redirect */}
      <Route path="/" element={<Navigate to="/home" />} />
      <Route path="*" element={<h2>404 - Page Not Found</h2>} />
    </Routes>
  );
}
const AdminPanelLayout = () => {
  return (
    <AdminPanel>
      <Outlet /> {/* Render child routes inside AdminPanel layout */}
    </AdminPanel>
  );
};

function App() {
  return (
    <AuthProvider>
      <BasketProvider>
        <Router>
          <AppRoutes />
        </Router>
      </BasketProvider>
    </AuthProvider>
  );
}

export default App;
