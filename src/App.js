import PasswordStrength from "./components/PassordStrength";

const App = () => {
  return (
    <>
      {/* floating hearts background (decorative) */}
      <div className="psv-hearts" aria-hidden="true">
        <span className="heart"></span>
        <span className="heart"></span>
        <span className="heart"></span>
        <span className="heart"></span>
        <span className="heart"></span>
        <span className="heart"></span>
        <span className="heart"></span>
        <span className="heart"></span>
        <span className="heart"></span>
        <span className="heart"></span>
        <span className="heart"></span>
        <span className="heart"></span>
      </div>
      <PasswordStrength />
    </>
  );
};

export default App;
