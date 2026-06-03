import { describe, it, expect } from "vitest";
import { getTooltipStyles } from "./tooltip.styles";
import { Placement } from "../types";

const placement = (
  v: "top" | "bottom",
  h: "left" | "center" | "right",
  ready = true,
): Placement => ({ v, h, ready });


describe("getTooltipStyles › wrapper › vertical", () => {
  it("v=top → bottom is defined on the wrapper", () => {
    const { wrapper } = getTooltipStyles(placement("top", "center"));
    expect(wrapper.bottom).toBeDefined();
    expect(wrapper.top).toBeUndefined();
  });

  it("v=bottom → top is defined on the wrapper", () => {
    const { wrapper } = getTooltipStyles(placement("bottom", "center"));
    expect(wrapper.top).toBeDefined();
    expect(wrapper.bottom).toBeUndefined();
  });
});

describe("getTooltipStyles › wrapper › horizontal", () => {
  it("h=center → left=50% and translateX(-50%)", () => {
    const { wrapper } = getTooltipStyles(placement("top", "center"));
    expect(wrapper.left).toBe("50%");
    expect(wrapper.transform).toBe("translateX(-50%)");
  });

  it("h=right → left=0 (tooltip aligned to the left of the marker)", () => {
    const { wrapper } = getTooltipStyles(placement("top", "right"));
    expect(wrapper.left).toBe(0);
    expect(wrapper.right).toBeUndefined();
  });

  it("h=left → right=0 (tooltip aligned to the right of the marker)", () => {
    const { wrapper } = getTooltipStyles(placement("top", "left"));
    expect(wrapper.right).toBe(0);
    expect(wrapper.left).toBeUndefined();
  });
});

describe("getTooltipStyles › wrapper › ready", () => {
  it("ready=true → opacity=1 and transition with duration", () => {
    const { wrapper } = getTooltipStyles(placement("top", "center", true));
    expect(wrapper.opacity).toBe(1);
    expect(wrapper.transition).toContain("opacity");
  });

  it("ready=false → opacity=0 and transition=none (prevents flash on mount)", () => {
    const { wrapper } = getTooltipStyles(placement("top", "center", false));
    expect(wrapper.opacity).toBe(0);
    expect(wrapper.transition).toBe("none");
  });

  it("minWidth is always defined", () => {
    const { wrapper } = getTooltipStyles(placement("top", "center"));
    expect(wrapper.minWidth).toBeDefined();
  });
});


describe("getTooltipStyles › arrow › vertical", () => {
  it("v=top → arrow points downwards (borderTop defined, borderBottom=none)", () => {
    const { arrow } = getTooltipStyles(placement("top", "center"));
    expect(arrow.borderTop).toBeDefined();
    expect(arrow.borderBottom).toBe("none");
  });

  it("v=bottom → arrow points upwards (borderBottom defined, borderTop=none)", () => {
    const { arrow } = getTooltipStyles(placement("bottom", "center"));
    expect(arrow.borderBottom).toBeDefined();
    expect(arrow.borderTop).toBe("none");
  });
});

describe("getTooltipStyles › arrow › horizontal", () => {
  it("h=center → arrow centered with translateX(-50%)", () => {
    const { arrow } = getTooltipStyles(placement("top", "center"));
    expect(arrow.left).toBe("50%");
    expect(arrow.transform).toBe("translateX(-50%)");
  });

  it("h=right → arrow aligned to the left (fixed left)", () => {
    const { arrow } = getTooltipStyles(placement("top", "right"));
    expect(typeof arrow.left).toBe("number");
    expect(arrow.right).toBeUndefined();
  });

  it("h=left → arrow aligned to the right (fixed right)", () => {
    const { arrow } = getTooltipStyles(placement("top", "left"));
    expect(typeof arrow.right).toBe("number");
    expect(arrow.left).toBeUndefined();
  });
});


describe("getTooltipStyles › arrow › borders", () => {
  it("borderLeft and borderRight are always transparent (CSS triangle)", () => {
    const configs: Placement[] = [
      placement("top", "center"),
      placement("top", "left"),
      placement("bottom", "right"),
    ];

    for (const p of configs) {
      const { arrow } = getTooltipStyles(p);
      expect(arrow.borderLeft).toContain("transparent");
      expect(arrow.borderRight).toContain("transparent");
    }
  });

  it("drop-shadow filter is present", () => {
    const { arrow } = getTooltipStyles(placement("top", "center"));
    expect(arrow.filter).toContain("drop-shadow");
  });
});


describe("getTooltipStyles › all combinations are valid", () => {
  const verticals:   Array<"top" | "bottom">          = ["top", "bottom"];
  const horizontals: Array<"left" | "center" | "right"> = ["left", "center", "right"];

  for (const v of verticals) {
    for (const h of horizontals) {
      it(`placement(${v}, ${h}) → does not throw an exception`, () => {
        expect(() => getTooltipStyles(placement(v, h))).not.toThrow();
      });
    }
  }
});