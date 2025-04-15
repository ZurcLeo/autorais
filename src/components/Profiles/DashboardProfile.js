// src/components/Profiles/DashboardProfile.js
import React from 'react';
import ProfileView from "./ProfileView";
import { useAuth } from "../../context/AuthContext";

const DashboardProfile = () => {
    const { currentUser } = useAuth();
    
    if (!currentUser) return null;
  console.log('currentuser no dashboard', currentUser)
    return <ProfileView 
      userData={currentUser} 
      isOwnProfile={true} 
    />;
};

export default DashboardProfile;