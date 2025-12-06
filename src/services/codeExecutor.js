let pyodide = null
let pyodideLoading = null

export const loadPyodide = async () => {
  if (pyodide) return pyodide
  if (pyodideLoading) return pyodideLoading

  pyodideLoading = (async () => {
    try {
      const { loadPyodide: load } = await import('pyodide')
      pyodide = await load({
        indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.24.1/full/',
      })
      return pyodide
    } catch (error) {
      pyodideLoading = null
      throw error
    }
  })()

  return pyodideLoading
}

export const executeJavaScript = (code) => {
  const logs = []
  const originalLog = console.log
  const originalError = console.error
  const originalWarn = console.warn

  console.log = (...args) => logs.push(args.join(' '))
  console.error = (...args) => logs.push(`Error: ${args.join(' ')}`)
  console.warn = (...args) => logs.push(`Warning: ${args.join(' ')}`)

  const startTime = performance.now()

  try {
    const result = eval(code)
    const executionTime = Math.round(performance.now() - startTime)

    console.log = originalLog
    console.error = originalError
    console.warn = originalWarn

    const output = logs.length > 0 ? logs.join('\n') : String(result)
    return {
      success: true,
      output: output !== 'undefined' ? output : 'Code executed successfully',
      executionTime,
      exitCode: 0,
    }
  } catch (error) {
    const executionTime = Math.round(performance.now() - startTime)

    console.log = originalLog
    console.error = originalError
    console.warn = originalWarn

    return {
      success: false,
      output: logs.join('\n'),
      error: error.message,
      executionTime,
      exitCode: 1,
    }
  }
}

export const executePython = async (code) => {
  const startTime = performance.now()

  try {
    const py = await loadPyodide()

    const output = []
    py.setStdout({ batched: (text) => output.push(text) })
    py.setStderr({ batched: (text) => output.push(`Error: ${text}`) })

    await py.runPythonAsync(code)

    const executionTime = Math.round(performance.now() - startTime)

    return {
      success: true,
      output: output.join('\n') || 'Code executed successfully',
      executionTime,
      exitCode: 0,
    }
  } catch (error) {
    const executionTime = Math.round(performance.now() - startTime)

    return {
      success: false,
      output: '',
      error: error.message,
      executionTime,
      exitCode: 1,
    }
  }
}

export const executeCode = async (code, language) => {
  if (language === 'javascript') {
    return executeJavaScript(code)
  } else if (language === 'python') {
    return await executePython(code)
  } else {
    return {
      success: false,
      output: '',
      error: `Language ${language} is not supported yet. Currently supported: JavaScript, Python`,
      executionTime: 0,
      exitCode: 1,
    }
  }
}
