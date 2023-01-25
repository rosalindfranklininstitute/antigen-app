import config from '../config.js';
import { useState, useEffect } from 'react';
import { NavLink } from "react-router-dom";

const Projects = (props) => {
    const [projects, setProjects] = useState([]);

    const refreshProjects = () => {
        fetch(config.url.API_URL + "/project", {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              "X-CSRFToken": props.csrfToken,
            }
          })
            .then((res) => {
              res.json().then((data) => {
                  setProjects(data)
                })
              });
    }

    useEffect(() => {
        refreshProjects();
    }, []);

    return (
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="sm:flex sm:items-center">
            <div className="sm:flex-auto">
              <h1 className="text-xl font-semibold text-gray-900">Projects</h1>
              <p className="mt-2 text-sm text-gray-700">
                &nbsp;
              </p>
            </div>
            <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
              <NavLink to="/projects/add">
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
              >
                Add project
              </button>
              </NavLink>
            </div>
          </div>
          <div className="mt-8 flex flex-col">
            <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
              <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
                <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                  <table className="min-w-full divide-y divide-gray-300">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                          Short name
                        </th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                          Name
                        </th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                          Added by
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {projects.map((project) => (
                        <tr key={project.id}>
                          <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                            <NavLink key={project.id} to={"/projects/"+project.id}>{project.short_title}</NavLink>
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{project.title}</td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{project.added_by}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
}

export default Projects;