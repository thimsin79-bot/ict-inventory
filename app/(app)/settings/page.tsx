import { PageHeader } from "@/components/PageHeader";
import { Panel } from "@/components/Panel";
import { RecordForm, type FieldDef } from "@/components/RecordForm";
import { requireAdministrator } from "@/lib/auth/guards";
import { getSettings } from "@/lib/store";
import { updateSettingsAction } from "@/lib/store/reference-actions";
import { CURRENCY_OPTIONS, DATE_FORMAT_OPTIONS } from "@/lib/store/settings";

export default async function SettingsPage() {
  await requireAdministrator();
  const settings = await getSettings();

  const fields: FieldDef[] = [
    {
      name: "organizationName",
      label: "Organization Name",
      defaultValue: settings.organizationName,
      full: true,
    },
    {
      name: "assetCodePrefix",
      label: "Asset Code Prefix",
      defaultValue: settings.assetCodePrefix,
      hint: "New asset codes are generated with this prefix followed by a 5-digit number.",
    },
    {
      name: "currency",
      label: "Currency",
      type: "select",
      defaultValue: settings.currency,
      options: CURRENCY_OPTIONS.map((currency) => ({ value: currency, label: currency })),
    },
    {
      name: "dateFormat",
      label: "Date Format",
      type: "select",
      defaultValue: settings.dateFormat,
      options: DATE_FORMAT_OPTIONS.map((format) => ({ value: format.value, label: format.label })),
    },
  ];

  return (
    <>
      <PageHeader
        title="Settings"
        subtitle="System-wide configuration for the inventory"
      />
      <Panel title="General Settings">
        <RecordForm
          action={updateSettingsAction}
          fields={fields}
          submitLabel="Save Settings"
        />
      </Panel>
      <div className="panel">
        <div className="panel-head">
          <h2>Database</h2>
        </div>
        <div className="panel-body">
          <p className="hint">
            This installation stores all data in PostgreSQL. Use
            <code> npm run db:push </code> to apply schema changes and
            <code> npm run db:reset </code> to reseed demo data.
          </p>
        </div>
      </div>
    </>
  );
}
