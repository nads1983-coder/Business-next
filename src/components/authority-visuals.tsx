export function FilingTimeline() {
  const steps = [
    ["Start", "Company or business begins"],
    ["Prepare", "Collect records before dates arrive"],
    ["File", "Send required return or statement"],
    ["Pay", "Pay tax or fees where relevant"],
    ["Review", "Save receipts and update reminders"]
  ];

  return (
    <svg
      role="img"
      aria-labelledby="filing-timeline-title filing-timeline-desc"
      viewBox="0 0 900 180"
      className="h-auto w-full"
    >
      <title id="filing-timeline-title">Business filing timeline</title>
      <desc id="filing-timeline-desc">
        A five-step timeline from business start through preparation, filing, payment and review.
      </desc>
      <line x1="80" y1="72" x2="820" y2="72" stroke="currentColor" strokeOpacity="0.25" strokeWidth="4" />
      {steps.map(([label, note], index) => {
        const x = 80 + index * 185;
        return (
          <g key={label}>
            <circle cx={x} cy="72" r="24" className="fill-primary" />
            <text x={x} y="78" textAnchor="middle" className="fill-primary-foreground text-[20px] font-semibold">
              {index + 1}
            </text>
            <text x={x} y="126" textAnchor="middle" className="fill-foreground text-[18px] font-semibold">
              {label}
            </text>
            <text x={x} y="152" textAnchor="middle" className="fill-muted-foreground text-[14px]">
              {note}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export function VatDecisionFlow() {
  return (
    <svg
      role="img"
      aria-labelledby="vat-flow-title vat-flow-desc"
      viewBox="0 0 760 260"
      className="h-auto w-full"
    >
      <title id="vat-flow-title">VAT registration decision flow</title>
      <desc id="vat-flow-desc">
        A simple flow showing that taxable turnover, threshold checks and official guidance shape VAT registration decisions.
      </desc>
      <g className="fill-card stroke-border">
        <rect x="30" y="35" width="190" height="70" rx="8" />
        <rect x="285" y="35" width="190" height="70" rx="8" />
        <rect x="540" y="35" width="190" height="70" rx="8" />
        <rect x="285" y="155" width="190" height="70" rx="8" />
      </g>
      <g className="stroke-primary" strokeWidth="3" fill="none">
        <path d="M220 70h65" />
        <path d="M475 70h65" />
        <path d="M380 105v50" />
      </g>
      <g className="fill-foreground text-[16px] font-semibold">
        <text x="125" y="66" textAnchor="middle">Taxable turnover</text>
        <text x="380" y="66" textAnchor="middle">Check threshold</text>
        <text x="635" y="66" textAnchor="middle">Register if required</text>
        <text x="380" y="186" textAnchor="middle">Check GOV.UK</text>
      </g>
      <g className="fill-muted-foreground text-[13px]">
        <text x="125" y="88" textAnchor="middle">Look at taxable supplies</text>
        <text x="380" y="88" textAnchor="middle">Use official VAT guidance</text>
        <text x="635" y="88" textAnchor="middle">Plan invoices and returns</text>
        <text x="380" y="208" textAnchor="middle">Do not rely on estimates alone</text>
      </g>
    </svg>
  );
}
