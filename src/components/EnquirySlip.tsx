/** The enquiry process printed as a receipt slip with dot leaders and a torn edge. */
const STAGES = [
  {
    heading: "You ask",
    rows: [
      ["The food and quantity you need", "form or WhatsApp"],
      ["Your delivery pin code", "for delivery terms"],
    ],
  },
  {
    heading: "We reply",
    rows: [
      ["Where it comes from", "in writing"],
      ["Batch and packing details", "per batch"],
      ["Price and delivery cost", "for your pin code"],
    ],
  },
  {
    heading: "You decide",
    rows: [
      ["Ask anything else", "as often as you like"],
      ["Confirm, or don't", "no payment before this"],
    ],
  },
];

export function EnquirySlip() {
  return (
    <div className="sheet edge-zigzag w-full max-w-[30rem] px-6 pt-6 md:px-8 md:pt-8 tabular t-body">
      {STAGES.map((stage, i) => (
        <div key={stage.heading} className={i === 0 ? "" : "mt-7"}>
          <h3 className="font-medium t-body">{stage.heading}</h3>
          <ul className="mt-2 space-y-2">
            {stage.rows.map(([what, value]) => (
              <li key={what} className="flex items-end">
                <span>{what}</span>
                <span aria-hidden="true" className="leader" />
                <span className="text-right text-muted">{value}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
      <p className="mt-8 -mx-6 md:-mx-8 px-6 md:px-8 min-h-11 flex items-center justify-between gap-4 bg-ink text-paper">
        <span>You hold the food and its batch details</span>
      </p>
    </div>
  );
}
