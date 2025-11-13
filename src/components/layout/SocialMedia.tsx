import { Colors, PuiBox, PuiIcon, PuiLink, PuiSvgIcon, PuiTypography } from 'piche.ui';

import { ProfileSocialLink } from '../../types/profile';

import { NoContent } from './NoContent';
import { IconSize, StrokeWidth } from '../../config';

import {
  ContactInformationTitle,
  SectionContainer,
  SectionTitle,
  SocialMediaItemWrapper,
  SocialMediaList,
} from './StyledComponents';

interface SocialMediaProps {
  links: ProfileSocialLink[];
}

export const SocialMedia = ({ links }: SocialMediaProps) => {
  const hasLinks = links.length > 0;

  return (
    <SectionContainer sx={{ padding: '24px' }}>
      <ContactInformationTitle>
        <SectionTitle variant="body-m-medium" sx={{ marginBottom: '16px' }}>
          <PuiSvgIcon
            icon={PuiIcon.Share7}
            width={IconSize.Medium}
            height={IconSize.Medium}
            strokeWidth={StrokeWidth.Thin}
          />
          My Socials
        </SectionTitle>
      </ContactInformationTitle>
      {hasLinks ? (
        <SocialMediaList>
          {links.map((item, index) => (
            <SocialMediaItemWrapper
              key={item.id}
              className={(index + 1) % 5 === 0 ? 'last-item' : undefined}
            >
              <PuiTypography variant="body-sm-medium">
                <PuiBox
                  sx={{
                    display: 'inline-flex',
                    width: 24,
                    height: 24,
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '50%',
                    backgroundColor: Colors.blue[25],
                  }}
                >
                  <PuiSvgIcon icon={PuiIcon.Link2} width={16} height={16} />
                </PuiBox>
                {item.label}
              </PuiTypography>
              <PuiLink
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                underline="hover"
                sx={{ fontSize: '12px', color: 'grey.500' }}
              >
                {item.url}
              </PuiLink>
            </SocialMediaItemWrapper>
          ))}
        </SocialMediaList>
      ) : (
        <NoContent
          title="No social links added yet"
          text="Add your social media profiles to make it easier for others to connect with you."
          align="center"
        />
      )}
    </SectionContainer>
  );
};
