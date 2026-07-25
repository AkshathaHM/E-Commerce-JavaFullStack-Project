import PropTypes from 'prop-types';
import Logo from '../Logo';
import AuthCard from './AuthCard';
import ThemeToggleButton from '../ThemeToggleButton';

export default function AuthLayout({ title, subtitle, notice, children, footer }) {
  return (
    <div className="auth-page">
      <div className="auth-page__container">
        <AuthCard className="auth-card--auth-layout">
          <ThemeToggleButton />

          <div className="auth-card__brand">
            <Logo showBrandText={false} />
          </div>

          <div className="auth-card__intro">
            <h1 className="auth-card__title">{title}</h1>
            <p className="auth-card__subtitle">{subtitle}</p>
            {notice && <div className="auth-card__notice">{notice}</div>}
          </div>

          {children}
          {footer && <div className="auth-card__footer">{footer}</div>}
        </AuthCard>
      </div>
    </div>
  );
}

AuthLayout.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
  notice: PropTypes.string,
  children: PropTypes.node.isRequired,
  footer: PropTypes.node,
};
