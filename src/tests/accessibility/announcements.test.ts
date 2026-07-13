import { describe, it, expect } from "vitest";
import { announce, announceEvents } from "../../accessibility/announcements";
import type { GameEvent } from "../../engine/events/GameEvent";
import type { ImprovementId } from "../../engine/improvements/types";

function id(s: string): ImprovementId {
  return s as ImprovementId;
}

describe("announce — SettlementEstablished", () => {
  it("announces 'Created Tent.'", () => {
    const event: GameEvent = {
      type: "SettlementEstablished",
      age: "FoundingAge",
      level: "Tent",
    };
    expect(announce(event)).toBe("Created Tent.");
  });

  it("announces 'Created Hut.' for a different level", () => {
    const event: GameEvent = {
      type: "SettlementEstablished",
      age: "AgeOfGrowth",
      level: "Hut",
    };
    expect(announce(event)).toBe("Created Hut.");
  });
});

describe("announce — SettlementDeveloped", () => {
  it("announces 'Created Hut.' for player-sourced development", () => {
    const event: GameEvent = {
      type: "SettlementDeveloped",
      age: "FoundingAge",
      level: "Tent",
      newLevel: "Hut",
      source: "Player",
    };
    expect(announce(event)).toBe("Created Hut.");
  });

  it("announces 'Created Cottage.' for chain-sourced development", () => {
    const event: GameEvent = {
      type: "SettlementDeveloped",
      age: "FoundingAge",
      level: "Hut",
      newLevel: "Cottage",
      source: "ChainReaction",
    };
    expect(announce(event)).toBe("Created Cottage.");
  });
});

describe("announce — ChainReactionStarted", () => {
  it("announces 'Chain reaction.'", () => {
    const event: GameEvent = { type: "ChainReactionStarted" };
    expect(announce(event)).toBe("Chain reaction.");
  });
});

describe("announce — ChainReactionCompleted", () => {
  it("returns null (no separate announcement)", () => {
    const event: GameEvent = {
      type: "ChainReactionCompleted",
      chainLength: 2,
    };
    expect(announce(event)).toBeNull();
  });
});

describe("announce — SettlementLevelDiscovered", () => {
  it("announces 'Discovered Cottage.'", () => {
    const event: GameEvent = {
      type: "SettlementLevelDiscovered",
      level: "Cottage",
    };
    expect(announce(event)).toBe("Discovered Cottage.");
  });
});

describe("announce — ProsperityEarned", () => {
  it("announces 'Earned 3 Prosperity.' for develop rewards", () => {
    const event: GameEvent = {
      type: "ProsperityEarned",
      amount: 3,
      source: "Develop",
    };
    expect(announce(event)).toBe("Earned 3 Prosperity.");
  });

  it("announces 'Earned 100 Prosperity.' for age entry rewards", () => {
    const event: GameEvent = {
      type: "ProsperityEarned",
      amount: 100,
      source: "AgeEntry",
    };
    expect(announce(event)).toBe("Earned 100 Prosperity.");
  });

  it("returns null for passive prosperity (avoid double-announcing)", () => {
    const event: GameEvent = {
      type: "ProsperityEarned",
      amount: 60,
      source: "Passive",
    };
    expect(announce(event)).toBeNull();
  });
});

describe("announce — ImprovementPurchased", () => {
  it("announces 'Stone Roads completed.' using the catalog name", () => {
    const event: GameEvent = {
      type: "ImprovementPurchased",
      improvementId: id("stone_roads"),
    };
    expect(announce(event)).toBe("Stone Roads completed.");
  });

  it("announces 'Guild Hall completed.' for another improvement", () => {
    const event: GameEvent = {
      type: "ImprovementPurchased",
      improvementId: id("guild_hall"),
    };
    expect(announce(event)).toBe("Guild Hall completed.");
  });

  it("falls back to 'Improvement completed.' for unknown IDs", () => {
    const event: GameEvent = {
      type: "ImprovementPurchased",
      improvementId: id("nonexistent"),
    };
    expect(announce(event)).toBe("Improvement completed.");
  });
});

describe("announce — AgeAdvanced", () => {
  it("announces 'Welcome to the Age of Growth.'", () => {
    const event: GameEvent = {
      type: "AgeAdvanced",
      fromAge: "FoundingAge",
      toAge: "AgeOfGrowth",
    };
    expect(announce(event)).toBe("Welcome to the Age of Growth.");
  });

  it("announces 'Welcome to the Golden Age.'", () => {
    const event: GameEvent = {
      type: "AgeAdvanced",
      fromAge: "AgeOfLords",
      toAge: "GoldenAge",
    };
    expect(announce(event)).toBe("Welcome to the Golden Age.");
  });
});

describe("announce — CapacityReached", () => {
  it("announces 'Settlement Capacity reached.'", () => {
    const event: GameEvent = { type: "CapacityReached" };
    expect(announce(event)).toBe("Settlement Capacity reached.");
  });
});

describe("announce — PassiveProsperityApplied", () => {
  it("announces 'Earned 60 Prosperity.'", () => {
    const event: GameEvent = {
      type: "PassiveProsperityApplied",
      amount: 60,
    };
    expect(announce(event)).toBe("Earned 60 Prosperity.");
  });
});

describe("announceEvents", () => {
  it("converts a full chain reaction sequence", () => {
    const events: GameEvent[] = [
      { type: "SettlementDeveloped", age: "FoundingAge", level: "Tent", newLevel: "Hut", source: "Player" },
      { type: "ChainReactionStarted" },
      { type: "SettlementDeveloped", age: "FoundingAge", level: "Hut", newLevel: "Cottage", source: "ChainReaction" },
      { type: "ChainReactionCompleted", chainLength: 1 },
      { type: "SettlementLevelDiscovered", level: "Cottage" },
      { type: "ProsperityEarned", amount: 3, source: "Develop" },
      { type: "ProsperityEarned", amount: 2, source: "ChainReaction" },
      { type: "ProsperityEarned", amount: 25, source: "Discovery" },
    ];

    const announcements = announceEvents(events);
    expect(announcements).toEqual([
      "Created Hut.",
      "Chain reaction.",
      "Created Cottage.",
      "Discovered Cottage.",
      "Earned 3 Prosperity.",
      "Earned 2 Prosperity.",
      "Earned 25 Prosperity.",
    ]);
  });

  it("filters out null announcements", () => {
    const events: GameEvent[] = [
      { type: "SettlementEstablished", age: "FoundingAge", level: "Tent" },
      { type: "ProsperityEarned", amount: 60, source: "Passive" },
      { type: "ChainReactionCompleted", chainLength: 0 },
    ];

    const announcements = announceEvents(events);
    expect(announcements).toEqual(["Created Tent."]);
  });

  it("reproduces the spec's example announcement pattern", () => {
    // From spec.md: Created Hut. Chain reaction. Created Cottage.
    const events: GameEvent[] = [
      { type: "SettlementDeveloped", age: "FoundingAge", level: "Tent", newLevel: "Hut", source: "Player" },
      { type: "ChainReactionStarted" },
      { type: "SettlementDeveloped", age: "FoundingAge", level: "Hut", newLevel: "Cottage", source: "ChainReaction" },
    ];

    expect(announceEvents(events)).toEqual([
      "Created Hut.",
      "Chain reaction.",
      "Created Cottage.",
    ]);
  });
});