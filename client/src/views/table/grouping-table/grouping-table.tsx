import { Dispatch, FC, SetStateAction } from 'react';
import { MRT_ColumnDef, MaterialReactTable } from 'material-react-table';
import { MRT_Localization_RU } from 'material-react-table/locales/ru';

interface IMaterialTableProps {
	data: Record<string, any>[];
	columns: MRT_ColumnDef<Record<string, any>>[];
	grouping?: string[];
	isLoading: boolean;
	pagination: { pageIndex: number; pageSize: number };
	setPagination: Dispatch<
		SetStateAction<{
			pageIndex: number;
			pageSize: number;
		}>
	>;
	rowCount: number;
}

const GroupingTable: FC<IMaterialTableProps> = ({ data, columns, isLoading, pagination, setPagination, rowCount }) => {
	return (
		<MaterialReactTable
			state={{
				isLoading,
				pagination
			}}
			enablePagination={true}
			autoResetAll={false}
			rowCount={rowCount}
			localization={MRT_Localization_RU}
			columns={columns}
			data={data}
			manualPagination={true}
			enableColumnActions={false}
			enableColumnFilters={false}
			enableSorting={false}
			enableTopToolbar={false}
			enableColumnResizing={false}
			enableStickyFooter={false}
			enableColumnDragging={false}
			muiToolbarAlertBannerChipProps={{ color: 'primary' }}
			muiTableContainerProps={{ sx: { maxHeight: 700 } }}
			onPaginationChange={setPagination}
		/>
	);
};

export default GroupingTable;
