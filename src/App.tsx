import { useEffect, useState, type FormEvent, type ReactNode } from 'react'
import {
  Activity, ArrowRight, ArrowUpRight, Award, Bell, BookOpen, BriefcaseBusiness,
  CalendarDays, Check, CheckCircle2, ChevronDown, ChevronLeft, ChevronRight, Clock3, Code2,
  CreditCard, Download, Eye, EyeOff, FileBarChart2, Filter, GraduationCap, Layers3, LayoutDashboard,
  LockKeyhole, LogOut, Mail, Menu, MessageCircle, Monitor, MoreHorizontal, Plus, Search, Send,
  Shield, Sparkles, Star, Sun, Users, X, Zap,
} from 'lucide-react'
import {
  authenticate, createCredentialVerifier, loadData, saveData, submitApplication, registerStudent, verifyCredentialCode,
  type AcademyData, type Application, type Course, type Role, type StudentStatus, type User,
} from './data'
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer,
  Tooltip, XAxis, YAxis,
} from 'recharts'

const money = (amount: number) => new Intl.NumberFormat('uz-UZ').format(amount) + ' so‘m'
const roleNames: Record<Role, string> = { STUDENT: 'O‘quvchi', ADMIN: 'Administrator', DIRECTOR: 'Direktor' }
const avatar = (name: string) => `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=1e293b&color=e2e8f0&bold=true`
const appPath = () => {
  const fallbackPath = new URLSearchParams(window.location.search).get('route')
  if (fallbackPath?.startsWith('/')) return fallbackPath
  const base = import.meta.env.BASE_URL
  const path = window.location.pathname
  if (base === '/') return path
  return path.startsWith(base) ? `/${path.slice(base.length)}` || '/' : path
}
const appUrl = (path: string) => `${import.meta.env.BASE_URL}${path.replace(/^\/+/, '')}`
const dashboardRole = (path: string): Role | null => path === '/user' ? 'STUDENT' : path === '/admin/dashboard' ? 'ADMIN' : path === '/director/dashboard' ? 'DIRECTOR' : null
const dashboardPath = (role: Role) => role === 'STUDENT' ? '/user' : role === 'ADMIN' ? '/admin/dashboard' : '/director/dashboard'

function App() {
  const [data, setData] = useState<AcademyData>(() => loadData())
  const [currentPath, setCurrentPath] = useState(() => appPath())
  const [user, setUser] = useState<User | null>(() => {
    try { return JSON.parse(sessionStorage.getItem('academy-session') || 'null') as User | null } catch { return null }
  })
  const [registerOpen, setRegisterOpen] = useState(false)
  const [courseDetail, setCourseDetail] = useState<Course | null>(null)
  const [toast, setToast] = useState('')
  const [light, setLight] = useState(false)

  const navigateTo = (path: string) => {
    window.history.replaceState(null, '', appUrl(path))
    setCurrentPath(path)
  }

  useEffect(() => saveData(data), [data])
  useEffect(() => {
    const onPopState = () => setCurrentPath(appPath())
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])
  useEffect(() => {
    if (!toast) return
    const timer = window.setTimeout(() => setToast(''), 3400)
    return () => window.clearTimeout(timer)
  }, [toast])
  useEffect(() => {
    const role = dashboardRole(currentPath)
    if (!role || user?.role === role) return
    if (user) setUser(null)
    sessionStorage.removeItem('academy-session')
    setToast('Access Denied. Kerakli rol uchun alohida login qiling.')
  }, [currentPath, user])

  const updateData = (next: AcademyData) => setData(next)
  const signIn = async (email: string, code: string, expectedRole: Role) => {
    const found = await authenticate(data, email, code)
    if (!found || found.role !== expectedRole) {
      setToast(found ? 'Access Denied. Bu login faqat tegishli rol uchun.' : 'Email yoki kirish kodi noto‘g‘ri.')
      return false
    }
    setUser(found)
    sessionStorage.setItem('academy-session', JSON.stringify(found))
    navigateTo(dashboardPath(found.role))
    setToast(`Xush kelibsiz, ${found.name.split(' ')[0]}!`)
    return true
  }
  const signOut = () => {
    setUser(null)
    sessionStorage.removeItem('academy-session')
    navigateTo('/')
    setToast('Tizimdan muvaffaqiyatli chiqdingiz.')
  }
  const apply = (input: { name: string; phone: string; course: string; email?: string; message?: string }) => {
    const next = submitApplication(data, input)
    updateData(next)
    setToast('Arizangiz muvaffaqiyatli yuborildi.')
  }
  const enroll = (course: string) => {
    setCourseDetail(null)
    setRegisterOpen(true)
    window.setTimeout(() => {
      const select = document.querySelector<HTMLSelectElement>('#register-course')
      if (select) select.value = course
    }, 60)
  }
  const completeRegistration = async (input: { name: string; email: string; phone: string; dateOfBirth: string; course: string; password: string }) => {
    if (data.users.some((item) => item.email.toLowerCase() === input.email.toLowerCase())) {
      setToast('Bu email bilan akkaunt mavjud. Kirish sahifasidan foydalaning.')
      return
    }
    const next = await registerStudent(data, input)
    updateData(next)
    const created = next.users[next.users.length - 1]
    setUser(created)
    sessionStorage.setItem('academy-session', JSON.stringify(created))
    setRegisterOpen(false)
    navigateTo('/user')
    setToast('Akkauntingiz yaratildi. Akademiyaga xush kelibsiz!')
  }

  const path = currentPath
  const errorCode = ['/403', '/404', '/500'].includes(path) ? path.slice(1) : ''
  const knownPaths = ['/', '/user', '/admin/login', '/admin/dashboard', '/director/login', '/director/dashboard', '/403', '/404', '/500']
  if (errorCode || !knownPaths.includes(path)) return <ErrorPage code={errorCode || '404'} />

  const routeRole = dashboardRole(path)
  const showingDashboard = Boolean(routeRole && user?.role === routeRole)
  const loginRole: Role | null = path === '/admin/login' ? 'ADMIN' : path === '/director/login' ? 'DIRECTOR' : path === '/user' && user?.role !== 'STUDENT' ? 'STUDENT' : routeRole && user?.role !== routeRole ? routeRole : null

  return (
    <div className={light ? 'app theme-light' : 'app'}>
      {showingDashboard && user ? <Dashboard data={data} setData={updateData} user={user} setUser={setUser} onLogout={signOut} notify={setToast} onTheme={() => setLight(!light)} light={light} /> : loginRole ? (
        <RoleLoginPage role={loginRole} onLogin={signIn} onClose={() => navigateTo('/')} onRegister={() => setRegisterOpen(true)} />
      ) : (
        <Landing data={data} onApply={apply} onRegister={() => setRegisterOpen(true)} onCourse={setCourseDetail} onTheme={() => setLight(!light)} light={light} />
      )}
      {registerOpen && <RegisterModal courses={data.courses} onClose={() => setRegisterOpen(false)} onRegister={completeRegistration} />}
      {courseDetail && <CourseModal course={courseDetail} onClose={() => setCourseDetail(null)} onEnroll={enroll} />}
      {toast && <div className="toast"><CheckCircle2 size={18} />{toast}<button aria-label="Yopish" onClick={() => setToast('')}><X size={16} /></button></div>}
    </div>
  )
}

