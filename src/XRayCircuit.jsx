import { useId } from "react";
import "./xray-circuit.css";

// Coordinates describe source relationships, not a running deployment. Each
// layer keeps its own topology; the adjacent notes carry the complete contract.
const node = (id, label, x, y, kind = "step") => ({ id, label, x, y, kind });
const route = (from, to, kind = "main", via = [], label = "") => ({ from, to, kind, via, label });
const schema = (caption, summary, nodes, routes) => ({ caption, summary, nodes, routes });

export const XRAY_CIRCUITS = {
  agent: [
    schema("Permission precedes execution", "Requested work passes an approval gate before a constrained grant. An unauthorized action stops at the boundary.", [
      node("request", ["Requested", "work"], 25, 18), node("approval", ["Approval", "gate"], 75, 18, "gate"), node("grant", ["Scoped", "grant"], 75, 78), node("stop", ["No grant", "stop"], 25, 78, "guard"),
    ], [route("request", "approval"), route("approval", "grant"), route("approval", "stop", "guard", [[50, 18], [50, 78]])]),
    schema("Ownership has an expiry", "A leased owner keeps a heartbeat and may complete only while it owns the task. A stale completion is refused.", [
      node("lease", ["Task", "lease"], 25, 18), node("owner", ["Current", "owner"], 75, 18, "gate"), node("done", ["Accepted", "completion"], 75, 78), node("stale", ["Stale", "refused"], 25, 78, "guard"),
    ], [route("lease", "owner"), route("owner", "done"), route("owner", "lease", "return", [[75, 48], [25, 48]], "Heartbeat"), route("stale", "owner", "guard", [[8, 78], [8, 5], [75, 5]])]),
    schema("The claim binds the action", "The approved action digest is checked at claim time. Side-effect receipts narrow duplicate-action risk without promising universal exactly-once execution.", [
      node("digest", ["Approved", "digest"], 25, 18), node("claim", ["Compare", "and claim"], 75, 18, "gate"), node("effect", ["Tool", "effect"], 75, 78), node("receipt", ["Recorded", "receipt"], 25, 78),
    ], [route("digest", "claim"), route("claim", "effect"), route("effect", "receipt"), route("receipt", "claim", "return", [[25, 48], [75, 48]])]),
    schema("Interrupted work stays owned", "Dispatch and execution check ownership. Cancellation or lease loss leads through the persisted recovery lifecycle.", [
      node("dispatch", ["Dispatch"], 25, 18), node("check", ["Ownership", "check"], 75, 18, "gate"), node("execute", ["Execute"], 75, 78), node("recover", ["Cancel /", "recover"], 25, 78, "guard"),
    ], [route("dispatch", "check"), route("check", "execute"), route("check", "recover", "guard", [[50, 18], [50, 78]]), route("recover", "dispatch", "return")]),
  ],
  atlaslm: [
    schema("Retrieval context is not the quote", "Stable chunks preserve original citation text separately from enriched retrieval context before indexing.", [
      node("document", ["Document"], 50, 16), node("chunk", ["Stable", "chunks"], 50, 48, "gate"), node("context", ["Retrieval", "context"], 25, 82), node("quote", ["Original", "quote"], 75, 82),
    ], [route("document", "chunk"), route("chunk", "context"), route("chunk", "quote")]),
    schema("Two searches, one evidence set", "Dense and BM25 ranks join through Reciprocal Rank Fusion, then reranking and MMR select non-redundant evidence.", [
      node("dense", ["Dense"], 25, 16), node("bm25", ["BM25"], 75, 16), node("rrf", ["Rank", "fusion"], 50, 48, "gate"), node("rerank", ["Rerank", "+ MMR"], 25, 82), node("evidence", ["Evidence"], 75, 82),
    ], [route("dense", "rrf"), route("bm25", "rrf"), route("rrf", "rerank"), route("rerank", "evidence")]),
    schema("A brake before and after generation", "Evidence sufficiency gates generation. Citation auditing checks the result, while insufficient evidence leads to abstention.", [
      node("evidence", ["Evidence"], 25, 16), node("gate", ["Sufficient?"], 75, 16, "gate"), node("generate", ["Generate"], 75, 49), node("cite", ["Citation", "audit"], 75, 82, "gate"), node("stop", ["Abstain"], 25, 82, "guard"),
    ], [route("evidence", "gate"), route("gate", "generate"), route("generate", "cite"), route("gate", "stop", "guard", [[50, 16], [50, 82]]), route("cite", "stop", "guard")]),
    schema("The answer keeps its retrieval path", "The query returns evidence and an answer alongside an inspectable retrieval trace. The cache remains instance-local.", [
      node("query", ["Query"], 25, 18), node("retrieve", ["Retrieve"], 75, 18, "gate"), node("evidence", ["Evidence"], 75, 78), node("answer", ["Answer"], 25, 78), node("trace", ["Trace"], 50, 48),
    ], [route("query", "retrieve"), route("retrieve", "evidence"), route("evidence", "answer"), route("retrieve", "trace"), route("answer", "trace")]),
  ],
  karixmc: [
    schema("Gameplay authority stays on Paper", "The Paper plugin reports server-observed activity. Signed batches cross into the bridge API; command delivery has a durable receipt journal.", [
      node("paper", ["Paper", "activity"], 25, 18), node("batch", ["Signed", "batch"], 75, 18, "gate"), node("bridge", ["Bridge", "API"], 75, 78), node("journal", ["Receipt", "journal"], 25, 78),
    ], [route("paper", "batch"), route("batch", "bridge"), route("bridge", "journal"), route("journal", "paper", "return")]),
    schema("A signature is only one check", "HMAC binds the request fields and body hash. Timestamp and nonce checks reject stale or replayed requests before accepting the body.", [
      node("request", ["Signed", "request"], 25, 18), node("hmac", ["HMAC +", "nonce"], 75, 18, "gate"), node("accept", ["Accept", "body"], 75, 78), node("reject", ["Stale /", "replay stop"], 25, 78, "guard"),
    ], [route("request", "hmac"), route("hmac", "accept"), route("hmac", "reject", "guard", [[50, 18], [50, 78]])]),
    schema("Delivery and expiry both leave a record", "A purchase is claimed, delivered and acknowledged. An abandoned eligible claim expires into a transactional refund and ledger entry.", [
      node("claim", ["Claim"], 25, 16), node("deliver", ["Deliver"], 75, 16), node("ack", ["Receipt /", "ack"], 75, 49), node("ledger", ["Ledger"], 75, 82), node("refund", ["Expire /", "refund"], 25, 82, "guard"),
    ], [route("claim", "deliver"), route("deliver", "ack"), route("ack", "ledger"), route("claim", "refund", "guard"), route("refund", "ledger", "guard")]),
    schema("The VPS has an operational boundary", "Nginx fronts two app replicas backed by PostgreSQL and Redis. The runbook also owns health checks, backups and restoration.", [
      node("nginx", ["Nginx"], 50, 16, "gate"), node("app1", ["App", "replica A"], 25, 49), node("app2", ["App", "replica B"], 75, 49), node("postgres", ["Postgres"], 25, 82), node("redis", ["Redis"], 75, 82),
    ], [route("nginx", "app1"), route("nginx", "app2"), route("app1", "postgres"), route("app2", "postgres"), route("app1", "redis"), route("app2", "redis")]),
  ],
  revive: [
    schema("Authentication happens before policy", "The original raw bytes pass HMAC verification and input validation. Invalid input is rejected before recovery evaluation.", [
      node("bytes", ["Raw", "bytes"], 25, 18), node("verify", ["HMAC", "verify"], 75, 18, "gate"), node("event", ["Validated", "event"], 75, 78), node("reject", ["Reject", "input"], 25, 78, "guard"),
    ], [route("bytes", "verify"), route("verify", "event"), route("verify", "reject", "guard", [[50, 18], [50, 78]])]),
    schema("A recommendation has three exits", "Deterministic rules classify the failure and gate the proposed action by consent, contact limits and approval constraints.", [
      node("failure", ["Failure"], 25, 16), node("policy", ["Policy", "gates"], 75, 16, "gate"), node("allow", ["Allow"], 25, 82), node("approve", ["Approval", "required"], 75, 49, "gate"), node("block", ["Block"], 75, 82, "guard"),
    ], [route("failure", "policy"), route("policy", "allow", "main", [[50, 16], [50, 82]]), route("policy", "approve"), route("policy", "block", "guard", [[97, 16], [97, 82]])]),
    schema("The decision survives repeat delivery", "Event and decision records enter an immutable audit store. Storage-enforced duplicate suppression prevents repeated event processing.", [
      node("event", ["Event ID"], 25, 18), node("decision", ["Decision", "record"], 75, 18), node("store", ["Audit", "store"], 75, 78, "gate"), node("duplicate", ["Duplicate", "suppressed"], 25, 78, "guard"),
    ], [route("event", "decision"), route("decision", "store"), route("event", "duplicate", "guard"), route("duplicate", "store", "guard")]),
    schema("Policy edges have executable assertions", "Checked-in fixtures exercise the recovery engine and assert policy behavior. These describe tests, not customer recovery results.", [
      node("fixtures", ["Fixtures"], 25, 18), node("edges", ["Edge", "cases"], 75, 18), node("engine", ["Recovery", "engine"], 50, 49, "gate"), node("assert", ["Assertions"], 50, 82),
    ], [route("fixtures", "engine"), route("edges", "engine"), route("engine", "assert")]),
  ],
  atlasforge: [
    schema("Generation does not authorize publishing", "Script policy and media-quality checks precede the optional publishing path. Editorial responsibility remains with the operator.", [
      node("script", ["Script"], 25, 18), node("policy", ["Policy", "checks"], 75, 18, "gate"), node("quality", ["Media", "quality"], 75, 78, "gate"), node("review", ["Operator", "review"], 25, 78, "guard"),
    ], [route("script", "policy"), route("policy", "quality"), route("policy", "review", "guard", [[50, 18], [50, 78]]), route("quality", "review", "guard")]),
    schema("Two render paths share one budget", "The scene allocator bounds premium generation. Remaining scenes use deterministic local FFmpeg motion before assembly.", [
      node("scenes", ["Scenes"], 25, 16), node("budget", ["Budget", "allocation"], 75, 16, "gate"), node("premium", ["Premium", "scenes"], 25, 49), node("ffmpeg", ["Local", "FFmpeg"], 75, 49), node("render", ["Assembly"], 50, 82),
    ], [route("scenes", "budget"), route("budget", "premium"), route("budget", "ffmpeg"), route("premium", "render"), route("ffmpeg", "render")]),
    schema("A restart can reuse completed work", "The overlap lock protects a single-workstation run. Filesystem artifacts and SQLite checkpoints allow the pipeline to resume.", [
      node("lock", ["Overlap", "lock"], 50, 16, "gate"), node("sqlite", ["SQLite", "state"], 25, 49), node("artifacts", ["Saved", "artifacts"], 75, 49), node("resume", ["Resume"], 50, 82),
    ], [route("lock", "sqlite"), route("lock", "artifacts"), route("sqlite", "resume"), route("artifacts", "resume"), route("resume", "sqlite", "return", [[8, 82], [8, 49]])]),
    schema("Package first, publish by choice", "Narration, scenes and captions join final quality checks and a self-contained run package. Publishing is opt-in and private by default.", [
      node("media", ["Narration", "+ scenes"], 25, 16), node("captions", ["Captions", "+ metadata"], 75, 16), node("qa", ["Final QA"], 50, 49, "gate"), node("package", ["Run", "package"], 25, 82), node("publish", ["Opt-in", "private"], 75, 82, "gate"),
    ], [route("media", "qa"), route("captions", "qa"), route("qa", "package"), route("package", "publish")]),
  ],
  gpt: [
    schema("Vocabulary is an explicit choice", "Corpus text trains a BPE tokenizer. The resulting token vocabulary remains tied to visible model configuration.", [
      node("corpus", ["Corpus"], 25, 18), node("bpe", ["Train", "BPE"], 75, 18, "gate"), node("tokens", ["Token", "IDs"], 75, 78), node("config", ["Vocabulary", "config"], 25, 78),
    ], [route("corpus", "bpe"), route("bpe", "tokens"), route("bpe", "config", "main", [[50, 18], [50, 78]]), route("config", "tokens")]),
    schema("The decoder cannot see the future", "RoPE and normalized attention feed a gated MLP. The causal boundary prevents future-context attention.", [
      node("rope", ["RoPE +", "RMSNorm"], 25, 16), node("attention", ["Causal", "attention"], 75, 16, "gate"), node("qknorm", ["QK norm"], 75, 49), node("mlp", ["Gated", "MLP"], 75, 82), node("future", ["Future", "masked"], 25, 82, "guard"),
    ], [route("rope", "attention"), route("qknorm", "attention"), route("attention", "mlp", "main", [[97, 16], [97, 82]]), route("future", "attention", "guard", [[50, 82], [50, 16]])]),
    schema("Parameter groups take different updates", "Eligible matrix weights use Muon. Embeddings, normalization and the output head use AdamW before the combined model update.", [
      node("weights", ["Parameter", "groups"], 50, 16, "gate"), node("muon", ["Matrices", "Muon"], 25, 49), node("adamw", ["Others", "AdamW"], 75, 49), node("update", ["Model", "update"], 50, 82),
    ], [route("weights", "muon"), route("weights", "adamw"), route("muon", "update"), route("adamw", "update")]),
    schema("Generation requires matching artifacts", "The configured checkpoint and compatible tokenizer feed the visible top-k generation path. Artifacts run locally rather than as a hosted service.", [
      node("tokenizer", ["Tokenizer"], 25, 18), node("checkpoint", ["Compatible", "checkpoint"], 75, 18), node("topk", ["Top-k", "generation"], 50, 49, "gate"), node("text", ["Output", "text"], 50, 82),
    ], [route("tokenizer", "topk"), route("checkpoint", "topk"), route("topk", "text")]),
  ],
};

