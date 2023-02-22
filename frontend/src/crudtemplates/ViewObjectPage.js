import config from '../config.js';
import { useState, useEffect } from 'react';
import { NavLink, useParams, useNavigate } from "react-router-dom";
import { toTitleCase, displayField } from './utils.js';
import { OkCancelDialog } from '../OkCancelDialog.js';

const ViewObjectPage = (props) => {
    const [record, setRecord] = useState([]);
    const [dialogOpen, setDialogOpen] = useState(false);
    const { recordId } = useParams();
    const navigate = useNavigate();

    const refreshRecord = () => {
        fetch(config.url.API_URL + props.schema.apiUrl + "/" + recordId, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              "X-CSRFToken": props.csrfToken,
            }
          })
            .then((res) => {
              res.json().then((data) => {
                if(res.status === 404) {
                    //TODO: Error handling
                    alert('404 object not found');
                  } else {
                    setRecord(data);
                  }
                })
              });
    }

    const deleteRecord = () => {
        fetch(config.url.API_URL + props.schema.apiUrl + "/" + recordId + "/", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": props.csrfToken,
          },
        })
          .then((res) => {
            if(res.status >= 200 && res.status < 300) {
                navigate(props.schema.viewUrl);
            } else {
                res.json().then((data) => {
                    // TODO: Better error message
                    alert('Error! ' + JSON.stringify(data));
                });
            }
    })};



    useEffect(() => {
        refreshRecord();
    }, [props]);

    return (
    <div className="overflow-hidden bg-white shadow sm:rounded-lg">
        <OkCancelDialog open={dialogOpen} setOpen={setDialogOpen} okAction={deleteRecord} okLabel={"Delete " + toTitleCase(props.schema.objectName)}  dialogTitle={"Confirm Delete " + toTitleCase(props.schema.objectName)} dialogMessage={"Are you sure you want to delete this " + props.schema.objectName + "?"} />
        <div className="px-4 py-5 sm:px-6">
          <NavLink to={props.schema.viewUrl + "/" + recordId + "/edit"}>
                <button
                    type="button"
                    className="relative float-right inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                    Edit {props.schema.objectName}
                </button>
          </NavLink>
          <button
                type="button"
                className="float-right mr-2 inline-flex items-center justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 sm:w-auto"
                onClick={() => setDialogOpen(true)}
            >
                Delete {props.schema.objectName}
            </button>          
        <h3 className="text-lg font-medium leading-6 text-gray-900">{toTitleCase(props.schema.objectName)} Information</h3>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">&nbsp;</p>

        </div>
        <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
        <dl className="sm:divide-y sm:divide-gray-200">
            {props.schema.fields.map((field) => (
            <div key={props.objectName + "_" + field.field} className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">{field.label}</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">{displayField(field, record)}</dd>
            </div>
            ))}
        </dl>
        </div>
    </div>
    )
}

export default ViewObjectPage;