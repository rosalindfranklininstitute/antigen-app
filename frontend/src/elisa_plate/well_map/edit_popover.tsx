import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getElisaWell,
  postElisaWell,
  putElisaWell,
  selectElisaWell,
} from "../../elisa_well/slice";
import { ElisaWellKey, ElisaWellPost } from "../../elisa_well/utils";
import { selectElisaPlate } from "../slice";
import DoneIcon from "@mui/icons-material/Done";
import CancelIcon from "@mui/icons-material/Cancel";
import { getAntigens, selectAntigens } from "../../antigen/slice";
import { getNanobodies, selectNanobodies } from "../../nanobody/slice";
import {
  Autocomplete,
  Button,
  Card,
  CardContent,
  Popover,
  Stack,
  TextField,
} from "@mui/material";

type ElisaWellState = ElisaWellKey & Partial<ElisaWellPost>;

export function ElisaWellEditPopover(params: {
  wellKey: ElisaWellKey;
  anchorEl: HTMLElement | null;
  setAnchorEl: (anchorEl: HTMLElement | null) => void;
}) {
  const dispatch = useDispatch();
  const elisaPlate = useSelector(selectElisaPlate(params.wellKey.plate));
  const initElisaWell = useSelector(selectElisaWell(params.wellKey));
  const [elisaWell, setElisaWell] = useState<ElisaWellState>(
    initElisaWell ? initElisaWell : params.wellKey
  );
  const antigens = useSelector(selectAntigens);
  const nanobodies = useSelector(selectNanobodies);

  useEffect(() => {
    if (
      elisaPlate?.plate_elisa_wells.find(
        (location) => location === params.wellKey.location
      )
    )
      dispatch(getElisaWell(params.wellKey));
    dispatch(getAntigens());
    dispatch(getNanobodies());
  }, [dispatch, params, elisaPlate]);

  const updateElisaWell = () => {
    if (Object.values(elisaWell).every((val) => val !== undefined)) {
      if (initElisaWell) {
        dispatch(putElisaWell(elisaWell as ElisaWellPost));
      } else {
        dispatch(postElisaWell(elisaWell as ElisaWellPost));
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
              getOptionLabel={(antigen) => antigen.name}
              defaultValue={antigens.find(
                (antigen) => antigen.uuid === elisaWell?.antigen
              )}
              onChange={(_, antigen) => {
                setElisaWell({
                  ...elisaWell,
                  antigen: antigen ? antigen.uuid : elisaWell.antigen,
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
              getOptionLabel={(nanobody) => nanobody.name}
              defaultValue={nanobodies.find(
                (nanobody) => nanobody.uuid === elisaWell?.nanobody
              )}
              onChange={(_, nanobody) => {
                setElisaWell({
                  ...elisaWell,
                  nanobody: nanobody ? nanobody.uuid : elisaWell.nanobody,
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
