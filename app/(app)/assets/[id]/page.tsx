import Link from "next/link";
import { notFound } from "next/navigation";

import { Badge } from "@/components/Badge";
import { Money } from "@/components/Formatted";
import { LiveRefresh } from "@/components/LiveRefresh";
import { PageHeader } from "@/components/PageHeader";
import { deleteAssetAction } from "@/app/(app)/assets/actions";
import { requireUser } from "@/lib/auth/guards";
import { EM_DASH } from "@/lib/format";
import { money, optionalDay, optionalMoney } from "@/lib/format-server";
import { canWrite } from "@/lib/permissions";
import { getAssetById } from "@/lib/store/assets";
import { getAssetTimeline } from "@/lib/store/timeline";

function Detail({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="detail">
      <dt>{label}</dt>
      <dd>{value === "" ? EM_DASH : value}</dd>
    </div>
  );
}

export default async function AssetDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [user, { id }] = await Promise.all([requireUser(), params]);
  const assetId = Number(id);

  if (!Number.isFinite(assetId)) {
    notFound();
  }

  const [asset, timeline] = await Promise.all([
    getAssetById(assetId),
    getAssetTimeline(assetId),
  ]);

  if (!asset) {
    notFound();
  }

  const writable = canWrite(user.role);

  return (
    <>
      <LiveRefresh
        topics={["assets", "assignments", "transfers", "maintenance", "broken", "audit"]}
      />
      <PageHeader
        title={asset.code}
        subtitle={`${asset.category} · ${asset.brand} ${asset.model}`}
        action={
          <>
            <Link className="btn btn-light" href="/assets">
              ← Back
            </Link>
            {writable ? (
              <Link className="btn btn-primary" href={`/assets/${asset.id}/edit`}>
                Edit Asset
              </Link>
            ) : null}
          </>
        }
      />

      <div className="panel">
        <div className="panel-head">
          <h2>Asset Details</h2>
          <Badge status={asset.status} />
        </div>
        <div className="panel-body">
          <dl className="details">
            <Detail label="Asset Code" value={asset.code} />
            <Detail label="Category" value={asset.category} />
            <Detail label="Brand" value={asset.brand} />
            <Detail label="Model" value={asset.model} />
            <Detail label="Serial Number" value={asset.serial} />
            <Detail label="Status" value={asset.status} />
            <Detail label="Condition" value={asset.condition} />
            <Detail label="Availability" value={asset.availability} />
            <Detail label="Location" value={asset.location} />
            <Detail label="Department" value={asset.department} />
            <Detail label="Supplier" value={asset.supplier} />
            <Detail label="Purchase Price" value={await optionalMoney(asset.purchasePrice)} />
            <Detail label="Purchase Date" value={await optionalDay(asset.purchaseDate)} />
            <Detail label="Registered On" value={await optionalDay(asset.createdAt.slice(0, 10))} />
            <Detail label="Current Value" value={await money(asset.purchasePrice ?? 0)} />
            <Detail label="Remarks" value={asset.remarks} />
          </dl>
        </div>
      </div>

      <div className="panel">
        <div className="panel-head">
          <h2>Assignment History</h2>
        </div>
        <div className="panel-body">
          {timeline.assignments.length === 0 ? (
            <p className="empty">This asset has never been assigned.</p>
          ) : (
            <div className="tablewrap">
              <table>
                <thead>
                  <tr>
                    <th scope="col">Assignee</th>
                    <th scope="col">Department</th>
                    <th scope="col">Assigned</th>
                    <th scope="col">Returned</th>
                    <th scope="col">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {timeline.assignments.map((row) => (
                    <tr key={row.id}>
                      <td>{row.assignee}</td>
                      <td>{row.department || EM_DASH}</td>
                      <td>{row.date}</td>
                      <td>{row.returnedDate || EM_DASH}</td>
                      <td>
                        <Badge status={row.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <div className="panel">
        <div className="panel-head">
          <h2>Movement &amp; Service</h2>
        </div>
        <div className="panel-body">
          {timeline.transfers.length === 0 && timeline.maintenance.length === 0 ? (
            <p className="empty">No transfers or maintenance recorded.</p>
          ) : (
            <div className="tablewrap">
              <table>
                <thead>
                  <tr>
                    <th scope="col">Type</th>
                    <th scope="col">Detail</th>
                    <th scope="col">Date</th>
                    <th scope="col">By</th>
                    <th scope="col">Cost</th>
                    <th scope="col">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {timeline.transfers.map((row) => (
                    <tr key={`t${row.id}`}>
                      <td>Transfer</td>
                      <td>
                        {row.from} → {row.to}
                      </td>
                      <td>{row.date}</td>
                      <td>{row.by}</td>
                      <td className="num">{EM_DASH}</td>
                      <td>
                        <Badge status={row.status} />
                      </td>
                    </tr>
                  ))}
                  {timeline.maintenance.map((row) => (
                    <tr key={`m${row.id}`}>
                      <td>Maintenance</td>
                      <td>{row.problem}</td>
                      <td>{row.date}</td>
                      <td>{row.technician}</td>
                      <td className="num">
                        <Money value={row.cost} />
                      </td>
                      <td>
                        <Badge status={row.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <div className="panel">
        <div className="panel-head">
          <h2>Audits</h2>
        </div>
        <div className="panel-body">
          {timeline.audits.length === 0 ? (
            <p className="empty">This asset has not been audited yet.</p>
          ) : (
            <div className="tablewrap">
              <table>
                <thead>
                  <tr>
                    <th scope="col">Date</th>
                    <th scope="col">Auditor</th>
                    <th scope="col">Result</th>
                    <th scope="col">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {timeline.audits.map((row) => (
                    <tr key={row.id}>
                      <td>{row.auditDate}</td>
                      <td>{row.auditor}</td>
                      <td>
                        <Badge status={row.result} />
                      </td>
                      <td>{row.notes || EM_DASH}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {writable ? (
        <div className="panel danger">
          <div className="panel-head">
            <h2>Danger Zone</h2>
          </div>
          <div className="panel-body">
            <p>
              Deleting {asset.code} also removes its assignments, transfers, maintenance,
              audit and damage records. This cannot be undone.
            </p>
            <form action={deleteAssetAction}>
              <input type="hidden" name="id" value={asset.id} />
              <button className="btn btn-danger" type="submit">
                Delete Asset
              </button>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
