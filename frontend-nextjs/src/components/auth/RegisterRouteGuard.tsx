import { useSettings } from '@/providers/SettingsProvider';
import NotFound from '@/pages/website/NotFound';
import RegisterPage from '@/pages/auth/RegisterPage';

/**
 * Renders RegisterPage when allow_register is true, otherwise NotFound (404).
 * When settings are loading or on error, allows register (fail open).
 */
export function RegisterRouteGuard() {
  const { getBoolean, isLoading } = useSettings();
  const allowRegister = getBoolean('allow_register', true);

  if (!isLoading && !allowRegister) {
    return <NotFound />;
  }

  return <RegisterPage />;
}
