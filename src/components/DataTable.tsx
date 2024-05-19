import { Box, CircularProgress } from "@mui/material";
import { DataType, Table, useTable } from 'ka-table';
import { FilteringMode, SortDirection, SortingMode } from 'ka-table/enums';
import { Column } from 'ka-table/models';
import { useContext, useMemo, useState } from "react";

import "ka-table/style.css";
import { RouterContext } from "../App";
import { getPropertyByPath, onlyUnique } from "../util/helpers";

export function nestedPropertyRenderer(defaultValue: string = "", paddingRight: string = '0') {
  return (prop: any) => {
    const value = getPropertyByPath(prop.rowData, prop.column.key)
    return <div style={{ paddingRight: paddingRight }}>{value || defaultValue}</div>
  }
}

export default function DataTable(props: { data: any[], columns: any[], keyAttr: string, treeGroupKeyAttr?: string, navigator?: (any) => string, searchText?: string, selectedRows?: any[] }) {

  const { data, columns, keyAttr, treeGroupKeyAttr, navigator, selectedRows } = props;
  const [loading, setLoading] = useState(true)
  const router = useContext(RouterContext)!;
  const dataTable = useTable();

  if (columns && data && data.length > 0 && loading) setLoading(false);

  function getDistinctColValues(prop: string): any[] {
    return data.map(d => getPropertyByPath(d, prop)).filter(onlyUnique).filter(x => x);
  }
  function inferDataType(prop: string) {
    const obj = data.find(d => getPropertyByPath(d, prop))
    const v = getPropertyByPath(obj, prop);
    switch (typeof v) {
      case 'object': {
        if (v instanceof Date) return DataType.Date;
        return DataType.Object;
      }
      case 'number': return DataType.Number;
      case 'boolean': return DataType.Boolean;
      case 'string': return DataType.String;
      default: return DataType.String;
    }
  }
  const tableColumns: Column[] = useMemo(() => {
    if (loading) return [];
    const cols = columns.map((c,idx) => {
      var col: Column;
      const distinctValues = getDistinctColValues(c.property || c);
      if (typeof c === 'object') {
        col = {
          key: c.property,
          title: c.title,
          dataType: c.dataType || inferDataType(c.property),
        }
        if (c.width) col.width = c.width;
        if (c.sortDirection) col.sortDirection = c.sortDirection;
        if (c.style) col.style = c.style;
      } else {
        col = {
          key: c,
          title: c,
          dataType: inferDataType(c),
        }
      }
      col.colGroup = { style: { minWidth: 50 } }
      col.isFilterable = distinctValues.length <= 15;
      if (col.isFilterable) col.headerFilterListItems = () => distinctValues;
      if (idx==0) col.sortDirection = SortDirection.Ascend;
      return col;
    })
    return cols;
  }, [columns, loading]);

  const tableColumnsRenderer = useMemo(() => {
    const renderers = {}
    columns.filter(c => typeof c === 'object' && c.renderer)
      .forEach(c => renderers[c.property] = c.renderer);
    return renderers;
  }, [columns]);

  const tableHeadColumnsRenderer = useMemo(() => {
    const renderers = {}
    columns.filter(c => typeof c === 'object' && c.headRenderer)
      .forEach(c => renderers[c.property] = c.headRenderer);
    return renderers;
  }, [columns]);

  if (loading) return (<CircularProgress />);

  return (
    <Box sx={{
      flex: 1, minHeight: 0, width: '100%', height: '100%',
      fontFamily: 'Roboto,Helvetica,Arial,sans-serif', fontWeight: '400', fontSize: '0.875rem', // defaults from MuiTypography-root
      '& ka-table-wrapper': { overflow: 'auto' },
      '& .ka-thead-cell-content, .ka-cell-text': { whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
      '& .ka-row': (props.navigator ? { cursor: 'pointer', '&:hover': { backgroundColor: '#f0f0ef'}} : {}),
      '& .ka-thead-background': { backgroundColor: 'white' },
      '& .ka-thead-cell': { color: 'primary', zIndex: '99', fontWeight: '600', height: '25px', paddingTop: '7px', paddingBottom: '7px' },
      '& .ka-cell, .ka-thead-cell': { paddingLeft: '7px', paddingRight: '7px' },
      '& .ka-cell': { paddingTop: '4px', paddingBottom: '4px' },
      '& .ka-cell-text': { height: '25px' },
      '& .ka-thead-cell-resize': { left: '3px' },
      '& .ka': { height: '100%', width: '100%' }
    }}>
      <Table
        table={dataTable}
        rowKeyField={keyAttr}
        selectedRows={selectedRows}
        treeGroupKeyField={treeGroupKeyAttr}
        treeGroupsExpanded={[]}
        data={data}
        columns={tableColumns}
        columnResizing={true}
        sortingMode={SortingMode.Single}
        virtualScrolling={{enabled: true}}
        childComponents={{
          dataRow: {
            elementAttributes: (row) => {
              return ({
              onClick: (e, data) => {
                if (navigator) router.navigate(router, navigator(data.childProps.rowData))
              },
              style: {backgroundColor: (row.selectedRows.includes(row.rowData[row.rowKeyField]) ? "#ffcccb" : undefined)}
            });
          }},
          cellText: {
            content: (prop) => {
              if (tableColumnsRenderer && tableColumnsRenderer[prop.column.key]) return tableColumnsRenderer[prop.column.key](prop);
            }
          },
          headCellContent: {
            content: (prop) => {
              if (tableHeadColumnsRenderer && tableHeadColumnsRenderer[prop.column.key]) {
                return tableHeadColumnsRenderer[prop.column.key](prop);
              }
            }
          },
          tableWrapper: {
            elementAttributes: () => ({
              style: { maxHeight: '100%' }
            })
          }
        }}
        sort={({ column }) => {
          if (column.key.endsWith('_at')) { // special rule for datetime (following naming convention that attributes end with '_at')
            return (a, b) => {
              var result = a === b ? 0
                : !a ? 1
                  : !b ? -1
                    : a < b ? -1 : 1;
              return result * (column.sortDirection === SortDirection.Ascend ? 1 : -1) as (0 | 1 | -1)
            }
          }
        }}
        searchText={props.searchText}
        filteringMode={FilteringMode.HeaderFilter}
        noData={{ text: "No data found", hideHeader: true }}
      />
    </Box>
  )
}