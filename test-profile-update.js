import FormData from 'form-data';
import axios from 'axios';

async function testProfileUpdate() {
  try {
    // First login to get token
    const loginRes = await axios.post('http://localhost:5000/api/v1/auth/login', {
      username: 'staff1',
      password: 'password123'
    });

    const token = loginRes.data.data.tokens.accessToken;
    console.log('Logged in successfully');

    // Create form data with education/experience/skills
    const formData = new FormData();
    formData.append('fullName', 'Test User');
    formData.append('education', JSON.stringify([
      {
        institution: 'Test University',
        degree: 'Bachelor',
        fieldOfStudy: 'Computer Science',
        startYear: 2015,
        endYear: 2019,
        description: 'Test education'
      }
    ]));
    formData.append('experience', JSON.stringify([
      {
        company: 'Test Company',
        position: 'Developer',
        startDate: '2020-01-01',
        endDate: '2022-01-01',
        current: false,
        description: 'Test experience'
      }
    ]));
    formData.append('skills', JSON.stringify([
      { name: 'JavaScript', level: 'advanced' },
      { name: 'React', level: 'intermediate' }
    ]));

    console.log('\nSending update request...');
    
    const updateRes = await axios.patch('http://localhost:5000/api/v1/auth/me', formData, {
      headers: {
        ...formData.getHeaders(),
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('\nUpdate response:', JSON.stringify(updateRes.data, null, 2));

    // Fetch profile to verify
    const profileRes = await axios.get('http://localhost:5000/api/v1/auth/me', {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    console.log('\nProfile after update:');
    console.log('Education:', JSON.stringify(profileRes.data.data.education, null, 2));
    console.log('Experience:', JSON.stringify(profileRes.data.data.experience, null, 2));
    console.log('Skills:', JSON.stringify(profileRes.data.data.skills, null, 2));

  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

testProfileUpdate();
