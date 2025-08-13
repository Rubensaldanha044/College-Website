document.addEventListener('DOMContentLoaded', () => {
  const attendanceForm = document.getElementById('attendanceForm');
  const attendanceTable = document.getElementById('attendanceTable')?.querySelector('tbody');

  const token = localStorage.getItem('token');

  if (!token) {
    alert("⚠️ You are not logged in. Please log in first.");
    window.location.href = "login.html";
    return;
  }

  if (attendanceForm) {
    attendanceForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const studentId = document.getElementById('studentId')?.value.trim();
      const status = document.getElementById('status')?.value;
      const dateInput = document.getElementById('date')?.value || new Date().toISOString().split('T')[0];
      const course = document.getElementById('course')?.value?.trim();

      if (!studentId || !status) {
        alert('⚠️ Please select a student and attendance status.');
        return;
      }

      try {
        const res = await fetch('/api/attendance', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            studentId,
            status,
            date: dateInput,
            course
          })
        });

        const data = await res.json();
        if (res.ok) {
          alert(data.message || '✅ Attendance marked successfully');
          attendanceForm.reset();
          loadAttendance(); // Refresh attendance table after marking
        } else {
          alert(data.message || '❌ Failed to mark attendance');
        }
      } catch (err) {
        console.error('Error marking attendance:', err);
        alert('🚨 Server error while marking attendance');
      }
    });
  }

  // Function to load attendance records (faculty view)
  async function loadAttendance() {
    if (!attendanceTable) return; // No table to load

    try {
      const today = new Date().toISOString().split('T')[0];
      const res = await fetch(`/api/attendance/date/${today}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();

      attendanceTable.innerHTML = "";

      if (data.length === 0) {
        attendanceTable.innerHTML = "<tr><td colspan='3'>No attendance records found</td></tr>";
        return;
      }

      data.forEach(a => {
        attendanceTable.innerHTML += `
          <tr>
            <td>${new Date(a.date).toLocaleDateString()}</td>
            <td>${a.course || '-'}</td>
            <td>${a.status}</td>
          </tr>
        `;
      });
    } catch (err) {
      console.error('Error loading attendance:', err);
    }
  }

  // Load today's attendance on page load
  loadAttendance();
});
