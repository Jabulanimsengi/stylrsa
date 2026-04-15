import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const APPLY = process.argv.includes('--apply');

const TARGET_ROLES = ['CLIENT', 'PENDING'] as const;
const TARGET_STATUSES = ['ROLE_REQUIRED', 'CLIENT_PROFILE_REQUIRED'] as const;

let existingTables = new Set<string>();

async function loadExistingTables() {
  const rows = await prisma.$queryRawUnsafe<Array<{ tablename: string }>>(
    `SELECT tablename FROM pg_tables WHERE schemaname = 'public'`,
  );

  existingTables = new Set(rows.map((row) => row.tablename));
}

function hasTable(tableName: string) {
  return existingTables.has(tableName);
}

function logMissingTable(tableName: string) {
  if (hasTable(tableName)) {
    return;
  }

  console.warn(`Skipping optional cleanup work for missing table: public.${tableName}`);
}

async function getUserStats(userId: string) {
  const [
    ownedSalon,
    bookings,
    bookingWhatsAppIntents,
    blogs,
    favorites,
    notifications,
    serviceLikes,
    addresses,
    oauthAccounts,
    trendLikes,
    trendViews,
    salonViews,
    top10Requests,
  ] = await Promise.all([
    prisma.salon.count({ where: { ownerId: userId } }),
    prisma.booking.count({ where: { userId } }),
    hasTable('BookingWhatsAppIntent')
      ? prisma.bookingWhatsAppIntent.count({ where: { userId } })
      : Promise.resolve(0),
    prisma.blog.count({ where: { authorId: userId } }),
    prisma.favorite.count({ where: { userId } }),
    prisma.notification.count({ where: { userId } }),
    prisma.serviceLike.count({ where: { userId } }),
    prisma.userAddress.count({ where: { userId } }),
    prisma.oAuthAccount.count({ where: { userId } }),
    hasTable('TrendLike')
      ? prisma.trendLike.count({ where: { userId } })
      : Promise.resolve(0),
    hasTable('TrendView')
      ? prisma.trendView.count({ where: { userId } })
      : Promise.resolve(0),
    hasTable('SalonView')
      ? prisma.salonView.count({ where: { userId } })
      : Promise.resolve(0),
    hasTable('Top10Request')
      ? prisma.top10Request.count({ where: { userId } })
      : Promise.resolve(0),
  ]);

  return {
    ownedSalon,
    bookings,
    bookingWhatsAppIntents,
    blogs,
    favorites,
    notifications,
    serviceLikes,
    addresses,
    oauthAccounts,
    trendLikes,
    trendViews,
    salonViews,
    top10Requests,
  };
}

async function main() {
  console.log(APPLY
    ? 'Applying owner-only auth cleanup...'
    : 'Dry run: owner-only auth cleanup (pass --apply to write changes)...');

  await loadExistingTables();
  logMissingTable('BookingWhatsAppIntent');
  logMissingTable('TrendLike');
  logMissingTable('TrendView');
  logMissingTable('SalonView');
  logMissingTable('Top10Request');

  const users = await prisma.user.findMany({
    where: {
      OR: [
        { role: { in: [...TARGET_ROLES] } },
        { onboardingStatus: { in: [...TARGET_STATUSES] } },
      ],
      NOT: {
        role: 'ADMIN',
      },
    },
    orderBy: {
      createdAt: 'asc',
    },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      onboardingStatus: true,
      createdAt: true,
    },
  });

  if (users.length === 0) {
    console.log('No legacy non-owner signup records found.');
    return;
  }

  const actions: Array<Record<string, string | number>> = [];
  let deleteCount = 0;
  let normalizeCount = 0;
  let skipCount = 0;

  for (const user of users) {
    const stats = await getUserStats(user.id);
    const displayName = `${user.firstName} ${user.lastName}`.trim();

    const mustKeepUser = stats.ownedSalon > 0 || stats.bookings > 0 || stats.blogs > 0;
    const action = stats.ownedSalon > 0
      ? 'skip-owner'
      : mustKeepUser
        ? 'normalize-legacy-client'
        : 'delete-obsolete-user';

    if (action === 'skip-owner') {
      skipCount += 1;
    } else if (action === 'normalize-legacy-client') {
      normalizeCount += 1;
    } else {
      deleteCount += 1;
    }

    actions.push({
      action,
      email: user.email,
      role: user.role,
      onboardingStatus: user.onboardingStatus,
      ownedSalon: stats.ownedSalon,
      bookings: stats.bookings,
      whatsappIntents: stats.bookingWhatsAppIntents,
      blogs: stats.blogs,
      favorites: stats.favorites,
      notifications: stats.notifications,
      serviceLikes: stats.serviceLikes,
      addresses: stats.addresses,
      oauthAccounts: stats.oauthAccounts,
      trendLikes: stats.trendLikes,
      trendViews: stats.trendViews,
      salonViews: stats.salonViews,
      top10Requests: stats.top10Requests,
    });

    if (!APPLY) {
      continue;
    }

    if (action === 'skip-owner') {
      continue;
    }

    if (action === 'normalize-legacy-client') {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          role: 'CLIENT',
          onboardingStatus: 'COMPLETE',
        },
      });
      console.log(`Normalized legacy client account: ${displayName} <${user.email}>`);
      continue;
    }

    await prisma.$transaction(async (tx) => {
      await tx.favorite.deleteMany({ where: { userId: user.id } });
      await tx.notification.deleteMany({ where: { userId: user.id } });
      await tx.serviceLike.deleteMany({ where: { userId: user.id } });
      await tx.userAddress.deleteMany({ where: { userId: user.id } });
      if (hasTable('TrendLike')) {
        await tx.trendLike.deleteMany({ where: { userId: user.id } });
      }
      await tx.oAuthAccount.deleteMany({ where: { userId: user.id } });

      if (hasTable('BookingWhatsAppIntent')) {
        await tx.bookingWhatsAppIntent.updateMany({
          where: { userId: user.id },
          data: { userId: null },
        });
      }
      if (hasTable('Top10Request')) {
        await tx.top10Request.updateMany({
          where: { userId: user.id },
          data: { userId: null },
        });
      }
      if (hasTable('TrendView')) {
        await tx.trendView.updateMany({
          where: { userId: user.id },
          data: { userId: null },
        });
      }
      if (hasTable('SalonView')) {
        await tx.salonView.updateMany({
          where: { userId: user.id },
          data: { userId: null },
        });
      }

      await tx.user.delete({ where: { id: user.id } });
    });

    console.log(`Deleted obsolete signup record: ${displayName} <${user.email}>`);
  }

  console.table(actions);
  console.log(`Summary: ${deleteCount} delete, ${normalizeCount} normalize, ${skipCount} skip.`);
  console.log(APPLY
    ? 'Owner-only auth cleanup complete.'
    : 'Dry run complete. Re-run with --apply to write changes.');
}

main()
  .catch((error) => {
    console.error('Owner-only auth cleanup failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
