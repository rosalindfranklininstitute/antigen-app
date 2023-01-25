import config from '../config.js';
import { useState, useEffect } from 'react';
import { NavLink, useParams } from "react-router-dom";

const ViewProject = (props) => {
    const [project, setProject] = useState([]);
    const { projectId } = useParams();

    const refreshProjects = () => {
        fetch(config.url.API_URL + "/project/" + projectId, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              "X-CSRFToken": props.csrfToken,
            }
          })
            .then((res) => {
              res.json().then((data) => {
                  setProject(data)
                })
              });
    }

    useEffect(() => {
        refreshProjects();
    }, []);

    return (
    <div className="overflow-hidden bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
            <NavLink to={"/projects/"+projectId+"/edit"}>
        <button
            type="button"
            className="relative float-right inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Edit project
          </button>
          </NavLink>
        <h3 className="text-lg font-medium leading-6 text-gray-900">Project Information</h3>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">&nbsp;</p>

        </div>
        <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
        <dl className="sm:divide-y sm:divide-gray-200">
            <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Short title</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">{project.short_title}</dd>
            </div>
            <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Title</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">{project.title}</dd>
            </div>
            <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Description</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">{project.description}</dd>
            </div>            
            <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Added by</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">{project.added_by}</dd>
            </div>
            <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Added date</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">{project.added_date}</dd>
            </div>
        </dl>
        </div>
    </div>
    )
}

export default ViewProject;