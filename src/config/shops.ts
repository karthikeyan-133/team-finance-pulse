
export interface Shop {
  id: string;
  name: string;
  location?: string;
  isActive: boolean;
}

export const SHOPS: Shop[] = [
  {
    id: 'shop-1',
    name: 'Zyra',
    location: 'Main Branch',
    isActive: true
  },
  {
    id: 'shop-2',
    name: 'Zyra Express',
    location: 'Express Branch',
    isActive: true
  },
  {
    id: 'shop-3',
    name: 'Zyra Premium',
    location: 'Premium Branch',
    isActive: true
  }
];

export const getActiveShops = (): Shop[] => {
  return SHOPS.filter(shop => shop.isActive);
};

export const getShopById = (id: string): Shop | undefined => {
  return SHOPS.find(shop => shop.id === id);
};
