import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { HeatmapControls } from "./controls";
import type { ControlsProps, Pan } from "./types";

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

function renderControls(overrides: Partial<ControlsProps> = {}) {
  const defaultPan: Pan = { x: 0, y: 0 };

  const props: ControlsProps = {
    zoom: 1,
    minZoom: 0.5,
    maxZoom: 5,
    pan: defaultPan,
    onZoomIn: vi.fn(),
    onZoomOut: vi.fn(),
    onReset: vi.fn(),
    onSwap: vi.fn(),
    isPlacing: false,
    labels: "Swap image",
    ...overrides,
  };

  render(<HeatmapControls {...props} />);

  return props;
}

describe("HeatmapControls", () => {
  it("renders the current zoom percentage", () => {
    renderControls({ zoom: 1.25 });

    expect(screen.getByText("125%")).toBeInTheDocument();
  });

  it("calls onZoomIn when clicking the zoom in button", () => {
    const props = renderControls();

    const buttons = screen.getAllByRole("button");

    fireEvent.click(buttons[0]);

    expect(props.onZoomIn).toHaveBeenCalledTimes(1);
  });

  it("calls onZoomOut when clicking the zoom out button", () => {
    const props = renderControls();

    const buttons = screen.getAllByRole("button");

    fireEvent.click(buttons[1]);

    expect(props.onZoomOut).toHaveBeenCalledTimes(1);
  });

  it("calls onReset when clicking the reset button", () => {
    const props = renderControls({
      zoom: 2,
      pan: { x: 20, y: 10 },
    });

    const buttons = screen.getAllByRole("button");

    fireEvent.click(buttons[2]);

    expect(props.onReset).toHaveBeenCalledTimes(1);
  });

  it("disables zoom in button when zoom is equal to maxZoom", () => {
    renderControls({
      zoom: 5,
      maxZoom: 5,
    });

    const buttons = screen.getAllByRole("button");
    const zoomInButton = buttons[0];

    expect(zoomInButton).toBeDisabled();
  });

  it("disables zoom out button when zoom is equal to minZoom", () => {
    renderControls({
      zoom: 0.5,
      minZoom: 0.5,
    });

    const buttons = screen.getAllByRole("button");
    const zoomOutButton = buttons[1];

    expect(zoomOutButton).toBeDisabled();
  });

  it("disables reset button when zoom and pan are in the initial state", () => {
    renderControls({
      zoom: 1,
      pan: { x: 0, y: 0 },
    });

    const buttons = screen.getAllByRole("button");
    const resetButton = buttons[2];

    expect(resetButton).toBeDisabled();
  });

  it("enables reset button when zoom is different from 1", () => {
    renderControls({
      zoom: 1.5,
      pan: { x: 0, y: 0 },
    });

    const buttons = screen.getAllByRole("button");
    const resetButton = buttons[2];

    expect(resetButton).not.toBeDisabled();
  });

  it("enables reset button when pan is different from zero", () => {
    renderControls({
      zoom: 1,
      pan: { x: 10, y: 0 },
    });

    const buttons = screen.getAllByRole("button");
    const resetButton = buttons[2];

    expect(resetButton).not.toBeDisabled();
  });

  it("renders swap button when not placing and onSwap exists", () => {
    renderControls({
      isPlacing: false,
      labels: "Change image",
    });

    expect(
      screen.getByRole("button", { name: /change image/i })
    ).toBeInTheDocument();
  });

  it("calls onSwap when clicking the swap button", () => {
    const props = renderControls({
      labels: "Change image",
    });

    fireEvent.click(screen.getByRole("button", { name: /change image/i }));

    expect(props.onSwap).toHaveBeenCalledTimes(1);
  });

  it("does not render swap button when isPlacing is true", () => {
    renderControls({
      isPlacing: true,
      labels: "Change image",
    });

    expect(
      screen.queryByRole("button", { name: /change image/i })
    ).not.toBeInTheDocument();
  });

  it("does not render swap button when onSwap is not provided", () => {
    renderControls({
      onSwap: undefined,
      labels: "Change image",
    });

    expect(
      screen.queryByRole("button", { name: /change image/i })
    ).not.toBeInTheDocument();
  });

  it("renders default swap label when labels is not provided", () => {
    renderControls({
      labels: undefined,
    });

    expect(
      screen.getByRole("button", { name: /swap image/i })
    ).toBeInTheDocument();
  });
});