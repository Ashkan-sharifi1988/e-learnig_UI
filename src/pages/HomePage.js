import React, { useContext } from 'react';
import CourseGrid from '../components/CourseGrid'; // Adjust the path based on your folder structure
//import api from '../api/api'; // Replace with your actual API client
import Layout from '../components/Layout';
import { AuthContext } from '../context/AuthContext'; // Import AuthContext
import { fetchCoursesWithStats } from "../services/CourseService";
import SearchComponent from "../components/SearchComponent";
import PreferencesModal from '../components/UserPreferences';
import Recommendations from '../components/Recommendations'; // Adjust the path based on your project structure

const MainPage = () => {
 // const [courses, setCourses] = useState([]);
  const {isAuthenticated,userId } = useContext(AuthContext); // Access userId from AuthContext
  
  return (
    <Layout>
         <div>
     
      <SearchComponent />
    </div>
      <div className="main-page">
      {userId && <Recommendations userId={userId} visibleItems={3} />}
      <h1>Available Courses</h1>
        <CourseGrid fetchService={fetchCoursesWithStats}  isAuthenticated={isAuthenticated} userId={userId} />
        {userId && <PreferencesModal userId={userId} />}
      </div>
    </Layout>
  );
};

export default MainPage;
