// Authored explanations of checked-in boundaries, never live test results.
// Each trace binds to the corresponding source-linked X-ray layer.
export const PROJECT_TRACES = {
  karixmc: {
    layer: 1, title: "Replay the same signed request.",
    input: "A Paper server sends a signed activity batch with a timestamp and a fresh nonce.",
    challenge: "The signature still matches. An attacker resends the exact same batch to claim the value twice.",
    guard: "The authentication path consumes the nonce. Reusing it is rejected before the activity can be accepted again.",
    signal: ["SIGNED BATCH", "NONCE REUSED", "REPLAY REJECTED"],
  },
  revive: {
    layer: 1, title: "Give the best action the wrong permission.",
    input: "The recovery engine classifies an illustrative failed payment and proposes an action.",
    challenge: "A confident proposal cannot establish consent, satisfy contact limits, or replace a required approval.",
    guard: "Deterministic policy checks consent, contact limits and required approvals, exposing its reasons. No merchant action executes in this prototype.",
    signal: ["ACTION PROPOSED", "POLICY CONFLICT", "PROPOSAL CONSTRAINED"],
  },
  agent: {
    layer: 1, title: "Bring a stale worker back to life.",
    input: "A worker owns a leased task and sends heartbeats while it works.",
    challenge: "The worker stalls. Its lease expires and another worker takes ownership. The first worker finally returns.",
    guard: "Completion checks current ownership. The stale worker cannot complete a task now owned by someone else; recovery follows the persisted lifecycle.",
    signal: ["LEASE OWNED", "OWNERSHIP LOST", "STALE COMPLETION REFUSED"],
  },
  atlaslm: {
    layer: 2, title: "Ask for an answer the evidence cannot support.",
    input: "A question produces ranked document passages and an evidence set.",
    challenge: "The retrieved passages do not contain enough support. Fluent generation would make the answer look more certain than it is.",
    guard: "The sufficiency gate can abstain before generation. A separate citation audit checks retrieved source IDs and claim coverage afterward.",
    signal: ["PASSAGES RETRIEVED", "SUPPORT INSUFFICIENT", "ABSTENTION AVAILABLE"],
  },
  atlasforge: {
    layer: 2, title: "Lose a provider halfway through a run.",
    input: "A workstation run persists its state and completed media artifacts as it moves through the pipeline.",
    challenge: "A provider fails after part of the episode is already complete. Restarting everything would discard useful work.",
    guard: "Checkpointed SQLite state and filesystem artifacts support resuming work; an overlap lock coordinates the single-workstation runtime.",
    signal: ["ARTIFACTS SAVED", "PROVIDER INTERRUPTED", "CHECKPOINT RETAINED"],
  },
  gpt: {
    layer: 1, title: "Try to let attention read the future.",
    input: "The decoder receives a token sequence and computes representations for next-token prediction.",
    challenge: "Without a causal boundary, a position could attend to a later token and leak its training target.",
    guard: "Causal attention restricts each position to its permitted context. The model implementation exposes this boundary alongside RoPE and normalization.",
    signal: ["TOKENS ENCODED", "FUTURE CONTEXT", "CAUSAL BOUNDARY"],
  },
};

export const TRACE_STAGES = [
  { label: "Expected input", key: "input" },
  { label: "Break the assumption", key: "challenge" },
  { label: "Inspect the guard", key: "guard" },
];
