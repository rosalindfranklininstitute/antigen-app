import { useState, useEffect } from "react";
import { usePrevious } from "./utils.js";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

function arraysEqual(a, b) {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (a.length !== b.length) return false;

  for (var i = 0; i < a.length; ++i) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

const Tabs = (props) => {
  const [activeTab, setActiveTab] = useState();
  const [tabNames, setTabNames] = useState([]);
  const prevTabNames = usePrevious(tabNames);

  useEffect(() => {
    setTabNames(props.children.map((child) => child.props.tabName));
  }, [props.children]);

  useEffect(() => {
    if (!arraysEqual(prevTabNames, tabNames)) {
      setActiveTab(tabNames[0]);
    }
  }, [prevTabNames, tabNames]);

  return (
    <div>
      <div className="sm:hidden">
        <label htmlFor="tabs" className="sr-only">
          Select a tab
        </label>
        <select
          id="tabs"
          name="tabs"
          className="block mb-2 w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
          value={activeTab}
          onChange={(e) => {
            e.preventDefault();
            setActiveTab(e.target.value);
          }}
        >
          {props.children.map((child) => (
            <option key={child.props.tabName}>{child.props.tabName}</option>
          ))}
        </select>
      </div>
      <div className="hidden sm:block mb-4">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            {props.children.map((child) => (
              <button
                key={child.props.tabName}
                onClick={(e) => {
                  e.preventDefault();
                  setActiveTab(child.props.tabName);
                }}
                className={classNames(
                  child.props.tabName === activeTab
                    ? "border-indigo-500 text-indigo-600"
                    : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700",
                  "whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium"
                )}
                aria-current={
                  child.props.tabName === activeTab ? "page" : undefined
                }
              >
                {child.props.tabName}
              </button>
            ))}
          </nav>
        </div>
      </div>
      {props.children.filter((child) => child.props.tabName === activeTab)}
    </div>
  );
};

export default Tabs;
