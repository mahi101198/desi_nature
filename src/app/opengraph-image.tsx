import { ImageResponse } from "next/og";

export const alt = "Desi Nature: ghee, honey and grains by enquiry, and a journal on keeping them well";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const folders = ["#2f5d3a", "#d6c39c", "#c98a2b", "#e4b54e"];

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", background: "#2f2620", color: "#f2ebe6", position: "relative" }}>
        <div style={{ display: "flex", justifyContent: "center", marginTop: 90, fontSize: 132, fontStyle: "italic", letterSpacing: -4 }}>
          Desi Nature
        </div>
        <div style={{ display: "flex", justifyContent: "center", marginTop: 18, fontSize: 36 }}>
          Ghee, honey and grains, by enquiry
        </div>
        {folders.map((c, i) => (
          <div key={c} style={{ position: "absolute", left: 84, right: 84, top: 380 + i * 48, bottom: 0, background: c, display: "flex" }} />
        ))}
        <div style={{ position: "absolute", left: 84, right: 84, top: 380 + folders.length * 48, bottom: 0, background: "#f7f3f1" }} />
      </div>
    ),
    size,
  );
}
