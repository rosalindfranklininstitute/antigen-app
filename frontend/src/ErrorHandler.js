import { XMarkIcon } from '@heroicons/react/24/outline'

const ErrorHandler = (props) => {
    return (
      <header className="fixed bg-red-600 shadow-md z-50 w-full px-5 py-2 font-bold">
            <button
              type="button"
              className="float-right inline-flex rounded-md bg-red-50 p-1.5 text-red-500 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2 focus:ring-offset-red-50"
              onClick={() => props.onSetError(null)}
            >
              <span className="sr-only">Dismiss</span>
              <XMarkIcon className="h-5 w-5" aria-hidden="true" />
            </button>
        <div className="pt-1 flex justify-center text-white">
              Error: {props.error}
              </div>
      </header>
    )
  };
  
  export default ErrorHandler;