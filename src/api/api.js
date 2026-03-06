import axios from 'axios';
import config from "../config";

// HTTP API Instance
const api = axios.create({
    baseURL: `${config.BaseUrl}/api`, 
    
    withCredentials: true, // Include credentials for CORS
    headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${sessionStorage.getItem('authToken')}`,
    },
});

// HTTPS API Instance
const api_https = axios.create({
    baseURL: 'https://localhost:5234/api',
    withCredentials: true, // Include credentials for CORS
    headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${sessionStorage.getItem('authToken')}`,
    },
});

// Export both instances
export default  api;
export  {api_https} ;