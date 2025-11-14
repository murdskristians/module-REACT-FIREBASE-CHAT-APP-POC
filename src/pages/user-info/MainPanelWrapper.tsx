import { useState } from 'react';
import { ProfileMenu } from '../../components/layout/ProfileMenu';
import { PersonalInfo } from './PersonalInfo';
import { PasswordSecurity } from './PasswordSecurity';
import { AppearanceTheme } from './AppearanceTheme';
import { GeneralPreferences } from './GeneralPreferences';
import { ConnectedApps } from './ConnectedApps';
import { Notifications } from './Notifications';
import { ApiToken } from './ApiToken';
import { menuList } from '../../config';

import { MainPanel } from './StyledComponents';

interface MainPanelWrapperProps {
  profileContact: any;
  isLoading: boolean;
  onSignOut: () => void;
}

export const MainPanelWrapper: React.FC<MainPanelWrapperProps> = ({
  profileContact,
  isLoading,
  onSignOut,
}) => {
  const defaultPath = menuList.find((item) => item.enabled)?.path ?? menuList[0].path;
  const [selectedPath, setSelectedPath] = useState<string>(defaultPath);

  const renderContent = () => {
    switch (selectedPath) {
      case '/personal-information':
        return <PersonalInfo profileContact={profileContact} isLoading={isLoading} />;
      case '/password-security':
        return <PasswordSecurity />;
      case '/appearance-theme':
        return <AppearanceTheme />;
      case '/general-preferences':
        return <GeneralPreferences />;
      case '/connected-apps':
        return <ConnectedApps />;
      case '/notifications':
        return <Notifications />;
      case '/api-token':
        return <ApiToken />;
      default:
        return <PersonalInfo profileContact={profileContact} isLoading={isLoading} />;
    }
  };

  return (
    <MainPanel id="main-panel" data-testid="main-panel-wrapper">
      <ProfileMenu onSignOut={onSignOut} selectedPath={selectedPath} onPathChange={setSelectedPath} />
      {renderContent()}
    </MainPanel>
  );
};
