import React, { Suspense, lazy, useState, useEffect } from 'react';

interface DynamicRendererProps {
  filename: string; // e.g., 'MyComponent' (without extension)
}

export const LazyDynamicRenderer: React.FC<DynamicRendererProps> = ({ filename }) => {
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [LazyComponent, setLazyComponent] = useState<any>(null);
  
  console.log('in lazy loader')
  
  useEffect(() => {
    const loadComponent = async () => {
      try {
        console.log('waiting 5 seconds before loading component...')
        await new Promise(resolve => setTimeout(resolve, 5000)); // 5 second delay
        
        console.log('trying to lazyload component from: ', `../components/generated/${filename}`)
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
      <div style={{ color: 'red', padding: '1rem', border: '1px solid red', borderRadius: '4px' }}>
        <h3>Error loading component:</h3>
        <p>{error.message}</p>
        <p>Filename: {filename}</p>
        {error.message.includes('Cannot find module') && (
          <p>This usually means the component file doesn't exist or the path is incorrect.</p>
        )}
      </div>
    );
  }

  if (isLoading) {
    return (
      <div style={{ padding: '1rem', border: '1px solid #ccc', borderRadius: '4px' }}>
        <h3>Loading component...</h3>
        <p>Filename: {filename}</p>
        <p>Waiting 5 seconds before attempting to load...</p>
      </div>
    );
  }

  return (
    <>
      <div>
        <h1>Lazy Dynamic Renderer</h1>
        <p>Loading component: {filename}</p>
      </div>
      <Suspense fallback={<div>Loading component...</div>}>
        {LazyComponent ? <LazyComponent /> : <div>Invalid component name.</div>}
      </Suspense>
    </>
  );
};
