// Quick test to verify backend is running
fetch('http://localhost:5000/health')
  .then(res => res.json())
  .then(data => console.log('Backend health check:', data))
  .catch(err => console.error('Backend error:', err));
