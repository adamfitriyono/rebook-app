const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const sampleBooks = [
  { title: 'Pemrograman JavaScript Modern', author: 'Kyle Simpson', category: 'Teknologi', price: 150000, condition: 'good' },
  { title: 'Clean Code', author: 'Robert C. Martin', category: 'Teknologi', price: 200000, condition: 'like_new', discountPercent: 60 },
  { title: 'Laskar Pelangi', author: 'Andrea Hirata', category: 'Fiksi', price: 45000, condition: 'good', discountPercent: 35 },
  { title: 'Bumi Manusia', author: 'Pramoedya Ananta Toer', category: 'Fiksi', price: 85000, condition: 'fair' },
  { title: 'Fisika Dasar Jilid 1', author: 'Halliday', category: 'Pendidikan', price: 120000, condition: 'good' },
  { title: 'Kimia Dasar', author: 'Petrucci', category: 'Pendidikan', price: 95000, condition: 'good' },
  { title: 'Rich Dad Poor Dad', author: 'Robert Kiyosaki', category: 'Bisnis', price: 75000, condition: 'like_new' },
  { title: 'Atomic Habits', author: 'James Clear', category: 'Bisnis', price: 110000, condition: 'good' },
  { title: 'Origami untuk Pemula', author: 'Kunihiko Kasahara', category: 'Hobi', price: 35000, condition: 'good' },
  { title: 'Belajar Fotografi', author: 'Scott Kelby', category: 'Hobi', price: 130000, condition: 'like_new' },
  { title: 'Algoritma dan Struktur Data', author: 'Thomas Cormen', category: 'Teknologi', price: 180000, condition: 'good' },
  { title: 'Harry Potter dan Batu Bertuah', author: 'J.K. Rowling', category: 'Fiksi', price: 65000, condition: 'good' },
  { title: 'Matematika Diskrit', author: 'Kenneth Rosen', category: 'Pendidikan', price: 140000, condition: 'fair' },
  { title: 'Start With Why', author: 'Simon Sinek', category: 'Bisnis', price: 90000, condition: 'good' },
  { title: 'The Art of War', author: 'Sun Tzu', category: 'Bisnis', price: 40000, condition: 'like_new' },
];

const reviewComments = [
  'Buku sesuai deskripsi, kondisi masih bagus.',
  'Pengiriman cepat, packing aman. Recommended!',
  'Harga worth it untuk buku bekas segini.',
  'Ada sedikit coretan di pinggir halaman, tapi masih layak baca.',
  'Penjual responsif dan ramah. Puas belanja di sini.',
  'Buku masih rapi, tidak ada halaman yang sobek.',
  'Sangat membantu untuk belajar, kondisi sesuai foto.',
  'Packing rapi dengan bubble wrap, buku sampai mulus.',
];

const DEFAULT_CATEGORIES = ['Teknologi', 'Fiksi', 'Pendidikan', 'Bisnis', 'Hobi'];

const reviewAuthors = [
  { email: 'reviewer1@test.com', fullName: 'Andi Pratama' },
  { email: 'reviewer2@test.com', fullName: 'Siti Rahayu' },
  { email: 'reviewer3@test.com', fullName: 'Budi Santoso' },
  { email: 'reviewer4@test.com', fullName: 'Dewi Lestari' },
  { email: 'reviewer5@test.com', fullName: 'Rizky Maulana' },
];

async function main() {
  const hashedPassword = await bcrypt.hash('Test123!', 10);

  await prisma.review.deleteMany();
  await prisma.message.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.product.deleteMany();
  await prisma.user.deleteMany();
  await prisma.category.deleteMany();

  for (const name of DEFAULT_CATEGORIES) {
    await prisma.category.create({ data: { name } });
  }

  const buyer = await prisma.user.create({
    data: {
      email: 'buyer@test.com',
      password: hashedPassword,
      fullName: 'Test Buyer',
      role: 'buyer',
      phoneNumber: '081111111111',
    },
  });

  const seller = await prisma.user.create({
    data: {
      email: 'seller@test.com',
      password: hashedPassword,
      fullName: 'Toko Buku Semarang',
      role: 'seller',
      phoneNumber: '082222222222',
      city: 'Semarang',
    },
  });

  const seller2 = await prisma.user.create({
    data: {
      email: 'seller2@test.com',
      password: hashedPassword,
      fullName: 'Literasi Jogja',
      role: 'seller',
      phoneNumber: '083333333333',
      city: 'Yogyakarta',
    },
  });

  await prisma.user.create({
    data: {
      email: 'admin@test.com',
      password: hashedPassword,
      fullName: 'Admin ReBook',
      role: 'admin',
    },
  });

  const reviewers = [];
  for (const r of reviewAuthors) {
    const user = await prisma.user.create({
      data: {
        email: r.email,
        password: hashedPassword,
        fullName: r.fullName,
        role: 'buyer',
      },
    });
    reviewers.push(user);
  }

  const sellers = [seller, seller2];
  const products = [];

  for (let i = 0; i < sampleBooks.length; i++) {
    const book = sampleBooks[i];
    const sellerUser = sellers[i % sellers.length];

    const product = await prisma.product.create({
      data: {
        title: book.title,
        author: book.author,
        description: `Buku bekas berkualitas: ${book.title} oleh ${book.author}. Kondisi ${book.condition}.`,
        condition: book.condition,
        price: book.price,
        category: book.category,
        discountPercent: book.discountPercent || null,
        sellerId: sellerUser.id,
        images: [`https://picsum.photos/seed/rebook${i + 1}/400/500`],
        stock: Math.floor(Math.random() * 5) + 1,
        sold: Math.floor(Math.random() * 50) + 1,
      },
    });

    products.push({ product, sellerUser });

    const reviewCount = 2 + (i % 3);
    for (let j = 0; j < reviewCount; j++) {
      const reviewer = reviewers[(i + j) % reviewers.length];
      await prisma.review.create({
        data: {
          productId: product.id,
          authorId: reviewer.id,
          targetSellerId: sellerUser.id,
          rating: 3 + ((i + j) % 3),
          comment: reviewComments[(i + j) % reviewComments.length],
        },
      });
    }
  }

  await prisma.cart.create({
    data: { userId: buyer.id },
  });

  console.log('Database seeded successfully');
  console.log(`Created ${products.length} products with reviews on every product`);
  console.log('Test accounts (password: Test123!):');
  console.log('  buyer@test.com, seller@test.com, seller2@test.com, admin@test.com');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
