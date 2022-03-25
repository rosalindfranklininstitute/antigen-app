import { Slider, Stack, TextField } from "@mui/material";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getElisaPlate, putElisaPlate, selectElisaPlate } from "../slice";
import { ElisaPlateRef } from "../utils";

/**
 *
 * A numeric text field and slider element used to control the threshold of an
 * elisa plate. On entry of a value in the text box or release of the slider a
 * dispatch is made to update the elisa plate threshold with the provided
 * value. Elisa plate information is retrieved from the redux store with a
 * dispatch executed to obtain it if unavailable
 *
 * @param params An elisa plate reference from which the elisa plate can be
 * retrieved
 * @param params.elisaPlateRef The elisa plate reference
 * @returns A stack containing a numeric text field and slider for elisa plate
 * thresholding
 */
export function ElisaPlateThresholdSlider(params: {
  elisaPlateRef: ElisaPlateRef;
}) {
  const dispatch = useDispatch();
  const elisaPlate = useSelector(selectElisaPlate(params.elisaPlateRef));
  const [threshold, setThreshold] = useState<number>(
    elisaPlate ? elisaPlate.threshold : 0
  );

  const updateElisaPlateThreshold = () => {
    if (elisaPlate) dispatch(putElisaPlate({ ...elisaPlate, threshold }));
  };

  useEffect(() => {
    dispatch(getElisaPlate(params.elisaPlateRef));
  }, [dispatch, params.elisaPlateRef]);

  return (
    <Stack direction="row" spacing={2} alignItems="center">
      <TextField
        label="Threshold"
        type="number"
        value={threshold}
        onChange={(evt) => {
          setThreshold(Number(evt.target.value));
        }}
        onBlur={() => updateElisaPlateThreshold()}
      />
      <Slider
        valueLabelDisplay="auto"
        min={0}
        max={2}
        step={0.01}
        value={threshold}
        onChange={(_, threshold) => setThreshold(Number(threshold))}
        onChangeCommitted={() => updateElisaPlateThreshold()}
      />
    </Stack>
  );
}