function Landing({ data, onApply, onRegister, onCourse, onTheme, light }: {
  data: AcademyData; onApply: (input: { name: string; phone: string; course: string }) => void
  onRegister: () => void; onCourse: (course: Course) => void; onTheme: () => void; light: boolean
}) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [category, setCategory] = useState('Barchasi')
  const categories = ['Barchasi', 'Dasturlash', 'Dizayn', 'Raqamli ko‘nikmalar']
  const filteredCourses = data.courses.filter((course) => category === 'Barchasi' ||
    (category === 'Dasturlash' && ['WEB DEVELOPMENT', 'ENGINEERING', 'APP DEVELOPMENT'].includes(course.category)) ||
    (category === 'Dizayn' && course.category === 'PRODUCT DESIGN') || (category === 'Raqamli ko‘nikmalar' && ['DIGITAL', 'DATA & AI'].includes(course.category)))

  return (
    <>
      <header className="public-header">
        <a href="#home" className="brand"><span className="brand-mark"><Code2 size={18} /></span><span>ABDUAZIZ<span className="brand-light"> IT ACADEMY</span></span></a>
        <nav className={menuOpen ? 'public-nav nav-open' : 'public-nav'}>
          {['Bosh sahifa', 'Kurslar', 'Biz haqimizda', 'Ustozlar', 'Natijalar', 'FAQ', 'Aloqa'].map((label, index) => <a key={label} href={`#${['home', 'courses', 'about', 'teachers', 'results', 'faq', 'contact'][index]}`} onClick={() => setMenuOpen(false)}>{label}</a>)}
        </nav>
        <div className="header-actions"><button className="language-select">UZ <ChevronDown size={13} /></button><button className="icon-btn theme-toggle" aria-label="Mavzuni almashtirish" onClick={onTheme}>{light ? <Monitor size={17} /> : <Sun size={17} />}</button><a className="button button-small button-outline header-courses" href="#courses">Kurslarni ko‘rish</a><a className="button button-small button-primary header-consult" href="#contact">Konsultatsiya olish</a><button className="mobile-menu icon-btn" aria-label="Menyuni ochish" onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X /> : <Menu />}</button></div>
      </header>

      <main>
        <section id="home" className="hero-section">
          <div className="hero-grid" />
          <div className="hero-content">
            <div className="eyebrow"><span className="eyebrow-dot" /> O‘ZBEKISTONNING YANGI AVLOD IT AKADEMIYASI</div>
            <h1>IT sohasidagi kelajagingizni <span>bugundan</span> boshlang.</h1>
            <p className="hero-description">Zamonaviy dasturlash, web development, backend, mobile va boshqa IT yo‘nalishlarini professional mentorlar bilan o‘rganing.</p>
            <div className="hero-actions"><a className="button button-primary button-large" href="#courses">Kurslarni ko‘rish <ArrowRight size={17} /></a><a className="button button-quiet button-large" href="#contact"><span className="play-icon"><ArrowRight size={13} /></span> Bepul konsultatsiya</a></div>
            <div className="hero-proof"><div className="avatar-stack">{['Aziz', 'Madina', 'Diyor', 'Javohir'].map((name) => <img key={name} src={avatar(name)} alt="Akademiya o‘quvchisi" />)}</div><div><div className="proof-stars"><Star size={13} fill="currentColor" /><Star size={13} fill="currentColor" /><Star size={13} fill="currentColor" /><Star size={13} fill="currentColor" /><Star size={13} fill="currentColor" /><span>4.9 / 5</span></div><small>Bitiruvchilarimizdan 500+ fikr</small></div></div>
          </div>
          <div className="hero-visual" aria-label="Dasturlash muhitining tasviri">
            <div className="visual-orbit orbit-one" /><div className="visual-orbit orbit-two" />
            <div className="visual-image"><img src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=85" alt="Dasturchi ish stoli va kod muhiti" /><div className="image-shade" /></div>
            <div className="code-window"><div className="code-bar"><span /><span /><span /><small>academy.tsx</small><MoreHorizontal size={16} /></div><pre><code><span className="code-purple">const</span> <span className="code-blue">future</span> = {'{'}<br />  skills: [<span className="code-green">'code'</span>, <span className="code-green">'create'</span>],<br />  mentor: <span className="code-orange">true</span>,<br />  success: <span className="code-purple">async</span> () ={`>`} {'{'}<br />    <span className="code-purple">return</span> <span className="code-blue">you</span>.build();<br />  {'}'}<br />{'}'}</code></pre></div>
            <div className="float-stat float-students"><div className="float-icon"><Users size={17} /></div><div><strong>1,000+</strong><small>O‘quvchi</small></div><span className="live-dot" /></div>
            <div className="float-stat float-success"><div className="success-ring">95%</div><div><strong>Bitiruvchilar</strong><small>ish bilan band</small></div></div>
            <div className="visual-caption"><span className="caption-line" /> REAL LOYIHALAR. HAQIQIY NATIJA.</div>
          </div>
          <div className="hero-bottom-stats"><div><strong>20<span>+</span></strong><small>amaliy kurslar</small></div><i /><div><strong>15<span>+</span></strong><small>tajribali mentorlar</small></div><i /><div><strong>95<span>%</span></strong><small>bitiruvchilar natijasi</small></div><i /><div className="hero-bottom-note">Kelajak uchun<br />amaliy bilimlar.</div></div>
        </section>

        <section id="courses" className="section courses-section"><div className="section-heading"><div><div className="section-kicker">BILIMDAN KASBGACHA</div><h2>O‘zingizga mos <span>yo‘nalishni</span> toping</h2><p>Bozor talab qilayotgan kasblarni real loyihalar ustida o‘rganing.</p></div><a className="text-link" href="#contact">Barcha kurslar <ArrowRight size={16} /></a></div>
          <div className="course-filters">{categories.map((item) => <button key={item} className={category === item ? 'filter-chip active' : 'filter-chip'} onClick={() => setCategory(item)}>{item}</button>)}</div>
          <div className="course-grid">{filteredCourses.map((course) => <CourseCard key={course.id} course={course} onOpen={() => onCourse(course)} />)}</div>
        </section>

        <section id="about" className="section why-section"><div className="why-intro"><div className="section-kicker">BIZNING YONDASHUV</div><h2>Faqat o‘rganmang.<br /><span>Yarating.</span></h2><p>Biz texnologiya o‘rgatmaymiz, sizni texnologiya yordamida muammolarni hal qiladigan mutaxassisga aylantiramiz.</p><a className="button button-outline" href="#contact">Akademiya haqida <ArrowRight size={16} /></a></div><div className="why-grid">{[
            { icon: <BriefcaseBusiness />, title: 'Real loyihalar', text: 'Portfolioingizni haqiqiy ishlar bilan to‘ldiring.' },
            { icon: <Users />, title: 'Kuchli mentorlar', text: 'Har qadamda tajribali mutaxassislar ko‘magi.' },
            { icon: <Zap />, title: 'Amaliy ta’lim', text: 'Darslarning 80 foizi amaliy mashg‘ulotlardan iborat.' },
            { icon: <Award />, title: 'Karyera yordami', text: 'CV, suhbat va ishga joylashish bo‘yicha yo‘l-yo‘riq.' },
          ].map((item, index) => <article key={item.title} className="why-item"><span className={`why-icon why-icon-${index}`}>{item.icon}</span><h3>{item.title}</h3><p>{item.text}</p><span className="why-index">0{index + 1}</span></article>)}</div></section>

        <section className="outcomes-band"><div className="outcomes-photo"><img src="https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=1000&q=80" alt="Birgalikda loyiha ustida ishlayotgan jamoa" /><div className="photo-label"><span className="live-dot" /> STUDENT COMMUNITY</div></div><div className="outcomes-copy"><div className="section-kicker">KEYINGI QADAM SIZNIKI</div><h2>Bilimni <span>imkoniyatga</span> aylantiring.</h2><p>Akademiyamiz bitiruvchilari yetakchi kompaniyalarda faoliyat yuritmoqda yoki o‘z mahsulotlarini yaratmoqda.</p><div className="outcomes-metrics"><div><strong>500<span>+</span></strong><small>Bitiruvchi</small></div><div><strong>50<span>+</span></strong><small>Real loyiha</small></div><div><strong>92<span>%</span></strong><small>Ishga joylashish</small></div></div><a className="button button-primary" href="#results">Bitiruvchilar hikoyasi <ArrowRight size={16} /></a></div></section>

        <section id="teachers" className="section teachers-section"><div className="section-heading"><div><div className="section-kicker">SIZGA YO‘L KO‘RSATUVCHILAR</div><h2>Amaliyotchi <span>ustozlar</span></h2><p>Bugun sanoatda ishlayotgan mutaxassislardan o‘rganing.</p></div><a className="text-link" href="#contact">Ustozlar bilan tanishing <ArrowRight size={16} /></a></div><div className="teacher-grid">{[
            { name: 'Azizbek Karimov', role: 'Frontend mentor', skills: 'React · JavaScript', exp: '7 yil tajriba', img: 'photo-1500648767791-00dcc994a43e', score: '4.9' },
            { name: 'Madina Islomova', role: 'Data Science mentor', skills: 'Python · Machine Learning', exp: '6 yil tajriba', img: 'photo-1580489944761-15a19d654956', score: '5.0' },
            { name: 'Sardor Akbarov', role: 'Backend mentor', skills: 'Node.js · PostgreSQL', exp: '8 yil tajriba', img: 'photo-1506794778202-cad84cf45f1d', score: '4.9' },
            { name: 'Diyora Xasanova', role: 'Product design mentor', skills: 'UI/UX · Figma', exp: '5 yil tajriba', img: 'photo-1534528741775-53994a69daeb', score: '4.8' },
          ].map((teacher) => <article key={teacher.name} className="teacher-card"><div className="teacher-photo"><img src={`https://images.unsplash.com/${teacher.img}?auto=format&fit=crop&w=600&q=80`} alt={teacher.name} /><span className="teacher-rating"><Star size={12} fill="currentColor" /> {teacher.score}</span></div><div className="teacher-info"><h3>{teacher.name}</h3><p>{teacher.role}</p><div className="teacher-skills">{teacher.skills}</div><small><span className="live-dot" /> {teacher.exp}</small></div></article>)}</div></section>

        <section id="results" className="section stories-section"><div className="story-label"><div className="section-kicker">ULARNING YO‘LI SIZNIKI HAM BO‘LISHI MUMKIN</div><h2>Yangi kasb. <span>Yangi imkoniyat.</span></h2></div><article className="story-feature"><div className="story-person"><img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=450&q=80" alt="Bitiruvchi Muhammadali" /><span className="story-quote-mark">“</span></div><div className="story-content"><div className="proof-stars"><Star size={14} fill="currentColor" /><Star size={14} fill="currentColor" /><Star size={14} fill="currentColor" /><Star size={14} fill="currentColor" /><Star size={14} fill="currentColor" /></div><blockquote>“Olti oy oldin kod yozishni bilmasdim. Bugun esa o‘z jamoam bilan mahsulotlar ustida ishlayapman.”</blockquote><div className="story-person-meta"><strong>Muhammadali To‘rayev</strong><span>Frontend bitiruvchisi · Junior React Developer</span></div><div className="story-progress"><span>OLDIN</span><div><i /></div><span>HOZIR</span><strong>+ yangi karyera</strong></div></div></article></section>

        <section className="section pricing-section"><div className="section-heading"><div><div className="section-kicker">SHAFFOF VA QULAY</div><h2>O‘sishingiz uchun <span>reja</span></h2><p>Ta’limga sarmoya kiriting. Qolgan yo‘lda siz bilan birgamiz.</p></div></div><div className="pricing-grid">{[
            { title: 'START', price: '690 000', desc: 'Mustahkam asoslar uchun', lessons: 'Haftasiga 3 dars', projects: '4 amaliy loyiha', mentor: 'Guruh mentori', featured: false },
            { title: 'PRO', price: '890 000', desc: 'Kasbga tayyorlanish uchun', lessons: 'Haftasiga 4 dars', projects: '8 portfolio loyihasi', mentor: 'Shaxsiy mentor', featured: true },
            { title: 'FULLSTACK', price: '1 290 000', desc: 'To‘liq mahsulot yaratish uchun', lessons: 'Haftasiga 5 dars', projects: '12 real loyiha', mentor: '1:1 mentor yordami', featured: false },
          ].map((plan) => <article key={plan.title} className={plan.featured ? 'price-card featured' : 'price-card'}>{plan.featured && <span className="popular-label">ENG MASHHUR</span>}<div className="price-plan">{plan.title}</div><p>{plan.desc}</p><div className="price-amount"><strong>{plan.price}</strong><span>so‘m / oy</span></div><div className="price-divider" />{[plan.lessons, plan.projects, plan.mentor, 'Yakuniy sertifikat'].map((feature) => <div key={feature} className="price-feature"><Check size={15} />{feature}</div>)}<button className={plan.featured ? 'button button-primary price-cta' : 'button button-outline price-cta'} onClick={onRegister}>Boshlash <ArrowRight size={15} /></button></article>)}</div></section>

        <section id="faq" className="section faq-section"><div><div className="section-kicker">SAVOLLARINGIZ BORMI?</div><h2>Ko‘p so‘raladigan <span>savollar</span></h2><p>Akademiyadagi ta’lim va jarayonlar haqida.</p><a href="#contact" className="text-link">Yana savol bering <ArrowRight size={16} /></a></div><div className="faq-list">{[
            ['Kurslar necha oy davom etadi?', 'Yo‘nalishga qarab kurslar 4 oydan 8 oygacha davom etadi. Har bir kurs amaliy loyiha bilan yakunlanadi.'],
            ['Darslar online yoki offline?', 'Darslar akademiyamizda offline va masofadan online formatda o‘tkaziladi. Sizga qulay formatni tanlang.'],
            ['Boshlang‘ich bilim kerakmi?', 'Yo‘q. Boshlang‘ich kurslarimiz noldan boshlanadi. Muhimi, qiziqish va muntazam mashq qilish.'],
            ['To‘lov qanday amalga oshiriladi?', 'To‘lovni har oy naqd, bank kartasi, Click yoki Payme orqali amalga oshirish mumkin. Bo‘lib to‘lash imkoniyati mavjud.'],
            ['Sertifikat va ishga joylashish yordami bormi?', 'Kurs loyihalarini muvaffaqiyatli yakunlagan o‘quvchilarga sertifikat beriladi. Karyera bo‘limi CV va suhbatlarga tayyorlanishga yordam beradi.'],
            ['Dars jadvali qanday tuziladi?', 'Guruhlar ertalabki, kunduzgi va kechki vaqtlarda ochiladi. Ariza qoldirgach, maslahatchi sizga mos jadvalni taklif qiladi.'],
            ['Kursni bo‘lib to‘lash mumkinmi?', 'Ha, kurs to‘lovi oyma-oy amalga oshiriladi. Ayrim yo‘nalishlar uchun bo‘lib to‘lash rejalari mavjud.'],
            ['Darslarga noutbuk olib kelish kerakmi?', 'Amaliy mashg‘ulotlar uchun shaxsiy noutbuk tavsiya etiladi. Zarurat bo‘lsa, akademiyada kompyuterlar mavjud.'],
          ].map(([question, answer]) => <FaqItem key={question} question={question} answer={answer} />)}</div></section>

        <section id="contact" className="contact-section"><div className="contact-copy"><div className="section-kicker">BIRINCHI QADAMNI QO‘YING</div><h2>Kelajagingiz haqida <span>suhbatlashamiz.</span></h2><p>Qisqa ariza qoldiring. Maslahatchimiz siz bilan bog‘lanib, mos yo‘nalishni topishga yordam beradi.</p><div className="contact-detail"><span><MessageCircle size={17} /></span><div><small>TELEGRAM</small><strong>@abduazizacademy</strong></div></div><div className="contact-detail"><span><Clock3 size={17} /></span><div><small>ISH VAQTI</small><strong>Dush — Shan · 09:00–20:00</strong></div></div><div className="contact-address">Toshkent shahri, Yunusobod tumani<br />Amir Temur ko‘chasi, 108</div></div><ContactForm courses={data.courses} onSubmit={onApply} /></section>
      </main>
      <footer className="footer"><a href="#home" className="brand"><span className="brand-mark"><Code2 size={17} /></span><span>ABDUAZIZ<span className="brand-light"> IT ACADEMY</span></span></a><span>© 2026 ABDUAZIZ IT ACADEMY. Barcha huquqlar himoyalangan.</span><div><a href="#courses">Kurslar</a><a href="#contact">Aloqa</a><span className="footer-languages">UZ · RU · EN</span></div></footer>
    </>
  )
}

