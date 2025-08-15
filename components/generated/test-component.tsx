import React from 'react';

interface TestComponentProps {
  title?: string;
}

export default function TestComponent({ title = "Skincare Test Component" }: TestComponentProps) {
  return (
    <div className="p-6 bg-gradient-to-r from-lavender-50 to-lavender-100 border border-lavender-200 rounded-lg">
      <h3 className="text-lg font-semibold text-follain-green-800 mb-3">{title}</h3>
      <p className="text-gray-700 mb-4">
        This is a test component to verify that the generated directory is working correctly.
      </p>
      <div className="flex items-center space-x-2">
        <div className="w-3 h-3 bg-follain-green-600 rounded-full"></div>
        <span className="text-sm text-follain-green-700">Component loaded successfully</span>
      </div>
    </div>
  );
} 