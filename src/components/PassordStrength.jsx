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
    <div className="psv-shell">
      <h1 className="psv-title">
        <span className="sparkle">✨</span>
        Password Strength Visualiser
        <span className="sparkle">✨</span>
      </h1>
      <div className="psv-input">
        <label>Password</label>
        <input
          type="password"
          value={pwd}
          onChange={(e) => setPwd(e.target.value)}
          placeholder="Type to analyse…"
        />
      </div>
      {/* Strength bar */}
      <div className="psv-bar" aria-hidden>
        <div
          className="psv-bar-fill"
          style={{
            width: `${meter.pct}%`,
            background:
              res?.label === "Very strong"
                ? "linear-gradient(90deg,#fbcfe8,#a7f3d0)"
                : res?.label === "Strong"
                ? "linear-gradient(90deg,#f9a8d4,#86efac)"
                : res?.label === "Fair"
                ? "linear-gradient(90deg,#f9a8d4,#fde68a)"
                : res?.label === "Weak"
                ? "linear-gradient(90deg,#fda4af,#f9a8d4)"
                : "linear-gradient(90deg,#fecdd3,#fda4af)",
          }}
        />
      </div>
      {res ? (
        <>
          <div className="psv-meta">
            {res.label} · {res.entropy} bits
          </div>

          <div className="psv-sub">FINDINGS</div>
          {res.findings.length ? (
            <div className="psv-findings">
              {res.findings.map((f, i) => (
                <span className="psv-pill" key={i}>
                  🔎 {f.type}: <code style={{ marginLeft: 4 }}>{f.detail}</code>
                </span>
              ))}
            </div>
          ) : (
            <div className="psv-note">No obvious patterns found. Nice!</div>
          )}
          <div className="psv-sub">ADVICE</div>
          <ul className="psv-advice">
            {res.advice.length ? (
              res.advice.map((a, i) => <li key={i}>{a}</li>)
            ) : (
              <li>
                Looks good! Consider a long passphrase with uncommon words.
              </li>
            )}
          </ul>
        </>
      ) : (
        <div className="psv-note">Start typing to see analysis.</div>
      )}
    </div>
  );
};

export default PasswordStrength;
