import { DataTableFilter } from "@/components/data-table-filter";
import { useView } from "@/contexts/ViewContext";

export const ViewTool = () => {
  const view = useView();

  return (
    <div className="grow">
      <DataTableFilter
        filters={view.filters}
        columns={view.columns}
        actions={view.actions}
        strategy={view.strategy}
      />
    </div>
  );
};
