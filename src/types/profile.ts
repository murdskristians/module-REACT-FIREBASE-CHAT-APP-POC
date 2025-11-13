export type ProfileAdditionalEmail = {
  id: string;
  label: string;
  email: string;
};

export type ProfilePhoneNumber = {
  id: string;
  label: string;
  phone: string;
};

export type ProfileAddressDetails = {
  country?: string | null;
  street?: string | null;
  postalCode?: string | null;
  city?: string | null;
};

export type ProfileSocialLink = {
  id: string;
  label: string;
  url: string;
};

export type ProfileContact = {
  id: string;
  name: string;
  email?: string | null;
  avatarUrl?: string | null;
  avatarColor?: string | null;
  statusMessage?: string | null;
  company?: string | null;
  department?: { name?: string | null } | null;
  position?: { jobTitle?: string | null } | null;
  additionalEmails: ProfileAdditionalEmail[];
  phoneNumbers: ProfilePhoneNumber[];
  address?: ProfileAddressDetails | null;
  socialLinks: ProfileSocialLink[];
  coverImageUrl?: string | null;
};

