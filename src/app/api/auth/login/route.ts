import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { findUserByEmail, incrementFailedAttempts, resetFailedAttempts } from '@/lib/repos/auth';
import { signAccessToken, signRefreshToken, setAuthCookies, roleRedirect } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const { email, password, rememberMe = false } = await req.json();

  if (!email || !password) {
    return NextResponse.json({ error: 'Email et mot de passe requis' }, { status: 400 });
  }

  const user = await findUserByEmail(email.toLowerCase().trim());

  if (!user || !user.password_hash) {
    return NextResponse.json({ error: 'Email ou mot de passe incorrect' }, { status: 401 });
  }

  if (user.status === 'disabled') {
    return NextResponse.json({ error: 'Compte désactivé' }, { status: 423 });
  }

  if (user.locked_until && new Date(user.locked_until) > new Date()) {
    const until = new Date(user.locked_until).toLocaleTimeString('fr-FR');
    return NextResponse.json(
      { error: `Compte verrouillé jusqu'à ${until}` },
      { status: 423 }
    );
  }

  const valid = await bcrypt.compare(password, user.password_hash);

  if (!valid) {
    await incrementFailedAttempts(user.id);
    return NextResponse.json({ error: 'Email ou mot de passe incorrect' }, { status: 401 });
  }

  await resetFailedAttempts(user.id);

  const [accessToken, refreshToken] = await Promise.all([
    signAccessToken({
      userId:     user.id,
      tenantId:   user.tenant_id,
      orgId:      user.org_id,
      facilityId: user.facility_id,
      role:       user.role,
      email:      user.email,
      name:       user.name,
    }),
    signRefreshToken(user.id, rememberMe),
  ]);

  const res = NextResponse.json({
    user: {
      id:         user.id,
      name:       user.name,
      email:      user.email,
      role:       user.role,
      facilityId: user.facility_id,
      orgId:      user.org_id,
      tenantId:   user.tenant_id,
    },
    redirectTo: roleRedirect(user.role),
  });

  setAuthCookies(res, accessToken, refreshToken, rememberMe);
  return res;
}
