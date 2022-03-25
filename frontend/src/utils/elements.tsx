import {
  Button,
  IconButton,
  Link,
  Menu,
  MenuItem,
  MenuList,
  TableCell,
  TableRow,
} from "@mui/material";
import { GridRenderCellParams, GridColDef } from "@mui/x-data-grid";
import { ReactNode, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import LinkIcon from "@mui/icons-material/Link";
import { ElisaWellRef } from "../elisa_well/utils";

/**
 *
 * A MUI data grid cell rendered which displays a link to a URI with root and
 * element from the grid column value
 *
 * @param rootURI The root of the URI
 * @returns A MUI link to the composed URI
 */
export function LinkURICellRenderer(
  rootURI: string
): (params: GridRenderCellParams<string>) => JSX.Element {
  const LinkURI = (params: { rootURI: string; elementURI: string }) => {
    return (
      <Link
        component={RouterLink}
        to={`${params.rootURI}/${params.elementURI}`}
      >
        {params.elementURI}
      </Link>
    );
  };

  return (params: GridRenderCellParams<string>) => (
    <LinkURI rootURI={rootURI} elementURI={params.value} />
  );
}

/**
 *
 * A MUI data grid cell renderer which displays a link icon to a URI with root
 * and element from the grid column value
 *
 * @param rootURI The root of the URI
 * @returns A MUI link icon to the composed URI
 */
export function IconLinkCellRenderer(
  rootURI: string
): (params: GridRenderCellParams<string>) => JSX.Element {
  const IconLinkURI = (params: { rootURI: string; elementURI: string }) => {
    return (
      <IconButton
        component={RouterLink}
        to={`${params.rootURI}${params.elementURI}`}
      >
        <LinkIcon />
      </IconButton>
    );
  };

  return (params: GridRenderCellParams<string>) => (
    <IconLinkURI rootURI={rootURI} elementURI={params.value} />
  );
}

/**
 *
 * A MUI data grid column definition which displays a link icon to a URI with
 * root and element from the 'uri' field of array objects
 *
 * @param rootURI The root of the URI
 * @returns A MUI data grid column definition which renders icon links to URIs
 */
export function IconLinkURIGridColDef(rootURI: string): GridColDef {
  return {
    field: "uri",
    headerName: "Link",
    renderCell: IconLinkCellRenderer(rootURI),
    width: 50,
  };
}

/**
 *
 * A MUI data grid well renderer which displays the count of corresponding
 * elisa wells and when clicked on displays a list of links to individual wells
 *
 * @param params The parameters passed by the MUI data grid to facilitate
 * rendering of the cell
 * @returns A button displaying the count of corresponding
 * elisa wells and when clicked on displays a list of links to individual wells
 */
export function WellCellRenderer(
  params: GridRenderCellParams<Array<ElisaWellRef>>
): JSX.Element {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  return (
    <div>
      <Button variant="text" onClick={(evt) => setAnchorEl(evt.currentTarget)}>
        {params.value.length}
      </Button>
      <Menu
        open={Boolean(anchorEl) && Boolean(params.value.length)}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
      >
        <MenuList dense>
          {params.value.map((elisaWellRef, idx) => (
            <MenuItem
              component={RouterLink}
              to={`/elisa_well/${elisaWellRef.project}
              :${elisaWellRef.plate}:${elisaWellRef.location}`}
              key={idx}
            >
              {elisaWellRef.project}:{elisaWellRef.plate}:
              {elisaWellRef.location}
            </MenuItem>
          ))}
        </MenuList>
      </Menu>
    </div>
  );
}

/**
 *
 * A MUI table row consisting of two cells, the left of which containing the
 * passed name and the right of which containing the passed value
 *
 * @param params The name and value used in the table row
 * @param params.name The row name
 * @param params.value The row value
 * @returns A MUI table row containing a name, value pair
 */
export function TableRowPair(params: {
  name: string;
  value: ReactNode;
}): JSX.Element {
  return (
    <TableRow>
      <TableCell>{params.name}:</TableCell>
      <TableCell>{params.value}</TableCell>
    </TableRow>
  );
}
