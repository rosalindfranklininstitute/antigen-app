const projectSchema = {
    "apiUrl": "/project",
    "viewUrl": "/projects",
    "objectName": "project",
    "fields": [{"label": "Short title", "field": "short_title", "type": "text", "showInTable": true}, 
               {"label": "Title", "field": "title", "type": "text", "showInTable": true},
               {"label": "Description", "field": "description", "type": "textarea", "showInTable": true},
               {"label": "Added by", "field": "added_by", "hideOnForm": true},
               {"label": "Added date", "field": "added_date", "hideOnForm": true}
              ]
}

const llamaSchema = {
    "apiUrl": "/llama",
    "viewUrl": "/llamas",
    "objectName": "llama",
    "fields": [{"label": "Name", "field": "name", "type": "text", "showInTable": true},
               {"label": "Notes", "field": "notes", "type": "textarea", "showInTable": true},
               {"label": "Added by", "field": "added_by", "hideOnForm": true},
               {"label": "Added date", "field": "added_date", "hideOnForm": true}               
              ]
}

const antigenSchema = {
    "apiUrl": "/antigen",
    "viewUrl": "/antigens",
    "objectName": "antigen",
    "fields": [{"label": "Uniprot ID", "field": "uniprot_id", "type": "text", "showInTable": true},
               {"label": "Preferred name", "field": "preferred_name", "type": "text", "showInTable": true},
               {"label": "Sequence", "field": "sequence", "type": "text"},
               {"label": "Molecular mass", "field": "molecular_mass", "type": "text"},
               {"label": "Description", "field": "description", "type": "textarea"},
               {"label": "Epitope", "field": "epitope", "type": "textarea"},
               {"label": "Added by", "field": "added_by", "hideOnForm": true},
               {"label": "Added date", "field": "added_date", "hideOnForm": true}
              ]
}


const schemas = {
    "project": projectSchema,
    "llama": llamaSchema,
    "antigen": antigenSchema
}

export default schemas;