function CourseCard({ course, onOpen }: { course: Course; onOpen: () => void }) {
  return <article className="course-card"><button className="course-image" onClick={onOpen} aria-label={`${course.name} kursi haqida`}><img src={`https://images.unsplash.com/${course.image}?auto=format&fit=crop&w=800&q=80`} alt={course.name} /><span className={`course-category ${course.tone}`}>{course.category}</span><span className="course-arrow"><ArrowUpRight size={17} /></span></button><div className="course-body"><div className="course-title-row"><h3>{course.name}</h3><span className="course-rating"><Star size={13} fill="currentColor" /> {course.rating}</span></div><p>{course.description}</p><div className="course-meta"><span><Clock3 size={14} />{course.duration}</span><span><Layers3 size={14} />{course.level}</span><span><Users size={14} />{course.students}</span></div><div className="course-teacher"><img src={avatar(course.teacher)} alt="" /><span>{course.teacher}</span></div><div className="course-footer"><div><small>OYLIK TO‘LOV</small><strong>{money(course.price)}</strong></div><button className="course-details" onClick={onOpen}>Batafsil <ArrowRight size={15} /></button></div></div></article>
}

function ContactForm({ courses, onSubmit }: { courses: Course[]; onSubmit: (input: { name: string; phone: string; email?: string; course: string; message?: string }) => void }) {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    onSubmit({ name: String(form.get('name')), phone: String(form.get('phone')), email: String(form.get('email') || ''), course: String(form.get('course')), message: String(form.get('message') || '') })
    event.currentTarget.reset()
  }
  return <form className="contact-form" onSubmit={handleSubmit}><div className="form-heading"><span>BE PUL KONSULTATSIYA</span><h3>Ariza qoldiring</h3><p>Bir ish kuni ichida siz bilan bog‘lanamiz.</p></div><label>Ismingiz<input name="name" required placeholder="Masalan, Azizbek" /></label><div className="form-two"><label>Telefon raqamingiz<input name="phone" required type="tel" placeholder="+998 90 123 45 67" /></label><label>Email <span className="optional">ixtiyoriy</span><input name="email" type="email" placeholder="siz@email.uz" /></label></div><label>Qiziqayotgan kurs<select name="course" required defaultValue=""><option value="" disabled>Kursni tanlang</option>{courses.map((course) => <option key={course.id}>{course.name}</option>)}</select></label><label>Xabar<textarea name="message" rows={3} placeholder="Qiziqtirgan savolingiz yoki izohingiz" /></label><button className="button button-primary form-submit" type="submit">Arizani yuborish <Send size={16} /></button><small className="form-privacy"><Shield size={13} /> Ma’lumotlaringiz maxfiy saqlanadi.</small></form>
}

function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false)
  return <article className={open ? 'faq-item faq-open' : 'faq-item'}><button onClick={() => setOpen(!open)} aria-expanded={open}><span>{question}</span><span className="faq-plus">{open ? <X size={17} /> : <Plus size={17} />}</span></button>{open && <p>{answer}</p>}</article>
}

function CourseModal({ course, onClose, onEnroll }: { course: Course; onClose: () => void; onEnroll: (course: string) => void }) {
  return <Modal onClose={onClose}><div className="course-modal-image"><img src={`https://images.unsplash.com/${course.image}?auto=format&fit=crop&w=1200&q=85`} alt={course.name} /><span className={`course-category ${course.tone}`}>{course.category}</span></div><div className="course-modal-content"><div className="section-kicker">KURS DASTURI</div><h2>{course.name}</h2><p>{course.description} Kurs davomida mentorlar bilan real loyihalar ustida ishlaysiz va ishga tayyor portfolio yaratasiz.</p><div className="course-modal-stats"><span><Clock3 />{course.duration}</span><span><Layers3 />{course.level}</span><span><Users />{course.students} o‘quvchi</span><span><Star fill="currentColor" />{course.rating} reyting</span></div><div className="curriculum"><strong>O‘quv dasturida</strong><span><Check />Fundamentals va professional workflow</span><span><Check />Amaliy portfolio loyihalari</span><span><Check />Code review va mentor fikri</span><span><Check />Karyera uchun tayyorgarlik</span></div><div className="course-modal-more"><div><strong>Nimalarni o‘rganasiz</strong><p>Amaliy texnologiyalar, jamoaviy workflow va portfolio uchun yakuniy loyiha.</p></div><div><strong>Talablar</strong><p>Boshlang‘ich daraja uchun oldindan tajriba talab qilinmaydi. Noutbuk tavsiya etiladi.</p></div><div><strong>Karyera imkoniyatlari</strong><p>Junior mutaxassis, freelancer yoki o‘z mahsulotingiz ustida ishlash.</p></div><div className="course-mentor"><img src={avatar(course.teacher)} alt="" /><span><small>MENTOR</small><strong>{course.teacher}</strong></span><span className="course-rating"><Star size={12} fill="currentColor" /> {course.rating}</span></div></div><div className="modal-bottom"><div><small>OYLIK TO‘LOV</small><strong>{money(course.price)}</strong></div><button className="button button-primary" onClick={() => onEnroll(course.name)}>Kursga yozilish <ArrowRight size={16} /></button></div></div></Modal>
}

function RoleLoginPage({ role, onClose, onLogin, onRegister }: { role: Role; onClose: () => void; onLogin: (email: string, code: string, role: Role) => Promise<boolean>; onRegister: () => void }) {
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [showCode, setShowCode] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const title = role === 'STUDENT' ? 'O‘quvchi portali' : role === 'ADMIN' ? 'Admin paneli' : 'Direktor paneli'
  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setError('')
    setSubmitting(true)
    try { if (!await onLogin(email, code, role)) setError('Email yoki kod noto‘g‘ri, yoki bu akkauntda kerakli rol yo‘q.') }
    catch { setError('Kirishni tekshirib bo‘lmadi. Qayta urinib ko‘ring.') }
    finally { setSubmitting(false) }
  }
  return <main className="role-login-page"><div className="login-grid" /><a href={appUrl('/')} className="role-login-brand"><span className="brand-mark"><Code2 size={19} /></span><span>ABDUAZIZ <small>IT ACADEMY</small></span></a><section className="role-login-card"><div className={`role-login-icon role-${role.toLowerCase()}`}>{role === 'STUDENT' ? <GraduationCap /> : role === 'ADMIN' ? <Shield /> : <LockKeyhole />}</div><div className="section-kicker">XAVFSIZ KIRISH · {role}</div><h1>{title}</h1><p className="role-login-description">{role === 'STUDENT' ? 'Kurslaringiz, dars jadvali va o‘quv natijalaringizga kiring.' : `${roleNames[role]} hisobiga tegishli alohida kirish.`}</p><form className="login-form" onSubmit={submit}><label>Email manzilingiz<div className="input-icon"><Mail size={16} /><input type="email" autoComplete="username" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="name@academy.uz" /></div></label><label>Kirish kodi<div className="input-icon"><LockKeyhole size={16} /><input type={showCode ? 'text' : 'password'} autoComplete="current-password" required value={code} onChange={(event) => setCode(event.target.value)} placeholder="Kirish kodini kiriting" /><button type="button" className="reveal-code" aria-label={showCode ? 'Kodni yashirish' : 'Kodni ko‘rsatish'} onClick={() => setShowCode(!showCode)}>{showCode ? <EyeOff size={16} /> : <Eye size={16} />}</button></div></label>{error && <p className="form-error">{error}</p>}<button className="button button-primary login-submit" type="submit" disabled={submitting}>{submitting ? 'Tekshirilmoqda...' : 'Xavfsiz kirish'} <ArrowRight size={16} /></button></form><div className="login-security"><Shield size={14} /> Bu kirish faqat {roleNames[role].toLowerCase()} roli uchun</div>{role === 'STUDENT' && <button className="role-register-link" onClick={onRegister}>Yangi o‘quvchi akkaunti yaratish <ArrowRight size={14} /></button>}</section><button className="role-login-back" onClick={onClose}><ChevronLeft size={15} /> Bosh sahifaga qaytish</button></main>
}

function RegisterModal({ courses, onClose, onRegister }: { courses: Course[]; onClose: () => void; onRegister: (input: { name: string; email: string; phone: string; dateOfBirth: string; course: string; password: string }) => Promise<void> }) {
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const name = String(form.get('name')).trim()
    const email = String(form.get('email')).trim()
    const phone = String(form.get('phone')).trim()
    const dateOfBirth = String(form.get('dateOfBirth'))
    const course = String(form.get('course'))
    const password = String(form.get('password'))
    if (password !== String(form.get('confirm'))) { setError('Parollar bir-biriga mos kelmadi.'); return }
    if (password.length < 8) { setError('Parol kamida 8 ta belgidan iborat bo‘lishi kerak.'); return }
    setSubmitting(true)
    try { await onRegister({ name, email, phone, dateOfBirth, course, password }) }
    catch { setError('Akkaunt yaratishda xatolik yuz berdi.') }
    finally { setSubmitting(false) }
  }
  return <Modal onClose={onClose} narrow><div className="login-brand"><span className="brand-mark"><GraduationCap size={19} /></span><span>ABDUAZIZ <small>STUDENT REGISTRATION</small></span></div><div className="login-heading"><div className="section-kicker">YANGI IMKONIYAT</div><h2>Akademiyaga<br />qo‘shiling.</h2><p>Ma’lumotlaringizni kiriting, biz sizga yordam beramiz.</p></div><form className="login-form" onSubmit={submit}><label>To‘liq ism<input name="name" required placeholder="Ism Familiya" /></label><label>Telefon raqami<input name="phone" required type="tel" placeholder="+998 90 123 45 67" /></label><label>Email<input name="email" required type="email" placeholder="siz@email.uz" /></label><label>Tug‘ilgan sana<input name="dateOfBirth" type="date" required /></label><label>Qiziqayotgan kurs<select id="register-course" name="course" required defaultValue=""><option value="" disabled>Kursni tanlang</option>{courses.map((course) => <option key={course.id}>{course.name}</option>)}</select></label><div className="form-two"><label>Parol<input name="password" type="password" required minLength={8} /></label><label>Parolni tasdiqlang<input name="confirm" type="password" required minLength={8} /></label></div>{error && <p className="form-error">{error}</p>}<button className="button button-primary login-submit" type="submit" disabled={submitting}>{submitting ? 'Akkaunt yaratilmoqda...' : 'Akkaunt yaratish'} <ArrowRight size={16} /></button></form></Modal>
}

function Modal({ children, onClose, narrow = false }: { children: ReactNode; onClose: () => void; narrow?: boolean }) {
  useEffect(() => { const onEscape = (event: KeyboardEvent) => event.key === 'Escape' && onClose(); window.addEventListener('keydown', onEscape); document.body.style.overflow = 'hidden'; return () => { window.removeEventListener('keydown', onEscape); document.body.style.overflow = '' } }, [onClose])
  return <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}><div className={narrow ? 'modal modal-narrow' : 'modal'}><button className="modal-close icon-btn" aria-label="Yopish" onClick={onClose}><X size={18} /></button>{children}</div></div>
}

