// src/components/Profiles/DashboardProfile.js
import React from 'react';
import ProfileView from "./ProfileView";
import { useAuth } from "../../context/AuthContext";

const DashboardProfile = () => {
    const { currentUser } = useAuth();
    
    if (!currentUser) return null;
  
    return <ProfileView 
      userData={currentUser} 
      isOwnProfile={true} 
    />;
};

export default DashboardProfile;