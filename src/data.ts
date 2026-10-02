export type Role = 'STUDENT' | 'ADMIN' | 'DIRECTOR'
export type StudentStatus = 'Active' | 'Inactive' | 'Graduated' | 'Frozen'
export interface CredentialVerifier { salt: string; hash: string }

export interface User {
  id: string
  name: string
  email: string
  role: Role
  phone?: string
  dateOfBirth?: string
  course?: string
  group?: string
  status?: StudentStatus
}

export interface Course {
  id: string
  name: string
  category: string
  description: string
  duration: string
  level: string
  price: number
  teacher: string
  students: number
  rating: number
  image: string
  tone: string
}

export interface Application {
  id: string
  name: string
  phone: string
  course: string
  email?: string
  message?: string
  date: string
  status: 'New' | 'Contacted' | 'Approved' | 'Rejected'
}

export interface AcademyData {
  users: User[]
  studentPasswords: Record<string, CredentialVerifier>
  courses: Course[]
  applications: Application[]
  notifications: string[]
  attendance: { date: string; status: 'Kelgan' | 'Kelmagan' | 'Kechikkan'; subject: string }[]
  grades: { subject: string; assignment: string; date: string; score: number; comment: string }[]
  payments: { date: string; amount: number; method: string; status: string }[]
  credentials: { adminEmail: string; adminVerifier: CredentialVerifier; directorEmail: string; directorVerifier: CredentialVerifier }
}

const sampleCourses: Course[] = [
  { id: 'c1', name: 'Frontend Development', category: 'WEB DEVELOPMENT', description: 'Interaktiv web tajribalar va zamonaviy interfeyslar yarating.', duration: '6 oy', level: 'Boshlang‘ich', price: 890000, teacher: 'Azizbek Karimov', students: 128, rating: 4.9, image: 'photo-1498050108023-c5249f4df085', tone: 'blue' },
  { id: 'c2', name: 'Backend Development', category: 'ENGINEERING', description: 'Ishonchli serverlar, API va ma’lumotlar bazalarini quring.', duration: '8 oy', level: 'O‘rta', price: 990000, teacher: 'Sardor Akbarov', students: 84, rating: 4.8, image: 'photo-1558494949-ef010cbdcc31', tone: 'violet' },
  { id: 'c3', name: 'Python & Data Science', category: 'DATA & AI', description: 'Python asoslari va ma’lumotlardan qiymat olishni o‘rganing.', duration: '6 oy', level: 'Boshlang‘ich', price: 790000, teacher: 'Madina Islomova', students: 96, rating: 4.9, image: 'photo-1516321318423-f06f85e504b3', tone: 'green' },
  { id: 'c4', name: 'UI/UX Design', category: 'PRODUCT DESIGN', description: 'Tadqiqotdan prototipgacha foydalanuvchi uchun mahsulot yarating.', duration: '5 oy', level: 'Boshlang‘ich', price: 750000, teacher: 'Diyora Xasanova', students: 72, rating: 4.8, image: 'photo-1558655146-9f40138edfeb', tone: 'orange' },
  { id: 'c5', name: 'Mobile Development', category: 'APP DEVELOPMENT', description: 'Flutter yordamida iOS va Android uchun ilovalar yarating.', duration: '7 oy', level: 'O‘rta', price: 950000, teacher: 'Javohir Ergashev', students: 63, rating: 4.9, image: 'photo-1511707171634-5f897ff02aa9', tone: 'pink' },
  { id: 'c6', name: 'JavaScript', category: 'WEB DEVELOPMENT', description: 'Zamonaviy JavaScript va web dasturlash asoslarini o‘rganing.', duration: '4 oy', level: 'Boshlang‘ich', price: 790000, teacher: 'Azizbek Karimov', students: 110, rating: 4.9, image: 'photo-1555066931-4365d14bab8c', tone: 'cyan' },
  { id: 'c7', name: 'React.js', category: 'WEB DEVELOPMENT', description: 'Reusable komponentlar va React yordamida tezkor interfeyslar yarating.', duration: '4 oy', level: 'O‘rta', price: 850000, teacher: 'Azizbek Karimov', students: 91, rating: 4.9, image: 'photo-1633356122544-f134324a6cee', tone: 'cyan' },
  { id: 'c8', name: 'Fullstack Development', category: 'WEB DEVELOPMENT', description: 'Frontend va backendni birlashtirib to‘liq web mahsulot yarating.', duration: '10 oy', level: 'O‘rta', price: 1290000, teacher: 'Sardor Akbarov', students: 78, rating: 4.9, image: 'photo-1519389950473-47ba0277781c', tone: 'blue' },
  { id: 'c9', name: 'Node.js', category: 'ENGINEERING', description: 'Node.js va ma’lumotlar bazalari orqali backend tizimlar yarating.', duration: '5 oy', level: 'O‘rta', price: 890000, teacher: 'Sardor Akbarov', students: 67, rating: 4.8, image: 'photo-1558494949-ef010cbdcc31', tone: 'green' },
  { id: 'c10', name: 'Graphic Design', category: 'PRODUCT DESIGN', description: 'Brend identifikatsiyasi va vizual kommunikatsiya asoslari.', duration: '4 oy', level: 'Boshlang‘ich', price: 690000, teacher: 'Diyora Xasanova', students: 58, rating: 4.8, image: 'photo-1545235617-9465d2a55698', tone: 'orange' },
  { id: 'c11', name: 'SMM & Digital Marketing', category: 'DIGITAL', description: 'Kontent strategiyasi va raqamli marketing kampaniyalarini boshqaring.', duration: '3 oy', level: 'Boshlang‘ich', price: 650000, teacher: 'Diyora Xasanova', students: 73, rating: 4.7, image: 'photo-1552664730-d307ca884978', tone: 'pink' },
  { id: 'c12', name: 'Computer Science', category: 'ENGINEERING', description: 'Algoritmlar, ma’lumot tuzilmalari va computational thinking.', duration: '6 oy', level: 'O‘rta', price: 850000, teacher: 'Javohir Ergashev', students: 46, rating: 4.9, image: 'photo-1516321318423-f06f85e504b3', tone: 'violet' },
  { id: 'c13', name: 'Computer Literacy', category: 'DIGITAL', description: 'Kompyuter, internet va kundalik raqamli vositalardan samarali foydalaning.', duration: '2 oy', level: 'Boshlang‘ich', price: 450000, teacher: 'Madina Islomova', students: 104, rating: 4.8, image: 'photo-1516321318423-f06f85e504b3', tone: 'blue' },
  { id: 'c14', name: 'Robotics', category: 'ENGINEERING', description: 'Elektronika va dasturlash yordamida aqlli qurilmalar yarating.', duration: '5 oy', level: 'Boshlang‘ich', price: 790000, teacher: 'Javohir Ergashev', students: 39, rating: 4.9, image: 'photo-1485827404703-89b55fcc595e', tone: 'green' },
]

