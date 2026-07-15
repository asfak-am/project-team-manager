export type UpdateProfilePayload = {
  name: string;
  email: string;
};

export type UpdatePasswordPayload = {
  current_password: string;
  password: string;
  password_confirmation: string;
};