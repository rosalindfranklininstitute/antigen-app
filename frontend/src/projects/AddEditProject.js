import config from '../config.js';
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from "react-router-dom";
import { OkCancelDialog } from '../OkCancelDialog.js';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

const AddEditProject = (props) => {
  const { projectId } = useParams();
  const [project, setProject] = useState([])
  const [loading, setLoading] = useState(true);  // used for edits only
  const [error, setError] = useState(null);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const navigate = useNavigate();

  const getProject = () => {
    fetch(config.url.API_URL + "/project/" + projectId, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": props.csrfToken,
        }
      })
        .then((res) => {
          res.json().then((data) => {
            if(res.status === 404) {
              setError(404);
            } else {
              setProject(data)
            }
            setLoading(false);
          });
    });
  };
  
  useEffect(() => {
    if(!projectId) setLoading(false);
    if(projectId) getProject();
  }, []);  

  const cancelForm = () => {
    setDialogOpen(true);
  };

  const submitForm = (e) => {
    e.preventDefault();

    // Construct form data as object
    const formData = new URLSearchParams(new FormData(document.getElementById('projectForm')));
    const formDataObj = {};
    formData.forEach((value, key) => (formDataObj[key] = value));
    if(projectId) {
      formDataObj['id'] = projectId;
    }

    // Submit request
    fetch(config.url.API_URL + "/project/" + (projectId ? projectId + "/" : ""), {
        method: projectId ? "PUT" : "POST",
        headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": props.csrfToken,
        },
        body: JSON.stringify(formDataObj)
        })
        .then((res) => {
            res.json().then((data) => {
            if(res.status == 400) {
                setFormErrors(data);
                document.body.scrollTop = document.documentElement.scrollTop = 0;
            } else if(res.status >= 300) {
              // TODO: Handle other classes of other
            } else {
                // succeeded
                redirectToProjects(data.id);
            }
            });
    });
  };
  
  async function redirectToProjects(project_id) {
    if(project_id) {
      navigate('/projects/' + project_id);
    } else if (projectId) {
      navigate('/projects/' + projectId);
    } else {
      navigate('/projects');
    }
  }

  return (
    <div>
      {projectId && error == 404 && <p>404 Not found</p>}
      {!loading && error !== 404 && <>
      <OkCancelDialog open={dialogOpen} setOpen={setDialogOpen} okAction={redirectToProjects} cancelLabel="Return to Form" okLabel="Discard changes" dialogTitle="Discard changes" dialogMessage="Leave this page and discard any changes?" />
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <form id="projectForm">
      <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
        <dl className="sm:divide-y sm:divide-gray-200">

        <div className="py-2 sm:py-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
             <label htmlFor="shortTitle" className="block text-sm font-medium text-gray-700">
                Short title
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  name="short_title"
                  id="shortTitle"
                  autoComplete="shortTitle"
                  className={classNames(formErrors.short_title ? 
                    "block w-full pr-10 border-red-300 text-red-900 placeholder-red-300 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm rounded-md" : 
                    "flex-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full min-w-0 rounded-none rounded-r-md sm:text-sm border-gray-300")}
                  defaultValue={project.short_title}
                />
              </div>
              {formErrors.short_title ? <p className="mt-2 ml-2 text-sm text-red-600" id="short-title-error">{formErrors.short_title}</p> : null}
          </div>

        <div className="py-2 sm:py-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
             <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Title
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  name="title"
                  id="title"
                  autoComplete="title"
                  className={classNames(formErrors.title ? 
                    "block w-full pr-10 border-red-300 text-red-900 placeholder-red-300 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm rounded-md" : 
                    "flex-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full min-w-0 rounded-none rounded-r-md sm:text-sm border-gray-300")}
                  defaultValue={project.title}
                />
              </div>
              {formErrors.title ? <p className="mt-2 ml-2 text-sm text-red-600" id="title-error">{formErrors.title}</p> : null}
          </div>          

          <div className="py-2 sm:py-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2">
                Description
              </label>
              <div className="mt-1 sm:mt-0 sm:col-span-2">
                <textarea
                  id="description"
                  name="description"
                  rows={3}
                  className={classNames(formErrors.description ?
                    "max-w-lg shadow-sm block w-full  border-red-300 text-red-900 placeholder-red-300 focus:outline-none focus:ring-red-500 focus:border-red-500" :
                    "max-w-lg shadow-sm block w-full focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border border-gray-300 rounded-md")}
                  defaultValue={project.description}
                />
              </div>
              {formErrors.description ? <p className="mt-2 ml-2 text-sm text-red-600" id="description-error">{formErrors.description}</p> : null}
          </div>
        </dl>
      </div>
      </form>
    </div>


    <div className="pt-5">
        <div className="flex justify-end">
          <button
            type="button"
            className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            onClick={cancelForm}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            onClick={submitForm}
          >
            Save
          </button>
        </div>
      </div>    
    </>}
    
    </div>
  );
}

export default AddEditProject;