const studentNav = [
  { id: 'overview', label: 'Dashboard', icon: <LayoutDashboard /> }, { id: 'courses', label: 'Mening kurslarim', icon: <BookOpen /> }, { id: 'schedule', label: 'Dars jadvali', icon: <CalendarDays /> }, { id: 'attendance', label: 'Davomat', icon: <CheckCircle2 /> }, { id: 'grades', label: 'Baholar', icon: <Award /> }, { id: 'assignments', label: 'Topshiriqlar', icon: <FileBarChart2 /> }, { id: 'payments', label: 'To‘lovlar', icon: <CreditCard /> }, { id: 'certificates', label: 'Sertifikatlar', icon: <GraduationCap /> }, { id: 'messages', label: 'Xabarlar', icon: <MessageCircle /> }, { id: 'profile', label: 'Profil', icon: <Users /> },
]
const adminNav = [
  { id: 'overview', label: 'Dashboard', icon: <LayoutDashboard /> }, { id: 'students', label: 'O‘quvchilar', icon: <Users /> }, { id: 'courses', label: 'Kurslar', icon: <BookOpen /> }, { id: 'groups', label: 'Guruhlar', icon: <Layers3 /> }, { id: 'teachers', label: 'Ustozlar', icon: <GraduationCap /> }, { id: 'attendance', label: 'Davomat', icon: <CheckCircle2 /> }, { id: 'grades', label: 'Baholar', icon: <Award /> }, { id: 'payments', label: 'To‘lovlar', icon: <CreditCard /> }, { id: 'applications', label: 'Arizalar', icon: <FileBarChart2 /> }, { id: 'notifications', label: 'Bildirishnomalar', icon: <Bell /> }, { id: 'reports', label: 'Hisobotlar', icon: <Activity /> }, { id: 'security', label: 'Xavfsizlik', icon: <Shield /> },
]
const directorNav = [
  { id: 'overview', label: 'Umumiy ko‘rinish', icon: <LayoutDashboard /> }, { id: 'students', label: 'O‘quvchilar', icon: <Users /> }, { id: 'admins', label: 'Administratorlar', icon: <Shield /> }, { id: 'teachers', label: 'Ustozlar', icon: <GraduationCap /> }, { id: 'courses', label: 'Kurslar', icon: <BookOpen /> }, { id: 'groups', label: 'Guruhlar', icon: <Layers3 /> }, { id: 'payments', label: 'To‘lovlar', icon: <CreditCard /> }, { id: 'attendance', label: 'Davomat', icon: <CheckCircle2 /> }, { id: 'analytics', label: 'Analitika', icon: <Activity /> }, { id: 'reports', label: 'Hisobotlar', icon: <FileBarChart2 /> }, { id: 'applications', label: 'Arizalar', icon: <BriefcaseBusiness /> }, { id: 'logs', label: 'Tizim jurnali', icon: <Monitor /> }, { id: 'security', label: 'Xavfsizlik', icon: <LockKeyhole /> },
]

function Dashboard({ data, setData, user, setUser, onLogout, notify, onTheme, light }: { data: AcademyData; setData: (data: AcademyData) => void; user: User; setUser: (user: User) => void; onLogout: () => void; notify: (message: string) => void; onTheme: () => void; light: boolean }) {
  const [active, setActive] = useState('overview')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [period, setPeriod] = useState('Bu oy')
  const isStudent = user.role === 'STUDENT'
  const isDirector = user.role === 'DIRECTOR'
  const nav = isStudent ? studentNav : isDirector ? directorNav : adminNav
  const activeLabel = nav.find((item) => item.id === active)?.label || 'Dashboard'
  const students = data.users.filter((item) => item.role === 'STUDENT')
  const filteredStudents = students.filter((item) => `${item.name} ${item.email} ${item.course}`.toLowerCase().includes(query.toLowerCase()))
  const attendanceRate = Math.round((data.attendance.filter((item) => item.status !== 'Kelmagan').length / Math.max(data.attendance.length, 1)) * 100)
  const gradeAverage = Math.round(data.grades.reduce((sum, grade) => sum + grade.score, 0) / Math.max(data.grades.length, 1))

  const addStudent = () => {
    const name = window.prompt('O‘quvchining to‘liq ismi')
    if (!name?.trim()) return
    const email = window.prompt('Email manzili') || `${name.toLowerCase().replaceAll(' ', '.')}@academy.uz`
    const course = data.courses[0]?.name || 'Frontend Development'
    const newUser: User = { id: crypto.randomUUID(), name, email, role: 'STUDENT', course, group: 'Yangi guruh', status: 'Active' }
    setData({ ...data, users: [...data.users, newUser] })
    notify('Yangi o‘quvchi qo‘shildi.')
  }
  const removeStudent = (student: User) => {
    if (!window.confirm(`${student.name} profilini o‘chirasizmi?`)) return
    setData({ ...data, users: data.users.filter((item) => item.id !== student.id) })
    notify('O‘quvchi profili o‘chirildi.')
  }
  const editStudent = (student: User) => {
    const name = window.prompt('O‘quvchining ismi', student.name)
    if (!name?.trim()) return
    const email = window.prompt('Email manzili', student.email)
    if (!email?.trim()) return
    setData({ ...data, users: data.users.map((item) => item.id === student.id ? { ...item, name, email } : item) })
    notify('O‘quvchi ma’lumotlari yangilandi.')
  }
  const changeStudentStatus = (student: User, status: StudentStatus) => {
    setData({ ...data, users: data.users.map((item) => item.id === student.id ? { ...item, status } : item) })
    notify('O‘quvchi holati yangilandi.')
  }
  const addCourse = () => {
    const name = window.prompt('Kurs nomi')
    if (!name?.trim()) return
    const newCourse: Course = { id: crypto.randomUUID(), name, category: 'YANGI KURS', description: 'Yangi akademiya kursi.', duration: '6 oy', level: 'Boshlang‘ich', price: 800000, teacher: 'Mentor tayinlanmagan', students: 0, rating: 5, image: 'photo-1516321318423-f06f85e504b3', tone: 'blue' }
    setData({ ...data, courses: [...data.courses, newCourse] })
    notify('Kurs yaratildi.')
  }
  const updateApplication = (application: Application, status: Application['status']) => {
    setData({ ...data, applications: data.applications.map((item) => item.id === application.id ? { ...item, status } : item) })
    notify('Ariza holati yangilandi.')
  }
  const markAttendance = (status: 'Kelgan' | 'Kelmagan' | 'Kechikkan') => {
    setData({ ...data, attendance: [{ date: new Date().toISOString().slice(0, 10), status, subject: 'Frontend amaliyoti' }, ...data.attendance] })
    notify(`Davomat belgilandi: ${status}`)
  }

  return <div className={`dashboard-shell ${isDirector ? 'director-shell' : ''}`}><button className="dashboard-theme-toggle icon-btn" onClick={onTheme} aria-label={light ? 'Dark rejimga o‘tish' : 'Light rejimga o‘tish'}><Sun size={16} /></button>
    <aside className={sidebarOpen ? 'sidebar sidebar-open' : 'sidebar'}><a className="dashboard-brand" href="#home"><span className="brand-mark"><Code2 size={18} /></span><span>ABDUAZIZ<small>ACADEMY PORTAL</small></span></a><div className="sidebar-workspace"><span className="workspace-mark"><GraduationCap size={16} /></span><span><strong>IT Academy</strong><small>{roleNames[user.role]} paneli</small></span><ChevronDown size={15} /></div><div className="sidebar-section-label">ISH MAYDONI</div><nav className="dashboard-nav">{nav.map((item) => <button key={item.id} className={active === item.id ? 'dashboard-nav-item active' : 'dashboard-nav-item'} onClick={() => { setActive(item.id); setSidebarOpen(false) }}>{item.icon}<span>{item.label}</span>{item.id === 'applications' && data.applications.filter((application) => application.status === 'New').length > 0 && <i>{data.applications.filter((application) => application.status === 'New').length}</i>}</button>)}</nav><div className="sidebar-bottom"><div className="sidebar-help"><div><Sparkles size={17} /></div><strong>Yordam kerakmi?</strong><p>Akademiya jamoasi doim yordamga tayyor.</p><button onClick={() => notify('Maslahatchi bilan bog‘lanish so‘rovi yuborildi.')}>Yordam markazi <ArrowRight size={14} /></button></div><button className="dashboard-nav-item sidebar-logout" onClick={onLogout}><LogOut /><span>Tizimdan chiqish</span></button><div className="sidebar-profile"><img src={avatar(user.name)} alt="" /><span><strong>{user.name}</strong><small>{roleNames[user.role]}</small></span><MoreHorizontal size={18} /></div></div></aside>
    {sidebarOpen && <button className="sidebar-scrim" aria-label="Menyuni yopish" onClick={() => setSidebarOpen(false)} />}
    <div className="dashboard-main"><header className="dashboard-topbar"><button className="icon-btn dash-menu" aria-label="Menyuni ochish" onClick={() => setSidebarOpen(true)}><Menu /></button><div className="breadcrumb"><span>Academy</span><ChevronRight size={14} /><strong>{activeLabel}</strong></div><div className="topbar-actions"><div className="search-box"><Search size={16} /><input placeholder="Qidirish..." value={query} onChange={(event) => setQuery(event.target.value)} /><kbd>⌘ K</kbd></div><button className="icon-btn notification-button" aria-label="Bildirishnomalar" onClick={() => setActive(isStudent ? 'messages' : 'notifications')}><Bell size={18} />{data.notifications.length > 0 && <i />}</button><span className="topbar-separator" /><button className="topbar-user" onClick={() => setActive('profile')}><img src={avatar(user.name)} alt="" /><span><strong>{user.name.split(' ')[0]}</strong><small>{roleNames[user.role]}</small></span><ChevronDown size={15} /></button></div></header>
      <main className="dashboard-content"><div className="dashboard-welcome"><div><div className="section-kicker">{isStudent ? 'O‘QUVCHI PORTALI' : isDirector ? 'DIREKTOR BOSHQARUVI' : 'AKADEMIYA BOSHQARUVI'}</div><h1>{active === 'overview' ? `Xush kelibsiz, ${user.name.split(' ')[0]}` : activeLabel}<span className="welcome-period">{active === 'overview' ? '.' : ''}</span></h1><p>{isStudent ? 'Bugungi o‘quv rejangiz va natijalaringiz shu yerda.' : 'Akademiyadagi muhim ko‘rsatkichlar va kundalik ishlar.'}</p></div><div className="welcome-right"><span className="date-pill"><CalendarDays size={15} /> {new Intl.DateTimeFormat('uz-UZ', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date())}</span>{!isStudent && ['overview', 'students', 'courses'].includes(active) && <button className="button button-primary button-small" onClick={active === 'courses' ? addCourse : addStudent}><Plus size={16} />{active === 'courses' ? 'Kurs qo‘shish' : 'O‘quvchi qo‘shish'}</button>}</div></div>
        {active === 'overview' && <Overview data={data} isStudent={isStudent} students={students} attendanceRate={attendanceRate} gradeAverage={gradeAverage} period={period} setPeriod={setPeriod} setActive={setActive} />}
        {active === 'students' && <StudentsPage students={filteredStudents} query={query} onAdd={addStudent} onEdit={editStudent} onStatus={changeStudentStatus} onDelete={removeStudent} />}
        {active === 'admins' && <AdminsPage data={data} setData={setData} notify={notify} />}
        {active === 'courses' && <CoursesPage courses={data.courses} onAdd={addCourse} onDelete={(id) => { setData({ ...data, courses: data.courses.filter((course) => course.id !== id) }); notify('Kurs o‘chirildi.') }} />}
        {active === 'groups' && <GroupsPage students={students} />}
        {active === 'teachers' && <TeachersPage courses={data.courses} />}
        {active === 'attendance' && <AttendancePage data={data} isStudent={isStudent} rate={attendanceRate} onMark={markAttendance} />}
        {active === 'grades' && <GradesPage data={data} average={gradeAverage} isStudent={isStudent} onAdd={(grade) => { setData({ ...data, grades: [{ ...grade, date: new Date().toISOString().slice(0, 10) }, ...data.grades] }); notify('Yangi baho saqlandi.') }} />}
        {active === 'assignments' && <AssignmentsPage notify={notify} />}
        {active === 'payments' && <PaymentsPage data={data} isStudent={isStudent} onPay={() => {
          const amount = isStudent ? 890000 : Number(window.prompt('To‘lov miqdori (so‘m)', '890000'))
          if (!amount || amount < 1) return
          const payment = { date: new Date().toISOString().slice(0, 10), amount, method: 'Payme · demo', status: 'To‘langan' }
          setData({ ...data, payments: [payment, ...data.payments], notifications: [`Demo to‘lov qayd etildi: ${money(amount)}`, ...data.notifications] })
          notify('Demo to‘lov tarixga qo‘shildi.')
        }} />}
        {active === 'applications' && <ApplicationsPage data={data} onStatus={updateApplication} />}
        {active === 'notifications' && <NotificationsPage data={data} />}
        {active === 'messages' && <MessagesPage user={user} notify={notify} />}
        {active === 'certificates' && <CertificatesPage user={user} />}
        {active === 'profile' && <ProfilePage user={user} />}
        {active === 'reports' && <ReportsPage data={data} />}
        {active === 'analytics' && <AnalyticsPage data={data} period={period} setPeriod={setPeriod} />}
        {active === 'logs' && <LogsPage data={data} />}
        {active === 'security' && <SecurityPage data={data} setData={setData} user={user} setUser={setUser} notify={notify} />}
        {active === 'settings' && <SettingsPage notify={notify} />}
        {active === 'schedule' && <SchedulePage />}
      </main><footer className="dashboard-footer"><span>© 2026 ABDUAZIZ IT ACADEMY</span><span><Shield size={13} /> Xavfsiz ta’lim muhiti</span></footer></div>
  </div>
}

