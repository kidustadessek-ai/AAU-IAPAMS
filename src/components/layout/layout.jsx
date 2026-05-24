import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { getUserProfile, updateUserProfile } from '../../services/userService';
import toast from 'react-hot-toast';
import ProfileEditModal from './profileEditModal';

export const DashboardLayout = ({ 
  title, 
  navLinks, 
  children,
  user,
  onLogout,
  token
}) => {
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [userData, setUserData] = useState({
    id: user?._id,
    fullName: user?.fullName || '',
    username: user?.username || '',
    email: user?.email || '',
    profilePhoto: user?.profilePhoto
  });

  // Fetch full user profile data when edit button is clicked
  const fetchUserProfile = async () => {
    try {
      setIsLoadingProfile(true);
      const result = await getUserProfile(token);
      
      if (result.success) {
        const userinfo = result.data;
        setUserData({
          id: userinfo.data._id,
          fullName: userinfo.data.fullName || '',
          username: userinfo.data.username || '',
          email: userinfo.data.email || '',
          phone: userinfo.data.phone || '',
          department: userinfo.data.department || '',
          positionType: userinfo.data.positionType || '',
          bio: userinfo.data.bio || '',
          address: userinfo.data.address || '',
          education: userinfo.data.education || [],
          experience: userinfo.data.experience || [],
          skills: userinfo.data.skills || [],
          website: userinfo.data.website || '',
          socialMedia: userinfo.data.socialMedia || {},
          profilePhoto: userinfo.data.profilePhoto,
          profilePhotoFile: null
        });
        
        if (userinfo.data.profilePhoto) {
          setProfilePhoto(userinfo.data.profilePhoto);
        }
      }
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      toast.error('Failed to load profile data');
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const handleEditProfile = async () => {
    await fetchUserProfile();
    setIsEditingProfile(true);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePhoto(reader.result);
      };
      reader.readAsDataURL(file);
      
      setUserData(prev => ({
        ...prev,
        profilePhotoFile: file
      }));
    }
  };

  const handleSaveProfile = async (updatedData) => {
    try {
      setIsSaving(true);
      const result = await updateUserProfile(updatedData, token);
      
      if (result.success) {
        setUserData(prev => ({
          ...updatedData,
          profilePhotoFile: null
        }));
        
        if (result.data?.profilePhoto) {
          setProfilePhoto(result.data.profilePhoto);
        }
        
        setIsEditingProfile(false);
        toast.success('Profile updated successfully');
      }
    } catch (error) {
      console.error('Failed to update profile:', error);
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: '#f5f4f2' }}>

      {/* Fixed Sidebar */}
      <div className="fixed top-16 left-0 h-[calc(100vh-64px)] w-64 z-10 overflow-y-auto" style={{ backgroundColor: '#1a0a0b' }}>
        <Sidebar navLinks={navLinks} />
      </div>

      {/* Main content area */}
      <div className="flex-1 flex flex-col ml-64">
        <Header
          title={title}
          user={user}
          profilePhoto={profilePhoto}
          onLogout={onLogout}
          onEditProfile={handleEditProfile}
        />

        <ProfileEditModal
          isOpen={isEditingProfile}
          onClose={() => !isSaving && setIsEditingProfile(false)}
          profilePhoto={profilePhoto}
          userData={userData}
          onFileChange={handleFileChange}
          onSave={handleSaveProfile}
          isSaving={isSaving}
          isLoading={isLoadingProfile}
        />

        {/* Main content */}
        <main className="flex-1 p-5 sm:p-7 mt-16" style={{ backgroundColor: '#f5f4f2' }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-xl p-5 sm:p-7 min-h-full"
              style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)', border: '1px solid #f0eded' }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};