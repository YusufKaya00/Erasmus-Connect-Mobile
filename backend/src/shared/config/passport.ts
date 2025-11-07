import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { authService } from '@modules/auth/auth.service';

/**
 * Initialize Passport with Google OAuth Strategy
 */
export const initializePassport = () => {
  // Google OAuth Strategy
  const clientID = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientID || !clientSecret) {
    console.warn('Google OAuth not configured; missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET');
  } else {
    const apiPrefix = process.env.API_PREFIX || '/api/v1';
    const backendUrl = process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 4000}`;

    passport.use(
      new GoogleStrategy(
        {
          clientID,
          clientSecret,
          callbackURL: `${backendUrl}${apiPrefix}/auth/google/callback`,
        },
        async (accessToken, refreshToken, profile, done) => {
          try {
            const result = await authService.googleAuth(profile);
            done(null, result);
          } catch (error: any) {
            done(error, undefined);
          }
        }
      )
    );
  }

  // Serialize user (not needed for stateless JWT auth, but required by passport)
  passport.serializeUser((user: any, done) => {
    done(null, user);
  });

  // Deserialize user
  passport.deserializeUser((user: any, done) => {
    done(null, user);
  });

  console.log('✅ Passport initialized with Google OAuth');
};

export default passport;

