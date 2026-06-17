import React, { useContext } from 'react';
import { UserContext } from '../utils/UserContext';
import UserDashboard from './UserDashboard';
import AdminPortal from './AdminPortal';

export default function Dashboard({ toggleSidebar }) {
  const { user } = useContext(UserContext);

  if (user?.role === 'admin') {
    return <AdminPortal toggleSidebar={toggleSidebar} />;
  }

  return <UserDashboard toggleSidebar={toggleSidebar} />;
}
