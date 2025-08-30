import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const ErrorBoundary = ({ children }) => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleUnauthorized = (event) => {
      if (event.detail?.status === 401) {
        navigate('/404'); // or '/login' if you prefer
      }
    };

    window.addEventListener('unauthorized', handleUnauthorized);
    
    return () => {
      window.removeEventListener('unauthorized', handleUnauthorized);
    };
  }, [navigate]);

  return children;
};

export default ErrorBoundary;