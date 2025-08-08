const token = localStorage.getItem('token');

function loadStudents(){
  fetch('/api/students', { headers:{ Authorization: 'Bearer '+token } })
    .then(r=>r.json()).then(data=>{
      const tbody = $('#studentsTable tbody').empty();
      data.forEach(s=> tbody.append(`<tr><td>${s.name}</td><td>${s.email}</td><td>${s.course||''}</td><td><button class="btn btn-sm btn-danger" onclick="deleteStudent('${s._id}')">Delete</button></td></tr>`));
    });
}

function loadCourses(){
  fetch('/api/courses', { headers:{ Authorization: 'Bearer '+token } })
    .then(r=>r.json()).then(data=>{
      const tbody = $('#coursesTable tbody').empty();
      data.forEach(c=> tbody.append(`<tr><td>${c.code}</td><td>${c.title}</td><td>${c.credits||''}</td><td><button class="btn btn-sm btn-danger" onclick="deleteCourse('${c._id}')">Delete</button></td></tr>`));
    });
}

$('#addStudentBtn').on('click', ()=> new bootstrap.Modal(document.getElementById('studentModal')).show());
$('#addCourseBtn').on('click', ()=> new bootstrap.Modal(document.getElementById('courseModal')).show());

$('#studentForm').on('submit', function(e){
  e.preventDefault();
  const body = { name: $('#s_name').val(), email: $('#s_email').val(), studentId: $('#s_studentId').val(), course: $('#s_course').val()};
  fetch('/api/students', { method:'POST', headers:{'Content-Type':'application/json', Authorization:'Bearer '+token}, body: JSON.stringify(body)}).then(()=>{ loadStudents(); bootstrap.Modal.getInstance(document.getElementById('studentModal')).hide();});
});

$('#courseForm').on('submit', function(e){
  e.preventDefault();
  const body = { code: $('#c_code').val(), title: $('#c_title').val(), credits: $('#c_credits').val()};
  fetch('/api/courses', { method:'POST', headers:{'Content-Type':'application/json', Authorization:'Bearer '+token}, body: JSON.stringify(body)}).then(()=>{ loadCourses(); bootstrap.Modal.getInstance(document.getElementById('courseModal')).hide();});
});

function deleteStudent(id){
  fetch('/api/students/'+id, { method:'DELETE', headers:{ Authorization:'Bearer '+token }}).then(()=>loadStudents());
}
function deleteCourse(id){
  fetch('/api/courses/'+id, { method:'DELETE', headers:{ Authorization:'Bearer '+token }}).then(()=>loadCourses());
}

$(function(){ loadStudents(); loadCourses(); });
