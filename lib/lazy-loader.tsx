import React, { Suspense, lazy, useState, useEffect } from 'react';

interface DynamicRendererProps {
  filename: string; // e.g., 'MyComponent' (without extension)
}

export const LazyDynamicRenderer: React.FC<DynamicRendererProps> = ({ filename }) => {
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [LazyComponent, setLazyComponent] = useState<any>(null);
  
  console.log('in lazy loader for skincare component:', filename);
  
  useEffect(() => {
    const loadComponent = async () => {
      try {
        console.log('waiting 2 seconds before loading skincare component...')
        await new Promise(resolve => setTimeout(resolve, 2000)); // Reduced delay to 2 seconds
        
        console.log('trying to lazyload component from: ', `../components/generated/${filename}`)
        
        // Try to load the component
        const component = lazy(() => import(`../components/generated/${filename}`));
        setLazyComponent(() => component);
        setIsLoading(false);
      } catch (err: any) {
        console.log('got error from lazy loader', err)
        setError(err);
        setIsLoading(false);
      }
    };
    
    loadComponent();
  }, [filename]);

  if (error) {
    return (
      <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
        <div className="flex items-center space-x-2 mb-2">
          <div className="w-2 h-2 bg-follain-green-600 rounded-full"></div>
          <h3 className="text-follain-green-800 font-semibold">Component Loading Error</h3>
        </div>
        <p className="text-gray-700 mb-2">Unable to load the skincare component: {filename}</p>
        <p className="text-gray-600 text-sm">
          {error.message.includes('Cannot find module') 
            ? "The component file doesn't exist yet. It will be generated when you make a request."
            : error.message}
        </p>
        <div className="mt-3 p-3 bg-white rounded border border-gray-200">
          <p className="text-sm text-gray-600">
            💡 <strong>Tip:</strong> Try asking for a skincare component like:
          </p>
          <ul className="text-sm text-gray-600 mt-1 ml-4 list-disc">
            <li>"Create a skincare routine planner"</li>
            <li>"Build a skin type analyzer"</li>
            <li>"Show me a product comparison tool"</li>
          </ul>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-4 border border-lavender-200 rounded-lg bg-lavender-50">
        <div className="flex items-center space-x-2 mb-2">
          <div className="w-2 h-2 bg-follain-green-600 rounded-full animate-pulse"></div>
          <h3 className="text-follain-green-800 font-semibold">Loading Skincare Component</h3>
        </div>
        <p className="text-gray-700 mb-2">Preparing your personalized skincare tool...</p>
        <div className="flex space-x-1 mt-2">
          <div className="w-2 h-2 bg-follain-green-600 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-lavender-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
          <div className="w-2 h-2 bg-follain-green-600 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
        </div>
      </div>
    );
  }

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <div className="bg-gradient-to-r from-follain-green-600 to-follain-green-700 p-3">
        <h3 className="text-white font-semibold">✨ Skincare Component</h3>
        <p className="text-white/80 text-sm">Generated: {filename}</p>
      </div>
      <div className="p-4">
        <Suspense fallback={
          <div className="flex items-center justify-center p-8">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-follain-green-600 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-lavender-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
              <div className="w-2 h-2 bg-follain-green-600 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
            </div>
          </div>
        }>
          {LazyComponent ? <LazyComponent /> : <div className="text-gray-500">Component not available.</div>}
        </Suspense>
      </div>
    </div>
  );
};
