// prisma/seed.ts
// Chạy: npm run db:seed
import "dotenv/config"
import { PrismaClient, UserRole, ProductStatus, QuizType, GuideMediaType, SourceType, RecommendationType } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import bcrypt from 'bcrypt'

const connectionString = `${process.env.DATABASE_URL}`
const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })
async function main() {
  console.log('🌱 Bắt đầu seed data cho Ergonia...')

  // ----------------------------------------------------------
  // 1. ADMIN USER
  // ----------------------------------------------------------
  const admin = await prisma.user.upsert({
    where: { email: 'admin@ergonia.vn' },
    update: {},
    create: {
      fullName: 'Admin Ergonia',
      email: 'admin@ergonia.vn',
      passwordHash: await bcrypt.hash('Admin@123', 10),
      role: UserRole.admin,
    },
  })
  console.log('✅ Admin user:', admin.email)

  // ----------------------------------------------------------
  // 2. MASCOT
  // ----------------------------------------------------------
  const mascot = await prisma.mascotCharacter.upsert({
    where: { id: BigInt(1) },
    update: {},
    create: {
      name: 'Ergo',
      avatarUrl: '/mascot/ergo-default.svg',
      description: 'Người bạn đồng hành công thái học của Ergonia',
    },
  })

  const dialogues = await prisma.mascotDialogue.createMany({
    skipDuplicates: true,
    data: [
      { mascotId: mascot.id, contextKey: 'welcome',       emotionState: 'happy',     dialogueText: 'Xin chào! Mình là Ergo 👋 Hãy để mình giúp bạn tìm ra tư thế ngồi hoàn hảo nhé!' },
      { mascotId: mascot.id, contextKey: 'quiz_q1',       emotionState: 'thinking',  dialogueText: 'Bạn đang ngồi theo thói quen nhé. Bây giờ hãy thử luồn bàn tay vào khoảng trống giữa thắt lưng và ghế xem sao!' },
      { mascotId: mascot.id, contextKey: 'result_red',    emotionState: 'surprised', dialogueText: 'Ồ! Cột sống của bạn đang gánh 100% trọng lượng cơ thể rồi đó. Mình giúp bạn khắc phục ngay nhé!' },
      { mascotId: mascot.id, contextKey: 'result_yellow', emotionState: 'thinking',  dialogueText: 'Ghế của bạn tạm ổn nhưng ngồi lâu vẫn sẽ mỏi. Để mình gợi ý giải pháp trợ lực sâu hơn nhé!' },
      { mascotId: mascot.id, contextKey: 'result_green',  emotionState: 'happy',     dialogueText: 'Tư thế hiện tại của bạn khá tốt! Nhưng sau 30-45 phút cơ sẽ mỏi và bạn sẽ bắt đầu gù lưng đó 😅' },
      { mascotId: mascot.id, contextKey: 'upsell_neck',   emotionState: 'thinking',  dialogueText: 'Cổ bạn có bị mỏi khi nhìn màn hình không? Mình có một gợi ý cho bạn đây!' },
      { mascotId: mascot.id, contextKey: 'upsell_hips',   emotionState: 'thinking',  dialogueText: 'Mông bạn có bị ê buốt sau vài tiếng ngồi không? Đệm ngồi của Ergonia sẽ giải quyết được điều này!' },
      { mascotId: mascot.id, contextKey: 'pain_map',      emotionState: 'neutral',   dialogueText: 'Bạn đang đau hoặc khó chịu ở vùng nào? Bấm vào vị trí tương ứng trên cơ thể nhé!' },
    ],
  })
  console.log('✅ Mascot & dialogues:', mascot.name)

  // ----------------------------------------------------------
  // 3. CATEGORIES
  // ----------------------------------------------------------
  const catBack = await prisma.category.upsert({
    where: { slug: 'goi-dem-lung' },
    update: {},
    create: { name: 'Gối đệm lưng', slug: 'goi-dem-lung', sortOrder: 1 },
  })
  const catNeck = await prisma.category.upsert({
    where: { slug: 'goi-dem-co' },
    update: {},
    create: { name: 'Gối đệm cổ', slug: 'goi-dem-co', sortOrder: 2 },
  })
  const catSeat = await prisma.category.upsert({
    where: { slug: 'dem-ngoi' },
    update: {},
    create: { name: 'Đệm ngồi', slug: 'dem-ngoi', sortOrder: 3 },
  })
  console.log('✅ Categories: lưng, cổ, đệm ngồi')

  // ----------------------------------------------------------
  // 4. PRODUCTS
  // ----------------------------------------------------------
  const productBack = await prisma.product.upsert({
    where: { sku: 'ERG-BACK-001' },
    update: {},
    create: {
      sku: 'ERG-BACK-001',
      name: 'Gối tựa lưng Ergonia Pro',
      slug: 'goi-tua-lung-ergonia-pro',
      categoryId: catBack.id,
      shortDescription: 'Gối memory foam hỗ trợ cột sống thắt lưng, thiết kế theo đường cong sinh học',
      basePrice: 320000,
      salePrice: 279000,
      stockQuantity: 150,
      status: ProductStatus.active,
      attributes: {
        create: [
          { attributeName: 'Chất liệu', attributeValue: 'Memory foam cao cấp' },
          { attributeName: 'Kích thước', attributeValue: '38 x 28 x 12 cm' },
          { attributeName: 'Màu sắc', attributeValue: 'Navy, Xanh rêu, Hồng nhạt' },
          { attributeName: 'Bảo hành', attributeValue: '12 tháng' },
        ],
      },
    },
  })

  const productNeck = await prisma.product.upsert({
    where: { sku: 'ERG-NECK-001' },
    update: {},
    create: {
      sku: 'ERG-NECK-001',
      name: 'Gối cổ Ergonia Flex',
      slug: 'goi-co-ergonia-flex',
      categoryId: catNeck.id,
      shortDescription: 'Gối cổ hình chữ U hỗ trợ cột sống cổ, phù hợp dùng tại bàn làm việc',
      basePrice: 220000,
      salePrice: 189000,
      stockQuantity: 100,
      status: ProductStatus.active,
    },
  })

  const productSeat = await prisma.product.upsert({
    where: { sku: 'ERG-SEAT-001' },
    update: {},
    create: {
      sku: 'ERG-SEAT-001',
      name: 'Đệm ngồi Ergonia Comfort',
      slug: 'dem-ngoi-ergonia-comfort',
      categoryId: catSeat.id,
      shortDescription: 'Đệm ngồi gel + memory foam giảm áp lực xương cụt, thiết kế thoáng khí',
      basePrice: 380000,
      salePrice: 339000,
      stockQuantity: 80,
      status: ProductStatus.active,
    },
  })
  console.log('✅ Products: lưng, cổ, đệm ngồi')

  // ----------------------------------------------------------
  // 5. CHAIR TYPES & BODY PARTS
  // ----------------------------------------------------------
  await prisma.chairType.createMany({
    skipDuplicates: true,
    data: [
      { code: 'mesh',    name: 'Ghế lưới văn phòng' },
      { code: 'gaming',  name: 'Ghế gaming' },
      { code: 'leather', name: 'Ghế da' },
      { code: 'wooden',  name: 'Ghế gỗ / ghế nhựa' },
    ],
  })

  await prisma.bodyPart.createMany({
    skipDuplicates: true,
    data: [
      { code: 'back', name: 'Lưng',  iconPositionX: 340, iconPositionY: 200 },
      { code: 'neck', name: 'Cổ',    iconPositionX: 340, iconPositionY: 100 },
      { code: 'hips', name: 'Mông',  iconPositionX: 340, iconPositionY: 310 },
    ],
  })
  console.log('✅ Chair types & body parts')

  // ----------------------------------------------------------
  // 6. QUIZ (Hand-Gap Test)
  // ----------------------------------------------------------
  const quiz = await prisma.quiz.create({
    data: {
      name: 'Hand-Gap Test',
      description: 'Bài test 3 giây đánh giá mức độ hỗ trợ của ghế hiện tại',
      quizType: QuizType.main,
      questions: {
        create: [
          {
            questionText: 'Hãy ngồi theo thói quen và thử luồn bàn tay vào khoảng trống giữa thắt lưng và lưng ghế. Kết quả như thế nào?',
            sortOrder: 1,
            options: {
              create: [
                {
                  optionLabel: '🔴',
                  optionText: 'Luồn cả bàn tay vào thoải mái',
                  resultText: 'Lưng bị bỏ rơi! Cột sống đang gánh 100% trọng lượng cơ thể, nguy cơ thoát vị đĩa đệm cao nếu duy trì lâu dài.',
                  recommendedAction: 'Đặt gối Ergonia ngay để lấp đầy khoảng trống, hỗ trợ đường cong thắt lưng tự nhiên.',
                  sortOrder: 1,
                },
                {
                  optionLabel: '🟡',
                  optionText: 'Hơi khít, chỉ luồn được vài ngón tay',
                  resultText: 'Ghế hỗ trợ chưa đủ. Tạm thời ổn nhưng ngồi trên 2 tiếng sẽ bắt đầu mỏi lưng dưới.',
                  recommendedAction: 'Dùng gối Ergonia để trợ lực sâu hơn, tối ưu tư thế cho ca làm việc dài.',
                  sortOrder: 2,
                },
                {
                  optionLabel: '🟢',
                  optionText: 'Khít hoàn toàn, lưng chạm sát ghế',
                  resultText: 'Tư thế hiện tại tốt! Tuy nhiên sau 30-45 phút làm việc, cơ sẽ mỏi và bạn sẽ tự động gù lưng.',
                  recommendedAction: 'Gối Ergonia đóng vai trò điểm tựa chủ động, giữ dáng ngồi đúng suốt 8 tiếng.',
                  sortOrder: 3,
                },
              ],
            },
          },
        ],
      },
    },
  })
  console.log('✅ Quiz: Hand-Gap Test')

  // ----------------------------------------------------------
  // 7. SHIPPING PROVIDERS
  // ----------------------------------------------------------
  await prisma.shippingProvider.createMany({
    skipDuplicates: true,
    data: [
      { name: 'Giao Hàng Nhanh', code: 'GHN' },
      { name: 'Giao Hàng Tiết Kiệm', code: 'GHTK' },
      { name: 'J&T Express', code: 'JT' },
    ],
  })
  console.log('✅ Shipping providers')

  console.log('\n🎉 Seed data hoàn thành! Có thể truy cập Prisma Studio:')
  console.log('   npm run db:studio')
}

main()
  .catch((e) => {
    console.error('❌ Lỗi seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })