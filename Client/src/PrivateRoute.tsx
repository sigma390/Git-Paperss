import React from 'react';
import { Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { PathRouteProps } from 'react-router-dom';

interface PrivateRouteProps extends PathRouteProps {
    element: React.ReactElement;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ element, ...rest }) => {
    const isAuthenticated = useSelector((state: { auth: any }) => state.auth.isAuthenticated);

    return (
        <Route
            {...rest}
            element={isAuthenticated ? element : <Navigate to="/login" replace />}
        />
    );
};

export default PrivateRoute;