function Overview({ data, isStudent, students, attendanceRate, gradeAverage, period, setPeriod, setActive }: { data: AcademyData; isStudent: boolean; students: User[]; attendanceRate: number; gradeAverage: number; period: string; setPeriod: (period: string) => void; setActive: (id: string) => void }) {
  const metrics = isStudent ? [
    { label: 'Mening kursim', value: 'Frontend', note: 'Frontend Development', icon: <BookOpen />, color: 'blue', trend: '75% yakunlandi' },
    { label: 'Davomat', value: `${attendanceRate}%`, note: 'A’lo ko‘rsatkich', icon: <CheckCircle2 />, color: 'green', trend: '+2.4%' },
    { label: 'O‘rtacha baho', value: `${gradeAverage}/100`, note: 'Oxirgi 3 ta topshiriq', icon: <Award />, color: 'violet', trend: '+4.2%' },
    { label: 'To‘lov holati', value: 'Faol', note: 'Keyingi to‘lov: 1 noyabr', icon: <CreditCard />, color: 'orange', trend: 'To‘langan' },
  ] : [
    { label: 'Jami o‘quvchilar', value: students.length.toLocaleString('uz-UZ'), note: `${students.filter((s) => s.status === 'Active').length} faol o‘quvchi`, icon: <Users />, color: 'blue', trend: '+12.8%' },
    { label: 'Faol kurslar', value: data.courses.length.toString(), note: 'Turli yo‘nalishlar', icon: <BookOpen />, color: 'violet', trend: '+2 yangi' },
    { label: 'Oylik tushum', value: '48.6 mln', note: 'Joriy oy natijasi', icon: <CreditCard />, color: 'green', trend: '+18.2%' },
    { label: 'Davomat', value: `${attendanceRate}%`, note: 'O‘rtacha ko‘rsatkich', icon: <Activity />, color: 'orange', trend: '+3.1%' },
  ]
  const trendData = [{ month: 'May', students: 320, revenue: 29 }, { month: 'Iyun', students: 390, revenue: 35 }, { month: 'Iyul', students: 425, revenue: 39 }, { month: 'Avg', students: 470, revenue: 43 }, { month: 'Sen', students: 510, revenue: 45 }, { month: 'Okt', students: 584, revenue: 49 }]
  return <>
    <div className="metric-grid">{metrics.map((metric) => <article className="metric-card" key={metric.label}><div className="metric-top"><span>{metric.label}</span><span className={`metric-icon ${metric.color}`}>{metric.icon}</span></div><strong className="metric-value">{metric.value}</strong><div className="metric-foot"><span>{metric.note}</span><span className="metric-trend"><ArrowUpRight size={13} />{metric.trend}</span></div></article>)}</div>
    {isStudent ? <div className="student-home-grid"><section className="dashboard-panel student-course-panel"><PanelHeader title="Mening kursim" action="Darsni ochish" onAction={() => setActive('courses')} /><div className="student-course-feature"><img src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=500&q=80" alt="Frontend Development" /><div><span className="course-category blue">WEB DEVELOPMENT</span><h3>Frontend Development</h3><p>Keyingi dars: React state va props · Bugun, 18:00</p><div className="progress-meta"><span>Kurs progressi</span><strong>75%</strong></div><div className="progress-track"><i style={{ width: '75%' }} /></div></div></div></section><section className="dashboard-panel"><PanelHeader title="Keyingi dars" action="Jadval" onAction={() => setActive('schedule')} /><div className="next-lesson"><div className="lesson-date"><strong>03</strong><span>OKT</span></div><div><strong>React: State va props</strong><span><Clock3 size={13} /> 18:00 – 20:00 · 2-xona</span><span><Users size={13} /> Azizbek Karimov</span></div><button className="icon-btn"><ArrowRight size={16} /></button></div><div className="lesson-note"><span className="live-dot" /> Dars boshlanishiga 2 soat 14 daqiqa</div></section><section className="dashboard-panel"><PanelHeader title="So‘nggi baholar" action="Barchasi" onAction={() => setActive('grades')} /><GradeRows grades={data.grades.slice(0, 3)} /></section><section className="dashboard-panel"><PanelHeader title="Davomat" action="Ko‘rish" onAction={() => setActive('attendance')} /><div className="attendance-summary"><div className="attendance-gauge"><strong>{attendanceRate}%</strong><small>davomat</small></div><div><span><i className="legend-dot green-dot" /> Kelgan <strong>{data.attendance.filter((a) => a.status === 'Kelgan').length}</strong></span><span><i className="legend-dot orange-dot" /> Kechikkan <strong>{data.attendance.filter((a) => a.status === 'Kechikkan').length}</strong></span><span><i className="legend-dot red-dot" /> Kelmagan <strong>{data.attendance.filter((a) => a.status === 'Kelmagan').length}</strong></span></div></div></section></div> : <div className="analytics-row"><section className="dashboard-panel chart-panel"><PanelHeader title={isStudent ? 'O‘quv progressi' : 'O‘quvchilar dinamikasi'} subtitle="O‘sish ko‘rsatkichlari" action={<select value={period} onChange={(event) => setPeriod(event.target.value)}><option>Bu oy</option><option>Bu hafta</option><option>Bu yil</option></select>} /><div className="chart-statline"><strong>584</strong><span className="chart-positive"><ArrowUpRight size={14} /> 12.8%</span><small>o‘tgan oyga nisbatan</small></div><div className="chart-box"><ResponsiveContainer width="100%" height="100%"><AreaChart data={trendData} margin={{ top: 8, right: 8, left: -26, bottom: 0 }}><defs><linearGradient id="studentFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#5b8cff" stopOpacity={0.3} /><stop offset="95%" stopColor="#5b8cff" stopOpacity={0} /></linearGradient></defs><CartesianGrid strokeDasharray="3 5" stroke="var(--chart-grid)" vertical={false} /><XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fill: 'var(--muted)', fontSize: 11 }} /><YAxis tickLine={false} axisLine={false} tick={{ fill: 'var(--muted)', fontSize: 11 }} /><Tooltip contentStyle={{ background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 8, color: 'var(--text)' }} /><Area type="monotone" dataKey="students" stroke="#5b8cff" strokeWidth={2.5} fill="url(#studentFill)" /></AreaChart></ResponsiveContainer></div></section><section className="dashboard-panel popular-panel"><PanelHeader title="Ommabop kurslar" subtitle="Faol o‘quvchilar bo‘yicha" action={<button className="icon-btn"><MoreHorizontal size={17} /></button>} /><div className="popular-chart"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={data.courses.slice(0, 4).map((course) => ({ name: course.name, value: course.students }))} innerRadius={58} outerRadius={77} paddingAngle={5} dataKey="value" stroke="none">{['#5b8cff', '#9b7cf5', '#32c98a', '#e5a45d'].map((color) => <Cell key={color} fill={color} />)}</Pie><Tooltip contentStyle={{ background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 8, color: 'var(--text)' }} /></PieChart></ResponsiveContainer><div className="donut-center"><strong>584</strong><span>o‘quvchi</span></div></div><div className="popular-legend">{data.courses.slice(0, 4).map((course, index) => <div key={course.id}><span><i style={{ background: ['#5b8cff', '#9b7cf5', '#32c98a', '#e5a45d'][index] }} />{course.name}</span><strong>{course.students}</strong></div>)}</div></section></div>}
    <section className="dashboard-panel recent-panel"><PanelHeader title={isStudent ? 'Topshiriqlar' : 'So‘nggi arizalar'} subtitle={isStudent ? 'Yaqin muddatli vazifalar' : `${data.applications.length} ta ariza`} action={isStudent ? 'Barchasi' : 'Barcha arizalar'} onAction={() => setActive(isStudent ? 'assignments' : 'applications')} />{isStudent ? <div className="assignment-row"><span className="assignment-status pending">TOPSHIRILMAGAN</span><strong>Responsive portfolio sahifa</strong><span><CalendarDays size={14} /> Muddat: 7 oktabr</span><button className="button button-small button-outline" onClick={() => setActive('assignments')}>Topshirish <ArrowRight size={14} /></button></div> : <ApplicationsTable applications={data.applications.slice(0, 4)} compact />}</section>
  </>
}

function PanelHeader({ title, subtitle, action, onAction }: { title: string; subtitle?: string; action?: ReactNode; onAction?: () => void }) {
  return <div className="panel-header"><div><h3>{title}</h3>{subtitle && <p>{subtitle}</p>}</div>{typeof action === 'string' ? <button className="panel-action" onClick={onAction}>{action} <ArrowRight size={14} /></button> : action}</div>
}

function StudentsTable({ students, query, onAdd, onDelete }: { students: User[]; query: string; onAdd: () => void; onDelete: (student: User) => void }) {
  const [status, setStatus] = useState('Barcha holatlar')
  const visible = students.filter((student) => status === 'Barcha holatlar' || student.status === status)
  return <section className="dashboard-panel data-panel"><div className="table-toolbar"><div><span className="table-count">{visible.length} o‘quvchi</span><span className="table-search-hint">{query ? `“${query}” bo‘yicha natijalar` : 'Akademiya o‘quvchilari ro‘yxati'}</span></div><div><label className="select-filter"><Filter size={14} /><select value={status} onChange={(event) => setStatus(event.target.value)}><option>Barcha holatlar</option><option>Active</option><option>Inactive</option><option>Graduated</option><option>Frozen</option></select></label><button className="button button-primary button-small" onClick={onAdd}><Plus size={15} /> O‘quvchi qo‘shish</button></div></div><div className="table-scroll"><table><thead><tr><th>O‘QUVCHI</th><th>KURS / GURUH</th><th>HOLAT</th><th>DAVOMAT</th><th>BAHO</th><th /></tr></thead><tbody>{visible.map((student, index) => <tr key={student.id}><td><div className="table-person"><img src={avatar(student.name)} alt="" /><span><strong>{student.name}</strong><small>{student.email}</small></span></div></td><td><strong className="table-main">{student.course}</strong><small className="table-secondary">{student.group}</small></td><td><span className={`status-pill ${student.status === 'Active' ? 'status-active' : student.status === 'Graduated' ? 'status-done' : 'status-muted'}`}><i />{student.status}</span></td><td><span className="attendance-cell">{[92, 87, 100, 96, 89][index % 5]}%</span></td><td><span className="score-cell">{[94, 88, 91, 86, 97][index % 5]}</span></td><td><button className="icon-btn row-menu" onClick={() => onDelete(student)} aria-label="O‘quvchini o‘chirish"><MoreHorizontal size={18} /></button></td></tr>)}</tbody></table>{visible.length === 0 && <EmptyState title="O‘quvchi topilmadi" description="Qidiruv yoki filtrlarni o‘zgartirib ko‘ring." />}</div><div className="table-bottom"><span>Jami {visible.length} ta yozuv</span><div><button className="icon-btn" aria-label="Oldingi sahifa"><ChevronLeft size={16} /></button><span className="page-current">1</span><button className="icon-btn" aria-label="Keyingi sahifa"><ChevronRight size={16} /></button></div></div></section>
}

function StudentsPage({ students, query, onAdd, onEdit, onStatus, onDelete }: { students: User[]; query: string; onAdd: () => void; onEdit: (student: User) => void; onStatus: (student: User, status: StudentStatus) => void; onDelete: (student: User) => void }) {
  const [selectedId, setSelectedId] = useState('')
  const selected = students.find((student) => student.id === selectedId)
  return <><section className="dashboard-panel student-actions-bar"><label>Profilni tanlang<select value={selectedId} onChange={(event) => setSelectedId(event.target.value)}><option value="">O‘quvchi tanlanmagan</option>{students.map((student) => <option key={student.id} value={student.id}>{student.name}</option>)}</select></label>{selected && <><button className="button button-outline button-small" onClick={() => onEdit(selected)}>Profilni tahrirlash</button><label>Holat<select value={selected.status || 'Active'} onChange={(event) => onStatus(selected, event.target.value as StudentStatus)}><option value="Active">Active</option><option value="Inactive">Inactive</option><option value="Graduated">Graduated</option><option value="Frozen">Frozen</option></select></label></>}</section><StudentsTable students={students} query={query} onAdd={onAdd} onDelete={onDelete} /></>
}

function CoursesPage({ courses, onAdd, onDelete }: { courses: Course[]; onAdd: () => void; onDelete: (id: string) => void }) {
  return <><div className="admin-course-grid">{courses.map((course) => <article key={course.id} className="admin-course-card"><div className="admin-course-image"><img src={`https://images.unsplash.com/${course.image}?auto=format&fit=crop&w=600&q=75`} alt={course.name} /><span className="course-category blue">{course.category}</span><button className="icon-btn" aria-label="Kursni o‘chirish" onClick={() => onDelete(course.id)}><MoreHorizontal size={18} /></button></div><div className="admin-course-info"><h3>{course.name}</h3><p>{course.description}</p><div className="admin-course-meta"><span><Clock3 size={14} />{course.duration}</span><span><Users size={14} />{course.students} o‘quvchi</span></div><div className="admin-course-bottom"><strong>{money(course.price)} <small>/ oy</small></strong><span className="status-pill status-active"><i />Faol</span></div></div></article>)}</div><button className="button button-outline" onClick={onAdd}><Plus size={16} /> Yangi kurs yaratish</button></>
}

function GroupsPage({ students }: { students: User[] }) {
  const groups = ['Frontend-01', 'Backend-01', 'Python-01', 'Design-02']
  return <div className="group-grid">{groups.map((group, index) => <article className="dashboard-panel group-card" key={group}><div className="group-card-top"><span className="group-icon"><Users size={18} /></span><button className="icon-btn"><MoreHorizontal size={18} /></button></div><span className="section-kicker">{['WEB DEVELOPMENT', 'ENGINEERING', 'DATA & AI', 'PRODUCT DESIGN'][index]}</span><h3>{group}</h3><p>{['Frontend Development', 'Backend Development', 'Python & Data Science', 'UI/UX Design'][index]}</p><div className="group-meta"><span><Users size={14} />{Math.max(8, students.length * 3 + index * 4)} o‘quvchi</span><span><CalendarDays size={14} />Du · Chor · Jum</span></div><div className="group-teacher"><img src={avatar(['Azizbek Karimov', 'Sardor Akbarov', 'Madina Islomova', 'Diyora Xasanova'][index])} alt="" /><span>{['Azizbek Karimov', 'Sardor Akbarov', 'Madina Islomova', 'Diyora Xasanova'][index]}</span><i>18:00 – 20:00</i></div></article>)}</div>
}

function TeachersPage({ courses }: { courses: Course[] }) {
  const names = ['Azizbek Karimov', 'Madina Islomova', 'Sardor Akbarov', 'Diyora Xasanova']
  return <div className="teacher-admin-grid">{names.map((name, index) => <article className="dashboard-panel teacher-admin-card" key={name}><img src={avatar(name)} alt="" /><span className="status-pill status-active"><i />Faol</span><h3>{name}</h3><p>{['Frontend mentor', 'Data Science mentor', 'Backend mentor', 'Product Design mentor'][index]}</p><div className="teacher-admin-stats"><span><BookOpen size={14} />{courses.filter((course) => course.teacher === name).length || 1} kurs</span><span><Users size={14} />{[128, 96, 84, 72][index]} o‘quvchi</span></div><button className="button button-outline button-small">Profilni ko‘rish <ArrowRight size={14} /></button></article>)}</div>
}

function AttendancePage({ data, isStudent, rate, onMark }: { data: AcademyData; isStudent: boolean; rate: number; onMark: (status: 'Kelgan' | 'Kelmagan' | 'Kechikkan') => void }) {
  const [month, setMonth] = useState(new Date())
  const firstDay = new Date(month.getFullYear(), month.getMonth(), 1).getDay()
  const days = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate()
  return <><div className="metric-grid mini-metrics">{[{ label: 'Davomat foizi', value: `${rate}%`, icon: <Activity /> }, { label: 'Kelgan darslar', value: String(data.attendance.filter((item) => item.status === 'Kelgan').length), icon: <CheckCircle2 /> }, { label: 'Qoldirilgan', value: String(data.attendance.filter((item) => item.status === 'Kelmagan').length), icon: <X /> }, { label: 'Kechikkan', value: String(data.attendance.filter((item) => item.status === 'Kechikkan').length), icon: <Clock3 /> }].map((item) => <article className="metric-card mini-metric" key={item.label}><span className="metric-icon blue">{item.icon}</span><small>{item.label}</small><strong>{item.value}</strong></article>)}</div><div className="attendance-layout"><section className="dashboard-panel calendar-panel"><PanelHeader title="Davomat kalendari" action={<div className="calendar-controls"><button className="icon-btn" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}><ChevronLeft size={16} /></button><strong>{new Intl.DateTimeFormat('uz-UZ', { month: 'long', year: 'numeric' }).format(month)}</strong><button className="icon-btn" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}><ChevronRight size={16} /></button></div>} /><div className="calendar-grid">{['Du', 'Se', 'Ch', 'Pa', 'Ju', 'Sh', 'Ya'].map((day) => <span className="calendar-day-name" key={day}>{day}</span>)}{Array.from({ length: (firstDay + 6) % 7 }, (_, index) => <span key={`empty${index}`} />)}{Array.from({ length: days }, (_, index) => { const date = String(index + 1).padStart(2, '0'); const mark = data.attendance.find((item) => item.date.endsWith(`-${date}`)); return <span key={date} className={`calendar-date ${mark?.status === 'Kelgan' ? 'calendar-present' : mark?.status === 'Kelmagan' ? 'calendar-absent' : mark?.status === 'Kechikkan' ? 'calendar-late' : ''}`}>{index + 1}{mark && <i />}</span> })}</div><div className="calendar-legend"><span><i className="green-dot" /> Kelgan</span><span><i className="red-dot" /> Kelmagan</span><span><i className="orange-dot" /> Kechikkan</span></div></section><section className="dashboard-panel attendance-list-panel"><PanelHeader title="Oxirgi darslar" subtitle="Davomat tarixi" /><div className="attendance-list">{data.attendance.map((entry) => <div key={`${entry.date}-${entry.subject}`}><span className={`attendance-mark ${entry.status === 'Kelgan' ? 'present' : entry.status === 'Kelmagan' ? 'absent' : 'late'}`}>{entry.status === 'Kelgan' ? <Check size={14} /> : entry.status === 'Kelmagan' ? <X size={14} /> : <Clock3 size={14} />}</span><span><strong>{entry.subject}</strong><small>{entry.date}</small></span><span className={`status-pill ${entry.status === 'Kelgan' ? 'status-active' : entry.status === 'Kechikkan' ? 'status-pending' : 'status-danger'}`}>{entry.status}</span></div>)}</div>{!isStudent && <div className="attendance-mark-actions"><button onClick={() => onMark('Kelgan')}>Kelgan</button><button onClick={() => onMark('Kechikkan')}>Kechikkan</button><button onClick={() => onMark('Kelmagan')}>Kelmagan</button></div>}</section></div></>
}

