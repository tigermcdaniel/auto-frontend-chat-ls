import React, { useState, useEffect } from 'react'

interface IframeComponentRendererProps {
  filename: string
  data?: any
  fallback?: React.ReactNode
}

export function IframeComponentRenderer({ 
  filename, 
  data, 
  fallback 
}: IframeComponentRendererProps) {
  const [componentCode, setComponentCode] = useState<string>('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadComponent() {
      try {
        setLoading(true)
        setError(null)
        
        console.log('Loading V0 component for iframe:', filename)
        
        const response = await fetch(`/api/get-component?filename=${filename}`)
        if (!response.ok) {
          throw new Error('Failed to load component file')
        }
        
        console.log('Response:', response)

        const result = await response.json()
        setComponentCode(result.code)
        
      } catch (err) {
        console.error('Error loading component:', err)
        setError(err instanceof Error ? err.message : 'Failed to load component')
      } finally {
        setLoading(false)
      }
    }

    if (filename) {
      loadComponent()
    }
  }, [filename])

  if (loading) {
    return (
      <div className="w-full p-4 border rounded-lg bg-gray-50">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-500"></div>
          <span className="ml-2">Loading V0 component...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="w-full p-4 border border-red-200 rounded-lg bg-red-50">
        <h3 className="text-red-800 font-semibold mb-2">V0 Component Error</h3>
        <p className="text-red-600 text-sm">{error}</p>
        {fallback && <div className="mt-4">{fallback}</div>}
      </div>
    )
  }

  if (!componentCode) {
    return fallback || (
      <div className="w-full p-4 border border-yellow-200 rounded-lg bg-yellow-50">
        <p className="text-yellow-800 text-sm">V0 component not found</p>
      </div>
    )
  }

  // Create HTML content for the iframe
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>V0 Component</title>
      <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
      <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
      <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
      <style>
        body { margin: 0; padding: 16px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
        .card { border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin-bottom: 16px; }
        .card-header { margin-bottom: 16px; }
        .card-title { font-size: 1.5rem; font-weight: 600; margin: 0; }
        .card-content { }
        button { background: #3b82f6; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; }
        button:hover { background: #2563eb; }
        input { border: 1px solid #d1d5db; padding: 8px; border-radius: 4px; width: 100%; box-sizing: border-box; }
        .todo-item { display: flex; align-items: center; gap: 8px; padding: 8px; border: 1px solid #e5e7eb; border-radius: 4px; margin-bottom: 8px; }
        .completed { text-decoration: line-through; color: #6b7280; }
        .delete-btn { background: #ef4444; color: white; border: none; padding: 4px 8px; border-radius: 4px; cursor: pointer; }
        .delete-btn:hover { background: #dc2626; }
        .add-btn { background: #10b981; color: white; border: none; padding: 8px; border-radius: 4px; cursor: pointer; }
        .add-btn:hover { background: #059669; }
        .stats { display: flex; justify-content: space-between; font-size: 0.875rem; color: #6b7280; padding-top: 16px; border-top: 1px solid #e5e7eb; }
      </style>
    </head>
    <body>
      <div id="root">
        <div style="padding: 20px; color: #666;">Loading component...</div>
      </div>
      <div id="debug" style="position: fixed; top: 10px; right: 10px; background: rgba(0,0,0,0.8); color: white; padding: 10px; border-radius: 4px; font-size: 12px; max-width: 300px; z-index: 1000;">
        <div>Debug Info:</div>
        <div id="debug-content">Initializing...</div>
      </div>
      <script>
        document.getElementById('debug-content').innerHTML = 'Script running...';
      </script>
      <script type="text/babel">
        const { useState, useEffect } = React;
        
        // Mock UI components for the iframe
        const Button = ({ children, onClick, variant = "default", size = "default", className = "" }) => {
          const baseClasses = "px-4 py-2 rounded font-medium transition-colors";
          const variantClasses = {
            default: "bg-blue-500 text-white hover:bg-blue-600",
            ghost: "bg-transparent hover:bg-gray-100",
            destructive: "bg-red-500 text-white hover:bg-red-600"
          };
          const sizeClasses = {
            default: "px-4 py-2",
            sm: "px-2 py-1 text-sm",
            icon: "p-2"
          };
          
          return React.createElement('button', {
            className: \`\${baseClasses} \${variantClasses[variant]} \${sizeClasses[size]} \${className}\`,
            onClick
          }, children);
        };
        
        const Input = ({ placeholder, value, onChange, onKeyPress, className = "" }) => {
          return React.createElement('input', {
            type: 'text',
            placeholder,
            value,
            onChange,
            onKeyPress,
            className: \`border border-gray-300 rounded px-3 py-2 w-full \${className}\`
          });
        };
        
        const Checkbox = ({ checked, onCheckedChange, className = "" }) => {
          return React.createElement('input', {
            type: 'checkbox',
            checked,
            onChange: (e) => onCheckedChange(e.target.checked),
            className: \`w-4 h-4 \${className}\`
          });
        };
        
        const Card = ({ children, className = "" }) => {
          return React.createElement('div', {
            className: \`border border-gray-200 rounded-lg p-4 \${className}\`
          }, children);
        };
        
        const CardHeader = ({ children, className = "" }) => {
          return React.createElement('div', {
            className: \`mb-4 \${className}\`
          }, children);
        };
        
        const CardTitle = ({ children, className = "" }) => {
          return React.createElement('h3', {
            className: \`text-xl font-semibold \${className}\`
          }, children);
        };
        
        const CardContent = ({ children, className = "" }) => {
          return React.createElement('div', {
            className: \`\${className}\`
          }, children);
        };
        
        // Mock icons
        const Trash2 = ({ className = "" }) => React.createElement('span', { className }, '🗑️');
        const Plus = ({ className = "" }) => React.createElement('span', { className }, '➕');
        
        console.log('Component code:', ${JSON.stringify(componentCode)});

        // Clean the component code - remove import statements and fix component name
        const cleanComponentCode = (${JSON.stringify(componentCode)})
          // Remove all import statements (single or multi-line)
          .replace(/import[^;]+;?/g, '')
          // Remove export default function
          //.replace(/export default function (\w+)/, 'function $1')
          // Remove export default assignment
          .replace(/export default (\w+)/, 'const $1 = ');
        
        console.log('Component code to execute:', cleanComponentCode);
        
        // Try to render the actual V0 component using Babel
        try {
          document.getElementById('debug-content').innerHTML = 'Transpiling with Babel...';
          
          // Use Babel to transpile the JSX code
          const transpiledCode = Babel.transform(cleanComponentCode, {
            presets: ['typescript', 'react'],
            filename: 'component.tsx'
          }).code;
          
          console.log('Transpiled code:', transpiledCode);
          document.getElementById('debug-content').innerHTML = 'Code transpiled, executing...';
          
          // Execute the transpiled component code
          eval(transpiledCode);
          
          document.getElementById('debug-content').innerHTML = 'Code executed, finding component...';
          
          // Try to extract the default export function name from the code
          const match = cleanComponentCode.match(/function (\\w+)\\s*\\(/);
          let GeneratedComponent = null;
          if (match) {
            try {
              // Try to get the function from the current scope
              GeneratedComponent = eval(match[1]);
            } catch (e) {
              GeneratedComponent = null;
            }
          }
          if (!GeneratedComponent) {
            // Fallback: try to find any function defined in window that isn't a built-in
            const candidates = Object.keys(window).filter(
              key => typeof window[key] === 'function' && !['React', 'ReactDOM', 'Babel', 'alert', 'setTimeout', 'setInterval'].includes(key)
            );
            GeneratedComponent = window[candidates[0]] || null;
          }
          window.GeneratedComponent = GeneratedComponent;

          if (window.GeneratedComponent) {
            ReactDOM.render(React.createElement(window.GeneratedComponent), document.getElementById('root'));
          } else {
            document.getElementById('root').innerHTML = '<div style="color: red;">No valid component found to render.</div>';
          }
          
          document.getElementById('debug-content').innerHTML = 'Component rendered successfully!';
          if (!document.getElementById('root').innerHTML.trim()) {
            document.getElementById('root').innerHTML = '<div style="color: red;">Component rendered, but output is empty.</div>';
          }
        } catch (error) {
          console.error('Error rendering V0 component:', error);
          document.getElementById('debug-content').innerHTML = 'Error: ' + error.message;
          document.getElementById('root').innerHTML = '<div style="color: red; padding: 20px; font-family: monospace;">Error rendering V0 component: ' + error.message + '<br><br>Component code:<br><pre style="background: #f5f5f5; padding: 10px; border-radius: 4px; font-size: 12px; max-height: 300px; overflow: auto;">' + cleanComponentCode + '</pre></div>';
        }
      </script>
    </body>
    </html>
  `

  return (
    <div className="w-full">
      <div className="border border-green-200 rounded-lg bg-green-50 p-2 mb-4">
        <p className="text-green-800 text-sm">
          <span>🎯</span> V0 Component: {filename.replace('.tsx', '')}
        </p>
      </div>
      
      <iframe
        srcDoc={htmlContent}
        className="w-full border rounded-lg"
        style={{ height: '600px', border: '1px solid #e5e7eb' }}
        title="V0 Component Renderer"
        sandbox="allow-scripts allow-same-origin"
      />
    </div>
  )
} 