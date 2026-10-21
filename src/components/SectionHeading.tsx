export function SectionHeading({
  id,
  eyebrow,
  title,
  intro,
  align = "left",
  light = false,
  action,
}: {
  id: string;
  eyebrow?: string;
  title: string;
  intro?: string;
  align?: "left" | "center";
  light?: boolean;
  action?: React.ReactNode;
}) {
  return (
    <div
      className={`reveal flex flex-col gap-6 ${align === "center" ? "items-center text-center" : "md:flex-row md:items-end md:justify-between"}`}
    >
      <div className={align === "center" ? "max-w-2xl" : "max-w-2xl"}>
        {eyebrow && <p className={`eyebrow ${light ? "!text-ghee" : ""}`}>{eyebrow}</p>}
        <h2 id={id} className={`h-section mt-3 ${light ? "text-white" : ""}`}>
          {title}
        </h2>
        {intro && <p className={`lead mt-4 ${light ? "!text-white/75" : ""}`}>{intro}</p>}
      </div>
      {action}
    </div>
  );
}
