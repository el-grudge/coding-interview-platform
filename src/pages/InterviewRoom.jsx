import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Editor from '@monaco-editor/react'
import * as Y from 'yjs'
import { WebrtcProvider } from 'y-webrtc'
import { MonacoBinding } from 'y-monaco'
import { executeCode as runCode, loadPyodide } from '../services/codeExecutor'
import './InterviewRoom.css'

function InterviewRoom() {
  const { roomId } = useParams()
  const navigate = useNavigate()
  const [language, setLanguage] = useState('javascript')
  const [output, setOutput] = useState('')
  const [isExecuting, setIsExecuting] = useState(false)
  const [isPyodideLoading, setIsPyodideLoading] = useState(false)
  const [shareLink, setShareLink] = useState('')
  const [copied, setCopied] = useState(false)

  const editorRef = useRef(null)
  const ydocRef = useRef(null)
  const providerRef = useRef(null)
  const bindingRef = useRef(null)

  useEffect(() => {
    const link = `${window.location.origin}/room/${roomId}`
    setShareLink(link)
  }, [roomId])

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor

    ydocRef.current = new Y.Doc()
    const yText = ydocRef.current.getText('monaco')

    providerRef.current = new WebrtcProvider(roomId, ydocRef.current, {
      signaling: ['wss://signaling.yjs.dev'],
    })

    bindingRef.current = new MonacoBinding(
      yText,
      editorRef.current.getModel(),
      new Set([editorRef.current]),
      providerRef.current.awareness
    )
  }

  useEffect(() => {
    return () => {
      if (bindingRef.current) {
        bindingRef.current.destroy()
      }
      if (providerRef.current) {
        providerRef.current.destroy()
      }
      if (ydocRef.current) {
        ydocRef.current.destroy()
      }
    }
  }, [])

  useEffect(() => {
    if (language === 'python' && !isPyodideLoading) {
      setIsPyodideLoading(true)
      loadPyodide()
        .then(() => {
          setIsPyodideLoading(false)
          setOutput('Python environment loaded and ready!')
        })
        .catch((error) => {
          setIsPyodideLoading(false)
          setOutput(`Failed to load Python: ${error.message}`)
        })
    }
  }, [language])

  const executeCode = async () => {
    setIsExecuting(true)
    setOutput('')

    try {
      const code = editorRef.current.getValue()
      const result = await runCode(code, language)

      if (result.success) {
        setOutput(result.output)
      } else {
        setOutput(`Error: ${result.error}`)
      }
    } catch (error) {
      setOutput(`Execution Error: ${error.message}`)
    } finally {
      setIsExecuting(false)
    }
  }

  const copyShareLink = () => {
    navigator.clipboard.writeText(shareLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="interview-room">
      <header className="room-header">
        <div className="header-left">
          <button onClick={() => navigate('/')} className="back-button">
            ← Back
          </button>
          <h2>Room: {roomId}</h2>
        </div>
        <div className="header-right">
          <div className="share-section">
            <input
              type="text"
              value={shareLink}
              readOnly
              className="share-link-input"
              data-testid="share-link"
            />
            <button
              onClick={copyShareLink}
              className="copy-button"
              data-testid="copy-link-button"
            >
              {copied ? 'Copied!' : 'Copy Link'}
            </button>
          </div>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="language-selector"
            data-testid="language-selector"
          >
            <option value="javascript">JavaScript</option>
            <option value="python">Python</option>
            <option value="java">Java</option>
            <option value="cpp">C++</option>
            <option value="go">Go</option>
          </select>
        </div>
      </header>

      <div className="editor-container">
        <div className="editor-section">
          <div className="section-header">
            <h3>Code Editor</h3>
          </div>
          <Editor
            height="100%"
            language={language}
            theme="vs-dark"
            defaultValue="// Start coding..."
            onMount={handleEditorDidMount}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              lineNumbers: 'on',
              roundedSelection: false,
              scrollBeyondLastLine: false,
              automaticLayout: true,
            }}
          />
        </div>

        <div className="output-section">
          <div className="section-header">
            <h3>Output</h3>
            <button
              onClick={executeCode}
              disabled={isExecuting || isPyodideLoading}
              className="execute-button"
              data-testid="execute-button"
            >
              {isPyodideLoading
                ? 'Loading Python...'
                : isExecuting
                ? 'Executing...'
                : 'Run Code'}
            </button>
          </div>
          <pre className="output-display" data-testid="output-display">
            {output || 'Click "Run Code" to see output'}
          </pre>
        </div>
      </div>
    </div>
  )
}

export default InterviewRoom
