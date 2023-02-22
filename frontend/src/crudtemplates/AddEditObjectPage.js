import config from '../config.js';
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, redirect, useLocation } from "react-router-dom";
import { OkCancelDialog } from '../OkCancelDialog.js';
import ComboBox from './ComboBox.js';


function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

function useQuery() {
    const { search } = useLocation();

    return React.useMemo(() => new URLSearchParams(search), [search]);
}

const AddEditObjectPage = (props) => {
  const { recordId } = useParams();
  const [record, setRecord] = useState([])
  const [loading, setLoading] = useState(true);  // used for edits only
  const [error, setError] = useState(null);
  const [relatedTables, setRelatedTables] = useState({});

  const [dialogOpen, setDialogOpen] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const navigate = useNavigate();
  const query = useQuery();

  const setFormValue = (field, value) => {
    setRecord((rec) => ({...rec, [field]: value}));
  }

  const getRecord = () => {
    fetch(config.url.API_URL + props.schema.apiUrl + "/" + recordId, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": props.csrfToken,
        }
      })
        .then((res) => {
            if(res.status === 500) {
                setError(500);
            } else {
                res.json().then((data) => {
                    if(res.status === 404) {
                    setError(404);
                    } else {
                    setRecord(data)
                    }
                    setLoading(false);
                });
            }
    });
  };

