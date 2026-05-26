
import { motion, AnimatePresence } from 'framer-motion';
import { FiUser, FiUpload, FiX, FiPlus, FiTrash2, FiLink } from 'react-icons/fi';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const ProfileEditModal = ({
  isOpen,
  onClose,
  profilePhoto,
  userData: initialUserData,

  onFileChange,
  onSave,
  isSaving,
  isLoading
}) => {
  const [activeTab, setActiveTab] = useState('basic');
  const [userData, setUserData] = useState(
    {...initialUserData,
      education: initialUserData.education || [],
  experience: initialUserData.experience || [],
  skills: initialUserData.skills || [],
  socialMedia: initialUserData.socialMedia || {}
    }
  );

  const [newEducation, setNewEducation] = useState({
    institution: '',
    degree: '',
    fieldOfStudy: '',
    startYear: '',
    endYear: '',
    description: ''
  });
  const [newExperience, setNewExperience] = useState({
    company: '',
    position: '',
    startDate: '',
    endDate: '',
    current: false,
    description: ''
  });
  const [newSkill, setNewSkill] = useState({
    name: '',
    level: 'beginner'
  });

  useEffect(() => {
    setUserData({
      ...initialUserData,
      education: initialUserData.education || [],
      experience: initialUserData.experience || [],
      skills: initialUserData.skills || [],
      socialMedia: initialUserData.socialMedia || {}
    });
  }, [initialUserData]);
  const handleAddEducation = () => {
    if (!newEducation.institution.trim()) {
      toast.error('Institution name is required');
      return;
    }

    setUserData(prev => ({
      ...prev,
      education: [...(prev.education || []), newEducation]
    }));

    setNewEducation({
      institution: '',
      degree: '',
      fieldOfStudy: '',
      startYear: '',
      endYear: '',
      description: ''
    });
  };

  const handleEducationChange = (index, field, value) => {
    setUserData(prev => {
      const updatedEducation = [...prev.education];
      updatedEducation[index] = {
        ...updatedEducation[index],
        [field]: value
      };
      return {
        ...prev,
        education: updatedEducation
      };
    });
  };

  const handleExperienceChange = (index, field, value) => {
    setUserData(prev => {
      const updatedExperience = [...prev.experience];
      updatedExperience[index] = {
        ...updatedExperience[index],
        [field]: value
      };
      return {
        ...prev,
        experience: updatedExperience
      };
    });
  };

  const handleAddExperience = () => {
    if (!newExperience.company.trim() || !newExperience.position.trim()) {
      toast.error('Company and position are required');
      return;
    }

    setUserData(prev => ({
      ...prev,
      experience: [...(prev.experience || []), newExperience]
    }));

    setNewExperience({
      company: '',
      position: '',
      startDate: '',
      endDate: '',
      current: false,
      description: ''
    });
  };

  const handleAddSkill = () => {
    if (!newSkill.name.trim()) {
      toast.error('Skill name is required');
      return;
    }

    setUserData(prev => ({
      ...prev,
      skills: [...(prev.skills || []), {
        name: newSkill.name,
        level: newSkill.level
      }]
    }));

    setNewSkill({
      name: '',
      level: 'beginner'
    });
  };

  const handleSkillChange = (index, field, value) => {
    setUserData(prev => {
      const updatedSkills = [...prev.skills];
      updatedSkills[index] = {
        ...updatedSkills[index],
        [field]: value
      };
      return {
        ...prev,
        skills: updatedSkills
      };
    });
  };

  const removeEducation = (index) => {
    setUserData(prev => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index)
    }));
  };

  const removeExperience = (index) => {
    setUserData(prev => ({
      ...prev,
      experience: prev.experience.filter((_, i) => i !== index)
    }));
  };

  const removeSkill = (index) => {
    setUserData(prev => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index)
    }));
  };

  const handleSave = () => {
    const payload = {
      ...userData,
      education: userData.education || [],
      experience: userData.experience || [],
      skills: userData.skills || [],
      socialMedia: userData.socialMedia || {}
    };
    
    onSave(payload);
  };
   if (isLoading) {
    return (
      <div style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1300,
        padding: 16,
      }}>
        <div style={{
          background: '#fff',
          borderRadius: 12,
          padding: 32,
          width: '100%',
          maxWidth: 400,
          textAlign: 'center',
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
            <div style={{
              width: 48,
              height: 48,
              border: '3px solid #f0eded',
              borderTop: '3px solid #7B1113',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
            }} />
          </div>
          <p style={{ fontSize: '0.9rem', color: '#64748b', margin: 0 }}>Loading profile data...</p>
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </div>
    );
  }
  return (
    <AnimatePresence>
      {isOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1300,
          padding: 16,
        }}>
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            style={{
              background: '#fff',
              borderRadius: 12,
              width: '100%',
              maxWidth: 800,
              maxHeight: '90vh',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
            }}
          >
            {/* Header */}
            <div style={{
              background: 'linear-gradient(135deg, #7B1113 0%, #5a0c0e 100%)',
              color: '#fff',
              padding: '20px 24px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <FiUser size={22} />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>Edit Profile</h3>
              </div>
              <button
                onClick={onClose}
                disabled={isSaving}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#fff',
                  cursor: isSaving ? 'not-allowed' : 'pointer',
                  padding: 4,
                  display: 'flex',
                  alignItems: 'center',
                  opacity: isSaving ? 0.5 : 1,
                }}
              >
                <FiX size={24} />
              </button>
            </div>

            {/* Tabs */}
            <div style={{
              display: 'flex',
              background: '#fafafa',
              padding: '0 24px',
              overflowX: 'auto',
              borderBottom: '1px solid #f0eded',
            }}>
              {[
                { id: 'basic', label: 'Basic Info' },
                { id: 'education', label: 'Education' },
                { id: 'experience', label: 'Experience' },
                { id: 'skills', label: 'Skills' },
                { id: 'social', label: 'Social & Links' },
              ].map(tab => (
                <div
                  key={tab.id}
                  style={{
                    position: 'relative',
                  }}
                >
                  <button
                    onClick={() => setActiveTab(tab.id)}
                    style={{
                      padding: '12px 16px',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      border: 'none',
                      background: 'none',
                      cursor: 'pointer',
                      color: activeTab === tab.id ? '#7B1113' : '#64748b',
                      transition: 'all 0.2s',
                      whiteSpace: 'nowrap',
                      paddingBottom: '16px',
                    }}
                  >
                    {tab.label}
                  </button>
                  {activeTab === tab.id && (
                    <div style={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      height: 3,
                      background: '#7B1113',
                    }} />
                  )}
                </div>
              ))}
            </div>

            {/* Content */}
            <div style={{
              flex: 1,
              overflowY: 'auto',
              padding: 24,
              background: '#fafafa',
            }}>

              {activeTab === 'basic' && (
                <div className="space-y-4">
                  <div className="flex flex-col items-center mb-6">
                    <div className="relative mb-2">
                      <div className="w-24 h-24 rounded-full bg-[#fdf0f0] flex items-center justify-center text-[#7B1113] mb-2 overflow-hidden">
                        {profilePhoto ? (
                          <img
                            src={profilePhoto}
                            alt="Profile"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <FiUser size={32} />
                        )}
                      </div>
                      <label className="absolute bottom-0 right-0 bg-[#7B1113] text-white p-1.5 rounded-full cursor-pointer hover:bg-[#7B1113]">
                        <FiUpload size={18} />
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={onFileChange}
                        />
                      </label>
                    </div>
                    <span className="text-sm text-gray-500">Click to upload photo</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                      <input
                        type="text"
                        value={userData.fullName || ''}
                        name='fullName'
                        onChange={(e) => setUserData({ ...userData, fullName: e.target.value })}
                        className="w-full border border-gray-300 rounded-md p-2 focus:ring-[#7B1113] focus:border-[#7B1113]"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                      <input
                        type="text"
                        value={userData.username || ''}
                        name='username'
                        onChange={(e) => setUserData({ ...userData, username: e.target.value })}
                        className="w-full border border-gray-300 rounded-md p-2 focus:ring-[#7B1113] focus:border-[#7B1113]"
                        disabled
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <input
                        type="email"
                        value={userData.email || ''}
                        name='email'
                        onChange={(e) => setUserData({ ...userData, email: e.target.value })}
                        className="w-full border border-gray-300 rounded-md p-2 focus:ring-[#7B1113] focus:border-[#7B1113]"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                      <input
                        type="tel"
                        value={userData.phone || ''}
                        name='phone'
                        onChange={(e) => setUserData({ ...userData, phone: e.target.value })}
                        className="w-full border border-gray-300 rounded-md p-2 focus:ring-[#7B1113] focus:border-[#7B1113]"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                      <input
                        type="text"
                        value={userData.department || ''}
                        name='department'
                        onChange={(e) => setUserData({ ...userData, department: e.target.value })}
                        className="w-full border border-gray-300 rounded-md p-2 focus:ring-[#7B1113] focus:border-[#7B1113]"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
                      <input
                        type="text"
                        value={userData.positionType || ''}
                        name='positionType'
                        onChange={(e) => setUserData({ ...userData, positionType: e.target.value })}
                        className="w-full border border-gray-300 rounded-md p-2 focus:ring-[#7B1113] focus:border-[#7B1113]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                    <textarea
                      value={userData.bio || ''}
                      name='bio'
                      onChange={(e) => setUserData({ ...userData, bio: e.target.value })}
                      rows={3}
                      className="w-full border border-gray-300 rounded-md p-2 focus:ring-[#7B1113] focus:border-[#7B1113]"
                      placeholder="Tell us about yourself..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                    <textarea
                      value={userData.address || ''}
                      name='address'
                      onChange={(e) => setUserData({ ...userData, address: e.target.value })}
                      rows={2}
                      className="w-full border border-gray-300 rounded-md p-2 focus:ring-[#7B1113] focus:border-[#7B1113]"
                    />
                  </div>
                </div>
              )}

              {activeTab === 'education' && (
                <div className="space-y-4">
                  <div className="space-y-4">
                    {userData.education?.map((edu, index) => (
                      <div key={index} className="border rounded-lg p-4 relative">
                        <button
                          onClick={() => removeEducation(index)}
                          className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                        >
                          <FiTrash2 size={18} />
                        </button>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Institution</label>
                            <input
                              type="text"
                              value={edu.institution || ''}
                              name='institution'
                              onChange={(e) => handleEducationChange(index, 'institution', e.target.value)}

                              className="w-full border border-gray-300 rounded-md p-2"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Degree</label>
                            <input
                              type="text"
                              value={edu.degree || ''}
                              name='degree'
                              onChange={(e) => handleEducationChange(index, 'degree', e.target.value)}

                              className="w-full border border-gray-300 rounded-md p-2"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Field of Study</label>
                            <input
                              type="text"
                              value={edu.fieldOfStudy || ''}
                              name='fieldOfStudy'
                              onChange={(e) => handleEducationChange(index, 'fieldOfStudy', e.target.value)}
                              className="w-full border border-gray-300 rounded-md p-2"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Start Year</label>
                              <input
                                type="number"
                                value={edu.startYear || ''}
                                name='startYear'
                                onChange={(e) => handleEducationChange(index, 'startYear', parseInt(e.target.value))}
                                className="w-full border border-gray-300 rounded-md p-2"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">End Year</label>
                              <input
                                type="number"
                                value={edu.endYear || ''}
                                name='endYear'
                                onChange={(e) =>handleEducationChange( index, 'endYear', parseInt(e.target.value))}
                                className="w-full border border-gray-300 rounded-md p-2"
                              />
                            </div>
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                          <textarea
                            value={edu.description || ''}
                            name='description'
                            onChange={(e) => handleEducationChange( index, 'description', e.target.value)}
                            rows={2}
                            className="w-full border border-gray-300 rounded-md p-2"
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="border-t pt-4 mt-4">
                    <h4 className="font-medium mb-3">Add New Education</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Institution</label>
                        <input
                          type="text"
                          value={newEducation.institution}
                          onChange={(e) => setNewEducation({ ...newEducation, institution: e.target.value })}
                          className="w-full border border-gray-300 rounded-md p-2"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Degree</label>
                        <input
                          type="text"
                          value={newEducation.degree}
                          onChange={(e) => setNewEducation({ ...newEducation, degree: e.target.value })}
                          className="w-full border border-gray-300 rounded-md p-2"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Field of Study</label>
                        <input
                          type="text"
                          value={newEducation.fieldOfStudy}
                          onChange={(e) => setNewEducation({ ...newEducation, fieldOfStudy: e.target.value })}
                          className="w-full border border-gray-300 rounded-md p-2"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Start Year</label>
                          <input
                            type="number"
                            value={newEducation.startYear}
                            onChange={(e) => setNewEducation({ ...newEducation, startYear: e.target.value })}
                            className="w-full border border-gray-300 rounded-md p-2"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">End Year</label>
                          <input
                            type="number"
                            value={newEducation.endYear}
                            onChange={(e) => setNewEducation({ ...newEducation, endYear: e.target.value })}
                            className="w-full border border-gray-300 rounded-md p-2"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="mb-3">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                      <textarea
                        value={newEducation.description}
                        onChange={(e) => setNewEducation({ ...newEducation, description: e.target.value })}
                        rows={2}
                        className="w-full border border-gray-300 rounded-md p-2"
                      />
                    </div>
                    <button
                      onClick={handleAddEducation}
                      className="flex items-center justify-center w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#7B1113] hover:bg-[#5a0d0f] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#7B1113]"
                    >
                      <FiPlus className="mr-2" /> Add Education
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'experience' && (
                <div className="space-y-4">
                  <div className="space-y-4">
                    {userData.experience?.map((exp, index) => (
                      <div key={index} className="border rounded-lg p-4 relative">
                        <button
                          onClick={() => removeExperience( index)}
                          className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                        >
                          <FiTrash2 size={18} />
                        </button>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                            <input
                              type="text"
                              value={exp.company || ''}
                              name='company'
                              onChange={(e) => handleExperienceChange(index, 'company', e.target.value)}
                              className="w-full border border-gray-300 rounded-md p-2"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
                            <input
                              type="text"
                              value={exp.position || ''}
                              name='position'
                              onChange={(e) => handleExperienceChange(index, 'position', e.target.value)}
                              className="w-full border border-gray-300 rounded-md p-2"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                            <input
                              type="date"
                              value={exp.startDate ? new Date(exp.startDate).toISOString().split('T')[0] : ''}
                              name='startDate'
                              onChange={(e) =>handleExperienceChange(index, 'startDate', e.target.value)}
                              className="w-full border border-gray-300 rounded-md p-2"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                            <input
                              type="date"
                              value={exp.endDate && !exp.current ? new Date(exp.endDate).toISOString().split('T')[0] : ''}
                              name='endDate'
                              onChange={(e) => handleExperienceChange( index, 'endDate', e.target.value)}
                              disabled={exp.current}
                              className="w-full border border-gray-300 rounded-md p-2"
                            />
                          </div>
                        </div>
                        <div className="flex items-center mb-3">
                          <input
                            type="checkbox"
                            id={`current-${index}`}
                            checked={exp.current || false}
                            name='current'
                            onChange={(e) =>
                              handleExperienceChange( index, 'current', e.target.checked)
                            }

                            className="h-4 w-4 text-[#7B1113] focus:ring-[#7B1113] border-gray-300 rounded"
                          />
                          <label htmlFor={`current-${index}`} className="ml-2 block text-sm text-gray-700">
                            I currently work here
                          </label>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                          <textarea
                            value={exp.description || ''}
                            name='description'
                            onChange={(e) => handleExperienceChange( index, 'description', e.target.value)}
                            rows={3}
                            className="w-full border border-gray-300 rounded-md p-2"
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="border-t pt-4 mt-4">
                    <h4 className="font-medium mb-3">Add New Experience</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                        <input
                          type="text"
                          value={newExperience.company}
                          onChange={(e) => setNewExperience({ ...newExperience, company: e.target.value })}
                          className="w-full border border-gray-300 rounded-md p-2"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
                        <input
                          type="text"
                          value={newExperience.position}
                          onChange={(e) => setNewExperience({ ...newExperience, position: e.target.value })}
                          className="w-full border border-gray-300 rounded-md p-2"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                        <input
                          type="date"
                          value={newExperience.startDate}
                          onChange={(e) => setNewExperience({ ...newExperience, startDate: e.target.value })}
                          className="w-full border border-gray-300 rounded-md p-2"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                        <input
                          type="date"
                          value={newExperience.endDate}
                          onChange={(e) => setNewExperience({ ...newExperience, endDate: e.target.value, current: false })}
                          disabled={newExperience.current}
                          className="w-full border border-gray-300 rounded-md p-2"
                        />
                      </div>
                    </div>
                    <div className="flex items-center mb-3">
                      <input
                        type="checkbox"
                        id="current-new"
                        checked={newExperience.current}
                        onChange={(e) => {
                          setNewExperience({
                            ...newExperience,
                            current: e.target.checked,
                            endDate: e.target.checked ? '' : newExperience.endDate
                          });
                        }}
                        className="h-4 w-4 text-[#7B1113] focus:ring-[#7B1113] border-gray-300 rounded"
                      />
                      <label htmlFor="current-new" className="ml-2 block text-sm text-gray-700">
                        I currently work here
                      </label>
                    </div>
                    <div className="mb-3">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                      <textarea
                        value={newExperience.description}
                        onChange={(e) => setNewExperience({ ...newExperience, description: e.target.value })}
                        rows={3}
                        className="w-full border border-gray-300 rounded-md p-2"
                      />
                    </div>
                    <button
                      onClick={handleAddExperience}
                      className="flex items-center justify-center w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#7B1113] hover:bg-[#5a0d0f] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#7B1113]"
                    >
                      <FiPlus className="mr-2" /> Add Experience
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'skills' && (
                <div className="space-y-4">
                  <div className="space-y-3">
                    {userData.skills?.map((skill, index) => (
                      <div key={index} className="border rounded-lg p-4 relative">
                        <button
                          onClick={() => removeSkill( index)}
                          className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                        >
                          <FiTrash2 size={18} />
                        </button>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Skill Name</label>
                            <input
                              type="text"
                              value={skill.name || ''}
                              onChange={(e) => handleSkillChange(index, 'name', e.target.value)}
                              className="w-full border border-gray-300 rounded-md p-2"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Level</label>
                            <select
                              value={skill.level || 'beginner'}
                              onChange={(e) => handleSkillChange( index, 'level', e.target.value)}
                              name='level'
                              className="w-full border border-gray-300 rounded-md p-2"
                            >
                              <option value="beginner">Beginner</option>
                              <option value="intermediate">Intermediate</option>
                              <option value="advanced">Advanced</option>
                              <option value="expert">Expert</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="border-t pt-4 mt-4">
                    <h4 className="font-medium mb-3">Add New Skill</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Skill Name</label>
                        <input
                          type="text"
                          value={newSkill.name}
                          onChange={(e) => setNewSkill({ ...newSkill, name: e.target.value })}
                          className="w-full border border-gray-300 rounded-md p-2"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Level</label>
                        <select
                          value={newSkill.level}
                          onChange={(e) => setNewSkill({ ...newSkill, level: e.target.value })}
                          className="w-full border border-gray-300 rounded-md p-2"
                        >
                          <option value="beginner">Beginner</option>
                          <option value="intermediate">Intermediate</option>
                          <option value="advanced">Advanced</option>
                          <option value="expert">Expert</option>
                        </select>
                      </div>
                    </div>
                    <button
                      onClick={handleAddSkill}
                      className="flex items-center justify-center w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#7B1113] hover:bg-[#5a0d0f] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#7B1113]"
                    >
                      <FiPlus className="mr-2" /> Add Skill
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'social' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FiLink className="text-gray-400" />
                        </div>
                        <input
                          type="url"
                          value={userData.socialMedia?.linkedIn || ''}
                          onChange={(e) => setUserData({
                            ...userData,
                            socialMedia: {
                              ...userData.socialMedia,
                              linkedIn: e.target.value
                            }
                          })}

                          placeholder="https://linkedin.com/in/username"
                          className="pl-10 w-full border border-gray-300 rounded-md p-2"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Twitter</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FiLink className="text-gray-400" />
                        </div>
                        <input
                          type="url"
                          value={userData.socialMedia?.twitter || ''}

                          onChange={(e) => setUserData({
                            ...userData,
                            socialMedia: {
                              ...userData.socialMedia,
                              twitter: e.target.value
                            }
                          })}

                          placeholder="https://twitter.com/username"
                          className="pl-10 w-full border border-gray-300 rounded-md p-2"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">GitHub</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FiLink className="text-gray-400" />
                        </div>
                        <input
                          type="url"
                          value={userData.socialMedia?.github || ''}
                          onChange={(e) => setUserData({
                            ...userData,
                            socialMedia: {
                              ...userData.socialMedia,
                              github: e.target.value
                            }
                          })}
                          placeholder="https://github.com/username"
                          className="pl-10 w-full border border-gray-300 rounded-md p-2"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FiLink className="text-gray-400" />
                        </div>
                        <input
                          type="url"
                          value={userData.website || ''}

                          onChange={(e) => setUserData({ ...userData, website: e.target.value })}
                          placeholder="https://yourwebsite.com"
                          className="pl-10 w-full border border-gray-300 rounded-md p-2"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div style={{
              padding: '16px 24px',
              background: '#fff',
              borderTop: '1px solid #f0eded',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: 12,
            }}>
              <button
                onClick={onClose}
                style={{
                  padding: '8px 20px',
                  borderRadius: 8,
                  border: '1px solid #e5e7eb',
                  background: '#fff',
                  color: '#374151',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                type="button"
                disabled={isSaving}
                style={{
                  padding: '8px 24px',
                  borderRadius: 8,
                  border: 'none',
                  background: isSaving ? '#94a3b8' : '#7B1113',
                  color: '#fff',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: isSaving ? 'not-allowed' : 'pointer',
                }}
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ProfileEditModal;