import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly userService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKeyProvider: (request, rawJwtToken, done) => {
        done(
          null,
          '60944ce3318972da1a4a59a265677acafa7dc82a6755b806409c23c24876de3b',
        );
      },
    });
  }
  async validate(payload: { sub: string; userId: string }) {
    const user = await this.userService.findById(payload.userId);
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}
