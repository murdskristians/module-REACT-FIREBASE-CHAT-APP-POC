import {
  PuiBox,
  PuiButton,
  PuiIcon,
  PuiSvgIcon,
  PuiTypography,
} from 'piche.ui';
import type { FC } from 'react';

import { Variant } from '../../config';

import {
  AlertWrapper,
  ButtonWrapperStack,
  ModalSubtitle,
  StyledModal,
} from './StyledComponents';

interface LogoutModalProps {
  showModal: boolean;
  setShowModal: (show: boolean) => void;
  onLogout: () => void;
}

export const LogoutModal: FC<LogoutModalProps> = ({
  showModal,
  setShowModal,
  onLogout,
}) => {
  return (
    <StyledModal
      title="Are you sure you want to logout?"
      open={showModal}
      onClose={() => setShowModal(false)}
      subtitle={
        <ModalSubtitle direction="row" gap="8px">
          <PuiTypography variant="body-m-medium" width="100%">
            Click "Logout" to confirm or "Cancel" to stay logged in.
          </PuiTypography>
        </ModalSubtitle>
      }
      titleIcon={
        <PuiBox sx={{ position: 'relative', padding: 0 }}>
          <AlertWrapper>
            <PuiSvgIcon icon={PuiIcon.AlertTriangle} />
          </AlertWrapper>
        </PuiBox>
      }
    >
      <ButtonWrapperStack
        direction="row"
        spacing="16px"
        className="modal-buttons"
        justifyContent="flex-end"
      >
        <PuiButton
          size="small"
          variant={Variant.Text}
          onClick={() => setShowModal(false)}
        >
          Cancel
        </PuiButton>
        <PuiButton
          color="error"
          size="small"
          variant="contained"
          onClick={onLogout}
        >
          Logout
        </PuiButton>
      </ButtonWrapperStack>
    </StyledModal>
  );
};
