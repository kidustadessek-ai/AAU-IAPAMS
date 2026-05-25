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
        // Update local state
        setUserData(prev => ({
          ...updatedData,
          profilePhotoFile: null
        }));
        
        // Update profile photo state
        if (result.data?.profilePhoto) {
          setProfilePhoto(result.data.profilePhoto);
        }

        // Update localStorage with new user data
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const user = JSON.parse(storedUser);
          const updatedUser = {
            ...user,
            ...result.data
          };
          localStorage.setItem('user', JSON.stringify(updatedUser));
        }

        // Trigger a page reload to refresh all components with new user data
        window.location.reload();
        
        toast.success('Profile updated successfully');
      } else {
        const errorMsg = result.error?.message || 'Failed to update profile';
        console.error('Update failed:', result.error);
        toast.error(errorMsg);
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

      {/* Fixed Sidebar — full height, dark, starts at top-0 since header doesn't overlap it */}
      <div className="fixed top-0 left-0 h-full w-64 z-20 overflow-y-auto" style={{ backgroundColor: '#1a0a0b' }}>
        {/* Sidebar brand strip */}
        <div style={{
          height: 56, display: 'flex', alignItems: 'center',
          padding: '0 20px', borderBottom: '1px solid rgba(255,255,255,0.06)',
          gap: 10, flexShrink: 0,
        }}>
          <img src="/aau.png" alt="AAU" style={{ width: 30, height: 30, objectFit: 'contain' }} />
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#fff', lineHeight: 1.2 }}>AAU</div>
            <div style={{ fontSize: '0.58rem', color: 'rgba(255,255,255,0.35)', lineHeight: 1, letterSpacing: 1 }}>IAPAMS</div>
          </div>
        </div>
        <Sidebar navLinks={navLinks} />
      </div>

      {/* Main content — offset by sidebar, header starts at left:256px */}
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

        {/* mt-14 clears the 56px header */}
        <main className="flex-1 p-5 sm:p-6 mt-14" style={{ backgroundColor: '#f5f4f2' }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18 }}
              className="bg-white rounded-xl p-5 sm:p-6 min-h-full"
              style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #f0eded' }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};