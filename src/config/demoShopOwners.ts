
// Demo shop owner accounts for testing
// You can modify these credentials as needed

export interface DemoShopOwner {
  shopId: string;
  accessCode: string;
  shopName: string;
}

export const DEMO_SHOP_OWNERS: DemoShopOwner[] = [
  {
    shopId: 'pizza-corner',
    accessCode: 'PC2024',
    shopName: 'Pizza Corner'
  },
  {
    shopId: 'burger-house',
    accessCode: 'BH2024', 
    shopName: 'Burger House'
  },
  {
    shopId: 'coffee-beans',
    accessCode: 'CB2024',
    shopName: 'Coffee Beans Cafe'
  },
  {
    shopId: 'spice-kitchen',
    accessCode: 'SK2024',
    shopName: 'Spice Kitchen'
  }
];

// Helper function to validate shop owner credentials
export const validateShopOwnerCredentials = (shopId: string, accessCode: string): DemoShopOwner | null => {
  return DEMO_SHOP_OWNERS.find(
    owner => owner.shopId === shopId && owner.accessCode === accessCode
  ) || null;
};
