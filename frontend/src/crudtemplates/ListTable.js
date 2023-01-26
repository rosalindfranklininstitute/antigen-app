import config from '../config.js';
import { useState, useEffect } from 'react';
import { NavLink } from "react-router-dom";
import { toTitleCase, pluralise } from './utils.js';

const ListTable = (props) => {
    const [records, setRecords] = useState([]);

    const refreshRecords = () => {
        fetch(config.url.API_URL + props.schema.apiUrl, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              "X-CSRFToken": props.csrfToken,
            }
          })
            .then((res) => {
              res.json().then((data) => {
                  setRecords(data)
                })
              });
    }

    useEffect(() => {
        refreshRecords();
    }, [props]);

    return (
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="sm:flex sm:items-center">
            <div className="sm:flex-auto">
              <h1 className="text-xl font-semibold text-gray-900">{pluralise(toTitleCase(props.schema.objectName))}</h1>
              <p className="mt-2 text-sm text-gray-700">
                &nbsp;
              </p>
            </div>
            <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
              <NavLink to={props.schema.viewUrl + "/add"}>
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
              >
                Add {props.schema.objectName}
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
                          {props.schema.fields[0].label}
                        </th>
                        {props.schema.fields.slice(1).filter(field => field.showInTable).map((titleField) => (
                            <th key={props.schema.objectName + "_" + titleField.field} scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                              {titleField.label}
                            </th>                            
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {records.map((record) => (
                        <tr key={props.schema.objectName + "_tablerow_" + record.id}>
                          <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                            <NavLink to={props.schema.viewUrl+"/"+record.id}>{record[props.schema.fields[0].field]}</NavLink>
                          </td>
                          {props.schema.fields.slice(1).filter(field => field.showInTable).map((dataField) => (
                            <td key={props.schema.objectName + "_tablefield_" + record.id + "_" + dataField.field} className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{record[dataField.field]}</td>   
                          ))}
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

export default ListTable;