import { useEffect } from "react";

const HeadedPage = (props) => {
  useEffect(() => {
    document.title = ((props.title + " | ") || "") + 'AntigenApp'
  }, [props.title]);

  return(
    <>
        <header className="bg-white shadow">
          <div className="mx-auto max-w-7xl py-6 px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">{props.title}</h1>
          </div>
        </header>
        <main>
          <div className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
            <div className="px-4 sm:px-0">
                {props.children}
            </div>
          </div>
        </main>
    </>
  )

};

export default HeadedPage;