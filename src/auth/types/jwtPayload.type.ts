export const enum Token {
  ACCESS = 'access',
  REFRESH = 'refresh',
}

export type JwtPayload = {
  email: string;
  name: string;
  sub: string;
  type: Token;
  iat: number;
  exp: number;
  // loại token
  // role nếu có
};

export type JwtPayloadWithRt = JwtPayload & { refreshToken: string };
