import LoadingLlama from "../LoadingLlama.js";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

const extraPad = 2;

const formatAlignment = (row) => {
  let padLength =
    Math.max(row.query_title.length, row.subject_title.length) + extraPad;
  return (
    <pre>
      {row.query_title.padEnd(padLength, " ")}
      {row.query_seq}
      <br />
      {"".padEnd(padLength, " ")}
      {row.midline}
      <br />
      {row.subject_title.padEnd(padLength, " ")}
      {row.subject_seq}
    </pre>
  );
};

const BlastResultsTable = ({ blastResults, isLoading, showCDR3col }) => {
  return (
    <>
      {isLoading && <LoadingLlama />}
      {!isLoading && blastResults && (
        <div className="mt-8 flow-root">
          <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
              <table className="min-w-full divide-y divide-gray-300">
                <thead>
                  <tr>
                    {showCDR3col && (
                      <th
                        scope="col"
                        className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-3"
                      >
                        Query CDR3
                      </th>
                    )}
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Align. length
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Alignment
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      e-value
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Bit score
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {!blastResults.hits.length && (
                    <tr>
                      <td colSpan="5" className="py-4 font-medium text-center">
                        No results
                      </td>
                    </tr>
                  )}
                  {blastResults.hits.map((row, rowIdx, arr) => (
                    <tr
                      key={
                        row.query_title + row.subject_title + row.submatch_no
                      }
                      className={classNames(
                        rowIdx > 0 &&
                          arr[rowIdx - 1].query_cdr3 !== row.query_cdr3
                          ? "border-t-2 border-black"
                          : "",
                      )}
                    >
                      {showCDR3col && (
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-3">
                          {row.query_cdr3 || "None"}
                        </td>
                      )}
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {row.align_len} ({row.align_perc}%)
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {formatAlignment(row)}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {row.e_value}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {row.bit_score}
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

export default BlastResultsTable;
