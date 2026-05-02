import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

const ScoreCard = () => {
  const [score, setScore] = useState(0)
  const [barsLoaded, setBarsLoaded] = useState(false)

 useEffect(() => {
  let iv;
  const t = setTimeout(() => {
    let n = 0
    iv = setInterval(() => {
      n += 2
      if (n >= 75) {
        setScore(75)
        clearInterval(iv)
      } else {
        setScore(n)
      }
    }, 18)
    setBarsLoaded(true)
  }, 500)

  return () => {
    clearTimeout(t)
    if (iv) clearInterval(iv)
  }
}, [])

  return (
    <div
      className="bg-white border border-gray-200 rounded-2xl p-5 w-64 select-none"
      style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.08)' }}
    >
      <p className="text-gray-400 text-xs mb-1">Match score</p>
      <div className="flex items-end gap-1 mb-0.5">
        <span className="text-4xl font-semibold text-gray-900 tabular-nums">{score}</span>
        <span className="text-base text-gray-400 mb-1">/ 100</span>
      </div>
      <p className="text-xs text-gray-500 mb-4">Frontend Dev at Razorpay</p>

      {[
        { l: 'React',      p: 95, red: false },
        { l: 'Node.js',    p: 80, red: false },
        { l: 'TypeScript', p: 35, red: true  },
      ].map(s => (
        <div key={s.l} className="mb-2.5">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>{s.l}</span>
            <span>{s.p}%</span>
          </div>
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${s.red ? 'bg-red-400' : 'bg-gray-800'}`}
              style={{ width: barsLoaded ? `${s.p}%` : '0%' }}
            />
          </div>
        </div>
      ))}

      <div className="border-t border-gray-100 pt-3 mt-1">
        <p className="text-xs text-gray-400 mb-2">Missing skills</p>
        <div className="flex flex-wrap gap-1.5">
          <span className="text-xs px-2 py-0.5 rounded-full bg-red-50 text-red-600 border border-red-100">TypeScript</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-red-50 text-red-600 border border-red-100">Docker</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-100">React</span>
        </div>
      </div>
    </div>
  )
}

const FAQItem = ({ q, a }) => {
  const [open, setOpen] = useState(false)
  return (
    <button onClick={() => setOpen(!open)} className="w-full text-left border-b border-gray-100 py-4">
      <div className="flex justify-between items-center gap-4">
        <span className="text-sm font-medium text-gray-900">{q}</span>
        <span className={`text-gray-400 text-lg transition-transform duration-200 ${open ? 'rotate-45' : ''}`}>+</span>
      </div>
      {open && <p className="text-sm text-gray-500 mt-3 leading-relaxed">{a}</p>}
    </button>
  )
}

const Home = () => (
  <div className="bg-white">

   
    <section   className="max-w-6xl mx-auto px-8 pt-16 pb-24 min-h-[80vh] flex flex-col md:flex-row items-center gap-16">
      <div className="flex-1">
        <div className="inline-flex items-center gap-2 text-xs text-gray-500 border border-gray-200 rounded-full px-3 py-1.5 mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          AI-powered job matching — free during beta
        </div>

        <h1 className="text-4xl md:text-5xl font-semibold text-gray-900 leading-tight tracking-tight mb-5">
          Know exactly{' '}
          <span className="text-blue-600">why you're not</span>{' '}
          getting callbacks.
        </h1>

        <p className="text-base text-gray-500 leading-relaxed mb-8">
          Upload your resume once. Search real jobs. Get an AI match score that shows
          exactly which skills are missing — and what to do about it.
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            to="/register"
            className="px-6 py-3 bg-gray-900 text-white text-sm font-medium rounded-xl hover:bg-gray-700 transition-colors text-center"
          >
            Analyze your resume free →
          </Link>
          <a
            href="#how"
            className="px-6 py-3 border border-gray-200 text-gray-600 text-sm rounded-xl hover:bg-gray-50 transition-colors text-center"
          >
            See how it works
          </a>
        </div>

        <p className="text-gray-400 text-xs mt-4">No credit card. Cancel any time.</p>
      </div>

      <div className="flex-1 flex justify-center">
        <ScoreCard />
      </div>
    </section>


    <div className="border-y border-gray-100 bg-gray-50 py-6">
      <div className="max-w-6xl mx-auto px-8 flex flex-wrap justify-center gap-20">
        {[
          { n: '12,000+', l: 'Resumes analyzed' },
          { n: '87%',     l: 'Avg match improvement' },
          { n: '3×',      l: 'More interview calls' },
          { n: '4.9 ★',   l: 'User rating' },
        ].map(s => (
          <div key={s.l} className="text-center">
            <div className="text-xl font-semibold text-gray-900">{s.n}</div>
            <div className="text-xs text-gray-500 mt-0.5">{s.l}</div>
          </div>
        ))}
      </div>
    </div>

   
    <section id="how" className="max-w-6xl mx-auto px-8 py-20">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider text-center mb-3">
        How it works
      </p>
      <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 text-center tracking-tight mb-12">
        From resume to offer in 3 steps
      </h2>
      <div className="grid md:grid-cols-3 gap-6">
        {[
          { n: '01', t: 'Upload your resume once', d: 'Drag and drop your PDF. AI extracts your skills and experience automatically. Never upload again.' },
          { n: '02', t: 'Search real job listings', d: 'Browse live jobs from LinkedIn, Indeed, and Glassdoor inside the app. No copy-pasting needed.' },
          { n: '03', t: 'Get your match score',    d: 'AI compares your profile against the JD and returns a score, missing skills, strengths, and how to close the gap.' },
        ].map(s => (
          <div key={s.n} className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
            <div className="text-xs font-semibold text-gray-300 mb-4 font-mono">{s.n}</div>
            <h3 className="text-sm font-semibold text-gray-900 mb-2">{s.t}</h3>
            <p className="text-sm text-gray-500 leading-relaxed">{s.d}</p>
          </div>
        ))}
      </div>
    </section>

    {/* FEATURES */}
    <section id="features" className="border-t border-gray-100 bg-gray-50">
      <div className="max-w-6xl mx-auto px-8 py-20">
        <h2 className="text-2xl font-semibold text-gray-900 text-center tracking-tight mb-10">
          Everything you need to job hunt smarter
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { t: 'AI match scoring',    d: 'Get a 0–100 score comparing your resume to any job description.' },
            { t: 'Skills gap analysis', d: 'Know exactly which skills to learn to get more callbacks.' },
            { t: 'Real job search',     d: 'Search LinkedIn, Indeed and Glassdoor without leaving the app.' },
            { t: 'Application tracker', d: 'Kanban board to track every job from applied to offer.' },
            { t: 'Resume scoring',      d: 'AI scores your resume quality and tells you what to fix.' },
            { t: 'Interview prep',      d: 'AI generates likely interview questions for each job you apply to.' },
          ].map(f => (
            <div key={f.t} className="bg-white rounded-xl p-5 border border-gray-200">
              <h3 className="text-sm font-semibold text-gray-900 mb-1.5">{f.t}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{f.d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* CTA */}
    <section className="max-w-6xl mx-auto px-8 py-20">
      <div className="bg-gray-900 rounded-2xl px-8 py-12 text-center">
        <h2 className="text-2xl md:text-3xl text-white font-semibold mb-3 tracking-tight">
          Stop applying in the dark.
        </h2>
        <p className="text-sm text-gray-400 mb-8 max-w-sm mx-auto">
          Join thousands of job seekers who know exactly what it takes to get hired.
        </p>
        <Link
          to="/register"
          className="inline-block bg-white px-8 py-3 rounded-xl text-gray-900 font-semibold text-sm hover:bg-gray-100 transition-colors"
        >
          Get started for free →
        </Link>
      </div>
    </section>

    {/* FAQ */}
    <section id="faq" className="border-t border-gray-100 bg-gray-50">
      <div className="max-w-2xl mx-auto px-8 py-20">
        <h2 className="text-2xl font-semibold text-gray-900 text-center mb-10">
          Frequently asked questions
        </h2>
        <FAQItem q="Is JobFit really free?" a="Yes — JobFit is completely free during beta. We may introduce a paid plan later but all current users get a generous free tier." />
        <FAQItem q="How does the AI match score work?" a="You upload your resume once. When you find a job, our AI compares your skills and experience against the job description and returns a match percentage plus exactly which skills are missing." />
        <FAQItem q="Where do the job listings come from?" a="We pull real listings from LinkedIn, Indeed, and Glassdoor via the JSearch API. Results are updated daily and include full job descriptions and direct apply links." />
        <FAQItem q="Is my resume data secure?" a="Yes. We extract text from your PDF and store only that text — never the file. Your data is encrypted and never shared with third parties." />
        <FAQItem q="Can I use JobFit on mobile?" a="Yes, JobFit is fully responsive and works on any device." />
      </div>
    </section>

  </div>
)

export default Home