function GradesPage({ data, average, isStudent, onAdd }: { data: AcademyData; average: number; isStudent: boolean; onAdd: (grade: Omit<AcademyData['grades'][number], 'date'>) => void }) {
  const addGrade = () => {
    const assignment = window.prompt('Topshiriq nomi')
    const subject = window.prompt('Fan yoki kurs nomi')
    const score = Number(window.prompt('Baho (0–100)', '90'))
    if (!assignment?.trim() || !subject?.trim() || !Number.isInteger(score) || score < 0 || score > 100) return
    onAdd({ assignment, subject, score, comment: window.prompt('Ustoz izohi') || '' })
  }
  return <><div className="grade-summary"><div><div className="section-kicker">UMUMIY NATIJA</div><strong>{average}<small>/100</small></strong><span><ArrowUpRight size={14} /> O‘tgan oyga nisbatan 4.2% yuqori</span></div><div className="grade-chart"><ResponsiveContainer width="100%" height="100%"><BarChart data={data.grades.map((grade) => ({ name: grade.subject, score: grade.score }))}><CartesianGrid strokeDasharray="3 5" stroke="var(--chart-grid)" vertical={false} /><XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--muted)', fontSize: 10 }} /><YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fill: 'var(--muted)', fontSize: 10 }} /><Tooltip contentStyle={{ background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 8 }} /><Bar dataKey="score" fill="#5b8cff" radius={[5, 5, 0, 0]} /></BarChart></ResponsiveContainer></div></div><section className="dashboard-panel data-panel"><PanelHeader title="Baholar jurnali" subtitle="Barcha baholangan topshiriqlar" action={!isStudent && <button className="button button-primary button-small" onClick={addGrade}><Plus size={14} /> Baho qo‘shish</button>} /><div className="table-scroll"><table><thead><tr><th>FAN</th><th>TOPSHIRIQ</th><th>SANA</th><th>BAHO</th><th>USTOZ IZOHI</th></tr></thead><tbody>{data.grades.map((grade) => <tr key={grade.assignment}><td><strong className="table-main">{grade.subject}</strong></td><td>{grade.assignment}</td><td>{grade.date}</td><td><span className="grade-score-pill">{grade.score}/100</span></td><td className="comment-cell">{grade.comment}</td></tr>)}</tbody></table></div></section></>
}

