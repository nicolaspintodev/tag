const StateBar = ({ count = 0, singular = 'registro', plural = 'registros' }) => {
  if (!count || count <= 0) return null;
  return (
    <div className="state-bar">
      <span className="state-bar-count">{count} {count === 1 ? singular : plural}</span>
    </div>
  );
};

export default StateBar;