const fetchTable = (table, apiUrl) => {
    fetch(config.url.API_URL + apiUrl, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": props.csrfToken,
        }
        })
        .then((res) => {
            res.json().then((data) => {
                setRelatedTables((prev) => ({
                    ...prev,
                    [table]: data
                }));
            })
            });
}

  const foreignKeyFields = ["foreignkey", "selectmulti"];

  useEffect(() => {
    if(!recordId) setLoading(false);
    if(recordId) getRecord();
    props.schema.fields.filter(field => foreignKeyFields.includes(field.type)).forEach((fkField) => {
        fetchTable(fkField.field, fkField.apiUrl);
    });
  }, [props]);

  const cancelForm = () => {
    setDialogOpen(true);
  };

  const submitForm = (e) => {
    e.preventDefault();

    // Construct form data as object
    const formData = new FormData(document.getElementById('recordForm'));
    
    // deal with selectmulti manually
    props.schema.fields.filter(field => field.type == "selectmulti").map((field) => 
      record[field.field].forEach(item => formData.append(field.field, item))
    );

    // console.log(formData);

    // Submit request
    fetch(config.url.API_URL + props.schema.apiUrl + "/" + (recordId ? recordId + "/" : ""), {
        method: recordId ? "PUT" : "POST",
        headers: {
            "X-CSRFToken": props.csrfToken,
        },
        body: formData
        })
        .then((res) => {
          if(res.status >= 300 && res.status != 400) {
            if(res.status == 500) {
              // Sentry should capture this on the backend
              props.onSetError("Internal server error - probably a bug we'll have to fix!")
            } else {
              props.onSetError("Error code " + res.status + " - please report this to support!")
            }
          } else {
            res.json().then((data) => {
              if(res.status == 400) {
                // form validation error
                setFormErrors(data);
                document.body.scrollTop = document.documentElement.scrollTop = 0;
              } else {
                // succeeded
                redirectToRecordsPage(data.id);
              }
            });
          }
    });
  };
  
  async function redirectToRecordsPage(record_id) {
    if(record_id) {
      navigate(props.schema.viewUrl + "/" + record_id);
    } else if (recordId) {
      navigate(props.schema.viewUrl + "/" + recordId);
    } else {
      navigate(props.schema.viewUrl);
    }
  }

  return (
    <div>
      {recordId && error == 404 && <p>404 Not found</p>}
      {!loading && error !== 404 && <>
      <OkCancelDialog open={dialogOpen} setOpen={setDialogOpen} okAction={redirectToRecordsPage} cancelLabel="Return to Form" okLabel="Discard changes" dialogTitle="Discard changes" dialogMessage="Leave this page and discard any changes?" />
      <div className="bg-white shadow overflow-y-visible sm:rounded-lg">
        <form id="recordForm">
      <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
        <dl className="sm:divide-y sm:divide-gray-200">

        {props.schema.fields.filter(field => !field.hideOnForm).map((field) => (
            <div key={props.schema.objectName + "addEdit" + field.field + "_" + recordId} className="py-2 sm:py-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <label htmlFor={field.field} className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2">
                    {field.label}
                </label>
                <div className="mt-1">
                {field.type == "text" && 
                <input
                    type="text"
                    name={field.field}
                    id={field.field + "Field"}
                    autoComplete={field.field + "Field"}
                    className={classNames(formErrors[field.field] ? 
                    "block w-full pr-10 border-red-300 text-red-900 placeholder-red-300 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm rounded-md" : 
                    "flex-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full min-w-0 rounded-none rounded-r-md sm:text-sm border-gray-300")}
                    defaultValue={record[field.field]}
                    // onChange={(e) => setFormValue(field.field, e.target.value)}
                />}

                {field.type == "selectmulti" && relatedTables[field.field] &&
                <ComboBox onChange={(val) => setFormValue(field.field, val)} multiple={true} options={relatedTables[field.field]} field={field.field} displayField={field.fkDisplayField} selected={record[field.field]} />
                }

                {field.type == "file" &&
                <input type="file" name={field.field} onChange={(e) => setFormValue(field.field, e.target.files[0])} />
                }

                {field.type == "foreignkey" && relatedTables[field.field] &&
                ((recordId && field.readOnlyOnEdit) ?
                // Field is read-only on edit
                <>
                <input
                    type="text"
                    name={field.field + "_display"}
                    id={field.field + "Field"}
                    readOnly
                    disabled
                    className={classNames(formErrors[field.field] ? 
                    "block w-full pr-10 border-red-300 text-red-900 placeholder-red-300 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm rounded-md" : 
                    "flex-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full min-w-0 rounded-none rounded-r-md sm:text-sm border-gray-300")}
                    defaultValue={relatedTables[field.field].find((obj) => obj.id == record[field.field])[field.fkDisplayField]}
                />
                <input type="hidden" name={field.field} defaultValue={record[field.field]}></input>
                </>
                :
                // Field is chosen using select
                <select
                    name={field.field}
                    id={field.field + "Field"}
                    className={classNames(formErrors[field.field] ? 
                    "block w-full pr-10 border-red-300 text-red-900 placeholder-red-300 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm rounded-md" : 
                    "flex-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full min-w-0 rounded-none rounded-r-md sm:text-sm border-gray-300")}
                    defaultValue={record[field.field] || query.get(field.field + "_id")}
                >
                  {/* <option value="">Not specified</option> */}
                {Object.values(relatedTables[field.field]).map((opt) => 
                  <option key={field.field + "_" + opt.id} value={opt.id}>{opt[field.fkDisplayField]}</option>
                )}
              </select>)}

                {field.type == "textarea" &&
                <textarea
                  name={field.field}
                  id={field.field + "Field"}
                  rows={3}
                  className={classNames(formErrors[field.field] ?
                    "max-w-lg shadow-sm block w-full  border-red-300 text-red-900 placeholder-red-300 focus:outline-none focus:ring-red-500 focus:border-red-500" :
                    "max-w-lg shadow-sm block w-full focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border border-gray-300 rounded-md")}
                  defaultValue={record[field.field]}
                />}

                {field.type == "date" &&
                <input
                    type="date"
                    name={field.field}
                    id={field.field + "Field"}
                    className={classNames(formErrors[field.field] ? 
                        "block w-full pr-10 border-red-300 text-red-900 placeholder-red-300 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm rounded-md" : 
                        "flex-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full min-w-0 rounded-none rounded-r-md sm:text-sm border-gray-300")}
                    defaultValue={record[field.field]}
                />}
                </div>
                {formErrors[field.field] && <p className="mt-2 ml-2 text-sm text-red-600" id={field.field + "Errors"}>{formErrors[field.field]}</p>}
            </div>
        ))}

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

export default AddEditObjectPage;