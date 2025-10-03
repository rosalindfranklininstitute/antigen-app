import config from "../config.js";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import * as Sentry from "@sentry/browser";
import WrappedRadioGroup from "./RadioGroup.js";
import BlastResultsTable from "./BlastResultsTable.js";

const blastQueryTypeOptions = [
  { id: "cdr3", name: "CDR3" },
  { id: "full", name: "Full Sequence" },
];

const BlastResults = (props) => {
  const { recordId } = useParams();
  const [blastResults, setBlastResults] = useState();
  const [isLoading, setIsLoading] = useState(true);

  const [queryType, setQueryType] = useState(blastQueryTypeOptions[0]);

  const fetchBlastResults = (queryType) => {
    fetch(
      config.url.API_URL +
        "/sequencingrun/" +
        recordId +
        "/blast/?queryType=" +
        queryType.id,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": props.csrfToken,
        },
      },
    )
      .then((res) => {
        res.json().then(
          (data) => {
            if (res.status === 404) {
              setBlastResults({ hits: [] });
            } else if (res.status >= 400) {
              props.onSetError("[BR] HTTP code " + res.status);
            } else {
              setBlastResults(data);
            }
          },
          (err) => {
            setBlastResults();
            console.log(res, err);
            props.onSetError("[BR] HTTP code " + res.status);
          },
        );
        setIsLoading(false);
      })
      .catch((err) => {
        Sentry.captureException(err);
        props.onSetError(err.toString());
      });
  };

  useEffect(() => {
    setIsLoading(true);
    setBlastResults();
    fetchBlastResults(queryType);
  }, [queryType]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <div className="flex flex-col-2">
        <WrappedRadioGroup
          label="BLAST query type"
          value={queryType}
          setValue={setQueryType}
          options={blastQueryTypeOptions}
          className="float-left"
        />

        <div>
          <label className="text-sm font-medium">BLAST filter parameters</label>
          <br></br>
          Maximum e-value: 0.05<br></br>
          Minimum alignment percentage: 90%
        </div>
      </div>

      <BlastResultsTable
        blastResults={blastResults}
        isLoading={isLoading}
        showCDR3col={true}
      />
    </>
  );
};

export default BlastResults;
