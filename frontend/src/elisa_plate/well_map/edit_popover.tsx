import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getElisaWell,
  postElisaWell,
  putElisaWell,
  selectElisaWell,
} from "../../elisa_well/slice";
import { ElisaWellRef, ElisaWellPost } from "../../elisa_well/utils";
import { selectElisaPlate } from "../slice";
import DoneIcon from "@mui/icons-material/Done";
import CancelIcon from "@mui/icons-material/Cancel";
import {
  getAntigens,
  selectAntigen,
  selectAntigens,
} from "../../antigen/slice";
import {
  getNanobodies,
  selectNanobodies,
  selectNanobody,
} from "../../nanobody/slice";
import {
  Autocomplete,
  Button,
  Card,
  CardContent,
  Popover,
  Stack,
  TextField,
} from "@mui/material";
import { partialEq } from "../../utils/state_management";
import { RootState } from "../../store";

type ElisaWellState = ElisaWellRef & Partial<ElisaWellPost>;

export function ElisaWellEditPopover(params: {
  elisaWellRef: ElisaWellRef;
  anchorEl: HTMLElement | null;
  setAnchorEl: (anchorEl: HTMLElement | null) => void;
}) {
  const dispatch = useDispatch();
  const elisaPlate = useSelector(
    selectElisaPlate({
      project: params.elisaWellRef.project,
      number: params.elisaWellRef.plate,
    })
  );
  const initElisaWell = useSelector(selectElisaWell(params.elisaWellRef));
  const initAntigen = useSelector((state: RootState) =>
    initElisaWell ? selectAntigen(initElisaWell?.antigen)(state) : undefined
  );
  const initNanobody = useSelector((state: RootState) =>
    initElisaWell ? selectNanobody(initElisaWell?.nanobody)(state) : undefined
  );
  const [elisaWell, setElisaWell] = useState<ElisaWellState>(
    initElisaWell ? initElisaWell : params.elisaWellRef
  );
  const antigens = useSelector(selectAntigens);
  const nanobodies = useSelector(selectNanobodies);

  useEffect(() => {
    if (
      elisaPlate?.elisawell_set.find((well) =>
        partialEq(well, params.elisaWellRef)
      )
    )
      dispatch(getElisaWell({ elisaWellRef: params.elisaWellRef }));
    dispatch(getAntigens());
    dispatch(getNanobodies());
  }, [dispatch, params, elisaPlate]);

  const updateElisaWell = () => {
    if (Object.values(elisaWell).every((val) => val !== undefined)) {
      if (initElisaWell) {
        dispatch(putElisaWell(elisaWell as ElisaWellRef & ElisaWellPost));
      } else {
        dispatch(postElisaWell(elisaWell as ElisaWellRef & ElisaWellPost));
      }
    }
  };

  return (
    <Popover
      open={Boolean(params.anchorEl)}
      anchorEl={params.anchorEl}
      anchorOrigin={{
        vertical: "center",
        horizontal: "center",
      }}
      transformOrigin={{
        vertical: "center",
        horizontal: "center",
      }}
      onClose={() => params.setAnchorEl(null)}
    >
      <Card>
        <CardContent>
          <Stack spacing={2}>
            <Autocomplete
              renderInput={(params) => (
                <TextField {...params} label="Antigen" sx={{ width: "32ch" }} />
              )}
              options={antigens}
              groupBy={(antigen) => antigen.project}
              getOptionLabel={(antigen) => antigen.name}
              defaultValue={initAntigen}
              onChange={(_, antigen) => {
                setElisaWell({
                  ...elisaWell,
                  antigen: antigen ? antigen : elisaWell.antigen,
                });
              }}
            />
            <Autocomplete
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Nanobody"
                  sx={{ width: "32ch" }}
                />
              )}
              options={nanobodies}
              groupBy={(nanobody) => nanobody.project}
              getOptionLabel={(nanobody) => nanobody.name}
              defaultValue={initNanobody}
              onChange={(_, nanobody) => {
                setElisaWell({
                  ...elisaWell,
                  nanobody: nanobody ? nanobody : elisaWell.nanobody,
                });
              }}
            />
            <TextField
              label="Optical Density"
              type="number"
              defaultValue={elisaWell?.optical_density}
              onChange={(evt) => {
                setElisaWell({
                  ...elisaWell,
                  optical_density: Number(evt.target.value),
                });
              }}
            />
            <Stack direction="row" justifyContent="space-between">
              <Button
                variant="outlined"
                color="error"
                endIcon={<CancelIcon />}
                onClick={() => params.setAnchorEl(null)}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                color="success"
                endIcon={<DoneIcon />}
                onClick={() => {
                  updateElisaWell();
                  params.setAnchorEl(null);
                }}
              >
                Save
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    </Popover>
  );
}
