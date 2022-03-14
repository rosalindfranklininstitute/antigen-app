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

const LinkURI = (params: { rootURI: string; elementURI: string }) => {
  return (
    <Link component={RouterLink} to={`${params.rootURI}/${params.elementURI}`}>
      {params.elementURI}
    </Link>
  );
};
export const LinkURICellRenderer = (rootURI: string) => {
  return (params: GridRenderCellParams<string>) => (
    <LinkURI rootURI={rootURI} elementURI={params.value} />
  );
};

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

export const IconLinkCellRenderer = (rootURI: string) => {
  return (params: GridRenderCellParams<string>) => (
    <IconLinkURI rootURI={rootURI} elementURI={params.value} />
  );
};

export const IconLinkURIGridColDef = (rootURI: string): GridColDef => {
  return {
    field: "uri",
    headerName: "Link",
    renderCell: IconLinkCellRenderer(rootURI),
    width: 50,
  };
};

export const WellCellRenderer = (
  params: GridRenderCellParams<Array<ElisaWellRef>>
) => {
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
              to={`/elisa_well/${elisaWellRef.project}:${elisaWellRef.plate}:${elisaWellRef.location}`}
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
};

export const TableRowPair = (params: { name: string; value: ReactNode }) => (
  <TableRow>
    <TableCell>{params.name}:</TableCell>
    <TableCell>{params.value}</TableCell>
  </TableRow>
);
