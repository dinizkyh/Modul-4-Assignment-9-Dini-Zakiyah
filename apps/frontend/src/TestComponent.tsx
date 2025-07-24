import React from 'react';

interface TestComponentProps {
  message?: string;
}

/**
 * Test component to verify hot reload functionality
 * @param props - Component props
 * @returns JSX element
 */
const TestComponent: React.FC<TestComponentProps> = ({ message = 'Hot reload is working!' }) => {
  const [count, setCount] = React.useState(0);

  return (
    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 m-4">
      <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-2">
        Hot Reload Test
      </h3>
      <p className="text-blue-700 dark:text-blue-300 mb-3">
        {message}
      </p>
      <div className="flex items-center gap-4">
        <button
          onClick={() => setCount(count + 1)}
          className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded transition-colors"
        >
          Count: {count}
        </button>
        <span className="text-sm text-blue-600 dark:text-blue-400">
          Click to test reactivity
        </span>
      </div>
    </div>
  );
};

export default TestComponent;