function GradeRows({ grades }: { grades: AcademyData['grades'] }) {
  return <div className="grade-rows">{grades.map((grade) => <div key={grade.assignment}><span className="grade-icon"><Award size={16} /></span><span><strong>{grade.assignment}</strong><small>{grade.subject} · {grade.date}</small></span><b>{grade.score}<small>/100</small></b></div>)}</div>
}

function AssignmentsPage({ notify }: { notify: (message: string) => void }) {
  const [submitted, setSubmitted] = useState<string[]>([])
  const tasks = [{ title: 'Responsive portfolio sahifa', course: 'Frontend Development', deadline: '7 oktabr, 23:59', status: 'Bajarilmagan' }, { title: 'REST API va autentifikatsiya', course: 'Backend Development', deadline: '9 oktabr, 23:59', status: 'Jarayonda' }, { title: 'React state management', course: 'Frontend Development', deadline: '12 oktabr, 23:59', status: 'Tekshirilgan' }]
  return <div className="assignment-list">{tasks.map((task) => { const done = submitted.includes(task.title); return <article className="dashboard-panel assignment-card" key={task.title}><span className={`assignment-status ${done ? 'submitted' : task.status === 'Tekshirilgan' ? 'reviewed' : 'pending'}`}>{done ? 'TOPSHIRILDI' : task.status.toUpperCase()}</span><h3>{task.title}</h3><p>{task.course}</p><div><span><CalendarDays size={14} /> Muddat: {task.deadline}</span>{task.status === 'Tekshirilgan' && <span className="grade-score-pill">92/100</span>}</div>{task.status !== 'Tekshirilgan' && <button className="button button-outline button-small" onClick={() => { setSubmitted([...submitted, task.title]); notify('Topshiriq muvaffaqiyatli yuborildi.') }}>{done ? <Check size={14} /> : <Send size={14} />}{done ? 'Topshirildi' : 'Topshiriqni topshirish'}</button>}</article> })}</div>
}

function PaymentsPage({ data, isStudent, onPay }: { data: AcademyData; isStudent: boolean; onPay: () => void }) {
  return <><div className="metric-grid mini-metrics">{[{ label: 'Kurs narxi', value: money(890000), color: 'blue' }, { label: 'To‘langan', value: money(2670000), color: 'green' }, { label: 'Qoldiq', value: money(0), color: 'violet' }, { label: 'Keyingi to‘lov', value: '1 noyabr', color: 'orange' }].map((item) => <article className="metric-card mini-metric" key={item.label}><span className={`metric-icon ${item.color}`}><CreditCard /></span><small>{item.label}</small><strong className="payment-metric">{item.value}</strong></article>)}</div><section className="dashboard-panel data-panel"><div className="table-toolbar"><div><span className="table-count">To‘lovlar tarixi</span><span className="table-search-hint">Barcha to‘lov operatsiyalari</span></div><button className="button button-primary button-small" onClick={onPay}><CreditCard size={15} />{isStudent ? 'To‘lov qilish' : 'To‘lov qo‘shish'}</button></div><div className="table-scroll"><table><thead><tr><th>SANA</th>{!isStudent && <th>O‘QUVCHI</th>}<th>MIQDOR</th><th>USUL</th><th>HOLAT</th><th>CHEK</th></tr></thead><tbody>{data.payments.map((payment, index) => <tr key={`${payment.date}-${index}`}><td>{payment.date}</td>{!isStudent && <td>Muhammadali To‘rayev</td>}<td><strong className="table-main">{money(payment.amount)}</strong></td><td>{payment.method}</td><td><span className="status-pill status-active"><i />{payment.status}</span></td><td><button className="icon-btn" aria-label="Chekni yuklab olish"><Download size={16} /></button></td></tr>)}</tbody></table></div></section></>
}

function ApplicationsPage({ data, onStatus }: { data: AcademyData; onStatus: (application: Application, status: Application['status']) => void }) {
  return <section className="dashboard-panel data-panel"><div className="table-toolbar"><div><span className="table-count">{data.applications.length} ta ariza</span><span className="table-search-hint">Kurslarga qiziqish bildirganlar</span></div><label className="select-filter"><Filter size={14} /><span>Barcha arizalar</span></label></div><ApplicationsTable applications={data.applications} onStatus={onStatus} /></section>
}

function ApplicationsTable({ applications, onStatus, compact = false }: { applications: Application[]; onStatus?: (application: Application, status: Application['status']) => void; compact?: boolean }) {
  return <div className="table-scroll"><table><thead><tr><th>ISM / TELEFON</th><th>KURS</th><th>SANA</th><th>HOLAT</th>{!compact && <th>AMAL</th>}</tr></thead><tbody>{applications.map((application) => <tr key={application.id}><td><strong className="table-main">{application.name}</strong><small className="table-secondary">{application.phone}</small></td><td>{application.course}</td><td>{application.date}</td><td><span className={`status-pill ${application.status === 'Approved' ? 'status-active' : application.status === 'Rejected' ? 'status-danger' : application.status === 'Contacted' ? 'status-pending' : 'status-new'}`}><i />{{ New: 'Yangi', Contacted: 'Bog‘lanildi', Approved: 'Qabul qilindi', Rejected: 'Rad etildi' }[application.status]}</span></td>{!compact && <td><select className="row-status-select" value={application.status} onChange={(event) => onStatus?.(application, event.target.value as Application['status'])}><option value="New">Yangi</option><option value="Contacted">Bog‘lanildi</option><option value="Approved">Qabul qilindi</option><option value="Rejected">Rad etildi</option></select></td>}</tr>)}</tbody></table>{applications.length === 0 && <EmptyState title="Arizalar yo‘q" description="Yangi arizalar yuborilganda shu yerda ko‘rinadi." />}</div>
}

function NotificationsPage({ data }: { data: AcademyData }) {
  return <div className="notification-list">{data.notifications.map((item, index) => <article className="dashboard-panel notification-card" key={`${item}-${index}`}><span className="notification-icon"><Bell size={18} /></span><div><strong>{item}</strong><p>{index === 0 ? 'Hozirgina' : `${index + 1} soat oldin`} · Akademiya tizimi</p></div><span className="notification-unread" /></article>)}</div>
}

function MessagesPage({ user, notify }: { user: User; notify: (message: string) => void }) {
  const [message, setMessage] = useState('')
  const [sent, setSent] = useState<string[]>([])
  return <section className="dashboard-panel message-panel"><PanelHeader title="Akademiya jamoasi" subtitle="Mentor yoki administrator bilan bog‘laning" /><div className="message-thread"><div className="message-bubble received"><strong>Akademiya jamoasi</strong><p>Assalomu alaykum, {user.name.split(' ')[0]}! Savollaringiz bo‘lsa shu yerda yozishingiz mumkin.</p><small>Bugun, 09:30</small></div>{sent.map((item, index) => <div className="message-bubble sent" key={`${item}-${index}`}><p>{item}</p><small>Hozirgina</small></div>)}</div><form className="message-compose" onSubmit={(event) => { event.preventDefault(); if (!message.trim()) return; setSent([...sent, message]); setMessage(''); notify('Xabar yuborildi.') }}><input value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Xabaringizni yozing..." /><button className="button button-primary button-small" type="submit"><Send size={15} /> Yuborish</button></form></section>
}

function CertificatesPage({ user }: { user: User }) {
  return <div className="certificate-layout"><article className="certificate-preview"><div className="certificate-inner"><span className="brand-mark"><Code2 size={18} /></span><div className="section-kicker">ABDUAZIZ IT ACADEMY</div><h2>SERTIFIKAT</h2><p>Ushbu sertifikat bilan tasdiqlanadiki</p><strong>{user.name}</strong><p>Frontend Development kursini muvaffaqiyatli tamomladi</p><div className="certificate-sign"><span>ACADEMY DIRECTOR</span><span>AA-2026-00124</span></div></div></article><section className="dashboard-panel certificate-details"><span className="status-pill status-active"><i />Kurs yakunlandi</span><h3>Frontend Development</h3><p>Bitiruv sanasi: 2026-yil 20-sentabr</p><div><span><CheckCircle2 size={15} /> Barcha modullar yakunlandi</span><span><CheckCircle2 size={15} /> Yakuniy loyiha himoya qilindi</span><span><CheckCircle2 size={15} /> Mentor bahosi: 94/100</span></div><button className="button button-primary" onClick={() => window.print()}><Download size={16} /> Yuklab olish</button></section></div>
}

function ProfilePage({ user }: { user: User }) {
  return <div className="dashboard-panel profile-panel"><img src={avatar(user.name)} alt="" /><div><div className="section-kicker">SHAXSIY MA’LUMOTLAR</div><h2>{user.name}</h2><p>{roleNames[user.role]} · {user.email}</p><div className="profile-info-grid"><span><small>EMAIL</small><strong>{user.email}</strong></span><span><small>KURS</small><strong>{user.course || 'Academy Management'}</strong></span><span><small>GURUH</small><strong>{user.group || 'Akademiya jamoasi'}</strong></span><span><small>HOLAT</small><strong className="profile-active">Faol o‘quvchi</strong></span></div></div></div>
}

function ReportsPage({ data }: { data: AcademyData }) {
  return <div className="reports-grid">{[['O‘quvchilar hisoboti', `${data.users.filter((user) => user.role === 'STUDENT').length} o‘quvchi`, <Users />], ['Kurslar hisoboti', `${data.courses.length} faol kurs`, <BookOpen />], ['Davomat hisoboti', `${data.attendance.length} dars yozuvi`, <CheckCircle2 />], ['To‘lovlar hisoboti', `${data.payments.length} tranzaksiya`, <CreditCard />], ['Arizalar hisoboti', `${data.applications.length} ta ariza`, <FileBarChart2 />], ['Akademik natijalar', `${data.grades.length} baholangan ish`, <Award />]].map(([title, description, icon]) => <article className="dashboard-panel report-card" key={String(title)}><span className="report-icon">{icon as ReactNode}</span><h3>{title as string}</h3><p>{description as string}</p><button className="button button-outline button-small" onClick={() => window.print()}><Download size={14} /> PDF eksport</button></article>)}</div>
}

