export async function registerLanguage(hljs: any, lang: string): Promise<void> {
  try {
    switch (lang) {
      case 'js':
      case 'javascript':
        hljs.registerLanguage(
          'javascript',
          (await import('highlight.js/lib/languages/javascript')).default,
        )
        break
      case 'ts':
      case 'typescript':
        hljs.registerLanguage(
          'typescript',
          (await import('highlight.js/lib/languages/typescript')).default,
        )
        break
      case 'tsx':
        // highlight.js doesn't ship a dedicated TSX highlighter; reuse TypeScript
        hljs.registerLanguage(
          'tsx',
          (await import('highlight.js/lib/languages/typescript')).default,
        )
        break
      case 'jsx':
        hljs.registerLanguage(
          'jsx',
          (await import('highlight.js/lib/languages/javascript')).default,
        )
        break
      case 'json':
        hljs.registerLanguage(
          'json',
          (await import('highlight.js/lib/languages/json')).default,
        )
        break
      case 'css':
        hljs.registerLanguage(
          'css',
          (await import('highlight.js/lib/languages/css')).default,
        )
        break
      case 'html':
      case 'xml':
        hljs.registerLanguage(
          'xml',
          (await import('highlight.js/lib/languages/xml')).default,
        )
        break
      case 'python':
      case 'py':
        hljs.registerLanguage(
          'python',
          (await import('highlight.js/lib/languages/python')).default,
        )
        break
      case 'java':
        hljs.registerLanguage(
          'java',
          (await import('highlight.js/lib/languages/java')).default,
        )
        break
      case 'c':
        hljs.registerLanguage(
          'c',
          (await import('highlight.js/lib/languages/c')).default,
        )
        break
      case 'cpp':
      case 'c++':
        hljs.registerLanguage(
          'cpp',
          (await import('highlight.js/lib/languages/cpp')).default,
        )
        break
      case 'csharp':
      case 'c#':
        hljs.registerLanguage(
          'csharp',
          (await import('highlight.js/lib/languages/csharp')).default,
        )
        break
      case 'go':
        hljs.registerLanguage(
          'go',
          (await import('highlight.js/lib/languages/go')).default,
        )
        break
      case 'ruby':
      case 'rb':
        hljs.registerLanguage(
          'ruby',
          (await import('highlight.js/lib/languages/ruby')).default,
        )
        break
      case 'php':
        hljs.registerLanguage(
          'php',
          (await import('highlight.js/lib/languages/php')).default,
        )
        break
      case 'rust':
        hljs.registerLanguage(
          'rust',
          (await import('highlight.js/lib/languages/rust')).default,
        )
        break
      case 'bash':
      case 'shell':
      case 'sh':
        hljs.registerLanguage(
          'bash',
          (await import('highlight.js/lib/languages/bash')).default,
        )
        break
      case 'yaml':
      case 'yml':
        hljs.registerLanguage(
          'yaml',
          (await import('highlight.js/lib/languages/yaml')).default,
        )
        break
      case 'markdown':
      case 'md':
        hljs.registerLanguage(
          'markdown',
          (await import('highlight.js/lib/languages/markdown')).default,
        )
        break
      case 'sql':
        hljs.registerLanguage(
          'sql',
          (await import('highlight.js/lib/languages/sql')).default,
        )
        break
      default:
        // If unsupported, do nothing; the code will render without syntax highlighting
        break
    }
  } catch {
    // Ignore dynamic import errors; fallback to plain text
  }
}
