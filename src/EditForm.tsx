import { Check, Close } from "@mui/icons-material";
import { Box, IconButton } from "@mui/material";
import { Form } from '@rjsf/mui';
import { UiSchema } from "@rjsf/utils";
import validator from '@rjsf/validator-ajv8';
import { useContext, useEffect, useRef, useState } from "react";
import { DataContext, HeaderContext, RouterContext } from "./App";
import RjsfArrayFieldItemTemplate from "./layout/RjsfArrayFieldItemTemplate";
import RjsfArrayFieldTemplate from "./layout/RjsfArrayFieldTemplate";
import RjsfObjectFieldTemplate from "./layout/RjsfObjectFieldTemplate";
import RjsfTitleFieldTemplate from "./layout/RjsfTitleFieldTemplate";
import { deepClone } from "./util/helpers";

export default function EditForm(props: {id: string}) {
  //const {id} = useParams()
  const {id} = props;
  const provider = useContext(DataContext)!;
  const router = useContext(RouterContext)!;
  const headerConfig = useContext(HeaderContext)!;

  const [schema, setSchema] = useState<any>();
  useEffect(() => {provider.getSchema().then(c => {
    setSchema(c);
  })}, [])

  const [entry, setEntry] = useState<any>();  
  useEffect(() => {provider.getEntry(id!).then(e => {
    // find, clone and set entry
    setEntry(deepClone(e))
  })}, []);

  // customize form actions (submit, discard)
  const formRef = useRef<any>(null);
  useEffect(() => {
    headerConfig.setTitle("Edit " + props.id);
    headerConfig.setElements(
      <>
        <IconButton edge="start" color="inherit" aria-label="menu" sx={{ mr: 2 }} onClick={x => router.navigate(router, "/")}>
          <Close />
        </IconButton>
        <IconButton edge="start" color="inherit" aria-label="menu" sx={{ mr: 2 }} onClick={x => formRef.current.submit()}>
          <Check />
        </IconButton>
      </>)
  }, [provider])

  function submit(entry: any) {
    provider.overwriteRecord(id!, entry);
    router.navigate(router, "/");
  }

  // customize form visualization
  const uiSchema: UiSchema = {
    'ui:submitButtonOptions': {
      norender: true,
    },
    'ui:globalOptions': { copyable: true, orderable: true },
  }

  const templates = {
    ObjectFieldTemplate: RjsfObjectFieldTemplate, 
    ArrayFieldItemTemplate: RjsfArrayFieldItemTemplate,
    ArrayFieldTemplate: RjsfArrayFieldTemplate,
    TitleFieldTemplate: RjsfTitleFieldTemplate
  }

  //https://rjsf-team.github.io/react-jsonschema-form/docs/
  //TODO: show descriptions as Tooltip
  return (<Box sx={{display: "flex", flexDirection: "row", height: "100%", overflowY: "auto"}}>
    <Box flex={1}></Box>
    <Box flex={2} maxWidth={schema && provider.getMetadata(schema, "formWidth") || "500px"} margin="10px">
      <Form  ref={formRef} schema={schema || {}} uiSchema={uiSchema} validator={validator} formData={entry} onChange={e => setEntry(e.formData)} onSubmit={e => submit(e.formData)} templates={templates}/>
    </Box>
    <Box flex={1}></Box>
  </Box>)
}