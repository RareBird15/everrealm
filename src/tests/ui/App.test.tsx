import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { App } from "../../ui/App";
import { saveGame } from "../../storage/save";
import { createInitialState } from "../../engine/state/initialState";

describe("App", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the game title as a heading", () => {
    render(<App />);
    expect(
      screen.getByRole("heading", { name: "Everrealm" }),
    ).toBeInTheDocument();
  });

  it("uses a main landmark labelled with the game name", () => {
    render(<App />);
    expect(screen.getByRole("main")).toBeInTheDocument();
  });

  it("shows realm setup screen when no save exists", () => {
    render(<App />);
    expect(
      screen.getByRole("heading", { name: "Name Your Realm" }),
    ).toBeInTheDocument();
  });

  it("transitions to game after entering realm name", () => {
    render(<App />);
    const input = screen.getByLabelText("Realm Name");
    fireEvent.change(input, { target: { value: "Testhold" } });
    fireEvent.click(screen.getByRole("button", { name: "Begin" }));
    expect(
      screen.getByRole("region", { name: "Realm Summary" }),
    ).toBeInTheDocument();
  });

  it("renders a Realm Summary section when save exists", () => {
    saveGame(createInitialState("Elderglen"));
    render(<App />);
    expect(
      screen.getByRole("region", { name: "Realm Summary" }),
    ).toBeInTheDocument();
  });

  it("renders an Actions section with establish button when save exists", () => {
    saveGame(createInitialState("Elderglen"));
    render(<App />);
    expect(screen.getByText("Actions")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Establish Settlement/i }),
    ).toBeInTheDocument();
  });
});