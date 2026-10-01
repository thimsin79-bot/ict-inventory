import { PageHeader } from "@/components/PageHeader";
import { Panel } from "@/components/Panel";
import { SettingsForm } from "@/components/SettingsForm";

export default function SettingsPage() {
  return (
    <>
      <PageHeader title="Settings" subtitle="System configuration" />
      <Panel>
        <SettingsForm />
      </Panel>
    </>
  );
}
