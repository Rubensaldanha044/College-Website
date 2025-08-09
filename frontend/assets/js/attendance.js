document.getElementById('attendanceForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const studentId = document.getElementById('studentId').value;
  const status = document.getElementById('status').value;
  
  try {
    const res = await fetch('/api/attendance', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        studentId,
        status,
        date: new Date()
      })
    });

    const data = await res.json();
    alert(data.message || 'Attendance marked');
  } catch (err) {
    console.error(err);
    alert('Error marking attendance');
  }
});
