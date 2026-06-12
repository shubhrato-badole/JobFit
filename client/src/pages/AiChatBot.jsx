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
                        <circle cx="5" cy="5" r="4" stroke="white" strokeWidth="1" />
                        <path d="M3 5h4M5 3v4" stroke="white" strokeWidth="1" strokeLinecap="round" />
                    </svg>
                </div>
            )}
            <div className={`px-3 py-2 rounded-xl max-w-xs text-sm leading-relaxed ${isUser
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
                <circle cx="5" cy="5" r="4" stroke="white" strokeWidth="1" />
                <path d="M3 5h4M5 3v4" stroke="white" strokeWidth="1" strokeLinecap="round" />
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



const AiChat = ({ jobDesc, analysisResult }) => {
    const [messages, setMessages] = useState([])
    const [input, setInput] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [started, setStarted] = useState(false)
    const bottomRef = useRef(null)
    const inputRef = useRef(null)


    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages, loading])

    const startChat = () => {
        setStarted(true)
        setMessages([{
            role: 'model',
            content: `I have read your resume and this job. You scored ${analysisResult?.match_score ?? 'N/A'}/100. Ask me anything about the gap, what to learn, or whether to apply.`
        }])
        setTimeout(() => inputRef.current?.focus(), 100)
    }

    const sendMessage = async (text) => {
        const msg = (text || input).trim()
        if (!msg || loading) return

        setInput('')
        setError('')

        const userMessage = { role: 'user', content: msg }
        const newMessages = [...messages, userMessage]
        setMessages(newMessages)
        setLoading(true)

        try {
            const { data } = await api.post('/api/chat', {
                message: msg,
                history: messages,
                jobDesc: jobDesc,
                analysisResult: analysisResult,
            })

            setMessages(prev => [...prev, { role: 'model', content: data.reply }])
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to get response. Try again.')
        } finally {
            setLoading(false)
        }
    }

    const handleKey = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            sendMessage()
        }
    }


    if (!started) {
        return (
            <div className="border-t border-gray-100 pt-6 mt-2">
                <div className="flex items-center gap-2 mb-3">
                    <div className="w-6 h-6 bg-blue-600 rounded-lg flex items-center justify-center shrink-0">
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                            <path d="M6 1a5 5 0 100 10A5 5 0 006 1zM4 6h4M6 4v4" stroke="white" strokeWidth="1.2" strokeLinecap="round" />
                        </svg>
                    </div>
                    <h3 className="text-sm font-semibold text-gray-900">Chat with AI about this job</h3>
                    <span className="text-xs px-2 py-0.5 bg-blue-50 text-blue-600 border border-blue-100 rounded-full">
                        Knows your resume + this JD
                    </span>
                </div>
                <p className="text-xs text-gray-500 mb-4">
                    Ask why you scored this, what to learn, whether to apply, or get your resume rewritten for this role.
                </p>


                <div className="flex flex-wrap gap-2 mb-4">
                    {SUGGESTIONS.map(s => (
                        <button
                            key={s}
                            onClick={() => { startChat(); setTimeout(() => sendMessage(s), 300) }}
                            className="text-xs px-3 py-1.5 border border-gray-200 rounded-full text-gray-600 hover:bg-gray-50 transition-colors"
                        >
                            {s}
                        </button>
                    ))}
                </div>

                <button
                    onClick={startChat}
                    className="px-4 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-xl hover:bg-gray-700 transition-colors"
                >
                    Start chatting →
                </button>
            </div>
        )
    }




    return (

        <div className="border-t border-gray-100 pt-6 mt-2">

            <div className="flex items-center gap-2 mb-4">

                <div className="w-6 h-6 bg-blue-600 rounded-lg flex items-center justify-center shrink-0">

                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">

                        <path d="M6 1a5 5 0 100 10A5 5 0 006 1zM4 6h4M6 4v4" stroke="white" strokeWidth="1.2" strokeLinecap="round" />

                    </svg>

                </div>

                <h3 className="text-sm font-semibold text-gray-900">Chat with AI about this job</h3>

                <span className="text-xs px-2 py-0.5 bg-blue-50 text-blue-600 border border-blue-100 rounded-full">

                    Knows your resume + this JD

                </span>

            </div>



            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-3 space-y-3 h-64 overflow-y-auto">

                {messages.map((msg, i) => (

                    <Message key={i} msg={msg} />

                ))}

                {loading && <TypingIndicator />}

                {error && (

                    <div className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">

                        {error}

                    </div>

                )}

                <div ref={bottomRef} />

            </div>




            <div className="flex gap-2">

                <input

                    ref={inputRef}

                    value={input}

                    onChange={e => setInput(e.target.value)}

                    onKeyDown={handleKey}

                    disabled={loading}

                    placeholder={loading ? 'AI is thinking...' : 'Ask anything about this job or your resume...'}

                    className="flex-1 px-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-blue-400 transition-colors disabled:bg-gray-50 disabled:cursor-not-allowed"

                />

                <button

                    onClick={() => sendMessage()}

                    disabled={loading || !input.trim()}

                    className="px-4 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-xl hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"

                >

                    Send →

                </button>

            </div>

            <p className="text-xs text-gray-400 mt-2">Press Enter to send</p>

        </div>

    )

}



export default AiChat







