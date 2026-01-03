import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Register now redirects to Login page since we have a unified flow
const Register = () => {
    const navigate = useNavigate();

    useEffect(() => {
        navigate('/login', { replace: true });
    }, [navigate]);

    return null;
};

export default Register;

