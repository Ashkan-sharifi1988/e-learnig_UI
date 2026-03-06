import React from 'react';
import { useParams } from 'react-router-dom';
import { AuthContext } from "../context/AuthContext";
import SessionGrid from '../components/SessionGrid';
import Layout from '../components/Layout';

const SessionsPage = () => {
  const { userId } = React.useContext(AuthContext);
  const { courseId } = useParams(); // Extract courseId from the URL

  return (
    <Layout>
      <div>
        <h1>Course Sessions</h1>
        {courseId ? (
          <SessionGrid courseId={courseId} userId={userId} />
        ) : (
          <p>No course selected. Please go back and select a course.</p>
        )}
      </div>
    </Layout>
  );
};

export default SessionsPage;
