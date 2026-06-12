import { useState, useRef, useEffect } from 'react'
import api from '../components/Api'


const SUGGESTIONS = [
  'Why did I score this low?',
  'Should I still apply?',
  'What should I learn first?',
  'Rewrite my summary for this job',
]


const Message = ({ msg }) => {
  const isUser = msg.role === 'user'
  return (
    <div className={`flex gap-2.5 ${isUser ? 'justify-end' : ''}`}>
      {!isUser && (
        <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center shrink-0 mt-0.5">
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <circle cx="5" cy="5" r="4" stroke="white" strokeWidth="1"/>
            <path d="M3 5h4M5 3v4" stroke="white" strokeWidth="1" strokeLinecap="round"/>
          </svg>
        </div>
      )}
      <div className={`px-3 py-2 rounded-xl max-w-xs text-sm leading-relaxed ${
        isUser
          ? 'bg-gray-900 text-white rounded-tr-sm'
          : 'bg-white border border-gray-200 text-gray-700 rounded-tl-sm'
      }`}>
        {msg.content}
      </div>
    </div>
  )
}

const TypingIndicator = () => (
  <div className="flex gap-2.5">
    <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center shrink-0 mt-0.5">
      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
        <circle cx="5" cy="5" r="4" stroke="white" strokeWidth="1"/>
        <path d="M3 5h4M5 3v4" stroke="white" strokeWidth="1" strokeLinecap="round"/>
      </svg>
    </div>
    <div className="bg-white border border-gray-200 rounded-xl rounded-tl-sm px-3 py-2">
      <div className="flex gap-1 items-center h-5">
        {[0, 200, 400].map(delay => (
          <div
            key={delay}
            className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
            style={{ animationDelay: `${delay}ms` }}
          />
        ))}
      </div>
    </div>
  </div>
)


