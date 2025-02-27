export const ErrorDisplay = ({ error, onRetry }) => (
    <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
      <p>{error}</p>
      {onRetry && (
        <button 
          onClick={onRetry}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Retry
        </button>
      )}
    </div>
  );