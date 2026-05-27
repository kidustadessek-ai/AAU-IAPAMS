import { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { getUserProfile, updateUserProfile } from '../../services/userService';
import toast from 'react-hot-toast';
import ProfileEditModal from './profileEditModal';
import { useAuth } from '../../context/authContext';

export const LayoutContext = createContext(null);
export const useLayout = () => useContext(LayoutContext);

export const DashboardLayout = ({ 
  title, 
  navLinks, 
  children,
  user,
  onLogout,
  token
}) => {
  const { updateUser } = useAuth();
  const [profilePhoto, setProfilePhoto] = useState(user?.profilePhoto || null);
  const [profileRefreshKey, setProfileRefreshKey] = useState(0);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  
  useEffect(() => {
    console.log('⚡ isEditingProfile changed to:', isEditingProfile);
  }, [isEditingProfile]);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [userData, setUserData] = useState({
    id: user?._id,
    fullName: user?.fullName || '',
    username: user?.username || '',
    email: user?.email || '',
    profilePhoto: user?.profilePhoto
  });

  // Update profile photo when user prop changes
  useEffect(() => {
    if (user?.profilePhoto) {
      setProfilePhoto(user.profilePhoto);
    }
  }, [user]);

  // Fetch full user profile data when edit button is clicked
  const fetchUserProfile = async () => {
    try {
      setIsLoadingProfile(true);
      const result = await getUserProfile();
      
      console.log('Fetched user profile:', result);
      
      if (result.success) {
        const userinfo = result.data;
        const userData = userinfo.data || userinfo;
        
        console.log('User data to set:', userData);
        
        // Convert socialMedia Map to plain object if needed
        let socialMedia = {};
        if (userData.socialMedia) {
          if (userData.socialMedia instanceof Map) {
            socialMedia = Object.fromEntries(userData.socialMedia);
          } else if (typeof userData.socialMedia === 'object') {
            socialMedia = userData.socialMedia;
          }
        }
        
        setUserData({
          id: userData._id,
          fullName: userData.fullName || '',
          username: userData.username || '',
          email: userData.email || '',
          phone: userData.phone || '',
          department: userData.department || '',
          positionType: userData.positionType || '',
          bio: userData.bio || '',
          address: userData.address || '',
          education: userData.education || [],
          experience: userData.experience || [],
          skills: userData.skills || [],
          website: userData.website || '',
          socialMedia: socialMedia,
          profilePhoto: userData.profilePhoto,
          profilePhotoFile: null
        });
        
        console.log('Set userData state:', userData);
        
        if (userData.profilePhoto) {
          setProfilePhoto(userData.profilePhoto);
        }
      }
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      toast.error('Failed to load profile data');
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const handleCloseModal = useCallback(() => {
    if (!isSaving) {
      console.log('🚪 handleCloseModal called');
      setIsEditingProfile(false);
    }
  }, [isSaving]);

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
      
      // Merge the file from userData state with the updated data
      const dataToSave = {
        ...updatedData,
        profilePhotoFile: userData.profilePhotoFile
      };
      
      console.log('Saving profile with data:', dataToSave);
      console.log('Profile photo file:', dataToSave.profilePhotoFile);
      
      const result = await updateUserProfile(dataToSave);
      
      console.log('Save result:', result);
      
      if (result.success) {
        toast.success('Profile updated successfully');

        const updatedUserData = {
          ...result.data,
          education: result.data.education || [],
          experience: result.data.experience || [],
          skills: result.data.skills || [],
          profilePhoto: result.data.profilePhoto || user.profilePhoto
        };
        
        updateUser(updatedUserData);
        setProfilePhoto(updatedUserData.profilePhoto);

        setIsEditingProfile(false);
        setProfileRefreshKey(k => k + 1);
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
    <LayoutContext.Provider value={{ openEditProfile: handleEditProfile, profileRefreshKey }}>
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
          onClose={handleCloseModal}
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
    </LayoutContext.Provider>
  );
};