const initialData: AcademyData = {
  users: [
    { id: 's1', name: 'Muhammadali To‘rayev', email: 'student@academy.uz', role: 'STUDENT', course: 'Frontend Development', group: 'Frontend-01', status: 'Active' },
    { id: 's2', name: 'Malika Saidova', email: 'malika@academy.uz', role: 'STUDENT', course: 'Python & Data Science', group: 'Python-01', status: 'Active' },
    { id: 's3', name: 'Jasur Olimov', email: 'jasur@academy.uz', role: 'STUDENT', course: 'UI/UX Design', group: 'Design-02', status: 'Graduated' },
    { id: 'a1', name: 'Akademiya administratori', email: 'abduazizabumanonov6@gmail.com', role: 'ADMIN' },
    { id: 'd1', name: 'Akademiya direktori', email: 'abduazizabdumanonov7@gmail.com', role: 'DIRECTOR' },
  ],
  studentPasswords: { 'student@academy.uz': { salt: 'academy-student-v1', hash: '305abc0877e8c47cbb488a8ce91a4129d228085da4dc123e975687b43654a570' } },
  courses: sampleCourses,
  applications: [{ id: 'app1', name: 'Shahzod Murodov', phone: '+998 90 123 45 67', course: 'Frontend Development', date: '2026-10-02', status: 'New' }],
  notifications: ['Yangi ariza: Frontend Development', 'Frontend-01 guruhi darsi bugun 18:00 da'],
  attendance: [
    { date: '2026-09-29', status: 'Kelgan', subject: 'React komponentlari' },
    { date: '2026-09-26', status: 'Kelgan', subject: 'JavaScript async' },
    { date: '2026-09-24', status: 'Kechikkan', subject: 'CSS Grid' },
    { date: '2026-09-22', status: 'Kelgan', subject: 'HTML semantikasi' },
    { date: '2026-09-19', status: 'Kelmagan', subject: 'JavaScript asoslari' },
  ],
  grades: [
    { subject: 'Frontend', assignment: 'Dashboard UI', date: '2026-09-28', score: 94, comment: 'Ajoyib kompozitsiya va toza kod.' },
    { subject: 'JavaScript', assignment: 'API bilan ishlash', date: '2026-09-24', score: 88, comment: 'Xatolarni boshqarishga e’tibor bering.' },
    { subject: 'HTML/CSS', assignment: 'Portfolio sahifa', date: '2026-09-18', score: 96, comment: 'Juda yaxshi responsive yondashuv.' },
  ],
  payments: [
    { date: '2026-10-01', amount: 890000, method: 'Payme', status: 'To‘langan' },
    { date: '2026-09-01', amount: 890000, method: 'Click', status: 'To‘langan' },
    { date: '2026-08-01', amount: 890000, method: 'Karta', status: 'To‘langan' },
  ],
  credentials: {
    adminEmail: 'abduazizabumanonov6@gmail.com', adminVerifier: { salt: 'academy-admin-v1', hash: 'ddcd5814ff19aa3ccdd157edd9cfeae375680182b07583b4f2cbcdd912b5ba1a' },
    directorEmail: 'abduazizabdumanonov7@gmail.com', directorVerifier: { salt: 'academy-director-v1', hash: '1f35e306e844f37976e3c8567536f70d4b798648b0f4ea8b1d4f7bccd442cf43' },
  },
}

