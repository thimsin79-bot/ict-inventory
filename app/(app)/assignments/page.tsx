import { Badge } from "@/components/Badge";
import { DataTable } from "@/components/DataTable";
import type { Column } from "@/components/DataTable";
import { LiveRefresh } from "@/components/LiveRefresh";
import { PageHeader } from "@/components/PageHeader";
import { Panel } from "@/components/Panel";
import { RecordForm, type FieldDef } from "@/components/RecordForm";
import { returnAssignmentAction, createAssignmentAction } from "@/lib/store/actions";
import { requireUser } from "@/lib/auth/guards";
import { canWrite } from "@/lib/permissions";
import {
  listAssetOptions,
  listAssignments,
  listUserOptions,
} from "@/lib/store";
import { getAssetFormOptions } from "@/lib/store/assets";
import type { AssignmentRecord } from "@/lib/types";

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export default async function AssignmentsPage() {
  const user = await requireUser();
  const writable = canWrite(user.role);

  const [assignments, assetOptions, users, reference] = await Promise.all([
    listAssignments(),
    listAssetOptions(),
    listUserOptions(),
    getAssetFormOptions(),
  ]);

  const fields: FieldDef[] = [
    {
      name: "assetId",
      label: "Asset",
      type: "select",
      required: true,
      full: true,
      options: [
        { value: "", label: "— Choose an asset —" },
        ...assetOptions.map((option) => ({
          value: String(option.id),
          label:
            option.status === "Assigned"
              ? `${option.label} (already assigned)`
              : option.label,
        })),
      ],
    },
    {
      name: "userId",
      label: "Assign To",
      type: "select",
      required: true,
      options: [
        { value: "", label: "— Choose a person —" },
        ...users.map((option) => ({ value: String(option.id), label: option.name })),
      ],
    },
    {
      name: "departmentId",
      label: "Department",
      type: "select",
      options: [
        { value: "", label: "— Not set —" },
        ...reference.departments.map((option) => ({
          value: String(option.id),
          label: option.name,
        })),
      ],
    },
    {
      name: "locationId",
      label: "Location",
      type: "select",
      options: [
        { value: "", label: "— Not set —" },
        ...reference.locations.map((option) => ({
          value: String(option.id),
          label: option.name,
        })),
      ],
    },
    { name: "assignedDate", label: "Assigned Date", type: "date", required: true, defaultValue: today() },
    { name: "notes", label: "Notes", type: "textarea", full: true },
  ];

  const columns: Column<AssignmentRecord>[] = [
    { header: "Asset", render: (row) => row.asset },
    { header: "Assigned To", render: (row) => row.assignee },
    { header: "Department", render: (row) => row.department || "—" },
    { header: "Location", render: (row) => row.location || "—" },
    { header: "Assigned", render: (row) => row.date },
    { header: "Returned", render: (row) => row.returnedDate || "—" },
    { header: "Status", render: (row) => <Badge status={row.status} /> },
    {
      header: "Action",
      render: (row) =>
        row.status === "Assigned" && writable ? (
          <form action={returnAssignmentAction}>
            <input type="hidden" name="id" value={row.id} />
            <button className="btn btn-light" type="submit">
              Return
            </button>
          </form>
        ) : null,
    },
  ];

  return (
    <>
      <LiveRefresh topics={["assignments", "assets"]} />
      <PageHeader
        title="Asset Assignments"
        subtitle="Track assets assigned to staff and departments"
      />

      {writable ? (
        <Panel title="Assign an Asset">
          <RecordForm
            action={createAssignmentAction}
            fields={fields}
            submitLabel="Assign Asset"
            resetAfterSuccess
          />
        </Panel>
      ) : null}

      <Panel title={`${assignments.length} assignment${assignments.length === 1 ? "" : "s"}`}>
        <DataTable
          columns={columns}
          rows={assignments}
          rowKey={(row) => String(row.id)}
          emptyMessage="No assignments recorded yet."
        />
      </Panel>
    </>
  );
}