function AnalyticsPage({ data, period, setPeriod }: { data: AcademyData; period: string; setPeriod: (period: string) => void }) {
  const revenue = [{ month: 'May', value: 28 }, { month: 'Iyun', value: 32 }, { month: 'Iyul', value: 38 }, { month: 'Avg', value: 35 }, { month: 'Sen', value: 44 }, { month: 'Okt', value: 49 }]
  return <><div className="analytics-filter"><span><Filter size={15} /> Davr bo‘yicha</span><select value={period} onChange={(event) => setPeriod(event.target.value)}><option>Bugun</option><option>Bu hafta</option><option>Bu oy</option><option>Bu yil</option></select><button className="button button-outline button-small">Maxsus davr</button></div><div className="analytics-row"><section className="dashboard-panel chart-panel"><PanelHeader title="Oylik tushum" subtitle="Million so‘mda" /><div className="chart-box large"><ResponsiveContainer width="100%" height="100%"><BarChart data={revenue}><CartesianGrid strokeDasharray="3 5" stroke="var(--chart-grid)" vertical={false} /><XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fill: 'var(--muted)', fontSize: 11 }} /><YAxis tickLine={false} axisLine={false} tick={{ fill: 'var(--muted)', fontSize: 11 }} /><Tooltip contentStyle={{ background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 8 }} /><Bar dataKey="value" fill="#5b8cff" radius={[5, 5, 0, 0]} /></BarChart></ResponsiveContainer></div></section><section className="dashboard-panel chart-panel"><PanelHeader title="O‘quvchilar o‘sishi" subtitle="Yil davomida" /><div className="chart-box large"><ResponsiveContainer width="100%" height="100%"><AreaChart data={revenue.map((item, index) => ({ ...item, users: 320 + index * 48 }))}><CartesianGrid strokeDasharray="3 5" stroke="var(--chart-grid)" vertical={false} /><XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fill: 'var(--muted)', fontSize: 11 }} /><YAxis tickLine={false} axisLine={false} tick={{ fill: 'var(--muted)', fontSize: 11 }} /><Tooltip contentStyle={{ background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 8 }} /><Area type="monotone" dataKey="users" stroke="#32c98a" fill="#32c98a" fillOpacity={0.12} /></AreaChart></ResponsiveContainer></div></section></div><div className="metric-grid mini-metrics">{[{ label: 'Kurslar', value: data.courses.length }, { label: 'O‘quvchilar', value: data.users.filter((user) => user.role === 'STUDENT').length }, { label: 'To‘lovlar', value: data.payments.length }, { label: 'Arizalar', value: data.applications.length }].map((metric) => <article className="metric-card mini-metric" key={metric.label}><small>{metric.label}</small><strong>{metric.value}</strong><span className="metric-trend"><ArrowUpRight size={13} /> O‘sish</span></article>)}</div></>
}

function LogsPage({ data }: { data: AcademyData }) {
  const logs = [{ action: 'Tizimga kirildi', user: 'Akademiya administratori', date: 'Bugun, 09:12', status: 'Muvaffaqiyatli' }, { action: 'Yangi ariza qabul qilindi', user: data.applications[0]?.name || 'Mehmon', date: 'Bugun, 08:45', status: 'Muvaffaqiyatli' }, { action: 'To‘lov qayd etildi', user: 'Muhammadali To‘rayev', date: 'Kecha, 17:20', status: 'Muvaffaqiyatli' }, { action: 'Kurs ma’lumotlari yangilandi', user: 'Akademiya administratori', date: 'Kecha, 14:05', status: 'Muvaffaqiyatli' }]
  return <section className="dashboard-panel data-panel"><PanelHeader title="Tizim jurnali" subtitle="Akademiyada bajarilgan oxirgi amallar" action={<button className="button button-outline button-small"><Download size={14} /> Eksport</button>} /><div className="table-scroll"><table><thead><tr><th>AMAL</th><th>FOYDALANUVCHI</th><th>SANA VA VAQT</th><th>HOLAT</th></tr></thead><tbody>{logs.map((log) => <tr key={log.action}><td><strong className="table-main">{log.action}</strong></td><td>{log.user}</td><td>{log.date}</td><td><span className="status-pill status-active"><i />{log.status}</span></td></tr>)}</tbody></table></div></section>
}

function AdminsPage({ data, setData, notify }: { data: AcademyData; setData: (data: AcademyData) => void; notify: (message: string) => void }) {
  const admins = data.users.filter((user) => user.role === 'ADMIN')
  return <section className="dashboard-panel data-panel"><PanelHeader title="Administratorlar" subtitle="Akademiya boshqaruviga ruxsati bor foydalanuvchilar" action={<button className="button button-primary button-small" onClick={() => { const email = window.prompt('Yangi administrator emaili'); if (email) { const name = window.prompt('Administrator ismi') || 'Yangi administrator'; setData({ ...data, users: [...data.users, { id: crypto.randomUUID(), name, email, role: 'ADMIN' }] }); notify('Administrator qo‘shildi.') } }}><Plus size={15} /> Admin qo‘shish</button>} /><div className="table-scroll"><table><thead><tr><th>ADMINISTRATOR</th><th>ROL</th><th>HOLAT</th><th>OXIRGI KIRISH</th><th>YARATILDI</th><th /></tr></thead><tbody>{admins.map((admin) => <tr key={admin.id}><td><div className="table-person"><img src={avatar(admin.name)} alt="" /><span><strong>{admin.name}</strong><small>{admin.email}</small></span></div></td><td><span className="role-chip">ADMIN</span></td><td><span className="status-pill status-active"><i />Faol</span></td><td>Bugun, 09:12</td><td>2026-yil 12-may</td><td><button className="icon-btn" onClick={() => { if (window.confirm('Administratorni o‘chirishni tasdiqlaysizmi?')) { setData({ ...data, users: data.users.filter((user) => user.id !== admin.id) }); notify('Administrator o‘chirildi.') } }}><MoreHorizontal size={18} /></button></td></tr>)}</tbody></table></div></section>
}

function SecurityPage({ data, setData, user, setUser, notify }: { data: AcademyData; setData: (data: AcademyData) => void; user: User; setUser: (user: User) => void; notify: (message: string) => void }) {
  const [email, setEmail] = useState(user.email)
  const [currentCode, setCurrentCode] = useState('')
  const [newCode, setNewCode] = useState('')
  const [confirmCode, setConfirmCode] = useState('')
  const [visible, setVisible] = useState(false)
  const isDirector = user.role === 'DIRECTOR'
  const currentEmail = isDirector ? data.credentials.directorEmail : data.credentials.adminEmail
  const saveEmail = (event: FormEvent) => {
    event.preventDefault()
    if (!email.includes('@')) { notify('To‘g‘ri email manzilini kiriting.'); return }
    const credentials = { ...data.credentials, [isDirector ? 'directorEmail' : 'adminEmail']: email }
    const updatedUser = { ...user, email }
    setData({ ...data, credentials, users: data.users.map((item) => item.id === user.id ? updatedUser : item) })
    setUser(updatedUser)
    sessionStorage.setItem('academy-session', JSON.stringify(updatedUser))
    notify('Email manzili yangilandi.')
  }
  const saveCode = async (event: FormEvent) => {
    event.preventDefault()
    const expected = isDirector ? data.credentials.directorVerifier : data.credentials.adminVerifier
    if (!await verifyCredentialCode(currentCode, expected)) { notify('Joriy kod noto‘g‘ri.'); return }
    if (newCode.length < 8) { notify('Yangi kod kamida 8 belgidan iborat bo‘lsin.'); return }
    if (newCode !== confirmCode) { notify('Yangi kodlar mos kelmadi.'); return }
    const verifier = await createCredentialVerifier(newCode)
    const credentials = { ...data.credentials, [isDirector ? 'directorVerifier' : 'adminVerifier']: verifier }
    setData({ ...data, credentials })
    setCurrentCode(''); setNewCode(''); setConfirmCode('')
    notify('Kirish kodi xavfsiz yangilandi.')
  }
  return <div className="security-grid"><section className="dashboard-panel security-card"><div className="security-card-icon"><Mail size={18} /></div><div className="section-kicker">AKKAUNT XAVFSIZLIGI</div><h3>Email manzilini o‘zgartirish</h3><p>Portalga kirish uchun ishlatiladigan emailni yangilang.</p><form onSubmit={saveEmail}><label>Joriy email<input value={currentEmail} disabled /></label><label>Yangi email<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required /></label><button className="button button-outline button-small" type="submit">Emailni o‘zgartirish</button></form></section><section className="dashboard-panel security-card"><div className="security-card-icon"><LockKeyhole size={18} /></div><div className="section-kicker">KIRISHNI HIMOYALANG</div><h3>Kirish kodini yangilash</h3><p>Kod kamida 8 belgidan iborat bo‘lishi kerak.</p><form onSubmit={saveCode}><label>Joriy kod<div className="security-input"><input type={visible ? 'text' : 'password'} value={currentCode} onChange={(event) => setCurrentCode(event.target.value)} required /><button type="button" aria-label="Kodni ko‘rsatish" onClick={() => setVisible(!visible)}>{visible ? <EyeOff size={15} /> : <Eye size={15} />}</button></div></label><label>Yangi kod<input type={visible ? 'text' : 'password'} value={newCode} onChange={(event) => setNewCode(event.target.value)} required /></label><label>Yangi kodni tasdiqlang<input type={visible ? 'text' : 'password'} value={confirmCode} onChange={(event) => setConfirmCode(event.target.value)} required /></label><button className="button button-primary button-small" type="submit">Kodni o‘zgartirish</button></form></section><div className="security-note"><Shield size={17} /><span><strong>Himoya holati: faol</strong><small>Kirish ma’lumotlaringiz interfeysda ko‘rsatilmaydi.</small></span><CheckCircle2 size={18} /></div></div>
}

function SettingsPage({ notify }: { notify: (message: string) => void }) {
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [weeklyReport, setWeeklyReport] = useState(false)
  return <div className="settings-list"><section className="dashboard-panel settings-card"><div><h3>Bildirishnomalar</h3><p>Akademiyadagi yangiliklardan xabardor bo‘ling.</p></div><label className="switch-row"><span>Email bildirishnomalari</span><input type="checkbox" checked={emailNotifications} onChange={(event) => setEmailNotifications(event.target.checked)} /><i /></label><label className="switch-row"><span>Haftalik hisobot</span><input type="checkbox" checked={weeklyReport} onChange={(event) => setWeeklyReport(event.target.checked)} /><i /></label><button className="button button-primary button-small" onClick={() => notify('Sozlamalar saqlandi.')}>Sozlamalarni saqlash</button></section><section className="dashboard-panel settings-card"><div><h3>Platforma ko‘rinishi</h3><p>Akademiya portalining asosiy interfeysi.</p></div><div className="setting-choice active"><span><Sun size={17} /></span><div><strong>Dark academy</strong><small>Ko‘zga qulay, fokuslangan ish muhiti</small></div><CheckCircle2 size={17} /></div></section></div>
}

function SchedulePage() {
  return <div className="schedule-list">{[['09:00', 'HTML va CSS asoslari', 'Computer room · 1-xona', 'Azizbek Karimov'], ['13:30', 'Python: ma’lumotlar bilan ishlash', 'Computer room · 3-xona', 'Madina Islomova'], ['18:00', 'React: State va props', 'Online · Zoom', 'Azizbek Karimov']].map(([time, title, place, teacher]) => <article className="dashboard-panel schedule-item" key={time}><div className="schedule-time"><strong>{time}</strong><span>03 OKT</span></div><i /><div><span className="section-kicker">BUGUNGI DARS</span><h3>{title}</h3><p>{place} · {teacher}</p></div><button className="button button-outline button-small">Darsga tayyorlanish <ArrowRight size={14} /></button></article>)}</div>
}

function EmptyState({ title, description }: { title: string; description: string }) {
  return <div className="empty-state"><span><Search size={18} /></span><strong>{title}</strong><p>{description}</p></div>
}

function ErrorPage({ code }: { code: string }) {
  const message = code === '403' ? 'Bu sahifaga kirish huquqingiz mavjud emas.' : code === '500' ? 'Serverda xatolik yuz berdi.' : 'Bu sahifa topilmadi.'
  return <div className="error-page"><div className="error-mark"><Code2 size={20} /></div><span className="section-kicker">ABDUAZIZ IT ACADEMY · {code}</span><h1>{code}</h1><h2>{message}</h2><a href={appUrl('/')} className="button button-primary">Bosh sahifaga qaytish <ArrowRight size={16} /></a></div>
}

export default App
