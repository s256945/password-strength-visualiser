import { useMemo, useState } from "react";
import zxcvbn from "zxcvbn";

// Define password strength "bands" (labels for entropy ranges)
const bands = [
  { min: 80, label: "Very strong" },
  { min: 60, label: "Strong" },
  { min: 36, label: "Fair" },
  { min: 28, label: "Weak" },
  { min: -Infinity, label: "Very weak" },
];

const PasswordStrength = () => {
  const [pwd, setPwd] = useState("");

  // Calculate results when password changes
  const res = useMemo(() => {
    if (!pwd) return null;

    // Use zxcvbn to estimate guesses and patterns
    const zx = zxcvbn(pwd);

    // Convert guesses_log10 to entropy in bits
    let entropy = zx.guesses_log10 * Math.log2(10);

    // Extra penalty: detect simple "keyboard walks" (qwerty, asdf)
    const qwerty = "qwertyuiopasdfghjklzxcvbnm";
    const letters = pwd.toLowerCase().replace(/[^a-z]/g, "");
    let best = 1,
      run = 1;
    for (let i = 1; i < letters.length; i++) {
      if (
        Math.abs(
          qwerty.indexOf(letters[i]) - qwerty.indexOf(letters[i - 1])
        ) === 1
      ) {
        run++;
      } else {
        best = Math.max(best, run);
        run = 1;
      }
    }
    best = Math.max(best, run);

    // Flag if password has a walk of length >= 4
    const hasWalk = best >= 4;
    if (hasWalk) entropy -= 10; // apply penalty

    // Map entropy to human-readable label
    const label = bands.find((b) => entropy >= b.min).label;

    // Collect findings (patterns detected)
    const findings = [
      ...(hasWalk
        ? [{ type: "keyboard-sequence", detail: `sequence length ${best}` }]
        : []),
      ...zx.sequence
        .slice(0, 4)
        .map((m) => ({ type: m.pattern, detail: m.token })),
    ];

    // Generate advice
    const advice = [];
    if (hasWalk)
      advice.push("Break keyboard sequences with unrelated words/symbols.");
    if (zx.feedback.warning) advice.push(zx.feedback.warning);
    advice.push(...(zx.feedback.suggestions ?? []));

    // Return structured result
    return {
      entropy: Math.max(0, Math.round(entropy)), // round bits
      label,
      findings,
      advice: Array.from(new Set(advice)).slice(0, 3), // unique + limit 3
    };
  }, [pwd]);

  // Calculate progress bar % and colour from results
  const meter = useMemo(() => {
    if (!res) return { pct: 0, color: "#d1d5db" };
    const pct = Math.min(100, Math.round((res.entropy / 80) * 100));
    const color =
      res.label === "Very strong"
        ? "#059669"
        : res.label === "Strong"
        ? "#16a34a"
        : res.label === "Fair"
        ? "#eab308"
        : res.label === "Weak"
        ? "#f97316"
        : "#dc2626";
    return { pct, color };
  }, [res]);

  return (
    <div style={{ maxWidth: "500px", margin: "2rem auto", padding: "1rem" }}>
      {/* Password input */}
      <label style={{ display: "block", fontSize: "14px", fontWeight: "500" }}>
        Password
      </label>
      <input
        type="password"
        value={pwd}
        onChange={(e) => setPwd(e.target.value)}
        style={{
          width: "100%",
          border: "1px solid #ccc",
          borderRadius: "8px",
          padding: "10px",
          marginTop: "4px",
        }}
        placeholder="Type to analyse…"
      />
      {/* Strength bar */}
      <div
        style={{
          marginTop: "12px",
          height: "12px",
          width: "100%",
          background: "#e5e7eb",
          borderRadius: "9999px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${meter.pct}%`, // bar width
            background: meter.color, // bar colour depends on strength
            transition: "width 0.3s ease",
          }}
        />
      </div>
      {/* Results */}
      {res ? (
        <div style={{ fontSize: "14px", marginTop: "10px" }}>
          {/* Label and entropy */}
          <div style={{ fontWeight: "500" }}>
            {res.label} · {res.entropy} bits
          </div>
          {/* Findings list */}
          {!!res.findings.length && (
            <div style={{ marginTop: "8px" }}>
              <div
                style={{
                  fontSize: "12px",
                  color: "#555",
                  textTransform: "uppercase",
                }}
              >
                Findings
              </div>
              <ul>
                {res.findings.map((f, i) => (
                  <li key={i}>
                    {f.type}: <code>{f.detail}</code>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {/* Advice list */}
          {!!res.advice.length && (
            <div style={{ marginTop: "8px" }}>
              <div
                style={{
                  fontSize: "12px",
                  color: "#555",
                  textTransform: "uppercase",
                }}
              >
                Advice
              </div>
              <ul>
                {res.advice.map((a, i) => (
                  <li key={i}>{a}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ) : (
        <div style={{ color: "#666", fontSize: "14px", marginTop: "8px" }}>
          Start typing to see analysis.
        </div>
      )}
    </div>
  );
};

export default PasswordStrength;
