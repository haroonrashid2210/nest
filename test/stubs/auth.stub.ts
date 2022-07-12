import * as AuthDTO from 'src/auth/auth.dto';

export const SignupStub = (): AuthDTO.Signup => {
  return {
    name: 'Haroon Rashid',
    cnic: '3740500000000',
    password: 'Password@123',
  };
};