function circuitPoints(circuit, connection) {
  const start = circuit.nodes.find(item => item.id === connection.from);
  const end = circuit.nodes.find(item => item.id === connection.to);
  const points = connection.via.length ? connection.via : start.x !== end.x && start.y !== end.y
    ? [[start.x, (start.y + end.y) / 2], [end.x, (start.y + end.y) / 2]] : [];
  return [[start.x, start.y], ...points, [end.x, end.y]];
}

export function circuitPath(circuit, connection) {
  return circuitPoints(circuit, connection).map(([x, y], index) => `${index === 0 ? "M" : "L"} ${x} ${y}`).join(" ");
}

function directionMarker(circuit, connection) {
  const points = circuitPoints(circuit, connection);
  const segments = points.slice(1).map(([x, y], index) => {
    const [previousX, previousY] = points[index];
    const middle = { x: (x + previousX) / 2, y: (y + previousY) / 2 };
    return { ...middle, angle: Math.atan2(y - previousY, x - previousX) * 180 / Math.PI, length: Math.abs(x - previousX) + Math.abs(y - previousY) };
  });
  const clear = segments.filter(point => !circuit.nodes.some(item => Math.abs(item.x - point.x) < 20 && Math.abs(item.y - point.y) < 13));
  return (clear.length ? clear : segments).sort((a, b) => b.length - a.length)[0];
}

