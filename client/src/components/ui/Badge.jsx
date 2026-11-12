const TONES = { success: 'success', warning: 'warning', danger: 'danger', info: 'info', neutral: '' };

const Badge = ({ tone = 'neutral', children }) => (
  <span className={`badge ${TONES[tone] || ''}`.trim()}>{children}</span>
);

export default Badge;
