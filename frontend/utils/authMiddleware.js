// import jwt from 'jsonwebtoken';
// import { useRouter } from 'next/router';
// import { useEffect } from 'react';

// export const withAuth = (WrappedComponent) => {
//     return (props) => {
//         const router = useRouter();

//         useEffect(() => {
//             const token = localStorage.getItem('token');
//             if (!token || isTokenExpired(token)) {
//                 router.push('/auth/login'); // Redirect to login page if token is invalid
//             }
//         }, [router]);

//         const isTokenExpired = (token) => {
//             const decodedToken = jwt.decode(token);
//             if (!decodedToken) return true; // Invalid token
//             const expirationTime = decodedToken.exp * 1000; // Convert to milliseconds
//             return Date.now() > expirationTime; // Check if token is expired
//         };

//         return <WrappedComponent {...props} />;
//     };
// };


import jwt from 'jsonwebtoken';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

// Utility function to check token validity
export const checkTokenValidity = () => {
    const token = localStorage.getItem('token');
    if (!token) return false; // No token found

    const decodedToken = jwt.decode(token);
    if (!decodedToken) return false; // Invalid token

    const expirationTime = decodedToken.exp * 1000; // Convert to milliseconds
    if (Date.now() > expirationTime) {
        localStorage.removeItem('token'); // Clear expired token
        return false; // Token is expired
    }

    return true; // Token is valid
};

// Higher-Order Component (HOC) for authentication
export const withAuth = (WrappedComponent) => {
    return (props) => {
        const router = useRouter();

        useEffect(() => {
            if (!checkTokenValidity()) {
                router.push('/auth/login'); // Redirect to login page if token is invalid
            }
        }, [router]);

        return <WrappedComponent {...props} />;
    };
};