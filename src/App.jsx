import { useEffect, useMemo, useState } from 'react'

const API_BASE = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

async function apiGet(path) {
  const res = await fetch(`${API_BASE}${path}`)
  if (!res.ok) throw new Error(`GET ${path} failed: ${res.status}`)
  return res.json()
}

async function apiPost(path, body) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`POST ${path} failed: ${res.status} ${text}`)
  }
  return res.json()
}

function Section({ title, children, actions }) {
  return (
    <div className="bg-white rounded-xl shadow p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
        {actions}
      </div>
      <div className="border-t pt-4">{children}</div>
    </div>
  )
}

function Input({ label, ...props }) {
  return (
    <label className="block">
      <span className="text-sm text-gray-600">{label}</span>
      <input {...props} className="mt-1 w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500" />
    </label>
  )
}

function TextArea({ label, ...props }) {
  return (
    <label className="block">
      <span className="text-sm text-gray-600">{label}</span>
      <textarea {...props} className="mt-1 w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500" />
    </label>
  )
}

function Button({ children, ...props }) {
  return (
    <button {...props} className={`inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50 ${props.className||''}`}>{children}</button>
  )
}

function Pill({ children }) {
  return <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-700">{children}</span>
}

export default function App() {
  const [activeRole, setActiveRole] = useState('admin') // admin | teacher | student
  const [loading, setLoading] = useState(false)
  const [feed, setFeed] = useState({ announcements: [], circulars: [], events: [] })

  const loadFeed = async () => {
    try {
      const data = await apiGet('/feed')
      setFeed(data)
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => { loadFeed() }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-indigo-50">
      <header className="sticky top-0 backdrop-blur bg-white/70 border-b z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-lg bg-indigo-600 text-white grid place-items-center font-bold">SM</div>
            <div>
              <h1 className="text-lg font-semibold text-gray-800">School Management Portal</h1>
              <p className="text-xs text-gray-500">All-in-one admin, teacher and student workspace</p>
            </div>
          </div>
          <nav className="flex items-center gap-2">
            {['admin','teacher','student'].map(role => (
              <button key={role} onClick={() => setActiveRole(role)} className={`px-3 py-1.5 rounded-md text-sm font-medium ${activeRole===role?'bg-indigo-600 text-white':'text-gray-700 hover:bg-gray-100'}`}>{role.charAt(0).toUpperCase()+role.slice(1)}</button>
            ))}
            <a href="/test" className="ml-2 text-sm text-gray-600 hover:text-gray-900 underline">Check backend</a>
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          {activeRole === 'admin' && <AdminPanel onChange={loadFeed} setLoading={setLoading} />}
          {activeRole === 'teacher' && <TeacherPanel onChange={loadFeed} setLoading={setLoading} />}
          {activeRole === 'student' && <StudentPanel onChange={loadFeed} setLoading={setLoading} />}
        </div>
        <aside className="space-y-6">
          <Section title="Live Feed">
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-gray-800 mb-2">Announcements</h3>
                <ul className="space-y-2">
                  {feed.announcements.map(a => (
                    <li key={a.id} className="p-3 rounded-md bg-gray-50">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-gray-800">{a.title}</p>
                        {a.pinned && <Pill>Pinned</Pill>}
                      </div>
                      <p className="text-sm text-gray-600">{a.body}</p>
                      <p className="text-xs text-gray-400 mt-1">Audience: {a.audience}</p>
                    </li>
                  ))}
                  {feed.announcements.length === 0 && <p className="text-sm text-gray-500">No announcements yet.</p>}
                </ul>
              </div>
              <div>
                <h3 className="font-medium text-gray-800 mb-2">Circulars</h3>
                <ul className="space-y-2">
                  {feed.circulars.map(c => (
                    <li key={c.id} className="p-3 rounded-md bg-gray-50">
                      <p className="font-medium text-gray-800">{c.title}</p>
                      <p className="text-sm text-gray-600">{c.body}</p>
                    </li>
                  ))}
                  {feed.circulars.length === 0 && <p className="text-sm text-gray-500">No circulars yet.</p>}
                </ul>
              </div>
              <div>
                <h3 className="font-medium text-gray-800 mb-2">Events</h3>
                <ul className="space-y-2">
                  {feed.events.map(e => (
                    <li key={e.id} className="p-3 rounded-md bg-gray-50">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-gray-800">{e.title}</p>
                        <Pill>{new Date(e.starts_at).toLocaleString()}</Pill>
                      </div>
                      <p className="text-sm text-gray-600">{e.description}</p>
                      {e.location && <p className="text-xs text-gray-500 mt-1">{e.location}</p>}
                    </li>
                  ))}
                  {feed.events.length === 0 && <p className="text-sm text-gray-500">No events yet.</p>}
                </ul>
              </div>
            </div>
          </Section>
        </aside>
      </main>

      {loading && (
        <div className="fixed inset-0 bg-black/10 grid place-items-center pointer-events-none">
          <div className="bg-white shadow rounded-md px-4 py-2 text-sm">Working...</div>
        </div>
      )}
    </div>
  )
}

function AdminPanel({ onChange, setLoading }) {
  // forms state
  const [t, setT] = useState({ name: '', email: '', department: '' })
  const [ann, setAnn] = useState({ title: '', body: '', audience: 'all', pinned: false })
  const [cir, setCir] = useState({ title: '', body: '', audience: 'all' })
  const [evt, setEvt] = useState({ title: '', description: '', starts_at: '', ends_at: '', location: '' })

  const submit = async (fn) => {
    try { setLoading(true); await fn(); onChange(); } finally { setLoading(false) }
  }

  return (
    <div className="space-y-6">
      <Section title="Add Teacher">
        <div className="grid md:grid-cols-3 gap-3">
          <Input label="Name" value={t.name} onChange={e=>setT({...t,name:e.target.value})} />
          <Input label="Email" value={t.email} onChange={e=>setT({...t,email:e.target.value})} />
          <Input label="Department" value={t.department} onChange={e=>setT({...t,department:e.target.value})} />
        </div>
        <div className="mt-3">
          <Button onClick={()=>submit(()=>apiPost('/admin/teachers', t).then(()=>setT({name:'',email:'',department:''})))}>Save Teacher</Button>
        </div>
      </Section>

      <Section title="Announcements">
        <div className="grid md:grid-cols-2 gap-3">
          <Input label="Title" value={ann.title} onChange={e=>setAnn({...ann,title:e.target.value})} />
          <Input label="Audience" value={ann.audience} onChange={e=>setAnn({...ann,audience:e.target.value})} />
          <TextArea label="Body" rows={3} value={ann.body} onChange={e=>setAnn({...ann,body:e.target.value})} />
          <label className="flex items-center gap-2 text-sm text-gray-700 mt-6"><input type="checkbox" checked={ann.pinned} onChange={e=>setAnn({...ann,pinned:e.target.checked})} />Pinned</label>
        </div>
        <div className="mt-3">
          <Button onClick={()=>submit(()=>apiPost('/admin/announcements', ann).then(()=>setAnn({title:'',body:'',audience:'all', pinned:false})))}>Post Announcement</Button>
        </div>
      </Section>

      <Section title="Circulars">
        <div className="grid md:grid-cols-2 gap-3">
          <Input label="Title" value={cir.title} onChange={e=>setCir({...cir,title:e.target.value})} />
          <Input label="Audience" value={cir.audience} onChange={e=>setCir({...cir,audience:e.target.value})} />
          <TextArea label="Body" rows={3} value={cir.body} onChange={e=>setCir({...cir,body:e.target.value})} />
        </div>
        <div className="mt-3">
          <Button onClick={()=>submit(()=>apiPost('/admin/circulars', cir).then(()=>setCir({title:'',body:'',audience:'all'})))}>Publish Circular</Button>
        </div>
      </Section>

      <Section title="Events">
        <div className="grid md:grid-cols-2 gap-3">
          <Input label="Title" value={evt.title} onChange={e=>setEvt({...evt,title:e.target.value})} />
          <Input label="Starts At" type="datetime-local" value={evt.starts_at} onChange={e=>setEvt({...evt,starts_at:e.target.value})} />
          <Input label="Ends At" type="datetime-local" value={evt.ends_at} onChange={e=>setEvt({...evt,ends_at:e.target.value})} />
          <Input label="Location" value={evt.location} onChange={e=>setEvt({...evt,location:e.target.value})} />
          <TextArea label="Description" rows={3} value={evt.description} onChange={e=>setEvt({...evt,description:e.target.value})} />
        </div>
        <div className="mt-3">
          <Button onClick={()=>submit(()=>apiPost('/admin/events', {
            ...evt,
            starts_at: evt.starts_at ? new Date(evt.starts_at).toISOString() : new Date().toISOString(),
            ends_at: evt.ends_at ? new Date(evt.ends_at).toISOString() : new Date().toISOString(),
          }).then(()=>setEvt({title:'',description:'',starts_at:'',ends_at:'',location:''})))}>
            Create Event
          </Button>
        </div>
      </Section>
    </div>
  )
}

function TeacherPanel({ onChange, setLoading }) {
  const [student, setStudent] = useState({ name:'', email:'', roll_number:'', department:'', year:'', section:'' })
  const [klass, setKlass] = useState({ name:'', department:'', year:'', section:'', teacher_id:'' })
  const [material, setMaterial] = useState({ class_id:'', title:'', description:'', file_url:'', uploaded_by:'' })
  const [assignment, setAssignment] = useState({ class_id:'', title:'', description:'', due_date:'', type:'homework', created_by:'' })
  const [approve, setApprove] = useState({ record_id:'', approved_by:'' })

  const submit = async (fn) => { try { setLoading(true); await fn(); onChange(); } finally { setLoading(false) } }

  return (
    <div className="space-y-6">
      <Section title="Add Student">
        <div className="grid md:grid-cols-3 gap-3">
          <Input label="Name" value={student.name} onChange={e=>setStudent({...student,name:e.target.value})} />
          <Input label="Email" value={student.email} onChange={e=>setStudent({...student,email:e.target.value})} />
          <Input label="Roll Number" value={student.roll_number} onChange={e=>setStudent({...student,roll_number:e.target.value})} />
          <Input label="Department" value={student.department} onChange={e=>setStudent({...student,department:e.target.value})} />
          <Input label="Year" type="number" value={student.year} onChange={e=>setStudent({...student,year: Number(e.target.value)})} />
          <Input label="Section" value={student.section} onChange={e=>setStudent({...student,section:e.target.value})} />
        </div>
        <div className="mt-3">
          <Button onClick={()=>submit(()=>apiPost('/teachers/students', student).then(()=>setStudent({name:'',email:'',roll_number:'',department:'',year:'',section:''})))}>Save Student</Button>
        </div>
      </Section>

      <Section title="Create Class">
        <div className="grid md:grid-cols-3 gap-3">
          <Input label="Name" value={klass.name} onChange={e=>setKlass({...klass,name:e.target.value})} />
          <Input label="Department" value={klass.department} onChange={e=>setKlass({...klass,department:e.target.value})} />
          <Input label="Year" type="number" value={klass.year} onChange={e=>setKlass({...klass,year:Number(e.target.value)})} />
          <Input label="Section" value={klass.section} onChange={e=>setKlass({...klass,section:e.target.value})} />
          <Input label="Teacher ID (in-charge)" value={klass.teacher_id} onChange={e=>setKlass({...klass,teacher_id:e.target.value})} />
        </div>
        <div className="mt-3">
          <Button onClick={()=>submit(()=>apiPost('/teachers/classes', klass).then(()=>setKlass({name:'',department:'',year:'',section:'',teacher_id:''})))}>Create Class</Button>
        </div>
      </Section>

      <Section title="Upload Study Material">
        <div className="grid md:grid-cols-2 gap-3">
          <Input label="Class ID" value={material.class_id} onChange={e=>setMaterial({...material,class_id:e.target.value})} />
          <Input label="Title" value={material.title} onChange={e=>setMaterial({...material,title:e.target.value})} />
          <TextArea label="Description" rows={2} value={material.description} onChange={e=>setMaterial({...material,description:e.target.value})} />
          <Input label="File URL" value={material.file_url} onChange={e=>setMaterial({...material,file_url:e.target.value})} />
          <Input label="Uploaded By (teacher id)" value={material.uploaded_by} onChange={e=>setMaterial({...material,uploaded_by:e.target.value})} />
        </div>
        <div className="mt-3">
          <Button onClick={()=>submit(()=>apiPost('/teachers/materials', material).then(()=>setMaterial({ class_id:'', title:'', description:'', file_url:'', uploaded_by:'' })))}>Upload</Button>
        </div>
      </Section>

      <Section title="Create Assignment / Test / Homework">
        <div className="grid md:grid-cols-2 gap-3">
          <Input label="Class ID" value={assignment.class_id} onChange={e=>setAssignment({...assignment,class_id:e.target.value})} />
          <Input label="Title" value={assignment.title} onChange={e=>setAssignment({...assignment,title:e.target.value})} />
          <TextArea label="Description" rows={2} value={assignment.description} onChange={e=>setAssignment({...assignment,description:e.target.value})} />
          <Input label="Due Date" type="date" value={assignment.due_date} onChange={e=>setAssignment({...assignment,due_date:e.target.value})} />
          <Input label="Type (homework/test/project/quiz)" value={assignment.type} onChange={e=>setAssignment({...assignment,type:e.target.value})} />
          <Input label="Created By (teacher id)" value={assignment.created_by} onChange={e=>setAssignment({...assignment,created_by:e.target.value})} />
        </div>
        <div className="mt-3">
          <Button onClick={()=>submit(()=>apiPost('/teachers/assignments', assignment).then(()=>setAssignment({ class_id:'', title:'', description:'', due_date:'', type:'homework', created_by:'' })))}>Create</Button>
        </div>
      </Section>

      <Section title="Approve Attendance">
        <div className="grid md:grid-cols-2 gap-3">
          <Input label="Attendance Record ID" value={approve.record_id} onChange={e=>setApprove({...approve,record_id:e.target.value})} />
          <Input label="Approved By (teacher id)" value={approve.approved_by} onChange={e=>setApprove({...approve,approved_by:e.target.value})} />
        </div>
        <div className="mt-3">
          <Button onClick={()=>submit(()=>apiPost('/teachers/attendance/approve', approve).then(()=>setApprove({record_id:'',approved_by:''})))}>Approve</Button>
        </div>
      </Section>
    </div>
  )
}

function StudentPanel({ onChange, setLoading }) {
  const [att, setAtt] = useState({ class_id:'', student_id:'', date:'', status:'present', marked_by:'' })
  const [classId, setClassId] = useState('')
  const [materials, setMaterials] = useState([])
  const [assignments, setAssignments] = useState([])

  const submit = async (fn) => { try { setLoading(true); await fn(); onChange(); } finally { setLoading(false) } }

  const loadForClass = async () => {
    if (!classId) return
    try {
      const [m, a] = await Promise.all([
        apiGet(`/students/materials?class_id=${encodeURIComponent(classId)}`),
        apiGet(`/students/assignments?class_id=${encodeURIComponent(classId)}`),
      ])
      setMaterials(m)
      setAssignments(a)
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => { if (classId) loadForClass() }, [classId])

  return (
    <div className="space-y-6">
      <Section title="Mark Attendance">
        <div className="grid md:grid-cols-3 gap-3">
          <Input label="Class ID" value={att.class_id} onChange={e=>setAtt({...att,class_id:e.target.value})} />
          <Input label="Student ID" value={att.student_id} onChange={e=>setAtt({...att,student_id:e.target.value})} />
          <Input label="Date" type="date" value={att.date} onChange={e=>setAtt({...att,date:e.target.value})} />
          <Input label="Status (present/absent/late/excused)" value={att.status} onChange={e=>setAtt({...att,status:e.target.value})} />
          <Input label="Marked By (student id)" value={att.marked_by} onChange={e=>setAtt({...att,marked_by:e.target.value})} />
        </div>
        <div className="mt-3">
          <Button onClick={()=>submit(()=>apiPost('/students/attendance', { ...att, date: att.date ? new Date(att.date).toISOString().slice(0,10) : new Date().toISOString().slice(0,10) }).then(()=>setAtt({ class_id:'', student_id:'', date:'', status:'present', marked_by:'' })))}>Submit</Button>
        </div>
      </Section>

      <Section title="Study Materials & Assignments" actions={
        <div className="flex items-center gap-2">
          <Input label="Class ID" value={classId} onChange={e=>setClassId(e.target.value)} />
          <Button onClick={loadForClass}>Load</Button>
        </div>
      }>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-gray-50 rounded-md p-3">
            <h4 className="font-medium text-gray-800 mb-2">Materials</h4>
            <ul className="space-y-2">
              {materials.map(m => (
                <li key={m.id} className="p-2 bg-white rounded border">
                  <p className="font-medium">{m.title}</p>
                  <p className="text-sm text-gray-600">{m.description}</p>
                  {m.file_url && <a href={m.file_url} target="_blank" className="text-xs text-indigo-600 underline">Open</a>}
                </li>
              ))}
              {materials.length===0 && <p className="text-sm text-gray-500">No materials yet.</p>}
            </ul>
          </div>
          <div className="bg-gray-50 rounded-md p-3">
            <h4 className="font-medium text-gray-800 mb-2">Assignments</h4>
            <ul className="space-y-2">
              {assignments.map(a => (
                <li key={a.id} className="p-2 bg-white rounded border">
                  <p className="font-medium">{a.title} <span className="text-xs text-gray-500">({a.type})</span></p>
                  <p className="text-sm text-gray-600">{a.description}</p>
                  {a.due_date && <p className="text-xs text-gray-500">Due: {a.due_date}</p>}
                </li>
              ))}
              {assignments.length===0 && <p className="text-sm text-gray-500">No assignments yet.</p>}
            </ul>
          </div>
        </div>
      </Section>
    </div>
  )
}
