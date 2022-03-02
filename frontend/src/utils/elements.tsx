import {
  Button,
  IconButton,
  Link,
  Menu,
  MenuItem,
  MenuList,
} from "@mui/material";
import { GridRenderCellParams, GridColDef } from "@mui/x-data-grid";
import { useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import LinkIcon from "@mui/icons-material/Link";

const LinkUUID = (params: { rootURI: string; UUID: string }) => {
  return (
    <Link component={RouterLink} to={`${params.rootURI}${params.UUID}`}>
      {params.UUID}
    </Link>
  );
};
export const LinkUUIDCellRenderer = (rootURI: string) => {
  return (params: GridRenderCellParams<string>) => (
    <LinkUUID rootURI={rootURI} UUID={params.value} />
  );
};

const IconLinkUUID = (params: { rootURI: string; UUID: string }) => {
  return (
    <IconButton component={RouterLink} to={`${params.rootURI}${params.UUID}`}>
      <LinkIcon />
    </IconButton>
  );
};

export const IconLinkUUIDCellRenderer = (rootURI: string) => {
  return (params: GridRenderCellParams<string>) => (
    <IconLinkUUID rootURI={rootURI} UUID={params.value} />
  );
};

export const IconLinkUUIDGridColDef = (rootURI: string): GridColDef => {
  return {
    field: "uuid",
    headerName: "Link",
    renderCell: IconLinkUUIDCellRenderer(rootURI),
    width: 50,
  };
};

export const WellCellRenderer = (params: GridRenderCellParams<string[]>) => {
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
          {params.value.map((well, idx) => (
            <MenuItem component={RouterLink} to={`/elisa_well/${well}`}>
              {well}
            </MenuItem>
          ))}
        </MenuList>
      </Menu>
    </div>
  );
};
