import { Slider, Stack, TextField } from "@mui/material";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { putElisaPlate, selectElisaPlate } from "../slice";
import { ElisaPlateRef } from "../utils";

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