export function XRayCircuit({ projectId, layerIndex, active = false, reducedMotion = false, replayToken = 0, showGuards = false, variant = "plane" }) {
  const titleId = useId();
  const descriptionId = useId();
  const circuit = XRAY_CIRCUITS[projectId]?.[layerIndex];
  if (!circuit) return null;
  const playbackKey = `${projectId}-${layerIndex}-${active}-${replayToken}`;

  return (
    <figure className={`xray-circuit xray-circuit--${variant}`} data-active={active} data-guards={showGuards} data-reduced-motion={Boolean(reducedMotion)} role={variant === "readout" ? "img" : undefined} aria-labelledby={variant === "readout" ? titleId : undefined} aria-describedby={variant === "readout" ? descriptionId : undefined}>
      <div className="xray-circuit-map">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true" focusable="false">
          {circuit.routes.map((connection, index) => (
            <path className={`xray-circuit-route is-${connection.kind}`} key={`route-${index}`} d={circuitPath(circuit, connection)} vectorEffect="non-scaling-stroke" />
          ))}
          {active && !reducedMotion && <g key={playbackKey} className="xray-circuit-playback">
            {circuit.routes.map((connection, index) => (
              <path className={`xray-circuit-packet is-${connection.kind}`} key={`packet-${index}`} d={circuitPath(circuit, connection)} pathLength="100" vectorEffect="non-scaling-stroke" style={{ "--route-delay": `${index * 90}ms` }} />
            ))}
          </g>}
        </svg>
        {circuit.routes.map((connection, index) => {
          const marker = directionMarker(circuit, connection);
          return connection.label ? <small key={`direction-${index}`} className="xray-circuit-annotation" style={{ left: `${marker.x}%`, top: `${marker.y}%` }} aria-hidden="true">{connection.label}</small> : <i key={`direction-${index}`} className={`xray-circuit-direction is-${connection.kind}`} style={{ left: `${marker.x}%`, top: `${marker.y}%`, "--route-angle": `${marker.angle - 45}deg` }} aria-hidden="true" />;
        })}
        {circuit.nodes.map(item => (
          <span key={item.id} className={`xray-circuit-node is-${item.kind}`} style={{ left: `${item.x}%`, top: `${item.y}%` }} aria-hidden="true">
            {item.label.map(line => <span key={line}>{line}</span>)}
          </span>
        ))}
      </div>
      {variant === "readout" && <>
        <figcaption id={titleId}>{circuit.caption}</figcaption>
        <span className="xray-circuit-description" id={descriptionId}>Source schematic, illustrative route. {circuit.summary}</span>
      </>}
    </figure>
  );
}
