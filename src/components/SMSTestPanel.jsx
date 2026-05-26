import React, { useState } from 'react';
import axios from 'axios';

const SMSTestPanel = () => {
  const [formData, setFormData] = useState({
    phoneNumber: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/v1/sms/test`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      setResult({
        success: true,
        message: response.data.message
      });
    } catch (error) {
      setResult({
        success: false,
        message: error.response?.data?.message || 'Failed to send SMS'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="sms-test-panel">
      <h3>SMS Gateway Test</h3>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Phone Number</label>
          <input
            type="tel"
            placeholder="+251911234567"
            value={formData.phoneNumber}
            onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
            required
          />
        </div>

        <div className="form-group">
          <label>Message</label>
          <textarea
            placeholder="Enter your test message"
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            rows="4"
            required
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'Sending...' : 'Send Test SMS'}
        </button>
      </form>

      {result && (
        <div className={`alert ${result.success ? 'alert-success' : 'alert-error'}`}>
          {result.message}
        </div>
      )}
    </div>
  );
};

export default SMSTestPanel;
