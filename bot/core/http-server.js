const express = require('express');
const cors = require('cors');

function requireEnv(name) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env: ${name}`);
  return v;
}

function buildApp({ admin, db }) {
  const app = express();

  const allowedOrigins = (process.env.CORS_ORIGINS || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  app.use(
    cors({
      origin(origin, cb) {
        // Allow non-browser clients and same-origin.
        if (!origin) return cb(null, true);
        if (allowedOrigins.length === 0) return cb(null, true);
        return cb(null, allowedOrigins.includes(origin));
      },
      credentials: true,
    })
  );

  // Health check
  app.get('/', (req, res) =>
    res.status(200).send('TuanTuan Supreme Core is ONLINE! (>=^.^=)')
  );
  app.get('/api/health', (req, res) => res.json({ ok: true }));

  // Stripe webhook must use raw body.
  app.post(
    '/api/stripe/webhook',
    express.raw({ type: 'application/json' }),
    async (req, res) => {
      let stripe;
      try {
        const Stripe = require('stripe');
        stripe = new Stripe(requireEnv('STRIPE_SECRET_KEY'), {
          apiVersion: '2024-06-20',
        });
      } catch (e) {
        return res.status(501).send('Stripe not configured');
      }

      const sig = req.headers['stripe-signature'];
      const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
      if (!sig || !webhookSecret) return res.status(400).send('Missing signature');

      let event;
      try {
        event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
      } catch (err) {
        return res.status(400).send(`Webhook Error: ${err.message}`);
      }

      try {
        // We store guildId in metadata.
        if (event.type === 'checkout.session.completed') {
          const session = event.data.object;
          const guildId = session.metadata?.guildId;
          const plan = session.metadata?.plan;
          if (guildId) {
            let premiumExpire = 'LIFETIME';
            if (plan === 'monthly' && session.subscription) {
              const sub = await stripe.subscriptions.retrieve(session.subscription);
              premiumExpire = new Date(sub.current_period_end * 1000);
            }

            await db
              .collection('guilds')
              .doc(guildId)
              .set(
                {
                  isPremium: true,
                  premiumSince: new Date(),
                  premiumExpire,
                  stripe: {
                    customerId: session.customer || null,
                    subscriptionId: session.subscription || null,
                    lastCheckoutSessionId: session.id,
                    plan: plan || null,
                  },
                },
                { merge: true }
              );
          }
        }

        if (
          event.type === 'customer.subscription.updated' ||
          event.type === 'customer.subscription.deleted'
        ) {
          const sub = event.data.object;
          const customerId = sub.customer;

          // Find guild(s) by stripe.customerId.
          const snap = await db
            .collection('guilds')
            .where('stripe.customerId', '==', customerId)
            .get();

          const active = sub.status === 'active' || sub.status === 'trialing';
          const premiumExpire = new Date((sub.current_period_end || 0) * 1000);

          const updates = [];
          snap.forEach((doc) => {
            updates.push(
              db
                .collection('guilds')
                .doc(doc.id)
                .set(
                  {
                    isPremium: active,
                    premiumExpire: active ? premiumExpire : null,
                    stripe: {
                      subscriptionId: sub.id,
                      status: sub.status,
                    },
                  },
                  { merge: true }
                )
            );
          });

          await Promise.all(updates);
        }

        return res.json({ received: true });
      } catch (e) {
        console.error('Stripe webhook handler error:', e);
        return res.status(500).send('Internal error');
      }
    }
  );

  // JSON endpoints after webhook route.
  app.use(express.json({ limit: '2mb' }));

  async function requireFirebaseAuth(req, res, next) {
    const authz = req.headers.authorization || '';
    const token = authz.startsWith('Bearer ') ? authz.slice('Bearer '.length) : null;
    if (!token) return res.status(401).json({ error: 'Missing auth token' });

    try {
      const decoded = await admin.auth().verifyIdToken(token);
      req.user = decoded;
      return next();
    } catch (e) {
      return res.status(401).json({ error: 'Invalid auth token' });
    }
  }

  // Create Stripe checkout session to upgrade a guild.
  app.post('/api/stripe/create-checkout-session', requireFirebaseAuth, async (req, res) => {
    let stripe;
    try {
      const Stripe = require('stripe');
      stripe = new Stripe(requireEnv('STRIPE_SECRET_KEY'), {
        apiVersion: '2024-06-20',
      });
    } catch (e) {
      return res.status(501).json({ error: 'Stripe not configured' });
    }

    const { guildId, plan } = req.body || {};
    if (!guildId) return res.status(400).json({ error: 'guildId required' });

    const dashboardUrl =
      process.env.DASHBOARD_URL ||
      process.env.APP_BASE_URL ||
      'http://localhost:5173';

    try {
      let mode = 'payment';
      let line_items = [];

      if (plan === 'monthly') {
        mode = 'subscription';
        line_items = [{ price: requireEnv('STRIPE_PRICE_ID_MONTHLY'), quantity: 1 }];
      } else if (plan === 'lifetime') {
        mode = 'payment';
        line_items = [{ price: requireEnv('STRIPE_PRICE_ID_LIFETIME'), quantity: 1 }];
      } else {
        return res.status(400).json({ error: 'plan must be monthly or lifetime' });
      }

      const session = await stripe.checkout.sessions.create({
        mode,
        line_items,
        success_url: `${dashboardUrl}/?success=1&guildId=${encodeURIComponent(guildId)}`,
        cancel_url: `${dashboardUrl}/?canceled=1&guildId=${encodeURIComponent(guildId)}`,
        metadata: {
          guildId,
          plan,
          firebaseUid: req.user.uid || '',
        },
      });

      return res.json({ url: session.url });
    } catch (e) {
      console.error('create-checkout-session error:', e);
      return res.status(500).json({ error: 'Failed to create checkout session' });
    }
  });

  // Redeem an existing premium key from the web dashboard.
  app.post('/api/premium/redeem', requireFirebaseAuth, async (req, res) => {
    const { guildId, key } = req.body || {};
    if (!guildId || !key) return res.status(400).json({ error: 'guildId and key required' });

    const keyText = String(key).trim().toUpperCase();
    try {
      const keyRef = db.collection('premium_keys').doc(keyText);
      const keyDoc = await keyRef.get();
      if (!keyDoc.exists || keyDoc.data().used) {
        return res.status(400).json({ error: 'Invalid or used key' });
      }

      const durationDays = keyDoc.data().durationDays;
      let expireDate = new Date();
      if (durationDays === 9999) {
        expireDate = 'LIFETIME';
      } else {
        expireDate.setDate(expireDate.getDate() + Number(durationDays || 0));
      }

      await db
        .collection('guilds')
        .doc(guildId)
        .set(
          {
            isPremium: true,
            premiumExpire: expireDate,
            premiumSince: new Date(),
          },
          { merge: true }
        );

      await keyRef.set(
        {
          used: true,
          usedByFirebaseUid: req.user.uid || null,
          usedIn: guildId,
          usedAt: new Date(),
        },
        { merge: true }
      );

      return res.json({ ok: true, premiumExpire: expireDate });
    } catch (e) {
      console.error('redeem error:', e);
      return res.status(500).json({ error: 'Redeem failed' });
    }
  });

  return app;
}

function startHttpServer({ admin, db }) {
  const port = Number(process.env.PORT || 8080);
  const app = buildApp({ admin, db });
  const server = app.listen(port, () => console.log(`HTTP ready on port ${port}`));
  return { app, server };
}

module.exports = { startHttpServer };

