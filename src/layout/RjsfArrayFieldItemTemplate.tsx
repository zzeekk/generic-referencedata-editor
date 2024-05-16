import { CSSProperties } from 'react';
import { ArrayFieldTemplateItemType, FormContextType, RJSFSchema, StrictRJSFSchema } from '@rjsf/utils';
import { Box, Paper } from '@mui/material';

/**
 * An ArrayFieldItemTemplate with improved button layout
 */
export default function RjsfArrayFieldItemTemplate(props: ArrayFieldTemplateItemType) {
  const { children, className, disabled, hasToolbar, hasMoveDown, hasMoveUp, hasRemove, hasCopy, index, onCopyIndexClick, onDropIndexClick, onReorderClick, readonly, registry, uiSchema,} = props;
  const { CopyButton, MoveDownButton, MoveUpButton, RemoveButton } = registry.templates.ButtonTemplates;
  const btnStyle: CSSProperties = { flex: 0, paddingLeft: 6, paddingRight: 6, fontWeight: 'bold',};
  return (
    <Paper className={className} sx={{padding: "5px 10px", marginTop: "5px", marginBottom: "10px"}}>
      <div className={hasToolbar ? 'col-xs-9' : 'col-xs-12'}>{children}</div>
      {hasToolbar && (
        <div className='col-xs-3 array-item-toolbox'>
          <div className='btn-group' style={{ display: 'flex', justifyContent: 'space-around', }}>
            <Box flex="1"/>
            {hasCopy && <CopyButton style={btnStyle} disabled={disabled || readonly} onClick={onCopyIndexClick(index)} uiSchema={uiSchema} registry={registry}/>}
            {(hasMoveUp || hasMoveDown) && <MoveUpButton style={btnStyle} disabled={disabled || readonly || !hasMoveUp} onClick={onReorderClick(index, index - 1)} uiSchema={uiSchema} registry={registry}/>}
            {(hasMoveUp || hasMoveDown) && <MoveDownButton style={btnStyle} disabled={disabled || readonly || !hasMoveDown} onClick={onReorderClick(index, index + 1)} uiSchema={uiSchema} registry={registry}/>}
            {hasRemove && <RemoveButton style={btnStyle} disabled={disabled || readonly} onClick={onDropIndexClick(index)} uiSchema={uiSchema} registry={registry} />}
          </div>
        </div>
      )}
    </Paper>
  );
}
