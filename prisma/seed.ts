const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  // Create super admin
  const hashedPassword = await bcrypt.hash('123456', 10);
  
  const superAdmin = await prisma.user.upsert({
    where: { email: 'superadmin@example.com' },
    update: {},
    create: {
      email: 'superadmin@example.com',
      name: 'Super Admin',
      password: hashedPassword,
      role: 'SUPER_ADMIN',
    },
  });
  
  // Create clients
  const clients = await Promise.all([
    prisma.client.upsert({
      where: { id: 'clm1234567890' },
      update: {},
      create: {
        id: 'clm1234567890',
        name: 'InfinitoByte',
        websiteUrl: 'https://infinitobyte.com',
        subscriptionStatus: 'ACTIVE',
        subscriptionEndDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
      },
    }),
    prisma.client.upsert({
      where: { id: 'clm2345678901' },
      update: {},
      create: {
        id: 'clm2345678901',
        name: 'Global Retail Co.',
        websiteUrl: 'https://globalretail.example.com',
        subscriptionStatus: 'TRIAL',
        subscriptionEndDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
      },
    }),
    prisma.client.upsert({
      where: { id: 'clm3456789012' },
      update: {},
      create: {
        id: 'clm3456789012',
        name: 'Acme Corp',
        websiteUrl: 'https://acme.example.com',
        subscriptionStatus: 'INACTIVE',
        subscriptionEndDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
      },
    }),
  ]);
  
  // Create client admins
  const clientAdmins = await Promise.all(
    clients.map((client, index) => 
      prisma.user.upsert({
        where: { email: `hola@${client.name.toLowerCase().replace(/\s+/g, '')}.com` },
        update: {},
        create: {
          email: `hola@${client.name.toLowerCase().replace(/\s+/g, '')}.com`,
          name: `${client.name} Admin`,
          password: hashedPassword,
          role: 'CLIENT_ADMIN',
          clientId: client.id,
        },
      })
    )
  );
  
  // Create subscriptions
  const subscriptions = await Promise.all(
    clients.map((client, index) => {
      const plans = ['Basic', 'Standard', 'Premium'];
      const amounts = [99.99, 199.99, 299.99];
      
      return prisma.subscription.create({
        data: {
          clientId: client.id,
          plan: plans[index % plans.length],
          status: client.subscriptionStatus,
          startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
          endDate: client.subscriptionEndDate,
          amount: amounts[index % amounts.length],
          paymentStatus: 'PAID',
        },
      });
    })
  );
  
  // Create invoices
  const invoices = await Promise.all(
    subscriptions.map((subscription, index) => 
      prisma.invoice.create({
        data: {
          subscriptionId: subscription.id,
          invoiceNumber: `INV-${2023000 + index}`,
          amount: subscription.amount,
          status: 'PAID',
          dueDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
          paidDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
        },
      })
    )
  );
  
  // Create support tickets
  const tickets = await Promise.all([
    prisma.supportTicket.create({
      data: {
        subject: 'Unable to access agent dashboard',
        status: 'OPEN',
        priority: 'HIGH',
        clientId: clients[0].id,
        createdById: clientAdmins[0].id,
        messages: {
          create: {
            message: 'Our agents are unable to log in to the dashboard since this morning. Please help!',
            senderId: clientAdmins[0].id,
            senderRole: 'CLIENT_ADMIN',
          },
        },
      },
    }),
    prisma.supportTicket.create({
      data: {
        subject: 'Need to add more agent seats',
        status: 'IN_PROGRESS',
        priority: 'MEDIUM',
        clientId: clients[1].id,
        createdById: clientAdmins[1].id,
        messages: {
          create: [
            {
              message: 'We would like to add 5 more agent seats to our subscription. How do we proceed?',
              senderId: clientAdmins[1].id,
              senderRole: 'CLIENT_ADMIN',
            },
            {
              message: 'Thank you for your request. I can help you with that. I\'ll prepare a quote for the additional seats.',
              senderId: superAdmin.id,
              senderRole: 'SUPER_ADMIN',
            },
          ],
        },
      },
    }),
    prisma.supportTicket.create({
      data: {
        subject: 'Billing discrepancy on latest invoice',
        status: 'OPEN',
        priority: 'MEDIUM',
        clientId: clients[2].id,
        createdById: clientAdmins[2].id,
        messages: {
          create: {
            message: 'We noticed a discrepancy on our latest invoice. We were charged for 10 agents but we only have 8 active agents.',
            senderId: clientAdmins[2].id,
            senderRole: 'CLIENT_ADMIN',
          },
        },
      },
    }),
  ]);
  
  // Create client analytics
  const analytics = await Promise.all(
    clients.map((client, index) => 
      prisma.clientAnalytics.create({
        data: {
          clientId: client.id,
          totalAgents: 5 + index * 3,
          activeAgents: 3 + index * 2,
          totalConversations: 100 + index * 50,
          avgResponseTime: 30 + index * 5,
        },
      })
    )
  );
  
  console.log('Seed data created successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });