const projectSchema = {
  apiUrl: "/project",
  viewUrl: "/projects",
  objectName: "project",
  fields: [
    {
      label: "Short title",
      field: "short_title",
      type: "text",
      showInTable: true,
      tableColWidth: "w-1/5",
    },
    {
      label: "Title",
      field: "title",
      type: "text",
      showInTable: true,
      tableColWidth: "w-2/5",
    },
    {
      label: "Description",
      field: "description",
      type: "textarea",
      showInTable: true,
      tableColWidth: "w-2/5",
    },
    { label: "Added by", field: "added_by", hideOnForm: true },
    { label: "Added date", field: "added_date", hideOnForm: true },
  ],
};

const cohortSchema = {
  apiUrl: "/cohort",
  viewUrl: "/cohorts",
  objectName: "cohort",
  parentObjectName: "llama",
  fields: [
    {
      label: "Cohort no.",
      field: "cohort_num",
      type: "text",
      showInTable: true,
      tableColWidth: "w-1/5",
    },
    {
      label: "Llama",
      field: "llama",
      type: "foreignkey",
      apiUrl: "/llama",
      fkDisplayField: "name",
      showInTable: true,
      tableColWidth: "w-1/5",
    },
    {
      label: "Is Naive?",
      field: "is_naive",
      type: "boolean",
    },
    {
      label: "Immunisation date",
      field: "immunisation_date",
      type: "date",
      showInTable: true,
      tableColWidth: "w-1/5",
    },
    {
      label: "Blood draw date",
      field: "blood_draw_date",
      type: "date",
      showInTable: true,
      tableColWidth: "w-1/5",
    },
    {
      label: "Antigens",
      field: "antigens",
      type: "selectmulti",
      apiUrl: "/antigen",
      fkDisplayField: "preferred_name",
      fkApiField: "antigen_details",
      showInTable: true,
      tableColWidth: "w-1/5",
    },
    { label: "Added by", field: "added_by", hideOnForm: true },
    { label: "Added date", field: "added_date", hideOnForm: true },
  ],
};

const librarySchema = {
  apiUrl: "/library",
  viewUrl: "/libraries",
  objectName: "library",
  parentObjectName: "project",
  fields: [
    {
      label: "Cohort no.",
      field: "cohort",
      type: "foreignkey",
      apiUrl: "/cohort",
      fkDisplayField: "cohort_num_prefixed",
      showInTable: true,
      readOnlyOnEdit: true,
      tableColWidth: "w-1/5",
    },
    {
      label: "Project",
      field: "project",
      type: "foreignkey",
      apiUrl: "/project",
      fkDisplayField: "short_title",
      readOnlyOnEdit: true,
      tableColWidth: "w-4/5",
    },
    { label: "Added by", field: "added_by", hideOnForm: true },
    { label: "Added date", field: "added_date", hideOnForm: true },
  ],
};

const llamaSchema = {
  apiUrl: "/llama",
  viewUrl: "/llamas",
  objectName: "llama",
  fields: [
    {
      label: "Name",
      field: "name",
      type: "text",
      showInTable: true,
      tableColWidth: "w-1/5",
    },
    {
      label: "Notes",
      field: "notes",
      type: "textarea",
      showInTable: true,
      tableColWidth: "w-4/5",
    },
    { label: "Added by", field: "added_by", hideOnForm: true },
    { label: "Added date", field: "added_date", hideOnForm: true },
  ],
};

