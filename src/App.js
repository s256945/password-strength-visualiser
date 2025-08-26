import PasswordStrength from "./components/PassordStrength";

const App = () => {
  return (
    <div style={{ fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif" }}>
      <h1 style={{ textAlign: "center", marginTop: 24 }}>Password Strength Visualiser</h1>
      <PasswordStrength />
    </div>
  );
}

export default App;