const STORAGE_KEY = 'abduaziz-academy-data-v3'

export function loadData(): AcademyData {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved ? { ...initialData, ...JSON.parse(saved) as Partial<AcademyData> } : initialData
  } catch {
    return initialData
  }
}

export function saveData(data: AcademyData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

async function deriveVerifier(code: string, salt: string): Promise<string> {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(code), 'PBKDF2', false, ['deriveBits'])
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt: new TextEncoder().encode(salt), iterations: 310000, hash: 'SHA-256' }, key, 256)
  return Array.from(new Uint8Array(bits), (byte) => byte.toString(16).padStart(2, '0')).join('')
}

export async function createCredentialVerifier(code: string): Promise<CredentialVerifier> {
  const salt = crypto.randomUUID()
  return { salt, hash: await deriveVerifier(code, salt) }
}

export async function verifyCredentialCode(code: string, verifier: CredentialVerifier): Promise<boolean> {
  return (await deriveVerifier(code, verifier.salt)) === verifier.hash
}

export async function authenticate(data: AcademyData, email: string, code: string): Promise<User | null> {
  const normalizedEmail = email.trim().toLowerCase()
  const credential = data.credentials
  if (normalizedEmail === credential.adminEmail.toLowerCase() && await verifyCredentialCode(code, credential.adminVerifier)) {
    return data.users.find((user) => user.role === 'ADMIN' && user.email.toLowerCase() === normalizedEmail) ?? null
  }
  if (normalizedEmail === credential.directorEmail.toLowerCase() && await verifyCredentialCode(code, credential.directorVerifier)) {
    return data.users.find((user) => user.role === 'DIRECTOR' && user.email.toLowerCase() === normalizedEmail) ?? null
  }
  const student = data.users.find((user) => user.role === 'STUDENT' && user.email.toLowerCase() === normalizedEmail)
  const verifier = data.studentPasswords[normalizedEmail]
  return student && verifier && await verifyCredentialCode(code, verifier) ? student : null
}

export function submitApplication(data: AcademyData, input: Omit<Application, 'id' | 'date' | 'status'>): AcademyData {
  const application: Application = { ...input, id: crypto.randomUUID(), date: new Date().toISOString().slice(0, 10), status: 'New' }
  return { ...data, applications: [application, ...data.applications], notifications: [`Yangi ariza: ${input.course}`, ...data.notifications] }
}

export async function registerStudent(data: AcademyData, input: { name: string; email: string; phone: string; dateOfBirth: string; course: string; password: string }): Promise<AcademyData> {
  const email = input.email.toLowerCase()
  const user: User = { id: crypto.randomUUID(), name: input.name, email, phone: input.phone, dateOfBirth: input.dateOfBirth, role: 'STUDENT', course: input.course, group: 'Yangi guruh', status: 'Active' }
  const next = { ...data, users: [...data.users, user], studentPasswords: { ...data.studentPasswords, [email]: await createCredentialVerifier(input.password) } }
  return submitApplication(next, { name: input.name, phone: input.phone, email, course: input.course })
}
