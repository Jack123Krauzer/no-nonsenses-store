"use client";
import { useState } from "react";
import styles from "./SizeChart.module.css";
const chart = [
  { size: "S", width: 48.3, length: 68.6 },
  { size: "M", width: 50.8, length: 71.1 },
  { size: "L", width: 53.3, length: 73.7 },
  { size: "XL", width: 55.9, length: 76.2 },
  { size: "XXL", width: 58.4, length: 78.7 },
];
export default function SizeChart({
  selectedSize,
  concept = false,
}: {
  selectedSize?: string;
  concept?: boolean;
}) {
  const [unit, setUnit] = useState<"cm" | "in">("cm");
  const [yourWidth, setYourWidth] = useState<number | null>(null);
  const factor = unit === "cm" ? 1 : 1 / 2.54;
  const format = (value: number) =>
    (Math.round(value * factor * 10) / 10).toFixed(1);
  return (
    <section className={styles.chart} aria-labelledby="size-chart-title">
      <div className={styles.heading}>
        <h2 id="size-chart-title">Size chart & comparison</h2>
        <div role="group" aria-label="Measurement units">
          {(["cm", "in"] as const).map((value) => (
            <button
              type="button"
              key={value}
              aria-pressed={unit === value}
              onClick={() => setUnit(value)}
            >
              {value}
            </button>
          ))}
        </div>
      </div>
      <p className={styles.notice}>
        <strong>Illustrative tee reference.</strong>{" "}
        {concept
          ? "These are example measurements for comparing the concept sizes; final garment measurements will be confirmed before launch."
          : "A verified size chart has not been supplied for this product. These example tee measurements are not its specifications; confirm the actual measurements before ordering."}
      </p>
      <label className={styles.compare}>
        Compare with your favourite tee’s flat chest width ({unit})
        <input
          type="number"
          min="0"
          step="0.1"
          inputMode="decimal"
          placeholder={unit === "cm" ? "e.g. 50.8" : "e.g. 20"}
          value={yourWidth === null ? "" : Number(format(yourWidth))}
          onChange={(event) =>
            setYourWidth(
              event.target.value === ""
                ? null
                : Number(event.target.value) / factor,
            )
          }
        />
      </label>
      <div className={styles.scroll}>
        <table>
          <caption>
            Example flat garment measurements in{" "}
            {unit === "cm" ? "centimetres" : "inches"}
          </caption>
          <thead>
            <tr>
              <th scope="col">Size</th>
              <th scope="col">Chest width ({unit})</th>
              <th scope="col">Length ({unit})</th>
              {yourWidth !== null ? (
                <th scope="col">Chest vs yours ({unit})</th>
              ) : null}
            </tr>
          </thead>
          <tbody>
            {chart.map((row) => (
              <tr
                key={row.size}
                data-selected={selectedSize?.toUpperCase() === row.size}
              >
                <th scope="row">
                  {row.size}
                  {selectedSize?.toUpperCase() === row.size ? (
                    <span className={styles.sr}> — selected</span>
                  ) : null}
                </th>
                <td>{format(row.width)}</td>
                <td>{format(row.length)}</td>
                {yourWidth !== null ? (
                  <td>
                    {row.width - yourWidth > 0 ? "+" : ""}
                    {format(row.width - yourWidth)}
                  </td>
                ) : null}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className={styles.help}>
        Lay a tee flat without stretching it. Measure straight across from
        armpit to armpit for chest width, and from the high shoulder point to
        the hem for length. Chest width is half the garment circumference.
      </p>
    </section>
  );
}
