
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
    isActive: true
  },
  {
    id: 'shop-2',
    name: 'KL 70',
    isActive: true
  },
  {
    id: 'shop-3',
    name: 'AL Cafe',
    isActive: true
  },
  {
    id: 'shop-4',
    name: 'Metro Plaza',
    isActive: true
  }
];

export const getActiveShops = (): Shop[] => {
  return SHOPS.filter(shop => shop.isActive);
};

export const getShopById = (id: string): Shop | undefined => {
  return SHOPS.find(shop => shop.id === id);
};
