import { ProfileMenu } from '../../components/layout/ProfileMenu';

import { MainPanel } from './StyledComponents';

interface MainPanelWrapperProps {
  children: React.ReactNode;
  onSignOut: () => void;
}

export const MainPanelWrapper: React.FC<MainPanelWrapperProps> = ({
  children,
  onSignOut,
}) => {
  return (
    <MainPanel id="main-panel" data-testid="main-panel-wrapper">
      <ProfileMenu onSignOut={onSignOut} />
      {children}
    </MainPanel>
  );
};
