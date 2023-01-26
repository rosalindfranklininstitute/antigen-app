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


const schemas = {
    "project": projectSchema,
    "llama": llamaSchema
}

export default schemas;