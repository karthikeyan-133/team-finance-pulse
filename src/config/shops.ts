
export interface Shop {
  id: string;
  name: string;
  location?: string;
  isActive: boolean;
}

export const SHOPS: Shop[] = [
  {
    id: 'shop-1',
    name: 'Al Ameen',
    isActive: true
  },
  {
    id: 'shop-2',
    name: 'Al Cafe',
    isActive: true
  },
  {
    id: 'shop-3',
    name: 'AMR',
    isActive: true
  },
  {
    id: 'shop-4',
    name: 'Fish Shop',
    isActive: true
  },
  {
    id: 'shop-5',
    name: 'Food Dude',
    isActive: true
  },
  {
    id: 'shop-6',
    name: 'Haritham Vegetables',
    isActive: true
  },
  {
    id: 'shop-7',
    name: 'KL 70',
    isActive: true
  },
  {
    id: 'shop-8',
    name: 'Malabar Green',
    isActive: true
  },
  {
    id: 'shop-9',
    name: 'Metro Bakery',
    isActive: true
  },
  {
    id: 'shop-10',
    name: 'Milko',
    isActive: true
  },
  {
    id: 'shop-11',
    name: 'Moon Star',
    isActive: true
  },
  {
    id: 'shop-12',
    name: 'Muji Biriyani',
    isActive: true
  },
  {
    id: 'shop-13',
    name: 'Nazar',
    isActive: true
  },
  {
    id: 'shop-14',
    name: 'Thejus Bakery',
    isActive: true
  },
  {
    id: 'shop-15',
    name: 'Zyra',
    isActive: true
  },
  
  
];

export const getActiveShops = (): Shop[] => {
  return SHOPS.filter(shop => shop.isActive);
};

export const getShopById = (id: string): Shop | undefined => {
  return SHOPS.find(shop => shop.id === id);
};
