import { Typography, Grid, Stack, Box } from "@mui/material";
import { ElisaPlateRef } from "../utils";
import { ElisaWellElement } from "./well";
import { Region, useDragSelector } from "./drag_selector";
import { useCallback, useState } from "react";
import { AnchorPosition, ElisaWellsEditPopover } from "./edit_popover";
import { ElisaWellRef } from "../../elisa_well/utils";
import { ElisaWellMapContextProvider } from "./well_map_context";

/**
 *
 * A grid of elisa wells, consisting of a supergrid containing axis labels -
 * numeric columns and alphabetical rows - and a subgrid of elisa well elements
 * contained within a context provider - which obtains elisa well, antigen and
 * nanobody information from the redux store with a dispatch executed to obtain
 * it if unavailable - which display the antigen, nanobody and functionality of
 * a well whilst providing a hover popover which shows textual information and
 * an edit popover which facilitates editing of the entries of an individual
 * elisa well. Additionally a selection region is defined allowing for the
 * selection of numerous elisa wells, producing a collated edit popover when
 * selection ends.
 *
 * @param params An elisa plate reference from which the elisa plate can be
 * retrieved.
 * @param params.elisaPlateRef The elisa plate reference
 * @returns A grid of elisa wells, consisting of a supergrid containing axis
 * labels and a subgrid of elisa well elements
 */
export function ElisaWellMap(params: { elisaPlateRef: ElisaPlateRef }) {
  const [selectedWells, setSelectedWells] = useState<Array<ElisaWellRef>>([]);
  const [editAnchorPosition, setEditAnchorPosition] = useState<
    AnchorPosition | undefined
  >(undefined);
  const { SelectableRegion, SelectableItem } = useDragSelector<ElisaWellRef>();

  const handleSelectionEnd = useCallback(
    (selectedRegions: Map<ElisaWellRef, Region>) => {
      if (selectedRegions.size > 1) {
        setSelectedWells(Array.from(selectedRegions.keys()));
        const bounds = Array.from(selectedRegions.values()).reduce(
          (bounds, region) => ({
            top: Math.min(bounds.top, region.top),
            bottom: Math.max(bounds.bottom, region.bottom),
            left: Math.min(bounds.left, region.left),
            right: Math.max(bounds.right, region.right),
          })
        );
        setEditAnchorPosition({
          top: (bounds.top + bounds.bottom) / 2,
          left: (bounds.left + bounds.right) / 2,
        });
      }
    },
    []
  );

  return (
    <Grid container columns={13} spacing={2}>
      <Grid item xs={1} />
      <Grid item xs={12}>
        <Stack width="100%" direction="row" spacing={2}>
          {Array.from({ length: 12 }, (_, col) => (
            <Typography align="center" key={col} flex={1}>
              {col + 1}
            </Typography>
          ))}
        </Stack>
      </Grid>
      <Grid item xs={1}>
        <Stack height="100%" spacing={2}>
          {Array.from({ length: 8 }, (_, row) => (
            <Box
              key={row}
              flex={1}
              alignItems="center"
              justifyContent="center"
              display="flex"
            >
              <Typography>{String.fromCharCode(row + 65)}</Typography>
            </Box>
          ))}
        </Stack>
      </Grid>
      <Grid item xs={12}>
        <ElisaWellMapContextProvider elisaPlateRef={params.elisaPlateRef}>
          <SelectableRegion onSelectionEnd={handleSelectionEnd}>
            <Grid container columns={12} spacing={2}>
              {Array.from({ length: 8 }, (_, row) =>
                Array.from({ length: 12 }, (_, col) => {
                  const wellRef = {
                    project: params.elisaPlateRef.project,
                    plate: params.elisaPlateRef.number,
                    location: row * 12 + col + 1,
                  };
                  return (
                    <Grid item xs={1} key={wellRef.location}>
                      <SelectableItem tag={wellRef}>
                        <ElisaWellElement elisaWellRef={wellRef} />
                      </SelectableItem>
                    </Grid>
                  );
                })
              ).flat()}
            </Grid>
            <ElisaWellsEditPopover
              elisaWellRefs={selectedWells}
              anchorPosition={editAnchorPosition}
              setAnchorPosition={setEditAnchorPosition}
            />
          </SelectableRegion>
        </ElisaWellMapContextProvider>
      </Grid>
    </Grid>
  );
}