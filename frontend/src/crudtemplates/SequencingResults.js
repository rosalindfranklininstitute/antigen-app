import config from "../config.js";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import * as Sentry from "@sentry/browser";

const SequencingResults = (props) => {
  const { recordId } = useParams();
  const [sequencingResults, setSequencingResults] = useState();
  // const [activeElisaPlates, setActiveElisaPlates] = useState([]);

  const fetchSequencingResults = () => {
    fetch(config.url.API_URL + "/sequencingrun/" + recordId + "/results/", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": props.csrfToken,
      },
    })
      .then((res) => {
        res.json().then(
          (data) => {
            setSequencingResults(data.records);
          },
          () => {
            props.setError("HTTP code " + res.status);
          },
        );
      })
      .catch((err) => {
        Sentry.captureException(err);
        props.setError(err.toString());
      });
  };

  useEffect(() => {
    fetchSequencingResults();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      {!sequencingResults && "..."}
      {sequencingResults && (
        <div className="mt-8 flow-root">
          <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
              <table className="min-w-full divide-y divide-gray-300">
                <thead>
                  <tr>
                    <th
                      scope="col"
                      className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-3"
                    >
                      Sequence ID
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Productive (T/F)
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Stop Codon (T/F)
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      FWR1
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      CDR1
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      FWR2
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      CDR2
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      FWR3
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      CDR3
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {sequencingResults.map((row) => (
                    <tr
                      key={row.sequence_id}
                      className={row.new_cdr3 ? "border-t-2 border-black" : ""}
                    >
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-3">
                        {row.sequence_id}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {row.productive}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {row.stop_codon}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {row.fwr1_aa}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {row.cdr1_aa}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {row.fwr2_aa}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {row.cdr2_aa}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {row.fwr3_aa}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {row.cdr3_aa}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SequencingResults;
