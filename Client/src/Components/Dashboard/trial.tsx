import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

interface UserSummary {
    totalUsers: number;
    totalStudents: number;
    totalFaculty: number;
    totalAdmins: number;
}

const UserSummaryComponent: React.FC = () => {
    const [userSummary, setUserSummary] = useState<UserSummary | null>(null);
    const baseURL = 'http://localhost:3000/admin';
    const isAuthenticated = useSelector((state: { auth: { isAuthenticated: boolean } }) => state.auth.isAuthenticated);

    // Fetch the user summary data from the backend
    useEffect(() => {
        if (isAuthenticated) {
            const fetchUserSummary = async () => {
                try {
                    const response = await axios.get<UserSummary>(`${baseURL}/users/summary`, {
                        headers: {
                            authorization: `Bearer ${localStorage.getItem('token')}`,
                        },
                    });
                    setUserSummary(response.data);
                } catch (error) {
                    console.error('Error fetching user summary:', error);
                }
            };

            fetchUserSummary();
        }
    }, [isAuthenticated]);

    // Redirect to the login page if not authenticated
    if (!isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    return (
        <div className="flex justify-center items-center h-screen">
            <div className="card bg-white shadow-2xl rounded-2xl p-8">
                <h2 className="text-3xl font-bold mb-6">User Summary</h2>
                {userSummary ? (
                    <div>
                        <p className="mb-4 text-lg"><span className="font-semibold">Total Users:</span> {userSummary.totalUsers}</p>
                        <p className="mb-4 text-lg"><span className="font-semibold">Total Students:</span> {userSummary.totalStudents}</p>
                        <p className="mb-4 text-lg"><span className="font-semibold">Total Faculty:</span> {userSummary.totalFaculty}</p>
                        <p className="mb-4 text-lg"><span className="font-semibold">Total Admins:</span> {userSummary.totalAdmins}</p>
                    </div>
                ) : (
                    <p className="text-lg">Loading user summary...</p>
                )}
            </div>
        </div>
    );
};

export default UserSummaryComponent;
