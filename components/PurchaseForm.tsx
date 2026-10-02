"use client";

import { useState } from "react";

import { FormNotice } from "@/components/FormNotice";
import { SubmitButton } from "@/components/SubmitButton";
import { errorFor, useFormAction, type FormAction } from "@/components/useFormAction";

interface ItemRow {
  key: number;
  description: string;
  quantity: string;
  unitPrice: string;
}

let nextKey = 1;

function emptyRow(): ItemRow {
  return { key: nextKey++, description: "", quantity: "1", unitPrice: "0" };
}

export function PurchaseForm({
  action,
  suppliers,
}: {
  action: FormAction;
  suppliers: { id: number; name: string }[];
}) {
  const { state, formAction } = useFormAction(action);
  const [rows, setRows] = useState<ItemRow[]>([emptyRow()]);

  const update = (key: number, patch: Partial<ItemRow>) =>
    setRows((current) => current.map((row) => (row.key === key ? { ...row, ...patch } : row)));

  const derived = rows.reduce(
    (sum, row) => sum + (Number(row.quantity) || 0) * (Number(row.unitPrice) || 0),
    0,
  );

  const err = (field: string) => errorFor(state, field);

  return (
    <form action={formAction} className="formgrid">
      <div className="full">
        <FormNotice state={state} />
      </div>

      <div className="field">
        <label htmlFor="invoice">Invoice Number</label>
        <input id="invoice" name="invoice" required aria-invalid={err("invoice") ? true : undefined} />
        {err("invoice") ? <small className="field-error">{err("invoice")}</small> : null}
      </div>

      <div className="field">
        <label htmlFor="purchaseDate">Purchase Date</label>
        <input
          id="purchaseDate"
          name="purchaseDate"
          type="date"
          required
          defaultValue={new Date().toISOString().slice(0, 10)}
          aria-invalid={err("purchaseDate") ? true : undefined}
        />
        {err("purchaseDate") ? <small className="field-error">{err("purchaseDate")}</small> : null}
      </div>

      <div className="field">
        <label htmlFor="supplierId">Supplier</label>
        <select id="supplierId" name="supplierId" defaultValue="">
          <option value="">— Not set —</option>
          {suppliers.map((supplier) => (
            <option key={supplier.id} value={supplier.id}>
              {supplier.name}
            </option>
          ))}
        </select>
      </div>

      <div className="field">
        <label htmlFor="total">Total</label>
        <input
          id="total"
          name="total"
          type="number"
          step="0.01"
          min="0"
          defaultValue="0"
          readOnly={rows.some((row) => row.description.trim() !== "")}
        />
        <small className="hint">
          Derived from the line items when any are entered.
        </small>
      </div>

      <div className="full">
        <table>
          <thead>
            <tr>
              <th scope="col">Description</th>
              <th scope="col">Qty</th>
              <th scope="col">Unit Price</th>
              <th scope="col">Line Total</th>
              <th scope="col" />
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.key}>
                <td>
                  <input
                    name="itemDescription"
                    value={row.description}
                    onChange={(event) => update(row.key, { description: event.target.value })}
                    placeholder="Item description"
                  />
                </td>
                <td>
                  <input
                    name="itemQuantity"
                    type="number"
                    min="1"
                    value={row.quantity}
                    onChange={(event) => update(row.key, { quantity: event.target.value })}
                  />
                </td>
                <td>
                  <input
                    name="itemUnitPrice"
                    type="number"
                    step="0.01"
                    min="0"
                    value={row.unitPrice}
                    onChange={(event) => update(row.key, { unitPrice: event.target.value })}
                  />
                </td>
                <td className="num">
                  {((Number(row.quantity) || 0) * (Number(row.unitPrice) || 0)).toFixed(2)}
                </td>
                <td>
                  <button
                    className="btn btn-light btn-sm"
                    type="button"
                    onClick={() =>
                      setRows((current) =>
                        current.length === 1 ? current : current.filter((r) => r.key !== row.key),
                      )
                    }
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={3} className="num">
                <b>Total</b>
              </td>
              <td className="num">
                <b>{derived.toFixed(2)}</b>
              </td>
              <td />
            </tr>
          </tfoot>
        </table>
        <button
          className="btn btn-light btn-sm"
          type="button"
          onClick={() => setRows((current) => [...current, emptyRow()])}
        >
          ＋ Add line item
        </button>
      </div>

      <div className="field full">
        <label htmlFor="notes">Notes</label>
        <textarea id="notes" name="notes" rows={3} />
      </div>

      <div className="full formactions">
        <SubmitButton>Record Purchase</SubmitButton>
      </div>
    </form>
  );
}
