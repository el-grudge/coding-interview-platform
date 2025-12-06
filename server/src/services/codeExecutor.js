import { Worker } from 'worker_threads'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { config } from '../config/index.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export class CodeExecutor {
  async execute(code, language, timeout = config.code.defaultTimeout, stdin = '') {
    const startTime = Date.now()

    try {
      if (language === 'javascript') {
        return await this.executeJavaScript(code, timeout, stdin)
      } else if (language === 'python') {
        return {
          success: false,
          output: '',
          error: 'Python execution not yet implemented. Will be available with WebAssembly.',
          executionTime: Date.now() - startTime,
          exitCode: 1,
        }
      } else {
        return {
          success: false,
          output: '',
          error: `Language ${language} is not supported yet.`,
          executionTime: Date.now() - startTime,
          exitCode: 1,
        }
      }
    } catch (error) {
      return {
        success: false,
        output: '',
        error: error.message,
        executionTime: Date.now() - startTime,
        exitCode: 1,
      }
    }
  }

  async executeJavaScript(code, timeout, stdin) {
    return new Promise((resolve) => {
      const startTime = Date.now()
      const logs = []
      let hasError = false
      let errorMessage = ''

      const sandboxedCode = `
        const console = {
          log: (...args) => {
            parentPort.postMessage({ type: 'log', data: args.join(' ') });
          }
        };

        const stdin = ${JSON.stringify(stdin)};

        try {
          ${code}
        } catch (error) {
          parentPort.postMessage({ type: 'error', data: error.message });
        }
      `

      const worker = new Worker(sandboxedCode, { eval: true })

      const timer = setTimeout(() => {
        worker.terminate()
        resolve({
          success: false,
          output: logs.join('\n'),
          error: 'Execution timeout exceeded',
          executionTime: Date.now() - startTime,
          exitCode: 124,
        })
      }, timeout)

      worker.on('message', (message) => {
        if (message.type === 'log') {
          logs.push(message.data)
        } else if (message.type === 'error') {
          hasError = true
          errorMessage = message.data
        }
      })

      worker.on('error', (error) => {
        clearTimeout(timer)
        resolve({
          success: false,
          output: logs.join('\n'),
          error: error.message,
          executionTime: Date.now() - startTime,
          exitCode: 1,
        })
      })

      worker.on('exit', (exitCode) => {
        clearTimeout(timer)
        resolve({
          success: !hasError && exitCode === 0,
          output: logs.join('\n') || (exitCode === 0 ? 'Code executed successfully' : ''),
          error: hasError ? errorMessage : undefined,
          executionTime: Date.now() - startTime,
          exitCode: exitCode,
        })
      })
    })
  }
}

export const codeExecutor = new CodeExecutor()
