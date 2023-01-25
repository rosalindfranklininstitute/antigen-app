const ErrorHandler = (props) => {
    return (
      <header className="fixed bg-red-600 shadow-md z-50 w-full px-5 py-2 flex justify-center items-center text-white font-bold">
          Error: {props.error}
      </header>
    )
  };
  
  export default ErrorHandler;