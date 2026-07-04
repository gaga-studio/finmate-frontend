export type BirthdayWishlistOption = {
  id: string
  title: string
  price: number
  emoji: string
  caption: string
}

export const birthdayWishlistOptions: BirthdayWishlistOption[] = [
  { id: 'coffee', title: '커피대신', price: 4900, emoji: '🥤', caption: '가볍게 축하 마음 보태기' },
  { id: 'vitamin', title: '비타민대신', price: 9900, emoji: '💊', caption: '작은 선물 예산만큼 함께하기' },
  { id: 'handcream', title: '핸드크림대신', price: 17900, emoji: '🧴', caption: '가장 많이 고르는 축하 금액' },
  { id: 'chicken', title: '치킨대신', price: 20900, emoji: '🍗', caption: '식사 선물 대신 실속 있게' },
  { id: 'beef', title: '소고기대신', price: 25900, emoji: '🥩', caption: '조금 더 든든하게 보태기' },
  { id: 'cake', title: '케이크대신', price: 32900, emoji: '🎂', caption: '기념일 예산까지 한 번에' },
]

export const birthdayFundScenario = {
  birthdayId: 'birthday-jiwoo',
  fundId: 'fund-001',
  friendName: '민지',
  daysUntilBirthday: 3,
  wishlistTitle: '여름 셀프케어 위시리스트',
  wishlistSummary: '선물 대신 금액을 보태면 민지가 직접 사고 싶은 위시리스트를 고를 수 있어요.',
  goalAmount: 179000,
  collectedAmount: 125300,
  participants: 8,
  totalFriends: 15,
  featuredOptionId: 'handcream',
}

export function birthdayOptionPriceLabel(price: number) {
  return `${price.toLocaleString('ko-KR')}원`
}

export function getBirthdayWishlistOption(optionId: string) {
  return birthdayWishlistOptions.find((option) => option.id === optionId) ?? birthdayWishlistOptions[0]
}

export function birthdayWishlistOptionRecords() {
  return birthdayWishlistOptions.map((option) => ({
    id: option.id,
    title: option.title,
    amountLabel: birthdayOptionPriceLabel(option.price),
    emoji: option.emoji,
    caption: option.caption,
  }))
}
