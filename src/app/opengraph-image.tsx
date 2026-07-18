import { ImageResponse } from "next/og";
import { productConfig } from "@/config/product";
import { siteConfig } from "@/config/site";

export const alt = `${siteConfig.name} plain-English UK business deadline guidance`;
export const size = {
  width: 1200,
  height: 630
};
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#f9f8f3",
          color: "#202433",
          padding: 72,
          fontFamily: "Arial, sans-serif"
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 18,
            fontSize: 30,
            fontWeight: 700
          }}
        >
          <div
            style={{
              width: 46,
              height: 46,
              borderRadius: 10,
              background: "#16836f"
            }}
          />
          {siteConfig.name}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ color: "#16836f", fontSize: 30, fontWeight: 700 }}>
            For first-time UK business owners
          </div>
          <div style={{ maxWidth: 930, fontSize: 76, fontWeight: 750, lineHeight: 1.05 }}>
            What needs doing, when it is due, and what to prepare.
          </div>
          <div style={{ maxWidth: 840, color: "#55606f", fontSize: 32, lineHeight: 1.35 }}>
            {productConfig.disclaimer}
          </div>
        </div>
      </div>
    ),
    size
  );
}
