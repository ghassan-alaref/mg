import axios from 'axios';
import { toast } from 'react-toastify';
const backendUrl = process.env.REACT_APP_BACKEND_URL;


 const api = axios.create({
  baseURL: backendUrl,
})



api.interceptors.response.use(
    (response) => response,
    (error) => {
      if (
        error.response &&
        error.response.status === 403 &&
        error.response.data?.errorMessage === 'Invalid token, please generate a new token'
      ) {

        localStorage.clear(); 
  
        window.location.href = '/'; 
        toast.dismiss(); // dismiss all current toasts
        toast.error("Session expired. Please login again.");
  
        return Promise.reject(); 
      }
  
      return Promise.reject(error);
    }
  );

  export default api;
