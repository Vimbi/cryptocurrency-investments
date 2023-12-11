import { FC } from 'react';

// ** MUI Imports
import Box from '@mui/material/Box';
import { DataGrid, GridColDef } from '@mui/x-data-grid';

// ** Data Import

interface ITableBasickProps {
	columns: GridColDef[];
	rows: Record<string, any>[];
	page?: number;
	limit?: number;
}

const TableBasic: FC<ITableBasickProps> = ({ columns, rows, limit }) => {
	return (
		<Box>
			<DataGrid
				paginationMode='server'
				autoHeight
				rows={rows}
				columns={columns}
				pageSize={limit}
				disableSelectionOnClick
				rowsPerPageOptions={[10, 20, 50]}
			/>
		</Box>
	);
};

export default TableBasic;