const antigenSchema = {
  apiUrl: "/antigen",
  viewUrl: "/antigens",
  objectName: "antigen",
  fields: [
    {
      label: "Preferred name",
      field: "preferred_name",
      type: "text",
      formHint: "Leave blank to populate from UniProt",
      showInTable: true,
      tableColWidth: "w-2/5",
    },
    {
      label: "Short name",
      field: "short_name",
      type: "text",
      formHint: "Leave blank to populate from UniProt",
      showInTable: true,
      tableColWidth: "w-2/5",
    },
    {
      label: "UniProt ID",
      field: "uniprot_id",
      type: "text",
      showInTable: true,
      viewPageExtLink: {
        template: "https://www.uniprot.org/uniprotkb/{value}/entry",
        contexts: ["ViewObjectPage"],
      },
      tableColWidth: "w-1/5",
    },
    {
      label: "Sequence",
      field: "sequence",
      type: "text",
      formHint: "Leave blank to populate from UniProt",
    },
    {
      label: "Molecular mass (Da)",
      field: "molecular_mass",
      type: "text",
      formHint: "Leave blank to populate from UniProt",
    },
    { label: "Description", field: "description", type: "textarea" },
    { label: "Epitope", field: "epitope", type: "textarea" },
    {
      label: "ELISAs",
      field: "elisa_plates",
      type: "elisaPlateList",
      hideOnForm: true,
    },
    {
      label: "Sequencing runs",
      field: "sequencing_runs",
      type: "sequencingRunList",
      hideOnForm: true,
    },
    { label: "Added by", field: "added_by", hideOnForm: true },
    { label: "Added date", field: "added_date", hideOnForm: true },
  ],
};

const elisaSchema = {
  apiUrl: "/elisa_plate",
  viewUrl: "/elisas",
  objectName: "elisa",
  parentObjectName: "library",
  fields: [
    {
      label: "Library",
      field: "library",
      type: "foreignkey",
      apiUrl: "/library",
      fkDisplayField: "cohort_cohort_num_prefixed",
      showInTable: true,
      tableColWidth: "w-1/6",
    },
    {
      label: "Antigen",
      field: "antigen",
      type: "foreignkey",
      apiUrl: "/antigen",
      fkDisplayField: "preferred_name",
      showInTable: false,
      showOnViewPage: false,
    },
    {
      label: "Plate file",
      field: "plate_file",
      type: "file",
      showInTable: true,
      tableColWidth: "w-3/6",
    },
    {
      label: "Plate OD Values",
      field: "elisawell_set",
      type: "elisaplate",
      hideOnForm: true,
    },
    { label: "Antibody", field: "antibody", type: "text" },
    { label: "Pan round", field: "pan_round", type: "text" },
    { label: "Added by", field: "added_by", hideOnForm: true },
    {
      label: "Added date",
      field: "added_date",
      hideOnForm: true,
      showInTable: true,
      tableColWidth: "w-2/6",
    },
  ],
};

const sequencingRuns = {
  apiUrl: "/sequencingrun",
  viewUrl: "/sequencing",
  objectName: "sequencing run",
  fields: [
    {
      label: "Added date",
      field: "added_date",
      hideOnForm: true,
      showInTable: true,
      tableColWidth: "w-1/5",
    },
    { label: "Added by", field: "added_by", hideOnForm: true },
    {
      label: "Plate thresholds",
      field: "plate_thresholds",
      type: "platethreshold",
      hideOnForm: true,
    },
    {
      label: "Plate layout",
      field: "wells",
      type: "sequencingplate",
    },
    {
      label: "Notes",
      field: "notes",
      type: "textarea",
      showInTable: true,
      tableColWidth: "w-4/5",
    },
    {
      label: "Sent out date",
      field: "sent_date",
      type: "date",
    },
  ],
};

const nanobodySchema = {
  apiUrl: "/nanobody",
  viewUrl: "/nanobodies",
  objectName: "nanobody",
  fields: [
    {
      label: "Name",
      field: "name",
      type: "text",
      showInTable: true,
      tableColWidth: "w-2/5",
    },
    {
      label: "Sequence",
      field: "sequence",
      type: "text",
      showInTable: true,
      tableColWidth: "w-3/5",
    },
    { label: "Added by", field: "added_by", hideOnForm: true },
    { label: "Added date", field: "added_date", hideOnForm: true },
  ],
};

const schemas = {
  project: projectSchema,
  cohort: cohortSchema,
  llama: llamaSchema,
  antigen: antigenSchema,
  elisa: elisaSchema,
  library: librarySchema,
  sequencing: sequencingRuns,
  nanobody: nanobodySchema,
};

export default schemas;
