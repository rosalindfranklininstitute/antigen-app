import ComboBox from "./ComboBox";
import config from "../config.js";
import { plateMapOfValues } from "./utils.js";
import { useState, useEffect } from "react";
import * as Sentry from "@sentry/browser";

const SequencingPlateLayout = (props) => {
  const [elisaPlates, setElisaPlates] = useState();
  // const [activeElisaPlates, setActiveElisaPlates] = useState([]);

  const fetchElisaPlates = () => {
    // TODO: Fetch wells async separately
    fetch(config.url.API_URL + "/elisa_plate/", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": props.csrfToken,
      },
    })
      .then((res) => {
        res.json().then(
          (data) => {
            data.forEach(function (_, index, arr) {
              arr[index].displayLabel =
                arr[index].project_short_title +
                "/" +
                arr[index].library_cohort_cohort_num +
                "/" +
                arr[index].id;
            });
            setElisaPlates(data);
          },
          () => {
            props.setError("HTTP code " + res.status);
          }
        );
      })
      .catch((err) => {
        Sentry.captureException(err);
        props.setError(err.toString());
      });
  };

  const wellColors = (locations, wellThresholds, selectedThreshold) => {
    let colors = [];
    for (let i = 1; i <= 96; i++) {
      let color = "";
      if (locations.includes(i)) {
        if (wellThresholds[i - 1] >= selectedThreshold) color = "bg-orange-100";
        else color = "bg-green-100";
      } else {
        if (wellThresholds[i - 1] > selectedThreshold) color = "bg-red-100";
      }
      colors.push(color);
    }
    return colors;
  };

  // Functions to transpose position on a 96 well plate, to fill it vertically first
  let zeroBasedTransposedRow = (pos) => (pos - 1) % 8;
  let zeroBasedTransposedCol = (pos) => Math.floor((pos - 1) / 8);
  let posFillVertical = (pos) =>
    zeroBasedTransposedRow(pos) * 12 + zeroBasedTransposedCol(pos) + 1;

  const setWells = (newPlateThresholds) => {
    let wells = [];
    let pos = 1;
    let plateIdx = 0;
    for (let i = 0; i < newPlateThresholds.length; i++) {
      let plateId = newPlateThresholds[i].elisa_plate;
      let thresh = newPlateThresholds[i].optical_density_threshold;
      let plate = elisaPlates.find((plate) => plate.id === plateId);
      for (let w = 0; w < plate.elisawell_set.length; w++) {
        if (plate.elisawell_set[w].optical_density < thresh) continue;
        wells.push({
          elisa_well: {
            plate: plateId,
            location: w + 1,
          },
          plate: plateIdx,
          location: posFillVertical(pos),
        });
        pos++;
        if (pos > 96) {
          pos = 1;
          plateIdx++;
        }
      }
    }
    props.setWells(wells);
  };

  useEffect(() => {
    fetchElisaPlates();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      {!elisaPlates && "..."}
      {elisaPlates && (
        <>
          <ComboBox
            onChange={(plates) => {
              let newVal = [];
              plates = plates.sort();
              plates.forEach((plate) => {
                let existingPlateThresh = props.plateThresholds.find(
                  (thr) => thr.elisa_plate === plate
                );
                let odThresh = 0.0;
                if (existingPlateThresh) {
                  odThresh = existingPlateThresh.optical_density_threshold;
                }
                newVal.push({
                  optical_density_threshold: odThresh,
                  elisa_plate: plate,
                });
              });
              props.setPlateThresholds(newVal);
              setWells(newVal);
            }}
            multiple={true}
            options={elisaPlates}
            field="elisaPlateSelectorSeq"
            displayField="displayLabel"
            selected={props.plateThresholds.map((thr) => thr.elisa_plate)}
          />
          {props.plateThresholds.map((thr) => (
            <div key={thr.elisa_plate}>
              {plateMapOfValues(
                elisaPlates
                  .find((plate) => plate.id === thr.elisa_plate)
                  .elisawell_set.map((well) => well.optical_density),
                wellColors(
                  props.wells
                    .filter((well) => well.elisa_well.plate === thr.elisa_plate)
                    .map((well) => well.elisa_well.location),
                  elisaPlates
                    .find((plate) => plate.id === thr.elisa_plate)
                    .elisawell_set.map((well) => well.optical_density),
                  thr.optical_density_threshold
                )
              )}
              Plate:{" "}
              {
                elisaPlates.find((plate) => plate.id === thr.elisa_plate)
                  .displayLabel
              }
              <br />
              Threshold:{" "}
              <span className="font-mono">
                {thr.optical_density_threshold.toFixed(3)}
              </span>
              &nbsp;Selected wells:{" "}
              <span className="font-mono">
                {
                  props.wells.filter(
                    (well) => well.elisa_well.plate === thr.elisa_plate
                  ).length
                }
              </span>
              <div className="w-full">
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.001}
                  value={thr.optical_density_threshold}
                  onChange={(val) => {
                    let newPlateThresholds = props.plateThresholds.map(
                      (plate) =>
                        plate.elisa_plate === thr.elisa_plate
                          ? {
                              ...plate,
                              optical_density_threshold: parseFloat(
                                val.target.value
                              ),
                            }
                          : plate
                    );
                    props.setPlateThresholds(newPlateThresholds);
                    setWells(newPlateThresholds);
                  }}
                  className="w-full"
                />
              </div>
            </div>
          ))}
        </>
      )}
    </>
  );
};

export default SequencingPlateLayout;
