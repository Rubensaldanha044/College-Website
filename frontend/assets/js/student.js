const stoken = localStorage.getItem('token');
function loadMy(){
  fetch('/api/attendance', { headers:{ Authorization: 'Bearer '+stoken }}).then(r=>r.json()).then(data=>{
    const tbody = $('#myAttendance tbody').empty();
    const myEmail = localStorage.getItem('email') || '';
    data.forEach(a=>{
      const present = a.present.includes(myEmail) ? 'Present' : 'Absent';
      $('#myAttendance tbody').append(`<tr><td>${a.date}</td><td>${a.courseCode}</td><td>${present}</td></tr>`);
    });
  });
}
$(function(){ loadMy(); });
